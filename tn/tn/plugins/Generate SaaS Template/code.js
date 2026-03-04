/**
 * Generate SaaS Template — Figma Plugin
 *
 * Creates full SaaS application pages from JSON specifications.
 * Uses SprouX Design System foundation tokens + component instances.
 *
 * Architecture:
 *   Shared utilities (from Generate Examples) → ~300 lines
 *   Recursive layout engine (NEW) → renderNode, renderFrame, etc.
 *   Layout property appliers (NEW) → applyLayout, applyPadding, etc.
 *   Component instance factory (NEW) → createComponentInstance
 *   Page management (NEW) → doGenerate, doClear
 */

// ============================================================
// SECTION 1: CACHING & INITIALIZATION
// ============================================================

var varCache = {};
var textStyleCache = {};
var componentSetCache = {};
var debugLog = [];

async function loadCaches() {
  varCache = {};
  textStyleCache = {};
  componentSetCache = {};
  debugLog = [];

  // Load all pages first (required for dynamic-page document access)
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

    // Store by last segment
    var parts = v.name.split("/");
    var lastSeg = parts[parts.length - 1].toLowerCase();
    if (!varCache[lastSeg]) varCache[lastSeg] = v;

    // Hyphen/space variants
    var hyp = lastSeg.replace(/ /g, "-");
    var spc = lastSeg.replace(/-/g, " ");
    if (!varCache[hyp]) varCache[hyp] = v;
    if (!varCache[spc]) varCache[spc] = v;

    var fullHyp = fullName.replace(/ /g, "-");
    var fullSpc = fullName.replace(/-/g, " ");
    if (!varCache[fullHyp]) varCache[fullHyp] = v;
    if (!varCache[fullSpc]) varCache[fullSpc] = v;

    // Store by "collectionName/varName" for full-path lookups (e.g. "border radius/lg")
    var colName = colNameMap[v.variableCollectionId];
    if (colName) {
      var colPath = colName + "/" + fullName;
      varCache[colPath] = v;
      varCache[colPath.replace(/ /g, "-")] = v;
      varCache[colPath.replace(/-/g, " ")] = v;
      // Also "collectionName/lastSegment" for flat variable names
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

  debugLog.push("Loaded " + all.length + " variables, " + Object.keys(textStyleCache).length + " text style keys");
}

// ============================================================
// SECTION 2: VARIABLE & TEXT STYLE FINDERS
// ============================================================

function findVar(name) {
  if (!name) return null;
  var lower = name.toLowerCase();
  if (varCache[lower]) return varCache[lower];
  var hyp = lower.replace(/ /g, "-");
  var spc = lower.replace(/-/g, " ");
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

function findTextStyle(name) {
  if (!name) return null;
  var lower = name.toLowerCase();
  if (textStyleCache[lower]) return textStyleCache[lower];
  var variants = [
    lower.replace(/ /g, "-"),
    lower.replace(/-/g, " "),
    lower.replace(/ /g, "/"),
    lower.replace(/\//g, " "),
    lower.replace(/\//g, "-"),
    lower.replace(/-/g, "/")
  ];
  for (var i = 0; i < variants.length; i++) {
    if (textStyleCache[variants[i]]) return textStyleCache[variants[i]];
  }
  // Partial match
  var cacheKeys = Object.keys(textStyleCache);
  for (var j = 0; j < cacheKeys.length; j++) {
    if (cacheKeys[j].indexOf(lower) !== -1) return textStyleCache[cacheKeys[j]];
  }
  return null;
}

// ============================================================
// SECTION 3: VARIABLE BINDING HELPERS
// ============================================================

function makeBoundPaint(variable, opacity) {
  var paint = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
  if (opacity !== undefined && opacity < 1) paint.opacity = opacity;
  return figma.variables.setBoundVariableForPaint(paint, "color", variable);
}

function setFill(node, varName, fallbackHex) {
  var v = findVar(varName);
  if (v) {
    node.fills = [makeBoundPaint(v)];
  } else if (fallbackHex) {
    var rgb = hexToRgb(fallbackHex);
    node.fills = [{ type: "SOLID", color: rgb }];
  } else {
    node.fills = [];
  }
}

function setFillWithOpacity(node, varName, opacity) {
  var v = findVar(varName);
  if (v) {
    node.fills = [makeBoundPaint(v, opacity)];
  }
}

function setStroke(node, varName, fallbackHex) {
  var v = findVar(varName);
  if (v) {
    node.strokes = [makeBoundPaint(v)];
  } else if (fallbackHex) {
    var rgb = hexToRgb(fallbackHex);
    node.strokes = [{ type: "SOLID", color: rgb }];
  }
}

function setTextFill(textNode, varName, fallbackHex) {
  var v = findVar(varName);
  if (v) {
    textNode.fills = [makeBoundPaint(v)];
  } else if (fallbackHex) {
    var rgb = hexToRgb(fallbackHex);
    textNode.fills = [{ type: "SOLID", color: rgb }];
  }
}

function bindFloat(node, field, varName, fallbackValue) {
  var v = findVar(varName);
  if (v) {
    try {
      node.setBoundVariable(field, v);
      return; // CRITICAL: stop here, don't set raw value
    } catch (e) {}
  }
  try { node[field] = fallbackValue; } catch (e) {}
}

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  return {
    r: parseInt(hex.substring(0, 2), 16) / 255,
    g: parseInt(hex.substring(2, 4), 16) / 255,
    b: parseInt(hex.substring(4, 6), 16) / 255
  };
}

// Token name → fallback pixel value mapping
var SPACING_FALLBACKS = {
  "3xs": 4, "2xs": 6, "xs": 8, "sm": 12, "md": 16,
  "lg": 20, "xl": 24, "2xl": 32, "3xl": 40, "4xl": 48,
  "5xl": 64, "6xl": 80, "7xl": 96, "8xl": 128, "9xl": 160, "10xl": 192
};

var RADIUS_FALLBACKS = {
  "sm": 4, "md": 6, "lg": 8, "xl": 12, "2xl": 16, "3xl": 24, "full": 9999
};

function getSpacingValue(token) {
  if (typeof token === "number") return token;
  if (SPACING_FALLBACKS[token]) return SPACING_FALLBACKS[token];
  // Handle full paths like "spacing/md"
  if (token.indexOf("/") !== -1) {
    var lastPart = token.split("/").pop();
    if (SPACING_FALLBACKS[lastPart]) return SPACING_FALLBACKS[lastPart];
  }
  return parseInt(token) || 0;
}

function getRadiusValue(token) {
  if (typeof token === "number") return token;
  if (RADIUS_FALLBACKS[token]) return RADIUS_FALLBACKS[token];
  // Handle full paths like "border radius/lg"
  if (token.indexOf("/") !== -1) {
    var lastPart = token.split("/").pop();
    if (RADIUS_FALLBACKS[lastPart]) return RADIUS_FALLBACKS[lastPart];
  }
  return parseInt(token) || 0;
}

// ============================================================
// SECTION 4: FONT LOADING
// ============================================================

async function loadFontSafe(family, style) {
  // Build variant list: exact → spaced → unspaced → lowercase
  var variants = [style];
  var spaced = style.replace(/([a-z])([A-Z])/g, "$1 $2");
  if (spaced !== style) variants.push(spaced);
  var unspaced = style.replace(/ /g, "");
  if (unspaced !== style) variants.push(unspaced);
  // Lowercase variant (e.g. "Semibold" for fonts that use it)
  var lower = style.charAt(0).toUpperCase() + style.slice(1).toLowerCase().replace(/ /g, "");
  if (variants.indexOf(lower) === -1) variants.push(lower);

  // Weight-adjacent fallbacks for common weights
  var weightFallbacks = {
    "SemiBold": ["Bold", "Medium"],
    "Semi Bold": ["Bold", "Medium"],
    "ExtraBold": ["Bold", "Black"],
    "Extra Bold": ["Bold", "Black"],
    "Thin": ["ExtraLight", "Light"],
    "ExtraLight": ["Thin", "Light"],
    "Light": ["ExtraLight", "Regular"]
  };
  var adjacent = weightFallbacks[style] || weightFallbacks[spaced] || [];

  for (var i = 0; i < variants.length; i++) {
    try {
      await figma.loadFontAsync({ family: family, style: variants[i] });
      return { family: family, style: variants[i] };
    } catch (e) {}
  }
  // Try weight-adjacent fallbacks (closer than Regular)
  for (var j = 0; j < adjacent.length; j++) {
    var adjLoaded = await loadFontSafe_single(family, adjacent[j]);
    if (adjLoaded) return adjLoaded;
  }
  try {
    await figma.loadFontAsync({ family: family, style: "Regular" });
    return { family: family, style: "Regular" };
  } catch (e) {}
  return null;
}

async function loadFontSafe_single(family, style) {
  var variants = [style];
  var spaced = style.replace(/([a-z])([A-Z])/g, "$1 $2");
  if (spaced !== style) variants.push(spaced);
  for (var i = 0; i < variants.length; i++) {
    try {
      await figma.loadFontAsync({ family: family, style: variants[i] });
      return { family: family, style: variants[i] };
    } catch (e) {}
  }
  return null;
}

async function preloadCommonFonts() {
  var fonts = [
    // SprouX defaults
    ["Inter", "Regular"], ["Inter", "Medium"], ["Inter", "SemiBold"], ["Inter", "Bold"],
    ["Geist", "Regular"], ["Geist", "Medium"], ["Geist", "SemiBold"], ["Geist", "Bold"],
    // ShopPulse additions
    ["Plus Jakarta Sans", "Medium"], ["Plus Jakarta Sans", "SemiBold"],
    ["Plus Jakarta Sans", "Bold"], ["Plus Jakarta Sans", "ExtraBold"],
    ["JetBrains Mono", "Regular"], ["JetBrains Mono", "Medium"], ["JetBrains Mono", "SemiBold"]
  ];
  for (var i = 0; i < fonts.length; i++) {
    await loadFontSafe(fonts[i][0], fonts[i][1]);
  }

  // Preload text style fonts (SprouX + ShopPulse)
  var styleNames = [
    "heading 1", "heading 2", "heading 3",
    "paragraph regular/regular", "paragraph regular/medium", "paragraph regular/semibold",
    "paragraph small/regular", "paragraph small/medium", "paragraph small/semibold",
    "paragraph mini/regular", "paragraph mini/medium",
    // ShopPulse SP/* text styles
    "sp / h1", "sp / h2", "sp / h3", "sp / h4", "sp / h5",
    "sp / body lg", "sp / body", "sp / body medium", "sp / body semibold",
    "sp / label", "sp / label uc", "sp / caption", "sp / overline",
    "sp / kpi hero", "sp / kpi lg", "sp / kpi md", "sp / kpi sm",
    "sp / data", "sp / data sm", "sp / order id"
  ];
  for (var s = 0; s < styleNames.length; s++) {
    var st = findTextStyle(styleNames[s]);
    if (st && st.fontName) {
      try { await figma.loadFontAsync(st.fontName); } catch (e) {}
    }
  }
}

// ============================================================
// SECTION 5: COMPONENT UTILITIES
// ============================================================

function findComponentSet(name) {
  if (componentSetCache[name]) return componentSetCache[name];

  // Search current page first
  var found = figma.currentPage.findOne(function(n) {
    return n.type === "COMPONENT_SET" && n.name === name;
  });
  if (!found) {
    // Search all pages
    var pages = figma.root.children;
    for (var p = 0; p < pages.length; p++) {
      if (pages[p] === figma.currentPage) continue;
      found = pages[p].findOne(function(n) {
        return n.type === "COMPONENT_SET" && n.name === name;
      });
      if (found) break;
    }
  }
  if (found) componentSetCache[name] = found;
  return found;
}

// Also search for standalone COMPONENT (not just sets)
function findComponent(name) {
  var pages = figma.root.children;
  for (var p = 0; p < pages.length; p++) {
    var found = pages[p].findOne(function(n) {
      return (n.type === "COMPONENT" || n.type === "COMPONENT_SET") && n.name === name;
    });
    if (found) return found;
  }
  return null;
}

function normalizeVariantKey(name) {
  var parts = name.split(",").map(function(s) { return s.trim(); });
  parts.sort();
  return parts.join(", ").toLowerCase();
}

function makeVariantKey(variants) {
  var keys = Object.keys(variants).sort();
  var parts = keys.map(function(k) { return k + "=" + variants[k]; });
  return parts.join(", ").toLowerCase();
}

function buildVariantMap(componentSet) {
  var map = {};
  for (var i = 0; i < componentSet.children.length; i++) {
    var child = componentSet.children[i];
    if (child.type === "COMPONENT") {
      map[normalizeVariantKey(child.name)] = child;
    }
  }
  return map;
}

function findClosestVariant(variantMap, targetVariants) {
  var bestMatch = null;
  var bestScore = -1;
  var mapKeys = Object.keys(variantMap);

  for (var i = 0; i < mapKeys.length; i++) {
    var key = mapKeys[i];
    var score = 0;
    var targetKeys = Object.keys(targetVariants);
    for (var j = 0; j < targetKeys.length; j++) {
      var prop = targetKeys[j];
      var expected = (prop + "=" + targetVariants[prop]).toLowerCase();
      if (key.indexOf(expected) !== -1) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = variantMap[key];
    }
  }
  return bestMatch;
}

function findPropertyKey(componentProperties, targetName) {
  var keys = Object.keys(componentProperties);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var name = key.split("#")[0];
    if (name === targetName) return key;
  }
  if (componentProperties[targetName] !== undefined) return targetName;
  return null;
}

function setTextOverride(instance, textLayerName, value) {
  var textNodes = instance.findAll(function(n) {
    return n.type === "TEXT" && n.name === textLayerName;
  });
  for (var i = 0; i < textNodes.length; i++) {
    try { textNodes[i].characters = value; } catch (e) {}
  }
}

function setNestedTextOverrides(instance, parentName, overrides) {
  var parents = instance.findAll(function(n) {
    return n.name === parentName;
  });
  for (var p = 0; p < parents.length; p++) {
    var parent = parents[p];
    var overrideKeys = Object.keys(overrides);
    for (var k = 0; k < overrideKeys.length; k++) {
      var textName = overrideKeys[k];
      var textValue = overrides[textName];
      if (parent.findAll) {
        var textNodes = parent.findAll(function(n) {
          return n.type === "TEXT" && n.name === textName;
        });
        for (var t = 0; t < textNodes.length; t++) {
          try { textNodes[t].characters = textValue; } catch (e) {}
        }
      }
    }
  }
}

function setNestedInstanceVariant(parentInstance, childName, propName, propValue) {
  var children = parentInstance.findAll(function(n) {
    return n.name === childName && n.type === "INSTANCE";
  });
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    try {
      var props = child.componentProperties;
      var matchedKey = findPropertyKey(props, propName);
      if (matchedKey) {
        var obj = {};
        obj[matchedKey] = propValue;
        child.setProperties(obj);
      }
    } catch (e) {}
  }
}

function findIconComponent(iconName) {
  var patterns = [
    iconName,
    "Icon / " + iconName,
    "Icon/ " + iconName,
    "Icon/" + iconName
  ];
  var pages = figma.root.children;
  for (var p = 0; p < pages.length; p++) {
    for (var i = 0; i < patterns.length; i++) {
      var target = patterns[i].toLowerCase();
      var found = pages[p].findOne(function(n) {
        return n.type === "COMPONENT" && n.name.toLowerCase() === target;
      });
      if (found) return found;
    }
  }
  return null;
}

// ============================================================
// SECTION 6: RECURSIVE LAYOUT ENGINE (NEW)
// ============================================================

/**
 * Main recursive dispatcher — creates Figma nodes from spec tree
 */
async function renderNode(spec, parent) {
  if (!spec || !spec.type) return null;

  var node = null;
  switch (spec.type) {
    case "frame":
      node = await renderFrame(spec, parent);
      break;
    case "text":
      node = await renderText(spec, parent);
      break;
    case "component":
      node = await renderComponent(spec, parent);
      break;
    case "placeholder":
      node = await renderPlaceholder(spec, parent);
      break;
    case "separator":
      node = await renderSeparator(spec, parent);
      break;
    default:
      debugLog.push("Unknown node type: " + spec.type);
      return null;
  }

  return node;
}

/**
 * Create auto-layout frame + recursively render children
 */
async function renderFrame(spec, parent) {
  var frame = figma.createFrame();
  frame.name = spec.name || "Frame";

  // Apply layout mode on THIS frame first (so children can use FILL)
  applyLayout(frame, spec);
  applyPadding(frame, spec);
  applyGap(frame, spec);
  applyFill(frame, spec);
  applyStroke(frame, spec);
  applyRadius(frame, spec);
  applyAlignment(frame, spec);

  // Clip content if specified
  if (spec.clip === true) frame.clipsContent = true;

  // MUST append to parent BEFORE applySizing — FILL requires auto-layout parent
  if (parent) parent.appendChild(frame);
  applySizing(frame, spec);

  // Recursively render children
  if (spec.children && spec.children.length > 0) {
    for (var i = 0; i < spec.children.length; i++) {
      var childSpec = spec.children[i];
      var child = await renderNode(childSpec, frame);

      if (child) {
        // Apply child sizing relative to parent
        applyChildSizing(child, childSpec, spec);
      }
    }
  }

  return frame;
}

/**
 * Create styled text node
 */
async function renderText(spec, parent) {
  var textNode = figma.createText();
  textNode.name = spec.name || spec.content || "Text";

  // Load font first
  await loadFontSafe("Inter", "Regular");

  // Try to apply text style
  var textStyleName = spec.textStyle;
  if (textStyleName) {
    var st = findTextStyle(textStyleName);
    if (st) {
      if (st.fontName) {
        try { await figma.loadFontAsync(st.fontName); } catch (e) {}
      }
      try {
        await textNode.setTextStyleIdAsync(st.id);
      } catch (e) {
        // Fallback: apply font manually
        if (st.fontName) {
          try { textNode.fontName = st.fontName; } catch (e2) {}
        }
      }
    } else {
      // Try to infer font from style name
      var fontMap = {
        // SprouX defaults
        "heading 1": ["Geist", "Bold"],
        "heading 2": ["Geist", "SemiBold"],
        "heading 3": ["Geist", "SemiBold"],
        "paragraph regular/regular": ["Inter", "Regular"],
        "paragraph regular/medium": ["Inter", "Medium"],
        "paragraph regular/semibold": ["Inter", "SemiBold"],
        "paragraph small/regular": ["Inter", "Regular"],
        "paragraph small/semibold": ["Inter", "SemiBold"],
        "paragraph mini/regular": ["Inter", "Regular"],
        // ShopPulse SP headings (Plus Jakarta Sans)
        "sp-h1": ["Plus Jakarta Sans", "ExtraBold"],
        "sp-h2": ["Plus Jakarta Sans", "Bold"],
        "sp-h3": ["Plus Jakarta Sans", "Bold"],
        "sp-h4": ["Plus Jakarta Sans", "SemiBold"],
        "sp-h5": ["Plus Jakarta Sans", "SemiBold"],
        "sp / h1": ["Plus Jakarta Sans", "ExtraBold"],
        "sp / h2": ["Plus Jakarta Sans", "Bold"],
        "sp / h3": ["Plus Jakarta Sans", "Bold"],
        "sp / h4": ["Plus Jakarta Sans", "SemiBold"],
        "sp / h5": ["Plus Jakarta Sans", "SemiBold"],
        // ShopPulse SP body (Inter)
        "sp-body-lg": ["Inter", "Regular"],
        "sp-body": ["Inter", "Regular"],
        "sp-body-medium": ["Inter", "Medium"],
        "sp-body-semibold": ["Inter", "SemiBold"],
        "sp-label": ["Inter", "Medium"],
        "sp-label-uppercase": ["Inter", "SemiBold"],
        "sp-caption": ["Inter", "Regular"],
        "sp-overline": ["Inter", "SemiBold"],
        "sp / body lg": ["Inter", "Regular"],
        "sp / body": ["Inter", "Regular"],
        "sp / body medium": ["Inter", "Medium"],
        "sp / body semibold": ["Inter", "SemiBold"],
        "sp / label": ["Inter", "Medium"],
        "sp / label uc": ["Inter", "SemiBold"],
        "sp / caption": ["Inter", "Regular"],
        "sp / overline": ["Inter", "SemiBold"],
        // ShopPulse SP data (JetBrains Mono)
        "sp-kpi-hero": ["JetBrains Mono", "SemiBold"],
        "sp-kpi-lg": ["JetBrains Mono", "SemiBold"],
        "sp-kpi-md": ["JetBrains Mono", "Medium"],
        "sp-kpi-sm": ["JetBrains Mono", "Medium"],
        "sp-data": ["JetBrains Mono", "Regular"],
        "sp-data-sm": ["JetBrains Mono", "Regular"],
        "sp-order-id": ["JetBrains Mono", "Medium"],
        "sp / kpi hero": ["JetBrains Mono", "SemiBold"],
        "sp / kpi lg": ["JetBrains Mono", "SemiBold"],
        "sp / kpi md": ["JetBrains Mono", "Medium"],
        "sp / kpi sm": ["JetBrains Mono", "Medium"],
        "sp / data": ["JetBrains Mono", "Regular"],
        "sp / data sm": ["JetBrains Mono", "Regular"],
        "sp / order id": ["JetBrains Mono", "Medium"]
      };
      var fontInfo = fontMap[textStyleName.toLowerCase()];
      if (fontInfo) {
        var loaded = await loadFontSafe(fontInfo[0], fontInfo[1]);
        if (loaded) textNode.fontName = loaded;
      }

      // Apply font size fallback for sp-* styles when no Figma Text Style found
      var sizeMap = {
        "sp-h1": [36, 40], "sp-h2": [24, 32], "sp-h3": [20, 28],
        "sp-h4": [16, 24], "sp-h5": [14, 20],
        "sp-body-lg": [16, 24], "sp-body": [14, 20],
        "sp-body-medium": [14, 20], "sp-body-semibold": [14, 20],
        "sp-label": [12, 16], "sp-label-uppercase": [11, 16],
        "sp-caption": [12, 16], "sp-overline": [10, 12],
        "sp-kpi-hero": [48, 48], "sp-kpi-lg": [32, 36],
        "sp-kpi-md": [24, 28], "sp-kpi-sm": [20, 24],
        "sp-data": [14, 20], "sp-data-sm": [12, 16], "sp-order-id": [13, 20],
        "sp / h1": [36, 40], "sp / h2": [24, 32], "sp / h3": [20, 28],
        "sp / h4": [16, 24], "sp / h5": [14, 20],
        "sp / body lg": [16, 24], "sp / body": [14, 20],
        "sp / body medium": [14, 20], "sp / body semibold": [14, 20],
        "sp / label": [12, 16], "sp / label uc": [11, 16],
        "sp / caption": [12, 16], "sp / overline": [10, 12],
        "sp / kpi hero": [48, 48], "sp / kpi lg": [32, 36],
        "sp / kpi md": [24, 28], "sp / kpi sm": [20, 24],
        "sp / data": [14, 20], "sp / data sm": [12, 16], "sp / order id": [13, 20]
      };
      var sizeInfo = sizeMap[textStyleName.toLowerCase()];
      if (sizeInfo) {
        textNode.fontSize = sizeInfo[0];
        textNode.lineHeight = { value: sizeInfo[1], unit: "PIXELS" };
      }
    }
  }

  // Set text content
  if (spec.content) {
    textNode.characters = spec.content;
  }

  // Apply text color (ALWAYS separate from text style)
  if (spec.fill) {
    setTextFill(textNode, spec.fill);
  }

  // Apply font size override (if no text style)
  if (spec.fontSize) {
    textNode.fontSize = spec.fontSize;
  }

  // Text alignment
  if (spec.textAlign) {
    var alignMap = { "left": "LEFT", "center": "CENTER", "right": "RIGHT" };
    textNode.textAlignHorizontal = alignMap[spec.textAlign] || "LEFT";
  }

  // Retry text style via range if needed
  if (textStyleName && spec.content) {
    var st2 = findTextStyle(textStyleName);
    if (st2) {
      try {
        var checkId = textNode.textStyleId;
        if (!checkId || checkId === "" || checkId === figma.mixed) {
          await textNode.setRangeTextStyleIdAsync(0, textNode.characters.length, st2.id);
        }
      } catch (e) {}
    }
  }

  // MUST append to parent BEFORE setting sizing — FILL requires auto-layout parent
  if (parent) parent.appendChild(textNode);

  // Text sizing (after append)
  if (spec.sizing) {
    try {
      if (spec.sizing.width === "fill") {
        textNode.layoutSizingHorizontal = "FILL";
      }
      if (spec.sizing.width === "hug") {
        textNode.layoutSizingHorizontal = "HUG";
      }
    } catch (e) {}
  }

  return textNode;
}

/**
 * Create component instance with variant overrides
 */
async function renderComponent(spec, parent) {
  var setName = spec.componentSet || spec.component;
  if (!setName) {
    debugLog.push("Component spec missing componentSet/component name");
    return null;
  }

  var componentSet = findComponentSet(setName);
  if (!componentSet) {
    // Try as standalone component
    var standalone = findComponent(setName);
    if (standalone) {
      if (standalone.type === "COMPONENT") {
        var inst = standalone.createInstance();
        inst.name = spec.name || setName;
        applyComponentOverrides(inst, spec);
        if (parent) parent.appendChild(inst);
        applyChildSizing(inst, spec, null);
        return inst;
      }
      componentSet = standalone;
    } else {
      debugLog.push("Component set not found: " + setName);
      // Create placeholder instead
      return await renderPlaceholder({
        name: "[Missing: " + setName + "]",
        sizing: spec.sizing || { width: "fill", height: "fixed:48" },
        fill: "destructive",
        radius: "lg",
        label: "Component not found: " + setName
      }, parent);
    }
  }

  // Find matching variant
  var instance;
  if (spec.variants && Object.keys(spec.variants).length > 0) {
    var variantMap = buildVariantMap(componentSet);
    var targetKey = makeVariantKey(spec.variants);
    var matchedComponent = variantMap[targetKey];

    if (!matchedComponent) {
      matchedComponent = findClosestVariant(variantMap, spec.variants);
    }

    if (matchedComponent) {
      // Preload fonts from the component
      var textNodes = matchedComponent.findAll(function(n) { return n.type === "TEXT"; });
      for (var t = 0; t < textNodes.length; t++) {
        var fn = textNodes[t].fontName;
        if (fn && fn !== figma.mixed) {
          try { await figma.loadFontAsync(fn); } catch (e) {}
        }
      }
      instance = matchedComponent.createInstance();
    } else {
      instance = componentSet.children[0].createInstance();
      debugLog.push("No variant match for " + setName + " with " + targetKey + ", using first variant");
    }
  } else {
    // No variants specified — use default (first child)
    if (componentSet.children && componentSet.children.length > 0) {
      var defaultChild = componentSet.children[0];
      var textNodes2 = defaultChild.findAll(function(n) { return n.type === "TEXT"; });
      for (var t2 = 0; t2 < textNodes2.length; t2++) {
        var fn2 = textNodes2[t2].fontName;
        if (fn2 && fn2 !== figma.mixed) {
          try { await figma.loadFontAsync(fn2); } catch (e) {}
        }
      }
      instance = defaultChild.createInstance();
    } else {
      debugLog.push("Component set " + setName + " has no children");
      return null;
    }
  }

  instance.name = spec.name || setName;

  // Apply overrides
  await applyComponentOverrides(instance, spec);

  if (parent) parent.appendChild(instance);

  // Apply sizing
  applyChildSizing(instance, spec, null);

  return instance;
}

/**
 * Apply text, boolean, nested, icon overrides to a component instance
 */
async function applyComponentOverrides(instance, spec) {
  if (!spec.overrides && !spec.slots) return;

  var overrides = spec.overrides || {};

  // Text overrides
  if (overrides.text) {
    var textKeys = Object.keys(overrides.text);
    for (var i = 0; i < textKeys.length; i++) {
      setTextOverride(instance, textKeys[i], overrides.text[textKeys[i]]);
    }
  }

  // Slot overrides (shorthand for text in known slots)
  if (spec.slots) {
    var slotKeys = Object.keys(spec.slots);
    for (var s = 0; s < slotKeys.length; s++) {
      setTextOverride(instance, slotKeys[s], spec.slots[slotKeys[s]]);
    }
  }

  // Boolean overrides
  if (overrides.boolean) {
    var boolKeys = Object.keys(overrides.boolean);
    for (var b = 0; b < boolKeys.length; b++) {
      var boolKey = findPropertyKey(instance.componentProperties, boolKeys[b]);
      if (boolKey) {
        var obj = {};
        obj[boolKey] = overrides.boolean[boolKeys[b]];
        try { instance.setProperties(obj); } catch (e) {}
      }
    }
  }

  // Nested text overrides
  if (overrides.nested) {
    var nestedKeys = Object.keys(overrides.nested);
    for (var n = 0; n < nestedKeys.length; n++) {
      setNestedTextOverrides(instance, nestedKeys[n], overrides.nested[nestedKeys[n]]);
    }
  }

  // Nested variant overrides
  if (overrides.nestedVariants) {
    var nvKeys = Object.keys(overrides.nestedVariants);
    for (var nv = 0; nv < nvKeys.length; nv++) {
      var nvSpec = overrides.nestedVariants[nvKeys[nv]];
      var nvPropKeys = Object.keys(nvSpec);
      for (var nvp = 0; nvp < nvPropKeys.length; nvp++) {
        setNestedInstanceVariant(instance, nvKeys[nv], nvPropKeys[nvp], nvSpec[nvPropKeys[nvp]]);
      }
    }
  }

  // Icon swap
  if (overrides.iconSwap) {
    var iconKeys = Object.keys(overrides.iconSwap);
    for (var ic = 0; ic < iconKeys.length; ic++) {
      var iconName = overrides.iconSwap[iconKeys[ic]];
      var iconComp = findIconComponent(iconName);
      if (iconComp) {
        var iconInstances = instance.findAll(function(node) {
          return node.name === iconKeys[ic] && node.type === "INSTANCE";
        });
        for (var ii = 0; ii < iconInstances.length; ii++) {
          try { iconInstances[ii].swapComponent(iconComp); } catch (e) {}
        }
      }
    }
  }
}

/**
 * Create placeholder rectangle with centered label
 */
async function renderPlaceholder(spec, parent) {
  var frame = figma.createFrame();
  frame.name = spec.name || "Placeholder";

  // Layout for centering
  frame.layoutMode = "VERTICAL";
  frame.primaryAxisAlignItems = "CENTER";
  frame.counterAxisAlignItems = "CENTER";

  // Apply visual properties
  applyFill(frame, spec);
  applyStroke(frame, spec);
  applyRadius(frame, spec);

  // Default sizing
  var w = 400, h = 200;
  var widthIsFill = false;
  if (spec.sizing) {
    if (spec.sizing.width === "fill") {
      widthIsFill = true;
    } else if (spec.sizing.width && typeof spec.sizing.width === "string" && spec.sizing.width.indexOf("fixed:") === 0) {
      w = parseInt(spec.sizing.width.split(":")[1]);
    }
    if (spec.sizing.height && typeof spec.sizing.height === "string" && spec.sizing.height.indexOf("fixed:") === 0) {
      h = parseInt(spec.sizing.height.split(":")[1]);
    }
  }
  frame.resize(w, h);

  // Add label text
  if (spec.label) {
    await loadFontSafe("Inter", "Medium");
    var label = figma.createText();
    label.name = "Placeholder Label";
    var loaded = await loadFontSafe("Inter", "Medium");
    if (loaded) label.fontName = loaded;
    label.characters = spec.label;
    label.fontSize = 14;
    setTextFill(label, "muted-foreground");
    label.textAlignHorizontal = "CENTER";
    frame.appendChild(label);
  }

  // MUST append to parent BEFORE setting FILL sizing — requires auto-layout parent
  if (parent) parent.appendChild(frame);

  try {
    if (widthIsFill) {
      frame.layoutSizingHorizontal = "FILL";
    } else {
      frame.layoutSizingHorizontal = "FIXED";
    }
    frame.layoutSizingVertical = "FIXED";
  } catch (e) {
    // Fallback if parent is not auto-layout
  }

  return frame;
}

/**
 * Create 1px separator line
 */
async function renderSeparator(spec, parent) {
  var line = figma.createFrame();
  line.name = spec.name || "Separator";

  var direction = spec.direction || "horizontal";

  if (direction === "horizontal") {
    line.resize(100, 1);
  } else {
    line.resize(1, 100);
  }

  setFill(line, spec.fill || "border");

  // MUST append to parent BEFORE setting FILL sizing — requires auto-layout parent
  if (parent) parent.appendChild(line);

  try {
    if (direction === "horizontal") {
      line.layoutSizingHorizontal = "FILL";
      line.layoutSizingVertical = "FIXED";
    } else {
      line.layoutSizingHorizontal = "FIXED";
      line.layoutSizingVertical = "FILL";
    }
  } catch (e) {
    // Fallback: keep default sizing if parent is not auto-layout
  }

  return line;
}

// ============================================================
// SECTION 7: LAYOUT PROPERTY APPLIERS
// ============================================================

function applyLayout(frame, spec) {
  if (!spec.layout || spec.layout === "none") {
    frame.layoutMode = "NONE";
    return;
  }
  frame.layoutMode = spec.layout === "horizontal" ? "HORIZONTAL" : "VERTICAL";
  frame.layoutWrap = spec.wrap === true ? "WRAP" : "NO_WRAP";
}

function applySizing(frame, spec) {
  if (!spec.sizing) {
    try {
      frame.layoutSizingHorizontal = "HUG";
      frame.layoutSizingVertical = "HUG";
    } catch (e) {}
    return;
  }

  try {
    // Width
    if (spec.sizing.width === "fill") {
      frame.layoutSizingHorizontal = "FILL";
    } else if (spec.sizing.width === "hug") {
      frame.layoutSizingHorizontal = "HUG";
    } else if (typeof spec.sizing.width === "string" && spec.sizing.width.indexOf("fixed:") === 0) {
      var w = parseInt(spec.sizing.width.split(":")[1]);
      frame.resize(w, frame.height);
      frame.layoutSizingHorizontal = "FIXED";
    } else if (typeof spec.sizing.width === "number") {
      frame.resize(spec.sizing.width, frame.height);
      frame.layoutSizingHorizontal = "FIXED";
    }

    // Height
    if (spec.sizing.height === "fill") {
      frame.layoutSizingVertical = "FILL";
    } else if (spec.sizing.height === "hug") {
      frame.layoutSizingVertical = "HUG";
    } else if (typeof spec.sizing.height === "string" && spec.sizing.height.indexOf("fixed:") === 0) {
      var h = parseInt(spec.sizing.height.split(":")[1]);
      frame.resize(frame.width, h);
      frame.layoutSizingVertical = "FIXED";
    } else if (typeof spec.sizing.height === "number") {
      frame.resize(frame.width, spec.sizing.height);
      frame.layoutSizingVertical = "FIXED";
    }
  } catch (e) {
    debugLog.push("applySizing error on " + (frame.name || "unknown") + ": " + e.message);
  }
}

function applyPadding(frame, spec) {
  if (!spec.padding) return;

  if (typeof spec.padding === "string" || typeof spec.padding === "number") {
    // Single value for all sides
    var val = typeof spec.padding === "number" ? spec.padding : getSpacingValue(spec.padding);
    var tokenName = typeof spec.padding === "string" ? spec.padding : null;
    if (tokenName) {
      bindFloat(frame, "paddingTop", tokenName, val);
      bindFloat(frame, "paddingRight", tokenName, val);
      bindFloat(frame, "paddingBottom", tokenName, val);
      bindFloat(frame, "paddingLeft", tokenName, val);
    } else {
      frame.paddingTop = val;
      frame.paddingRight = val;
      frame.paddingBottom = val;
      frame.paddingLeft = val;
    }
    return;
  }

  if (spec.padding.all) {
    var allVal = getSpacingValue(spec.padding.all);
    bindFloat(frame, "paddingTop", spec.padding.all, allVal);
    bindFloat(frame, "paddingRight", spec.padding.all, allVal);
    bindFloat(frame, "paddingBottom", spec.padding.all, allVal);
    bindFloat(frame, "paddingLeft", spec.padding.all, allVal);
  }
  if (spec.padding.x) {
    var xVal = getSpacingValue(spec.padding.x);
    bindFloat(frame, "paddingRight", spec.padding.x, xVal);
    bindFloat(frame, "paddingLeft", spec.padding.x, xVal);
  }
  if (spec.padding.y) {
    var yVal = getSpacingValue(spec.padding.y);
    bindFloat(frame, "paddingTop", spec.padding.y, yVal);
    bindFloat(frame, "paddingBottom", spec.padding.y, yVal);
  }
  if (spec.padding.top) {
    bindFloat(frame, "paddingTop", spec.padding.top, getSpacingValue(spec.padding.top));
  }
  if (spec.padding.right) {
    bindFloat(frame, "paddingRight", spec.padding.right, getSpacingValue(spec.padding.right));
  }
  if (spec.padding.bottom) {
    bindFloat(frame, "paddingBottom", spec.padding.bottom, getSpacingValue(spec.padding.bottom));
  }
  if (spec.padding.left) {
    bindFloat(frame, "paddingLeft", spec.padding.left, getSpacingValue(spec.padding.left));
  }
}

function applyGap(frame, spec) {
  if (!spec.gap) return;
  var gapVal = getSpacingValue(spec.gap);
  if (typeof spec.gap === "string") {
    bindFloat(frame, "itemSpacing", spec.gap, gapVal);
  } else {
    frame.itemSpacing = gapVal;
  }
}

function applyFill(node, spec) {
  if (!spec.fill) {
    node.fills = [];
    return;
  }
  if (spec.fillOpacity !== undefined) {
    setFillWithOpacity(node, spec.fill, spec.fillOpacity);
  } else {
    setFill(node, spec.fill);
  }
}

function applyStroke(node, spec) {
  if (!spec.stroke) return;
  setStroke(node, spec.stroke);
  node.strokeWeight = spec.strokeWeight || 1;

  // Stroke alignment
  if (spec.strokeAlign) {
    node.strokeAlign = spec.strokeAlign === "inside" ? "INSIDE" : spec.strokeAlign === "outside" ? "OUTSIDE" : "CENTER";
  }
}

function applyRadius(frame, spec) {
  if (!spec.radius) return;

  if (typeof spec.radius === "string" || typeof spec.radius === "number") {
    var val = typeof spec.radius === "number" ? spec.radius : getRadiusValue(spec.radius);
    var token = typeof spec.radius === "string" ? spec.radius : null;
    if (token) {
      bindFloat(frame, "topLeftRadius", token, val);
      bindFloat(frame, "topRightRadius", token, val);
      bindFloat(frame, "bottomLeftRadius", token, val);
      bindFloat(frame, "bottomRightRadius", token, val);
    } else {
      frame.topLeftRadius = val;
      frame.topRightRadius = val;
      frame.bottomLeftRadius = val;
      frame.bottomRightRadius = val;
    }
  }
}

function applyAlignment(frame, spec) {
  if (!spec.align) return;

  // Primary axis (direction of flow)
  if (spec.align.justify) {
    var justifyMap = {
      "start": "MIN", "center": "CENTER", "end": "MAX", "space-between": "SPACE_BETWEEN"
    };
    frame.primaryAxisAlignItems = justifyMap[spec.align.justify] || "MIN";
  }

  // Counter axis (perpendicular to flow)
  if (spec.align.counter) {
    var counterMap = { "start": "MIN", "center": "CENTER", "end": "MAX", "baseline": "BASELINE" };
    frame.counterAxisAlignItems = counterMap[spec.align.counter] || "MIN";
  }
}

/**
 * Apply sizing to a child node relative to its parent
 */
function applyChildSizing(child, childSpec, parentSpec) {
  if (!childSpec || !childSpec.sizing) return;

  try {
    if (childSpec.sizing.width === "fill") {
      child.layoutSizingHorizontal = "FILL";
    } else if (childSpec.sizing.width === "hug") {
      child.layoutSizingHorizontal = "HUG";
    } else if (typeof childSpec.sizing.width === "string" && childSpec.sizing.width.indexOf("fixed:") === 0) {
      var w = parseInt(childSpec.sizing.width.split(":")[1]);
      child.resize(w, child.height);
      child.layoutSizingHorizontal = "FIXED";
    }

    if (childSpec.sizing.height === "fill") {
      child.layoutSizingVertical = "FILL";
    } else if (childSpec.sizing.height === "hug") {
      child.layoutSizingVertical = "HUG";
    } else if (typeof childSpec.sizing.height === "string" && childSpec.sizing.height.indexOf("fixed:") === 0) {
      var h = parseInt(childSpec.sizing.height.split(":")[1]);
      child.resize(child.width, h);
      child.layoutSizingVertical = "FIXED";
    }
  } catch (e) {
    // Instance nodes may not support resize
  }
}

// ============================================================
// SECTION 8: PAGE MANAGEMENT
// ============================================================

/**
 * Main entry point — generate a full page from JSON spec
 */
async function doGenerate(specInput) {
  var spec;
  if (typeof specInput === "string") {
    try {
      spec = JSON.parse(specInput);
    } catch (e) {
      return { success: false, error: "Invalid JSON: " + e.message };
    }
  } else if (typeof specInput === "object" && specInput !== null) {
    spec = specInput;
  } else {
    return { success: false, error: "Invalid spec: expected JSON string or object" };
  }

  // Support both `root` (single) and `roots` (array)
  var rootSpecs = [];
  if (spec.roots && Array.isArray(spec.roots)) {
    rootSpecs = spec.roots;
  } else if (spec.root) {
    rootSpecs = [spec.root];
  } else {
    return { success: false, error: "Spec missing 'root' or 'roots' node" };
  }

  // Initialize caches
  await loadCaches();
  await preloadCommonFonts();

  var pageName = spec.pageName || "Generated Page";
  debugLog.push("Generating page: " + pageName + " (" + rootSpecs.length + " frame(s))");

  // Create or find page
  var page = null;
  var pages = figma.root.children;
  for (var p = 0; p < pages.length; p++) {
    if (pages[p].name === "[Gen] " + pageName) {
      page = pages[p];
      // Clear existing content
      while (page.children.length > 0) {
        page.children[0].remove();
      }
      break;
    }
  }
  if (!page) {
    page = figma.createPage();
    page.name = "[Gen] " + pageName;
  }

  // Switch to the new page
  await figma.setCurrentPageAsync(page);

  var startTime = Date.now();
  var gap = (spec.layout && spec.layout.gap) || 100;
  var allNodes = [];
  var currentX = 0;

  // Render section label if provided
  if (spec.sectionLabel) {
    try {
      await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    } catch (e) {}
    var label = figma.createText();
    label.characters = spec.sectionLabel;
    try { label.fontName = { family: "Inter", style: "Bold" }; } catch (e) {}
    label.fontSize = 32;
    label.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.5 }];
    label.x = 0;
    label.y = -60;
    page.appendChild(label);
  }

  // Render each root
  for (var ri = 0; ri < rootSpecs.length; ri++) {
    var rootNode = await renderNode(rootSpecs[ri], null);
    if (rootNode) {
      page.appendChild(rootNode);
      rootNode.x = currentX;
      rootNode.y = 0;
      currentX += rootNode.width + gap;
      allNodes.push(rootNode);
    }
  }

  if (allNodes.length > 0) {
    figma.viewport.scrollAndZoomIntoView(allNodes);
  }

  var elapsed = Date.now() - startTime;
  debugLog.push("Generation complete: " + allNodes.length + " frame(s) in " + elapsed + "ms");

  return {
    success: true,
    pageName: pageName,
    elapsed: elapsed,
    log: debugLog
  };
}

