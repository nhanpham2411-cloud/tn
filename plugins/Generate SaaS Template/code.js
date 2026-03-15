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
var _loadedFontsSet = {};   // "family|style" → true, prevents duplicate loadFontAsync
var _variantMapCache = {};  // componentSet.id → variant map
var _iconCache = {};        // icon name → component node (or null)
var _imageHashCache = {};   // url → imageHash (prevents re-fetching same image)
var _pendingImageRequests = {};
var _imageRequestId = 0;

function fetchImageFromUI(url) {
  return new Promise(function(resolve, reject) {
    var id = ++_imageRequestId;
    _pendingImageRequests[id] = { resolve: resolve, reject: reject };
    figma.ui.postMessage({ type: 'fetch-image', url: url, id: id });
    setTimeout(function() {
      if (_pendingImageRequests[id]) {
        delete _pendingImageRequests[id];
        reject(new Error('Image fetch timeout'));
      }
    }, 15000);
  });
}

var _prefetchedImages = {}; // url → byte array (from UI pre-fetch)

async function getImageHash(url) {
  if (_imageHashCache[url]) { console.log("[IMG] cache hit: " + url); return _imageHashCache[url]; }
  var imgBytes;
  if (_prefetchedImages[url]) {
    console.log("[IMG] prefetch hit: " + url + " bytes=" + _prefetchedImages[url].length);
    imgBytes = new Uint8Array(_prefetchedImages[url]);
  } else {
    console.log("[IMG] prefetch MISS, runtime fetch: " + url);
    console.log("[IMG] prefetch keys: " + Object.keys(_prefetchedImages).join(", "));
    imgBytes = await fetchImageFromUI(url);
    console.log("[IMG] runtime fetch OK, bytes=" + imgBytes.length);
  }
  var img = figma.createImage(imgBytes);
  console.log("[IMG] createImage OK, hash=" + img.hash);
  _imageHashCache[url] = img.hash;
  return img.hash;
}

