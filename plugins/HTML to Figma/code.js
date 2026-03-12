/**
 * HTML to Figma — Plugin Code
 *
 * Receives raw DOM JSON (extracted by CLI tool) and creates
 * pixel-perfect Figma nodes with exact computed styles.
 *
 * Handles: frames (auto layout), text, SVG, images, DS component instances.
 */

figma.showUI(__html__, { width: 480, height: 560, themeColors: true });

// ── Variable & Text Style Caches (token binding) ──
var varCache = {};
var textStyleCache = {};
var effectStyleCache = {};
var _tokenCachesLoaded = false;

async function loadTokenCaches() {
  if (_tokenCachesLoaded) return;
  varCache = {};
  textStyleCache = {};

  // Load all pages (required for document access)
  try { await figma.loadAllPagesAsync(); } catch (e) {}

  // Load color + float variables
  var allColor = [];
  var allFloat = [];
  try { allColor = await figma.variables.getLocalVariablesAsync("COLOR"); } catch (e) {}
  try { allFloat = await figma.variables.getLocalVariablesAsync("FLOAT"); } catch (e) {}

  // Build collection name lookup
  var colNameMap = {};
  try {
    var cols = await figma.variables.getLocalVariableCollectionsAsync();
    for (var ci = 0; ci < cols.length; ci++) colNameMap[cols[ci].id] = cols[ci].name.toLowerCase();
  } catch (e) {}

  var all = allColor.concat(allFloat);
  for (var i = 0; i < all.length; i++) {
    var v = all[i];
    var fullName = v.name.toLowerCase();
    varCache[fullName] = v;
    var parts = v.name.split("/");
    var lastSeg = parts[parts.length - 1].toLowerCase();
    if (!varCache[lastSeg]) varCache[lastSeg] = v;
    var hyp = lastSeg.replace(/ /g, "-");
    var spc = lastSeg.replace(/-/g, " ");
    if (!varCache[hyp]) varCache[hyp] = v;
    if (!varCache[spc]) varCache[spc] = v;
    var fullHyp = fullName.replace(/ /g, "-");
    var fullSpc = fullName.replace(/-/g, " ");
    if (!varCache[fullHyp]) varCache[fullHyp] = v;
    if (!varCache[fullSpc]) varCache[fullSpc] = v;
    var colName = colNameMap[v.variableCollectionId];
    if (colName) {
      var colPath = colName + "/" + fullName;
      varCache[colPath] = v;
      varCache[colPath.replace(/ /g, "-")] = v;
      varCache[colPath.replace(/-/g, " ")] = v;
      if (lastSeg !== fullName) {
        var colShort = colName + "/" + lastSeg;
        if (!varCache[colShort]) varCache[colShort] = v;
        if (!varCache[colShort.replace(/ /g, "-")]) varCache[colShort.replace(/ /g, "-")] = v;
      }
    }
  }

  // Load text styles
  try {
    var styles = await figma.getLocalTextStylesAsync();
    for (var s = 0; s < styles.length; s++) {
      var st = styles[s];
      var stName = st.name.toLowerCase();
      textStyleCache[stName] = st;
      var slashToSpace = stName.replace(/\//g, " ");
      if (!textStyleCache[slashToSpace]) textStyleCache[slashToSpace] = st;
      var slashToHyphen = stName.replace(/\//g, "-");
      if (!textStyleCache[slashToHyphen]) textStyleCache[slashToHyphen] = st;
      var stParts = st.name.split("/");
      var stLast = stParts[stParts.length - 1].toLowerCase();
      if (!textStyleCache[stLast]) textStyleCache[stLast] = st;
      var stHyp = stLast.replace(/ /g, "-");
      var stSpc = stLast.replace(/-/g, " ");
      if (!textStyleCache[stHyp]) textStyleCache[stHyp] = st;
      if (!textStyleCache[stSpc]) textStyleCache[stSpc] = st;
    }
  } catch (e) {}

  // Load effect styles (shadows, glass, glow, rings)
  effectStyleCache = {};
  try {
    var effectStyles = await figma.getLocalEffectStylesAsync();
    for (var ei = 0; ei < effectStyles.length; ei++) {
      var es = effectStyles[ei];
      var esName = es.name.toLowerCase();
      effectStyleCache[esName] = es;
      // Also index with slash→hyphen and hyphen→slash variants
      var esHyp = esName.replace(/\//g, "-");
      var esSpc = esName.replace(/\//g, " ");
      if (!effectStyleCache[esHyp]) effectStyleCache[esHyp] = es;
      if (!effectStyleCache[esSpc]) effectStyleCache[esSpc] = es;
      // Index by last segment (e.g. "sm" from "Shadow/sm")
      var esParts = es.name.split("/");
      var esLast = esParts[esParts.length - 1].toLowerCase();
      if (!effectStyleCache[esLast]) effectStyleCache[esLast] = es;
    }
  } catch (e) {}

  _tokenCachesLoaded = true;
  // Detailed diagnostic logging
  var colorCount = allColor.length;
  var floatCount = allFloat.length;
  var textCount = Object.keys(textStyleCache).length;
  var effectCount = Object.keys(effectStyleCache).length;
  console.log("[HTML→Figma] Loaded: COLOR=" + colorCount + " FLOAT=" + floatCount + " textStyles=" + textCount + " effectStyles=" + effectCount);
  // Log sample variable names for debugging
  if (colorCount > 0) {
    var sampleColors = allColor.slice(0, 5).map(function(v) { return v.name; });
    console.log("[HTML→Figma] Sample COLOR vars: " + sampleColors.join(", "));
  }
  if (textCount > 0) {
    var sampleTexts = Object.keys(textStyleCache).slice(0, 8);
    console.log("[HTML→Figma] Sample text style keys: " + sampleTexts.join(", "));
  }
  if (effectCount > 0) {
    var sampleEffects = Object.keys(effectStyleCache).slice(0, 8);
    console.log("[HTML→Figma] Sample effect style keys: " + sampleEffects.join(", "));
  }
  // Test specific lookups
  console.log("[HTML→Figma] findVar('foreground')=" + (findVar("foreground") ? "FOUND" : "MISS"));
  console.log("[HTML→Figma] findVar('border')=" + (findVar("border") ? "FOUND" : "MISS"));
  console.log("[HTML→Figma] findVar('card')=" + (findVar("card") ? "FOUND" : "MISS"));
  console.log("[HTML→Figma] findSpacingVar('none')=" + (findSpacingVar("none") ? "FOUND" : "MISS"));
  console.log("[HTML→Figma] findRadiusVar('none')=" + (findRadiusVar("none") ? "FOUND" : "MISS"));
  console.log("[HTML→Figma] findTextStyleByName('sp-body')=" + (findTextStyleByName("sp-body") ? "FOUND" : "MISS"));
  console.log("[HTML→Figma] findTextStyleByName('sp-h2')=" + (findTextStyleByName("sp-h2") ? "FOUND" : "MISS"));
}

function findVar(name, preferredPrefix) {
  if (!name) return null;
  var lower = name.toLowerCase();
  var hyp = lower.replace(/ /g, "-");
  var spc = lower.replace(/-/g, " ");
  if (preferredPrefix) {
    var ppArr = Array.isArray(preferredPrefix) ? preferredPrefix : [preferredPrefix];
    for (var pp = 0; pp < ppArr.length; pp++) {
      if (varCache[ppArr[pp] + lower]) return varCache[ppArr[pp] + lower];
      if (varCache[ppArr[pp] + hyp]) return varCache[ppArr[pp] + hyp];
      if (varCache[ppArr[pp] + spc]) return varCache[ppArr[pp] + spc];
    }
    return null;
  }
  if (varCache[lower]) return varCache[lower];
  if (varCache[hyp]) return varCache[hyp];
  if (varCache[spc]) return varCache[spc];
  var prefixes = [
    "semantic/", "color/", "colours/", "colors/", "primitive/",
    "spacing/", "radius/", "size/", "space/", "foundation/",
    "border radius/", "semantic colors/"
  ];
  for (var i = 0; i < prefixes.length; i++) {
    if (varCache[prefixes[i] + lower]) return varCache[prefixes[i] + lower];
    if (varCache[prefixes[i] + hyp]) return varCache[prefixes[i] + hyp];
    if (varCache[prefixes[i] + spc]) return varCache[prefixes[i] + spc];
  }
  return null;
}

function findSpacingVar(name) {
  return findVar(name, ["spacing/", "space/", "size/"]);
}

function findRadiusVar(name) {
  return findVar(name, ["border radius/", "radius/"]);
}

function findTextStyleByName(name) {
  if (!name) return null;
  var lower = name.toLowerCase();
  if (textStyleCache[lower]) return textStyleCache[lower];
  var variants = [
    lower.replace(/ /g, "-"), lower.replace(/-/g, " "),
    lower.replace(/ /g, "/"), lower.replace(/\//g, " "),
    lower.replace(/\//g, "-"), lower.replace(/-/g, "/")
  ];
  for (var i = 0; i < variants.length; i++) {
    if (textStyleCache[variants[i]]) return textStyleCache[variants[i]];
  }
  var cacheKeys = Object.keys(textStyleCache);
  for (var j = 0; j < cacheKeys.length; j++) {
    if (cacheKeys[j].indexOf(lower) !== -1) return textStyleCache[cacheKeys[j]];
  }
  return null;
}

function findEffectStyleByName(name) {
  if (!name) return null;
  var lower = name.toLowerCase();
  if (effectStyleCache[lower]) return effectStyleCache[lower];
  var variants = [
    lower.replace(/ /g, "-"), lower.replace(/-/g, " "),
    lower.replace(/ /g, "/"), lower.replace(/\//g, " "),
    lower.replace(/\//g, "-"), lower.replace(/-/g, "/")
  ];
  for (var i = 0; i < variants.length; i++) {
    if (effectStyleCache[variants[i]]) return effectStyleCache[variants[i]];
  }
  // Partial match
  var cacheKeys = Object.keys(effectStyleCache);
  for (var j = 0; j < cacheKeys.length; j++) {
    if (cacheKeys[j].indexOf(lower) !== -1) return effectStyleCache[cacheKeys[j]];
  }
  return null;
}

async function applyEffectStyle(node, styleName) {
  if (!styleName) return;
  var es = findEffectStyleByName(styleName);
  if (es) {
    try { await node.setEffectStyleIdAsync(es.id); } catch (e) {}
  }
}

function makeBoundPaint(variable, opacity) {
  var paint = figma.variables.setBoundVariableForPaint(
    { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
    "color",
    variable
  );
  if (opacity !== undefined && opacity < 1) paint.opacity = opacity;
  return paint;
}

// Set fill with variable binding. tokenName = "primary", "primary/50", "card", etc.
function setFillToken(node, tokenName, fallbackRGBA) {
  if (!tokenName) {
    if (fallbackRGBA) {
      var p = makeSolidPaint(fallbackRGBA);
      if (p) node.fills = [p];
    }
    return;
  }
  // Handle opacity suffix: "primary/50" → token="primary", opacity=0.5
  var opacitySuffix = null;
  var slashIdx = tokenName.indexOf("/");
  if (slashIdx > 0) {
    var afterSlash = tokenName.substring(slashIdx + 1);
    var num = parseInt(afterSlash);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      opacitySuffix = num / 100;
      tokenName = tokenName.substring(0, slashIdx);
    }
  }
  var v = findVar(tokenName);
  if (v) {
    node.fills = [makeBoundPaint(v, opacitySuffix)];
    // Two-step opacity for reliability
    if (opacitySuffix !== null) {
      var fills = node.fills.slice();
      fills[0] = Object.assign({}, fills[0], { opacity: opacitySuffix });
      node.fills = fills;
    }
  } else {
    console.log("[HTML→Figma] MISS fill token: '" + tokenName + "' for node '" + (node.name || "?") + "'");
    if (fallbackRGBA) {
      var p2 = makeSolidPaint(fallbackRGBA);
      if (p2) node.fills = [p2];
    }
  }
}

function setStrokeToken(node, tokenName, fallbackRGBA) {
  if (!tokenName) {
    if (fallbackRGBA) {
      var p = makeSolidPaint(fallbackRGBA);
      if (p) node.strokes = [p];
    }
    return;
  }
  var opacitySuffix = null;
  var slashIdx = tokenName.indexOf("/");
  if (slashIdx > 0) {
    var afterSlash = tokenName.substring(slashIdx + 1);
    var num = parseInt(afterSlash);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      opacitySuffix = num / 100;
      tokenName = tokenName.substring(0, slashIdx);
    }
  }
  var v = findVar(tokenName);
  if (v) {
    node.strokes = [makeBoundPaint(v, opacitySuffix)];
    if (opacitySuffix !== null) {
      var strokes = node.strokes.slice();
      strokes[0] = Object.assign({}, strokes[0], { opacity: opacitySuffix });
      node.strokes = strokes;
    }
  } else if (fallbackRGBA) {
    var p2 = makeSolidPaint(fallbackRGBA);
    if (p2) node.strokes = [p2];
  }
}

function bindSpacing(node, field, tokenName, fallbackPx) {
  // Auto-bind "none" for 0px values even when no explicit token
  var effectiveToken = tokenName || (fallbackPx === 0 ? "none" : null);
  if (!effectiveToken) { try { node[field] = fallbackPx; } catch (e) {} return; }
  var v = findSpacingVar(effectiveToken);
  if (v) {
    try { node.setBoundVariable(field, v); return; } catch (e) {}
  }
  try { node[field] = fallbackPx; } catch (e) {}
}

function bindRadius(node, field, tokenName, fallbackPx) {
  // Auto-bind "none" for 0px values even when no explicit token
  var effectiveToken = tokenName || (fallbackPx === 0 ? "none" : null);
  if (!effectiveToken) { try { node[field] = fallbackPx; } catch (e) {} return; }
  var v = findRadiusVar(effectiveToken);
  if (v) {
    try { node.setBoundVariable(field, v); return; } catch (e) {}
  }
  try { node[field] = fallbackPx; } catch (e) {}
}

// ── Font weight → Figma style name mapping ──
const FONT_STYLE_MAP = {
  100: "Thin",
  200: "ExtraLight",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "SemiBold",
  700: "Bold",
  800: "ExtraBold",
  900: "Black",
};

// Cache loaded fonts to avoid duplicate loads
const _loadedFonts = new Set();

async function loadFont(family, weight) {
  // Normalize family name (strip quotes, use first family)
  const fam = family.replace(/['"]/g, "").split(",")[0].trim();
  const style = FONT_STYLE_MAP[weight] || "Regular";
  const key = `${fam}::${style}`;
  if (_loadedFonts.has(key)) return { family: fam, style };
  try {
    await figma.loadFontAsync({ family: fam, style });
    _loadedFonts.add(key);
    return { family: fam, style };
  } catch (e) {
    // Fallback to Inter
    const fallbackKey = `Inter::${style}`;
    if (!_loadedFonts.has(fallbackKey)) {
      try {
        await figma.loadFontAsync({ family: "Inter", style });
        _loadedFonts.add(fallbackKey);
      } catch (e2) {
        await figma.loadFontAsync({ family: "Inter", style: "Regular" });
        _loadedFonts.add("Inter::Regular");
        return { family: "Inter", style: "Regular" };
      }
    }
    return { family: "Inter", style };
  }
}

// ── Color parsing ──
function parseRGBA(str) {
  if (!str) return null;
  // Handle {r,g,b,a} object format
  if (typeof str === "object" && str.r !== undefined) {
    return {
      color: { r: str.r / 255, g: str.g / 255, b: str.b / 255 },
      opacity: str.a !== undefined ? str.a : 1,
    };
  }
  // Parse "rgb(r, g, b)" or "rgba(r, g, b, a)"
  const m = String(str).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  return {
    color: { r: parseInt(m[1]) / 255, g: parseInt(m[2]) / 255, b: parseInt(m[3]) / 255 },
    opacity: m[4] !== undefined ? parseFloat(m[4]) : 1,
  };
}

function makeSolidPaint(rgba) {
  if (!rgba) return null;
  const p = parseRGBA(rgba);
  if (!p) return null;
  const paint = { type: "SOLID", color: p.color };
  if (p.opacity < 1) paint.opacity = p.opacity;
  return paint;
}

// ── ComponentSet cache ──
let _componentSetCache = null;

async function findComponentSet(name) {
  if (!_componentSetCache) {
    _componentSetCache = new Map();
    await figma.loadAllPagesAsync();
    for (const page of figma.root.children) {
      page.findAllWithCriteria({ types: ["COMPONENT_SET"] }).forEach(cs => {
        _componentSetCache.set(cs.name, cs);
      });
    }
  }
  return _componentSetCache.get(name) || null;
}

async function findComponent(name) {
  await figma.loadAllPagesAsync();
  for (const page of figma.root.children) {
    const found = page.findAllWithCriteria({ types: ["COMPONENT"] }).find(c => c.name === name);
    if (found) return found;
  }
  return null;
}

function buildVariantMap(cs) {
  const map = new Map();
  for (const variant of cs.children) {
    if (variant.type !== "COMPONENT") continue;
    map.set(variant.name, variant);
  }
  return map;
}

function getVariantKey(variants) {
  return Object.entries(variants)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");
}

// ── Main node creation ──

async function createNode(node, parentLayout) {
  if (!node) return null;

  switch (node.type) {
    case "frame":
      return await createFrame(node);
    case "text":
      return await createText(node, parentLayout);
    case "icon":
      return await createIcon(node);
    case "image":
      return await createImage(node);
    case "svg":
      return await createSVG(node);
    case "instance":
      return await createInstance(node);
    case "separator":
      return await createSeparator(node);
    case "placeholder":
      return createPlaceholder(node);
    default:
      return null;
  }
}

// ── Frame ──

async function createFrame(node) {
  const frame = figma.createFrame();
  frame.name = node.name || "Frame";

  // Size first
  const w = node.width || 100;
  const h = node.height || 100;
  frame.resize(w, h);

  // Auto layout
  if (node.layout === "horizontal" || node.layout === "vertical") {
    frame.layoutMode = node.layout === "horizontal" ? "HORIZONTAL" : "VERTICAL";

    // Gap — always bind to spacing variable (0 → "none")
    bindSpacing(frame, "itemSpacing", node.gapToken || null, node.gap || 0);

    // Padding — bind to spacing variables if tokens available
    bindSpacing(frame, "paddingTop", node.paddingTopToken, node.paddingTop || 0);
    bindSpacing(frame, "paddingRight", node.paddingRightToken, node.paddingRight || 0);
    bindSpacing(frame, "paddingBottom", node.paddingBottomToken, node.paddingBottom || 0);
    bindSpacing(frame, "paddingLeft", node.paddingLeftToken, node.paddingLeft || 0);

    // Alignment
    const justifyMap = {
      "start": "MIN", "center": "CENTER", "end": "MAX",
      "space-between": "SPACE_BETWEEN",
    };
    const alignMap = {
      "start": "MIN", "center": "CENTER", "end": "MAX", "stretch": "STRETCH",
    };
    frame.primaryAxisAlignItems = justifyMap[node.primaryAlign] || "MIN";
    frame.counterAxisAlignItems = alignMap[node.counterAlign] || "MIN";

    // Wrap
    if (node.wrap) frame.layoutWrap = "WRAP";

    // Sizing
    frame.primaryAxisSizingMode = "AUTO"; // hug by default
    frame.counterAxisSizingMode = "FIXED";
  }

  // Fill — use background image (decorative effects screenshot) if available
  if (node.backgroundImage) {
    try {
      var bgBase64 = node.backgroundImage.replace(/^data:image\/\w+;base64,/, "");
      var bgBytes = figma.base64Decode(bgBase64);
      var bgImg = figma.createImage(bgBytes);
      frame.fills = [{
        type: "IMAGE",
        scaleMode: "FILL",
        imageHash: bgImg.hash,
      }];
    } catch (e) {
      if (node.fillToken) {
        setFillToken(frame, node.fillToken, node.fill);
      } else if (node.fill) {
        var paint = makeSolidPaint(node.fill);
        frame.fills = paint ? [paint] : [];
      } else {
        frame.fills = [];
      }
    }
  } else if (node.fillToken || node.fill) {
    setFillToken(frame, node.fillToken, node.fill);
  } else {
    frame.fills = [];
  }

  // Stroke — bind to color variable if token available
  if (node.strokeToken || node.stroke) {
    setStrokeToken(frame, node.strokeToken, node.stroke);
    frame.strokeWeight = node.strokeWidth || 1;
  }

  // Border radius — always bind to radius variable (0 → "none")
  if (typeof node.radius === "number") {
    bindRadius(frame, "cornerRadius", node.radiusToken && typeof node.radiusToken === "string" ? node.radiusToken : null, Math.min(node.radius, 9999));
  } else if (typeof node.radius === "object" && node.radius) {
    if (node.radiusToken && typeof node.radiusToken === "object") {
      bindRadius(frame, "topLeftRadius", node.radiusToken.topLeft, node.radius.topLeft || 0);
      bindRadius(frame, "topRightRadius", node.radiusToken.topRight, node.radius.topRight || 0);
      bindRadius(frame, "bottomLeftRadius", node.radiusToken.bottomLeft, node.radius.bottomLeft || 0);
      bindRadius(frame, "bottomRightRadius", node.radiusToken.bottomRight, node.radius.bottomRight || 0);
    } else {
      bindRadius(frame, "topLeftRadius", null, node.radius.topLeft || 0);
      bindRadius(frame, "topRightRadius", null, node.radius.topRight || 0);
      bindRadius(frame, "bottomLeftRadius", null, node.radius.bottomLeft || 0);
      bindRadius(frame, "bottomRightRadius", null, node.radius.bottomRight || 0);
    }
  } else {
    // No radius → bind "none" (0px)
    bindRadius(frame, "cornerRadius", "none", 0);
  }

  // Effect style (shadow) — bind to Figma effect style
  if (node.shadowToken) {
    await applyEffectStyle(frame, node.shadowToken);
  }

  // Opacity
  if (node.opacity !== undefined && node.opacity !== 1) {
    frame.opacity = node.opacity;
  }

  // Clip content
  if (node.overflow === "hidden" || node.clipsContent) {
    frame.clipsContent = true;
  }

  // Create children
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      const childNode = await createNode(child, node.layout);
      if (childNode) {
        frame.appendChild(childNode);
        applySizing(childNode, child, node.layout);
      }
    }
  }

  return frame;
}

// ── Text ──

async function createText(node, parentLayout) {
  const text = figma.createText();

  // Try to apply text style first (sets font, size, lineHeight in one go)
  var styleApplied = false;
  if (node.textStyle) {
    var ts = findTextStyleByName(node.textStyle);
    if (ts) {
      try {
        // Load the font from the text style
        await figma.loadFontAsync(ts.fontName);
        await text.setTextStyleIdAsync(ts.id);
        styleApplied = true;
        console.log("[HTML→Figma] ✓ text style '" + node.textStyle + "' applied to '" + (node.textContent || "").substring(0, 20) + "'");
      } catch (e) {
        console.log("[HTML→Figma] ✗ text style '" + node.textStyle + "' FAILED: " + e.message);
        styleApplied = false;
      }
    } else {
      console.log("[HTML→Figma] MISS text style: '" + node.textStyle + "' for '" + (node.textContent || "").substring(0, 20) + "'");
    }
  }

  if (!styleApplied) {
    // Manual font setup
    const family = node.fontFamily || "Inter";
    const weight = node.fontWeight || 400;
    const fontName = await loadFont(family, weight);
    text.fontName = fontName;
    text.fontSize = node.fontSize || 14;
    if (node.lineHeight && node.lineHeight > 0) {
      text.lineHeight = { value: node.lineHeight, unit: "PIXELS" };
    }
  }

  text.characters = node.textContent || node.text || "";

  // Color — bind to variable if token available
  if (node.colorToken) {
    setFillToken(text, node.colorToken, node.color);
  } else if (node.color) {
    const paint = makeSolidPaint(node.color);
    if (paint) text.fills = [paint];
  }

  // Text align
  if (node.textAlign) {
    const map = { "left": "LEFT", "center": "CENTER", "right": "RIGHT", "justify": "JUSTIFIED" };
    text.textAlignHorizontal = map[node.textAlign] || "LEFT";
  }

  // Name
  const content = (node.textContent || node.text || "").substring(0, 30);
  text.name = content || "Text";

  return text;
}

// ── Icon ──

async function createIcon(node) {
  const name = node.name || "Icon";
  // Try to find icon component in Figma
  const iconComp = await findComponent("Icon / " + name);
  if (iconComp) {
    const inst = iconComp.createInstance();
    inst.resize(node.width || 16, node.height || 16);
    return inst;
  }
  // Fallback: create a small rectangle placeholder
  const frame = figma.createFrame();
  frame.name = name;
  frame.resize(node.width || 16, node.height || 16);
  frame.fills = [];
  if (node.color) {
    const paint = makeSolidPaint(node.color);
    if (paint) frame.fills = [paint];
    frame.opacity = 0.3;
  }
  frame.cornerRadius = 2;
  return frame;
}

// ── SVG ──

async function createSVG(node) {
  if (!node.svgContent) {
    return createPlaceholder(node);
  }
  try {
    const svgNode = figma.createNodeFromSvg(node.svgContent);
    svgNode.name = node.name || "SVG";
    if (node.width && node.height) {
      svgNode.resize(node.width, node.height);
    }
    return svgNode;
  } catch (e) {
    // Fallback to placeholder if SVG parsing fails
    const fallback = Object.assign({}, node);
    fallback.label = (node.name || "SVG") + " (failed to parse)";
    return createPlaceholder(fallback);
  }
}

// ── Image ──

async function createImage(node) {
  const frame = figma.createFrame();
  frame.name = node.name || "Image";
  frame.resize(node.width || 100, node.height || 100);

  if (node.radius) frame.cornerRadius = node.radius;

  if (node.imageBase64) {
    try {
      // Extract base64 data
      const base64 = node.imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const bytes = figma.base64Decode(base64);
      const image = figma.createImage(bytes);
      frame.fills = [{
        type: "IMAGE",
        scaleMode: node.objectFit === "contain" ? "FIT" : "FILL",
        imageHash: image.hash,
      }];
    } catch (e) {
      frame.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
    }
  } else if (node.src && node.src.startsWith("http")) {
    // Cannot fetch external images in plugin sandbox without networkAccess
    frame.fills = [{ type: "SOLID", color: { r: 0.15, g: 0.15, b: 0.18 } }];
  } else {
    frame.fills = [{ type: "SOLID", color: { r: 0.15, g: 0.15, b: 0.18 } }];
  }

  return frame;
}

// ── Instance (DS Component) ──

async function createInstance(node) {
  const csName = node.component;
  if (!csName) return null;

  const cs = await findComponentSet(csName);
  if (!cs) {
    // Fallback: create frame with text
    const frame = figma.createFrame();
    frame.name = csName + " (not found)";
    frame.resize(node.width || 100, node.height || 36);
    frame.fills = [{ type: "SOLID", color: { r: 0.15, g: 0.15, b: 0.18 } }];
    frame.cornerRadius = 8;
    return frame;
  }

  // Find matching variant
  const variants = node.variants || {};
  const variantKey = getVariantKey(variants);
  const variantMap = buildVariantMap(cs);

  let targetComponent = variantMap.get(variantKey);
  if (!targetComponent && cs.children.length > 0) {
    // Try partial match or use first variant as default
    targetComponent = cs.children[0];
  }

  if (!targetComponent) return null;

  const instance = targetComponent.createInstance();

  // Apply text overrides
  if (node.textOverrides) {
    for (const [childName, text] of Object.entries(node.textOverrides)) {
      const textNode = instance.findOne(n => n.type === "TEXT" && n.name === childName);
      if (textNode) {
        try {
          const fontName = textNode.fontName;
          if (fontName !== figma.mixed) {
            await figma.loadFontAsync(fontName);
          }
          textNode.characters = text;
        } catch (e) {}
      }
    }
  }

  // Handle SVG icons — create as components and swap into icon slots
  if (node.svgIcons && node.svgIcons.length > 0) {
    for (var si = 0; si < node.svgIcons.length; si++) {
      var svgIcon = node.svgIcons[si];
      // Try "Icon / Name" (foundation icons) first, then "Logo / Name" fallback
      var iconName = svgIcon.name;
      var logoComp = await findComponent("Icon / " + iconName);
      if (!logoComp) logoComp = await findComponent("Logo / " + iconName);
      if (!logoComp && svgIcon.svgContent) {
        var compName = "Icon / " + iconName;
        try {
          var svgFrame = figma.createNodeFromSvg(svgIcon.svgContent);
          var comp = figma.createComponent();
          comp.name = compName;
          comp.resize(svgIcon.width || 16, svgIcon.height || 16);
          // Move SVG children into component
          var svgChildren = [];
          for (var ci = 0; ci < svgFrame.children.length; ci++) {
            svgChildren.push(svgFrame.children[ci]);
          }
          for (var ci = 0; ci < svgChildren.length; ci++) {
            comp.appendChild(svgChildren[ci]);
          }
          svgFrame.remove();
          logoComp = comp;

          // Place on current page for user to organize later
          figma.currentPage.appendChild(comp);
        } catch (e) {}
      }

      if (logoComp) {
        // Find icon instance slot in the component instance and swap
        var iconSlot = instance.findOne(function(n) {
          return n.type === "INSTANCE" && (
            n.name === "Icon" || n.name === "Icon Left" || n.name === "Icon Right" ||
            n.name.toLowerCase().indexOf("icon") >= 0
          );
        });
        if (iconSlot && iconSlot.type === "INSTANCE") {
          try { iconSlot.swapComponent(logoComp); } catch (e) {}
        }
      }
    }
  }

  return instance;
}

// ── Separator ──

async function createSeparator(node) {
  const isVertical = node.direction === "vertical";
  const line = figma.createFrame();
  line.name = "Separator";

  if (isVertical) {
    line.resize(1, node.height || 20);
  } else {
    line.resize(node.width || 100, 1);
  }

  // Bind to "border" color variable
  var borderVar = findVar("border");
  if (borderVar) {
    line.fills = [makeBoundPaint(borderVar)];
  } else if (node.fillToken) {
    setFillToken(line, node.fillToken, node.fill);
  } else if (node.fill) {
    var p = makeSolidPaint(node.fill);
    if (p) line.fills = [p];
  } else {
    line.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.22 }, opacity: 0.5 }];
  }
  return line;
}

// ── Placeholder ──

function createPlaceholder(node) {
  const frame = figma.createFrame();
  frame.name = node.name || node.label || "Placeholder";
  frame.resize(node.width || 200, node.height || 100);
  frame.fills = [{ type: "SOLID", color: { r: 0.15, g: 0.15, b: 0.18 }, opacity: 0.3 }];
  if (node.radius) frame.cornerRadius = Math.min(node.radius, 9999);
  return frame;
}

// ── Sizing helper ──

function applySizing(figmaNode, dataNode, parentLayout) {
  if (!parentLayout || parentLayout === "none") return;
  if (!figmaNode.layoutSizingHorizontal) return; // Not in auto layout

  // Component instances must keep their original size (FIXED), not HUG
  var isInstance = figmaNode.type === "INSTANCE";
  var hasLayout = !isInstance && figmaNode.layoutMode && figmaNode.layoutMode !== "NONE";

  if (dataNode.fillWidth) {
    figmaNode.layoutSizingHorizontal = "FILL";
  } else {
    figmaNode.layoutSizingHorizontal = "FIXED";
  }

  if (dataNode.fillHeight) {
    figmaNode.layoutSizingVertical = "FILL";
  } else if (hasLayout) {
    figmaNode.layoutSizingVertical = "HUG";
  } else {
    figmaNode.layoutSizingVertical = "FIXED";
  }

  // Per-child cross-axis alignment (mx-auto → center, ml-auto → end)
  if (dataNode.selfAlign) {
    // For HORIZONTAL auto-layout children in a VERTICAL parent with selfAlign=center:
    // use FILL width + center primary alignment (centers children horizontally).
    // This is more reliable than layoutAlign=CENTER for centering a row of items.
    // For VERTICAL layout children: keep layoutAlign=CENTER (preserves fixed width).
    var isHorizontalChild = figmaNode.layoutMode === "HORIZONTAL";
    var isInVerticalParent = parentLayout === "vertical";
    if (dataNode.selfAlign === "center" && isHorizontalChild && isInVerticalParent) {
      figmaNode.layoutSizingHorizontal = "FILL";
      figmaNode.primaryAxisAlignItems = "CENTER";
    } else {
      var alignMap = { "center": "CENTER", "end": "MAX", "start": "MIN" };
      figmaNode.layoutAlign = alignMap[dataNode.selfAlign] || "INHERIT";
    }
  }
}

// ── Upsert helper: find existing frame by name, clear children, reuse ──

function findExistingFrame(name) {
  var kids = figma.currentPage.children;
  for (var i = 0; i < kids.length; i++) {
    if (kids[i].type === "FRAME" && kids[i].name === name) return kids[i];
  }
  return null;
}

function clearChildren(frame) {
  while (frame.children.length > 0) {
    frame.children[0].remove();
  }
}

// ── Message handler ──

// State for multi-breakpoint responsive generation
var _responsiveFrames = [];
var _responsiveX = 0;
var _responsiveTotalNodes = 0;

figma.ui.onmessage = async (msg) => {
  // Ensure token caches are loaded before any generation
  if (msg.type === "generate" || msg.type === "responsive-start") {
    await loadTokenCaches();
  }

  // Single frame (backward compatible)
  if (msg.type === "generate") {
    try {
      const data = msg.data;
      const root = data.root || data;
      const pageName = data.pageName || data.name || "Imported Screen";
      const frameName = root.name || pageName;

      // Upsert: detect existing frame by name
      var existing = findExistingFrame(frameName);
      var isUpdate = !!existing;

      figma.ui.postMessage({ type: "progress", message: (isUpdate ? "Updating" : "Creating") + ` "${frameName}"...` });

      if (existing) {
        // Keep frame identity + position, rebuild children
        clearChildren(existing);

        // Rebuild children from DOM tree into existing frame
        if (root.children && root.children.length > 0) {
          for (var ci = 0; ci < root.children.length; ci++) {
            var childNode = await createNode(root.children[ci], root.layout);
            if (childNode) {
              existing.appendChild(childNode);
              applySizing(childNode, root.children[ci], root.layout);
            }
          }
        }

        // Update frame properties — use token binding when available
        if (root.fillToken || root.fill) {
          setFillToken(existing, root.fillToken, root.fill);
        }
        if (root.width) existing.resize(root.width, root.height || existing.height);

        figma.currentPage.selection = [existing];
        figma.viewport.scrollAndZoomIntoView([existing]);

        let count = 0;
        function countAll(n) { count++; if ("children" in n) n.children.forEach(countAll); }
        countAll(existing);

        figma.ui.postMessage({
          type: "done",
          message: `Updated "${frameName}" with ${count} Figma nodes`,
        });
      } else {
        // Create new
        const rootNode = await createNode(root);
        if (!rootNode) {
          figma.ui.postMessage({ type: "error", message: "Failed to create root node" });
          return;
        }

        rootNode.name = frameName;

        const vp = figma.viewport.center;
        rootNode.x = Math.round(vp.x - (root.width || 1440) / 2);
        rootNode.y = Math.round(vp.y - (root.height || 900) / 2);

        figma.currentPage.selection = [rootNode];
        figma.viewport.scrollAndZoomIntoView([rootNode]);

        let count2 = 0;
        function countAll2(n) { count2++; if ("children" in n) n.children.forEach(countAll2); }
        countAll2(rootNode);

        figma.ui.postMessage({
          type: "done",
          message: `Created "${frameName}" with ${count2} Figma nodes`,
        });
      }
    } catch (err) {
      figma.ui.postMessage({ type: "error", message: "Error: " + err.message });
    }
    return;
  }

  // ── Responsive: session start ──
  if (msg.type === "responsive-start") {
    _responsiveFrames = [];
    _responsiveTotalNodes = 0;

    // Check if first breakpoint frame already exists — use its position
    var firstBPName = msg.pageName + " \u2014 Desktop";
    var firstExisting = findExistingFrame(firstBPName);
    _responsiveX = firstExisting ? firstExisting.x : Math.round(figma.viewport.center.x - 720);
    return;
  }

  // ── Responsive: single breakpoint frame ──
  if (msg.type === "responsive-frame") {
    try {
      var bpName = msg.breakpoint || "Frame";
      var bpWidth = msg.width || 1440;
      var minH = msg.minHeight || 900;
      var tree = msg.tree;
      var pageName = msg.pageName || "Screen";
      var frameName = pageName + " \u2014 " + bpName;

      // Upsert: detect existing frame by name
      var existingFrame = findExistingFrame(frameName);
      var isUpd = !!existingFrame;

      figma.ui.postMessage({
        type: "progress",
        message: (isUpd ? "Updating " : "Creating ") + bpName + " (" + (msg.index + 1) + "/" + msg.total + ")...",
      });

      var rootNode;
      if (existingFrame) {
        // Keep frame identity + position, rebuild children
        rootNode = existingFrame;
        clearChildren(rootNode);

        // Rebuild children from DOM tree
        if (tree.children && tree.children.length > 0) {
          for (var rci = 0; rci < tree.children.length; rci++) {
            var rChild = await createNode(tree.children[rci], tree.layout);
            if (rChild) {
              rootNode.appendChild(rChild);
              applySizing(rChild, tree.children[rci], tree.layout);
            }
          }
        }

        // Update fill if changed
        if (tree.fill) {
          var rPaint = makeSolidPaint(tree.fill);
          if (rPaint) rootNode.fills = [rPaint];
        }
      } else {
        // Create new
        rootNode = await createNode(tree);
        if (!rootNode) {
          figma.ui.postMessage({ type: "frame-done" });
          return;
        }
        rootNode.name = frameName;
      }

      // Ensure root has vertical auto-layout
      if (rootNode.layoutMode === "NONE" || !rootNode.layoutMode) {
        rootNode.layoutMode = "VERTICAL";
        rootNode.counterAxisAlignItems = "MIN";
        rootNode.primaryAxisAlignItems = "MIN";
      }

      // Width = FIXED, Height = HUG with minHeight
      if (rootNode.layoutMode === "VERTICAL") {
        rootNode.counterAxisSizingMode = "FIXED";
        rootNode.primaryAxisSizingMode = "AUTO";
      } else {
        rootNode.primaryAxisSizingMode = "FIXED";
        rootNode.counterAxisSizingMode = "AUTO";
      }
      rootNode.resize(bpWidth, Math.max(rootNode.height || 100, minH));
      rootNode.minHeight = minH;

      if (!existingFrame) {
        // Position side by side (only for new frames)
        rootNode.x = _responsiveX;
        rootNode.y = 0;
      }
      _responsiveX = rootNode.x + bpWidth + 100;

      _responsiveFrames.push(rootNode);

      // Count nodes
      var nc = 0;
      var stack = [rootNode];
      while (stack.length > 0) {
        var cur = stack.pop();
        nc++;
        if ("children" in cur) {
          for (var si = 0; si < cur.children.length; si++) stack.push(cur.children[si]);
        }
      }
      _responsiveTotalNodes += nc;

      // Tell UI to send next breakpoint
      figma.ui.postMessage({ type: "frame-done" });
    } catch (err) {
      figma.ui.postMessage({ type: "error", message: "Error (" + (msg.breakpoint || "") + "): " + err.message });
    }
    return;
  }

  // ── Responsive: session end ──
  if (msg.type === "responsive-end") {
    if (_responsiveFrames.length > 0) {
      figma.currentPage.selection = _responsiveFrames;
      figma.viewport.scrollAndZoomIntoView(_responsiveFrames);
    }
    figma.ui.postMessage({
      type: "done",
      message: "Done — " + _responsiveFrames.length + " breakpoint(s), " + _responsiveTotalNodes + " nodes",
    });
    return;
  }
};