/**
 * Remove all generated pages (prefixed with "[Gen]")
 */
function doClear() {
  var removed = 0;
  var pages = figma.root.children;
  for (var i = pages.length - 1; i >= 0; i--) {
    if (pages[i].name.indexOf("[Gen] ") === 0) {
      pages[i].remove();
      removed++;
    }
  }
  return { success: true, removed: removed };
}

// ============================================================
// SECTION 9: FOUNDATION — CREATE VARIABLES
// ============================================================

function hexToRgb01(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  return {
    r: parseInt(hex.substring(0, 2), 16) / 255,
    g: parseInt(hex.substring(2, 4), 16) / 255,
    b: parseInt(hex.substring(4, 6), 16) / 255
  };
}

function parseRgba(str) {
  var m = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (!m) return null;
  return { r: parseFloat(m[1]) / 255, g: parseFloat(m[2]) / 255, b: parseFloat(m[3]) / 255, a: m[4] !== undefined ? parseFloat(m[4]) : 1 };
}

function parseColor(val) {
  if (!val) return null;
  if (typeof val === "object" && val.r !== undefined) return val;
  if (typeof val === "string") {
    if (val.startsWith("#")) {
      var rgb = hexToRgb01(val);
      // handle 8-char hex with alpha
      if (val.replace("#","").length === 8) {
        var alphaHex = val.replace("#","").substring(6, 8);
        rgb.a = parseInt(alphaHex, 16) / 255;
      }
      return rgb;
    }
    if (val.startsWith("rgb")) return parseRgba(val);
  }
  return null;
}