async function loadCaches() {
  varCache = {};
  textStyleCache = {};
  componentSetCache = {};
  debugLog = [];
  _loadedFontsSet = {};
  _variantMapCache = {};
  _iconCache = {};
  _imageHashCache = {};

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

function findVar(name, preferredPrefix) {
  if (!name) return null;
  var lower = name.toLowerCase();
  var hyp = lower.replace(/ /g, "-");
  var spc = lower.replace(/-/g, " ");

  // When preferredPrefix is given, ONLY search within those prefixes (skip unscoped lookup)
  if (preferredPrefix) {
    var ppArr = Array.isArray(preferredPrefix) ? preferredPrefix : [preferredPrefix];
    for (var pp = 0; pp < ppArr.length; pp++) {
      if (varCache[ppArr[pp] + lower]) return varCache[ppArr[pp] + lower];
      if (varCache[ppArr[pp] + hyp]) return varCache[ppArr[pp] + hyp];
      if (varCache[ppArr[pp] + spc]) return varCache[ppArr[pp] + spc];
    }
    return null; // Don't fall through to other prefixes when preferred is specified
  }

  // Unscoped: try exact match first
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

// Scoped variable finders — prevent spacing/radius cross-contamination
function findSpacingVar(name) {
  return findVar(name, ["spacing/", "space/", "size/"]);
}

function findRadiusVar(name) {
  return findVar(name, ["border radius/", "radius/"]);
}

// Size variable finder — searches size/* collection only
function findSizeVar(name) {
  return findVar(name, ["size/"]);
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
  var paint = figma.variables.setBoundVariableForPaint(
    { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
    "color",
    variable
  );
  // Set opacity AFTER binding — setBoundVariableForPaint may drop it from the input
  if (opacity !== undefined && opacity < 1) paint.opacity = opacity;
  return paint;
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
    // Two-step: assign variable-bound paint first, then clone fills and set opacity.
    // Direct paint.opacity before node.fills assignment is unreliable —
    // Figma may clone the paint internally and drop the opacity value.
    node.fills = [makeBoundPaint(v)];
    var fills = node.fills.slice();
    fills[0] = Object.assign({}, fills[0], { opacity: opacity });
    node.fills = fills;
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

function setStrokeWithOpacity(node, varName, opacity) {
  var v = findVar(varName);
  if (v) {
    node.strokes = [makeBoundPaint(v)];
    var strokes = node.strokes.slice();
    strokes[0] = Object.assign({}, strokes[0], { opacity: opacity });
    node.strokes = strokes;
  }
}

// Reset stale properties on a variant comp from previous plugin runs.
// Called at the start of every variant build so removed JSON fields don't linger.
function _resetStaleProps(node) {
  // Size constraints
  try { node.setBoundVariable("minWidth", null); } catch(e) {}
  try { node.setBoundVariable("minHeight", null); } catch(e) {}
  node.minWidth = null;
  node.minHeight = null;
  // Stroke — clear so variants without stroke don't keep old borders
  node.strokes = [];
  node.strokeWeight = 0;
  node.strokeTopWeight = 0; node.strokeRightWeight = 0;
  node.strokeBottomWeight = 0; node.strokeLeftWeight = 0;
  node.dashPattern = [];
  // Effects — clear stale effect styles / focus rings
  node.effects = [];
  // Opacity — reset to fully opaque
  node.opacity = 1;
  // Clips content — reset to false
  node.clipsContent = false;
}

// Per-side stroke weights: "all" | "top,right,bottom" | "top,bottom,left" etc.
function _applyStrokeSides(node, sides, weight) {
  if (!sides || sides === "all") return; // uniform stroke, nothing to change
  var s = sides.split(",").map(function(x) { return x.trim().toLowerCase(); });
  var w = weight || 1;
  node.strokeTopWeight = s.indexOf("top") >= 0 ? w : 0;
  node.strokeRightWeight = s.indexOf("right") >= 0 ? w : 0;
  node.strokeBottomWeight = s.indexOf("bottom") >= 0 ? w : 0;
  node.strokeLeftWeight = s.indexOf("left") >= 0 ? w : 0;
}

// Focus ring → effect style name mapping
// "ring" → "Ring/default", "ring-error" → "Ring/error", "ring-brand" → "Ring/brand"
function _focusRingStyleName(ringVal) {
  if (!ringVal) return null;
  if (ringVal === "ring") return "Ring/default";
  var parts = ringVal.split("-");
  if (parts.length >= 2 && parts[0] === "ring") return "Ring/" + parts.slice(1).join("-");
  return "Ring/" + ringVal;
}

// Apply focus ring as effect style ONLY (no manual DROP_SHADOW)
// Requires effect styles (Ring/default, Ring/error, etc.) to exist in Figma
async function applyFocusRingEffect(node, ringVal) {
  var styleName = _focusRingStyleName(ringVal);
  if (!styleName) return;
  try {
    var _frStyles = await figma.getLocalEffectStylesAsync();
    for (var _fri = 0; _fri < _frStyles.length; _fri++) {
      if (_frStyles[_fri].name === styleName) {
        try { await node.setEffectStyleIdAsync(_frStyles[_fri].id); } catch(e) { node.effects = _frStyles[_fri].effects; }
        return;
      }
    }
  } catch(e) {}
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

// Bind spacing variable (padding, gap) — only searches spacing/* collections
function bindSpacing(node, field, varName, fallbackValue) {
  var v = findSpacingVar(varName);
  if (v) {
    try { node.setBoundVariable(field, v); return; } catch (e) {}
  }
  try { node[field] = fallbackValue; } catch (e) {}
}

// Bind radius variable — only searches border radius/* collections
function bindRadius(node, field, varName, fallbackValue) {
  var v = findRadiusVar(varName);
  if (v) {
    try { node.setBoundVariable(field, v); return; } catch (e) {}
  }
  try { node[field] = fallbackValue; } catch (e) {}
}

// Bind size variable (height/width) — only searches size/* collection
// No fallback needed: resize() already set the pixel value before this is called
function bindSizeVar(node, field, varName) {
  var v = findSizeVar(varName);
  if (v) {
    try { node.setBoundVariable(field, v); } catch (e) {}
  }
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
  "none": 0, "3xs": 4, "2xs": 6, "xs": 8, "sm": 12, "md": 16,
  "lg": 20, "xl": 24, "2xl": 32, "3xl": 40, "4xl": 48,
  "5xl": 64, "6xl": 80, "7xl": 96, "8xl": 128, "9xl": 160, "10xl": 192
};

var RADIUS_FALLBACKS = {
  "none": 0, "sm": 4, "md": 6, "lg": 8, "xl": 12, "2xl": 16, "3xl": 24, "full": 9999
};

function getSpacingValue(token) {
  if (typeof token === "number") return token;
  if (SPACING_FALLBACKS[token] !== undefined) return SPACING_FALLBACKS[token];
  // Handle full paths like "spacing/md"
  if (token.indexOf("/") !== -1) {
    var lastPart = token.split("/").pop();
    if (SPACING_FALLBACKS[lastPart] !== undefined) return SPACING_FALLBACKS[lastPart];
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

// ─── Foundation Docs helpers: bind spacing/radius variables ───
var _SPACING_TOKEN_MAP = { 0: "none", 2: "4xs", 4: "3xs", 6: "2xs", 8: "xs", 12: "sm", 16: "md", 20: "lg", 24: "xl", 32: "2xl", 40: "3xl", 48: "4xl", 56: "5xl", 64: "6xl" };
var _RADIUS_TOKEN_MAP = { 0: "none", 4: "sm", 6: "md", 8: "lg", 10: "10", 12: "xl", 16: "2xl", 24: "3xl", 9999: "full" };

function _bindSp(node, field, px) {
  node[field] = px; // Always set raw value first (safe for detached nodes)
  var token = _SPACING_TOKEN_MAP[px];
  if (token !== undefined) {
    try { var v = findVar("spacing/" + token); if (v) node.setBoundVariable(field, v); } catch(e) {}
  }
}
function _bindPad(node, top, right, bottom, left) {
  _bindSp(node, "paddingTop", top); _bindSp(node, "paddingRight", right);
  _bindSp(node, "paddingBottom", bottom); _bindSp(node, "paddingLeft", left);
}
function _bindRad(node, px) {
  node.cornerRadius = px; // Always set raw value first
  var token = _RADIUS_TOKEN_MAP[px];
  if (token !== undefined) {
    try { var v = findVar("border radius/" + token); if (v) node.setBoundVariable("cornerRadius", v); } catch(e) {}
  }
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

// Dedup wrapper: skips loadFontAsync if already loaded in this session
async function _loadFont(family, style) {
  var key = family + "|" + style;
  if (_loadedFontsSet[key]) return;
  try { await figma.loadFontAsync({ family: family, style: style }); _loadedFontsSet[key] = true; } catch(e) {}
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
  // Load all base fonts in parallel
  await Promise.all(fonts.map(function(f) { return loadFontSafe(f[0], f[1]); }));

  // Preload text style fonts (SprouX + ShopPulse) — collect unique fontNames then load in parallel
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
  var styleFontPromises = [];
  for (var s = 0; s < styleNames.length; s++) {
    var st = findTextStyle(styleNames[s]);
    if (st && st.fontName) styleFontPromises.push(_loadFont(st.fontName.family, st.fontName.style));
  }
  await Promise.all(styleFontPromises);
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
  var parts = keys.map(function(k) { return k + "=" + (variants[k] || ""); });
  return parts.join(", ").toLowerCase();
}

function buildVariantMap(componentSet) {
  if (_variantMapCache[componentSet.id]) return _variantMapCache[componentSet.id];
  var map = {};
  for (var i = 0; i < componentSet.children.length; i++) {
    var child = componentSet.children[i];
    if (child.type === "COMPONENT") {
      map[normalizeVariantKey(child.name)] = child;
    }
  }
  _variantMapCache[componentSet.id] = map;
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
      var expected = (prop + "=" + (targetVariants[prop] || "")).toLowerCase();
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
  if (_iconCache[iconName] !== undefined) return _iconCache[iconName];
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
      if (found) { _iconCache[iconName] = found; return found; }
    }
  }
  _iconCache[iconName] = null;
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
    case "image":
      node = await renderPlaceholder(spec, parent);
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

  // Image overrides — change image fill on nested instances by name
  // Format: "imageOverrides": { "Avatar": "https://...", "Thumbnail": "https://..." }
  if (overrides.imageOverrides) {
    var imgKeys = Object.keys(overrides.imageOverrides);
    for (var im = 0; im < imgKeys.length; im++) {
      var imgUrl = overrides.imageOverrides[imgKeys[im]];
      var imgTargetName = imgKeys[im];
      var imgNodes = instance.findAll(function(node) {
        return node.name === imgTargetName && (node.type === "INSTANCE" || node.type === "FRAME" || node.type === "RECTANGLE");
      });
      for (var imn = 0; imn < imgNodes.length; imn++) {
        try {
          var _oImgHash = await getImageHash(imgUrl);
          imgNodes[imn].fills = [{ type: "IMAGE", imageHash: _oImgHash, scaleMode: "FILL" }];
          console.log("[overrides] imageOverrides OK: " + imgTargetName + " = " + imgUrl);
        } catch (e) {
          console.log("[overrides] imageOverrides FAILED: " + imgTargetName + " " + e.message);
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

  // Image fill from URL (pre-fetched or runtime)
  if (spec.imageUrl) {
    try {
      var _imgHash = await getImageHash(spec.imageUrl);
      frame.fills = [{ type: "IMAGE", imageHash: _imgHash, scaleMode: spec.imageScaleMode || "FILL" }];
    } catch (e) {
      debugLog.push("renderPlaceholder imageUrl error: " + e.message);
    }
  }

  // Image fill from embedded base64 data
  if (spec.imageBase64) {
    try {
      var raw = spec.imageBase64;
      if (raw.indexOf(",") !== -1) raw = raw.split(",")[1];
      var binaryStr = atob(raw);
      var bytes = new Uint8Array(binaryStr.length);
      for (var bi = 0; bi < binaryStr.length; bi++) bytes[bi] = binaryStr.charCodeAt(bi);
      var img = figma.createImage(bytes);
      frame.fills = [{ type: "IMAGE", imageHash: img.hash, scaleMode: spec.imageScaleMode || "FILL" }];
    } catch (e) {
      debugLog.push("renderPlaceholder imageBase64 error: " + e.message);
    }
  }

  // Add label text (only if no image)
  if (spec.label && !spec.imageUrl && !spec.imageBase64) {
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
      bindSpacing(frame, "paddingTop", tokenName, val);
      bindSpacing(frame, "paddingRight", tokenName, val);
      bindSpacing(frame, "paddingBottom", tokenName, val);
      bindSpacing(frame, "paddingLeft", tokenName, val);
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
    bindSpacing(frame, "paddingTop", spec.padding.all, allVal);
    bindSpacing(frame, "paddingRight", spec.padding.all, allVal);
    bindSpacing(frame, "paddingBottom", spec.padding.all, allVal);
    bindSpacing(frame, "paddingLeft", spec.padding.all, allVal);
  }
  if (spec.padding.x) {
    var xVal = getSpacingValue(spec.padding.x);
    bindSpacing(frame, "paddingRight", spec.padding.x, xVal);
    bindSpacing(frame, "paddingLeft", spec.padding.x, xVal);
  }
  if (spec.padding.y) {
    var yVal = getSpacingValue(spec.padding.y);
    bindSpacing(frame, "paddingTop", spec.padding.y, yVal);
    bindSpacing(frame, "paddingBottom", spec.padding.y, yVal);
  }
  if (spec.padding.top) {
    bindSpacing(frame, "paddingTop", spec.padding.top, getSpacingValue(spec.padding.top));
  }
  if (spec.padding.right) {
    bindSpacing(frame, "paddingRight", spec.padding.right, getSpacingValue(spec.padding.right));
  }
  if (spec.padding.bottom) {
    bindSpacing(frame, "paddingBottom", spec.padding.bottom, getSpacingValue(spec.padding.bottom));
  }
  if (spec.padding.left) {
    bindSpacing(frame, "paddingLeft", spec.padding.left, getSpacingValue(spec.padding.left));
  }
}

function applyGap(frame, spec) {
  if (!spec.gap && spec.gap !== "auto") return;
  if (spec.gap === "auto") {
    frame.itemSpacing = 0;
    try { frame.setBoundVariable("itemSpacing", null); } catch(e) {}
    return;
  }
  var gapVal = getSpacingValue(spec.gap);
  if (typeof spec.gap === "string") {
    bindSpacing(frame, "itemSpacing", spec.gap, gapVal);
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
      bindRadius(frame, "topLeftRadius", token, val);
      bindRadius(frame, "topRightRadius", token, val);
      bindRadius(frame, "bottomLeftRadius", token, val);
      bindRadius(frame, "bottomRightRadius", token, val);
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
async function doGenerate(specInput, sendProgress) {
  if (!sendProgress) sendProgress = function() {};
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

  // Find or create page — NEVER clear existing content
  var page = null;
  var pages = figma.root.children;
  for (var p = 0; p < pages.length; p++) {
    if (pages[p].name === "[Gen] " + pageName) {
      page = pages[p];
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

  // Calculate starting X — place new frames after existing content
  var currentX = 0;
  for (var ei = 0; ei < page.children.length; ei++) {
    var existingChild = page.children[ei];
    var rightEdge = existingChild.x + existingChild.width;
    if (rightEdge + gap > currentX) {
      currentX = rightEdge + gap;
    }
  }

  // Build map of existing frames by name (for in-place upsert)
  var _existingFrameMap = {};
  for (var ri2 = 0; ri2 < rootSpecs.length; ri2++) {
    var rootName = rootSpecs[ri2].name;
    if (rootName) {
      for (var ei2 = 0; ei2 < page.children.length; ei2++) {
        if (page.children[ei2].name === rootName && page.children[ei2].type === "FRAME") {
          _existingFrameMap[rootName] = page.children[ei2];
          debugLog.push("  Upsert: found existing '" + rootName + "' — will update in place");
          break;
        }
      }
    }
  }

  // Apply dark mode to page (preserve/set on every generate)
  try {
    var _genCols = await figma.variables.getLocalVariableCollectionsAsync();
    for (var _gci = 0; _gci < _genCols.length; _gci++) {
      var _gc = _genCols[_gci];
      for (var _gmi = 0; _gmi < _gc.modes.length; _gmi++) {
        if (_gc.modes[_gmi].name.toLowerCase() === "dark") {
          page.setExplicitVariableModeForCollection(_gc.id, _gc.modes[_gmi].modeId);
          debugLog.push("  Dark mode set on page: " + _gc.name);
          break;
        }
      }
    }
  } catch(e) {
    debugLog.push("  WARN: Failed to set dark mode on page: " + e.message);
  }

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

  // Render each root (upsert: reuse existing frame if found)
  for (var ri = 0; ri < rootSpecs.length; ri++) {
    var rootSpec = rootSpecs[ri];
    var existingRoot = rootSpec.name ? _existingFrameMap[rootSpec.name] : null;

    if (existingRoot) {
      // ── Upsert: build new children first, then remove old ──
      var _oldGenChildren = [];
      for (var _ogi = 0; _ogi < existingRoot.children.length; _ogi++) {
        _oldGenChildren.push(existingRoot.children[_ogi]);
      }

      // Re-apply frame properties
      applyLayout(existingRoot, rootSpec);
      applyPadding(existingRoot, rootSpec);
      applyGap(existingRoot, rootSpec);
      applyFill(existingRoot, rootSpec);
      applyStroke(existingRoot, rootSpec);
      applyRadius(existingRoot, rootSpec);
      applyAlignment(existingRoot, rootSpec);
      if (rootSpec.clip === true || rootSpec.clipsContent === true) {
        existingRoot.clipsContent = true;
      } else {
        existingRoot.clipsContent = false;
      }
      applySizing(existingRoot, rootSpec);

      // Build new children into existing frame (appended after old)
      if (rootSpec.children && rootSpec.children.length > 0) {
        for (var uci = 0; uci < rootSpec.children.length; uci++) {
          var uChild = await renderNode(rootSpec.children[uci], existingRoot);
          if (uChild) {
            applyChildSizing(uChild, rootSpec.children[uci], rootSpec);
          }
        }
      }

      // Remove old children (new ones are already in place)
      for (var _ogi2 = 0; _ogi2 < _oldGenChildren.length; _ogi2++) {
        try { _oldGenChildren[_ogi2].remove(); } catch (e) {}
      }

      // Keep original position — do NOT move
      allNodes.push(existingRoot);
      debugLog.push("  Upsert: updated '" + rootSpec.name + "' in place (" + _oldGenChildren.length + " old removed, at " + existingRoot.x + "," + existingRoot.y + ")");
    } else {
      // ── Create new ──
      var rootNode = await renderNode(rootSpec, null);
      if (rootNode) {
        page.appendChild(rootNode);
        rootNode.x = currentX;
        rootNode.y = 0;
        currentX += rootNode.width + gap;
        allNodes.push(rootNode);
      }
    }
  }

  // Never change viewport — user keeps their current view position

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

async function doCreateVariables(spec, sendProgress) {
  var log = [];
  var startTime = Date.now();
  if (!sendProgress) sendProgress = function() {};
  var collections = spec.collections;
  if (!collections || !collections.length) {
    return { success: false, error: "No collections found in spec" };
  }

  // --- Load existing collections & variables for upsert ---
  var existingCols = [];
  try { existingCols = await figma.variables.getLocalVariableCollectionsAsync(); } catch (e) {}
  var existingColMap = {}; // name → collection
  for (var ec = 0; ec < existingCols.length; ec++) {
    existingColMap[existingCols[ec].name.toLowerCase()] = existingCols[ec];
  }

  var existingVarsAll = [];
  try {
    var _ec1 = await figma.variables.getLocalVariablesAsync("COLOR");
    var _ec2 = await figma.variables.getLocalVariablesAsync("FLOAT");
    var _ec3 = await figma.variables.getLocalVariablesAsync("STRING");
    existingVarsAll = _ec1.concat(_ec2).concat(_ec3);
  } catch (e) {}

  // Build lookup: collectionId → { varName → variable }
  var existingVarsByCol = {};
  for (var ev = 0; ev < existingVarsAll.length; ev++) {
    var _v = existingVarsAll[ev];
    var _colId = _v.variableCollectionId;
    if (!existingVarsByCol[_colId]) existingVarsByCol[_colId] = {};
    existingVarsByCol[_colId][_v.name.toLowerCase()] = _v;
  }

  var stats = { created: 0, updated: 0, deleted: 0, colCreated: 0, colUpdated: 0 };

  // GLOBAL lookup for cross-collection alias resolution (existing + new)
  var globalVarLookup = {};
  // Pre-populate with ALL existing variables so aliases can resolve
  for (var _pe = 0; _pe < existingVarsAll.length; _pe++) {
    var _pv = existingVarsAll[_pe];
    var _peCol = existingCols.filter(function(c) { return c.id === _pv.variableCollectionId; })[0];
    if (_peCol) {
      var _peKey = (_peCol.name + "/" + _pv.name).toLowerCase();
      globalVarLookup[_peKey] = _pv;
      var _peShort = _pv.name.toLowerCase();
      if (!globalVarLookup[_peShort]) globalVarLookup[_peShort] = _pv;
    }
  }

  var collectionData = [];

  // PASS 1: Upsert collections + variables (no values yet)
  for (var ci = 0; ci < collections.length; ci++) {
    var colSpec = collections[ci];
    sendProgress("Variables — " + colSpec.name + " [" + (ci + 1) + "/" + collections.length + "]");
    var colKey = colSpec.name.toLowerCase();
    var col = existingColMap[colKey] || null;
    var isNewCol = !col;

    if (isNewCol) {
      col = figma.variables.createVariableCollection(colSpec.name);
      stats.colCreated++;
      log.push("Created collection: " + colSpec.name);
    } else {
      stats.colUpdated++;
      log.push("Updating collection: " + colSpec.name);
    }

    // Setup modes
    var modeMap = {};
    var existingModes = col.modes.slice(); // [{modeId, name}]
    var existingModeNames = {};
    for (var em = 0; em < existingModes.length; em++) {
      existingModeNames[existingModes[em].name] = existingModes[em].modeId;
    }

    if (colSpec.modes && colSpec.modes.length > 0) {
      // First mode: rename existing first mode if needed
      if (existingModes.length > 0 && existingModes[0].name !== colSpec.modes[0]) {
        col.renameMode(existingModes[0].modeId, colSpec.modes[0]);
      }
      modeMap[colSpec.modes[0]] = existingModes[0] ? existingModes[0].modeId : col.modes[0].modeId;

      // Additional modes: find existing or add
      for (var mi = 1; mi < colSpec.modes.length; mi++) {
        var specModeName = colSpec.modes[mi];
        if (existingModeNames[specModeName]) {
          modeMap[specModeName] = existingModeNames[specModeName];
        } else {
          var newModeId = col.addMode(specModeName);
          modeMap[specModeName] = newModeId;
        }
      }

      // Remove extra modes not in spec (except the ones we just mapped)
      var specModeSet = {};
      for (var sm = 0; sm < colSpec.modes.length; sm++) specModeSet[colSpec.modes[sm]] = true;
      var currentModes = col.modes.slice();
      for (var rm = 0; rm < currentModes.length; rm++) {
        if (!specModeSet[currentModes[rm].name] && currentModes.length > 1) {
          try { col.removeMode(currentModes[rm].modeId); } catch (e) {}
        }
      }
    } else {
      modeMap["default"] = col.modes[0].modeId;
    }

    // Upsert variables within this collection
    var specVars = colSpec.variables || [];
    var colVarMap = existingVarsByCol[col.id] || {};
    var seenVarNames = {};

    for (var vi = 0; vi < specVars.length; vi++) {
      var vs = specVars[vi];
      var varType = (vs.type || "COLOR").toUpperCase();
      var varNameKey = vs.name.toLowerCase();
      seenVarNames[varNameKey] = true;

      var v = colVarMap[varNameKey] || null;

      if (v) {
        // Existing variable — update scopes & hiddenFromPublishing
        log.push("  Updating variable: " + vs.name);
        stats.updated++;
      } else {
        // New variable
        v = figma.variables.createVariable(vs.name, col, varType);
        log.push("  Created variable: " + vs.name);
        stats.created++;
      }

      // Apply scopes
      var _scopes = vs.scopes !== undefined ? vs.scopes : colSpec.scopes;
      if (_scopes !== undefined) {
        try { v.scopes = _scopes; } catch (e) {}
      }

      // hiddenFromPublishing
      if (vs.hiddenFromPublishing !== undefined) {
        try { v.hiddenFromPublishing = vs.hiddenFromPublishing; } catch (e) {}
      } else if (colSpec.hiddenFromPublishing !== undefined) {
        try { v.hiddenFromPublishing = colSpec.hiddenFromPublishing; } catch (e) {}
      }

      // Register in global lookup
      var fullKey = (colSpec.name + "/" + vs.name).toLowerCase();
      globalVarLookup[fullKey] = v;
      var shortKey = vs.name.toLowerCase();
      if (!globalVarLookup[shortKey]) globalVarLookup[shortKey] = v;
    }

    // Delete variables that exist in Figma but NOT in spec
    var colVarKeys = Object.keys(colVarMap);
    for (var dv = 0; dv < colVarKeys.length; dv++) {
      if (!seenVarNames[colVarKeys[dv]]) {
        var toDelete = colVarMap[colVarKeys[dv]];
        log.push("  Deleted variable: " + toDelete.name);
        try { toDelete.remove(); } catch (e) { log.push("    WARN: could not delete " + toDelete.name + ": " + e.message); }
        stats.deleted++;
      }
    }

    collectionData.push({ col: col, modeMap: modeMap, specVars: colSpec.variables, colName: colSpec.name });
  }

  log.push("Pass 1 done: " + stats.created + " created, " + stats.updated + " updated, " + stats.deleted + " deleted. Setting values...");

  // PASS 2: Set all values (now global lookup has everything for alias resolution)
  for (var ci2 = 0; ci2 < collectionData.length; ci2++) {
    var cd = collectionData[ci2];
    var variables2 = cd.specVars || [];

    for (var vi2 = 0; vi2 < variables2.length; vi2++) {
      var vs2 = variables2[vi2];
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
  var summary = stats.colCreated + " new + " + stats.colUpdated + " updated collections, " +
    stats.created + " new + " + stats.updated + " updated + " + stats.deleted + " deleted variables";
  log.push("Done! " + summary + " in " + elapsed + "ms");

  return {
    success: true,
    message: summary,
    elapsed: elapsed,
    log: log
  };
}

// ============================================================
// SECTION 10: FOUNDATION — CREATE TEXT STYLES
// ============================================================

async function doCreateTextStyles(spec, sendProgress) {
  var log = [];
  var startTime = Date.now();
  if (!sendProgress) sendProgress = function() {};
  var styles = spec.styles;
  if (!styles || !styles.length) {
    return { success: false, error: "No styles found in spec" };
  }

  // --- Load existing text styles for upsert ---
  var existingStyles = [];
  try { existingStyles = await figma.getLocalTextStylesAsync(); } catch (e) {}
  var existingMap = {}; // name → style
  for (var es = 0; es < existingStyles.length; es++) {
    existingMap[existingStyles[es].name.toLowerCase()] = existingStyles[es];
  }

  var stats = { created: 0, updated: 0, deleted: 0 };
  var seenNames = {};

  for (var si = 0; si < styles.length; si++) {
    var s = styles[si];
    sendProgress("Text styles [" + (si + 1) + "/" + styles.length + "] " + s.name);
    var nameKey = s.name.toLowerCase();
    seenNames[nameKey] = true;

    // Load font
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

    // Upsert: find existing or create new
    var textStyle = existingMap[nameKey] || null;
    if (textStyle) {
      stats.updated++;
      log.push("Updating text style: " + s.name);
    } else {
      textStyle = figma.createTextStyle();
      textStyle.name = s.name;
      stats.created++;
      log.push("Created text style: " + s.name + " (" + fontFamily + " " + fontStyle + " " + (s.fontSize || 14) + "px)");
    }

    // Apply properties (always overwrite to sync)
    textStyle.fontName = { family: fontFamily, style: fontStyle };
    textStyle.fontSize = s.fontSize || 14;

    if (s.lineHeight) {
      textStyle.lineHeight = { value: s.lineHeight, unit: "PIXELS" };
    }
    if (s.letterSpacing) {
      if (typeof s.letterSpacing === "string" && s.letterSpacing.endsWith("em")) {
        var emVal = parseFloat(s.letterSpacing);
        textStyle.letterSpacing = { value: emVal * 100, unit: "PERCENT" };
      } else {
        textStyle.letterSpacing = { value: parseFloat(s.letterSpacing), unit: "PIXELS" };
      }
    }
    if (s.textCase) {
      textStyle.textCase = s.textCase;
    }
  }

  // Delete text styles that exist in Figma but NOT in spec
  var existingKeys = Object.keys(existingMap);
  for (var di = 0; di < existingKeys.length; di++) {
    if (!seenNames[existingKeys[di]]) {
      var toDelete = existingMap[existingKeys[di]];
      log.push("Deleted text style: " + toDelete.name);
      try { toDelete.remove(); } catch (e) { log.push("  WARN: could not delete " + toDelete.name + ": " + e.message); }
      stats.deleted++;
    }
  }

  var elapsed = Date.now() - startTime;
  var summary = stats.created + " new + " + stats.updated + " updated + " + stats.deleted + " deleted text styles";
  log.push("Done! " + summary + " in " + elapsed + "ms");

  return {
    success: true,
    message: summary,
    elapsed: elapsed,
    log: log
  };
}

// ============================================================
// SECTION 11: FOUNDATION — CREATE EFFECT STYLES
// ============================================================

async function doCreateEffectStyles(spec, sendProgress) {
  var log = [];
  var startTime = Date.now();
  if (!sendProgress) sendProgress = function() {};
  var styles = spec.styles;
  if (!styles || !styles.length) {
    return { success: false, error: "No styles found in spec" };
  }

  // Load variable caches so findVar() can resolve ring tokens
  await loadCaches();

  // --- Load existing effect styles for upsert ---
  var existingStyles = [];
  try { existingStyles = await figma.getLocalEffectStylesAsync(); } catch (e) {}
  var existingMap = {}; // name → style
  for (var es = 0; es < existingStyles.length; es++) {
    existingMap[existingStyles[es].name.toLowerCase()] = existingStyles[es];
  }

  var stats = { created: 0, updated: 0, deleted: 0 };
  var seenNames = {};

  for (var si = 0; si < styles.length; si++) {
    var s = styles[si];
    sendProgress("Effect styles [" + (si + 1) + "/" + styles.length + "] " + s.name);
    var nameKey = s.name.toLowerCase();
    seenNames[nameKey] = true;

    // Build effects array
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
          spread: e.spread || 0,
          showShadowBehindNode: e.showShadowBehindNode !== undefined ? e.showShadowBehindNode : true
        };
      }

      effects.push(effect);
    }

    // Upsert: find existing or create new
    var effectStyle = existingMap[nameKey] || null;
    if (effectStyle) {
      stats.updated++;
      log.push("Updating effect style: " + s.name + " (" + layers.length + " layers)");
    } else {
      effectStyle = figma.createEffectStyle();
      effectStyle.name = s.name;
      stats.created++;
      log.push("Created effect style: " + s.name + " (" + layers.length + " layers)");
    }

    // Apply effects first (raw values)
    effectStyle.effects = effects;

    // Bind variable to effect color using setBoundVariableForEffect (for Light/Dark mode switching)
    // WORKAROUND: setBoundVariableForEffect resets spread to 0 (known Figma bug)
    // Fix: use result from API but restore spread from original effect
    if (s.variable) {
      var effVar = findVar(s.variable);
      if (effVar) {
        var boundEffects = [];
        var srcEffects = effectStyle.effects;
        for (var bei = 0; bei < srcEffects.length; bei++) {
          var origSpread = srcEffects[bei].spread;
          var origShowBehind = srcEffects[bei].showShadowBehindNode;
          var bound = figma.variables.setBoundVariableForEffect(srcEffects[bei], "color", effVar);
          // Restore spread (bug: API resets to 0)
          bound = Object.assign({}, bound, { spread: origSpread });
          if (origShowBehind !== undefined) bound.showShadowBehindNode = origShowBehind;
          boundEffects.push(bound);
        }
        effectStyle.effects = boundEffects;
        log.push("  Bound variable '" + s.variable + "' to " + s.name);
      } else {
        log.push("  WARN: variable '" + s.variable + "' not found for " + s.name);
      }
    }
  }

  // Delete effect styles that exist in Figma but NOT in spec
  var existingKeys = Object.keys(existingMap);
  for (var di = 0; di < existingKeys.length; di++) {
    if (!seenNames[existingKeys[di]]) {
      var toDelete = existingMap[existingKeys[di]];
      log.push("Deleted effect style: " + toDelete.name);
      try { toDelete.remove(); } catch (e) { log.push("  WARN: could not delete " + toDelete.name + ": " + e.message); }
      stats.deleted++;
    }
  }

  var elapsed = Date.now() - startTime;
  var summary = stats.created + " new + " + stats.updated + " updated + " + stats.deleted + " deleted effect styles";
  log.push("Done! " + summary + " in " + elapsed + "ms");

  return {
    success: true,
    message: summary,
    elapsed: elapsed,
    log: log
  };
}

// ============================================================
// SECTION 11A: FOUNDATION — CREATE ICONS (UPSERT)
// ============================================================

/**
 * Create/update icon Components from SVG strings (UPSERT).
 * Detects existing "Icon / {name}" components → keeps them (preserves instances).
 * Only creates NEW components for icons not yet on the canvas.
 * Brand icons (brand: true) keep original multi-color fills — no variable binding.
 * Showcase always uses instances — never moves component originals.
 *
 * JSON: { type: "foundation-icons", targetPage: "🔣 Icons", size: 24,
 *         icons: [{ name: "Search", svg: "<svg ...>...</svg>" },
 *                 { name: "Google", svg: "...", brand: true }, ...] }
 */
async function doCreateIcons(spec, sendProgress) {
  var log = [];
  var startTime = Date.now();
  if (!sendProgress) sendProgress = function() {};
  await loadCaches();
  await preloadCommonFonts();

  var icons = spec.icons;
  if (!icons || !icons.length) return { success: false, error: "No icons found in spec" };

  var targetPage = figma.currentPage;
  if (spec.targetPage) {
    var spName = spec.targetPage.trim();
    for (var i = 0; i < figma.root.children.length; i++) {
      var pgName = figma.root.children[i].name.trim();
      // Exact match or contains match (handle emoji encoding differences)
      if (pgName === spName || pgName.indexOf(spName) >= 0 || spName.indexOf(pgName) >= 0) {
        targetPage = figma.root.children[i];
        break;
      }
    }
    // Fallback: partial text match without emoji
    if (targetPage === figma.currentPage && spName !== figma.currentPage.name) {
      var spText = spName.replace(/[^\w\s]/g, "").trim().toLowerCase();
      for (var i = 0; i < figma.root.children.length; i++) {
        var pgText = figma.root.children[i].name.replace(/[^\w\s]/g, "").trim().toLowerCase();
        if (pgText === spText || pgText.indexOf(spText) >= 0) {
          targetPage = figma.root.children[i];
          break;
        }
      }
    }
  }
  log.push("Target page resolved: '" + targetPage.name + "' (requested: '" + (spec.targetPage || "current") + "')");
  await figma.setCurrentPageAsync(targetPage);

  var size = spec.size || 24;

  // --- Step 1: Find existing showcase (keep it, don't rebuild) ---
  var oldShowcase = null;
  var tpNodes = targetPage.children;
  for (var si = 0; si < tpNodes.length; si++) {
    if (tpNodes[si].type === "FRAME" && tpNodes[si].name === "Icons \u2014 Showcase") {
      oldShowcase = tpNodes[si];
      break;
    }
  }

  // --- Step 2: Build lookup map of ALL existing icon components ---
  // Components live inside showcase cards OR loose on page. Scan everything.
  var existingIconMap = {};
  var tpComps = targetPage.findAll(function(n) {
    return n.type === "COMPONENT";
  });
  for (var ci = 0; ci < tpComps.length; ci++) {
    var cn = tpComps[ci].name;
    existingIconMap[cn] = tpComps[ci];
  }
  var iconCount = 0;
  var flagCompCount = 0;
  var iconSample = [];
  for (var ek in existingIconMap) {
    if (ek.indexOf("Icon / ") === 0) {
      iconCount++;
      if (iconSample.length < 3) iconSample.push(ek);
    } else if (ek.indexOf("Flag / ") === 0) {
      flagCompCount++;
    }
  }
  log.push("Found " + iconCount + " icon + " + flagCompCount + " flag components on '" + targetPage.name + "'");
  if (iconSample.length > 0) log.push("Samples: " + iconSample.join(", "));

  // --- Step 3: Upsert icons ---
  // Uses SVG hash stored in component.description to detect changes.
  // Format: "svg:{hash}" appended to description.
  // If hash matches → skip (keep as-is). If hash differs → update SVG children.
  var created = 0;
  var kept = 0;
  var updated = 0;
  var iconComps = []; // parallel with icons[] array

  // Simple string hash (djb2)
  function hashSvg(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) + h + str.charCodeAt(i)) & 0x7fffffff;
    }
    return "svg:" + h.toString(36);
  }

  // Helper: bind vector fills/strokes to foreground variable
  var fgVar = findVar("foreground");
  function bindForeground(parentNode) {
    if (!fgVar) return;
    var vectors = parentNode.findAll(function(n) {
      return n.type === "VECTOR" || n.type === "LINE" || n.type === "ELLIPSE"
        || n.type === "RECTANGLE" || n.type === "POLYGON" || n.type === "STAR"
        || n.type === "BOOLEAN_OPERATION";
    });
    for (var v = 0; v < vectors.length; v++) {
      var vec = vectors[v];
      if (vec.strokes && vec.strokes.length > 0) {
        vec.strokes = [makeBoundPaint(fgVar)];
      }
      if (vec.fills && vec.fills.length > 0) {
        var hasFill = false;
        for (var f = 0; f < vec.fills.length; f++) {
          if (vec.fills[f].type === "SOLID" && vec.fills[f].opacity !== 0) hasFill = true;
        }
        if (hasFill) vec.fills = [makeBoundPaint(fgVar)];
      }
    }
  }

  // Helper: outline strokes → fills so icon strokes scale with instance resize
  // Uses outlineStroke() on each vector, then flattens into single vector
  function outlineIconStrokes(comp) {
    if (comp.children.length === 0) return;
    // Step 1: outline all stroke-based vectors
    var vectors = comp.findAll(function(n) {
      return n.type === "VECTOR" || n.type === "LINE" || n.type === "ELLIPSE"
        || n.type === "RECTANGLE" || n.type === "POLYGON" || n.type === "STAR";
    });
    var outlinedNodes = [];
    var toRemove = [];
    for (var vi = 0; vi < vectors.length; vi++) {
      var vec = vectors[vi];
      if (vec.strokes && vec.strokes.length > 0 && vec.strokeWeight > 0) {
        try {
          var outlined = vec.outlineStroke();
          if (outlined) {
            var vecParent = vec.parent;
            if (vecParent) {
              var idx = Array.prototype.indexOf.call(vecParent.children, vec);
              vecParent.insertChild(idx, outlined);
              outlinedNodes.push(outlined);
            }
            // Check if original is stroke-only (fill=none or transparent)
            var hasVisibleFill = false;
            if (vec.fills && vec.fills.length > 0) {
              for (var fi = 0; fi < vec.fills.length; fi++) {
                if (vec.fills[fi].visible !== false && vec.fills[fi].opacity !== 0) {
                  hasVisibleFill = true;
                  break;
                }
              }
            }
            if (!hasVisibleFill) {
              toRemove.push(vec);
            } else {
              // Has both fills and strokes — keep fills, remove strokes
              vec.strokes = [];
            }
          }
        } catch (oe) {
          // outlineStroke not supported for this node — skip
        }
      }
    }
    // Remove stroke-only originals
    for (var ri = 0; ri < toRemove.length; ri++) {
      toRemove[ri].remove();
    }
    // Step 2: flatten all remaining children into single vector
    if (comp.children.length > 0) {
      var allChildren = [];
      for (var ci = 0; ci < comp.children.length; ci++) {
        allChildren.push(comp.children[ci]);
      }
      try {
        var flat = figma.flatten(allChildren, comp);
        flat.constraints = { horizontal: "SCALE", vertical: "SCALE" };
        // Re-bind foreground
        if (fgVar) {
          if (flat.fills && flat.fills.length > 0) {
            flat.fills = [makeBoundPaint(fgVar)];
          }
          // After outline, strokes should be gone — but clean up just in case
          if (flat.strokes && flat.strokes.length > 0) {
            flat.strokes = [];
          }
        }
      } catch (fe) {
        log.push("WARN: flatten failed: " + fe.message);
      }
    }
  }

  // Helper: update SVG children of existing component
  function replaceChildren(comp, svgStr, skipColorBind, sz) {
    while (comp.children.length > 0) {
      comp.children[0].remove();
    }
    var svgFrame = figma.createNodeFromSvg(svgStr);
    while (svgFrame.children.length > 0) {
      comp.appendChild(svgFrame.children[0]);
    }
    svgFrame.remove();
    comp.resize(sz, sz);
    if (!skipColorBind) {
      bindForeground(comp);
      outlineIconStrokes(comp);
    }
  }

  // Helper: read stored hash from component description
  function getHash(comp) {
    var desc = comp.description || "";
    var match = desc.match(/svg:[a-z0-9]+/);
    return match ? match[0] : null;
  }

  // Helper: store hash in component description
  function setHash(comp, hash) {
    var desc = comp.description || "";
    // Remove old hash if present
    desc = desc.replace(/\nsvg:[a-z0-9]+$/, "").replace(/^svg:[a-z0-9]+$/, "").trim();
    comp.description = desc ? desc + "\n" + hash : hash;
  }


  // Log first 5 existing icon names for debugging
  var existingNames = Object.keys(existingIconMap);
  log.push("Sample existing: " + existingNames.slice(0, 5).join(", ") + (existingNames.length > 5 ? " ..." : ""));

  for (var i = 0; i < icons.length; i++) {
    var iconSpec = icons[i];
    var isBrand = !!iconSpec.brand;
    var isFlag = !!iconSpec.flag;
    var compName = isFlag ? "Flag / " + iconSpec.name : "Icon / " + iconSpec.name;
    var newHash = hashSvg(iconSpec.svg);

    try {
      sendProgress("Icons [" + (i + 1) + "/" + icons.length + "] " + iconSpec.name + (isBrand ? " (brand)" : isFlag ? " (flag)" : ""));

      // Try exact match first, then without prefix fallback
      var existing = existingIconMap[compName] || existingIconMap[iconSpec.name] || null;

      if (existing) {
        // Ensure correct name with "Icon / " prefix
        if (existing.name !== compName) {
          log.push("Renamed '" + existing.name + "' → '" + compName + "'");
          existing.name = compName;
        }
        // Hash comparison — skip unchanged icons to preserve instance overrides in components
        var existingHash = getHash(existing);
        if (existingHash === newHash) {
          iconComps.push(existing);
          kept++;
        } else {
          replaceChildren(existing, iconSpec.svg, isBrand || isFlag, size);
          setHash(existing, newHash);
          iconComps.push(existing);
          updated++;
        }
      } else {
        // CREATE new component
        var svgFrame = figma.createNodeFromSvg(iconSpec.svg);
        var comp = figma.createComponent();
        comp.name = compName;
        comp.resize(size, size);
        comp.clipsContent = false;
        comp.fills = [];
        comp.constraints = { horizontal: "SCALE", vertical: "SCALE" };

        while (svgFrame.children.length > 0) {
          comp.appendChild(svgFrame.children[0]);
        }
        svgFrame.remove();

        // Bind colors + outline strokes (skip for brand/flag icons — keep original multi-color fills)
        if (!isBrand && !isFlag) {
          bindForeground(comp);
          outlineIconStrokes(comp);
        }

        // Store hash for future change detection
        setHash(comp, newHash);
        targetPage.appendChild(comp);
        iconComps.push(comp);
        created++;
      }
    } catch (err) {
      log.push("WARN: Icon '" + iconSpec.name + "' failed: " + err.message);
      iconComps.push(null); // placeholder to keep parallel with icons[]
    }
  }

  log.push("Kept " + kept + ", updated " + updated + ", created " + created + " / " + icons.length + " total");

  // --- Step 3.5: Delete icon components NOT in JSON ---
  var specIconNames = {};
  for (var sni = 0; sni < icons.length; sni++) {
    var prefix = icons[sni].flag ? "Flag / " : "Icon / ";
    specIconNames[prefix + icons[sni].name] = true;
  }
  var deleted = 0;
  var allPageComps = targetPage.findAll(function(n) { return n.type === "COMPONENT" && (n.name.indexOf("Icon / ") === 0 || n.name.indexOf("Flag / ") === 0); });
  for (var dci = 0; dci < allPageComps.length; dci++) {
    if (!specIconNames[allPageComps[dci].name]) {
      log.push("Deleted icon: " + allPageComps[dci].name);
      // Remove parent card if inside showcase
      var parentCard = allPageComps[dci].parent;
      if (parentCard && parentCard.type === "FRAME" && parentCard.parent && parentCard.parent.type === "FRAME"
          && (parentCard.parent.name === "Brand Grid" || parentCard.parent.name === "Icon Grid" || parentCard.parent.name === "Flag Grid")) {
        try { parentCard.remove(); } catch (e) {}
      } else {
        try { allPageComps[dci].remove(); } catch (e) {}
      }
      deleted++;
    }
  }
  if (deleted > 0) log.push("Deleted " + deleted + " icons not in JSON");

  // --- Step 4: Ensure showcase has ALL icons from JSON ---
  // Check which icons are missing from showcase grids, add only those.
  // Never move existing icons — they stay where they are.

  // Helper: create icon card with ACTUAL component
  function makeIconCard(comp, label, parent) {
    var card = figma.createFrame();
    card.name = label;
    card.layoutMode = "VERTICAL";
    _bindSp(card, "itemSpacing", 6);
    card.counterAxisAlignItems = "CENTER";
    card.primaryAxisAlignItems = "CENTER";
    _bindPad(card, 12, 8, 8, 8);
    card.resize(80, 60);
    card.layoutSizingHorizontal = "FIXED";
    card.layoutSizingVertical = "HUG";
    setFill(card, "card");
    _bindRad(card, 8);
    parent.appendChild(card);
    card.appendChild(comp);
    return card;
  }

  if (oldShowcase) {
    // Build set of icon names already IN the showcase (component nodes inside cards)
    var showcaseComps = oldShowcase.findAll(function(n) { return n.type === "COMPONENT"; });
    log.push("Showcase has " + showcaseComps.length + " components");

    // Find existing grids
    var brandGrid = oldShowcase.findOne(function(n) { return n.type === "FRAME" && n.name === "Brand Grid"; });
    var iconGrid = oldShowcase.findOne(function(n) { return n.type === "FRAME" && n.name === "Icon Grid"; });
    var flagGrid = oldShowcase.findOne(function(n) { return n.type === "FRAME" && n.name === "Flag Grid"; });

    // Ensure "Icons" header exists above Icon Grid (added for parity with Brand Logos header)
    var iconsHeader = oldShowcase.findOne(function(n) { return n.type === "FRAME" && n.name === "Icons"; });
    if (!iconsHeader && iconGrid) {
      iconsHeader = figma.createFrame();
      iconsHeader.name = "Icons"; iconsHeader.layoutMode = "VERTICAL";
      _bindSp(iconsHeader, "itemSpacing", 12);
      _bindPad(iconsHeader, 0, 0, 0, 0);
      _bindRad(iconsHeader, 0);
      iconsHeader.fills = []; iconsHeader.clipsContent = false;
      // Insert right before Icon Grid
      var igIdx = oldShowcase.children.indexOf(iconGrid);
      if (igIdx >= 0) oldShowcase.insertChild(igIdx, iconsHeader);
      else oldShowcase.appendChild(iconsHeader);
      try { iconsHeader.layoutSizingHorizontal = "FILL"; iconsHeader.layoutSizingVertical = "HUG"; } catch (e) {}
      await _makeLabel("Icons", "SP/H3", "foreground", iconsHeader);
      log.push("Added 'Icons' header label");
    }

    // Build set of names in Brand Grid, Icon Grid, and Flag Grid separately
    var inBrandGridSet = {};
    if (brandGrid) {
      var bgComps = brandGrid.findAll(function(n) { return n.type === "COMPONENT"; });
      for (var bgi = 0; bgi < bgComps.length; bgi++) inBrandGridSet[bgComps[bgi].name] = true;
    }
    var inIconGridSet = {};
    if (iconGrid) {
      var igComps = iconGrid.findAll(function(n) { return n.type === "COMPONENT"; });
      for (var igi = 0; igi < igComps.length; igi++) inIconGridSet[igComps[igi].name] = true;
    }
    var inFlagGridSet = {};
    if (flagGrid) {
      var fgComps = flagGrid.findAll(function(n) { return n.type === "COMPONENT"; });
      for (var fgi = 0; fgi < fgComps.length; fgi++) inFlagGridSet[fgComps[fgi].name] = true;
    }

    var added = 0;
    for (var ic = 0; ic < icons.length; ic++) {
      if (!iconComps[ic]) continue;
      var compName = icons[ic].flag ? "Flag / " + icons[ic].name : "Icon / " + icons[ic].name;

      if (icons[ic].flag) {
        // Flag icon belongs in Flag Grid — skip only if already there
        if (inFlagGridSet[compName]) continue;
        if (!flagGrid) {
          // Create flag section — insert after last grid/separator
          var flagHeader = figma.createFrame();
          flagHeader.name = "Country Flags"; flagHeader.layoutMode = "VERTICAL";
          _bindSp(flagHeader, "itemSpacing", 12);
          _bindPad(flagHeader, 0, 0, 0, 0);
          _bindRad(flagHeader, 0);
          flagHeader.fills = []; flagHeader.clipsContent = false;
          oldShowcase.appendChild(flagHeader);
          try { flagHeader.layoutSizingHorizontal = "FILL"; flagHeader.layoutSizingVertical = "HUG"; } catch (e) {}
          await _makeLabel("Country Flags", "SP/H3", "foreground", flagHeader);

          flagGrid = figma.createFrame();
          flagGrid.name = "Flag Grid";
          flagGrid.layoutMode = "HORIZONTAL"; flagGrid.layoutWrap = "WRAP";
          _bindSp(flagGrid, "itemSpacing", 8);
          _bindSp(flagGrid, "counterAxisSpacing", 8);
          _bindPad(flagGrid, 0, 0, 0, 0);
          _bindRad(flagGrid, 0);
          flagGrid.fills = []; flagGrid.clipsContent = false;
          oldShowcase.appendChild(flagGrid);
          try { flagGrid.layoutSizingHorizontal = "FILL"; flagGrid.layoutSizingVertical = "HUG"; } catch (e) {}
        }
        var card = makeIconCard(iconComps[ic], icons[ic].name, flagGrid);
        await _makeLabel(icons[ic].name, "SP/Caption", "muted-foreground", card);
        added++;
      } else if (icons[ic].brand) {
        // Brand icon belongs in Brand Grid — skip only if already there
        if (inBrandGridSet[compName]) continue;
        // If it's in Icon Grid, move its card to Brand Grid (or remove old card)
        if (inIconGridSet[compName] && iconGrid) {
          // Find and remove the old card containing this component from Icon Grid
          var oldCard = null;
          for (var oci = 0; oci < iconGrid.children.length; oci++) {
            var cardChild = iconGrid.children[oci];
            if (cardChild.type === "FRAME") {
              var innerComp = cardChild.findOne(function(n) { return n.type === "COMPONENT" && n.name === compName; });
              if (innerComp) { oldCard = cardChild; break; }
            }
          }
          if (oldCard) {
            // Move component out, remove old card
            try { targetPage.appendChild(iconComps[ic]); } catch (e) {}
            try { oldCard.remove(); } catch (e) {}
          }
        }
        if (!brandGrid) {
          // Create brand section if it doesn't exist yet
          var sepIdx = -1;
          for (var ci2 = 0; ci2 < oldShowcase.children.length; ci2++) {
            if (oldShowcase.children[ci2].name === "Divider") { sepIdx = ci2; break; }
          }
          var brandHeader = figma.createFrame();
          brandHeader.name = "Brand Logos"; brandHeader.layoutMode = "VERTICAL";
          _bindSp(brandHeader, "itemSpacing", 12);
          brandHeader.fills = []; brandHeader.clipsContent = false;
          oldShowcase.insertChild(sepIdx + 1, brandHeader);
          try { brandHeader.layoutSizingHorizontal = "FILL"; brandHeader.layoutSizingVertical = "HUG"; } catch (e) {}
          await _makeLabel("Brand Logos", "SP/H3", "foreground", brandHeader);

          brandGrid = figma.createFrame();
          brandGrid.name = "Brand Grid";
          brandGrid.layoutMode = "HORIZONTAL"; brandGrid.layoutWrap = "WRAP";
          _bindSp(brandGrid, "itemSpacing", 8);
          _bindSp(brandGrid, "counterAxisSpacing", 8);
          brandGrid.fills = []; brandGrid.clipsContent = false;
          oldShowcase.insertChild(sepIdx + 2, brandGrid);
          try { brandGrid.layoutSizingHorizontal = "FILL"; brandGrid.layoutSizingVertical = "HUG"; } catch (e) {}

          _makeSep(oldShowcase);
        }
        var card = makeIconCard(iconComps[ic], icons[ic].name, brandGrid);
        await _makeLabel(icons[ic].name, "SP/Caption", "muted-foreground", card);
        added++;
      } else {
        // Regular icon belongs in Icon Grid — skip only if already there
        if (inIconGridSet[compName]) continue;
        if (iconGrid) {
          var card = makeIconCard(iconComps[ic], icons[ic].name, iconGrid);
          await _makeLabel(icons[ic].name, "SP/Caption", "muted-foreground", card);
          added++;
        }
      }
    }
    if (added > 0) log.push("Added " + added + " missing icons to showcase");
    else log.push("Showcase already complete");

    // --- Step 4b: Fix existing icon card labels — bind text style ---
    var grids = [brandGrid, iconGrid, flagGrid].filter(function(g) { return !!g; });
    var fixedLabels = 0;
    var captionStyleFix = findTextStyle("SP/Caption");
    for (var gi = 0; gi < grids.length; gi++) {
      var cards = grids[gi].children;
      for (var ci2 = 0; ci2 < cards.length; ci2++) {
        if (cards[ci2].type !== "FRAME") continue;
        var textNodes = cards[ci2].findAll(function(n) { return n.type === "TEXT"; });
        for (var ti = 0; ti < textNodes.length; ti++) {
          var tn = textNodes[ti];
          if (!captionStyleFix) continue;
          var currentStyleId = "";
          try { currentStyleId = tn.textStyleId; } catch(e) {}
          if (currentStyleId !== captionStyleFix.id) {
            try {
              if (captionStyleFix.fontName) await figma.loadFontAsync(captionStyleFix.fontName);
              await tn.setTextStyleIdAsync(captionStyleFix.id);
              setTextFill(tn, "muted-foreground");
              fixedLabels++;
            } catch(e) {}
          }
        }
      }
    }
    if (fixedLabels > 0) log.push("Fixed " + fixedLabels + " existing icon labels (text style)");

    // --- Step 4c: Bind variable tokens on existing showcase frame + grids ---
    _bindPad(oldShowcase, 64, 64, 64, 64);
    _bindSp(oldShowcase, "itemSpacing", 48);
    _bindRad(oldShowcase, 0);
    if (brandGrid) {
      _bindSp(brandGrid, "itemSpacing", 8);
      _bindSp(brandGrid, "counterAxisSpacing", 8);
      _bindPad(brandGrid, 0, 0, 0, 0);
      _bindRad(brandGrid, 0);
    }
    if (iconGrid) {
      _bindSp(iconGrid, "itemSpacing", 8);
      _bindSp(iconGrid, "counterAxisSpacing", 8);
      _bindPad(iconGrid, 0, 0, 0, 0);
      _bindRad(iconGrid, 0);
    }
    if (flagGrid) {
      _bindSp(flagGrid, "itemSpacing", 8);
      _bindSp(flagGrid, "counterAxisSpacing", 8);
      _bindPad(flagGrid, 0, 0, 0, 0);
      _bindRad(flagGrid, 0);
    }
    // Fix sub-header frames gap + padding + radius tokens
    var subFrames = oldShowcase.findAll(function(n) { return n.type === "FRAME" && (n.name === "Header" || n.name === "Brand Logos" || n.name === "Icons" || n.name === "Country Flags"); });
    for (var sfi = 0; sfi < subFrames.length; sfi++) {
      _bindSp(subFrames[sfi], "itemSpacing", subFrames[sfi].itemSpacing);
      _bindPad(subFrames[sfi], 0, 0, 0, 0);
      _bindRad(subFrames[sfi], 0);
    }
    // Fix ALL text nodes in showcase — bind text style
    var allTextNodes = oldShowcase.findAll(function(n) { return n.type === "TEXT"; });
    var _textStyleMap = { "SP/H1": null, "SP/H3": null, "SP/Body LG": null, "SP/Caption": null, "SP/Body Semibold": null, "SP/Body": null, "SP/Overline": null, "SP/Label": null };
    var _tsmKeys = Object.keys(_textStyleMap);
    for (var _tsi = 0; _tsi < _tsmKeys.length; _tsi++) _textStyleMap[_tsmKeys[_tsi]] = findTextStyle(_tsmKeys[_tsi]);
    var fixedTextStyles = 0;
    for (var _ati = 0; _ati < allTextNodes.length; _ati++) {
      var _tn = allTextNodes[_ati];
      var _curStyleId = ""; try { _curStyleId = _tn.textStyleId; } catch(e) {}
      if (_curStyleId && _curStyleId !== "" && _curStyleId !== figma.mixed) continue; // already bound
      // Detect which style to bind based on font size + weight
      var _fs = 14; try { _fs = _tn.fontSize !== figma.mixed ? _tn.fontSize : 14; } catch(e) {}
      var _fw = "Regular"; try { _fw = _tn.fontName !== figma.mixed ? _tn.fontName.style : "Regular"; } catch(e) {}
      var _matchStyle = null;
      if (_fs >= 34 && _fw.indexOf("Bold") !== -1) _matchStyle = _textStyleMap["SP/H1"];
      else if (_fs >= 18 && _fw.indexOf("Bold") !== -1) _matchStyle = _textStyleMap["SP/H3"];
      else if (_fs >= 15 && _fw === "Regular") _matchStyle = _textStyleMap["SP/Body LG"];
      else if (_fs >= 13 && _fw.indexOf("SemiBold") !== -1) _matchStyle = _textStyleMap["SP/Body Semibold"];
      else if (_fs >= 13 && _fw === "Regular") _matchStyle = _textStyleMap["SP/Body"];
      else if (_fs >= 11 && _fw === "Regular") _matchStyle = _textStyleMap["SP/Caption"];
      else if (_fs >= 10 && _fw.indexOf("SemiBold") !== -1) _matchStyle = _textStyleMap["SP/Overline"];
      else _matchStyle = _textStyleMap["SP/Caption"];
      if (_matchStyle) {
        try {
          if (_matchStyle.fontName) await figma.loadFontAsync(_matchStyle.fontName);
          await _tn.setTextStyleIdAsync(_matchStyle.id);
          fixedTextStyles++;
        } catch(e) {}
      }
    }
    if (fixedTextStyles > 0) log.push("Bound text styles on " + fixedTextStyles + " text nodes");
    // Fix icon card radius + padding tokens
    var allCards = [];
    if (brandGrid) for (var bci = 0; bci < brandGrid.children.length; bci++) { if (brandGrid.children[bci].type === "FRAME") allCards.push(brandGrid.children[bci]); }
    if (iconGrid) for (var ici = 0; ici < iconGrid.children.length; ici++) { if (iconGrid.children[ici].type === "FRAME") allCards.push(iconGrid.children[ici]); }
    if (flagGrid) for (var fci = 0; fci < flagGrid.children.length; fci++) { if (flagGrid.children[fci].type === "FRAME") allCards.push(flagGrid.children[fci]); }
    for (var aci = 0; aci < allCards.length; aci++) {
      var c = allCards[aci];
      _bindRad(c, 8);
      _bindPad(c, c.paddingTop, c.paddingRight, c.paddingBottom, c.paddingLeft);
      _bindSp(c, "itemSpacing", c.itemSpacing);
    }
    log.push("Bound variable tokens on showcase frames (" + allCards.length + " cards)");
  } else {
    // No showcase exists — build from scratch
    var showcase = figma.createFrame();
    showcase.name = "Icons \u2014 Showcase";
    showcase.layoutMode = "VERTICAL";
    showcase.resize(1440, 100);
    showcase.layoutSizingHorizontal = "FIXED";
    showcase.layoutSizingVertical = "HUG";
    _bindPad(showcase, 64, 64, 64, 64);
    _bindSp(showcase, "itemSpacing", 48);
    _bindRad(showcase, 0);
    setFill(showcase, "background");
    showcase.clipsContent = false;

    var brandCount = 0;
    var flagCount = 0;
    for (var bi = 0; bi < icons.length; bi++) { if (icons[bi].brand) brandCount++; else if (icons[bi].flag) flagCount++; }
    var regularCount = icons.length - brandCount - flagCount;

    // Header
    var header = figma.createFrame();
    header.name = "Header"; header.layoutMode = "VERTICAL";
    _bindSp(header, "itemSpacing", 12);
    _bindPad(header, 0, 0, 0, 0);
    _bindRad(header, 0);
    header.fills = []; header.clipsContent = false;
    showcase.appendChild(header);
    try { header.layoutSizingHorizontal = "FILL"; header.layoutSizingVertical = "HUG"; } catch (e) {}
    await _makeLabel("Icons", "SP/H1", "foreground", header);
    var descParts = [];
    if (regularCount > 0) descParts.push("Lucide icon set \u2014 " + regularCount + " icons, " + size + "\u00d7" + size + "px, stroke bound to foreground variable");
    if (brandCount > 0) descParts.push(brandCount + " brand logos with original colors");
    if (flagCount > 0) descParts.push(flagCount + " country flags with original colors");
    descParts.push("Supports Light/Dark mode.");
    await _makeLabel(descParts.join(". "), "SP/Body LG", "muted-foreground", header);

    _makeSep(showcase);

    // Brand section
    if (brandCount > 0) {
      var brandHeader = figma.createFrame();
      brandHeader.name = "Brand Logos"; brandHeader.layoutMode = "VERTICAL";
      _bindSp(brandHeader, "itemSpacing", 12);
      _bindPad(brandHeader, 0, 0, 0, 0);
      _bindRad(brandHeader, 0);
      brandHeader.fills = []; brandHeader.clipsContent = false;
      showcase.appendChild(brandHeader);
      try { brandHeader.layoutSizingHorizontal = "FILL"; brandHeader.layoutSizingVertical = "HUG"; } catch (e) {}
      await _makeLabel("Brand Logos", "SP/H3", "foreground", brandHeader);

      var brandGrid = figma.createFrame();
      brandGrid.name = "Brand Grid";
      brandGrid.layoutMode = "HORIZONTAL"; brandGrid.layoutWrap = "WRAP";
      _bindSp(brandGrid, "itemSpacing", 8);
      _bindSp(brandGrid, "counterAxisSpacing", 8);
      _bindPad(brandGrid, 0, 0, 0, 0);
      _bindRad(brandGrid, 0);
      brandGrid.fills = []; brandGrid.clipsContent = false;
      showcase.appendChild(brandGrid);
      try { brandGrid.layoutSizingHorizontal = "FILL"; brandGrid.layoutSizingVertical = "HUG"; } catch (e) {}

      for (var ic = 0; ic < icons.length; ic++) {
        if (!icons[ic].brand || !iconComps[ic]) continue;
        var card = makeIconCard(iconComps[ic], icons[ic].name, brandGrid);
        await _makeLabel(icons[ic].name, "SP/Caption", "muted-foreground", card);
      }
      _makeSep(showcase);
    }

    // Regular icon grid
    var iconHeader = figma.createFrame();
    iconHeader.name = "Icons"; iconHeader.layoutMode = "VERTICAL";
    _bindSp(iconHeader, "itemSpacing", 12);
    _bindPad(iconHeader, 0, 0, 0, 0);
    _bindRad(iconHeader, 0);
    iconHeader.fills = []; iconHeader.clipsContent = false;
    showcase.appendChild(iconHeader);
    try { iconHeader.layoutSizingHorizontal = "FILL"; iconHeader.layoutSizingVertical = "HUG"; } catch (e) {}
    await _makeLabel("Icons", "SP/H3", "foreground", iconHeader);

    var gridFrame = figma.createFrame();
    gridFrame.name = "Icon Grid";
    gridFrame.layoutMode = "HORIZONTAL"; gridFrame.layoutWrap = "WRAP";
    _bindSp(gridFrame, "itemSpacing", 8);
    _bindSp(gridFrame, "counterAxisSpacing", 8);
    _bindPad(gridFrame, 0, 0, 0, 0);
    _bindRad(gridFrame, 0);
    gridFrame.fills = []; gridFrame.clipsContent = false;
    showcase.appendChild(gridFrame);
    try { gridFrame.layoutSizingHorizontal = "FILL"; gridFrame.layoutSizingVertical = "HUG"; } catch (e) {}

    for (var ic = 0; ic < icons.length; ic++) {
      if (icons[ic].brand || icons[ic].flag || !iconComps[ic]) continue;
      var card = makeIconCard(iconComps[ic], icons[ic].name, gridFrame);
      await _makeLabel(icons[ic].name, "SP/Caption", "muted-foreground", card);
    }

    // Country flags section
    if (flagCount > 0) {
      _makeSep(showcase);

      var flagHeader = figma.createFrame();
      flagHeader.name = "Country Flags"; flagHeader.layoutMode = "VERTICAL";
      _bindSp(flagHeader, "itemSpacing", 12);
      _bindPad(flagHeader, 0, 0, 0, 0);
      _bindRad(flagHeader, 0);
      flagHeader.fills = []; flagHeader.clipsContent = false;
      showcase.appendChild(flagHeader);
      try { flagHeader.layoutSizingHorizontal = "FILL"; flagHeader.layoutSizingVertical = "HUG"; } catch (e) {}
      await _makeLabel("Country Flags", "SP/H3", "foreground", flagHeader);

      var flagGrid = figma.createFrame();
      flagGrid.name = "Flag Grid";
      flagGrid.layoutMode = "HORIZONTAL"; flagGrid.layoutWrap = "WRAP";
      _bindSp(flagGrid, "itemSpacing", 8);
      _bindSp(flagGrid, "counterAxisSpacing", 8);
      _bindPad(flagGrid, 0, 0, 0, 0);
      _bindRad(flagGrid, 0);
      flagGrid.fills = []; flagGrid.clipsContent = false;
      showcase.appendChild(flagGrid);
      try { flagGrid.layoutSizingHorizontal = "FILL"; flagGrid.layoutSizingVertical = "HUG"; } catch (e) {}

      for (var ic = 0; ic < icons.length; ic++) {
        if (!icons[ic].flag || !iconComps[ic]) continue;
        var card = makeIconCard(iconComps[ic], icons[ic].name, flagGrid);
        await _makeLabel(icons[ic].name, "SP/Caption", "muted-foreground", card);
      }
    }

    targetPage.appendChild(showcase);
    log.push("Created new showcase with " + icons.length + " icons");
  }

  var elapsed = Date.now() - startTime;
  log.push("Done in " + elapsed + "ms");
  return { success: true, message: kept + " kept, " + updated + " updated, " + created + " new", elapsed: elapsed, log: log };
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
      "SP/H5": ["Plus Jakarta Sans","SemiBold",14],
      "SP/Body LG": ["Inter","Regular",16], "SP/Body": ["Inter","Regular",14],
      "SP/Body Medium": ["Inter","Medium",14], "SP/Body Semibold": ["Inter","SemiBold",14],
      "SP/Label": ["Inter","Medium",12], "SP/Label Uppercase": ["Inter","SemiBold",11],
      "SP/Caption": ["Inter","Regular",12], "SP/Overline": ["Inter","SemiBold",10],
      "SP/KPI Hero": ["JetBrains Mono","SemiBold",48], "SP/KPI LG": ["JetBrains Mono","SemiBold",32],
      "SP/KPI MD": ["JetBrains Mono","Medium",24], "SP/KPI SM": ["JetBrains Mono","Medium",20],
      "SP/Data": ["JetBrains Mono","Regular",14], "SP/Data SM": ["JetBrains Mono","Regular",12],
      "SP/Order ID": ["JetBrains Mono","Medium",13] };
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
  _bindSp(f, "itemSpacing", gap || 0);
  _bindPad(f, 0, 0, 0, 0);
  _bindRad(f, 0);
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
  _bindPad(s, 0, 0, 0, 0);
  _bindRad(s, 0);
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
  _bindPad(pill, 4, 12, 4, 12);
  setFill(pill, "card");
  _bindRad(pill, 9999);
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
    // Batch font loads for all text nodes in parallel (deduped via _loadFont)
    var tns = inst.findAll(function(n) { return n.type === "TEXT"; });
    await Promise.all(tns.map(function(tn) {
      if (tn.fontName && tn.fontName !== figma.mixed) {
        return _loadFont(tn.fontName.family, tn.fontName.style);
      }
      return Promise.resolve();
    }));
    setTextOverride(inst, "Label", labelText);
  }
  if (parent) {
    parent.appendChild(inst);
    // Explicitly set FIXED sizing so instances never auto-stretch to fill parent
    try { inst.layoutSizingHorizontal = "FIXED"; inst.layoutSizingVertical = "FIXED"; } catch(e) {}
  }
  return inst;
}

// --- Children: structured child nodes for compound components ---

function _matchShowWhen(showWhen, combo) {
  if (!showWhen) return true;
  var parts = showWhen.split(",");
  for (var i = 0; i < parts.length; i++) {
    var kv = parts[i].trim().split("=");
    if (kv.length !== 2 || combo[kv[0]] !== kv[1]) return false;
  }
  return true;
}

function _getChildOrder(childrenSpec, combo) {
  var order = [];
  for (var i = 0; i < childrenSpec.length; i++) {
    if (!_matchShowWhen(childrenSpec[i].showWhen, combo)) continue;
    order.push(childrenSpec[i].name || ("Child " + i));
  }
  return order;
}

async function _processChildren(childrenSpec, parent, combo, defaults) {
  defaults = defaults || {};
  var validNames = {};
  for (var ci = 0; ci < childrenSpec.length; ci++) {
    var cs = childrenSpec[ci];
    if (!_matchShowWhen(cs.showWhen, combo)) continue;

    var type = cs.type || "text";
    var name = cs.name || ("Child " + ci);
    validNames[name] = true;

    if (type === "text") {
      var txt = null;
      for (var _ti = 0; _ti < parent.children.length; _ti++) {
        if (parent.children[_ti].name === name && parent.children[_ti].type === "TEXT") { txt = parent.children[_ti]; break; }
      }
      if (!txt) { txt = figma.createText(); txt.name = name; parent.appendChild(txt); }
      var tsName = cs.textStyle || null;
      var fontLoaded = false;
      if (tsName) {
        var ts = findTextStyle(tsName);
        if (ts && ts.fontName) {
          try { await figma.loadFontAsync(ts.fontName); fontLoaded = true; } catch(e) {}
          try { await txt.setTextStyleIdAsync(ts.id); } catch(e) {}
        }
      }
      if (!fontLoaded) {
        var fb = await loadFontSafe("Inter", "Regular");
        if (fb) txt.fontName = fb;
        txt.fontSize = cs.fontSize || 14;
      }
      txt.characters = cs.textContent || "";
      var _ctf = cs.textFill || defaults.textFill;
      if (_ctf) setTextFill(txt, _ctf);
      // Truncation must be set BEFORE fill sizing (ORDER MATTERS: TRUNCATE → maxLines → textTruncation → FILL)
      if (cs.truncate) {
        txt.textAutoResize = "TRUNCATE";
        txt.maxLines = 1;
        txt.textTruncation = "ENDING";
      }
      try { txt.layoutSizingHorizontal = cs.fillWidth ? "FILL" : "HUG"; } catch(e) {}
      try { txt.layoutSizingVertical = "HUG"; } catch(e) {}
    }

    else if (type === "divider") {
      var div = null;
      for (var _di = 0; _di < parent.children.length; _di++) {
        if (parent.children[_di].name === name && parent.children[_di].type === "FRAME") { div = parent.children[_di]; break; }
      }
      if (!div) { div = figma.createFrame(); div.name = name; parent.appendChild(div); }
      div.layoutMode = "NONE";
      div.resize(100, cs.height || 1);
      try { div.layoutSizingHorizontal = "FILL"; } catch(e) {}
      div.layoutSizingVertical = "FIXED";
      if (cs.fill) setFill(div, cs.fill); else setFill(div, "border");
    }

    else if (type === "frame") {
      var frm = null;
      for (var _fi = 0; _fi < parent.children.length; _fi++) {
        if (parent.children[_fi].name === name && parent.children[_fi].type === "FRAME") { frm = parent.children[_fi]; break; }
      }
      if (!frm) { frm = figma.createFrame(); frm.name = name; parent.appendChild(frm); }
      frm.layoutMode = (cs.layout || "horizontal") === "horizontal" ? "HORIZONTAL" : "VERTICAL";
      var pa = cs.primaryAlign || "start";
      frm.primaryAxisAlignItems = pa === "start" ? "MIN" : pa === "end" ? "MAX" : pa === "space-between" ? "SPACE_BETWEEN" : pa === "center" ? "CENTER" : "MIN";
      var ca = cs.counterAlign || "center";
      frm.counterAxisAlignItems = ca === "start" ? "MIN" : ca === "end" ? "MAX" : "CENTER";
      // Gap — "auto" = space-between (bind spacing/none), string token = variable binding, number = raw pixel
      var gap = cs.gap !== undefined ? cs.gap : "xs";
      if (gap === "auto") {
        frm.itemSpacing = 0;
        try { frm.setBoundVariable("itemSpacing", null); } catch(e) {}
      } else if (typeof gap === "string") {
        frm.itemSpacing = getSpacingValue(gap);
        bindFloat(frm, "itemSpacing", gap.indexOf("/") !== -1 ? gap : "spacing/" + gap, frm.itemSpacing);
      } else { frm.itemSpacing = gap; if (gap === 0) bindFloat(frm, "itemSpacing", "spacing/none", 0); }
      // Size
      var frmW = cs.width || 100; var frmH = cs.height || 36;
      frm.resize(frmW, frmH);
      var _isAbsChild = cs.position === "absolute";
      try { frm.layoutSizingHorizontal = cs.widthMode === "fixed" || _isAbsChild ? "FIXED" : cs.widthMode === "hug" ? "HUG" : "FILL"; } catch(e) {}
      try { frm.layoutSizingVertical = cs.fillHeight ? "FILL" : cs.heightMode === "fixed" || _isAbsChild ? "FIXED" : "HUG"; } catch(e) {}
      // Padding — supports paddingX/paddingY (both sides) and per-side paddingTop/paddingBottom/paddingLeft/paddingRight
      var px = cs.paddingX !== undefined ? cs.paddingX : "none"; var py = cs.paddingY !== undefined ? cs.paddingY : "none";
      if (typeof px === "string") {
        var pxv = getSpacingValue(px); frm.paddingLeft = pxv; frm.paddingRight = pxv;
        var pxVarName = px.indexOf("/") !== -1 ? px : "spacing/" + px;
        bindFloat(frm, "paddingLeft", pxVarName, pxv);
        bindFloat(frm, "paddingRight", pxVarName, pxv);
      } else { frm.paddingLeft = px; frm.paddingRight = px; if (px === 0) { bindFloat(frm, "paddingLeft", "spacing/none", 0); bindFloat(frm, "paddingRight", "spacing/none", 0); } }
      if (typeof py === "string") {
        var pyv = getSpacingValue(py); frm.paddingTop = pyv; frm.paddingBottom = pyv;
        var pyVarName = py.indexOf("/") !== -1 ? py : "spacing/" + py;
        bindFloat(frm, "paddingTop", pyVarName, pyv);
        bindFloat(frm, "paddingBottom", pyVarName, pyv);
      } else { frm.paddingTop = py; frm.paddingBottom = py; if (py === 0) { bindFloat(frm, "paddingTop", "spacing/none", 0); bindFloat(frm, "paddingBottom", "spacing/none", 0); } }
      // Per-side padding overrides (after paddingX/paddingY)
      if (cs.paddingTop !== undefined) {
        if (typeof cs.paddingTop === "string") { var ptv = getSpacingValue(cs.paddingTop); frm.paddingTop = ptv; bindFloat(frm, "paddingTop", cs.paddingTop.indexOf("/") !== -1 ? cs.paddingTop : "spacing/" + cs.paddingTop, ptv); }
        else { frm.paddingTop = cs.paddingTop; if (cs.paddingTop === 0) bindFloat(frm, "paddingTop", "spacing/none", 0); }
      }
      if (cs.paddingBottom !== undefined) {
        if (typeof cs.paddingBottom === "string") { var pbv = getSpacingValue(cs.paddingBottom); frm.paddingBottom = pbv; bindFloat(frm, "paddingBottom", cs.paddingBottom.indexOf("/") !== -1 ? cs.paddingBottom : "spacing/" + cs.paddingBottom, pbv); }
        else { frm.paddingBottom = cs.paddingBottom; if (cs.paddingBottom === 0) bindFloat(frm, "paddingBottom", "spacing/none", 0); }
      }
      if (cs.paddingLeft !== undefined) {
        if (typeof cs.paddingLeft === "string") { var plv = getSpacingValue(cs.paddingLeft); frm.paddingLeft = plv; bindFloat(frm, "paddingLeft", cs.paddingLeft.indexOf("/") !== -1 ? cs.paddingLeft : "spacing/" + cs.paddingLeft, plv); }
        else { frm.paddingLeft = cs.paddingLeft; if (cs.paddingLeft === 0) bindFloat(frm, "paddingLeft", "spacing/none", 0); }
      }
      if (cs.paddingRight !== undefined) {
        if (typeof cs.paddingRight === "string") { var prv = getSpacingValue(cs.paddingRight); frm.paddingRight = prv; bindFloat(frm, "paddingRight", cs.paddingRight.indexOf("/") !== -1 ? cs.paddingRight : "spacing/" + cs.paddingRight, prv); }
        else { frm.paddingRight = cs.paddingRight; if (cs.paddingRight === 0) bindFloat(frm, "paddingRight", "spacing/none", 0); }
      }
      // Radius
      if (cs.radius) {
        var rad = cs.radius;
        if (typeof rad === "string") {
          var rv = getRadiusValue(rad);
          frm.topLeftRadius = rv; frm.topRightRadius = rv; frm.bottomLeftRadius = rv; frm.bottomRightRadius = rv;
          var rVarName = rad.indexOf("/") !== -1 ? rad : "border radius/" + rad;
          var rVar = findVar(rVarName);
          if (rVar) { try { frm.setBoundVariable("topLeftRadius",rVar); frm.setBoundVariable("topRightRadius",rVar); frm.setBoundVariable("bottomLeftRadius",rVar); frm.setBoundVariable("bottomRightRadius",rVar); } catch(e){} }
        } else {
          frm.topLeftRadius = rad; frm.topRightRadius = rad; frm.bottomLeftRadius = rad; frm.bottomRightRadius = rad;
          if (rad === 0) { var _rn0 = findVar("border radius/none"); if (_rn0) { try { frm.setBoundVariable("topLeftRadius",_rn0); frm.setBoundVariable("topRightRadius",_rn0); frm.setBoundVariable("bottomLeftRadius",_rn0); frm.setBoundVariable("bottomRightRadius",_rn0); } catch(e){} } }
        }
      } else {
        frm.topLeftRadius = 0; frm.topRightRadius = 0; frm.bottomLeftRadius = 0; frm.bottomRightRadius = 0;
        var _rnVar = findVar("border radius/none");
        if (_rnVar) { try { frm.setBoundVariable("topLeftRadius",_rnVar); frm.setBoundVariable("topRightRadius",_rnVar); frm.setBoundVariable("bottomLeftRadius",_rnVar); frm.setBoundVariable("bottomRightRadius",_rnVar); } catch(e){} }
      }
      // Per-corner radius overrides (supports string tokens like "md" or numeric px)
      var _perCornerKeys = [["radiusTopLeft","topLeftRadius"],["radiusTopRight","topRightRadius"],["radiusBottomLeft","bottomLeftRadius"],["radiusBottomRight","bottomRightRadius"]];
      for (var _pci = 0; _pci < _perCornerKeys.length; _pci++) {
        var _pcKey = _perCornerKeys[_pci][0], _pcProp = _perCornerKeys[_pci][1];
        if (cs[_pcKey] !== undefined) {
          var _pcVal = cs[_pcKey];
          if (typeof _pcVal === "string") {
            var _pcPx = getRadiusValue(_pcVal);
            frm[_pcProp] = _pcPx;
            var _pcVarName = _pcVal.indexOf("/") !== -1 ? _pcVal : "border radius/" + _pcVal;
            var _pcVar = findVar(_pcVarName);
            if (_pcVar) { try { frm.setBoundVariable(_pcProp, _pcVar); } catch(e){} }
          } else {
            frm[_pcProp] = _pcVal;
          }
        }
      }
      // Fill & Stroke
      if (cs.imageUrl) {
        try {
          debugLog.push("  [IMG] Children frame imageUrl: " + cs.imageUrl + " prefetched=" + !!_prefetchedImages[cs.imageUrl]);
          var _cImgHash = await getImageHash(cs.imageUrl);
          frm.fills = [{ type: "IMAGE", imageHash: _cImgHash, scaleMode: cs.imageScaleMode || "FILL" }];
          debugLog.push("  [IMG] Success, hash=" + _cImgHash);
        } catch(e) {
          debugLog.push("  [WARN] Children frame imageUrl failed: " + e.message);
          if (cs.fill) { if (cs.fillOpacity !== undefined) setFillWithOpacity(frm, cs.fill, cs.fillOpacity); else setFill(frm, cs.fill); }
          else frm.fills = [];
        }
      } else if (cs.fill) {
        if (cs.fillOpacity !== undefined) setFillWithOpacity(frm, cs.fill, cs.fillOpacity);
        else setFill(frm, cs.fill);
      } else frm.fills = [];
      if (cs.stroke) { if (cs.strokeOpacity !== undefined) setStrokeWithOpacity(frm, cs.stroke, cs.strokeOpacity); else setStroke(frm, cs.stroke); frm.strokeWeight = cs.strokeWeight || 1; frm.strokeAlign = "INSIDE"; if (cs.strokeSides) _applyStrokeSides(frm, cs.strokeSides, cs.strokeWeight || 1); }
      else frm.strokes = [];
      // Absolute positioning (child ignores parent auto-layout, uses x/y)
      if (cs.position === "absolute") {
        frm.layoutPositioning = "ABSOLUTE";
        // Re-apply resize after ABSOLUTE — auto-layout may have overridden initial resize
        frm.resize(cs.width || 100, cs.height || 36);
        if (cs.x !== undefined) frm.x = cs.x;
        if (cs.y !== undefined) frm.y = cs.y;
        if (cs.constraints) {
          frm.constraints = {
            horizontal: cs.constraints.horizontal || "MIN",
            vertical: cs.constraints.vertical || "MIN"
          };
        }
      }
      // Clips content — explicit both ways for upsert safety
      frm.clipsContent = !!cs.clipsContent;
      // Effect style on child frame (e.g. "Ring/default", "Shadows/sm")
      if (cs.effectStyleName) {
        var _ceStyles = await figma.getLocalEffectStylesAsync();
        var _ceFound = null;
        for (var _cei = 0; _cei < _ceStyles.length; _cei++) {
          if (_ceStyles[_cei].name === cs.effectStyleName) { _ceFound = _ceStyles[_cei]; break; }
        }
        if (_ceFound) { try { frm.setEffectStyleIdAsync(_ceFound.id); } catch(e) { frm.effects = _ceFound.effects; } }
      } else if (cs.focusRing) {
        await applyFocusRingEffect(frm, cs.focusRing);
      } else frm.effects = [];
      // Opacity
      if (cs.opacity !== undefined) frm.opacity = cs.opacity;
      // Nested children
      if (cs.children && cs.children.length > 0) {
        var nestedNames = await _processChildren(cs.children, frm, combo, defaults);
        for (var nri = frm.children.length - 1; nri >= 0; nri--) {
          if (!nestedNames[frm.children[nri].name]) frm.children[nri].remove();
        }
        var nestedOrder = _getChildOrder(cs.children, combo);
        for (var noi = 0; noi < nestedOrder.length; noi++) {
          for (var nci = 0; nci < frm.children.length; nci++) {
            if (frm.children[nci].name === nestedOrder[noi]) { frm.appendChild(frm.children[nci]); break; }
          }
        }
      }
    }

    else if (type === "arrow") {
      // Creates a triangle arrow via SVG path — exact shape like Radix TooltipArrow.
      // JSON: { "type": "arrow", "name": "Arrow", "direction": "down", "width": 12, "height": 6, "fill": "foreground" }
      // Directions: "down" (default), "up", "left", "right"
      var arW = cs.width || 12;
      var arH = cs.height || 6;
      var arDir = cs.direction || "down";
      var svgPts = "";
      if (arDir === "down") svgPts = "0,0 " + (arW/2) + "," + arH + " " + arW + ",0";
      else if (arDir === "up") svgPts = "0," + arH + " " + (arW/2) + ",0 " + arW + "," + arH;
      else if (arDir === "right") svgPts = "0,0 " + arW + "," + (arH/2) + " 0," + arH;
      else if (arDir === "left") svgPts = arW + ",0 0," + (arH/2) + " " + arW + "," + arH;
      var svgStr = '<svg width="' + arW + '" height="' + arH + '" xmlns="http://www.w3.org/2000/svg"><polygon points="' + svgPts + '" fill="black"/></svg>';
      // Remove existing node with same name (any type)
      for (var _ai = parent.children.length - 1; _ai >= 0; _ai--) {
        if (parent.children[_ai].name === name) { parent.children[_ai].remove(); break; }
      }
      var svgFrame = figma.createNodeFromSvg(svgStr);
      svgFrame.name = name;
      // Flatten: createNodeFromSvg returns a FRAME wrapping vectors. Get the vector child.
      var arrowVec = svgFrame.children.length > 0 ? svgFrame.children[0] : null;
      if (arrowVec) {
        parent.appendChild(arrowVec);
        arrowVec.name = name;
        arrowVec.resize(arW, arH);
        if (cs.fill) {
          var arFillVar = findVar(cs.fill);
          if (arFillVar) { arrowVec.fills = [makeBoundPaint(arFillVar)]; }
          else { setFill(arrowVec, cs.fill); }
        }
      }
      svgFrame.remove();
    }

    else if (type === "icon") {
      var iconSize = cs.iconSize || 20;
      var iconExist = null;
      for (var _ii = 0; _ii < parent.children.length; _ii++) {
        if (parent.children[_ii].name === name) { iconExist = parent.children[_ii]; break; }
      }
      var _resolvedIconName = cs.iconNameFromProp ? (combo[cs.iconNameFromProp] || cs.iconName || "Circle") : (cs.iconName || "Circle");
      if (iconExist && iconExist.type === "INSTANCE") {
        // Upsert: check if icon needs swap, then always update size + fill
        var _existMainComp = null;
        try { _existMainComp = await iconExist.getMainComponentAsync(); } catch(e) {}
        var _wantIconComp = findIconComponent(_resolvedIconName);
        if (_wantIconComp && _existMainComp && _wantIconComp.id !== _existMainComp.id) {
          iconExist.swapComponent(_wantIconComp);
        }
        iconExist.resize(iconSize, iconSize);
        // Always re-apply iconFill on upsert (skip for brand icons with original gradient)
        if (!cs.skipIconFill) {
          var _uIconVecs = iconExist.findAll(function(n) { return n.type === "VECTOR" || n.type === "BOOLEAN_OPERATION" || n.type === "ELLIPSE" || n.type === "LINE"; });
          var _uIconVar = findVar(cs.iconFill || defaults.iconFill || defaults.textFill || "foreground");
          if (_uIconVar) {
            for (var _uiv = 0; _uiv < _uIconVecs.length; _uiv++) {
              if (_uIconVecs[_uiv].strokes && _uIconVecs[_uiv].strokes.length > 0) _uIconVecs[_uiv].strokes = [makeBoundPaint(_uIconVar)];
              if (_uIconVecs[_uiv].fills && _uIconVecs[_uiv].fills.length > 0) _uIconVecs[_uiv].fills = [makeBoundPaint(_uIconVar)];
            }
          }
        }
      } else {
        if (iconExist) iconExist.remove();
        var iconComp = findIconComponent(_resolvedIconName);
        if (iconComp) {
          var iconInst = iconComp.createInstance();
          iconInst.name = name; iconInst.resize(iconSize, iconSize);
          if (!cs.skipIconFill) {
            var iconVecs = iconInst.findAll(function(n) { return n.type === "VECTOR" || n.type === "BOOLEAN_OPERATION" || n.type === "ELLIPSE" || n.type === "LINE"; });
            var iconFgVar = findVar(cs.iconFill || defaults.iconFill || defaults.textFill || "foreground");
            if (iconFgVar) {
              for (var iv = 0; iv < iconVecs.length; iv++) {
                if (iconVecs[iv].strokes && iconVecs[iv].strokes.length > 0) iconVecs[iv].strokes = [makeBoundPaint(iconFgVar)];
                if (iconVecs[iv].fills && iconVecs[iv].fills.length > 0) iconVecs[iv].fills = [makeBoundPaint(iconFgVar)];
              }
            }
          }
          parent.appendChild(iconInst);
        } else {
          var icoP = figma.createFrame(); icoP.name = name; icoP.resize(iconSize, iconSize); icoP.fills = [];
          parent.appendChild(icoP);
        }
      }
    }

    else if (type === "instance") {
      // Insert an instance of an existing ComponentSet with specific variant props
      var compSetName = cs.component; // e.g. "Button"
      if (!compSetName) continue;
      var existNode = null;
      for (var _ei = 0; _ei < parent.children.length; _ei++) {
        if (parent.children[_ei].name === name) { existNode = parent.children[_ei]; break; }
      }
      // Remove old node if not an instance
      if (existNode && existNode.type !== "INSTANCE") { console.log("[instance] Removing old non-instance node '" + name + "' type=" + existNode.type); existNode.remove(); existNode = null; }
      if (!existNode) {
        var _compSet = findComponentSet(compSetName);
        var _inst = null;
        if (_compSet) {
          var _instProps = cs.variants || {};
          console.log("[DEBUG instance NEW] name='" + name + "' component='" + compSetName + "' variants=" + JSON.stringify(_instProps));
          _inst = _getInstance(_compSet, _instProps);
          console.log("[DEBUG instance NEW] _inst created=" + !!_inst + " type=" + (_inst ? _inst.type : "null"));
        } else {
          // Fallback: try as standalone COMPONENT (e.g., icons from foundation)
          var _standaloneComp = findComponent(compSetName);
          if (_standaloneComp && _standaloneComp.type === "COMPONENT") {
            _inst = _standaloneComp.createInstance();
          }
          console.log("[DEBUG instance NEW] ComponentSet '" + compSetName + "' NOT found, standalone=" + !!_standaloneComp);
        }
        if (_inst) {
            _inst.name = name;
            var _instTexts = _inst.findAll(function(n) { return n.type === "TEXT"; });
            console.log("[DEBUG instance NEW] '" + name + "' textNodes found=" + _instTexts.length + " names=[" + _instTexts.map(function(t) { return t.name; }).join(", ") + "]");
            for (var _it = 0; _it < _instTexts.length; _it++) {
              var _fn3 = _instTexts[_it].fontName;
              if (_fn3 && _fn3 !== figma.mixed) { try { await figma.loadFontAsync(_fn3); } catch(e) { console.log("[DEBUG instance NEW] Font load FAILED for '" + _instTexts[_it].name + "': " + e.message); } }
              else { console.log("[DEBUG instance NEW] Font MIXED or null for '" + _instTexts[_it].name + "'"); }
            }
            if (cs.textOverrides) {
              console.log("[DEBUG instance NEW] textOverrides keys=" + JSON.stringify(Object.keys(cs.textOverrides)));
              for (var _toKey in cs.textOverrides) {
                var _toNode = _inst.findOne(function(n) { return n.type === "TEXT" && n.name === _toKey; });
                console.log("[DEBUG instance NEW] textOverride '" + _toKey + "' → findOne=" + !!_toNode + " value='" + cs.textOverrides[_toKey] + "'");
                if (_toNode) { try { _toNode.characters = cs.textOverrides[_toKey]; console.log("[DEBUG instance NEW] '" + _toKey + "' characters SET OK"); } catch(e) { console.log("[DEBUG instance NEW] '" + _toKey + "' characters FAILED: " + e.message); } }
              }
            }
            // iconOverrides: swap icon instances inside the component instance
            if (cs.iconOverrides) {
              for (var _ioKey in cs.iconOverrides) {
                var _ioIconComp = findIconComponent(cs.iconOverrides[_ioKey]);
                if (_ioIconComp) {
                  var _ioNodes = _inst.findAll(function(n) { return n.name === _ioKey && n.type === "INSTANCE"; });
                  for (var _ion = 0; _ion < _ioNodes.length; _ion++) {
                    try { _ioNodes[_ion].swapComponent(_ioIconComp); } catch(e) {}
                  }
                }
              }
            }
            // iconFill: override all vector strokes/fills inside the instance to a different color variable
            if (cs.iconFill) {
              var _ifVar = findVar(cs.iconFill);
              if (_ifVar) {
                var _ifVecs = _inst.findAll(function(n) { return n.type === "VECTOR" || n.type === "LINE" || n.type === "ELLIPSE" || n.type === "RECTANGLE" || n.type === "POLYGON" || n.type === "STAR" || n.type === "BOOLEAN_OPERATION"; });
                for (var _ifv = 0; _ifv < _ifVecs.length; _ifv++) {
                  var _ifNode = _ifVecs[_ifv];
                  if (_ifNode.strokes && _ifNode.strokes.length > 0) _ifNode.strokes = [makeBoundPaint(_ifVar)];
                  if (_ifNode.fills && _ifNode.fills.length > 0) {
                    var _ifHasFill = false;
                    for (var _iff = 0; _iff < _ifNode.fills.length; _iff++) { if (_ifNode.fills[_iff].type === "SOLID" && _ifNode.fills[_iff].opacity !== 0) _ifHasFill = true; }
                    if (_ifHasFill) _ifNode.fills = [makeBoundPaint(_ifVar)];
                  }
                }
              }
            }
            parent.appendChild(_inst);
            try { _inst.layoutSizingHorizontal = cs.fillWidth ? "FILL" : cs.widthMode === "hug" ? "HUG" : "FIXED"; } catch(e) {}
            try { _inst.layoutSizingVertical = cs.heightMode === "hug" ? "HUG" : "FIXED"; } catch(e) {}
            // Absolute positioning for instance children
            if (cs.position === "absolute") {
              _inst.layoutPositioning = "ABSOLUTE";
              // Re-apply resize after ABSOLUTE — auto-layout may override instance size
              try { _inst.resize(cs.width || _inst.width, cs.height || _inst.height); } catch(e) {}
              if (cs.x !== undefined) _inst.x = cs.x;
              if (cs.y !== undefined) _inst.y = cs.y;
              if (cs.constraints) { _inst.constraints = { horizontal: cs.constraints.horizontal || "MIN", vertical: cs.constraints.vertical || "MIN" }; }
            }
            // Apply overrides (nested text, nested variants, icon swap, boolean) on instance children
            if (cs.overrides) { await applyComponentOverrides(_inst, cs); }
            // imageUrl: override image fill on instance root (e.g. Avatar with custom photo)
            if (cs.imageUrl) {
              try {
                var _instImgHash = await getImageHash(cs.imageUrl);
                _inst.fills = [{ type: "IMAGE", imageHash: _instImgHash, scaleMode: "FILL" }];
                console.log("[instance NEW] imageUrl override OK: " + cs.imageUrl);
              } catch(e) { console.log("[instance NEW] imageUrl override FAILED: " + e.message); }
            }
            // swapProperty handled in post-build phase after combineAsVariants
        }
      } else {
        // Update existing instance — check if component needs swapping
        var _needSwap = false;
        var _existMainComp2 = null;
        try { _existMainComp2 = await existNode.getMainComponentAsync(); } catch(e) {}
        if (compSetName && _existMainComp2) {
          var _existCompName = _existMainComp2.parent && _existMainComp2.parent.type === "COMPONENT_SET" ? _existMainComp2.parent.name : _existMainComp2.name;
          if (_existCompName !== compSetName) { _needSwap = true; }
        }
        if (_needSwap) {
          // Remove old instance and recreate with correct component
          existNode.remove();
          var _swapCS = findComponentSet(compSetName);
          var _swapInst = null;
          if (_swapCS) { _swapInst = _getInstance(_swapCS, cs.variants || {}); }
          else { var _swapComp = findComponent(compSetName); if (_swapComp && _swapComp.type === "COMPONENT") _swapInst = _swapComp.createInstance(); }
          if (_swapInst) {
            _swapInst.name = name;
            if (cs.iconOverrides) {
              for (var _sioKey in cs.iconOverrides) {
                var _sioComp = findIconComponent(cs.iconOverrides[_sioKey]);
                if (_sioComp) {
                  var _sioNodes = _swapInst.findAll(function(n) { return n.name === _sioKey && n.type === "INSTANCE"; });
                  for (var _sion = 0; _sion < _sioNodes.length; _sion++) { try { _sioNodes[_sion].swapComponent(_sioComp); } catch(e) {} }
                }
              }
            }
            if (cs.iconFill) {
              var _sfVar = findVar(cs.iconFill);
              if (_sfVar) {
                var _sfVecs = _swapInst.findAll(function(n) { return n.type === "VECTOR" || n.type === "LINE" || n.type === "ELLIPSE" || n.type === "RECTANGLE" || n.type === "POLYGON" || n.type === "STAR" || n.type === "BOOLEAN_OPERATION"; });
                for (var _sfv = 0; _sfv < _sfVecs.length; _sfv++) {
                  if (_sfVecs[_sfv].strokes && _sfVecs[_sfv].strokes.length > 0) _sfVecs[_sfv].strokes = [makeBoundPaint(_sfVar)];
                  if (_sfVecs[_sfv].fills && _sfVecs[_sfv].fills.length > 0) { var _sfHF = false; for (var _sff = 0; _sff < _sfVecs[_sfv].fills.length; _sff++) { if (_sfVecs[_sfv].fills[_sff].type === "SOLID" && _sfVecs[_sfv].fills[_sff].opacity !== 0) _sfHF = true; } if (_sfHF) _sfVecs[_sfv].fills = [makeBoundPaint(_sfVar)]; }
                }
              }
            }
            parent.appendChild(_swapInst);
            try { _swapInst.layoutSizingHorizontal = cs.fillWidth ? "FILL" : cs.widthMode === "hug" ? "HUG" : "FIXED"; } catch(e) {}
            try { _swapInst.layoutSizingVertical = cs.heightMode === "hug" ? "HUG" : "FIXED"; } catch(e) {}
            // Absolute positioning for swapped instance
            if (cs.position === "absolute") {
              _swapInst.layoutPositioning = "ABSOLUTE";
              // Re-apply resize after ABSOLUTE — auto-layout may override instance size
              try { _swapInst.resize(cs.width || _swapInst.width, cs.height || _swapInst.height); } catch(e) {}
              if (cs.x !== undefined) _swapInst.x = cs.x;
              if (cs.y !== undefined) _swapInst.y = cs.y;
              if (cs.constraints) { _swapInst.constraints = { horizontal: cs.constraints.horizontal || "MIN", vertical: cs.constraints.vertical || "MIN" }; }
            }
            // Apply overrides (nested text, nested variants, icon swap, boolean) on swapped instance
            if (cs.overrides) { await applyComponentOverrides(_swapInst, cs); }
            // imageUrl: override image fill on swapped instance
            if (cs.imageUrl) {
              try {
                var _swapImgHash = await getImageHash(cs.imageUrl);
                _swapInst.fills = [{ type: "IMAGE", imageHash: _swapImgHash, scaleMode: "FILL" }];
              } catch(e) { console.log("[instance SWAP] imageUrl override FAILED: " + e.message); }
            }
            // swapProperty handled in post-build phase after combineAsVariants
          }
        } else {
          console.log("[DEBUG instance UPDATE] name='" + name + "' component='" + compSetName + "' existNode.type=" + existNode.type);
          if (cs.variants) { try { existNode.setProperties(cs.variants); console.log("[DEBUG instance UPDATE] setProperties OK: " + JSON.stringify(cs.variants)); } catch(e) { console.log("[DEBUG instance UPDATE] setProperties FAILED: " + e.message); } }
          if (cs.textOverrides) {
            console.log("[DEBUG instance UPDATE] textOverrides keys=" + JSON.stringify(Object.keys(cs.textOverrides)));
            var _allTextsDebug = existNode.findAll(function(n) { return n.type === "TEXT"; });
            console.log("[DEBUG instance UPDATE] '" + name + "' textNodes found=" + _allTextsDebug.length + " names=[" + _allTextsDebug.map(function(t) { return t.name; }).join(", ") + "]");
            for (var _toKey2 in cs.textOverrides) {
              var _toNode2 = existNode.findOne(function(n) { return n.type === "TEXT" && n.name === _toKey2; });
              console.log("[DEBUG instance UPDATE] textOverride '" + _toKey2 + "' → findOne=" + !!_toNode2);
              if (_toNode2) {
                var _fn4 = _toNode2.fontName;
                if (_fn4 && _fn4 !== figma.mixed) { try { await figma.loadFontAsync(_fn4); } catch(e) { console.log("[DEBUG instance UPDATE] Font load FAILED: " + e.message); } }
                try { _toNode2.characters = cs.textOverrides[_toKey2]; console.log("[DEBUG instance UPDATE] '" + _toKey2 + "' SET OK to '" + cs.textOverrides[_toKey2] + "'"); } catch(e) { console.log("[DEBUG instance UPDATE] '" + _toKey2 + "' FAILED: " + e.message); }
              }
            }
          }
          // iconOverrides on existing instance
          if (cs.iconOverrides) {
            for (var _eioKey in cs.iconOverrides) {
              var _eioComp = findIconComponent(cs.iconOverrides[_eioKey]);
              if (_eioComp) {
                var _eioNodes = existNode.findAll(function(n) { return n.name === _eioKey && n.type === "INSTANCE"; });
                for (var _eion = 0; _eion < _eioNodes.length; _eion++) { try { _eioNodes[_eion].swapComponent(_eioComp); } catch(e) {} }
              }
            }
          }
          // iconFill on existing instance
          if (cs.iconFill) {
            var _eifVar = findVar(cs.iconFill);
            if (_eifVar) {
              var _eifVecs = existNode.findAll(function(n) { return n.type === "VECTOR" || n.type === "LINE" || n.type === "ELLIPSE" || n.type === "RECTANGLE" || n.type === "POLYGON" || n.type === "STAR" || n.type === "BOOLEAN_OPERATION"; });
              for (var _eifv = 0; _eifv < _eifVecs.length; _eifv++) {
                if (_eifVecs[_eifv].strokes && _eifVecs[_eifv].strokes.length > 0) _eifVecs[_eifv].strokes = [makeBoundPaint(_eifVar)];
                if (_eifVecs[_eifv].fills && _eifVecs[_eifv].fills.length > 0) { var _eHF = false; for (var _ehf = 0; _ehf < _eifVecs[_eifv].fills.length; _ehf++) { if (_eifVecs[_eifv].fills[_ehf].type === "SOLID" && _eifVecs[_eifv].fills[_ehf].opacity !== 0) _eHF = true; } if (_eHF) _eifVecs[_eifv].fills = [makeBoundPaint(_eifVar)]; }
              }
            }
          }
          // Absolute positioning for existing instance
          if (cs.position === "absolute") {
            existNode.layoutPositioning = "ABSOLUTE";
            // Re-apply resize after ABSOLUTE — auto-layout may override instance size
            try { existNode.resize(cs.width || existNode.width, cs.height || existNode.height); } catch(e) {}
            if (cs.x !== undefined) existNode.x = cs.x;
            if (cs.y !== undefined) existNode.y = cs.y;
            if (cs.constraints) { existNode.constraints = { horizontal: cs.constraints.horizontal || "MIN", vertical: cs.constraints.vertical || "MIN" }; }
          }
          // Apply overrides on existing instance (nested text, nested variants, icon swap, boolean)
          if (cs.overrides) { await applyComponentOverrides(existNode, cs); }
          // imageUrl: override image fill on existing instance
          if (cs.imageUrl) {
            try {
              var _updImgHash = await getImageHash(cs.imageUrl);
              existNode.fills = [{ type: "IMAGE", imageHash: _updImgHash, scaleMode: "FILL" }];
            } catch(e) { console.log("[instance UPDATE] imageUrl override FAILED: " + e.message); }
          }
          try { existNode.layoutSizingHorizontal = cs.fillWidth ? "FILL" : cs.widthMode === "hug" ? "HUG" : "FIXED"; } catch(e) {}
          try { existNode.layoutSizingVertical = cs.heightMode === "hug" ? "HUG" : "FIXED"; } catch(e) {}
        }
      }
    }
  }
  return validNames;
}

// --- Main: Create ComponentSet + Showcase ---

async function doCreateComponents(spec, sendProgress) {
  var log = [];
  var startTime = Date.now();
  if (!sendProgress) sendProgress = function() {};
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

  var createdSets = 0, createdVariants = 0, _anyUpsert = false;
  // Start after existing content on the page (so new frames appear to the right)
  var _showcaseXOffset = 0;
  var _existingPageKids = targetPage.children.slice();
  for (var _exi = 0; _exi < _existingPageKids.length; _exi++) {
    var _rightEdge = _existingPageKids[_exi].x + _existingPageKids[_exi].width;
    if (_rightEdge > _showcaseXOffset) _showcaseXOffset = _rightEdge;
  }
  if (_showcaseXOffset > 0) _showcaseXOffset += 100; // 100px gap after existing content
  var _subComponentSets = []; // multi-component: sub-component CSes to nest into parent showcase

  for (var ci = 0; ci < components.length; ci++) {
    var compSpec = components[ci];
    var compName = compSpec.name || "Component";
    sendProgress("Component [" + (ci + 1) + "/" + components.length + "] " + compName, "ok");
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
    // --- 1.1. Apply variantRestrictions (filter invalid combos) ---
    var restrictions = compSpec.variantRestrictions || null;
    if (restrictions) {
      var rKeys = Object.keys(restrictions); // e.g. ["Type=Previous", "Type=Next", "Type=Ellipsis"]
      var filtered = [];
      for (var fi = 0; fi < combos.length; fi++) {
        var keep = true;
        for (var ri = 0; ri < rKeys.length; ri++) {
          var rCondParts = rKeys[ri].split(",");
          var condMatch = true;
          for (var rcp = 0; rcp < rCondParts.length; rcp++) {
            var kv = rCondParts[rcp].trim().split("=");
            if (combos[fi][kv[0]] !== kv[1]) { condMatch = false; break; }
          }
          if (condMatch) {
            // This restriction applies — check all restricted properties
            var rProps = restrictions[rKeys[ri]];
            var rpKeys = Object.keys(rProps);
            for (var rpi = 0; rpi < rpKeys.length; rpi++) {
              var allowedVals = rProps[rpKeys[rpi]];
              if (allowedVals.indexOf(combos[fi][rpKeys[rpi]]) < 0) { keep = false; break; }
            }
            if (!keep) break;
          }
        }
        if (keep) filtered.push(combos[fi]);
      }
      log.push("  variantRestrictions: " + combos.length + " → " + filtered.length + " variants");
      combos = filtered;
    }
    log.push("  " + combos.length + " variants");

    // --- 1.5. Check for existing ComponentSet + Showcase (upsert mode) ---
    var existingCS = null;
    var existingShowcase = null;
    var _isUpdate = false;
    var _savedShowcaseX = _showcaseXOffset;
    var existingVarMap = {};
    // Normalize variant name: sort "Prop=Val" pairs alphabetically so lookup is order-independent
    function _normalizeVarName(n) { return n.split(", ").map(function(s){return s.trim();}).sort().join(", "); }
    var _pageKids = targetPage.children.slice();
    var _preRunStragglers = [];
    log.push("  [scan] page='" + targetPage.name + "' total=" + _pageKids.length + " looking for CS='" + compName + "'");
    for (var xi = 0; xi < _pageKids.length; xi++) {
      var _kid = _pageKids[xi];
      log.push("    [" + xi + "] type=" + _kid.type + " name='" + _kid.name.substring(0, 60) + "'");
      if (_kid.type === "COMPONENT_SET" && _kid.name === compName) existingCS = _kid;
      else if (_kid.type === "FRAME" && _kid.name === compName + " \u2014 Showcase") {
        existingShowcase = _kid;
        // Search inside showcase for nested CS (CS lives inside "Section — Component")
        if (!existingCS) {
          var _nestedCS = _kid.findAll(function(n) { return n.type === "COMPONENT_SET" && n.name === compName; });
          if (_nestedCS.length > 0) existingCS = _nestedCS[0];
        }
      }
      else if (_kid.type === "COMPONENT" && propNames.length > 0 && _kid.name.indexOf(propNames[0] + "=") >= 0) _preRunStragglers.push(_kid);
    }
    // Multi-component: sub-component CS may be nested inside a different showcase (parent's)
    if (!existingCS && components.length > 1 && ci < components.length - 1) {
      for (var _sxi = 0; _sxi < _pageKids.length; _sxi++) {
        var _sxKid = _pageKids[_sxi];
        if (_sxKid.type === "FRAME" && _sxKid.name.indexOf(" \u2014 Showcase") >= 0) {
          var _sxFound = _sxKid.findAll(function(n) { return n.type === "COMPONENT_SET" && n.name === compName; });
          if (_sxFound.length > 0) { existingCS = _sxFound[0]; log.push("  [scan] Found sub-component CS inside '" + _sxKid.name + "'"); break; }
        }
      }
    }
    log.push("  [scan] existingCS=" + (existingCS ? "FOUND id=" + existingCS.id : "null") + " existingShowcase=" + (existingShowcase ? "FOUND" : "null"));
    // Remove any stray COMPONENT nodes from previous failed runs before starting
    for (var _prs = 0; _prs < _preRunStragglers.length; _prs++) { _preRunStragglers[_prs].remove(); log.push("  Pre-run: removed stray " + _preRunStragglers[_prs].name.substring(0, 50)); }
    if (existingCS) {
      _isUpdate = true;
      _savedShowcaseX = existingShowcase ? existingShowcase.x : _showcaseXOffset;
      var _exVars = existingCS.children.slice();
      for (var xv = 0; xv < _exVars.length; xv++) existingVarMap[_normalizeVarName(_exVars[xv].name)] = _exVars[xv];
      log.push("  Found existing ComponentSet (" + _exVars.length + " variants) \u2014 upserting in place");

      // --- 1.6. Detect NEW properties added to spec → migrate existing variants ---
      // Parse property names from existing variant names (e.g. "Value=Unchecked, State=Default" → ["Value","State"])
      var _existingPropNames = [];
      if (_exVars.length > 0) {
        var _sampleParts = _exVars[0].name.split(", ");
        for (var _sp = 0; _sp < _sampleParts.length; _sp++) {
          var _eqIdx = _sampleParts[_sp].indexOf("=");
          if (_eqIdx > 0) _existingPropNames.push(_sampleParts[_sp].substring(0, _eqIdx).trim());
        }
      }
      // Find new properties (in spec but not in existing CS)
      var _newProps = [];
      for (var _npi = 0; _npi < propNames.length; _npi++) {
        if (_existingPropNames.indexOf(propNames[_npi]) < 0) _newProps.push(propNames[_npi]);
      }
      // Find removed properties (in existing CS but not in spec)
      var _removedProps = [];
      for (var _rpi = 0; _rpi < _existingPropNames.length; _rpi++) {
        if (propNames.indexOf(_existingPropNames[_rpi]) < 0) _removedProps.push(_existingPropNames[_rpi]);
      }
      if (_newProps.length > 0 || _removedProps.length > 0) {
        if (_newProps.length > 0) log.push("  [migrate] New properties: " + _newProps.join(", "));
        if (_removedProps.length > 0) log.push("  [migrate] Removed properties: " + _removedProps.join(", "));
        // Rebuild existingVarMap with migrated names
        var _migratedMap = {};
        var _migKeys = Object.keys(existingVarMap);
        for (var _mi = 0; _mi < _migKeys.length; _mi++) {
          var _oldNode = existingVarMap[_migKeys[_mi]];
          // Parse existing variant name into property pairs
          var _pairs = _oldNode.name.split(", ");
          var _keptPairs = [];
          for (var _pp = 0; _pp < _pairs.length; _pp++) {
            var _pName = _pairs[_pp].substring(0, _pairs[_pp].indexOf("=")).trim();
            // Keep only properties that still exist in spec
            if (_removedProps.indexOf(_pName) < 0) _keptPairs.push(_pairs[_pp]);
          }
          // Append new properties with default values
          for (var _ns = 0; _ns < _newProps.length; _ns++) {
            var _defaultVal = properties[_newProps[_ns]][0];
            _keptPairs.push(_newProps[_ns] + "=" + _defaultVal);
          }
          var _newName = _keptPairs.join(", ");
          _oldNode.name = _newName;
          var _normNew = _normalizeVarName(_newName);
          // If multiple old variants collapse to same name (removed prop was the only diff), keep first
          if (!_migratedMap[_normNew]) {
            _migratedMap[_normNew] = _oldNode;
          } else {
            // Duplicate after removing property — remove the extra variant
            try { _oldNode.remove(); } catch(e) {}
            log.push("  [migrate] Removed duplicate: " + _newName.substring(0, 50));
          }
          log.push("  [migrate] " + _migKeys[_mi].substring(0, 40) + " → " + _newName.substring(0, 50));
        }
        existingVarMap = _migratedMap;
      }
    }

    // --- 2. Create / upsert each Component variant ---
    var _seenVars = {}; // track which existing variants were matched
    var varComps = []; // new components only (or all when !_isUpdate)

    // Find child by name (and optional Figma node type string)
    function _findKid(parent, name, type) {
      for (var _k = 0; _k < parent.children.length; _k++) {
        if (parent.children[_k].name === name && (!type || parent.children[_k].type === type)) return parent.children[_k];
      }
      return null;
    }
    var _variantProgressInterval = combos.length > 20 ? Math.ceil(combos.length / 10) : 1;
    for (var vi = 0; vi < combos.length; vi++) {
      var combo = combos[vi];
      var vname = [];
      for (var np = 0; np < propNames.length; np++) vname.push(propNames[np] + "=" + combo[propNames[np]]);
      var vnameStr = vname.join(", ");
      if (vi % _variantProgressInterval === 0 || vi === combos.length - 1) {
        sendProgress(compName + " — variant [" + (vi + 1) + "/" + combos.length + "]");
      }

      var merged = mergeComponentStyles(base, combo, variantStyles, propNames);
      var _mergedHash = JSON.stringify(merged);
      // Detect addon decorations (textLeft/textRight = outer labels, prefix/suffix = inner text)
      var _textLeft = merged.textLeft || null;
      var _textRight = merged.textRight || null;
      var _prefix = merged.prefix || null;
      var _suffix = merged.suffix || null;
      var _hasAddon = !!(_textLeft || _textRight);
      var innerF; // inner styled frame (only when _hasAddon)
      var _hasIndicator = !!(merged.indicator);
      var indicatorF; // indicator frame (only when _hasIndicator — compound components like Checkbox/Switch/Radio)
      var _isNewVariant = false;
      var comp;
      var _normVnameStr = _normalizeVarName(vnameStr);
      if (_isUpdate && existingVarMap[_normVnameStr]) {
        // Upsert: reuse variant node AND preserve children (in-place update, no rebuild)
        // Children are updated by _processChildren / native icon+label flow which find existing nodes by name
        comp = existingVarMap[_normVnameStr];
        _seenVars[_normVnameStr] = true;
        // DO NOT remove children — _processChildren and native flow find+update existing nodes
        // Only reset visual properties on the variant COMPONENT itself
        comp.opacity = 1; comp.fills = []; comp.strokes = []; comp.effects = [];
      } else {
        comp = figma.createComponent();
        comp.name = vnameStr;
        _isNewVariant = true;
      }

      // Reset stale properties from previous runs before applying new spec
      _resetStaleProps(comp);

      if (_hasAddon) {
        // Outer comp: transparent HUG wrapper, no padding/fill/stroke
        comp.layoutMode = "HORIZONTAL";
        comp.primaryAxisAlignItems = "MIN";
        comp.counterAxisAlignItems = "CENTER";
        comp.itemSpacing = 0;
        bindFloat(comp, "itemSpacing", "spacing/none", 0);
        comp.resize(merged.width || 240, merged.height || 36);
        comp.layoutSizingHorizontal = "FIXED";
        comp.layoutSizingVertical = "FIXED";
        // Bind size variables (variant level only — NOT inner children)
        if (merged.minWidthVar) {
          bindSizeVar(comp, "minWidth", merged.minWidthVar);
          try { comp.setBoundVariable("width", null); } catch(e) {}
        } else if (merged.widthVar) {
          bindSizeVar(comp, "width", merged.widthVar);
        }
        if (merged.minHeightVar) {
          bindSizeVar(comp, "minHeight", merged.minHeightVar);
          try { comp.setBoundVariable("height", null); } catch(e) {}
        } else if (merged.heightVar) {
          bindSizeVar(comp, "height", merged.heightVar);
        }
        comp.fills = [];
        comp.paddingLeft = 0; comp.paddingRight = 0; comp.paddingTop = 0; comp.paddingBottom = 0;
        bindFloat(comp, "paddingLeft", "spacing/none", 0); bindFloat(comp, "paddingRight", "spacing/none", 0); bindFloat(comp, "paddingTop", "spacing/none", 0); bindFloat(comp, "paddingBottom", "spacing/none", 0);
        // Inner input frame: find existing or create
        innerF = _findKid(comp, "Input", "FRAME");
        if (!innerF) { innerF = figma.createFrame(); innerF.name = "Input"; }
        innerF.layoutMode = (merged.layout || "horizontal") === "horizontal" ? "HORIZONTAL" : "VERTICAL";
        var _paI = merged.primaryAlign || "CENTER";
        innerF.primaryAxisAlignItems = _paI === "start" || _paI === "MIN" ? "MIN" : _paI === "end" || _paI === "MAX" ? "MAX" : _paI === "space-between" || _paI === "SPACE_BETWEEN" ? "SPACE_BETWEEN" : "CENTER";
        var _caI = merged.counterAlign || "CENTER";
        innerF.counterAxisAlignItems = _caI === "start" || _caI === "MIN" ? "MIN" : _caI === "end" || _caI === "MAX" ? "MAX" : "CENTER";
        var gapRI = merged.gap !== undefined ? merged.gap : "xs";
        if (gapRI === "auto") {
          innerF.itemSpacing = 0;
          try { innerF.setBoundVariable("itemSpacing", null); } catch(e) {}
        } else if (typeof gapRI === "string") {
          innerF.itemSpacing = getSpacingValue(gapRI);
          var gapVarNameI = gapRI.indexOf("/") !== -1 ? gapRI : "spacing/" + gapRI;
          bindFloat(innerF, "itemSpacing", gapVarNameI, innerF.itemSpacing);
        } else { innerF.itemSpacing = gapRI; if (gapRI === 0) bindFloat(innerF, "itemSpacing", "spacing/none", 0); }
        innerF.resize(merged.width || 240, merged.height || 36);
        // NO size variable binding on innerF — only variant comp gets size tokens
        var pxRI = merged.paddingX !== undefined ? merged.paddingX : "md";
        var pyRI = merged.paddingY !== undefined ? merged.paddingY : "xs";
        if (typeof pxRI === "string") {
          var pxVI = getSpacingValue(pxRI); var pxVarNameI = pxRI.indexOf("/") !== -1 ? pxRI : "spacing/" + pxRI;
          innerF.paddingLeft = pxVI; innerF.paddingRight = pxVI;
          bindFloat(innerF, "paddingLeft", pxVarNameI, pxVI); bindFloat(innerF, "paddingRight", pxVarNameI, pxVI);
        } else { innerF.paddingLeft = pxRI; innerF.paddingRight = pxRI; if (pxRI === 0) { bindFloat(innerF, "paddingLeft", "spacing/none", 0); bindFloat(innerF, "paddingRight", "spacing/none", 0); } }
        if (typeof pyRI === "string") {
          var pyVI = getSpacingValue(pyRI); var pyVarNameI = pyRI.indexOf("/") !== -1 ? pyRI : "spacing/" + pyRI;
          innerF.paddingTop = pyVI; innerF.paddingBottom = pyVI;
          bindFloat(innerF, "paddingTop", pyVarNameI, pyVI); bindFloat(innerF, "paddingBottom", pyVarNameI, pyVI);
        } else { innerF.paddingTop = pyRI; innerF.paddingBottom = pyRI; if (pyRI === 0) { bindFloat(innerF, "paddingTop", "spacing/none", 0); bindFloat(innerF, "paddingBottom", "spacing/none", 0); } }
        var radI = merged.radius !== undefined ? merged.radius : "lg";
        var _radVal = typeof radI === "string" ? getRadiusValue(radI) : radI;
        var rL = _textLeft ? 0 : _radVal; var rR = _textRight ? 0 : _radVal;
        innerF.topLeftRadius = rL; innerF.bottomLeftRadius = rL;
        innerF.topRightRadius = rR; innerF.bottomRightRadius = rR;
        if (typeof radI === "string") {
          var radVarNameI = radI.indexOf("/") !== -1 ? radI : "border radius/" + radI;
          var rVarI = findVar(radVarNameI);
          if (rVarI) { try { if (!_textLeft) { innerF.setBoundVariable("topLeftRadius",rVarI); innerF.setBoundVariable("bottomLeftRadius",rVarI); } if (!_textRight) { innerF.setBoundVariable("topRightRadius",rVarI); innerF.setBoundVariable("bottomRightRadius",rVarI); } } catch(e){} }
        }
        if (merged.fill) { if (merged.fillOpacity !== undefined) setFillWithOpacity(innerF, merged.fill, merged.fillOpacity); else setFill(innerF, merged.fill); } else innerF.fills = [];
        if (merged.stroke) { if (merged.strokeOpacity !== undefined) setStrokeWithOpacity(innerF, merged.stroke, merged.strokeOpacity); else setStroke(innerF, merged.stroke); innerF.strokeWeight = merged.strokeWeight || 1; innerF.strokeAlign = "INSIDE"; if (merged.strokeDash && Array.isArray(merged.strokeDash)) innerF.dashPattern = merged.strokeDash; else innerF.dashPattern = []; if (merged.strokeSides) _applyStrokeSides(innerF, merged.strokeSides, merged.strokeWeight || 1); } else { innerF.strokes = []; innerF.strokeWeight = 0; innerF.dashPattern = []; }
        // Remove shared-edge borders: border-l-0 when textLeft, border-r-0 when textRight
        if (_textLeft) innerF.strokeLeftWeight = 0;
        if (_textRight) innerF.strokeRightWeight = 0;
        // Effect style or focus ring on addon inner frame
        if (merged.effectStyleName) {
          var _aeStyles = await figma.getLocalEffectStylesAsync();
          var _aeFound = null;
          for (var _aei = 0; _aei < _aeStyles.length; _aei++) {
            if (_aeStyles[_aei].name === merged.effectStyleName) { _aeFound = _aeStyles[_aei]; break; }
          }
          if (_aeFound) { try { innerF.setEffectStyleIdAsync(_aeFound.id); } catch(e) { innerF.effects = _aeFound.effects; } }
        } else if (merged.focusRing) {
          await applyFocusRingEffect(innerF, merged.focusRing);
        } else {
          innerF.effects = [];
        }
        if (merged.opacity !== undefined) innerF.opacity = merged.opacity;
      } else if (_hasIndicator) {
        // Indicator pattern: comp = transparent HUG wrapper, indicator child = styled element
        // Used for compound components like Checkbox, Switch, Radio
        var _indSpec = merged.indicator;
        comp.layoutMode = "HORIZONTAL";
        comp.primaryAxisAlignItems = "MIN";
        comp.counterAxisAlignItems = "CENTER";
        var _indGap = merged.gap !== undefined ? merged.gap : "xs";
        if (typeof _indGap === "string") {
          comp.itemSpacing = getSpacingValue(_indGap);
          var _indGapVarName = _indGap.indexOf("/") !== -1 ? _indGap : "spacing/" + _indGap;
          bindFloat(comp, "itemSpacing", _indGapVarName, comp.itemSpacing);
        } else { comp.itemSpacing = _indGap; if (_indGap === 0) bindFloat(comp, "itemSpacing", "spacing/none", 0); }
        comp.resize(merged.width || 120, merged.height || 20);
        comp.layoutSizingHorizontal = "HUG";
        comp.layoutSizingVertical = "HUG";
        comp.fills = [];
        comp.strokes = [];
        comp.paddingLeft = 0; comp.paddingRight = 0; comp.paddingTop = 0; comp.paddingBottom = 0;
        bindFloat(comp, "paddingLeft", "spacing/none", 0); bindFloat(comp, "paddingRight", "spacing/none", 0); bindFloat(comp, "paddingTop", "spacing/none", 0); bindFloat(comp, "paddingBottom", "spacing/none", 0);
        if (merged.opacity !== undefined) comp.opacity = merged.opacity;
        // Create indicator frame
        indicatorF = _findKid(comp, "Indicator", "FRAME");
        if (!indicatorF) { indicatorF = figma.createFrame(); indicatorF.name = "Indicator"; }
        indicatorF.layoutMode = "HORIZONTAL";
        var _indAlign = merged.indicatorAlign || "center";
        indicatorF.primaryAxisAlignItems = _indAlign === "min" || _indAlign === "start" ? "MIN" : _indAlign === "max" || _indAlign === "end" ? "MAX" : "CENTER";
        indicatorF.counterAxisAlignItems = "CENTER";
        indicatorF.itemSpacing = 0;
        bindFloat(indicatorF, "itemSpacing", "spacing/none", 0);
        var _indW = _indSpec.width || 16;
        var _indH = _indSpec.height || 16;
        indicatorF.resize(_indW, _indH);
        // Bind size variables for indicator width/height
        if (_indSpec.widthVar) bindSizeVar(indicatorF, "width", _indSpec.widthVar);
        if (_indSpec.heightVar) bindSizeVar(indicatorF, "height", _indSpec.heightVar);
        indicatorF.layoutSizingHorizontal = "FIXED";
        indicatorF.layoutSizingVertical = "FIXED";
        var _indPx = _indSpec.paddingX !== undefined ? _indSpec.paddingX : "none"; var _indPy = _indSpec.paddingY !== undefined ? _indSpec.paddingY : "none";
        if (typeof _indPx === "string") {
          var _ipxv = getSpacingValue(_indPx); indicatorF.paddingLeft = _ipxv; indicatorF.paddingRight = _ipxv;
          var _ipxVarName = _indPx.indexOf("/") !== -1 ? _indPx : "spacing/" + _indPx;
          bindFloat(indicatorF, "paddingLeft", _ipxVarName, _ipxv); bindFloat(indicatorF, "paddingRight", _ipxVarName, _ipxv);
        } else { indicatorF.paddingLeft = _indPx; indicatorF.paddingRight = _indPx; }
        if (typeof _indPy === "string") {
          var _ipyv = getSpacingValue(_indPy); indicatorF.paddingTop = _ipyv; indicatorF.paddingBottom = _ipyv;
          var _ipyVarName = _indPy.indexOf("/") !== -1 ? _indPy : "spacing/" + _indPy;
          bindFloat(indicatorF, "paddingTop", _ipyVarName, _ipyv); bindFloat(indicatorF, "paddingBottom", _ipyVarName, _ipyv);
        } else { indicatorF.paddingTop = _indPy; indicatorF.paddingBottom = _indPy; }
        // Radius
        var _indRad = _indSpec.radius !== undefined ? _indSpec.radius : "2xs";
        if (typeof _indRad === "string") {
          var _irv = getRadiusValue(_indRad);
          indicatorF.topLeftRadius = _irv; indicatorF.topRightRadius = _irv; indicatorF.bottomLeftRadius = _irv; indicatorF.bottomRightRadius = _irv;
          var _irVarName = _indRad.indexOf("/") !== -1 ? _indRad : "border radius/" + _indRad;
          var _irVar = findVar(_irVarName);
          if (_irVar) { try { indicatorF.setBoundVariable("topLeftRadius",_irVar); indicatorF.setBoundVariable("topRightRadius",_irVar); indicatorF.setBoundVariable("bottomLeftRadius",_irVar); indicatorF.setBoundVariable("bottomRightRadius",_irVar); } catch(e){} }
        } else { indicatorF.topLeftRadius = _indRad; indicatorF.topRightRadius = _indRad; indicatorF.bottomLeftRadius = _indRad; indicatorF.bottomRightRadius = _indRad; }
        // Clip content on indicator (needed for focus ring DROP_SHADOW to render correctly)
        indicatorF.clipsContent = !!(_indSpec.clipsContent);
        // Fill & Stroke from merged (comes from base + variantStyles)
        if (merged.fill) { if (merged.fillOpacity !== undefined) setFillWithOpacity(indicatorF, merged.fill, merged.fillOpacity); else setFill(indicatorF, merged.fill); } else indicatorF.fills = [];
        if (merged.stroke) { if (merged.strokeOpacity !== undefined) setStrokeWithOpacity(indicatorF, merged.stroke, merged.strokeOpacity); else setStroke(indicatorF, merged.stroke); indicatorF.strokeWeight = merged.strokeWeight || 1; indicatorF.strokeAlign = "INSIDE"; if (merged.strokeSides) _applyStrokeSides(indicatorF, merged.strokeSides, merged.strokeWeight || 1); } else indicatorF.strokes = [];
        // Focus ring on indicator as DROP_SHADOW
        if (merged.focusRing) {
          await applyFocusRingEffect(indicatorF, merged.focusRing);
        } else {
          indicatorF.effects = [];
        }
        // Thumb child inside indicator (e.g. Switch sliding dot, Radio filled dot)
        // showThumb: undefined → always show (Switch); false → hide (Radio unchecked); true → show (Radio checked)
        if (_indSpec.thumb && merged.showThumb !== false) {
          var _thumbSpec = _indSpec.thumb;
          var _thumbF = _findKid(indicatorF, "Thumb", "FRAME");
          if (!_thumbF) { _thumbF = figma.createFrame(); _thumbF.name = "Thumb"; }
          _thumbF.resize(_thumbSpec.width || 16, _thumbSpec.height || 16);
          _thumbF.layoutSizingHorizontal = "FIXED";
          _thumbF.layoutSizingVertical = "FIXED";
          var _thumbRad = _thumbSpec.radius !== undefined ? _thumbSpec.radius : "full";
          if (typeof _thumbRad === "string") {
            var _trv = getRadiusValue(_thumbRad);
            _thumbF.topLeftRadius = _trv; _thumbF.topRightRadius = _trv; _thumbF.bottomLeftRadius = _trv; _thumbF.bottomRightRadius = _trv;
            var _trVarName = _thumbRad.indexOf("/") !== -1 ? _thumbRad : "border radius/" + _thumbRad;
            var _trVar = findVar(_trVarName);
            if (_trVar) { try { _thumbF.setBoundVariable("topLeftRadius",_trVar); _thumbF.setBoundVariable("topRightRadius",_trVar); _thumbF.setBoundVariable("bottomLeftRadius",_trVar); _thumbF.setBoundVariable("bottomRightRadius",_trVar); } catch(e){} }
          } else { _thumbF.topLeftRadius = _thumbRad; _thumbF.topRightRadius = _thumbRad; _thumbF.bottomLeftRadius = _thumbRad; _thumbF.bottomRightRadius = _thumbRad; }
          // Force white fill first, then try variable binding
          _thumbF.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
          if (_thumbSpec.fill) {
            var _tvf = findVar(_thumbSpec.fill);
            if (_tvf) _thumbF.fills = [makeBoundPaint(_tvf)];
          }
          log.push("  [THUMB] " + vnameStr + " → " + (_thumbSpec.width||16) + "x" + (_thumbSpec.height||16) + " fill=" + _thumbSpec.fill + " varOK=" + !!findVar(_thumbSpec.fill) + " fills=" + _thumbF.fills.length + " parent=" + (indicatorF ? indicatorF.name : "null") + " indChildren=" + indicatorF.children.length);
          _thumbF.strokes = [];
          _thumbF.paddingLeft = 0; _thumbF.paddingRight = 0; _thumbF.paddingTop = 0; _thumbF.paddingBottom = 0;
          bindFloat(_thumbF, "paddingLeft", "spacing/none", 0); bindFloat(_thumbF, "paddingRight", "spacing/none", 0); bindFloat(_thumbF, "paddingTop", "spacing/none", 0); bindFloat(_thumbF, "paddingBottom", "spacing/none", 0);
          if (_thumbF.parent !== indicatorF) indicatorF.appendChild(_thumbF);
        } else if (_indSpec.thumb && merged.showThumb === false) {
          // Remove thumb when hidden (e.g. Radio unchecked)
          var _thumbRemove = _findKid(indicatorF, "Thumb", "FRAME");
          if (_thumbRemove) _thumbRemove.remove();
        }
        if (indicatorF.parent !== comp) comp.appendChild(indicatorF);
      } else {
        // No addon — layout/gap/size/padding/radius/fill/stroke on comp directly
        // Layout
        comp.layoutMode = (merged.layout || "horizontal") === "horizontal" ? "HORIZONTAL" : "VERTICAL";
        var _primaryAlign = merged.primaryAlign || "CENTER";
        comp.primaryAxisAlignItems = _primaryAlign === "start" || _primaryAlign === "MIN" ? "MIN" : _primaryAlign === "end" || _primaryAlign === "MAX" ? "MAX" : _primaryAlign === "space-between" || _primaryAlign === "SPACE_BETWEEN" ? "SPACE_BETWEEN" : "CENTER";
        var _counterAlign = merged.counterAlign || "CENTER";
        comp.counterAxisAlignItems = _counterAlign === "start" || _counterAlign === "MIN" ? "MIN" : _counterAlign === "end" || _counterAlign === "MAX" ? "MAX" : "CENTER";
        // Gap — bind to spacing/* variable
        var gapR = merged.gap !== undefined ? merged.gap : "xs";
        if (gapR === "auto") {
          comp.itemSpacing = 0;
          try { comp.setBoundVariable("itemSpacing", null); } catch(e) {}
        } else if (typeof gapR === "string") {
          comp.itemSpacing = getSpacingValue(gapR);
          var gapVarName = gapR.indexOf("/") !== -1 ? gapR : "spacing/" + gapR;
          bindFloat(comp, "itemSpacing", gapVarName, comp.itemSpacing);
        } else { comp.itemSpacing = gapR; if (gapR === 0) bindFloat(comp, "itemSpacing", "spacing/none", 0); }
        // Size
        comp.resize(merged.width || 120, merged.height || 36);
        comp.layoutSizingHorizontal = merged.widthMode === "hug" ? "HUG" : "FIXED";
        var _useHugV = merged.heightMode === "hug" || (merged.heightMode !== "fixed" && !!(merged.children && merged.children.length > 0));
        comp.layoutSizingVertical = _useHugV ? "HUG" : "FIXED";
        // Bind size variables — stale minWidth/minHeight already cleared by _resetStaleProps
        if (merged.minWidthVar) {
          bindSizeVar(comp, "minWidth", merged.minWidthVar);
          try { comp.setBoundVariable("width", null); } catch(e) {}
        } else if (merged.widthVar && comp.layoutSizingHorizontal === "FIXED") {
          bindSizeVar(comp, "width", merged.widthVar);
        }
        if (merged.minHeightVar) {
          bindSizeVar(comp, "minHeight", merged.minHeightVar);
          try { comp.setBoundVariable("height", null); } catch(e) {}
        } else if (merged.heightVar && comp.layoutSizingVertical === "FIXED") {
          bindSizeVar(comp, "height", merged.heightVar);
        }
        // Padding — bind to spacing/* variable (NOT border radius)
        var pxR = merged.paddingX !== undefined ? merged.paddingX : "md";
        var pyR = merged.paddingY !== undefined ? merged.paddingY : "xs";
        if (typeof pxR === "string") {
          var pxV = getSpacingValue(pxR);
          var pxVarName = pxR.indexOf("/") !== -1 ? pxR : "spacing/" + pxR;
          comp.paddingLeft = pxV; comp.paddingRight = pxV;
          bindFloat(comp, "paddingLeft", pxVarName, pxV);
          bindFloat(comp, "paddingRight", pxVarName, pxV);
        } else { comp.paddingLeft = pxR; comp.paddingRight = pxR; if (pxR === 0) { bindFloat(comp, "paddingLeft", "spacing/none", 0); bindFloat(comp, "paddingRight", "spacing/none", 0); } }
        if (typeof pyR === "string") {
          var pyV = getSpacingValue(pyR);
          var pyVarName = pyR.indexOf("/") !== -1 ? pyR : "spacing/" + pyR;
          comp.paddingTop = pyV; comp.paddingBottom = pyV;
          bindFloat(comp, "paddingTop", pyVarName, pyV);
          bindFloat(comp, "paddingBottom", pyVarName, pyV);
        } else { comp.paddingTop = pyR; comp.paddingBottom = pyR; if (pyR === 0) { bindFloat(comp, "paddingTop", "spacing/none", 0); bindFloat(comp, "paddingBottom", "spacing/none", 0); } }
        // Per-side padding overrides (after paddingX/paddingY)
        if (merged.paddingTop !== undefined) {
          if (typeof merged.paddingTop === "string") { var _ptV = getSpacingValue(merged.paddingTop); comp.paddingTop = _ptV; bindFloat(comp, "paddingTop", merged.paddingTop.indexOf("/") !== -1 ? merged.paddingTop : "spacing/" + merged.paddingTop, _ptV); }
          else { comp.paddingTop = merged.paddingTop; if (merged.paddingTop === 0) bindFloat(comp, "paddingTop", "spacing/none", 0); }
        }
        if (merged.paddingBottom !== undefined) {
          if (typeof merged.paddingBottom === "string") { var _pbV = getSpacingValue(merged.paddingBottom); comp.paddingBottom = _pbV; bindFloat(comp, "paddingBottom", merged.paddingBottom.indexOf("/") !== -1 ? merged.paddingBottom : "spacing/" + merged.paddingBottom, _pbV); }
          else { comp.paddingBottom = merged.paddingBottom; if (merged.paddingBottom === 0) bindFloat(comp, "paddingBottom", "spacing/none", 0); }
        }
        if (merged.paddingLeft !== undefined) {
          if (typeof merged.paddingLeft === "string") { var _plV = getSpacingValue(merged.paddingLeft); comp.paddingLeft = _plV; bindFloat(comp, "paddingLeft", merged.paddingLeft.indexOf("/") !== -1 ? merged.paddingLeft : "spacing/" + merged.paddingLeft, _plV); }
          else { comp.paddingLeft = merged.paddingLeft; if (merged.paddingLeft === 0) bindFloat(comp, "paddingLeft", "spacing/none", 0); }
        }
        if (merged.paddingRight !== undefined) {
          if (typeof merged.paddingRight === "string") { var _prV = getSpacingValue(merged.paddingRight); comp.paddingRight = _prV; bindFloat(comp, "paddingRight", merged.paddingRight.indexOf("/") !== -1 ? merged.paddingRight : "spacing/" + merged.paddingRight, _prV); }
          else { comp.paddingRight = merged.paddingRight; if (merged.paddingRight === 0) bindFloat(comp, "paddingRight", "spacing/none", 0); }
        }
        // Radius — bind to border radius/* variable
        var rad = merged.radius !== undefined ? merged.radius : "lg";
        if (typeof rad === "string") {
          var rv = getRadiusValue(rad);
          comp.topLeftRadius = rv; comp.topRightRadius = rv; comp.bottomLeftRadius = rv; comp.bottomRightRadius = rv;
          var radVarName = rad.indexOf("/") !== -1 ? rad : "border radius/" + rad;
          var rVar = findVar(radVarName);
          if (rVar) { try { comp.setBoundVariable("topLeftRadius",rVar); comp.setBoundVariable("topRightRadius",rVar); comp.setBoundVariable("bottomLeftRadius",rVar); comp.setBoundVariable("bottomRightRadius",rVar); } catch(e){} }
        } else { comp.topLeftRadius = rad; comp.topRightRadius = rad; comp.bottomLeftRadius = rad; comp.bottomRightRadius = rad; if (rad === 0) { var _rn0c = findVar("border radius/none"); if (_rn0c) { try { comp.setBoundVariable("topLeftRadius",_rn0c); comp.setBoundVariable("topRightRadius",_rn0c); comp.setBoundVariable("bottomLeftRadius",_rn0c); comp.setBoundVariable("bottomRightRadius",_rn0c); } catch(e){} } } }
        // Per-corner radius overrides (supports string tokens like "md" or numeric px)
        var _pcKeysComp = [["radiusTopLeft","topLeftRadius"],["radiusTopRight","topRightRadius"],["radiusBottomLeft","bottomLeftRadius"],["radiusBottomRight","bottomRightRadius"]];
        for (var _pcj = 0; _pcj < _pcKeysComp.length; _pcj++) {
          var _pcKeyC = _pcKeysComp[_pcj][0], _pcPropC = _pcKeysComp[_pcj][1];
          if (merged[_pcKeyC] !== undefined) {
            var _pcValC = merged[_pcKeyC];
            if (typeof _pcValC === "string") {
              var _pcPxC = getRadiusValue(_pcValC);
              comp[_pcPropC] = _pcPxC;
              var _pcVarNameC = _pcValC.indexOf("/") !== -1 ? _pcValC : "border radius/" + _pcValC;
              var _pcVarC = findVar(_pcVarNameC);
              if (_pcVarC) { try { comp.setBoundVariable(_pcPropC, _pcVarC); } catch(e){} }
            } else {
              comp[_pcPropC] = _pcValC;
            }
          }
        }
        // Fill
        if (merged.imageUrl) {
          try {
            console.log("[IMG] variant imageUrl: " + merged.imageUrl + " for " + vnameStr);
            var _imgHash = await getImageHash(merged.imageUrl);
            comp.fills = [{ type: "IMAGE", imageHash: _imgHash, scaleMode: "FILL" }];
            log.push("  [IMG] Image OK: " + merged.imageUrl);
          } catch(e) {
            log.push("  [WARN] Image fetch failed for " + vnameStr + ": " + e.message);
            console.log("[IMG] FAILED: " + e.message + " url=" + merged.imageUrl);
            // Fallback: show fill color so variant isn't invisible
            if (merged.fill) { setFill(comp, merged.fill); }
          }
        } else if (merged.fill) { if (merged.fillOpacity !== undefined) setFillWithOpacity(comp, merged.fill, merged.fillOpacity); else setFill(comp, merged.fill); }
        else comp.fills = [];
        // Stroke
        if (merged.stroke) {
          if (merged.strokeOpacity !== undefined) setStrokeWithOpacity(comp, merged.stroke, merged.strokeOpacity);
          else setStroke(comp, merged.stroke);
          comp.strokeWeight = merged.strokeWeight || 1;
          comp.strokeAlign = "INSIDE";
          if (merged.strokeDash && Array.isArray(merged.strokeDash)) comp.dashPattern = merged.strokeDash;
          if (merged.strokeSides) _applyStrokeSides(comp, merged.strokeSides, merged.strokeWeight || 1);
        }
        // Effect style (e.g. "Shadows/sm" for web `shadow` class)
        if (merged.effectStyleName) {
          var _eStyles = await figma.getLocalEffectStylesAsync();
          var _eFound = null;
          for (var _ei = 0; _ei < _eStyles.length; _ei++) {
            if (_eStyles[_ei].name === merged.effectStyleName) { _eFound = _eStyles[_ei]; break; }
          }
          if (_eFound) { try { comp.setEffectStyleIdAsync(_eFound.id); } catch(e) { comp.effects = _eFound.effects; } }
        }
        // Focus ring via effect style (Ring/default, Ring/error, etc.)
        if (merged.focusRing) {
          await applyFocusRingEffect(comp, merged.focusRing);
        } else if (!merged.effectStyleName) {
          comp.effects = [];
        }
        // Opacity
        if (merged.opacity !== undefined) comp.opacity = merged.opacity;
      }

      // --- Ellipse mode: overlapping ellipses for spinner/arc components ---
      if (merged.ellipses && Array.isArray(merged.ellipses)) {
        var _eW = merged.width || 24;
        var _eH = merged.height || 24;
        for (var _eli = 0; _eli < merged.ellipses.length; _eli++) {
          var _eSpec = merged.ellipses[_eli];
          var _eName = _eSpec.name || ("Ellipse" + _eli);
          var _ellipse = _findKid(comp, _eName, "ELLIPSE");
          if (!_ellipse) { _ellipse = figma.createEllipse(); _ellipse.name = _eName; }
          if (_ellipse.parent !== comp) comp.appendChild(_ellipse);
          _ellipse.resize(_eW, _eH);
          _ellipse.layoutPositioning = "ABSOLUTE";
          _ellipse.x = 0; _ellipse.y = 0;
          _ellipse.constraints = { horizontal: "SCALE", vertical: "SCALE" };
          // Arc data (partial circle)
          if (_eSpec.arcStart !== undefined && _eSpec.arcSweep !== undefined) {
            var _startRad = (_eSpec.arcStart * Math.PI) / 180;
            var _endRad = ((_eSpec.arcStart + _eSpec.arcSweep) * Math.PI) / 180;
            _ellipse.arcData = { startingAngle: _startRad, endingAngle: _endRad, innerRadius: _eSpec.innerRadius || 0 };
          } else if (_eSpec.innerRadius !== undefined) {
            _ellipse.arcData = { startingAngle: 0, endingAngle: Math.PI * 2, innerRadius: _eSpec.innerRadius };
          }
          // Fill — with fallback solid gray when variable not found
          if (_eSpec.fill) {
            var _efVar = findVar(_eSpec.fill);
            if (_efVar) {
              _ellipse.fills = [makeBoundPaint(_efVar)];
              if (_eSpec.fillOpacity !== undefined && _eSpec.fillOpacity < 1) {
                var _eFills = _ellipse.fills.slice();
                _eFills[0] = Object.assign({}, _eFills[0], { opacity: _eSpec.fillOpacity });
                _ellipse.fills = _eFills;
              }
            } else {
              var _efOp = _eSpec.fillOpacity !== undefined ? _eSpec.fillOpacity : 1;
              _ellipse.fills = [{ type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.5 }, opacity: _efOp }];
              log.push("  [WARN] Ellipse fill var not found: " + _eSpec.fill);
            }
          } else _ellipse.fills = [];
          // Stroke
          if (_eSpec.stroke) {
            if (_eSpec.strokeOpacity !== undefined) setStrokeWithOpacity(_ellipse, _eSpec.stroke, _eSpec.strokeOpacity);
            else setStroke(_ellipse, _eSpec.stroke);
            _ellipse.strokeWeight = _eSpec.strokeWeight || 1;
            _ellipse.strokeAlign = _eSpec.strokeAlign || "CENTER";
          } else _ellipse.strokes = [];
          // Opacity
          if (_eSpec.opacity !== undefined) _ellipse.opacity = _eSpec.opacity;
        }
        // Cleanup: remove old ellipses not in current spec
        var _validENames = {};
        for (var _vei = 0; _vei < merged.ellipses.length; _vei++) _validENames[merged.ellipses[_vei].name || ("Ellipse" + _vei)] = true;
        for (var _cei = comp.children.length - 1; _cei >= 0; _cei--) {
          if (comp.children[_cei].type === "ELLIPSE" && !_validENames[comp.children[_cei].name]) comp.children[_cei].remove();
        }
        log.push("  [ELLIPSES] " + vnameStr + " → " + merged.ellipses.length + " ellipses, size=" + _eW + "x" + _eH);
      }

      // --- Children mode: structured child nodes for compound components ---
      var _hasChildren = !!(merged.children && merged.children.length > 0) && !_hasAddon && !_hasIndicator;
      if (_hasChildren) {
        var _childValidNames = await _processChildren(merged.children, comp, combo, { textFill: merged.textFill, iconFill: merged.iconFill });
        for (var _rchild = comp.children.length - 1; _rchild >= 0; _rchild--) {
          if (!_childValidNames[comp.children[_rchild].name]) comp.children[_rchild].remove();
        }
        var _childOrd = _getChildOrder(merged.children, combo);
        for (var _coi2 = 0; _coi2 < _childOrd.length; _coi2++) {
          for (var _cci2 = 0; _cci2 < comp.children.length; _cci2++) {
            if (comp.children[_cci2].name === _childOrd[_coi2]) { comp.appendChild(comp.children[_cci2]); break; }
          }
        }
      } else {
      // Build addon wrapper structure — textLeft/textRight as outer label frames
      var targetFrame = _hasAddon ? innerF : comp;
      // For indicator pattern: icons go inside indicator, label goes in comp wrapper
      var iconTarget = _hasIndicator ? indicatorF : targetFrame;
      var labelTarget = _hasIndicator ? comp : targetFrame;
      var _iconColor = merged.iconFill || merged.textFill || "foreground";
      var _radVal2 = typeof merged.radius === "string" ? getRadiusValue(merged.radius) : (merged.radius || 8);
      if (_hasAddon && _textLeft) {
        var tlF = _findKid(comp, "TextLeft", "FRAME");
        if (!tlF) { tlF = figma.createFrame(); tlF.name = "TextLeft"; comp.appendChild(tlF); }
        tlF.layoutMode = "HORIZONTAL";
        tlF.primaryAxisAlignItems = "CENTER"; tlF.counterAxisAlignItems = "CENTER";
        tlF.resize(60, merged.height || 36);
        tlF.paddingLeft = 12; tlF.paddingRight = 12;
        setFill(tlF, "muted");
        setStroke(tlF, merged.stroke || "border"); tlF.strokeWeight = 1; tlF.strokeAlign = "INSIDE";
        tlF.strokeRightWeight = 0; // border-r-0: no right border at shared edge with innerF
        tlF.topLeftRadius = _radVal2; tlF.bottomLeftRadius = _radVal2;
        tlF.topRightRadius = 0; tlF.bottomRightRadius = 0;
        var _rn0TL = findVar("border radius/none"); if (_rn0TL) { try { tlF.setBoundVariable("topRightRadius",_rn0TL); tlF.setBoundVariable("bottomRightRadius",_rn0TL); } catch(e){} }
        tlF.layoutSizingHorizontal = "HUG"; tlF.layoutSizingVertical = "FILL";
        var tlTxt = _findKid(tlF, "Text", "TEXT");
        if (!tlTxt) { tlTxt = figma.createText(); tlTxt.name = "Text"; tlF.appendChild(tlTxt); }
        var _tlTsN = merged.textStyle || null; var _tlFL = false;
        if (_tlTsN) { var _tlTs = findTextStyle(_tlTsN); if (_tlTs && _tlTs.fontName) { try { await figma.loadFontAsync(_tlTs.fontName); _tlFL=true; } catch(e){} try { await tlTxt.setTextStyleIdAsync(_tlTs.id); } catch(e){} } }
        if (!_tlFL) { var _tlFb = await loadFontSafe("Inter","Regular"); if (_tlFb) tlTxt.fontName = _tlFb; tlTxt.fontSize = 14; }
        tlTxt.characters = _textLeft;
        setTextFill(tlTxt, "muted-foreground");
        try { tlTxt.textAutoResize = "TRUNCATE"; } catch(e){} try { tlTxt.maxLines = 1; } catch(e){} try { tlTxt.textTruncation = "ENDING"; } catch(e){}
      }
      if (_hasAddon) {
        if (innerF.parent !== comp) comp.appendChild(innerF);
        innerF.layoutSizingHorizontal = "FILL";
        innerF.layoutSizingVertical = "FILL";
      }

      // Icon Left — real instance from Icon Components
      // Auto-detect from combo properties: iconLeft=true or Show Left Icon=true
      var icoSize = merged.iconSize || 16;
      var _showIconLeft = merged.iconLeft || combo["IconLeft"] === "true" || combo["Show Left Icon"] === "true" || combo["Show left icon"] === "true";
      var _showIconRight = merged.iconRight || combo["IconRight"] === "true" || combo["Show Right Icon"] === "true" || combo["Show right icon"] === "true";
      var _iconLeftName = merged.iconLeftName || "Search";
      var _iconRightName = merged.iconRightName || "ArrowRight";
      // --- Icon Left: always ensure instance exists, toggle visibility ---
      {
        var leftExist = _findKid(iconTarget, "Icon Left");
        if (_showIconLeft) {
          if (leftExist && leftExist.type === "INSTANCE") {
            leftExist.visible = true;
            leftExist.resize(icoSize, icoSize);
            // Swap component if icon name changed (e.g. Check → Minus on upsert)
            var _wantLeftComp = findIconComponent(_iconLeftName);
            var _leftMainComp = null; try { _leftMainComp = await leftExist.getMainComponentAsync(); } catch(e) {}
            if (_wantLeftComp && _leftMainComp && _leftMainComp.id !== _wantLeftComp.id) {
              leftExist.swapComponent(_wantLeftComp);
            }
            var leftVecs = leftExist.findAll(function(n) { return n.type === "VECTOR" || n.type === "ELLIPSE" || n.type === "LINE"; });
            var icoFgVar = findVar(_iconColor);
            if (icoFgVar) { for (var lv = 0; lv < leftVecs.length; lv++) { if (leftVecs[lv].strokes && leftVecs[lv].strokes.length > 0) leftVecs[lv].strokes = [makeBoundPaint(icoFgVar)]; } }
          } else {
            if (leftExist) leftExist.remove();
            var leftIconComp = findIconComponent(_iconLeftName) || findIconComponent("Search") || findIconComponent("ChevronLeft") || findIconComponent("Plus");
            if (leftIconComp) {
              var leftInst = leftIconComp.createInstance();
              leftInst.name = "Icon Left"; leftInst.resize(icoSize, icoSize); leftInst.visible = true;
              var leftVecs2 = leftInst.findAll(function(n) { return n.type === "VECTOR" || n.type === "ELLIPSE" || n.type === "LINE"; });
              var icoFgVar2 = findVar(_iconColor);
              if (icoFgVar2) { for (var lv2 = 0; lv2 < leftVecs2.length; lv2++) { if (leftVecs2[lv2].strokes && leftVecs2[lv2].strokes.length > 0) leftVecs2[lv2].strokes = [makeBoundPaint(icoFgVar2)]; } }
              iconTarget.appendChild(leftInst);
            } else {
              var icoL = figma.createFrame(); icoL.name = "Icon Left"; icoL.resize(icoSize, icoSize); icoL.fills = [];
              setStroke(icoL, _iconColor); icoL.strokeWeight = 1.5;
              icoL.topLeftRadius = 3; icoL.topRightRadius = 3; icoL.bottomLeftRadius = 3; icoL.bottomRightRadius = 3;
              iconTarget.appendChild(icoL);
            }
          }
        } else {
          // Not showing — remove icon entirely (no hidden instances, full variant model)
          if (leftExist) leftExist.remove();
        }
      }

      // Prefix text (inside input, after left icon)
      if (_prefix) {
        var pfxN = _findKid(targetFrame, "Prefix", "TEXT");
        if (!pfxN) { pfxN = figma.createText(); pfxN.name = "Prefix"; targetFrame.appendChild(pfxN); }
        var _pfxTsN = merged.textStyle || null; var _pfxFL = false;
        if (_pfxTsN) { var _pfxTs = findTextStyle(_pfxTsN); if (_pfxTs && _pfxTs.fontName) { try { await figma.loadFontAsync(_pfxTs.fontName); _pfxFL=true; } catch(e){} try { await pfxN.setTextStyleIdAsync(_pfxTs.id); } catch(e){} } }
        if (!_pfxFL) { var _pfxFb = await loadFontSafe("Inter","Regular"); if (_pfxFb) pfxN.fontName = _pfxFb; pfxN.fontSize = 14; }
        pfxN.characters = _prefix;
        setTextFill(pfxN, "muted-foreground");
        try { pfxN.textAutoResize = "TRUNCATE"; } catch(e){} try { pfxN.maxLines = 1; } catch(e){} try { pfxN.textTruncation = "ENDING"; } catch(e){}
      }

      // Label
      if (!merged.hideLabel) {
        var lbl = _findKid(labelTarget, "Label", "TEXT");
        if (!lbl) { lbl = figma.createText(); lbl.name = "Label"; labelTarget.appendChild(lbl); }
        var tsN = merged.textStyle || null; var fL = false;
        if (tsN) { var ts = findTextStyle(tsN); if (ts && ts.fontName) { try { await figma.loadFontAsync(ts.fontName); fL=true; } catch(e){} try { await lbl.setTextStyleIdAsync(ts.id); } catch(e){} } }
        if (!fL) { var fb = await loadFontSafe("Inter","SemiBold"); if (fb) lbl.fontName = fb; lbl.fontSize = merged.fontSize || 14; }
        lbl.characters = merged.textContent || "Button";
        if (merged.textFill) setTextFill(lbl, merged.textFill);
        // labelFill: make text node fill remaining width + truncate (for Input-like components)
        if (merged.labelFill) { try { lbl.textAutoResize = "TRUNCATE"; } catch(e){} try { lbl.maxLines = 1; } catch(e){} try { lbl.textTruncation = "ENDING"; } catch(e){} try { lbl.layoutSizingHorizontal = "FILL"; } catch(e){} }
        else { try { lbl.layoutSizingHorizontal = "HUG"; } catch(e){} }
      }

      // Suffix text (inside input, after label)
      if (_suffix) {
        var sfxN = _findKid(targetFrame, "Suffix", "TEXT");
        if (!sfxN) { sfxN = figma.createText(); sfxN.name = "Suffix"; targetFrame.appendChild(sfxN); }
        var _sfxTsN = merged.textStyle || null; var _sfxFL = false;
        if (_sfxTsN) { var _sfxTs = findTextStyle(_sfxTsN); if (_sfxTs && _sfxTs.fontName) { try { await figma.loadFontAsync(_sfxTs.fontName); _sfxFL=true; } catch(e){} try { await sfxN.setTextStyleIdAsync(_sfxTs.id); } catch(e){} } }
        if (!_sfxFL) { var _sfxFb = await loadFontSafe("Inter","Regular"); if (_sfxFb) sfxN.fontName = _sfxFb; sfxN.fontSize = 14; }
        sfxN.characters = _suffix;
        setTextFill(sfxN, "muted-foreground");
        try { sfxN.textAutoResize = "TRUNCATE"; } catch(e){} try { sfxN.maxLines = 1; } catch(e){} try { sfxN.textTruncation = "ENDING"; } catch(e){}
      }

      // --- Icon Right: always ensure instance exists, toggle visibility ---
      {
        var rightExist = _findKid(iconTarget, "Icon Right");
        if (_showIconRight) {
          if (rightExist && rightExist.type === "INSTANCE") {
            rightExist.visible = true;
            rightExist.resize(icoSize, icoSize);
            // Swap component if icon name changed on upsert
            var _wantRightComp = findIconComponent(_iconRightName);
            var _rightMainComp = null; try { _rightMainComp = await rightExist.getMainComponentAsync(); } catch(e) {}
            if (_wantRightComp && _rightMainComp && _rightMainComp.id !== _wantRightComp.id) {
              rightExist.swapComponent(_wantRightComp);
            }
            var rightVecs = rightExist.findAll(function(n) { return n.type === "VECTOR" || n.type === "ELLIPSE" || n.type === "LINE"; });
            var icoFgVar3 = findVar(_iconColor);
            if (icoFgVar3) { for (var rv2 = 0; rv2 < rightVecs.length; rv2++) { if (rightVecs[rv2].strokes && rightVecs[rv2].strokes.length > 0) rightVecs[rv2].strokes = [makeBoundPaint(icoFgVar3)]; } }
          } else {
            if (rightExist) rightExist.remove();
            var rightIconComp = findIconComponent(_iconRightName) || findIconComponent("ArrowRight") || findIconComponent("ChevronRight") || findIconComponent("ArrowLeft");
            if (rightIconComp) {
              var rightInst = rightIconComp.createInstance();
              rightInst.name = "Icon Right"; rightInst.resize(icoSize, icoSize); rightInst.visible = true;
              var rightVecs2 = rightInst.findAll(function(n) { return n.type === "VECTOR" || n.type === "ELLIPSE" || n.type === "LINE"; });
              var icoFgVar4 = findVar(_iconColor);
              if (icoFgVar4) { for (var rv3 = 0; rv3 < rightVecs2.length; rv3++) { if (rightVecs2[rv3].strokes && rightVecs2[rv3].strokes.length > 0) rightVecs2[rv3].strokes = [makeBoundPaint(icoFgVar4)]; } }
              iconTarget.appendChild(rightInst);
            } else {
              var icoR = figma.createFrame(); icoR.name = "Icon Right"; icoR.resize(icoSize, icoSize); icoR.fills = [];
              setStroke(icoR, _iconColor); icoR.strokeWeight = 1.5;
              icoR.topLeftRadius = 3; icoR.topRightRadius = 3; icoR.bottomLeftRadius = 3; icoR.bottomRightRadius = 3;
              iconTarget.appendChild(icoR);
            }
          }
        } else {
          // Not showing — hide but keep instance for swap property consistency
          // Not showing — remove icon entirely (no hidden instances, full variant model)
          if (rightExist) rightExist.remove();
        }
      }

      // TextRight addon label
      if (_hasAddon && _textRight) {
        var trF = _findKid(comp, "TextRight", "FRAME");
        if (!trF) { trF = figma.createFrame(); trF.name = "TextRight"; comp.appendChild(trF); }
        trF.layoutMode = "HORIZONTAL";
        trF.primaryAxisAlignItems = "CENTER"; trF.counterAxisAlignItems = "CENTER";
        trF.resize(60, merged.height || 36);
        trF.paddingLeft = 12; trF.paddingRight = 12;
        setFill(trF, "muted");
        setStroke(trF, merged.stroke || "border"); trF.strokeWeight = 1; trF.strokeAlign = "INSIDE";
        trF.strokeLeftWeight = 0; // border-l-0: no left border at shared edge with innerF
        trF.topLeftRadius = 0; trF.bottomLeftRadius = 0;
        var _rn0TR = findVar("border radius/none"); if (_rn0TR) { try { trF.setBoundVariable("topLeftRadius",_rn0TR); trF.setBoundVariable("bottomLeftRadius",_rn0TR); } catch(e){} }
        trF.topRightRadius = _radVal2; trF.bottomRightRadius = _radVal2;
        trF.layoutSizingHorizontal = "HUG"; trF.layoutSizingVertical = "FILL";
        var trTxt = _findKid(trF, "Text", "TEXT");
        if (!trTxt) { trTxt = figma.createText(); trTxt.name = "Text"; trF.appendChild(trTxt); }
        var _trTsN = merged.textStyle || null; var _trFL = false;
        if (_trTsN) { var _trTs = findTextStyle(_trTsN); if (_trTs && _trTs.fontName) { try { await figma.loadFontAsync(_trTs.fontName); _trFL=true; } catch(e){} try { await trTxt.setTextStyleIdAsync(_trTs.id); } catch(e){} } }
        if (!_trFL) { var _trFb = await loadFontSafe("Inter","Regular"); if (_trFb) trTxt.fontName = _trFb; trTxt.fontSize = 14; }
        trTxt.characters = _textRight;
        setTextFill(trTxt, "muted-foreground");
        try { trTxt.textAutoResize = "TRUNCATE"; } catch(e){} try { trTxt.maxLines = 1; } catch(e){} try { trTxt.textTruncation = "ENDING"; } catch(e){}
      }

      // Legacy: iconPlaceholder (for backward compat with old JSON specs)
      if (merged.iconPlaceholder && !merged.iconLeft && !merged.iconRight) {
        var ico = _findKid(targetFrame, "Icon", "FRAME");
        if (!ico) { ico = figma.createFrame(); ico.name = "Icon"; targetFrame.appendChild(ico); }
        ico.resize(icoSize, icoSize); ico.fills = [];
        setStroke(ico, merged.textFill || "foreground"); ico.strokeWeight = 1.5;
        ico.topLeftRadius = 3; ico.topRightRadius = 3; ico.bottomLeftRadius = 3; ico.bottomRightRadius = 3;
      }

      // --- Cleanup: remove children no longer needed ---
      if (_hasIndicator) {
        // Indicator pattern: icons in indicatorF, label in comp
        var _validInd = {};
        // Always keep icon instances to preserve swap property across variants
        if (merged.iconLeft !== undefined || merged.iconRight !== undefined || merged.iconLeftName || merged.iconRightName) {
          _validInd["Icon Left"] = true;
          _validInd["Icon Right"] = true;
        }
        if (_showIconLeft) _validInd["Icon Left"] = true;
        if (_showIconRight) _validInd["Icon Right"] = true;
        // Preserve Thumb child when showThumb !== false
        if (merged.indicator && merged.indicator.thumb && merged.showThumb !== false) _validInd["Thumb"] = true;
        for (var _ri2 = indicatorF.children.length - 1; _ri2 >= 0; _ri2--) {
          if (!_validInd[indicatorF.children[_ri2].name]) indicatorF.children[_ri2].remove();
        }
        var _validCompInd = { "Indicator": true };
        if (!merged.hideLabel) _validCompInd["Label"] = true;
        for (var _rc2 = comp.children.length - 1; _rc2 >= 0; _rc2--) {
          if (!_validCompInd[comp.children[_rc2].name]) comp.children[_rc2].remove();
        }
      } else {
        // targetFrame (innerF for addon, comp otherwise)
        var _validTF = {};
        // Always keep icon instances (hide instead of remove) to preserve swap property across variants
        if (merged.iconLeft !== undefined || merged.iconRight !== undefined || merged.iconLeftName || merged.iconRightName) {
          _validTF["Icon Left"] = true;
          _validTF["Icon Right"] = true;
        }
        if (_showIconLeft) _validTF["Icon Left"] = true;
        if (_prefix) _validTF["Prefix"] = true;
        if (!merged.hideLabel) _validTF["Label"] = true;
        if (_suffix) _validTF["Suffix"] = true;
        if (_showIconRight) _validTF["Icon Right"] = true;
        if (merged.iconPlaceholder && !merged.iconLeft && !merged.iconRight) _validTF["Icon"] = true;
        // Preserve ellipses created by ellipse mode
        if (merged.ellipses && Array.isArray(merged.ellipses)) {
          for (var _vei2 = 0; _vei2 < merged.ellipses.length; _vei2++) _validTF[merged.ellipses[_vei2].name || ("Ellipse" + _vei2)] = true;
        }
        for (var _ri = targetFrame.children.length - 1; _ri >= 0; _ri--) {
          if (!_validTF[targetFrame.children[_ri].name]) targetFrame.children[_ri].remove();
        }
        if (_hasAddon) {
          var _validComp = { "Input": true };
          if (_textLeft) _validComp["TextLeft"] = true;
          if (_textRight) _validComp["TextRight"] = true;
          for (var _rc = comp.children.length - 1; _rc >= 0; _rc--) {
            if (!_validComp[comp.children[_rc].name]) comp.children[_rc].remove();
          }
        }
      }
      // --- Reorder children to match expected layout order ---
      if (_hasIndicator) {
        // Indicator first, then label
        var _compOrdInd = ["Indicator"];
        if (!merged.hideLabel) _compOrdInd.push("Label");
        for (var _coi = 0; _coi < _compOrdInd.length; _coi++) {
          for (var _cci = 0; _cci < comp.children.length; _cci++) {
            if (comp.children[_cci].name === _compOrdInd[_coi]) { comp.appendChild(comp.children[_cci]); break; }
          }
        }
      } else {
        var _tfOrd = [];
        if (_showIconLeft) _tfOrd.push("Icon Left");
        if (_prefix) _tfOrd.push("Prefix");
        if (!merged.hideLabel) _tfOrd.push("Label");
        if (_suffix) _tfOrd.push("Suffix");
        if (_showIconRight) _tfOrd.push("Icon Right");
        for (var _tfo = 0; _tfo < _tfOrd.length; _tfo++) {
          for (var _tfc = 0; _tfc < targetFrame.children.length; _tfc++) {
            if (targetFrame.children[_tfc].name === _tfOrd[_tfo]) { targetFrame.appendChild(targetFrame.children[_tfc]); break; }
          }
        }
        if (_hasAddon) {
          var _compOrd = [];
          if (_textLeft) _compOrd.push("TextLeft");
          _compOrd.push("Input");
          if (_textRight) _compOrd.push("TextRight");
          for (var _co = 0; _co < _compOrd.length; _co++) {
            for (var _cc = 0; _cc < comp.children.length; _cc++) {
              if (comp.children[_cc].name === _compOrd[_co]) { comp.appendChild(comp.children[_cc]); break; }
            }
          }
        }
      }
      } // end of else (!_hasChildren)

      comp.clipsContent = !!merged.clipsContent;
      comp.setPluginData("specHash", _mergedHash);
      if (!_isUpdate || _isNewVariant) varComps.push(comp);
      createdVariants++;
    }

    // --- 3. Combine into ComponentSet OR upsert existing ---
    var cs;
    var _managedIds = {};
    if (_isUpdate) {
      // Save position BEFORE any mutations
      var _savedCSX = existingCS.x; var _savedCSY = existingCS.y;
      // Remove variants no longer in spec
      var _emKeys = Object.keys(existingVarMap);
      var _removedCount = 0;
      for (var ek2 = 0; ek2 < _emKeys.length; ek2++) {
        if (!_seenVars[_emKeys[ek2]]) { try { existingVarMap[_emKeys[ek2]].remove(); } catch(e) { log.push("  WARN: variant remove failed (auto-deleted?): " + e.message); } _removedCount++; }
      }
      // Check if existingCS was auto-deleted by Figma (happens when all children removed)
      var _csStillExists = false;
      try { var _testX = existingCS.x; _csStillExists = true; } catch(e) { _csStillExists = false; }
      var _structuralChange = (varComps.length > 0 || _removedCount > 0);

      if (_csStillExists) {
        // CS still exists — update IN PLACE (no combineAsVariants, no position change)
        // Add new variants directly to existing CS
        for (var _nai = 0; _nai < varComps.length; _nai++) {
          existingCS.appendChild(varComps[_nai]);
          _managedIds[varComps[_nai].id] = true;
          log.push("  [upsert-add] " + varComps[_nai].name.substring(0, 60));
        }
        cs = existingCS;
        // Re-layout grid ONLY when structure changed (add/remove) — pure updates keep positions
        if (_structuralChange) {
          _layoutVariantsInGrid(cs, propNames, properties);
          log.push("  [upsert] Grid re-layout applied (" + varComps.length + " added, " + _removedCount + " removed)");
        }
      } else if (varComps.length > 0) {
        // CS was auto-deleted (all old variants removed) — must use combineAsVariants for new ones
        for (var _nvi = 0; _nvi < varComps.length; _nvi++) _managedIds[varComps[_nvi].id] = true;
        cs = figma.combineAsVariants(varComps, targetPage);
        _layoutVariantsInGrid(cs, propNames, properties);
        cs.x = _savedCSX; cs.y = _savedCSY;
      } else {
        // No CS, no new variants — skip
        continue;
      }
      cs.name = compName;
      if (compSpec.description) cs.description = compSpec.description;
      cs.layoutMode = "NONE"; cs.fills = [];
      // ComponentSet visual: dashed border, radius 16, foreground color
      _bindRad(cs, 16);
      cs.dashPattern = [10, 5];
      cs.strokeWeight = 1;
      cs.strokeAlign = "INSIDE";
      var _csFgVar = findVar("foreground");
      if (_csFgVar) { cs.strokes = [makeBoundPaint(_csFgVar)]; } else { cs.strokes = [{ type: "SOLID", color: { r: 0.04, g: 0.04, b: 0.04 }, opacity: 1 }]; }
      componentSetCache[compName] = cs;
      _anyUpsert = true;
      log.push("  Upserted: " + (combos.length - varComps.length) + " updated, " + varComps.length + " added, " + _removedCount + " removed" + (_structuralChange ? " (grid re-layout)" : " (positions preserved)"));
    } else {
      if (varComps.length === 0) continue;
      for (var _nvi2 = 0; _nvi2 < varComps.length; _nvi2++) {
        _managedIds[varComps[_nvi2].id] = true;
        log.push("  [pre-combine " + _nvi2 + "] type=" + varComps[_nvi2].type + " name='" + varComps[_nvi2].name + "' children=" + varComps[_nvi2].children.length);
      }
      cs = figma.combineAsVariants(varComps, targetPage);
      // Apply property-based grid layout (neat rows/columns by property)
      _layoutVariantsInGrid(cs, propNames, properties);
      cs.name = compName;
      if (compSpec.description) cs.description = compSpec.description;
      cs.layoutMode = "NONE";
      cs.fills = []; // transparent — showcase frame provides bg
      // ComponentSet visual: dashed border, radius 16, foreground color
      _bindRad(cs, 16);
      cs.dashPattern = [10, 5];
      cs.strokeWeight = 1;
      cs.strokeAlign = "INSIDE";
      var _csFgVar2 = findVar("foreground");
      if (_csFgVar2) { cs.strokes = [makeBoundPaint(_csFgVar2)]; } else { cs.strokes = [{ type: "SOLID", color: { r: 0.04, g: 0.04, b: 0.04 }, opacity: 1 }]; }
      componentSetCache[compName] = cs;
      createdSets++;
      log.push("  ComponentSet: " + varComps.length + " in, " + cs.children.length + " in CS");
    }

    // --- Post-combine: re-apply imageUrl on instance children ---
    // combineAsVariants resets instance fill overrides. Re-apply imageUrl from spec.
    if (compSpec.base && compSpec.base.children) {
      for (var _pcvi = 0; _pcvi < cs.children.length; _pcvi++) {
        var _pcVariant = cs.children[_pcvi];
        // Parse variant name to get variantStyles key
        var _pcVName = _pcVariant.name;
        // Determine which children array to use: variantStyles override or base
        var _pcChildren = compSpec.base.children;
        if (compSpec.variantStyles) {
          // Check compound keys first (e.g. "State=Hover,Value=Image"), then single keys
          var _pcParts = _pcVName.split(", ");
          var _pcFound = false;
          // Try full compound key
          if (compSpec.variantStyles[_pcVName] && compSpec.variantStyles[_pcVName].children) {
            _pcChildren = compSpec.variantStyles[_pcVName].children;
            _pcFound = true;
          }
          // Try single keys (shallow merge: last match with children wins)
          if (!_pcFound) {
            for (var _pcp = 0; _pcp < _pcParts.length; _pcp++) {
              var _pcKey = _pcParts[_pcp].trim();
              if (compSpec.variantStyles[_pcKey] && compSpec.variantStyles[_pcKey].children) {
                _pcChildren = compSpec.variantStyles[_pcKey].children;
              }
            }
          }
        }
        // Scan children for instance type with imageUrl
        for (var _pcci = 0; _pcci < _pcChildren.length; _pcci++) {
          var _pcChild = _pcChildren[_pcci];
          if (_pcChild.type === "instance" && _pcChild.imageUrl && _pcChild.name) {
            // Find the matching node inside this variant
            var _pcTarget = _pcVariant.findOne(function(n) { return n.name === _pcChild.name && (n.type === "INSTANCE" || n.type === "FRAME" || n.type === "RECTANGLE"); });
            if (_pcTarget) {
              try {
                var _pcImgHash = await getImageHash(_pcChild.imageUrl);
                _pcTarget.fills = [{ type: "IMAGE", imageHash: _pcImgHash, scaleMode: "FILL" }];
                log.push("  [post-combine] imageUrl re-applied: " + _pcChild.name + " = " + _pcChild.imageUrl.substring(0, 50));
              } catch(e) { log.push("  [post-combine] imageUrl FAILED: " + _pcChild.name + " " + e.message); }
            }
          }
        }
      }
    }

    // --- Post-build diagnostics & fixes ---
    // Diag 0: dump all variant names + detect rogue properties
    var _expectedProps = {};
    for (var _epi = 0; _epi < propNames.length; _epi++) _expectedProps[propNames[_epi]] = true;
    for (var _dvi = 0; _dvi < cs.children.length; _dvi++) {
      var _dvName = cs.children[_dvi].name;
      log.push("  [variant " + _dvi + "] type=" + cs.children[_dvi].type + " name='" + _dvName + "'");
      // Check for unexpected property keys in variant name
      var _dvParts = _dvName.split(", ");
      for (var _dvp = 0; _dvp < _dvParts.length; _dvp++) {
        var _dvKV = _dvParts[_dvp].split("=");
        if (_dvKV.length === 2 && !_expectedProps[_dvKV[0].trim()]) {
          log.push("  ⚠ ROGUE PROPERTY '" + _dvKV[0].trim() + "' in variant name! Expected: " + propNames.join(", "));
        }
      }
    }
    // Diag 1: CS children count vs expected
    log.push("  CS.children=" + cs.children.length + " CS.size=" + Math.round(cs.width) + "x" + Math.round(cs.height));
    // Diag 2: find out-of-bounds children inside CS
    var _oobCount = 0;
    for (var _cbi = 0; _cbi < cs.children.length; _cbi++) {
      var _cbc = cs.children[_cbi];
      if (_cbc.x + _cbc.width > cs.width || _cbc.y + _cbc.height > cs.height || _cbc.x < 0 || _cbc.y < 0) {
        _oobCount++;
        log.push("  OOB child: " + _cbc.name.substring(0, 50) + " x=" + Math.round(_cbc.x) + " y=" + Math.round(_cbc.y) + " w=" + Math.round(_cbc.width) + " h=" + Math.round(_cbc.height));
      }
    }
    // Fix 1: resize CS to encompass all out-of-bounds children
    if (_oobCount > 0) {
      var _maxCSR = 0, _maxCSB = 0;
      for (var _cbi2 = 0; _cbi2 < cs.children.length; _cbi2++) {
        var _cbc2 = cs.children[_cbi2];
        if (_cbc2.x + _cbc2.width > _maxCSR) _maxCSR = _cbc2.x + _cbc2.width;
        if (_cbc2.y + _cbc2.height > _maxCSB) _maxCSB = _cbc2.y + _cbc2.height;
      }
      cs.resize(Math.max(_maxCSR, cs.width), Math.max(_maxCSB, cs.height));
      log.push("  Fix1: resized CS to " + Math.round(cs.width) + "x" + Math.round(cs.height));
    }
    // Diag 3: any COMPONENT nodes at page level?
    var _pageComps = [];
    var _postPage = targetPage.children.slice();
    for (var _ppk = 0; _ppk < _postPage.length; _ppk++) {
      if (_postPage[_ppk].type === "COMPONENT") _pageComps.push(_postPage[_ppk].name.substring(0, 40));
    }
    if (_pageComps.length > 0) log.push("  COMP at page level: " + _pageComps.join(" | "));
    // Fix 2: move any page-level COMPONENT with matching name into the CS
    for (var _ppk2 = 0; _ppk2 < _postPage.length; _ppk2++) {
      if (_postPage[_ppk2].type === "COMPONENT" && propNames.length > 0 && _postPage[_ppk2].name.indexOf(propNames[0] + "=") >= 0) {
        try { cs.appendChild(_postPage[_ppk2]); log.push("  Fix2: moved " + _postPage[_ppk2].name.substring(0, 40) + " into CS"); }
        catch(e) { _postPage[_ppk2].remove(); log.push("  Fix2: removed " + _postPage[_ppk2].name.substring(0, 40)); }
      }
    }

    sendProgress(compName + " — linking properties");
    // --- 3b. Post-build: Instance Swap Properties ---
    // Scan compSpec children for swapProperty, create INSTANCE_SWAP on ComponentSet, link all instances
    var _swapSpecs = [];
    var _scanSwap = function(children) {
      if (!children) return;
      for (var _si = 0; _si < children.length; _si++) {
        if ((children[_si].type === "instance" || children[_si].type === "icon") && children[_si].swapProperty) {
          _swapSpecs.push({ name: children[_si].name, propName: children[_si].swapProperty });
        }
        if (children[_si].children) _scanSwap(children[_si].children);
      }
    };
    if (compSpec.base && compSpec.base.children) _scanSwap(compSpec.base.children);
    if (_swapSpecs.length > 0 && cs && cs.type === "COMPONENT_SET") {
      for (var _ssi = 0; _ssi < _swapSpecs.length; _ssi++) {
        var _ssName = _swapSpecs[_ssi].name;
        var _ssPropName = _swapSpecs[_ssi].propName;
        // Find all instances with this name across all variants
        var _ssInstances = [];
        for (var _svi = 0; _svi < cs.children.length; _svi++) {
          var _ssFound = cs.children[_svi].findAll(function(n) { return n.type === "INSTANCE" && n.name === _ssName; });
          for (var _sfi = 0; _sfi < _ssFound.length; _sfi++) _ssInstances.push(_ssFound[_sfi]);
        }
        if (_ssInstances.length === 0) { log.push("  [swap] No instances named '" + _ssName + "' found"); continue; }
        // Check if property already exists on ComponentSet
        var _ssKey = null;
        var _ssDefs = cs.componentPropertyDefinitions || {};
        for (var _sdk in _ssDefs) {
          if ((_sdk === _ssPropName || _sdk.indexOf(_ssPropName + "#") === 0) && _ssDefs[_sdk].type === "INSTANCE_SWAP") {
            _ssKey = _sdk; break;
          }
        }
        // Create property if not exists — use first instance's mainComponent as default
        if (!_ssKey) {
          try {
            var _ssMainComp = await _ssInstances[0].getMainComponentAsync();
            if (_ssMainComp) {
              _ssKey = cs.addComponentProperty(_ssPropName, "INSTANCE_SWAP", _ssMainComp.id);
              log.push("  [swap] Created '" + _ssPropName + "' key=" + _ssKey);
            }
          } catch(e) { log.push("  [swap] Failed to create property: " + e.message); }
        } else {
          log.push("  [swap] Reusing existing '" + _ssKey + "'");
        }
        // Link all instances to the property + expose nested instance properties
        if (_ssKey) {
          for (var _sli = 0; _sli < _ssInstances.length; _sli++) {
            try {
              _ssInstances[_sli].componentPropertyReferences = { mainComponent: _ssKey };
              // Expose properties from nested instance (makes Slot's properties visible on parent)
              _ssInstances[_sli].isExposedInstance = true;
            } catch(e) {}
          }
          log.push("  [swap] Linked " + _ssInstances.length + " instances + exposed nested properties");
        }
      }
    }

    // --- 3c. Post-build: Link Icon Left / Icon Right swap properties ---
    // Ensure all icon instances across variants are linked to a single INSTANCE_SWAP property on ComponentSet
    // Skip if component has fixedIcons: true (icons are semantically fixed, not swappable — e.g. Checkbox Check/Minus)
    if (cs && cs.type === "COMPONENT_SET" && !compSpec.fixedIcons) {
      var _iconSwapNames = ["Icon Left", "Icon Right"];
      log.push("  [icon-swap] Starting for " + compName + " (fixedIcons=" + !!compSpec.fixedIcons + ")");
      for (var _isn = 0; _isn < _iconSwapNames.length; _isn++) {
        var _isName = _iconSwapNames[_isn];
        var _isInstances = [];
        for (var _isv = 0; _isv < cs.children.length; _isv++) {
          var _isFound = cs.children[_isv].findAll(function(n) { return n.type === "INSTANCE" && n.name === _isName; });
          for (var _isf = 0; _isf < _isFound.length; _isf++) _isInstances.push(_isFound[_isf]);
        }
        log.push("  [icon-swap] '" + _isName + "' found " + _isInstances.length + " instances across " + cs.children.length + " variants");
        if (_isInstances.length === 0) continue;
        // Find existing INSTANCE_SWAP property
        var _isKey = null;
        var _isDefs = cs.componentPropertyDefinitions || {};
        var _allPropKeys = Object.keys(_isDefs);
        log.push("  [icon-swap] CS properties: " + _allPropKeys.filter(function(k) { return _isDefs[k].type === "INSTANCE_SWAP"; }).join(", "));
        for (var _idk in _isDefs) {
          if ((_idk === _isName || _idk.indexOf(_isName + "#") === 0) && _isDefs[_idk].type === "INSTANCE_SWAP") {
            _isKey = _idk; break;
          }
        }
        log.push("  [icon-swap] Existing key for '" + _isName + "': " + (_isKey || "NONE — will create"));
        // Create if not exists
        if (!_isKey) {
          try {
            var _isMainComp = await _isInstances[0].getMainComponentAsync();
            log.push("  [icon-swap] mainComponent: " + (_isMainComp ? _isMainComp.name + " id=" + _isMainComp.id : "NULL"));
            if (_isMainComp) {
              _isKey = cs.addComponentProperty(_isName, "INSTANCE_SWAP", _isMainComp.id);
              log.push("  [icon-swap] Created '" + _isName + "' key=" + _isKey);
            }
          } catch(e) { log.push("  [icon-swap] Failed to create '" + _isName + "': " + e.message); }
        }
        // Link all instances
        if (_isKey) {
          for (var _isl = 0; _isl < _isInstances.length; _isl++) {
            try {
              _isInstances[_isl].componentPropertyReferences = { mainComponent: _isKey };
              log.push("  [icon-swap] Linked '" + _isName + "' inst#" + _isl + " in variant '" + _isInstances[_isl].parent.name.substring(0, 40) + "'");
            } catch(e) { log.push("  [icon-swap] Link FAILED inst#" + _isl + ": " + e.message); }
          }
          log.push("  [icon-swap] Total linked: " + _isInstances.length + " '" + _isName + "' instances to key=" + _isKey);
        } else {
          log.push("  [icon-swap] ⚠ NO KEY for '" + _isName + "' — swap property NOT created");
        }
      }
    }

    // --- 3d. Cleanup stale INSTANCE_SWAP properties (no instances reference them) ---
    if (cs && cs.type === "COMPONENT_SET") {
      var _cleanDefs = cs.componentPropertyDefinitions || {};
      for (var _ck in _cleanDefs) {
        if (_cleanDefs[_ck].type !== "INSTANCE_SWAP") continue;
        // Check if ANY instance in ANY variant still references this key
        var _ckReferenced = false;
        for (var _cv = 0; _cv < cs.children.length; _cv++) {
          var _allInsts = cs.children[_cv].findAll(function(n) { return n.type === "INSTANCE"; });
          for (var _ai = 0; _ai < _allInsts.length; _ai++) {
            var _refs = _allInsts[_ai].componentPropertyReferences || {};
            if (_refs.mainComponent === _ck) { _ckReferenced = true; break; }
          }
          if (_ckReferenced) break;
        }
        if (!_ckReferenced) {
          try {
            cs.deleteComponentProperty(_ck);
            log.push("  [cleanup] Removed stale INSTANCE_SWAP property: " + _ck);
          } catch(e) { log.push("  [cleanup] Failed to remove '" + _ck + "': " + e.message); }
        }
      }
    }

    // --- 4. Rebuild Showcase (skip if spec unchanged) ---
    // Multi-component file: sub-components (all except last) skip showcase, store CS for nesting into parent
    var _isSubComponent = components.length > 1 && ci < components.length - 1;
    if (_isSubComponent) {
      _layoutCSGrid(cs, properties, propNames);
      _subComponentSets.push(cs);
      log.push("  Sub-component — grid layout applied, skipping showcase, will nest into parent");
      continue; // skip showcase + cleanup for sub-components, handled by parent
    }

    var _showcaseSpecHash = components.length > 1 ? JSON.stringify(components) : JSON.stringify(compSpec);
    var _skipShowcase = false;
    // Safety: verify existingShowcase still exists (may have been deleted when CS was auto-removed)
    if (existingShowcase) {
      var _showcaseStillExists = false;
      try { var _testSX = existingShowcase.x; _showcaseStillExists = true; } catch(e) { _showcaseStillExists = false; }
      if (!_showcaseStillExists) { existingShowcase = null; log.push("  Showcase node was auto-deleted"); }
    }
    if (existingShowcase) {
      if (existingShowcase.getPluginData("specHash") === _showcaseSpecHash) {
        log.push("  Showcase unchanged \u2014 skipped");
        _skipShowcase = true;
      } else {
        // In-place upsert: keep existing showcase, only update sections that changed
        log.push("  Showcase changed \u2014 in-place upsert");
        _skipShowcase = true;
      }
    }
    if (!_skipShowcase) {
      sendProgress(compName + " — building showcase");
      log.push("  Building showcase...");
      var showcase = await _buildShowcase(cs, compSpec, properties, propNames, log);
      showcase.setPluginData("specHash", _showcaseSpecHash);
      targetPage.appendChild(showcase);
      // Position: use saved x when updating, advance offset when creating new
      showcase.x = _isUpdate ? _savedShowcaseX : _showcaseXOffset;
      showcase.y = 0;
      if (!_isUpdate) _showcaseXOffset += showcase.width + 100;
    } else if (existingShowcase && cs.parent !== existingShowcase) {
      // Showcase skipped but CS still at page level — move it into existing showcase's component section
      var _compSecInExisting = null;
      for (var _esi = 0; _esi < existingShowcase.children.length; _esi++) {
        var _esName = existingShowcase.children[_esi].name;
        if (_esName === "Section — Component" || _esName === "Component" || _esName.indexOf("Component") >= 0) {
          _compSecInExisting = existingShowcase.children[_esi]; break;
        }
      }
      if (_compSecInExisting) {
        _compSecInExisting.appendChild(cs);
        log.push("  Moved CS into existing showcase (component section)");
      } else {
        existingShowcase.appendChild(cs);
        log.push("  Moved CS into existing showcase (root)");
      }
    }

    // --- 4.1. Nest sub-component CSes into parent showcase's "Section — Component" ---
    if (_subComponentSets.length > 0) {
      var _parentShowcase = existingShowcase;
      if (!_skipShowcase && typeof showcase !== "undefined") _parentShowcase = showcase;
      if (_parentShowcase) {
        var _compSecForSubs = null;
        for (var _sci = 0; _sci < _parentShowcase.children.length; _sci++) {
          var _scName = _parentShowcase.children[_sci].name;
          if (_scName === "Section — Component" || _scName === "Component" || _scName.indexOf("Component") >= 0) {
            _compSecForSubs = _parentShowcase.children[_sci]; break;
          }
        }
        // Reverse sub-components: JSON array is dependency order (leaves first),
        // but canvas display order should match web Explore tab order (parent first, leaves last)
        _subComponentSets.reverse();
        for (var _scs = 0; _scs < _subComponentSets.length; _scs++) {
          var _subCS = _subComponentSets[_scs];
          if (_compSecForSubs) {
            _compSecForSubs.appendChild(_subCS);
            log.push("  Nested sub-component '" + _subCS.name + "' into parent showcase (component section)");
          } else {
            _parentShowcase.appendChild(_subCS);
            log.push("  Nested sub-component '" + _subCS.name + "' into parent showcase (root)");
          }
        }
        _subComponentSets = []; // reset after nesting
      }
    }

    // --- 4.5. In-place upsert: Installation section in existing showcase ---
    if (_skipShowcase && existingShowcase) {
      var _scSecs2 = compSpec.showcase && compSpec.showcase.sections ? compSpec.showcase.sections : null;
      var _showInstall2 = !_scSecs2 || _scSecs2.indexOf("installation") !== -1;
      var _installData2 = compSpec.installation || null;
      if (_showInstall2 && _installData2) {
        // Find existing "Section — Installation" and its preceding separator
        var _exInstallSec = null;
        var _exInstallSep = null;
        var _kids = existingShowcase.children.slice();
        for (var _ii = 0; _ii < _kids.length; _ii++) {
          if (_kids[_ii].name === "Section \u2014 Installation" || _kids[_ii].name === "Section — Installation") {
            _exInstallSec = _kids[_ii];
            // Check previous sibling for separator
            if (_ii > 0 && (_kids[_ii - 1].name === "Separator" || _kids[_ii - 1].name === "Divider") && _kids[_ii - 1].height <= 2) {
              _exInstallSep = _kids[_ii - 1];
            }
            break;
          }
        }
        // Remove old section + separator
        if (_exInstallSec) { _exInstallSec.remove(); log.push("  Removed old installation section"); }
        if (_exInstallSep) _exInstallSep.remove();
        // Build new installation section (appends at end — correct since it's always last)
        await _buildInstallSec(existingShowcase, _installData2);
        log.push("  Rebuilt installation section in-place");
      }
      // Update specHash so next run knows current state
      existingShowcase.setPluginData("specHash", _showcaseSpecHash);
    }

    // --- Post-showcase cleanup: remove stray nodes at page level ---
    // After showcase is built, CS should be inside showcase (via compSec.appendChild).
    // Diagnostic: verify CS is inside showcase, not at page level
    log.push("  [diag] cs.parent=" + (cs.parent ? cs.parent.name : "null") + " cs.parent.type=" + (cs.parent ? cs.parent.type : "n/a"));
    // Build lookup of sub-component names for cleanup
    var _subCSNames = {};
    for (var _scni = 0; _scni < ci; _scni++) { if (components[_scni].name) _subCSNames[components[_scni].name] = true; }
    // Resolve showcase ref for cleanup nesting
    var _parentShowcaseForCleanup = existingShowcase;
    if (!_skipShowcase && typeof showcase !== "undefined") _parentShowcaseForCleanup = showcase;
    var _postShowcaseKids = targetPage.children.slice();
    for (var _psk = 0; _psk < _postShowcaseKids.length; _psk++) {
      var _psNode = _postShowcaseKids[_psk];
      // Keep showcase frames
      if (_psNode.type === "FRAME" && _psNode.name.indexOf(" \u2014 Showcase") >= 0) continue;
      // Remove stray COMPONENT_SET with same name (duplicate) — also catch sub-component names
      if (_psNode.type === "COMPONENT_SET" && (_psNode.name === compName || _subCSNames[_psNode.name])) {
        // Don't remove sub-component CS — move into showcase instead
        if (_psNode.name !== compName && _parentShowcaseForCleanup) {
          var _cleanupCompSec = null;
          for (var _ccsi = 0; _ccsi < _parentShowcaseForCleanup.children.length; _ccsi++) {
            var _ccsName = _parentShowcaseForCleanup.children[_ccsi].name;
            if (_ccsName === "Section \u2014 Component" || _ccsName === "Component" || _ccsName.indexOf("Component") >= 0) { _cleanupCompSec = _parentShowcaseForCleanup.children[_ccsi]; break; }
          }
          try {
            if (_cleanupCompSec) _cleanupCompSec.appendChild(_psNode);
            else _parentShowcaseForCleanup.appendChild(_psNode);
            log.push("  Cleanup: moved stray sub-component '" + _psNode.name + "' into showcase");
          } catch(e) { log.push("  Cleanup: WARN move sub-component failed: " + e.message); }
        } else if (_psNode.id !== cs.id) {
          log.push("  Cleanup: removed stray COMPONENT_SET '" + _psNode.name + "' id=" + _psNode.id + " (cs.id=" + cs.id + ")");
          try { _psNode.remove(); } catch(e) { log.push("  Cleanup: WARN remove failed: " + e.message); }
        }
      }
      // Remove stray COMPONENT nodes (orphan variants)
      else if (_psNode.type === "COMPONENT" && propNames.length > 0 && _psNode.name.indexOf(propNames[0] + "=") >= 0) {
        log.push("  Cleanup: removed stray COMPONENT '" + _psNode.name.substring(0, 50) + "'");
        try { _psNode.remove(); } catch(e) { log.push("  Cleanup: WARN remove failed: " + e.message); }
      }
      // Remove stray INSTANCE nodes
      else if (_psNode.type === "INSTANCE") {
        log.push("  Cleanup: removed stray INSTANCE '" + _psNode.name.substring(0, 50) + "'");
        try { _psNode.remove(); } catch(e) { log.push("  Cleanup: WARN remove failed: " + e.message); }
      }
    }

    // Per-component completion
    var _compElapsed = Date.now() - startTime;
    sendProgress("  ✓ " + compName + " done (" + cs.children.length + " variants, " + _compElapsed + "ms)", "ok");
  }

  // Never change viewport — user keeps their current view position

  var elapsed = Date.now() - startTime;
  sendProgress("✓ All done — " + createdSets + " components, " + createdVariants + " variants in " + elapsed + "ms", "ok");
  log.push("Done! " + createdSets + " created, " + createdVariants + " variants + showcase in " + elapsed + "ms");
  return { success: true, message: createdSets + " new + upserted component(s) done", elapsed: elapsed, log: log };
}

// --- Showcase table helper ---
async function _makeTableRow(cells, isHeader, parent) {
  var row = figma.createFrame();
  row.name = isHeader ? "Table Header" : "Table Row";
  row.layoutMode = "HORIZONTAL";
  _bindSp(row, "itemSpacing", 0);
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
    _bindPad(cell, 8, 16, 8, 16);
    _bindSp(cell, "itemSpacing", 0);
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
  _bindSp(table, "itemSpacing", 0);
  _bindRad(table, 12);
  table.clipsContent = true;
  setFill(table, "card");
  setStroke(table, "border"); table.strokeWeight = 1; table.strokeAlign = "INSIDE";
  sec.appendChild(table);
  try { table.layoutSizingHorizontal = "FILL"; table.layoutSizingVertical = "HUG"; } catch(e) {}
  await _makeTableRow(headers, true, table);
  for (var ri = 0; ri < rows.length; ri++) {
    await _makeTableRow(rows[ri], false, table);
  }
  return sec;
}

// --- Installation section builder (shared by _buildShowcase and upsert) ---

async function _buildInstallSec(parent, installData) {
  _makeSep(parent);
  var installSec = _makeFrame("Section — Installation", "v", 24, parent);
  await _makeLabel("Installation", "SP/H3", "foreground", installSec);
  var installCard = figma.createFrame(); installCard.name = "Install Card";
  installCard.layoutMode = "VERTICAL"; _bindSp(installCard, "itemSpacing", 0);
  _bindPad(installCard, 0, 0, 0, 0);
  _bindRad(installCard, 12);
  installCard.clipsContent = true;
  installCard.fills = [];
  setStroke(installCard, "border"); installCard.strokeWeight = 1; installCard.strokeAlign = "INSIDE";
  installSec.appendChild(installCard);
  try { installCard.layoutSizingHorizontal = "FILL"; installCard.layoutSizingVertical = "HUG"; } catch(e) {}
  // Dependencies sub-section
  if (installData.dependencies) {
    var depHeader = figma.createFrame(); depHeader.name = "Dep Header";
    depHeader.layoutMode = "HORIZONTAL"; _bindSp(depHeader, "itemSpacing", 0);
    _bindPad(depHeader, 12, 16, 12, 16);
    setFillWithOpacity(depHeader, "muted", 0.3);
    installCard.appendChild(depHeader);
    try { depHeader.layoutSizingHorizontal = "FILL"; depHeader.layoutSizingVertical = "HUG"; } catch(e) {}
    await _makeLabel("Dependencies", "SP/Overline", "muted-foreground", depHeader);
    var depSep = figma.createFrame(); depSep.name = "Separator";
    depSep.layoutMode = "HORIZONTAL"; depSep.resize(100, 1);
    setFill(depSep, "border");
    installCard.appendChild(depSep);
    try { depSep.layoutSizingHorizontal = "FILL"; } catch(e) {}
    var depCode = figma.createFrame(); depCode.name = "Code Block";
    depCode.layoutMode = "VERTICAL"; _bindSp(depCode, "itemSpacing", 0);
    _bindPad(depCode, 16, 16, 16, 16);
    setFill(depCode, "code");
    installCard.appendChild(depCode);
    try { depCode.layoutSizingHorizontal = "FILL"; depCode.layoutSizingVertical = "HUG"; } catch(e) {}
    var depText = await _makeLabel(installData.dependencies, "SP/Caption", "code-foreground", depCode);
  }
  // Import sub-section
  if (installData.import) {
    var impHeader = figma.createFrame(); impHeader.name = "Import Header";
    impHeader.layoutMode = "HORIZONTAL"; _bindSp(impHeader, "itemSpacing", 0);
    _bindPad(impHeader, 12, 16, 12, 16);
    setFillWithOpacity(impHeader, "muted", 0.3);
    installCard.appendChild(impHeader);
    try { impHeader.layoutSizingHorizontal = "FILL"; impHeader.layoutSizingVertical = "HUG"; } catch(e) {}
    await _makeLabel("Import", "SP/Overline", "muted-foreground", impHeader);
    var impSep = figma.createFrame(); impSep.name = "Separator";
    impSep.layoutMode = "HORIZONTAL"; impSep.resize(100, 1);
    setFill(impSep, "border");
    installCard.appendChild(impSep);
    try { impSep.layoutSizingHorizontal = "FILL"; } catch(e) {}
    var impCode = figma.createFrame(); impCode.name = "Code Block";
    impCode.layoutMode = "VERTICAL"; _bindSp(impCode, "itemSpacing", 0);
    _bindPad(impCode, 16, 16, 16, 16);
    setFill(impCode, "code");
    installCard.appendChild(impCode);
    try { impCode.layoutSizingHorizontal = "FILL"; impCode.layoutSizingVertical = "HUG"; } catch(e) {}
    var impText = await _makeLabel(installData.import, "SP/Caption", "code-foreground", impCode);
  }
  return installSec;
}

// --- Grid layout for ComponentSet variants ---
function _layoutCSGrid(cs, properties, propNames) {
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

  // Grid: last property = columns, rest = row groups
  var _lastProp = propNames[propNames.length - 1];
  var _colCount = properties[_lastProp] ? properties[_lastProp].length : 1;
  var _rowCount = Math.max(1, Math.ceil(_sorted.length / _colCount));
  var _colGap = 40, _rowGap = 20, _groupGap = 56, _pad = 40;

  cs.layoutMode = "NONE";
  cs.fills = [];

  // Column widths
  var _colWidths = [];
  for (var _ci = 0; _ci < _colCount; _ci++) {
    var _maxW = 0;
    for (var _rj = 0; _rj < _rowCount; _rj++) {
      var _idx = _rj * _colCount + _ci;
      if (_idx < _sorted.length) { var _w = _sorted[_idx].width; if (typeof _w === "number" && !isNaN(_w)) _maxW = Math.max(_maxW, _w); }
    }
    _colWidths.push(_maxW || 40);
  }
  // Row heights
  var _rowHeights = [];
  for (var _rk = 0; _rk < _rowCount; _rk++) {
    var _maxH = 0;
    for (var _cj = 0; _cj < _colCount; _cj++) {
      var _idx2 = _rk * _colCount + _cj;
      if (_idx2 < _sorted.length) { var _h = _sorted[_idx2].height; if (typeof _h === "number" && !isNaN(_h)) _maxH = Math.max(_maxH, _h); }
    }
    _rowHeights.push(_maxH || 20);
  }
  // Column X positions
  var _colX = [_pad];
  for (var _cx = 1; _cx < _colCount; _cx++) _colX.push(_colX[_cx - 1] + _colWidths[_cx - 1] + _colGap);
  // Row Y positions with multi-level group breaks
  // First property change → large gap (56), intermediate property change → medium gap (36), same group → small gap (20)
  var _subGroupGap = 36;
  var _rowY = [_pad];
  for (var _ry = 1; _ry < _rowCount; _ry++) {
    var _gap = _rowGap;
    if (propNames.length > 1) {
      var _prevRowIdx = (_ry - 1) * _colCount;
      var _currRowIdx = _ry * _colCount;
      if (_currRowIdx < _sorted.length && _prevRowIdx < _sorted.length) {
        var _prevV = _parseName(_sorted[_prevRowIdx].name);
        var _currV = _parseName(_sorted[_currRowIdx].name);
        // Check all row properties (all except last which is columns) from outermost to innermost
        for (var _gp = 0; _gp < propNames.length - 1; _gp++) {
          if (_prevV[propNames[_gp]] !== _currV[propNames[_gp]]) {
            _gap = _gp === 0 ? _groupGap : _subGroupGap;
            break;
          }
        }
      }
    }
    _rowY.push(_rowY[_ry - 1] + _rowHeights[_ry - 1] + _gap);
  }
  // Position each child
  for (var _gi = 0; _gi < _sorted.length; _gi++) {
    var _col = _gi % _colCount;
    var _row = Math.floor(_gi / _colCount);
    var _xVal = (_col < _colX.length) ? _colX[_col] : _pad;
    var _yVal = (_row < _rowY.length) ? _rowY[_row] : _pad;
    try {
      _sorted[_gi].x = (typeof _xVal === "number" && !isNaN(_xVal)) ? _xVal : _pad;
      _sorted[_gi].y = (typeof _yVal === "number" && !isNaN(_yVal)) ? _yVal : _pad;
    } catch (e) {
      try { _sorted[_gi].x = _pad; _sorted[_gi].y = _pad + _gi * 50; } catch (e2) {}
    }
  }
  // Resize CS to fit
  var _totalW = _colX[_colCount - 1] + _colWidths[_colCount - 1] + _pad;
  var _totalH = _rowY[_rowCount - 1] + _rowHeights[_rowCount - 1] + _pad;
  if (isNaN(_totalW) || _totalW < 100) _totalW = 800;
  if (isNaN(_totalH) || _totalH < 100) _totalH = 400;
  cs.resize(_totalW, _totalH);
  // Dashed border
  setStroke(cs, "foreground");
  cs.strokeWeight = 1;
  cs.strokeAlign = "INSIDE";
  cs.dashPattern = [10, 5];
  _bindRad(cs, 16);

  return _totalW;
}

// --- Showcase builder ---

async function _buildShowcase(cs, compSpec, properties, propNames, log) {
  var compName = compSpec.name || "Component";
  var desc = compSpec.description || "";
  var category = compSpec.category || "Components";

  // Section visibility — whitelist via showcase.sections (default: all)
  var _scSections = compSpec.showcase && compSpec.showcase.sections ? compSpec.showcase.sections : null;
  function _showSec(key) { return !_scSections || _scSections.indexOf(key) !== -1; }

  // Main frame — 1440w, dark bg
  var main = figma.createFrame();
  main.name = compName + " \u2014 Showcase";
  main.layoutMode = "VERTICAL";
  main.resize(1440, 100);
  main.layoutSizingHorizontal = "FIXED";
  main.layoutSizingVertical = "HUG";
  _bindPad(main, 64, 64, 64, 64);
  _bindSp(main, "itemSpacing", 64);
  _bindRad(main, 0);
  setFill(main, "background");
  main.clipsContent = false;

  // Apply dark mode to showcase so semantic variables resolve to dark theme values
  try {
    var _allCols = await figma.variables.getLocalVariableCollectionsAsync();
    var _darkApplied = false;
    for (var _ci = 0; _ci < _allCols.length; _ci++) {
      var _col = _allCols[_ci];
      for (var _mi = 0; _mi < _col.modes.length; _mi++) {
        if (_col.modes[_mi].name.toLowerCase() === "dark") {
          main.setExplicitVariableModeForCollection(_col.id, _col.modes[_mi].modeId);
          log.push("  Dark mode set: " + _col.name + " → " + _col.modes[_mi].name);
          _darkApplied = true;
          break;
        }
      }
    }
    if (!_darkApplied) log.push("  WARN: No Dark mode found in any collection");
  } catch(e) {
    log.push("  WARN: Failed to set dark mode: " + e.message);
  }

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
  var firstProp = propNames[0] || "Variant"; // e.g. "Variant"
  var firstVals = properties[firstProp] || []; // e.g. ["Default", "Secondary", ...]
  var sizes = properties["Size"] || ["default"];
  var states = properties["State"] || [];

  // --- Card helper (Header → Separator → Preview) with border ---
  async function _makeExCard(name, desc, parent) {
    var card = figma.createFrame(); card.name = name;
    card.layoutMode = "VERTICAL"; _bindSp(card, "itemSpacing", 0); card.fills = [];
    card.resize(CARD_W, 100);
    _bindRad(card, 12);
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
    var hdr = figma.createFrame(); hdr.name = "Header"; hdr.layoutMode = "VERTICAL"; _bindSp(hdr, "itemSpacing", 6);
    _bindPad(hdr, 16, 24, 16, 24);
    setFillWithOpacity(hdr, "muted", 0.5);
    card.appendChild(hdr);
    try { hdr.layoutSizingHorizontal = "FILL"; hdr.layoutSizingVertical = "HUG"; } catch (e) {}
    await _makeLabel(name, "SP/Body Semibold", "foreground", hdr);
    if (desc) await _makeLabel(desc, "SP/Caption", "muted-foreground", hdr);
    // Separator
    _makeSep(card);
    // Preview
    var prev = figma.createFrame(); prev.name = "Preview"; prev.layoutMode = "VERTICAL"; _bindSp(prev, "itemSpacing", 12);
    _bindPad(prev, 20, 24, 20, 24);
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
  var _gridDesc = propNames.length > 1
    ? "Columns: " + propNames[propNames.length - 1] + " (" + properties[propNames[propNames.length - 1]].join(", ") + "). Rows grouped by: " + propNames.slice(0, -1).join(" → ") + "."
    : "All " + propNames[0] + " values.";
  var _descLabel = await _makeLabel(cs.children.length + " variants. " + _gridDesc, "SP/Body", "muted-foreground", compSec);
  try { _descLabel.layoutSizingHorizontal = "FILL"; } catch (e) {}

  // Sort + grid layout via shared helper
  var _totalW = _layoutCSGrid(cs, properties, propNames);

  // Move the actual ComponentSet INTO the showcase
  compSec.appendChild(cs);

  // If CS width > 1280 (content area), switch main frame to HUG width
  var _contentArea = 1440 - 64 - 64; // 1312
  if (_totalW > _contentArea) {
    main.layoutSizingHorizontal = "HUG";
    _bindSp(main, "paddingRight", 64); _bindSp(main, "paddingLeft", 64);
  }

  // Helper: build props from a flat object {PropName: "value", ...}
  // (hoisted outside explore block so examples can use it too)
  function _buildProps(overrides) {
    var p = {};
    for (var pi = 0; pi < propNames.length; pi++) {
      var pn = propNames[pi];
      p[pn] = overrides[pn] || properties[pn][0]; // default = first value
    }
    return p;
  }

  // ====== 3. EXPLORE BEHAVIOR ======
  if (_showSec("explore")) {
  _makeSep(main);
  var exploreSec = _makeFrame("Section — Explore Behavior", "v", 24, main);
  await _makeLabel("Explore Behavior", "SP/H3", "foreground", exploreSec);

  // Build an explore card: preview area + property controls
  var exploreCard = figma.createFrame(); exploreCard.name = "Explore Card";
  exploreCard.layoutMode = "VERTICAL"; _bindSp(exploreCard, "itemSpacing", 0);
  _bindRad(exploreCard, 12);
  exploreCard.clipsContent = true;
  exploreCard.fills = [];
  setStroke(exploreCard, "border"); exploreCard.strokeWeight = 1; exploreCard.strokeAlign = "INSIDE";
  exploreSec.appendChild(exploreCard);
  try { exploreCard.layoutSizingHorizontal = "FILL"; exploreCard.layoutSizingVertical = "HUG"; } catch(e) {}

  // Preview area
  var expPreview = figma.createFrame(); expPreview.name = "Preview";
  expPreview.layoutMode = "HORIZONTAL"; _bindSp(expPreview, "itemSpacing", 16);
  _bindPad(expPreview, 48, 48, 48, 48);
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
  expControls.layoutMode = "VERTICAL"; _bindSp(expControls, "itemSpacing", 16);
  _bindPad(expControls, 16, 16, 16, 16);
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
    epPills.layoutWrap = "WRAP"; _bindSp(epPills, "counterAxisSpacing", 6);
    for (var epv = 0; epv < epVals.length; epv++) {
      var epPill = figma.createFrame(); epPill.name = epVals[epv];
      epPill.layoutMode = "HORIZONTAL"; epPill.primaryAxisAlignItems = "CENTER"; epPill.counterAxisAlignItems = "CENTER";
      _bindPad(epPill, 4, 8, 4, 8);
      _bindRad(epPill, 6);
      if (epv === 0) {
        setFill(epPill, "primary");
        setStroke(epPill, "primary"); epPill.strokeWeight = 1; epPill.strokeAlign = "INSIDE";
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
  } // end _showSec("explore")

  // ====== 3.5. INSTALLATION ======
  if (_showSec("installation")) {
  var installData = compSpec.installation || null;
  if (installData) {
    await _buildInstallSec(main, installData);
  }
  } // end _showSec("installation")

  // ====== 4. EXAMPLES ======
  if (_showSec("examples")) {
  _makeSep(main);
  var exSec = _makeFrame("Section — Examples", "v", 32, main);
  await _makeLabel("Examples", "SP/H3", "foreground", exSec);
  await _makeLabel("Real-world usage patterns.", "SP/Body", "muted-foreground", exSec);

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
        _bindSp(exPrev, "itemSpacing", 12);
        exPrev.counterAxisAlignItems = "CENTER";
        if (exDef.layout === "vertical") { exPrev.counterAxisAlignItems = "MIN"; }
        // Create instances in parallel (font loads batched), then append in order
        var exItems = exDef.items || [];
        var _exTasks = exItems.map(function(exItem) {
          return (async function() {
            var exInst = _getInstance(cs, _buildProps(exItem.props || {}));
            if (!exInst) return { inst: null, fill: exItem.fill };
            if (exItem.label) {
              var _tns = exInst.findAll(function(n) { return n.type === "TEXT"; });
              await Promise.all(_tns.map(function(tn) {
                if (tn.fontName && tn.fontName !== figma.mixed) return _loadFont(tn.fontName.family, tn.fontName.style);
                return Promise.resolve();
              }));
              setTextOverride(exInst, "Label", exItem.label);
            }
            return { inst: exInst, fill: exItem.fill };
          })();
        });
        var _exResults = await Promise.all(_exTasks);
        for (var eii = 0; eii < _exResults.length; eii++) {
          var _er = _exResults[eii];
          if (_er.inst) {
            exPrev.appendChild(_er.inst);
            if (_er.fill) { try { _er.inst.layoutSizingHorizontal = "FILL"; } catch(e) {} }
            else { try { _er.inst.layoutSizingHorizontal = "FIXED"; _er.inst.layoutSizingVertical = "FIXED"; } catch(e) {} }
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
    var _allVarPrev = await _makeExCard("All " + firstProp + "s", "Each " + (firstProp || "").toLowerCase() + " variant side by side.", _nextRow());
    _allVarPrev.layoutMode = "HORIZONTAL"; _bindSp(_allVarPrev, "itemSpacing", 12); _allVarPrev.counterAxisAlignItems = "CENTER";
    _allVarPrev.layoutWrap = "WRAP"; _bindSp(_allVarPrev, "counterAxisSpacing", 12);
    for (var av = 0; av < firstVals.length; av++) {
      var avp = {}; avp[firstProp] = firstVals[av];
      await _getInstanceWithLabel(cs, _buildProps(avp), firstVals[av], _allVarPrev);
    }

    // Example 2: "All Sizes" (if Size property exists)
    if (properties["Size"]) {
      var _allSzPrev = await _makeExCard("All Sizes", "Size comparison from largest to smallest.", _nextRow());
      _allSzPrev.layoutMode = "HORIZONTAL"; _bindSp(_allSzPrev, "itemSpacing", 16); _allSzPrev.counterAxisAlignItems = "MAX";
      for (var sz = 0; sz < sizes.length; sz++) {
        var szp = { "Size": sizes[sz] };
        await _getInstanceWithLabel(cs, _buildProps(szp), sizes[sz], _allSzPrev);
      }
    }

    // Example 3: "States" (if State property exists)
    if (properties["State"] && states.length > 1) {
      var _stPrev = await _makeExCard("State Flow", "Visual states: " + states.join(" → ") + ".", _nextRow());
      _stPrev.layoutMode = "HORIZONTAL"; _bindSp(_stPrev, "itemSpacing", 16); _stPrev.counterAxisAlignItems = "CENTER";
      for (var si = 0; si < states.length; si++) {
        var stp = { "State": states[si] };
        await _getInstanceWithLabel(cs, _buildProps(stp), states[si], _stPrev);
      }
    }

    // Example 4: "Disabled/Off" comparison (if Disabled or Value prop exists)
    if (properties["Disabled"]) {
      var _disPrev = await _makeExCard("Enabled vs Disabled", "Active and inactive comparison.", _nextRow());
      _disPrev.layoutMode = "HORIZONTAL"; _bindSp(_disPrev, "itemSpacing", 16); _disPrev.counterAxisAlignItems = "CENTER";
      await _getInstanceWithLabel(cs, _buildProps({"Disabled": "false"}), "Enabled", _disPrev);
      await _getInstanceWithLabel(cs, _buildProps({"Disabled": "true"}), "Disabled", _disPrev);
    }

    // Example 5: second property showcase (if exists and not already shown)
    if (propNames.length >= 2) {
      var secProp = propNames[1];
      if (secProp !== "Size" && secProp !== "State" && secProp !== "Disabled") {
        var secVals = properties[secProp];
        var _secPrev = await _makeExCard("All " + secProp + "s", secProp + " variations.", _nextRow());
        _secPrev.layoutMode = "HORIZONTAL"; _bindSp(_secPrev, "itemSpacing", 12); _secPrev.counterAxisAlignItems = "CENTER";
        for (var sv = 0; sv < secVals.length; sv++) {
          var svp = {}; svp[secProp] = secVals[sv];
          await _getInstanceWithLabel(cs, _buildProps(svp), secVals[sv], _secPrev);
        }
      }
    }

    // Example 6: combined — first value of each prop variation
    if (propNames.length >= 3) {
      var _combPrev = await _makeExCard("Combined", "Multiple properties combined together.", _nextRow());
      _combPrev.layoutMode = "HORIZONTAL"; _bindSp(_combPrev, "itemSpacing", 12); _combPrev.counterAxisAlignItems = "CENTER";
      _combPrev.layoutWrap = "WRAP"; _bindSp(_combPrev, "counterAxisSpacing", 12);
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
  } // end _showSec("examples")

  // ====== 5. PROPS TABLE ======
  if (_showSec("props")) {
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
      autoProps.push([(apn || "").toLowerCase(), '"' + apv.join('" | "') + '"', '"' + apv[0] + '"', apn + " variant"]);
    }
    autoProps.push(["className", "string", '""', "Additional CSS classes"]);
    await _makeTable("Props", ["Prop", "Type", "Default", "Description"], autoProps, main);
  }
  } // end _showSec("props")

  // ====== 5.5. DESIGN TOKENS TABLE ======
  if (_showSec("designTokens")) {
  var designTokensData = compSpec.designTokens || null;
  if (designTokensData && designTokensData.length > 0) {
    _makeSep(main);
    await _makeTable("Design Tokens", ["Token", "Value", "Description"], designTokensData, main);
  }
  } // end _showSec("designTokens")

  // ====== 5.6. BEST PRACTICES ======
  if (_showSec("bestPractices")) {
  var bestPracticesData = compSpec.bestPractices || null;
  if (bestPracticesData && bestPracticesData.length > 0) {
    _makeSep(main);
    var bpSec = _makeFrame("Section — Best Practices", "v", 24, main);
    await _makeLabel("Best Practices", "SP/H3", "foreground", bpSec);
    for (var bpi = 0; bpi < bestPracticesData.length; bpi++) {
      var bp = bestPracticesData[bpi];
      var bpRow = _makeFrame("Practice " + bpi, "v", 8, bpSec);
      if (bp.title) await _makeLabel(bp.title, "SP/Body Semibold", "foreground", bpRow);
      var bpCards = _makeFrame("Do Dont", "h", 16, bpRow);
      // Do card
      var doCard = figma.createFrame(); doCard.name = "Do";
      doCard.layoutMode = "VERTICAL"; _bindSp(doCard, "itemSpacing", 8);
      _bindPad(doCard, 16, 16, 16, 16);
      _bindRad(doCard, 12);
      setFill(doCard, "card");
      setStroke(doCard, "success"); doCard.strokeWeight = 1; doCard.strokeAlign = "INSIDE";
      bpCards.appendChild(doCard);
      try { doCard.layoutSizingHorizontal = "FILL"; doCard.layoutSizingVertical = "HUG"; } catch(e) {}
      await _makeLabel("DO", "SP/Overline", "success", doCard);
      await _makeLabel(bp.do || bp["do"], "SP/Caption", "foreground", doCard);
      // Don't card
      var dontCard = figma.createFrame(); dontCard.name = "Dont";
      dontCard.layoutMode = "VERTICAL"; _bindSp(dontCard, "itemSpacing", 8);
      _bindPad(dontCard, 16, 16, 16, 16);
      _bindRad(dontCard, 12);
      setFill(dontCard, "card");
      setStroke(dontCard, "destructive"); dontCard.strokeWeight = 1; dontCard.strokeAlign = "INSIDE";
      bpCards.appendChild(dontCard);
      try { dontCard.layoutSizingHorizontal = "FILL"; dontCard.layoutSizingVertical = "HUG"; } catch(e) {}
      await _makeLabel("DON'T", "SP/Overline", "destructive", dontCard);
      await _makeLabel(bp.dont || bp["dont"], "SP/Caption", "foreground", dontCard);
    }
  }
  } // end _showSec("bestPractices")

  // ====== 6. FIGMA MAPPING TABLE ======
  if (_showSec("figmaMapping")) {
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
        autoMapping.push([fmn, fmv[fmvi], (fmn || "").toLowerCase(), '"' + (fmv[fmvi] || "").toLowerCase() + '"']);
      }
    }
    await _makeTable("Figma Mapping", ["Figma Property", "Figma Value", "Code Prop", "Code Value"], autoMapping, main);
  }
  } // end _showSec("figmaMapping")

  // ====== 7. ACCESSIBILITY ======
  if (_showSec("accessibility")) {
  _makeSep(main);
  var a11ySec = _makeFrame("Section — Accessibility", "v", 24, main);
  await _makeLabel("Accessibility", "SP/H3", "foreground", a11ySec);

  var a11yData = compSpec.accessibility || null;
  if (a11yData) {
    // Keyboard section
    if (a11yData.keyboard && a11yData.keyboard.length > 0) {
      var kbCard = figma.createFrame(); kbCard.name = "Keyboard";
      kbCard.layoutMode = "VERTICAL"; _bindSp(kbCard, "itemSpacing", 12);
      _bindPad(kbCard, 16, 16, 16, 16);
      _bindRad(kbCard, 12);
      setFill(kbCard, "card");
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
      notesCard.layoutMode = "VERTICAL"; _bindSp(notesCard, "itemSpacing", 8);
      _bindPad(notesCard, 16, 16, 16, 16);
      _bindRad(notesCard, 12);
      setFill(notesCard, "card");
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
    a11yPlaceholder.layoutMode = "VERTICAL"; _bindSp(a11yPlaceholder, "itemSpacing", 8);
    _bindPad(a11yPlaceholder, 16, 16, 16, 16);
    _bindRad(a11yPlaceholder, 12);
    setFill(a11yPlaceholder, "card");
    setStroke(a11yPlaceholder, "border"); a11yPlaceholder.strokeWeight = 1; a11yPlaceholder.strokeAlign = "INSIDE";
    a11ySec.appendChild(a11yPlaceholder);
    try { a11yPlaceholder.layoutSizingHorizontal = "FILL"; a11yPlaceholder.layoutSizingVertical = "HUG"; } catch(e) {}
    await _makeLabel("Keyboard", "SP/Body Semibold", "foreground", a11yPlaceholder);
    await _makeLabel("Tab — Focus the component", "SP/Caption", "muted-foreground", a11yPlaceholder);
    await _makeLabel("Enter / Space — Activate", "SP/Caption", "muted-foreground", a11yPlaceholder);
  }
  } // end _showSec("accessibility")

  // ====== 8. RELATED COMPONENTS ======
  if (_showSec("related")) {
  _makeSep(main);
  var relatedData = compSpec.related || null;
  if (relatedData && relatedData.length > 0) {
    var relSec = _makeFrame("Section — Related", "v", 24, main);
    await _makeLabel("Related Components", "SP/H3", "foreground", relSec);
    var relCard = figma.createFrame(); relCard.name = "Related List";
    relCard.layoutMode = "VERTICAL"; _bindSp(relCard, "itemSpacing", 0);
    _bindRad(relCard, 12);
    relCard.clipsContent = true;
    setFill(relCard, "card");
    setStroke(relCard, "border"); relCard.strokeWeight = 1; relCard.strokeAlign = "INSIDE";
    relSec.appendChild(relCard);
    try { relCard.layoutSizingHorizontal = "FILL"; relCard.layoutSizingVertical = "HUG"; } catch(e) {}
    for (var rli = 0; rli < relatedData.length; rli++) {
      var relItem = figma.createFrame(); relItem.name = relatedData[rli].name;
      relItem.layoutMode = "VERTICAL"; _bindSp(relItem, "itemSpacing", 4);
      _bindPad(relItem, 12, 16, 12, 16);
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
  } // end _showSec("related")

  log.push("  Showcase built: " + (_scSections ? _scSections.join(", ") : "all sections"));
  return main;
}

// --- Grid layout for variants inside ComponentSet ---
// Arranges variants in a property-based grid: last property = columns (X), rest = rows (Y)
function _layoutVariantsInGrid(cs, propNames, properties) {
  var variants = cs.children.slice();
  if (variants.length === 0) return;
  var gap = 20;

  // Parse variant name → { PropName: "Value", ... }
  function _vp(name) {
    var r = {};
    var parts = name.split(", ");
    for (var i = 0; i < parts.length; i++) {
      var kv = parts[i].trim().split("=");
      if (kv.length === 2) r[kv[0].trim()] = kv[1].trim();
    }
    return r;
  }

  // Single property or no property: arrange in one row
  if (propNames.length <= 1) {
    var vals = propNames.length === 1 ? properties[propNames[0]] : [];
    var x = gap;
    for (var c = 0; c < vals.length; c++) {
      for (var v = 0; v < variants.length; v++) {
        var vp = _vp(variants[v].name);
        if (vp[propNames[0]] === vals[c]) {
          variants[v].x = x;
          variants[v].y = gap;
          x += variants[v].width + gap;
          break;
        }
      }
    }
    // Handle any unmatched variants (shouldn't happen, but safety)
    if (propNames.length === 0) {
      for (var v2 = 0; v2 < variants.length; v2++) {
        variants[v2].x = gap + v2 * (variants[v2].width + gap);
        variants[v2].y = gap;
      }
    }
    var maxH = 0;
    for (var mh = 0; mh < variants.length; mh++) { if (variants[mh].height > maxH) maxH = variants[mh].height; }
    cs.resize(Math.max(x, 100), Math.max(gap + maxH + gap, 100));
    return;
  }

  // Multi-property: last prop = columns (X), remaining = rows (Y)
  var colProp = propNames[propNames.length - 1];
  var colVals = properties[colProp];
  var rowProps = propNames.slice(0, propNames.length - 1);

  // Build expected row keys from cross product of non-last properties (in property order)
  var rowCombos = [[]];
  for (var rp = 0; rp < rowProps.length; rp++) {
    var rpVals = properties[rowProps[rp]];
    var nxt = [];
    for (var rc = 0; rc < rowCombos.length; rc++) {
      for (var rv = 0; rv < rpVals.length; rv++) {
        nxt.push(rowCombos[rc].concat(rowProps[rp] + "=" + rpVals[rv]));
      }
    }
    rowCombos = nxt;
  }
  var allRowKeys = [];
  for (var rk = 0; rk < rowCombos.length; rk++) allRowKeys.push(rowCombos[rk].join(", "));

  // Build grid: rowKey → colVal → variant
  var grid = {};
  for (var v3 = 0; v3 < variants.length; v3++) {
    var vp3 = _vp(variants[v3].name);
    var rowParts = [];
    for (var rp2 = 0; rp2 < rowProps.length; rp2++) {
      rowParts.push(rowProps[rp2] + "=" + (vp3[rowProps[rp2]] || "?"));
    }
    var rowKey = rowParts.join(", ");
    if (!grid[rowKey]) grid[rowKey] = {};
    grid[rowKey][vp3[colProp] || "?"] = variants[v3];
  }

  // Filter to only rows that have at least one variant (handles variantRestrictions)
  var activeRows = [];
  for (var ar = 0; ar < allRowKeys.length; ar++) {
    if (grid[allRowKeys[ar]]) {
      var hasAny = false;
      for (var ac = 0; ac < colVals.length; ac++) {
        if (grid[allRowKeys[ar]][colVals[ac]]) { hasAny = true; break; }
      }
      if (hasAny) activeRows.push(allRowKeys[ar]);
    }
  }

  // Calculate column widths (max width per column across all rows)
  var colWidths = [];
  for (var cw = 0; cw < colVals.length; cw++) {
    var maxW = 0;
    for (var cr = 0; cr < activeRows.length; cr++) {
      var cv = grid[activeRows[cr]] && grid[activeRows[cr]][colVals[cw]];
      if (cv && cv.width > maxW) maxW = cv.width;
    }
    colWidths.push(maxW || 100);
  }

  // Calculate row heights (max height per row across all columns)
  var rowHeights = [];
  for (var rh = 0; rh < activeRows.length; rh++) {
    var maxRH = 0;
    for (var rhc = 0; rhc < colVals.length; rhc++) {
      var rhv = grid[activeRows[rh]] && grid[activeRows[rh]][colVals[rhc]];
      if (rhv && rhv.height > maxRH) maxRH = rhv.height;
    }
    rowHeights.push(maxRH || 40);
  }

  // Position each variant in the grid
  var y = gap;
  for (var gr = 0; gr < activeRows.length; gr++) {
    var x2 = gap;
    for (var gc = 0; gc < colVals.length; gc++) {
      var gv = grid[activeRows[gr]] && grid[activeRows[gr]][colVals[gc]];
      if (gv) { gv.x = x2; gv.y = y; }
      x2 += colWidths[gc] + gap;
    }
    y += rowHeights[gr] + gap;
  }

  // Resize CS to fit all variants + padding
  var totalW = gap;
  for (var tw = 0; tw < colVals.length; tw++) totalW += colWidths[tw] + gap;
  cs.resize(Math.max(totalW, 100), Math.max(y, 100));
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
// SECTION 12.5: FOUNDATION DOCUMENTATION PAGES
// ============================================================

async function doFoundationDocs(spec, sendProgress) {
  var startTime = Date.now();
  if (!sendProgress) sendProgress = function() {};
  var log = [];
  try {
    await loadCaches();
    log.push("Caches loaded");

    // Find or create target page
    var pageName = spec.targetPage || "🧱 Foundation";
    var pages = figma.root.children;
    var page = null;
    for (var pi = 0; pi < pages.length; pi++) {
      if (pages[pi].name === pageName) { page = pages[pi]; break; }
    }
    if (!page) {
      page = figma.createPage();
      page.name = pageName;
      log.push("Created page: " + pageName);
    }
    await figma.setCurrentPageAsync(page);

    // Upsert root frame by name
    var rootFrameName = spec.name;
    var existingRoot = null;
    for (var ri = 0; ri < page.children.length; ri++) {
      if (page.children[ri].name === rootFrameName) { existingRoot = page.children[ri]; break; }
    }
    if (existingRoot) {
      while (existingRoot.children.length > 0) existingRoot.children[0].remove();
      log.push("Cleared existing frame: " + rootFrameName);
    }

    var root = existingRoot || figma.createFrame();
    root.name = rootFrameName;
    root.layoutMode = "VERTICAL";
    root.resize(1200, 100);
    root.primaryAxisSizingMode = "AUTO";
    root.counterAxisSizingMode = "FIXED";
    setFill(root, "background", "#ffffff");
    root.clipsContent = false;
    if (!existingRoot) {
      page.appendChild(root);
      // Position based on existing content
      var maxX = 0;
      for (var ci = 0; ci < page.children.length; ci++) {
        var child = page.children[ci];
        if (child !== root) {
          var right = child.x + child.width;
          if (right > maxX) maxX = right;
        }
      }
      root.x = maxX > 0 ? maxX + 100 : 0;
      root.y = 0;
    }
    _bindSp(root, "itemSpacing", 40);
    _bindPad(root, 40, 40, 40, 40);

    // Render header
    var header = _makeFrame("Header", "v", 8, root);
    _bindSp(header, "itemSpacing", 8);
    _bindSp(header, "paddingBottom", 16);
    await _makeLabel("FOUNDATION", "SP/Overline", "muted-foreground", header);
    await _makeLabel(spec.name, "SP/H1", "foreground", header);
    if (spec.description) {
      var descNode = await _makeLabel(spec.description, "SP/Body", "muted-foreground", header);
      if (descNode) { descNode.resize(800, descNode.height); descNode.textAutoResize = "HEIGHT"; }
    }

    // Render sections
    for (var si = 0; si < spec.sections.length; si++) {
      var section = spec.sections[si];
      sendProgress(spec.name + " — " + section.title + " [" + (si + 1) + "/" + spec.sections.length + "]");
      log.push("Rendering section: " + section.title);
      await _renderDocSection(section, root, log);
    }

    var elapsed = Date.now() - startTime;
    return { success: true, pageName: pageName, message: spec.name + " docs created", elapsed: elapsed, log: log };
  } catch (e) {
    return { success: false, error: e.message || String(e), log: log };
  }
}

async function _renderDocSection(section, parent, log) {
  // Section wrapper
  var secFrame = _makeFrame(section.title, "v", 16, parent);
  _bindSp(secFrame, "itemSpacing", 16);

  // Section title
  await _makeLabel(section.title, "SP/H2", "foreground", secFrame);

  // Dispatch by sectionType
  switch (section.sectionType) {
    case "color-grid": await _renderColorGrid(section, secFrame, log); break;
    case "palette": await _renderPalettes(section, secFrame, log); break;
    case "font-family": await _renderFontFamily(section, secFrame, log); break;
    case "type-scale": await _renderTypeScale(section, secFrame, log); break;
    case "font-weight": await _renderFontWeight(section, secFrame, log); break;
    case "spacing-bar": await _renderSpacingBar(section, secFrame, log); break;
    case "radius-grid": await _renderRadiusGrid(section, secFrame, log); break;
    case "shadow-grid": await _renderShadowGrid(section, secFrame, log); break;
    case "illustration-grid": await _renderIllustrationGrid(section, secFrame, log); break;
    case "pattern-grid": await _renderPatternGrid(section, secFrame, log); break;
    case "guidelines": await _renderGuidelines(section, secFrame, log); break;
    default: log.push("Unknown sectionType: " + section.sectionType);
  }
}

// ─── Color Grid (Semantic / Status colors) ───
async function _renderColorGrid(section, parent, log) {
  var cols = section.columns || 4;
  var grid = _makeFrame("Grid", "h", 12, parent);
  _bindSp(grid, "itemSpacing", 12);
  grid.layoutWrap = "WRAP";
  _bindSp(grid, "counterAxisSpacing", 12);
  grid.resize(1120, 100);
  grid.counterAxisSizingMode = "AUTO";
  grid.primaryAxisSizingMode = "FIXED";

  var itemWidth = Math.floor((1120 - (cols - 1) * 12) / cols);

  for (var i = 0; i < section.items.length; i++) {
    var item = section.items[i];
    var card = figma.createFrame();
    card.name = item.name;
    card.layoutMode = "VERTICAL";
    card.resize(itemWidth, 120);
    card.primaryAxisSizingMode = "AUTO";
    card.counterAxisSizingMode = "FIXED";
    card.strokeWeight = 1;
    setStroke(card, "border", "#e4e4e7");
    setFill(card, "card", "#ffffff");
    card.clipsContent = true;
    grid.appendChild(card);
    _bindSp(card, "itemSpacing", 0);
    _bindRad(card, 8);

    // Color swatch
    var swatch = figma.createFrame();
    swatch.name = "Swatch";
    swatch.resize(itemWidth, 64);
    setFill(swatch, item.variable);
    card.appendChild(swatch);
    swatch.layoutSizingHorizontal = "FILL";
    swatch.layoutSizingVertical = "FIXED";

    // Labels container
    var labels = figma.createFrame();
    labels.name = "Labels";
    labels.layoutMode = "VERTICAL";
    labels.fills = [];
    card.appendChild(labels);
    _bindSp(labels, "itemSpacing", 2);
    _bindPad(labels, 8, 8, 8, 8);
    labels.layoutSizingHorizontal = "FILL";
    labels.layoutSizingVertical = "HUG";

    await _makeLabel(item.name, "SP/Label", "foreground", labels);
    await _makeLabel("--" + item.variable, "SP/Data SM", "muted-foreground", labels);
    if (item.tw) {
      await _makeLabel(item.tw, "SP/Data SM", "muted-foreground", labels);
    }
  }
  log.push("Color grid: " + section.items.length + " items");
}

// ─── Color Palettes ───
async function _renderPalettes(section, parent, log) {
  var shadeKeys = ["50","100","200","300","400","500","600","700","800","900","950"];

  for (var pi = 0; pi < section.palettes.length; pi++) {
    var palette = section.palettes[pi];
    var row = _makeFrame(palette.name, "v", 6, parent);
    _bindSp(row, "itemSpacing", 6);

    // Palette name
    var nameLabel = await _makeLabel(palette.name, "SP/Body Semibold", "foreground", row);
    if (nameLabel) nameLabel.textCase = "TITLE";

    // Color bar
    var bar = _makeFrame("Bar", "h", 2, row);
    _bindSp(bar, "itemSpacing", 2);
    _bindRad(bar, 8);
    bar.clipsContent = true;
    bar.resize(1120, 40);
    bar.counterAxisSizingMode = "FIXED";
    bar.primaryAxisSizingMode = "FIXED";

    for (var si = 0; si < shadeKeys.length; si++) {
      var hex = palette.shades[shadeKeys[si]];
      var cell = figma.createFrame();
      cell.name = shadeKeys[si];
      cell.resize(Math.floor(1120 / 11), 40);
      setFill(cell, palette.name.toLowerCase() + "/" + shadeKeys[si], hex);
      bar.appendChild(cell);
      cell.layoutSizingHorizontal = "FILL";
      cell.layoutSizingVertical = "FILL";
    }

    // Shade labels
    var labelRow = _makeFrame("Labels", "h", 2, row);
    _bindSp(labelRow, "itemSpacing", 2);
    labelRow.resize(1120, 16);
    labelRow.counterAxisSizingMode = "FIXED";
    labelRow.primaryAxisSizingMode = "FIXED";

    for (var li = 0; li < shadeKeys.length; li++) {
      var shadeFrame = figma.createFrame();
      shadeFrame.name = "L" + shadeKeys[li];
      shadeFrame.layoutMode = "HORIZONTAL";
      shadeFrame.primaryAxisAlignItems = "CENTER";
      shadeFrame.counterAxisAlignItems = "CENTER";
      shadeFrame.fills = [];
      shadeFrame.resize(Math.floor(1120 / 11), 16);
      labelRow.appendChild(shadeFrame);
      shadeFrame.layoutSizingHorizontal = "FILL";
      shadeFrame.layoutSizingVertical = "FILL";

      var sl = await _makeLabel(shadeKeys[li], "SP/Data SM", "muted-foreground", shadeFrame);
      if (sl) { sl.textAlignHorizontal = "CENTER"; }
    }
  }
  log.push("Palettes: " + section.palettes.length + " rendered");
}

// ─── Font Family Cards ───
async function _renderFontFamily(section, parent, log) {
  var cols = section.columns || 3;
  var grid = _makeFrame("Grid", "h", 16, parent);
  _bindSp(grid, "itemSpacing", 16);
  grid.resize(1120, 100);
  grid.counterAxisSizingMode = "AUTO";
  grid.primaryAxisSizingMode = "FIXED";

  var itemWidth = Math.floor((1120 - (cols - 1) * 16) / cols);

  for (var i = 0; i < section.items.length; i++) {
    var item = section.items[i];
    var card = figma.createFrame();
    card.name = item.name;
    card.layoutMode = "VERTICAL";
    card.resize(itemWidth, 100);
    card.primaryAxisSizingMode = "AUTO";
    card.counterAxisSizingMode = "FIXED";
    card.strokeWeight = 1;
    setStroke(card, "border", "#e4e4e7");
    card.fills = [];
    grid.appendChild(card);
    _bindSp(card, "itemSpacing", 6);
    _bindPad(card, 16, 16, 16, 16);
    _bindRad(card, 8);

    // Font name in its own font
    var fontStyle = "Regular";
    if (item.name === "Plus Jakarta Sans") fontStyle = "Bold";
    var loaded = await loadFontSafe(item.name, fontStyle);
    var fontLabel = figma.createText();
    if (loaded) fontLabel.fontName = loaded;
    fontLabel.fontSize = 20;
    fontLabel.characters = item.name;
    setTextFill(fontLabel, "foreground");
    card.appendChild(fontLabel);

    await _makeLabel(item.usage, "SP/Caption", "muted-foreground", card);
    await _makeLabel(item.class, "SP/Data SM", "muted-foreground", card);
  }
  log.push("Font families: " + section.items.length);
}

// ─── Type Scale ───
async function _renderTypeScale(section, parent, log) {
  for (var i = 0; i < section.items.length; i++) {
    var item = section.items[i];
    var row = figma.createFrame();
    row.name = item.name;
    row.layoutMode = "HORIZONTAL";
    row.primaryAxisAlignItems = "SPACE_BETWEEN";
    row.counterAxisAlignItems = "CENTER";
    row.strokeWeight = 1;
    setStroke(row, "border", "#e4e4e7");
    row.fills = [];
    row.resize(1120, 40);
    row.primaryAxisSizingMode = "FIXED";
    row.counterAxisSizingMode = "AUTO";
    parent.appendChild(row);
    _bindSp(row, "itemSpacing", 16);
    _bindPad(row, 16, 16, 16, 16);
    _bindRad(row, 8);
    row.layoutSizingHorizontal = "FILL";

    // Left side: sample text + spec
    var leftGroup = _makeFrame("Content", "v", 6, row);
    _bindSp(leftGroup, "itemSpacing", 6);
    leftGroup.layoutSizingHorizontal = "FILL";

    var sampleText = await _makeLabel(item.sample || "The quick brown fox jumps over the lazy dog", item.textStyle, "foreground", leftGroup);
    if (sampleText) sampleText.layoutSizingHorizontal = "FILL";

    await _makeLabel(item.spec, "SP/Data SM", "muted-foreground", leftGroup);

    // Right side: name badge
    var badge = figma.createFrame();
    badge.name = "Badge";
    badge.layoutMode = "HORIZONTAL";
    badge.fills = [];
    setFill(badge, "muted", "#f4f4f5");
    row.appendChild(badge);
    _bindPad(badge, 4, 12, 4, 12);
    _bindRad(badge, 4);
    badge.layoutSizingHorizontal = "HUG";
    badge.layoutSizingVertical = "HUG";

    await _makeLabel(item.name, "SP/Data SM", "muted-foreground", badge);
  }
  log.push("Type scale: " + section.items.length + " styles");
}

// ─── Font Weights ───
async function _renderFontWeight(section, parent, log) {
  var cols = section.columns || 4;
  var grid = _makeFrame("Grid", "h", 16, parent);
  _bindSp(grid, "itemSpacing", 16);
  grid.resize(1120, 100);
  grid.counterAxisSizingMode = "AUTO";
  grid.primaryAxisSizingMode = "FIXED";

  var itemWidth = Math.floor((1120 - (cols - 1) * 16) / cols);
  var weightToStyle = { 400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold" };

  for (var i = 0; i < section.items.length; i++) {
    var item = section.items[i];
    var card = figma.createFrame();
    card.name = item.name;
    card.layoutMode = "VERTICAL";
    card.resize(itemWidth, 100);
    card.primaryAxisSizingMode = "AUTO";
    card.counterAxisSizingMode = "FIXED";
    card.strokeWeight = 1;
    setStroke(card, "border", "#e4e4e7");
    card.fills = [];
    card.primaryAxisAlignItems = "CENTER";
    card.counterAxisAlignItems = "CENTER";
    grid.appendChild(card);
    _bindSp(card, "itemSpacing", 8);
    _bindPad(card, 16, 16, 16, 16);
    _bindRad(card, 8);

    // "Aa" sample
    var fontFamily = item.fontFamily || "Inter";
    var fontStyle = weightToStyle[item.weight] || "Regular";
    var loaded = await loadFontSafe(fontFamily, fontStyle);
    var aaNode = figma.createText();
    if (loaded) aaNode.fontName = loaded;
    aaNode.fontSize = 24;
    aaNode.characters = "Aa";
    setTextFill(aaNode, "foreground");
    aaNode.textAlignHorizontal = "CENTER";
    card.appendChild(aaNode);

    await _makeLabel(item.name, "SP/Caption", "muted-foreground", card);
    await _makeLabel(item.class, "SP/Data SM", "muted-foreground", card);
  }
  log.push("Font weights: " + section.items.length);
}

// ─── Spacing Bars ───
async function _renderSpacingBar(section, parent, log) {
  for (var i = 0; i < section.items.length; i++) {
    var item = section.items[i];
    var row = figma.createFrame();
    row.name = item.name;
    row.layoutMode = "HORIZONTAL";
    row.counterAxisAlignItems = "CENTER";
    row.strokeWeight = 1;
    setStroke(row, "border", "#e4e4e7");
    row.fills = [];
    row.resize(1120, 40);
    row.primaryAxisSizingMode = "FIXED";
    row.counterAxisSizingMode = "AUTO";
    parent.appendChild(row);
    _bindSp(row, "itemSpacing", 12);
    _bindPad(row, 8, 12, 8, 12);
    _bindRad(row, 8);
    row.layoutSizingHorizontal = "FILL";

    // Name label (fixed width)
    var nameLabel = await _makeLabel(item.name, "SP/Label", "foreground", row);
    if (nameLabel) { nameLabel.resize(48, nameLabel.height); nameLabel.layoutSizingHorizontal = "FIXED"; }

    // Colored bar
    var bar = figma.createFrame();
    bar.name = "Bar";
    var barWidth = Math.max(item.value, 4);
    bar.resize(barWidth, 20);
    setFill(bar, "primary", "#7c3aed");
    row.appendChild(bar);
    _bindRad(bar, 4);
    bar.layoutSizingHorizontal = "FIXED";
    bar.layoutSizingVertical = "FIXED";

    // Value label
    await _makeLabel(item.value + "px", "SP/Data SM", "muted-foreground", row);

    // Tailwind class badge
    var twBadge = figma.createFrame();
    twBadge.name = "TW";
    twBadge.layoutMode = "HORIZONTAL";
    twBadge.fills = [];
    setFill(twBadge, "muted", "#f4f4f5");
    row.appendChild(twBadge);
    _bindPad(twBadge, 2, 8, 2, 8);
    _bindRad(twBadge, 4);
    twBadge.layoutSizingHorizontal = "HUG";
    twBadge.layoutSizingVertical = "HUG";

    await _makeLabel(item.tw, "SP/Data SM", "muted-foreground", twBadge);
  }
  log.push("Spacing bars: " + section.items.length + " tokens");
}

// ─── Border Radius Grid ───
async function _renderRadiusGrid(section, parent, log) {
  var cols = section.columns || 5;
  var grid = _makeFrame("Grid", "h", 16, parent);
  _bindSp(grid, "itemSpacing", 16);
  grid.layoutWrap = "WRAP";
  _bindSp(grid, "counterAxisSpacing", 16);
  grid.resize(1120, 100);
  grid.counterAxisSizingMode = "AUTO";
  grid.primaryAxisSizingMode = "FIXED";

  var itemWidth = Math.floor((1120 - (cols - 1) * 16) / cols);

  for (var i = 0; i < section.items.length; i++) {
    var item = section.items[i];
    var card = figma.createFrame();
    card.name = item.name;
    card.layoutMode = "VERTICAL";
    card.resize(itemWidth, 160);
    card.primaryAxisSizingMode = "AUTO";
    card.counterAxisSizingMode = "FIXED";
    card.strokeWeight = 1;
    setStroke(card, "border", "#e4e4e7");
    card.fills = [];
    card.counterAxisAlignItems = "CENTER";
    grid.appendChild(card);
    _bindSp(card, "itemSpacing", 8);
    _bindPad(card, 16, 16, 16, 16);
    _bindRad(card, 8);

    // Radius demo square
    var demo = figma.createFrame();
    demo.name = "Demo";
    demo.resize(64, 64);
    var radius = item.value > 32 ? 32 : item.value;
    setFill(demo, "primary", "#7c3aed");
    card.appendChild(demo);
    _bindRad(demo, radius);
    demo.layoutSizingHorizontal = "FIXED";
    demo.layoutSizingVertical = "FIXED";

    await _makeLabel(item.name, "SP/Label", "foreground", card);
    await _makeLabel(item.value + "px", "SP/Data SM", "muted-foreground", card);
    await _makeLabel(item.tw, "SP/Data SM", "muted-foreground", card);
  }
  log.push("Radius grid: " + section.items.length + " tokens");
}

// ─── Shadow Grid ───
async function _renderShadowGrid(section, parent, log) {
  var cols = section.columns || 3;
  var grid = _makeFrame("Grid", "h", 20, parent);
  _bindSp(grid, "itemSpacing", 20);
  grid.layoutWrap = "WRAP";
  _bindSp(grid, "counterAxisSpacing", 20);
  grid.resize(1120, 100);
  grid.counterAxisSizingMode = "AUTO";
  grid.primaryAxisSizingMode = "FIXED";

  var itemWidth = Math.floor((1120 - (cols - 1) * 20) / cols);

  for (var i = 0; i < section.items.length; i++) {
    var item = section.items[i];
    var card = figma.createFrame();
    card.name = item.name;
    card.layoutMode = "VERTICAL";
    card.resize(itemWidth, 120);
    card.primaryAxisSizingMode = "AUTO";
    card.counterAxisSizingMode = "FIXED";
    card.strokeWeight = 1;
    setStroke(card, "border", "#e4e4e7");
    setFill(card, "card", "#ffffff");
    grid.appendChild(card);
    _bindSp(card, "itemSpacing", 6);
    _bindPad(card, 20, 20, 20, 20);
    _bindRad(card, 12);

    // Apply effect style
    if (item.effectStyle) {
      try {
        var effStyles = await figma.getLocalEffectStylesAsync();
        for (var ei = 0; ei < effStyles.length; ei++) {
          if (effStyles[ei].name === item.effectStyle) {
            await card.setEffectStyleIdAsync(effStyles[ei].id);
            break;
          }
        }
      } catch(e) {}
    }

    await _makeLabel(item.name, "SP/Body Semibold", "foreground", card);
    await _makeLabel(item.tw, "SP/Data SM", "muted-foreground", card);
    await _makeLabel(item.desc, "SP/Caption", "muted-foreground", card);
  }
  log.push("Shadow grid: " + section.items.length + " tokens");
}

// ─── Illustration Grid (empty state icons) ───
async function _renderIllustrationGrid(section, parent, log) {
  var cols = section.columns || 3;
  var grid = _makeFrame("Grid", "h", 16, parent);
  _bindSp(grid, "itemSpacing", 16);
  grid.layoutWrap = "WRAP";
  _bindSp(grid, "counterAxisSpacing", 16);
  grid.resize(1120, 100);
  grid.counterAxisSizingMode = "AUTO";
  grid.primaryAxisSizingMode = "FIXED";

  var itemWidth = Math.floor((1120 - (cols - 1) * 16) / cols);

  for (var i = 0; i < section.items.length; i++) {
    var item = section.items[i];
    var card = figma.createFrame();
    card.name = item.name;
    card.layoutMode = "VERTICAL";
    card.resize(itemWidth, 100);
    card.primaryAxisSizingMode = "AUTO";
    card.counterAxisSizingMode = "FIXED";
    card.strokeWeight = 1;
    setStroke(card, "border", "#e4e4e7");
    card.fills = [];
    card.counterAxisAlignItems = "CENTER";
    grid.appendChild(card);
    _bindSp(card, "itemSpacing", 12);
    _bindPad(card, 24, 16, 24, 16);
    _bindRad(card, 8);

    // Icon placeholder circle
    var circle = figma.createFrame();
    circle.name = "IconBg";
    circle.resize(48, 48);
    setFill(circle, "muted", "#f4f4f5");
    circle.layoutMode = "HORIZONTAL";
    circle.primaryAxisAlignItems = "CENTER";
    circle.counterAxisAlignItems = "CENTER";
    card.appendChild(circle);
    _bindRad(circle, 24);
    circle.layoutSizingHorizontal = "FIXED";
    circle.layoutSizingVertical = "FIXED";

    // Try to place icon inside circle
    if (item.icon) {
      try {
        var iconComp = figma.root.findOne(function(n) { return n.type === "COMPONENT" && n.name === "Icon / " + item.icon; });
        if (iconComp) {
          var iconInst = iconComp.createInstance();
          iconInst.resize(24, 24);
          circle.appendChild(iconInst);
        }
      } catch(e) {}
    }

    await _makeLabel(item.name, "SP/Body Semibold", "foreground", card);
    var descLabel = await _makeLabel(item.desc, "SP/Caption", "muted-foreground", card);
    if (descLabel) { descLabel.textAutoResize = "HEIGHT"; }
  }
  log.push("Illustration grid: " + section.items.length + " items");
}

// ─── Pattern Grid (decorative patterns) ───
async function _renderPatternGrid(section, parent, log) {
  var cols = section.columns || 2;
  var grid = _makeFrame("Grid", "h", 16, parent);
  _bindSp(grid, "itemSpacing", 16);
  grid.resize(1120, 100);
  grid.counterAxisSizingMode = "AUTO";
  grid.primaryAxisSizingMode = "FIXED";

  var itemWidth = Math.floor((1120 - (cols - 1) * 16) / cols);

  for (var i = 0; i < section.items.length; i++) {
    var item = section.items[i];
    var card = figma.createFrame();
    card.name = item.name;
    card.layoutMode = "VERTICAL";
    card.resize(itemWidth, 100);
    card.primaryAxisSizingMode = "AUTO";
    card.counterAxisSizingMode = "FIXED";
    card.strokeWeight = 1;
    setStroke(card, "border", "#e4e4e7");
    card.fills = [];
    grid.appendChild(card);
    _bindSp(card, "itemSpacing", 8);
    _bindPad(card, 16, 16, 16, 16);
    _bindRad(card, 8);

    await _makeLabel(item.name, "SP/Body Semibold", "foreground", card);
    await _makeLabel(item.desc, "SP/Data SM", "muted-foreground", card);
  }
  log.push("Pattern grid: " + section.items.length + " items");
}

// ─── Guidelines (bullet list) ───
async function _renderGuidelines(section, parent, log) {
  var list = _makeFrame("List", "v", 8, parent);
  _bindSp(list, "itemSpacing", 8);
  _bindPad(list, 12, 16, 12, 16);
  _bindRad(list, 8);
  list.strokeWeight = 1;
  setStroke(list, "border", "#e4e4e7");
  list.fills = [];

  for (var i = 0; i < section.items.length; i++) {
    var bulletText = "• " + section.items[i];
    var label = await _makeLabel(bulletText, "SP/Body", "muted-foreground", list);
    if (label) { label.resize(1080, label.height); label.textAutoResize = "HEIGHT"; }
  }
  log.push("Guidelines: " + section.items.length + " items");
}

// ============================================================
// SECTION 13: PLUGIN MESSAGE HANDLER
// ============================================================

figma.showUI(__html__, { width: 420, height: 480 });

figma.ui.onmessage = async function(msg) {
  // ─── Image data response from UI ───
  if (msg.type === "image-data") {
    var req = _pendingImageRequests[msg.id];
    if (req) {
      delete _pendingImageRequests[msg.id];
      if (msg.error) req.reject(new Error(msg.error));
      else req.resolve(new Uint8Array(msg.bytes));
    }
    return;
  }

  var source = msg.source || "generate";

  if (msg.type === "generate") {
    var spec = msg.spec;
    if (!spec) {
      figma.ui.postMessage({ type: "status", text: "Error: No spec provided", source: source });
      return;
    }

    // Load pre-fetched image data from UI
    if (spec._imageData) {
      var imgKeys = Object.keys(spec._imageData);
      for (var ik = 0; ik < imgKeys.length; ik++) _prefetchedImages[imgKeys[ik]] = spec._imageData[imgKeys[ik]];
      delete spec._imageData;
    }

    // Route based on spec.type
    var specType = spec.type || "page";

    // Helper: send real-time progress to UI
    function sendProgress(text, level) {
      figma.ui.postMessage({ type: "progress", text: text, level: level || "", source: source });
    }

    // Clear log area at start
    figma.ui.postMessage({ type: "log-clear", source: source });

    try {
      var result;

      if (specType === "foundation-variables") {
        sendProgress("Creating variables...");
        result = await doCreateVariables(spec, sendProgress);
      } else if (specType === "foundation-text-styles") {
        sendProgress("Creating text styles...");
        result = await doCreateTextStyles(spec, sendProgress);
      } else if (specType === "foundation-effects") {
        sendProgress("Creating effect styles...");
        result = await doCreateEffectStyles(spec, sendProgress);
      } else if (specType === "foundation-icons") {
        sendProgress("Creating icons...");
        result = await doCreateIcons(spec, sendProgress);
      } else if (specType === "foundation-components") {
        sendProgress("Creating components...");
        result = await doCreateComponents(spec, sendProgress);
      } else if (specType === "foundation-docs") {
        sendProgress("Creating " + spec.name + " docs...");
        result = await doFoundationDocs(spec, sendProgress);
      } else {
        // Default: page generation
        sendProgress("Generating...");
        result = await doGenerate(spec, sendProgress);
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