async function doCreateVariables(spec) {
  var log = [];
  var startTime = Date.now();
  var collections = spec.collections;
  if (!collections || !collections.length) {
    return { success: false, error: "No collections found in spec" };
  }

  var createdVars = 0;
  var createdCollections = 0;

  // GLOBAL lookup for cross-collection alias resolution
  var globalVarLookup = {};
  var collectionData = []; // store {col, modeMap, variables} per collection

  // PASS 1: Create all collections + all variables (no values yet)
  for (var ci = 0; ci < collections.length; ci++) {
    var colSpec = collections[ci];
    log.push("Creating collection: " + colSpec.name);

    var col = figma.variables.createVariableCollection(colSpec.name);
    createdCollections++;

    // Setup modes
    var modeMap = {};
    var existingMode = col.modes[0];

    if (colSpec.modes && colSpec.modes.length > 0) {
      col.renameMode(existingMode.modeId, colSpec.modes[0]);
      modeMap[colSpec.modes[0]] = existingMode.modeId;

      for (var mi = 1; mi < colSpec.modes.length; mi++) {
        var newModeId = col.addMode(colSpec.modes[mi]);
        modeMap[colSpec.modes[mi]] = newModeId;
      }
    } else {
      modeMap["default"] = existingMode.modeId;
    }

    var variables = colSpec.variables || [];

    for (var vi = 0; vi < variables.length; vi++) {
      var vs = variables[vi];
      var varType = (vs.type || "COLOR").toUpperCase();
      var v = figma.variables.createVariable(vs.name, col, varType);

      // Apply scopes: collection-level or variable-level
      // scopes=[] hides from all pickers (raw colors), scopes omitted = ALL_SCOPES (default)
      var _scopes = vs.scopes !== undefined ? vs.scopes : colSpec.scopes;
      if (_scopes !== undefined) {
        try { v.scopes = _scopes; } catch (e) {}
      }

      // hiddenFromPublishing: hide variable from team library
      if (vs.hiddenFromPublishing !== undefined) {
        try { v.hiddenFromPublishing = vs.hiddenFromPublishing; } catch (e) {}
      } else if (colSpec.hiddenFromPublishing !== undefined) {
        try { v.hiddenFromPublishing = colSpec.hiddenFromPublishing; } catch (e) {}
      }

      // Register in global lookup with FULL path: "collectionName/varName"
      var fullKey = (colSpec.name + "/" + vs.name).toLowerCase();
      globalVarLookup[fullKey] = v;

      // Also register short name (for same-collection references)
      var shortKey = vs.name.toLowerCase();
      if (!globalVarLookup[shortKey]) globalVarLookup[shortKey] = v;

      createdVars++;
    }

    collectionData.push({ col: col, modeMap: modeMap, variables: variables, specVars: colSpec.variables, colName: colSpec.name });
  }

  log.push("Pass 1 done: " + createdVars + " variables created. Setting values...");

  // PASS 2: Set all values (now global lookup has everything for alias resolution)
  for (var ci2 = 0; ci2 < collectionData.length; ci2++) {
    var cd = collectionData[ci2];
    var variables2 = cd.specVars || [];

    for (var vi2 = 0; vi2 < variables2.length; vi2++) {
      var vs2 = variables2[vi2];
      // Use FULL key (collectionName/varName) to avoid cross-collection collisions
      var varKey = (cd.colName + "/" + vs2.name).toLowerCase();
      var variable = globalVarLookup[varKey];
      if (!variable) continue;

      var values = vs2.values || {};
      var keys = Object.keys(values);

      for (var ki = 0; ki < keys.length; ki++) {
        var modeName = keys[ki];
        var modeId = cd.modeMap[modeName] || cd.modeMap["default"];
        if (!modeId) continue;

        var val = values[modeName];

        // Check if alias reference (e.g. "$raw colors/violet/600")
        if (typeof val === "string" && val.startsWith("$")) {
          var aliasName = val.substring(1).toLowerCase();
          var aliasVar = globalVarLookup[aliasName];
          if (aliasVar) {
            variable.setValueForMode(modeId, { type: "VARIABLE_ALIAS", id: aliasVar.id });
          } else {
            log.push("  WARN: alias not found: " + val + " (looked up: " + aliasName + ")");
          }
          continue;
        }

        // Set direct value based on type
        var varType2 = (vs2.type || "COLOR").toUpperCase();
        if (varType2 === "COLOR") {
          var color = parseColor(val);
          if (color) {
            variable.setValueForMode(modeId, color);
          }
        } else if (varType2 === "FLOAT") {
          variable.setValueForMode(modeId, typeof val === "number" ? val : parseFloat(val));
        } else if (varType2 === "STRING") {
          variable.setValueForMode(modeId, String(val));
        }
      }
    }

  }

  var elapsed = Date.now() - startTime;
  log.push("Done! " + createdCollections + " collections, " + createdVars + " variables in " + elapsed + "ms");

  return {
    success: true,
    message: createdCollections + " collections, " + createdVars + " variables created",
    elapsed: elapsed,
    log: log
  };
}

// ============================================================
// SECTION 10: FOUNDATION — CREATE TEXT STYLES
// ============================================================

async function doCreateTextStyles(spec) {
  var log = [];
  var startTime = Date.now();
  var styles = spec.styles;
  if (!styles || !styles.length) {
    return { success: false, error: "No styles found in spec" };
  }

  var created = 0;

  for (var si = 0; si < styles.length; si++) {
    var s = styles[si];

    // Load font using loadFontSafe (handles SemiBold → Semi Bold etc.)
    var fontFamily = s.fontFamily || "Inter";
    var fontStyle = s.fontStyle || "Regular";

    var loaded = await loadFontSafe(fontFamily, fontStyle);
    if (loaded) {
      fontFamily = loaded.family;
      fontStyle = loaded.style;
    } else {
      log.push("WARN: Could not load " + fontFamily + " " + fontStyle + ", falling back to Inter Regular");
      fontFamily = "Inter";
      fontStyle = "Regular";
      await loadFontSafe("Inter", "Regular");
    }

    var textStyle = figma.createTextStyle();
    textStyle.name = s.name;
    textStyle.fontName = { family: fontFamily, style: fontStyle };
    textStyle.fontSize = s.fontSize || 14;

    if (s.lineHeight) {
      textStyle.lineHeight = { value: s.lineHeight, unit: "PIXELS" };
    }
    if (s.letterSpacing) {
      // Convert em to percent if needed
      if (typeof s.letterSpacing === "string" && s.letterSpacing.endsWith("em")) {
        var emVal = parseFloat(s.letterSpacing);
        textStyle.letterSpacing = { value: emVal * 100, unit: "PERCENT" };
      } else {
        textStyle.letterSpacing = { value: parseFloat(s.letterSpacing), unit: "PIXELS" };
      }
    }
    if (s.textCase) {
      textStyle.textCase = s.textCase; // "UPPER", "LOWER", "TITLE", "ORIGINAL"
    }

    created++;
    log.push("Created text style: " + s.name + " (" + fontFamily + " " + fontStyle + " " + (s.fontSize || 14) + "px)");
  }

  var elapsed = Date.now() - startTime;
  log.push("Done! " + created + " text styles in " + elapsed + "ms");

  return {
    success: true,
    message: created + " text styles created",
    elapsed: elapsed,
    log: log
  };
}

// ============================================================
// SECTION 11: FOUNDATION — CREATE EFFECT STYLES
// ============================================================

async function doCreateEffectStyles(spec) {
  var log = [];
  var startTime = Date.now();
  var styles = spec.styles;
  if (!styles || !styles.length) {
    return { success: false, error: "No styles found in spec" };
  }

  var created = 0;

  for (var si = 0; si < styles.length; si++) {
    var s = styles[si];

    // Build effects array BEFORE creating the style (avoid orphan on error)
    var effects = [];
    var layers = s.effects || [];

    for (var ei = 0; ei < layers.length; ei++) {
      var e = layers[ei];
      var effect;

      if (e.type === "LAYER_BLUR" || e.type === "BACKGROUND_BLUR") {
        effect = {
          type: e.type,
          visible: true,
          radius: e.radius || 0
        };
      } else {
        // Shadow type (DROP_SHADOW, INNER_SHADOW) — blendMode required
        var color = parseColor(e.color) || { r: 0, g: 0, b: 0 };
        if (e.alpha !== undefined) color.a = e.alpha;
        else if (color.a === undefined) color.a = 0.25;

        effect = {
          type: e.type || "DROP_SHADOW",
          visible: true,
          blendMode: "NORMAL",
          color: color,
          offset: { x: e.x || 0, y: e.y || 0 },
          radius: e.radius || 0,
          spread: e.spread || 0
        };
      }

      effects.push(effect);
    }

    // Only create the style after effects are valid
    var effectStyle = figma.createEffectStyle();
    effectStyle.name = s.name;
    effectStyle.effects = effects;
    created++;
    log.push("Created effect style: " + s.name + " (" + layers.length + " layers)");
  }

  var elapsed = Date.now() - startTime;
  log.push("Done! " + created + " effect styles in " + elapsed + "ms");

  return {
    success: true,
    message: created + " effect styles created",
    elapsed: elapsed,
    log: log
  };
}

// ============================================================
// SECTION 11A: FOUNDATION — CREATE ICONS
// ============================================================

/**
 * Create Lucide-style icon Components from SVG strings.
 * Each icon = standalone Component "Icon / {name}" with stroke bound to foreground variable.
 * Also creates a showcase frame with all icons in a grid + labels.
 *
 * JSON: { type: "foundation-icons", targetPage: "🧩 Components", size: 24,
 *         icons: [{ name: "Search", svg: "<svg ...>...</svg>" }, ...] }
 */
async function doCreateIcons(spec) {
  var log = [];
  var startTime = Date.now();
  await loadCaches();
  await preloadCommonFonts();

  var icons = spec.icons;
  if (!icons || !icons.length) return { success: false, error: "No icons found in spec" };

  var targetPage = figma.currentPage;
  if (spec.targetPage) {
    for (var i = 0; i < figma.root.children.length; i++) {
      if (figma.root.children[i].name === spec.targetPage) { targetPage = figma.root.children[i]; break; }
    }
  }
  await figma.setCurrentPageAsync(targetPage);

  var size = spec.size || 24;
  var created = 0;
  var iconComps = [];

  for (var i = 0; i < icons.length; i++) {
    var iconSpec = icons[i];
    try {
      var svgFrame = figma.createNodeFromSvg(iconSpec.svg);

      // Create Component wrapper
      var comp = figma.createComponent();
      comp.name = "Icon / " + iconSpec.name;
      comp.resize(size, size);
      comp.clipsContent = false;
      comp.fills = [];
      comp.constraints = { horizontal: "SCALE", vertical: "SCALE" };

      // Move SVG children into component
      while (svgFrame.children.length > 0) {
        comp.appendChild(svgFrame.children[0]);
      }
      svgFrame.remove();

      // Bind all vector strokes to "foreground" variable
      var fgVar = findVar("foreground");
      if (fgVar) {
        var vectors = comp.findAll(function(n) {
          return n.type === "VECTOR" || n.type === "LINE" || n.type === "ELLIPSE"
            || n.type === "RECTANGLE" || n.type === "POLYGON" || n.type === "STAR"
            || n.type === "BOOLEAN_OPERATION";
        });
        for (var v = 0; v < vectors.length; v++) {
          var vec = vectors[v];
          // Stroke → foreground
          if (vec.strokes && vec.strokes.length > 0) {
            vec.strokes = [makeBoundPaint(fgVar)];
          }
          // Fill → foreground (for filled parts like circles)
          if (vec.fills && vec.fills.length > 0) {
            var hasFill = false;
            for (var f = 0; f < vec.fills.length; f++) {
              if (vec.fills[f].type === "SOLID" && vec.fills[f].opacity !== 0) hasFill = true;
            }
            if (hasFill) vec.fills = [makeBoundPaint(fgVar)];
          }
        }
      }

      targetPage.appendChild(comp);
      iconComps.push(comp);
      created++;
    } catch (err) {
      log.push("WARN: Icon '" + iconSpec.name + "' failed: " + err.message);
    }
  }

  log.push("Created " + created + "/" + icons.length + " icon components");

  // --- Build Icon Showcase ---
  var showcase = figma.createFrame();
  showcase.name = "Icons — Showcase";
  showcase.layoutMode = "VERTICAL";
  showcase.resize(1440, 100);
  showcase.layoutSizingHorizontal = "FIXED";
  showcase.layoutSizingVertical = "HUG";
  showcase.paddingTop = 80; showcase.paddingRight = 80;
  showcase.paddingBottom = 80; showcase.paddingLeft = 80;
  showcase.itemSpacing = 48;
  setFill(showcase, "background");
  showcase.clipsContent = false;

  // Header
  var header = figma.createFrame();
  header.name = "Header"; header.layoutMode = "VERTICAL"; header.itemSpacing = 12;
  header.fills = []; header.clipsContent = false;
  showcase.appendChild(header);
  try { header.layoutSizingHorizontal = "FILL"; header.layoutSizingVertical = "HUG"; } catch (e) {}
  await _makeLabel("Icons", "SP/H1", "foreground", header);
  await _makeLabel("Lucide icon set — " + created + " icons, " + size + "×" + size + "px, stroke bound to foreground variable. Supports Light/Dark mode.", "SP/Body LG", "muted-foreground", header);

  // Separator
  _makeSep(showcase);

  // Icon grid: wrap in rows with labels
  var gridFrame = figma.createFrame();
  gridFrame.name = "Icon Grid";
  gridFrame.layoutMode = "HORIZONTAL";
  gridFrame.layoutWrap = "WRAP";
  gridFrame.itemSpacing = 8;
  gridFrame.counterAxisSpacing = 8;
  gridFrame.fills = [];
  gridFrame.clipsContent = false;
  showcase.appendChild(gridFrame);
  try { gridFrame.layoutSizingHorizontal = "FILL"; gridFrame.layoutSizingVertical = "HUG"; } catch (e) {}

  for (var ic = 0; ic < iconComps.length; ic++) {
    // Card: icon component (gốc) + label
    var card = figma.createFrame();
    card.name = iconComps[ic].name.replace("Icon / ", "");
    card.layoutMode = "VERTICAL";
    card.itemSpacing = 6;
    card.counterAxisAlignItems = "CENTER";
    card.primaryAxisAlignItems = "CENTER";
    card.paddingTop = 12; card.paddingBottom = 8;
    card.paddingLeft = 8; card.paddingRight = 8;
    card.resize(80, 60);
    card.layoutSizingHorizontal = "FIXED";
    card.layoutSizingVertical = "HUG";
    setFill(card, "card");
    card.topLeftRadius = 8; card.topRightRadius = 8;
    card.bottomLeftRadius = 8; card.bottomRightRadius = 8;
    gridFrame.appendChild(card);

    // Move the actual Component (gốc) into the card — NOT an instance
    card.appendChild(iconComps[ic]);

    // Label
    await _makeLabel(icons[ic].name, "SP/Caption", "muted-foreground", card);
  }

  targetPage.appendChild(showcase);
  showcase.x = 0; showcase.y = 0;

  figma.viewport.scrollAndZoomIntoView([showcase]);

  var elapsed = Date.now() - startTime;
  log.push("Done! " + created + " icons + showcase in " + elapsed + "ms");
  return { success: true, message: created + " icons + showcase created", elapsed: elapsed, log: log };
}

// ============================================================
// SECTION 11B: FOUNDATION — CREATE COMPONENTS + SHOWCASE
// ============================================================

// --- Showcase helpers ---
async function _makeLabel(text, styleName, fillName, parent) {
  var node = figma.createText();
  await loadFontSafe("Inter", "Regular");
  var st = findTextStyle(styleName);
  if (st && st.fontName) {
    try { await figma.loadFontAsync(st.fontName); } catch(e) {}
    try { await node.setTextStyleIdAsync(st.id); } catch(e) {}
  } else {
    // Fallback font by style name
    var fm = { "SP/H1": ["Plus Jakarta Sans","ExtraBold",36], "SP/H2": ["Plus Jakarta Sans","Bold",24],
      "SP/H3": ["Plus Jakarta Sans","Bold",20], "SP/H4": ["Plus Jakarta Sans","SemiBold",16],
      "SP/Body": ["Inter","Regular",14], "SP/Body LG": ["Inter","Regular",16],
      "SP/Body Semibold": ["Inter","SemiBold",14], "SP/Label": ["Inter","Medium",12],
      "SP/Caption": ["Inter","Regular",12], "SP/Overline": ["Inter","SemiBold",10] };
    var fi = fm[styleName];
    if (fi) { var ld = await loadFontSafe(fi[0], fi[1]); if (ld) node.fontName = ld; node.fontSize = fi[2]; }
  }
  node.characters = text;
  if (fillName) setTextFill(node, fillName);
  if (parent) parent.appendChild(node);
  return node;
}

function _makeFrame(name, dir, gap, parent) {
  var f = figma.createFrame();
  f.name = name;
  f.layoutMode = dir === "h" ? "HORIZONTAL" : "VERTICAL";
  f.itemSpacing = gap || 0;
  f.fills = [];
  f.clipsContent = false;
  if (parent) {
    parent.appendChild(f);
    try { f.layoutSizingHorizontal = "FILL"; } catch (e) { f.layoutSizingHorizontal = "HUG"; }
  }
  try { f.layoutSizingVertical = "HUG"; } catch (e) {}
  return f;
}

function _makeSep(parent) {
  var s = figma.createFrame();
  s.name = "Divider";
  s.resize(100, 1);
  setFill(s, "border");
  if (parent) {
    parent.appendChild(s);
    try { s.layoutSizingHorizontal = "FILL"; s.layoutSizingVertical = "FIXED"; } catch (e) {}
  }
  return s;
}

function _makePill(text, parent) {
  var pill = figma.createFrame();
  pill.name = text;
  pill.layoutMode = "HORIZONTAL";
  pill.primaryAxisAlignItems = "CENTER";
  pill.counterAxisAlignItems = "CENTER";
  pill.paddingLeft = 12; pill.paddingRight = 12;
  pill.paddingTop = 4; pill.paddingBottom = 4;
  setFill(pill, "card");
  pill.topLeftRadius = 9999; pill.topRightRadius = 9999;
  pill.bottomLeftRadius = 9999; pill.bottomRightRadius = 9999;
  if (parent) parent.appendChild(pill);
  pill.layoutSizingHorizontal = "HUG"; pill.layoutSizingVertical = "HUG";
  return pill;
}

function _getInstance(componentSet, variantProps) {
  var map = buildVariantMap(componentSet);
  var key = makeVariantKey(variantProps);
  var match = map[key] || findClosestVariant(map, variantProps);
  if (match) return match.createInstance();
  if (componentSet.children && componentSet.children.length > 0) return componentSet.children[0].createInstance();
  return null;
}

async function _getInstanceWithLabel(componentSet, variantProps, labelText, parent) {
  var inst = _getInstance(componentSet, variantProps);
  if (!inst) return null;
  if (labelText) {
    // Preload fonts from instance
    var tns = inst.findAll(function(n) { return n.type === "TEXT"; });
    for (var t = 0; t < tns.length; t++) {
      if (tns[t].fontName && tns[t].fontName !== figma.mixed) {
        try { await figma.loadFontAsync(tns[t].fontName); } catch(e) {}
      }
    }
    setTextOverride(inst, "Label", labelText);
  }
  if (parent) parent.appendChild(inst);
  return inst;
}

// --- Main: Create ComponentSet + Showcase ---

async function doCreateComponents(spec) {
  var log = [];
  var startTime = Date.now();
  await loadCaches();
  await preloadCommonFonts();

  var components = spec.components;
  if (!components || !components.length) return { success: false, error: "No components found in spec" };

  var targetPageName = spec.targetPage || null;
  var targetPage = null;
  if (targetPageName) {
    for (var pi = 0; pi < figma.root.children.length; pi++) {
      if (figma.root.children[pi].name === targetPageName) { targetPage = figma.root.children[pi]; break; }
    }
  }
  if (!targetPage) targetPage = figma.currentPage;
  await figma.setCurrentPageAsync(targetPage);

  var createdSets = 0, createdVariants = 0;
  var _showcaseXOffset = 0; // horizontal alignment with 100px gap

  for (var ci = 0; ci < components.length; ci++) {
    var compSpec = components[ci];
    var compName = compSpec.name || "Component";
    var properties = compSpec.properties || {};
    var base = compSpec.base || {};
    var variantStyles = compSpec.variantStyles || {};
    var propNames = Object.keys(properties);

    log.push("Creating: " + compName);

    // --- 1. Build variant combinations ---
    var combos = [{}];
    for (var pn = 0; pn < propNames.length; pn++) {
      var vals = properties[propNames[pn]];
      var next = [];
      for (var cc = 0; cc < combos.length; cc++) {
        for (var pv = 0; pv < vals.length; pv++) {
          var nc = {}; var ek = Object.keys(combos[cc]);
          for (var e = 0; e < ek.length; e++) nc[ek[e]] = combos[cc][ek[e]];
          nc[propNames[pn]] = vals[pv]; next.push(nc);
        }
      }
      combos = next;
    }
    log.push("  " + combos.length + " variants");

    // --- 2. Create each Component variant ---
    var varComps = [];
    for (var vi = 0; vi < combos.length; vi++) {
      var combo = combos[vi];
      var vname = [];
      for (var np = 0; np < propNames.length; np++) vname.push(propNames[np] + "=" + combo[propNames[np]]);

      var merged = mergeComponentStyles(base, combo, variantStyles, propNames);
      var comp = figma.createComponent();
      comp.name = vname.join(", ");

      // Layout
      comp.layoutMode = (merged.layout || "horizontal") === "horizontal" ? "HORIZONTAL" : "VERTICAL";
      comp.primaryAxisAlignItems = "CENTER";
      comp.counterAxisAlignItems = "CENTER";

      // Gap — bind to spacing/* variable
      var gapR = merged.gap !== undefined ? merged.gap : 8;
      if (typeof gapR === "string") {
        comp.itemSpacing = getSpacingValue(gapR);
        var gapVarName = gapR.indexOf("/") !== -1 ? gapR : "spacing/" + gapR;
        bindFloat(comp, "itemSpacing", gapVarName, comp.itemSpacing);
      } else comp.itemSpacing = gapR;

      // Size
      comp.resize(merged.width || 120, merged.height || 36);
      comp.layoutSizingHorizontal = merged.widthMode === "hug" ? "HUG" : "FIXED";
      comp.layoutSizingVertical = "FIXED";

      // Padding — bind to spacing/* variable (NOT border radius)
      var pxR = merged.paddingX !== undefined ? merged.paddingX : "md";
      var pyR = merged.paddingY !== undefined ? merged.paddingY : "xs";
      if (typeof pxR === "string") {
        var pxV = getSpacingValue(pxR);
        var pxVarName = pxR.indexOf("/") !== -1 ? pxR : "spacing/" + pxR;
        comp.paddingLeft = pxV; comp.paddingRight = pxV;
        bindFloat(comp, "paddingLeft", pxVarName, pxV);
        bindFloat(comp, "paddingRight", pxVarName, pxV);
      } else { comp.paddingLeft = pxR; comp.paddingRight = pxR; }
      if (typeof pyR === "string") {
        var pyV = getSpacingValue(pyR);
        var pyVarName = pyR.indexOf("/") !== -1 ? pyR : "spacing/" + pyR;
        comp.paddingTop = pyV; comp.paddingBottom = pyV;
        bindFloat(comp, "paddingTop", pyVarName, pyV);
        bindFloat(comp, "paddingBottom", pyVarName, pyV);
      } else { comp.paddingTop = pyR; comp.paddingBottom = pyR; }

      // Radius — bind to border radius/* variable
      var rad = merged.radius !== undefined ? merged.radius : 8;
      if (typeof rad === "string") {
        var rv = getRadiusValue(rad);
        comp.topLeftRadius = rv; comp.topRightRadius = rv; comp.bottomLeftRadius = rv; comp.bottomRightRadius = rv;
        var radVarName = rad.indexOf("/") !== -1 ? rad : "border radius/" + rad;
        var rVar = findVar(radVarName);
        if (rVar) { try { comp.setBoundVariable("topLeftRadius",rVar); comp.setBoundVariable("topRightRadius",rVar); comp.setBoundVariable("bottomLeftRadius",rVar); comp.setBoundVariable("bottomRightRadius",rVar); } catch(e){} }
      } else { comp.topLeftRadius = rad; comp.topRightRadius = rad; comp.bottomLeftRadius = rad; comp.bottomRightRadius = rad; }

      // Fill
      if (merged.fill) { if (merged.fillOpacity !== undefined) setFillWithOpacity(comp, merged.fill, merged.fillOpacity); else setFill(comp, merged.fill); }
      else comp.fills = [];

      // Stroke
      if (merged.stroke) {
        setStroke(comp, merged.stroke);
        comp.strokeWeight = merged.strokeWeight || 1;
        comp.strokeAlign = "INSIDE";
        if (merged.strokeDash && Array.isArray(merged.strokeDash)) comp.dashPattern = merged.strokeDash;
      }

      // Opacity
      if (merged.opacity !== undefined) comp.opacity = merged.opacity;

      // Icon Left — real instance from Icon Components
      // Auto-detect from combo properties: IconLeft=true or Show Left Icon=true
      var icoSize = merged.iconSize || 16;
      var _showIconLeft = merged.iconLeft || combo["IconLeft"] === "true" || combo["Show Left Icon"] === "true" || combo["Show left icon"] === "true";
      var _showIconRight = merged.iconRight || combo["IconRight"] === "true" || combo["Show Right Icon"] === "true" || combo["Show right icon"] === "true";
      if (_showIconLeft) {
        var leftIconComp = findIconComponent("ChevronLeft") || findIconComponent("Plus") || findIconComponent("Search");
        if (leftIconComp) {
          var leftInst = leftIconComp.createInstance();
          leftInst.name = "Icon Left";
          leftInst.resize(icoSize, icoSize);
          // Bind icon stroke color to match button text color
          var leftVecs = leftInst.findAll(function(n) { return n.type === "VECTOR" || n.type === "ELLIPSE" || n.type === "LINE"; });
          var icoFgVar = findVar(merged.textFill || "foreground");
          if (icoFgVar) {
            for (var lv = 0; lv < leftVecs.length; lv++) {
              if (leftVecs[lv].strokes && leftVecs[lv].strokes.length > 0) leftVecs[lv].strokes = [makeBoundPaint(icoFgVar)];
            }
          }
          comp.appendChild(leftInst);
        } else {
          // Fallback: placeholder frame if no icon components exist yet
          var icoL = figma.createFrame(); icoL.name = "Icon Left"; icoL.resize(icoSize, icoSize); icoL.fills = [];
          setStroke(icoL, merged.textFill || "foreground"); icoL.strokeWeight = 1.5;
          icoL.topLeftRadius = 3; icoL.topRightRadius = 3; icoL.bottomLeftRadius = 3; icoL.bottomRightRadius = 3;
          comp.appendChild(icoL);
        }
      }

      // Label
      if (!merged.hideLabel) {
        var lbl = figma.createText(); lbl.name = "Label";
        var tsN = merged.textStyle || null; var fL = false;
        if (tsN) { var ts = findTextStyle(tsN); if (ts && ts.fontName) { try { await figma.loadFontAsync(ts.fontName); fL=true; } catch(e){} try { await lbl.setTextStyleIdAsync(ts.id); } catch(e){} } }
        if (!fL) { var fb = await loadFontSafe("Inter","SemiBold"); if (fb) lbl.fontName = fb; lbl.fontSize = merged.fontSize || 14; }
        lbl.characters = merged.textContent || "Button";
        if (merged.textFill) setTextFill(lbl, merged.textFill);
        comp.appendChild(lbl);
      }

      // Icon Right — real instance from Icon Components
      if (_showIconRight) {
        var rightIconComp = findIconComponent("ChevronRight") || findIconComponent("ArrowLeft") || findIconComponent("Search");
        if (rightIconComp) {
          var rightInst = rightIconComp.createInstance();
          rightInst.name = "Icon Right";
          rightInst.resize(icoSize, icoSize);
          var rightVecs = rightInst.findAll(function(n) { return n.type === "VECTOR" || n.type === "ELLIPSE" || n.type === "LINE"; });
          var icoFgVar2 = findVar(merged.textFill || "foreground");
          if (icoFgVar2) {
            for (var rv2 = 0; rv2 < rightVecs.length; rv2++) {
              if (rightVecs[rv2].strokes && rightVecs[rv2].strokes.length > 0) rightVecs[rv2].strokes = [makeBoundPaint(icoFgVar2)];
            }
          }
          comp.appendChild(rightInst);
        } else {
          var icoR = figma.createFrame(); icoR.name = "Icon Right"; icoR.resize(icoSize, icoSize); icoR.fills = [];
          setStroke(icoR, merged.textFill || "foreground"); icoR.strokeWeight = 1.5;
          icoR.topLeftRadius = 3; icoR.topRightRadius = 3; icoR.bottomLeftRadius = 3; icoR.bottomRightRadius = 3;
          comp.appendChild(icoR);
        }
      }

      // Legacy: iconPlaceholder (for backward compat with old JSON specs)
      if (merged.iconPlaceholder && !merged.iconLeft && !merged.iconRight) {
        var ico = figma.createFrame(); ico.name = "Icon"; ico.resize(icoSize, icoSize); ico.fills = [];
        setStroke(ico, merged.textFill || "foreground"); ico.strokeWeight = 1.5;
        ico.topLeftRadius = 3; ico.topRightRadius = 3; ico.bottomLeftRadius = 3; ico.bottomRightRadius = 3;
        comp.appendChild(ico);
      }

      comp.clipsContent = false;
      varComps.push(comp);
      createdVariants++;
    }

    // --- 3. Combine into ComponentSet ---
    if (varComps.length === 0) continue;
    var cs = figma.combineAsVariants(varComps, targetPage);
    cs.name = compName;
    if (compSpec.description) cs.description = compSpec.description;

    // ComponentSet styling — will be repositioned into grid by _buildShowcase
    cs.layoutMode = "NONE";
    cs.fills = []; // transparent — showcase frame provides bg

    createdSets++;
    log.push("  ComponentSet: " + varComps.length + " variants");

    // --- 4. Build Showcase Page ---
    log.push("  Building showcase...");
    var showcase = await _buildShowcase(cs, compSpec, properties, propNames, log);
    targetPage.appendChild(showcase);

    // Position showcase horizontally, 100px gap between components
    showcase.x = _showcaseXOffset; showcase.y = 0;
    _showcaseXOffset += showcase.width + 100;
  }

  figma.viewport.scrollAndZoomIntoView(targetPage.children);

  var elapsed = Date.now() - startTime;
  log.push("Done! " + createdSets + " set(s), " + createdVariants + " variants + showcase in " + elapsed + "ms");
  return { success: true, message: createdSets + " component(s) + showcase created", elapsed: elapsed, log: log };
}

// --- Showcase table helper ---
async function _makeTableRow(cells, isHeader, parent) {
  var row = figma.createFrame();
  row.name = isHeader ? "Table Header" : "Table Row";
  row.layoutMode = "HORIZONTAL";
  row.itemSpacing = 0;
  row.fills = [];
  if (isHeader) setFillWithOpacity(row, "muted", 0.5);
  if (parent) {
    parent.appendChild(row);
    try { row.layoutSizingHorizontal = "FILL"; row.layoutSizingVertical = "HUG"; } catch(e) {}
  }
  for (var ci = 0; ci < cells.length; ci++) {
    var cell = figma.createFrame();
    cell.name = "Cell";
    cell.layoutMode = "HORIZONTAL";
    cell.paddingTop = 8; cell.paddingBottom = 8; cell.paddingLeft = 16; cell.paddingRight = 16;
    cell.itemSpacing = 0;
    cell.fills = [];
    row.appendChild(cell);
    cell.layoutSizingHorizontal = "FILL";
    cell.layoutSizingVertical = "HUG";
    var style = isHeader ? "SP/Label" : "SP/Caption";
    var fill = isHeader ? "foreground" : (ci === 0 ? "foreground" : "muted-foreground");
    await _makeLabel(cells[ci] || "—", style, fill, cell);
  }
  // Bottom border
  if (!isHeader) {
    var sep = figma.createFrame(); sep.name = "Border"; sep.resize(100, 1);
    setFillWithOpacity(sep, "border", 0.5);
    parent.appendChild(sep);
    try { sep.layoutSizingHorizontal = "FILL"; sep.layoutSizingVertical = "FIXED"; } catch(e) {}
  }
  return row;
}

async function _makeTable(title, headers, rows, parent) {
  var sec = _makeFrame("Section — " + title, "v", 24, parent);
  await _makeLabel(title, "SP/H3", "foreground", sec);
  var table = figma.createFrame();
  table.name = title + " Table";
  table.layoutMode = "VERTICAL";
  table.itemSpacing = 0;
  table.topLeftRadius = 12; table.topRightRadius = 12; table.bottomLeftRadius = 12; table.bottomRightRadius = 12;
  table.clipsContent = true;
  setStroke(table, "border"); table.strokeWeight = 1; table.strokeAlign = "INSIDE";
  sec.appendChild(table);
  try { table.layoutSizingHorizontal = "FILL"; table.layoutSizingVertical = "HUG"; } catch(e) {}
  await _makeTableRow(headers, true, table);
  for (var ri = 0; ri < rows.length; ri++) {
    await _makeTableRow(rows[ri], false, table);
  }
  return sec;
}

// --- Showcase builder ---

async function _buildShowcase(cs, compSpec, properties, propNames, log) {
  var compName = compSpec.name || "Component";
  var desc = compSpec.description || "";
  var category = compSpec.category || "Components";

  // Main frame — 1440w, dark bg
  var main = figma.createFrame();
  main.name = compName + " — Showcase";
  main.layoutMode = "VERTICAL";
  main.resize(1440, 100);
  main.layoutSizingHorizontal = "FIXED";
  main.layoutSizingVertical = "HUG";
  main.paddingTop = 80; main.paddingRight = 80; main.paddingBottom = 80; main.paddingLeft = 80;
  main.itemSpacing = 64;
  setFill(main, "background");
  main.clipsContent = false;

  // ====== 1. HEADER ======
  var header = _makeFrame("Header", "v", 8, main);
  await _makeLabel(category, "SP/Overline", "muted-foreground", header);
  await _makeLabel(compName, "SP/H1", "foreground", header);
  if (desc) {
    var descLabel = await _makeLabel(desc, "SP/Body LG", "muted-foreground", header);
    try { descLabel.layoutSizingHorizontal = "FILL"; } catch(e) {}
  }

  // ====== SHARED HELPERS (hoisted) ======
  var CARD_W = 400;
  var firstProp = propNames[0]; // e.g. "Variant"
  var firstVals = properties[firstProp]; // e.g. ["Default", "Secondary", ...]
  var sizes = properties["Size"] || ["default"];
  var states = properties["State"] || [];

  // --- Card helper (Header → Separator → Preview) with border ---
  async function _makeExCard(name, desc, parent) {
    var card = figma.createFrame(); card.name = name;
    card.layoutMode = "VERTICAL"; card.itemSpacing = 0; card.fills = [];
    card.resize(CARD_W, 100);
    card.topLeftRadius = 12; card.topRightRadius = 12; card.bottomLeftRadius = 12; card.bottomRightRadius = 12;
    card.clipsContent = true;
    // Border for visibility
    setStroke(card, "border"); card.strokeWeight = 1; card.strokeAlign = "INSIDE";
    // MUST append to parent BEFORE setting FILL — requires auto-layout parent
    if (parent) {
      parent.appendChild(card);
      try { card.layoutSizingHorizontal = "FILL"; } catch (e) { card.layoutSizingHorizontal = "HUG"; }
    }
    try { card.layoutSizingVertical = "HUG"; } catch (e) {}
    // Header
    var hdr = figma.createFrame(); hdr.name = "Header"; hdr.layoutMode = "VERTICAL"; hdr.itemSpacing = 6;
    hdr.paddingTop = 16; hdr.paddingBottom = 16; hdr.paddingLeft = 24; hdr.paddingRight = 24;
    setFillWithOpacity(hdr, "muted", 0.5);
    card.appendChild(hdr);
    try { hdr.layoutSizingHorizontal = "FILL"; hdr.layoutSizingVertical = "HUG"; } catch (e) {}
    await _makeLabel(name, "SP/Body Semibold", "foreground", hdr);
    if (desc) await _makeLabel(desc, "SP/Caption", "muted-foreground", hdr);
    // Separator
    _makeSep(card);
    // Preview
    var prev = figma.createFrame(); prev.name = "Preview"; prev.layoutMode = "VERTICAL"; prev.itemSpacing = 12;
    prev.paddingTop = 20; prev.paddingBottom = 20; prev.paddingLeft = 24; prev.paddingRight = 24;
    setFill(prev, "card");
    card.appendChild(prev);
    try { prev.layoutSizingHorizontal = "FILL"; prev.layoutSizingVertical = "HUG"; } catch (e) {}
    return prev; // return preview frame to add instances into
  }

  // Helper: build variant props
  function _bp(variant, size, iconL, iconR) {
    var p = {}; p[firstProp] = variant; p["Size"] = size || "default";
    if (properties["State"]) p["State"] = "Default";
    if (properties["IconLeft"]) p["IconLeft"] = iconL || "false";
    if (properties["IconRight"]) p["IconRight"] = iconR || "false";
    return p;
  }

  // Helper: build props with explicit state
  function _bps(variant, size, state, iconL, iconR) {
    var p = {}; p[firstProp] = variant; p["Size"] = size || "default";
    if (properties["State"]) p["State"] = state || "Default";
    if (properties["IconLeft"]) p["IconLeft"] = iconL || "false";
    if (properties["IconRight"]) p["IconRight"] = iconR || "false";
    return p;
  }

  _makeSep(main);

  // ====== SECTION: COMPONENT (gốc) ======
  var compSec = _makeFrame("Section — Component", "v", 24, main);
  await _makeLabel("Component", "SP/H3", "foreground", compSec);
  var _descLabel = await _makeLabel("The source ComponentSet with all " + cs.children.length + " variants. Grouped: Variant → Size → Icons → State.", "SP/Body", "muted-foreground", compSec);
  try { _descLabel.layoutSizingHorizontal = "FILL"; } catch (e) {}

  // --- Generic sort: all properties in declaration order ---
  function _parseName(name) {
    var r = {}; var parts = name.split(", ");
    for (var i = 0; i < parts.length; i++) { var kv = parts[i].split("="); if (kv.length === 2) r[kv[0].trim()] = kv[1].trim(); }
    return r;
  }

  // Build value→index map for each property (declaration order)
  var _propOrder = {};
  for (var _pi = 0; _pi < propNames.length; _pi++) {
    var _vals = properties[propNames[_pi]];
    _propOrder[propNames[_pi]] = {};
    for (var _vi = 0; _vi < _vals.length; _vi++) _propOrder[propNames[_pi]][_vals[_vi]] = _vi;
  }

  function _sortKey(comp) {
    var v = _parseName(comp.name);
    var k = "";
    for (var pi = 0; pi < propNames.length; pi++) {
      var pn = propNames[pi];
      var idx = _propOrder[pn] && _propOrder[pn][v[pn]] !== undefined ? _propOrder[pn][v[pn]] : 99;
      k += String(idx).padStart(3, "0");
    }
    return k;
  }

  // Sort + reorder
  var _sorted = [];
  for (var _si = 0; _si < cs.children.length; _si++) _sorted.push(cs.children[_si]);
  _sorted.sort(function(a, b) { return _sortKey(a).localeCompare(_sortKey(b)); });
  for (var _ri = 0; _ri < _sorted.length; _ri++) cs.appendChild(_sorted[_ri]);

  // --- Grid: first property (Variant) = columns (horizontal), rest = rows (vertical) ---
  // e.g. 7 Variants across, then Size×State×Icon combos stacked below
  var _colCount = properties[propNames[0]] ? properties[propNames[0]].length : 1;
  var _rowCount = Math.max(1, Math.ceil(_sorted.length / _colCount));
  var _colGap = 68, _rowGap = 40, _pad = 40;

  // Disable auto-layout for manual positioning
  cs.layoutMode = "NONE";
  cs.fills = [];

  // Calculate column widths (max width per column across all rows)
  var _colWidths = [];
  for (var _ci = 0; _ci < _colCount; _ci++) {
    var _maxW = 0;
    for (var _rj = 0; _rj < _rowCount; _rj++) {
      var _idx = _rj * _colCount + _ci;
      if (_idx < _sorted.length) {
        var _w = _sorted[_idx].width;
        if (typeof _w === "number" && !isNaN(_w)) _maxW = Math.max(_maxW, _w);
      }
    }
    _colWidths.push(_maxW || 40); // fallback 40px min
  }

  // Calculate row heights (max height per row across all columns)
  var _rowHeights = [];
  for (var _rk = 0; _rk < _rowCount; _rk++) {
    var _maxH = 0;
    for (var _cj = 0; _cj < _colCount; _cj++) {
      var _idx2 = _rk * _colCount + _cj;
      if (_idx2 < _sorted.length) {
        var _h = _sorted[_idx2].height;
        if (typeof _h === "number" && !isNaN(_h)) _maxH = Math.max(_maxH, _h);
      }
    }
    _rowHeights.push(_maxH || 20); // fallback 20px min
  }

  // Column X positions
  var _colX = [_pad];
  for (var _cx = 1; _cx < _colCount; _cx++) _colX.push(_colX[_cx - 1] + _colWidths[_cx - 1] + _colGap);

  // Row Y positions
  var _rowY = [_pad];
  for (var _ry = 1; _ry < _rowCount; _ry++) _rowY.push(_rowY[_ry - 1] + _rowHeights[_ry - 1] + _rowGap);

  // Position each child in the grid — with validation
  for (var _gi = 0; _gi < _sorted.length; _gi++) {
    var _col = _gi % _colCount;
    var _row = Math.floor(_gi / _colCount);
    var _xVal = (_col < _colX.length) ? _colX[_col] : _pad;
    var _yVal = (_row < _rowY.length) ? _rowY[_row] : _pad;
    try {
      _sorted[_gi].x = (typeof _xVal === "number" && !isNaN(_xVal)) ? _xVal : _pad;
      _sorted[_gi].y = (typeof _yVal === "number" && !isNaN(_yVal)) ? _yVal : _pad;
    } catch (e) {
      // Fallback: stack vertically if positioning fails
      try { _sorted[_gi].x = _pad; _sorted[_gi].y = _pad + _gi * 50; } catch (e2) {}
    }
  }

  // Resize ComponentSet to fit grid
  var _totalW = _colX[_colCount - 1] + _colWidths[_colCount - 1] + _pad;
  var _totalH = _rowY[_rowCount - 1] + _rowHeights[_rowCount - 1] + _pad;
  if (isNaN(_totalW) || _totalW < 100) _totalW = 800;
  if (isNaN(_totalH) || _totalH < 100) _totalH = 400;
  cs.resize(_totalW, _totalH);

  // Dashed border with foreground color + 16px radius
  setStroke(cs, "foreground");
  cs.strokeWeight = 1;
  cs.strokeAlign = "INSIDE";
  cs.dashPattern = [10, 5];
  cs.topLeftRadius = 16; cs.topRightRadius = 16; cs.bottomLeftRadius = 16; cs.bottomRightRadius = 16;

  // Move the actual ComponentSet INTO the showcase
  compSec.appendChild(cs);

  // If CS width > 1280 (content area), switch main frame to HUG width
  var _contentArea = 1440 - 80 - 80; // 1280
  if (_totalW > _contentArea) {
    main.layoutSizingHorizontal = "HUG";
    main.paddingRight = 80; main.paddingLeft = 80;
  }

  _makeSep(main);

  // ====== 3. EXPLORE BEHAVIOR ======
  var exploreSec = _makeFrame("Section — Explore Behavior", "v", 24, main);
  await _makeLabel("Explore Behavior", "SP/H3", "foreground", exploreSec);

  // Build an explore card: preview area + property controls
  var exploreCard = figma.createFrame(); exploreCard.name = "Explore Card";
  exploreCard.layoutMode = "VERTICAL"; exploreCard.itemSpacing = 0;
  exploreCard.topLeftRadius = 12; exploreCard.topRightRadius = 12; exploreCard.bottomLeftRadius = 12; exploreCard.bottomRightRadius = 12;
  exploreCard.clipsContent = true;
  setStroke(exploreCard, "border"); exploreCard.strokeWeight = 1; exploreCard.strokeAlign = "INSIDE";
  exploreSec.appendChild(exploreCard);
  try { exploreCard.layoutSizingHorizontal = "FILL"; exploreCard.layoutSizingVertical = "HUG"; } catch(e) {}

  // Preview area
  var expPreview = figma.createFrame(); expPreview.name = "Preview";
  expPreview.layoutMode = "HORIZONTAL"; expPreview.itemSpacing = 16;
  expPreview.paddingTop = 48; expPreview.paddingBottom = 48; expPreview.paddingLeft = 48; expPreview.paddingRight = 48;
  expPreview.primaryAxisAlignItems = "CENTER"; expPreview.counterAxisAlignItems = "CENTER";
  setFillWithOpacity(expPreview, "muted", 0.2);
  exploreCard.appendChild(expPreview);
  try { expPreview.layoutSizingHorizontal = "FILL"; expPreview.layoutSizingVertical = "HUG"; expPreview.minHeight = 160; } catch(e) {}
  // Add a default instance
  var expInst = _getInstance(cs, _buildProps({}));
  if (expInst) expPreview.appendChild(expInst);

  // Controls area
  _makeSep(exploreCard);
  var expControls = figma.createFrame(); expControls.name = "Controls";
  expControls.layoutMode = "VERTICAL"; expControls.itemSpacing = 16;
  expControls.paddingTop = 16; expControls.paddingBottom = 16; expControls.paddingLeft = 16; expControls.paddingRight = 16;
  setFillWithOpacity(expControls, "muted", 0.1);
  exploreCard.appendChild(expControls);
  try { expControls.layoutSizingHorizontal = "FILL"; expControls.layoutSizingVertical = "HUG"; } catch(e) {}

  // Property control rows
  for (var epi = 0; epi < propNames.length; epi++) {
    var epName = propNames[epi];
    var epVals = properties[epName];
    var epRow = _makeFrame("Control — " + epName, "v", 8, expControls);
    await _makeLabel(epName, "SP/Label", "muted-foreground", epRow);
    var epPills = _makeFrame("Pills", "h", 6, epRow);
    epPills.layoutSizingHorizontal = "HUG";
    epPills.layoutWrap = "WRAP"; epPills.counterAxisSpacing = 6;
    for (var epv = 0; epv < epVals.length; epv++) {
      var epPill = figma.createFrame(); epPill.name = epVals[epv];
      epPill.layoutMode = "HORIZONTAL"; epPill.primaryAxisAlignItems = "CENTER"; epPill.counterAxisAlignItems = "CENTER";
      epPill.paddingLeft = 8; epPill.paddingRight = 8; epPill.paddingTop = 4; epPill.paddingBottom = 4;
      epPill.topLeftRadius = 6; epPill.topRightRadius = 6; epPill.bottomLeftRadius = 6; epPill.bottomRightRadius = 6;
      if (epv === 0) {
        setFill(epPill, "primary");
        await _makeLabel(epVals[epv], "SP/Caption", "primary-foreground", epPill);
      } else {
        setFill(epPill, "card");
        setStroke(epPill, "border"); epPill.strokeWeight = 1; epPill.strokeAlign = "INSIDE";
        await _makeLabel(epVals[epv], "SP/Caption", "foreground", epPill);
      }
      epPills.appendChild(epPill);
      epPill.layoutSizingHorizontal = "HUG"; epPill.layoutSizingVertical = "HUG";
    }
  }

  _makeSep(main);

  // ====== 4. EXAMPLES ======
  var exSec = _makeFrame("Section — Examples", "v", 32, main);
  await _makeLabel("Examples", "SP/H3", "foreground", exSec);
  await _makeLabel("Real-world usage patterns.", "SP/Body", "muted-foreground", exSec);

  // Helper: build props from a flat object {PropName: "value", ...}
  function _buildProps(overrides) {
    var p = {};
    for (var pi = 0; pi < propNames.length; pi++) {
      var pn = propNames[pi];
      p[pn] = overrides[pn] || properties[pn][0]; // default = first value
    }
    return p;
  }

  // Check if spec has custom examples
  var customExamples = compSpec.examples || null;

  if (customExamples && customExamples.length > 0) {
    // --- Custom examples from JSON spec ---
    for (var exi = 0; exi < customExamples.length; exi += 2) {
      var exRow = _makeFrame("Example Row " + exi, "h", 24, exSec);
      for (var exj = exi; exj < Math.min(exi + 2, customExamples.length); exj++) {
        var exDef = customExamples[exj];
        var exPrev = await _makeExCard(exDef.name, exDef.description || "", exRow);
        exPrev.layoutMode = exDef.layout === "vertical" ? "VERTICAL" : "HORIZONTAL";
        exPrev.itemSpacing = 12;
        exPrev.counterAxisAlignItems = "CENTER";
        if (exDef.layout === "vertical") { exPrev.counterAxisAlignItems = "MIN"; }
        // Create instances for each item in the example
        var exItems = exDef.items || [];
        for (var eii = 0; eii < exItems.length; eii++) {
          var exItem = exItems[eii];
          var exProps = _buildProps(exItem.props || {});
          var exInst = await _getInstanceWithLabel(cs, exProps, exItem.label || null, exPrev);
          if (exInst && exItem.fill) {
            try { exInst.layoutSizingHorizontal = "FILL"; } catch (e) {}
          }
        }
      }
    }
  } else {
    // --- Auto-generated generic examples ---
    var _exCount = 0;
    var _exRow = null;

    // Helper: start new row every 2 cards
    function _nextRow() {
      if (_exCount % 2 === 0) _exRow = _makeFrame("Example Row " + _exCount, "h", 24, exSec);
      _exCount++;
      return _exRow;
    }

    // Example 1: "All [FirstProp]" — one instance per first-prop value
    var _allVarPrev = await _makeExCard("All " + firstProp + "s", "Each " + firstProp.toLowerCase() + " variant side by side.", _nextRow());
    _allVarPrev.layoutMode = "HORIZONTAL"; _allVarPrev.itemSpacing = 12; _allVarPrev.counterAxisAlignItems = "CENTER";
    _allVarPrev.layoutWrap = "WRAP"; _allVarPrev.counterAxisSpacing = 12;
    for (var av = 0; av < firstVals.length; av++) {
      var avp = {}; avp[firstProp] = firstVals[av];
      await _getInstanceWithLabel(cs, _buildProps(avp), firstVals[av], _allVarPrev);
    }

    // Example 2: "All Sizes" (if Size property exists)
    if (properties["Size"]) {
      var _allSzPrev = await _makeExCard("All Sizes", "Size comparison from largest to smallest.", _nextRow());
      _allSzPrev.layoutMode = "HORIZONTAL"; _allSzPrev.itemSpacing = 16; _allSzPrev.counterAxisAlignItems = "MAX";
      for (var sz = 0; sz < sizes.length; sz++) {
        var szp = { "Size": sizes[sz] };
        await _getInstanceWithLabel(cs, _buildProps(szp), sizes[sz], _allSzPrev);
      }
    }

    // Example 3: "States" (if State property exists)
    if (properties["State"] && states.length > 1) {
      var _stPrev = await _makeExCard("State Flow", "Visual states: " + states.join(" → ") + ".", _nextRow());
      _stPrev.layoutMode = "HORIZONTAL"; _stPrev.itemSpacing = 16; _stPrev.counterAxisAlignItems = "CENTER";
      for (var si = 0; si < states.length; si++) {
        var stp = { "State": states[si] };
        await _getInstanceWithLabel(cs, _buildProps(stp), states[si], _stPrev);
      }
    }

    // Example 4: "Disabled/Off" comparison (if Disabled or Value prop exists)
    if (properties["Disabled"]) {
      var _disPrev = await _makeExCard("Enabled vs Disabled", "Active and inactive comparison.", _nextRow());
      _disPrev.layoutMode = "HORIZONTAL"; _disPrev.itemSpacing = 16; _disPrev.counterAxisAlignItems = "CENTER";
      await _getInstanceWithLabel(cs, _buildProps({"Disabled": "false"}), "Enabled", _disPrev);
      await _getInstanceWithLabel(cs, _buildProps({"Disabled": "true"}), "Disabled", _disPrev);
    }

    // Example 5: second property showcase (if exists and not already shown)
    if (propNames.length >= 2) {
      var secProp = propNames[1];
      if (secProp !== "Size" && secProp !== "State" && secProp !== "Disabled") {
        var secVals = properties[secProp];
        var _secPrev = await _makeExCard("All " + secProp + "s", secProp + " variations.", _nextRow());
        _secPrev.layoutMode = "HORIZONTAL"; _secPrev.itemSpacing = 12; _secPrev.counterAxisAlignItems = "CENTER";
        for (var sv = 0; sv < secVals.length; sv++) {
          var svp = {}; svp[secProp] = secVals[sv];
          await _getInstanceWithLabel(cs, _buildProps(svp), secVals[sv], _secPrev);
        }
      }
    }

    // Example 6: combined — first value of each prop variation
    if (propNames.length >= 3) {
      var _combPrev = await _makeExCard("Combined", "Multiple properties combined together.", _nextRow());
      _combPrev.layoutMode = "HORIZONTAL"; _combPrev.itemSpacing = 12; _combPrev.counterAxisAlignItems = "CENTER";
      _combPrev.layoutWrap = "WRAP"; _combPrev.counterAxisSpacing = 12;
      // Show first×last combo for each pair of first 2 properties
      var fp = propNames[0]; var sp = propNames[1];
      var fpv = properties[fp]; var spv = properties[sp];
      var combCount = 0;
      for (var ci2 = 0; ci2 < fpv.length && combCount < 6; ci2++) {
        var cp = {}; cp[fp] = fpv[ci2]; cp[sp] = spv[spv.length > 1 ? 1 : 0];
        await _getInstanceWithLabel(cs, _buildProps(cp), fpv[ci2], _combPrev);
        combCount++;
      }
    }
  }

  // ====== 5. PROPS TABLE ======
  _makeSep(main);
  var propsData = compSpec.props || null;
  if (propsData && propsData.length > 0) {
    await _makeTable("Props", ["Prop", "Type", "Default", "Description"], propsData, main);
  } else {
    // Auto-generate props from component properties
    var autoProps = [];
    for (var api = 0; api < propNames.length; api++) {
      var apn = propNames[api];
      var apv = properties[apn];
      autoProps.push([apn.toLowerCase(), '"' + apv.join('" | "') + '"', '"' + apv[0] + '"', apn + " variant"]);
    }
    autoProps.push(["className", "string", '""', "Additional CSS classes"]);
    await _makeTable("Props", ["Prop", "Type", "Default", "Description"], autoProps, main);
  }

  // ====== 6. FIGMA MAPPING TABLE ======
  _makeSep(main);
  var figmaMappingData = compSpec.figmaMapping || null;
  if (figmaMappingData && figmaMappingData.length > 0) {
    await _makeTable("Figma Mapping", ["Figma Property", "Figma Value", "Code Prop", "Code Value"], figmaMappingData, main);
  } else {
    // Auto-generate from properties
    var autoMapping = [];
    for (var fmi = 0; fmi < propNames.length; fmi++) {
      var fmn = propNames[fmi];
      var fmv = properties[fmn];
      for (var fmvi = 0; fmvi < fmv.length; fmvi++) {
        autoMapping.push([fmn, fmv[fmvi], fmn.toLowerCase(), '"' + fmv[fmvi].toLowerCase() + '"']);
      }
    }
    await _makeTable("Figma Mapping", ["Figma Property", "Figma Value", "Code Prop", "Code Value"], autoMapping, main);
  }

  // ====== 7. ACCESSIBILITY ======
  _makeSep(main);
  var a11ySec = _makeFrame("Section — Accessibility", "v", 24, main);
  await _makeLabel("Accessibility", "SP/H3", "foreground", a11ySec);

  var a11yData = compSpec.accessibility || null;
  if (a11yData) {
    // Keyboard section
    if (a11yData.keyboard && a11yData.keyboard.length > 0) {
      var kbCard = figma.createFrame(); kbCard.name = "Keyboard";
      kbCard.layoutMode = "VERTICAL"; kbCard.itemSpacing = 12;
      kbCard.paddingTop = 16; kbCard.paddingBottom = 16; kbCard.paddingLeft = 16; kbCard.paddingRight = 16;
      kbCard.topLeftRadius = 12; kbCard.topRightRadius = 12; kbCard.bottomLeftRadius = 12; kbCard.bottomRightRadius = 12;
      setStroke(kbCard, "border"); kbCard.strokeWeight = 1; kbCard.strokeAlign = "INSIDE";
      a11ySec.appendChild(kbCard);
      try { kbCard.layoutSizingHorizontal = "FILL"; kbCard.layoutSizingVertical = "HUG"; } catch(e) {}
      await _makeLabel("Keyboard", "SP/Body Semibold", "foreground", kbCard);
      for (var ki = 0; ki < a11yData.keyboard.length; ki++) {
        var kbRow = _makeFrame("KB " + ki, "h", 16, kbCard);
        await _makeLabel(a11yData.keyboard[ki][0], "SP/Caption", "foreground", kbRow);
        await _makeLabel("→  " + a11yData.keyboard[ki][1], "SP/Caption", "muted-foreground", kbRow);
      }
    }
    // Notes section
    if (a11yData.notes && a11yData.notes.length > 0) {
      var notesCard = figma.createFrame(); notesCard.name = "Notes";
      notesCard.layoutMode = "VERTICAL"; notesCard.itemSpacing = 8;
      notesCard.paddingTop = 16; notesCard.paddingBottom = 16; notesCard.paddingLeft = 16; notesCard.paddingRight = 16;
      notesCard.topLeftRadius = 12; notesCard.topRightRadius = 12; notesCard.bottomLeftRadius = 12; notesCard.bottomRightRadius = 12;
      setStroke(notesCard, "border"); notesCard.strokeWeight = 1; notesCard.strokeAlign = "INSIDE";
      a11ySec.appendChild(notesCard);
      try { notesCard.layoutSizingHorizontal = "FILL"; notesCard.layoutSizingVertical = "HUG"; } catch(e) {}
      await _makeLabel("Notes", "SP/Body Semibold", "foreground", notesCard);
      for (var ni = 0; ni < a11yData.notes.length; ni++) {
        await _makeLabel("• " + a11yData.notes[ni], "SP/Caption", "muted-foreground", notesCard);
      }
    }
  } else {
    // Default placeholder
    var a11yPlaceholder = figma.createFrame(); a11yPlaceholder.name = "A11y Placeholder";
    a11yPlaceholder.layoutMode = "VERTICAL"; a11yPlaceholder.itemSpacing = 8;
    a11yPlaceholder.paddingTop = 16; a11yPlaceholder.paddingBottom = 16; a11yPlaceholder.paddingLeft = 16; a11yPlaceholder.paddingRight = 16;
    a11yPlaceholder.topLeftRadius = 12; a11yPlaceholder.topRightRadius = 12; a11yPlaceholder.bottomLeftRadius = 12; a11yPlaceholder.bottomRightRadius = 12;
    setStroke(a11yPlaceholder, "border"); a11yPlaceholder.strokeWeight = 1; a11yPlaceholder.strokeAlign = "INSIDE";
    a11ySec.appendChild(a11yPlaceholder);
    try { a11yPlaceholder.layoutSizingHorizontal = "FILL"; a11yPlaceholder.layoutSizingVertical = "HUG"; } catch(e) {}
    await _makeLabel("Keyboard", "SP/Body Semibold", "foreground", a11yPlaceholder);
    await _makeLabel("Tab — Focus the component", "SP/Caption", "muted-foreground", a11yPlaceholder);
    await _makeLabel("Enter / Space — Activate", "SP/Caption", "muted-foreground", a11yPlaceholder);
  }

  // ====== 8. RELATED COMPONENTS ======
  _makeSep(main);
  var relatedData = compSpec.related || null;
  if (relatedData && relatedData.length > 0) {
    var relSec = _makeFrame("Section — Related", "v", 24, main);
    await _makeLabel("Related Components", "SP/H3", "foreground", relSec);
    var relCard = figma.createFrame(); relCard.name = "Related List";
    relCard.layoutMode = "VERTICAL"; relCard.itemSpacing = 0;
    relCard.topLeftRadius = 12; relCard.topRightRadius = 12; relCard.bottomLeftRadius = 12; relCard.bottomRightRadius = 12;
    relCard.clipsContent = true;
    setStroke(relCard, "border"); relCard.strokeWeight = 1; relCard.strokeAlign = "INSIDE";
    relSec.appendChild(relCard);
    try { relCard.layoutSizingHorizontal = "FILL"; relCard.layoutSizingVertical = "HUG"; } catch(e) {}
    for (var rli = 0; rli < relatedData.length; rli++) {
      var relItem = figma.createFrame(); relItem.name = relatedData[rli].name;
      relItem.layoutMode = "VERTICAL"; relItem.itemSpacing = 4;
      relItem.paddingTop = 12; relItem.paddingBottom = 12; relItem.paddingLeft = 16; relItem.paddingRight = 16;
      relItem.fills = [];
      relCard.appendChild(relItem);
      try { relItem.layoutSizingHorizontal = "FILL"; relItem.layoutSizingVertical = "HUG"; } catch(e) {}
      await _makeLabel(relatedData[rli].name, "SP/Body Semibold", "foreground", relItem);
      await _makeLabel(relatedData[rli].desc, "SP/Caption", "muted-foreground", relItem);
      if (rli < relatedData.length - 1) {
        var relSep = figma.createFrame(); relSep.name = "Divider"; relSep.resize(100, 1);
        setFillWithOpacity(relSep, "border", 0.5);
        relCard.appendChild(relSep);
        try { relSep.layoutSizingHorizontal = "FILL"; relSep.layoutSizingVertical = "FIXED"; } catch(e) {}
      }
    }
  }

  log.push("  Showcase built: all sections");
  return main;
}

// --- Style merge (supports compound keys) ---

function mergeComponentStyles(base, combo, variantStyles, propNames) {
  var result = {};
  var bk = Object.keys(base);
  for (var i = 0; i < bk.length; i++) result[bk[i]] = base[bk[i]];

  // Pass 1: single-property overrides in order
  for (var p = 0; p < propNames.length; p++) {
    var key = propNames[p] + "=" + combo[propNames[p]];
    var st = variantStyles[key];
    if (st) { var sk = Object.keys(st); for (var s = 0; s < sk.length; s++) result[sk[s]] = st[sk[s]]; }
  }
  // Pass 2: compound keys (e.g. "Variant=Default,State=Hover")
  var ak = Object.keys(variantStyles);
  for (var ck = 0; ck < ak.length; ck++) {
    if (ak[ck].indexOf(",") === -1) continue;
    var parts = ak[ck].split(","); var ok = true;
    for (var cp = 0; cp < parts.length; cp++) {
      var kv = parts[cp].trim().split("=");
      if (kv.length !== 2 || combo[kv[0]] !== kv[1]) { ok = false; break; }
    }
    if (ok) { var cs = variantStyles[ak[ck]]; var csk = Object.keys(cs); for (var c = 0; c < csk.length; c++) result[csk[c]] = cs[csk[c]]; }
  }
  return result;
}

// ============================================================
// SECTION 12: EXPORT FOUNDATION
// ============================================================

function rgbToHex(r, g, b) {
  var rr = Math.round(r * 255).toString(16).padStart(2, "0");
  var gg = Math.round(g * 255).toString(16).padStart(2, "0");
  var bb = Math.round(b * 255).toString(16).padStart(2, "0");
  return "#" + rr + gg + bb;
}

async function doExportVariables() {
  var collections = await figma.variables.getLocalVariableCollectionsAsync();
  var allVars = [];
  try {
    var colorVars = await figma.variables.getLocalVariablesAsync("COLOR");
    var floatVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    var stringVars = await figma.variables.getLocalVariablesAsync("STRING");
    allVars = colorVars.concat(floatVars).concat(stringVars);
  } catch (e) {}

  // Build id→variable map for alias resolution
  var varById = {};
  for (var v = 0; v < allVars.length; v++) {
    varById[allVars[v].id] = allVars[v];
  }

  // Build collectionId→name map
  var colNameById = {};
  for (var c = 0; c < collections.length; c++) {
    colNameById[collections[c].id] = collections[c].name;
  }

  var result = {
    type: "foundation-variables",
    collections: []
  };

  for (var ci = 0; ci < collections.length; ci++) {
    var col = collections[ci];
    var modes = col.modes.map(function(m) { return m.name; });
    var modeIds = col.modes.map(function(m) { return m.modeId; });

    var variables = [];

    for (var vi = 0; vi < col.variableIds.length; vi++) {
      var variable = varById[col.variableIds[vi]];
      if (!variable) continue;

      var varSpec = {
        name: variable.name,
        type: variable.resolvedType
      };

      var values = {};
      for (var mi = 0; mi < modeIds.length; mi++) {
        var modeId = modeIds[mi];
        var modeName = modes[mi];
        var val = variable.valuesByMode[modeId];

        if (val && val.type === "VARIABLE_ALIAS" && val.id) {
          // Resolve alias → "$collectionName/varName"
          var aliasVar = varById[val.id];
          if (aliasVar) {
            var aliasColName = colNameById[aliasVar.variableCollectionId] || "";
            values[modeName] = "$" + aliasColName + "/" + aliasVar.name;
          } else {
            values[modeName] = null;
          }
        } else if (variable.resolvedType === "COLOR" && val && val.r !== undefined) {
          if (val.a !== undefined && val.a < 1) {
            var alpha = Math.round(val.a * 255).toString(16).padStart(2, "0");
            values[modeName] = rgbToHex(val.r, val.g, val.b) + alpha;
          } else {
            values[modeName] = rgbToHex(val.r, val.g, val.b);
          }
        } else if (variable.resolvedType === "FLOAT") {
          values[modeName] = typeof val === "number" ? val : parseFloat(val);
        } else if (variable.resolvedType === "STRING") {
          values[modeName] = String(val);
        } else {
          values[modeName] = val;
        }
      }

      varSpec.values = values;
      variables.push(varSpec);
    }

    result.collections.push({
      name: col.name,
      modes: modes,
      variables: variables
    });
  }

  return result;
}

async function doExportTextStyles() {
  var result = {
    type: "foundation-text-styles",
    styles: []
  };

  try {
    var styles = await figma.getLocalTextStylesAsync();
    for (var i = 0; i < styles.length; i++) {
      var st = styles[i];
      var spec = {
        name: st.name,
        fontFamily: st.fontName.family,
        fontStyle: st.fontName.style,
        fontSize: st.fontSize
      };

      if (st.lineHeight && st.lineHeight.unit !== "AUTO") {
        spec.lineHeight = st.lineHeight.value;
      }
      if (st.letterSpacing && st.letterSpacing.value !== 0) {
        if (st.letterSpacing.unit === "PERCENT") {
          spec.letterSpacing = (st.letterSpacing.value / 100).toFixed(3) + "em";
        } else {
          spec.letterSpacing = st.letterSpacing.value;
        }
      }
      if (st.textCase && st.textCase !== "ORIGINAL") {
        spec.textCase = st.textCase;
      }

      result.styles.push(spec);
    }
  } catch (e) {}

  return result;
}

async function doExportEffectStyles() {
  var result = {
    type: "foundation-effects",
    styles: []
  };

  try {
    var styles = await figma.getLocalEffectStylesAsync();
    for (var i = 0; i < styles.length; i++) {
      var es = styles[i];
      var spec = {
        name: es.name,
        effects: []
      };

      for (var j = 0; j < es.effects.length; j++) {
        var eff = es.effects[j];
        var effSpec = { type: eff.type };

        if (eff.type === "LAYER_BLUR" || eff.type === "BACKGROUND_BLUR") {
          effSpec.radius = eff.radius;
        } else {
          // Shadow
          if (eff.color) {
            effSpec.color = rgbToHex(eff.color.r, eff.color.g, eff.color.b);
            if (eff.color.a !== undefined && eff.color.a < 1) {
              effSpec.alpha = Math.round(eff.color.a * 100) / 100;
            }
          }
          if (eff.offset) {
            effSpec.x = eff.offset.x;
            effSpec.y = eff.offset.y;
          }
          effSpec.radius = eff.radius || 0;
          effSpec.spread = eff.spread || 0;
        }

        spec.effects.push(effSpec);
      }

      result.styles.push(spec);
    }
  } catch (e) {}

  return result;
}

// ============================================================
// SECTION 13: PLUGIN MESSAGE HANDLER
// ============================================================

figma.showUI(__html__, { width: 520, height: 680 });

figma.ui.onmessage = async function(msg) {
  var source = msg.source || "generate";

  if (msg.type === "generate") {
    var spec = msg.spec;
    if (!spec) {
      figma.ui.postMessage({ type: "status", text: "Error: No spec provided", source: source });
      return;
    }

    // Route based on spec.type
    var specType = spec.type || "page";

    try {
      var result;

      if (specType === "foundation-variables") {
        figma.ui.postMessage({ type: "status", text: "Creating variables...", source: source });
        result = await doCreateVariables(spec);
      } else if (specType === "foundation-text-styles") {
        figma.ui.postMessage({ type: "status", text: "Creating text styles...", source: source });
        result = await doCreateTextStyles(spec);
      } else if (specType === "foundation-effects") {
        figma.ui.postMessage({ type: "status", text: "Creating effect styles...", source: source });
        result = await doCreateEffectStyles(spec);
      } else if (specType === "foundation-icons") {
        figma.ui.postMessage({ type: "status", text: "Creating icons...", source: source });
        result = await doCreateIcons(spec);
      } else if (specType === "foundation-components") {
        figma.ui.postMessage({ type: "status", text: "Creating components...", source: source });
        result = await doCreateComponents(spec);
      } else {
        // Default: page generation
        figma.ui.postMessage({ type: "status", text: "Generating...", source: source });
        result = await doGenerate(spec);
      }

      if (result.success) {
        var doneText = result.pageName
          ? "Done! Page '" + result.pageName + "' generated in " + result.elapsed + "ms"
          : "Done! " + (result.message || "") + " in " + result.elapsed + "ms";
        figma.ui.postMessage({ type: "status", text: doneText, source: source });
        if (result.log) figma.ui.postMessage({ type: "log", lines: result.log, source: source });
      } else {
        figma.ui.postMessage({ type: "status", text: "Error: " + result.error, source: source });
      }
    } catch (e) {
      figma.ui.postMessage({ type: "status", text: "Error: " + (e.message || String(e)), source: source });
    }
  }

  if (msg.type === "clear") {
    var result = doClear();
    figma.ui.postMessage({
      type: "status",
      text: "Cleared " + result.removed + " generated page(s)",
      source: "generate"
    });
  }

  if (msg.type === "export") {
    var what = msg.what || [];
    try {
      var exported = {};
      var summary = [];

      if (what.indexOf("variables") !== -1) {
        exported.variables = await doExportVariables();
        var colCount = exported.variables.collections ? exported.variables.collections.length : 0;
        var varCount = 0;
        for (var ci = 0; ci < (exported.variables.collections || []).length; ci++) {
          varCount += (exported.variables.collections[ci].variables || []).length;
        }
        summary.push(colCount + " collections (" + varCount + " vars)");
      }

      if (what.indexOf("text-styles") !== -1) {
        exported.textStyles = await doExportTextStyles();
        summary.push((exported.textStyles.styles || []).length + " text styles");
      }

      if (what.indexOf("effects") !== -1) {
        exported.effects = await doExportEffectStyles();
        summary.push((exported.effects.styles || []).length + " effect styles");
      }

      // If only one type exported, return that directly; otherwise wrap
      var keys = Object.keys(exported);
      var jsonOutput;
      if (keys.length === 1) {
        jsonOutput = JSON.stringify(exported[keys[0]], null, 2);
      } else {
        jsonOutput = JSON.stringify(exported, null, 2);
      }

      figma.ui.postMessage({
        type: "export-result",
        json: jsonOutput,
        summary: summary.join(", ")
      });
    } catch (e) {
      figma.ui.postMessage({ type: "status", text: "Error: " + (e.message || String(e)), source: "export" });
    }
  }
};
