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

// Resolve variable value across modes (handles VARIABLE_ALIAS chains, max 5 deep)
// MUST be top-level — Figma sandbox crashes on nested async function definitions
async function _resolveVarValue(variable, modeId, depth) {
  if (depth > 5 || !variable || !variable.valuesByMode) return null;
  var val = variable.valuesByMode[modeId];
  if (val === undefined || val === null) {
    var keys = Object.keys(variable.valuesByMode);
    if (keys.length > 0) val = variable.valuesByMode[keys[0]];
  }
  if (val === undefined || val === null) return null;
  if (val && val.type === "VARIABLE_ALIAS") {
    try {
      var ref = await figma.variables.getVariableByIdAsync(val.id);
      if (ref) return await _resolveVarValue(ref, modeId, depth + 1);
    } catch (e) {}
    return null;
  }
  return val;
}

async function loadTokenCaches() {
  // Always reload — do NOT skip with _tokenCachesLoaded flag
  // (stale caches cause binding failures across plugin runs)
  varCache = {};
  textStyleCache = {};
  effectStyleCache = {};

  // Load all pages (required for document access)
  try { await figma.loadAllPagesAsync(); } catch (e) {}

  // Load variables — try typed queries first, fallback to untyped
  var allColor = [];
  var allFloat = [];
  try { allColor = await figma.variables.getLocalVariablesAsync("COLOR"); } catch (e) {}
  try { allFloat = await figma.variables.getLocalVariablesAsync("FLOAT"); } catch (e) {}

  // Fallback 1: if typed queries return 0, try loading ALL variables (untyped)
  if (allColor.length === 0 && allFloat.length === 0) {
    console.log("[HTML→Figma] Typed variable queries returned 0, trying untyped...");
    try {
      var allVars = await figma.variables.getLocalVariablesAsync();
      for (var av = 0; av < allVars.length; av++) {
        if (allVars[av].resolvedType === "COLOR") allColor.push(allVars[av]);
        else if (allVars[av].resolvedType === "FLOAT") allFloat.push(allVars[av]);
      }
    } catch (e) {
      console.log("[HTML→Figma] Untyped variable query also failed: " + e.message);
    }
  }

  // Fallback 2: if still 0, try importing from team library collections
  if (allColor.length === 0 && allFloat.length === 0) {
    console.log("[HTML→Figma] No local variables found, trying team library...");
    try {
      var libCollections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
      console.log("[HTML→Figma] Found " + libCollections.length + " library variable collections");
      for (var lci = 0; lci < libCollections.length; lci++) {
        var libCol = libCollections[lci];
        console.log("[HTML→Figma] Loading library collection: " + libCol.name);
        var libVars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(libCol.key);
        for (var lvi = 0; lvi < libVars.length; lvi++) {
          try {
            var imported = await figma.variables.importVariableByKeyAsync(libVars[lvi].key);
            if (imported.resolvedType === "COLOR") allColor.push(imported);
            else if (imported.resolvedType === "FLOAT") allFloat.push(imported);
          } catch (e2) { /* skip failed imports */ }
        }
      }
    } catch (e) {
      console.log("[HTML→Figma] Team library fallback failed: " + (e.message || e));
    }
  }

  // Build collection name lookup — try multiple methods
  var colNameMap = {};
  try {
    var cols = await figma.variables.getLocalVariableCollectionsAsync();
    for (var ci = 0; ci < cols.length; ci++) colNameMap[cols[ci].id] = cols[ci].name.toLowerCase();
  } catch (e) {}
  // For library-imported variables: try resolving collection from variable itself
  var all = allColor.concat(allFloat);
  for (var vi = 0; vi < all.length; vi++) {
    var vc = all[vi].variableCollectionId;
    if (vc && !colNameMap[vc]) {
      try {
        var vcObj = await figma.variables.getVariableCollectionByIdAsync(vc);
        if (vcObj) colNameMap[vc] = vcObj.name.toLowerCase();
      } catch (e) { /* skip */ }
    }
  }
  console.log("[HTML→Figma] Collection names: " + JSON.stringify(colNameMap));

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

  // Load text styles — local first, then try remote/document styles
  var rawTextStyles = [];
  try {
    rawTextStyles = await figma.getLocalTextStylesAsync();
  } catch (e) {
    console.log("[HTML→Figma] getLocalTextStylesAsync failed: " + e.message);
  }
  // Fallback: scan document text nodes for used styles (catches library styles)
  if (rawTextStyles.length === 0) {
    console.log("[HTML→Figma] No local text styles, scanning document for library styles...");
    try {
      var textNodes = figma.root.findAllWithCriteria({ types: ["TEXT"] });
      var seenStyleIds = {};
      for (var tn = 0; tn < Math.min(textNodes.length, 500); tn++) {
        var tsId = textNodes[tn].textStyleId;
        if (tsId && typeof tsId === "string" && tsId !== "" && !seenStyleIds[tsId]) {
          seenStyleIds[tsId] = true;
          try {
            var tsObj = await figma.getStyleByIdAsync(tsId);
            if (tsObj && tsObj.type === "TEXT") rawTextStyles.push(tsObj);
          } catch (e3) { /* skip */ }
        }
      }
      console.log("[HTML→Figma] Found " + rawTextStyles.length + " text styles from document nodes");
    } catch (e) {
      console.log("[HTML→Figma] Document text style scan failed: " + (e.message || e));
    }
  }
  for (var s = 0; s < rawTextStyles.length; s++) {
    var st = rawTextStyles[s];
    var stName = st.name.toLowerCase();
    textStyleCache[stName] = st;
    // All format variants: "SP/Body" → "sp/body", "sp body", "sp-body"
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
    // Extra: "sp-body" format (prefix "sp" + hyphen + rest)
    // Handle case where Figma name is "SP/Body Medium" → index as "sp-body-medium"
    var fullHyphen = stName.replace(/\//g, "-").replace(/ /g, "-");
    if (!textStyleCache[fullHyphen]) textStyleCache[fullHyphen] = st;
    // Also no-space no-slash: "spbody" (unlikely but covers edge case)
    var noSep = stName.replace(/[\/ ]/g, "");
    if (!textStyleCache[noSep]) textStyleCache[noSep] = st;
  }

  // Load effect styles (shadows, glass, glow, rings)
  try {
    var effectStyles = await figma.getLocalEffectStylesAsync();
    for (var ei = 0; ei < effectStyles.length; ei++) {
      var es = effectStyles[ei];
      var esName = es.name.toLowerCase();
      effectStyleCache[esName] = es;
      var esHyp = esName.replace(/\//g, "-");
      var esSpc = esName.replace(/\//g, " ");
      if (!effectStyleCache[esHyp]) effectStyleCache[esHyp] = es;
      if (!effectStyleCache[esSpc]) effectStyleCache[esSpc] = es;
      var esParts = es.name.split("/");
      var esLast = esParts[esParts.length - 1].toLowerCase();
      if (!effectStyleCache[esLast]) effectStyleCache[esLast] = es;
    }
  } catch (e) {}

  // ── Build dynamic reverse-lookup maps from Figma foundation ──
  // These replace hardcoded maps — always in sync with actual Figma variables/styles
  try {

  // Find Dark mode ID from collections
  var _darkModeId = null;
  var _cols = cols || [];
  for (var dci = 0; dci < _cols.length; dci++) {
    for (var dmi = 0; dmi < cols[dci].modes.length; dmi++) {
      if (cols[dci].modes[dmi].name.toLowerCase() === "dark") {
        _darkModeId = cols[dci].modes[dmi].modeId;
        break;
      }
    }
    if (_darkModeId) break;
  }
  // Fallback: first mode of first collection
  if (!_darkModeId && _cols.length > 0 && _cols[0].modes.length > 0) {
    _darkModeId = _cols[0].modes[0].modeId;
  }

  // 1. COLOR reverse map: resolve variable values → rgb string → token name
  if (_darkModeId && allColor.length > 0) {
    // Clear hardcoded map — dynamic data is authoritative
    COLOR_RGB_TO_TOKEN = {};
    for (var crci = 0; crci < allColor.length; crci++) {
      var crv = allColor[crci];
      var crval = await _resolveVarValue(crv, _darkModeId, 0);
      if (crval && typeof crval.r === "number") {
        var crr = Math.round(crval.r * 255);
        var crg = Math.round(crval.g * 255);
        var crb = Math.round(crval.b * 255);
        var crkey = crr + "," + crg + "," + crb;
        var crparts = crv.name.split("/");
        var crtoken = crparts[crparts.length - 1].toLowerCase().replace(/ /g, "-");
        // First variable wins — semantic tokens (e.g. "foreground") take priority over raw (e.g. "zinc-50")
        if (!COLOR_RGB_TO_TOKEN[crkey]) COLOR_RGB_TO_TOKEN[crkey] = crtoken;
      }
    }
    console.log("[HTML→Figma] Dynamic color map: " + Object.keys(COLOR_RGB_TO_TOKEN).length + " rgb→token entries");
  }

  // 2. FLOAT reverse maps: resolve variable values → px → token name
  var _spacingCollNames = ["spacing", "space", "size"];
  var _radiusCollNames = ["border radius", "radius", "border-radius"];
  if (allFloat.length > 0) {
    // Clear hardcoded maps
    SPACING_PX_TO_TOKEN = {};
    RADIUS_PX_TO_TOKEN = {};
    for (var frci = 0; frci < allFloat.length; frci++) {
      var frv = allFloat[frci];
      var frColName = (colNameMap[frv.variableCollectionId] || "").toLowerCase();
      var frModeKeys = Object.keys(frv.valuesByMode);
      if (frModeKeys.length === 0) continue;
      var frModeId = frModeKeys[0];
      var frval = await _resolveVarValue(frv, frModeId, 0);
      if (typeof frval !== "number") continue;
      var frparts = frv.name.split("/");
      var frtoken = frparts[frparts.length - 1].toLowerCase().replace(/ /g, "-");
      var frpx = Math.round(frval);
      var isSpacingColl = false;
      var isRadiusColl = false;
      for (var sci = 0; sci < _spacingCollNames.length; sci++) {
        if (frColName.indexOf(_spacingCollNames[sci]) >= 0) { isSpacingColl = true; break; }
      }
      for (var rci2 = 0; rci2 < _radiusCollNames.length; rci2++) {
        if (frColName.indexOf(_radiusCollNames[rci2]) >= 0) { isRadiusColl = true; break; }
      }
      if (isSpacingColl) {
        if (!SPACING_PX_TO_TOKEN[frpx]) SPACING_PX_TO_TOKEN[frpx] = frtoken;
      } else if (isRadiusColl) {
        if (!RADIUS_PX_TO_TOKEN[frpx]) RADIUS_PX_TO_TOKEN[frpx] = frtoken;
      }
    }
    console.log("[HTML→Figma] Dynamic spacing map: " + JSON.stringify(SPACING_PX_TO_TOKEN));
    console.log("[HTML→Figma] Dynamic radius map: " + JSON.stringify(RADIUS_PX_TO_TOKEN));
  }

  // 3. Text style reverse map: read font properties from each style → build matching rules
  var _fontStyleReverse = {
    "Thin": 100, "ExtraLight": 200, "Extra Light": 200, "Light": 300, "Regular": 400,
    "Medium": 500, "SemiBold": 600, "Semi Bold": 600, "DemiBold": 600, "Demi Bold": 600,
    "Bold": 700, "ExtraBold": 800, "Extra Bold": 800, "Black": 900, "Heavy": 900,
  };
  if (rawTextStyles.length > 0) {
    TEXT_STYLE_RULES = [];
    for (var tsri = 0; tsri < rawTextStyles.length; tsri++) {
      var tsr = rawTextStyles[tsri];
      try {
        var tsFn = tsr.fontName;
        if (!tsFn || !tsFn.family) continue;
        var tsWeight = _fontStyleReverse[tsFn.style] || 400;
        var tsFontSize = tsr.fontSize || 14;
        var tsStyleName = tsr.name.toLowerCase().replace(/\//g, "-").replace(/ /g, "-");
        TEXT_STYLE_RULES.push({
          family: new RegExp(tsFn.family.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
          weight: tsWeight,
          minSize: tsFontSize - 1,
          maxSize: tsFontSize + 1,
          style: tsStyleName,
        });
      } catch (e) {}
    }
    console.log("[HTML→Figma] Dynamic text style rules: " + TEXT_STYLE_RULES.length + " entries (from " + rawTextStyles.length + " styles)");
  }

  } catch (reverseMapErr) {
    console.log("[HTML→Figma] WARNING: Dynamic reverse map building failed: " + reverseMapErr.message);
    // Continue — basic varCache/textStyleCache/effectStyleCache still work
  }

  _tokenCachesLoaded = true;
  // Diagnostic logging
  console.log("[HTML→Figma] Cache loaded: COLOR=" + allColor.length + " FLOAT=" + allFloat.length + " textStyles=" + rawTextStyles.length + " effectStyles=" + Object.keys(effectStyleCache).length);
  console.log("[HTML→Figma] Reverse maps: colors=" + Object.keys(COLOR_RGB_TO_TOKEN).length + " spacing=" + Object.keys(SPACING_PX_TO_TOKEN).length + " radius=" + Object.keys(RADIUS_PX_TO_TOKEN).length + " textRules=" + TEXT_STYLE_RULES.length);
}

function findVar(name, preferredPrefix) {
  if (!name) return null;
  var lower = name.toLowerCase();
  var hyp = lower.replace(/ /g, "-");
  var spc = lower.replace(/-/g, " ");

  // Step 1: try preferred prefixes first (most specific)
  if (preferredPrefix) {
    var ppArr = Array.isArray(preferredPrefix) ? preferredPrefix : [preferredPrefix];
    for (var pp = 0; pp < ppArr.length; pp++) {
      if (varCache[ppArr[pp] + lower]) return varCache[ppArr[pp] + lower];
      if (varCache[ppArr[pp] + hyp]) return varCache[ppArr[pp] + hyp];
      if (varCache[ppArr[pp] + spc]) return varCache[ppArr[pp] + spc];
    }
    // Fall through to direct name lookup (don't return null)
  }

  // Step 2: direct name lookup
  if (varCache[lower]) return varCache[lower];
  if (varCache[hyp]) return varCache[hyp];
  if (varCache[spc]) return varCache[spc];

  // Step 3: try all known collection prefixes
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

  // Step 4: token aliases (CSS name → Figma variable name)
  var TOKEN_ALIASES = {
    "brand": "primary", "brand-foreground": "primary-foreground",
    "primary": "brand", "primary-foreground": "brand-foreground",
    "card-foreground": "foreground",
  };
  if (TOKEN_ALIASES[lower]) {
    var alias = TOKEN_ALIASES[lower];
    if (varCache[alias]) return varCache[alias];
    for (var ai = 0; ai < prefixes.length; ai++) {
      if (varCache[prefixes[ai] + alias]) return varCache[prefixes[ai] + alias];
    }
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
  if (typeof opacity === "number" && opacity < 1) paint.opacity = opacity;
  return paint;
}

// Set fill with variable binding. tokenName = "primary", "primary/50", "card", etc.
function setFillToken(node, tokenName, fallbackRGBA) {
  // Auto-resolve token from rgba if not provided
  if (!tokenName && fallbackRGBA) tokenName = resolveColorToken(fallbackRGBA);
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
  // Auto-resolve token from rgba if not provided
  if (!tokenName && fallbackRGBA) tokenName = resolveColorToken(fallbackRGBA);
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

// Built-in px → token maps (plugin resolves tokens itself, no dependency on JSON token fields)
var SPACING_PX_TO_TOKEN = {
  0: "none", 2: "4xs", 4: "3xs", 6: "2xs", 8: "xs",
  12: "sm", 16: "md", 20: "lg", 24: "xl", 32: "2xl",
  40: "3xl", 48: "4xl", 56: "5xl", 64: "6xl"
};
var RADIUS_PX_TO_TOKEN = {
  0: "none", 4: "sm", 6: "md", 8: "lg",
  10: "10", 12: "xl", 16: "2xl", 24: "3xl", 9999: "full"
};

function resolveSpacingToken(tokenName, fallbackPx) {
  // 1) Explicit token from JSON
  if (tokenName) return tokenName;
  // 2) Auto-resolve from px value
  if (typeof fallbackPx === "number") {
    var exact = SPACING_PX_TO_TOKEN[fallbackPx];
    if (exact) return exact;
    // Nearest within 2px tolerance
    var keys = Object.keys(SPACING_PX_TO_TOKEN);
    for (var k = 0; k < keys.length; k++) {
      if (Math.abs(Number(keys[k]) - fallbackPx) <= 2) return SPACING_PX_TO_TOKEN[keys[k]];
    }
  }
  return null;
}

function resolveRadiusToken(tokenName, fallbackPx) {
  if (tokenName) return tokenName;
  if (typeof fallbackPx === "number") {
    var exact = RADIUS_PX_TO_TOKEN[fallbackPx];
    if (exact) return exact;
    var keys = Object.keys(RADIUS_PX_TO_TOKEN);
    for (var k = 0; k < keys.length; k++) {
      if (Math.abs(Number(keys[k]) - fallbackPx) <= 2) return RADIUS_PX_TO_TOKEN[keys[k]];
    }
  }
  return null;
}

function bindSpacing(node, field, tokenName, fallbackPx) {
  var effectiveToken = resolveSpacingToken(tokenName, fallbackPx);
  if (!effectiveToken) { try { node[field] = fallbackPx; } catch (e) {} return; }
  var v = findSpacingVar(effectiveToken);
  if (v) {
    try {
      node[field] = fallbackPx; // Set value first so layout works
      node.setBoundVariable(field, v);
      return;
    } catch (e) {
      console.log("[HTML→Figma] bindSpacing FAILED: " + field + "=" + effectiveToken + " → " + e.message);
    }
  } else {
    console.log("[HTML→Figma] MISS spacing var: '" + effectiveToken + "' for " + field + " on '" + (node.name || "?") + "' (fallback=" + fallbackPx + "px)");
  }
  try { node[field] = fallbackPx; } catch (e) {}
}

function bindRadius(node, field, tokenName, fallbackPx) {
  var effectiveToken = resolveRadiusToken(tokenName, fallbackPx);
  if (!effectiveToken) { try { node[field] = fallbackPx; } catch (e) {} return; }
  var v = findRadiusVar(effectiveToken);
  if (v) {
    try {
      node[field] = fallbackPx;
      node.setBoundVariable(field, v);
      return;
    } catch (e) {
      console.log("[HTML→Figma] bindRadius FAILED: " + field + "=" + effectiveToken + " → " + e.message);
    }
  } else {
    console.log("[HTML→Figma] MISS radius var: '" + effectiveToken + "' for " + field + " on '" + (node.name || "?") + "' (fallback=" + fallbackPx + "px)");
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
      // Treat unknown types (card, card-header, card-content, etc. from data-slot) as frames
      if (node.children || node.layout) {
        return await createFrame(node);
      }
      return null;
  }
}

// ── Frame ──

// ── Reconciliation: in-place update instead of recreate ──

// Check if existing Figma node can be updated in place for given spec
function canReconcile(existing, spec) {
  var specType = spec.type || "frame";
  // Treat unknown types with children as frame
  if (!spec.type && (spec.children || spec.layout)) specType = "frame";
  if (specType === "frame" && existing.type === "FRAME") return true;
  if (specType === "text" && existing.type === "TEXT") return true;
  // Instance, icon, separator, image, svg, placeholder — replace
  return false;
}

// Update existing frame properties in place (mirrors createFrame logic)
async function updateFrameProps(frame, spec) {
  frame.name = spec.name || frame.name;

  // Size
  var w = spec.width || frame.width;
  var h = spec.height || frame.height;
  frame.resize(w, h);

  // Auto layout
  if (spec.layout === "horizontal" || spec.layout === "vertical") {
    frame.layoutMode = spec.layout === "horizontal" ? "HORIZONTAL" : "VERTICAL";
    bindSpacing(frame, "itemSpacing", spec.gapToken || null, spec.gap || 0);
    bindSpacing(frame, "paddingTop", spec.paddingTopToken, spec.paddingTop || 0);
    bindSpacing(frame, "paddingRight", spec.paddingRightToken, spec.paddingRight || 0);
    bindSpacing(frame, "paddingBottom", spec.paddingBottomToken, spec.paddingBottom || 0);
    bindSpacing(frame, "paddingLeft", spec.paddingLeftToken, spec.paddingLeft || 0);

    var justifyMap = { "start": "MIN", "center": "CENTER", "end": "MAX", "space-between": "SPACE_BETWEEN" };
    var alignMap = { "start": "MIN", "center": "CENTER", "end": "MAX", "stretch": "STRETCH" };
    frame.primaryAxisAlignItems = justifyMap[spec.primaryAlign] || "MIN";
    frame.counterAxisAlignItems = alignMap[spec.counterAlign] || "MIN";
    if (spec.wrap) frame.layoutWrap = "WRAP";
    frame.primaryAxisSizingMode = "AUTO";
    frame.counterAxisSizingMode = "FIXED";
  }

  // Fill
  if (spec.backgroundImage) {
    try {
      var bgBase64 = spec.backgroundImage.replace(/^data:image\/\w+;base64,/, "");
      var bgBytes = figma.base64Decode(bgBase64);
      var bgImg = figma.createImage(bgBytes);
      frame.fills = [{ type: "IMAGE", scaleMode: "FILL", imageHash: bgImg.hash }];
    } catch (e) {
      setFillToken(frame, spec.fillToken, spec.fill);
    }
  } else if (spec.fill) {
    setFillToken(frame, spec.fillToken, spec.fill);
  } else {
    frame.fills = [];
  }

  // Stroke
  if (spec.strokeToken || spec.stroke) {
    setStrokeToken(frame, spec.strokeToken, spec.stroke);
    frame.strokeWeight = spec.strokeWidth || 1;
  } else {
    frame.strokes = [];
  }

  // Radius
  if (typeof spec.radius === "number") {
    bindRadius(frame, "cornerRadius", spec.radiusToken && typeof spec.radiusToken === "string" ? spec.radiusToken : null, Math.min(spec.radius, 9999));
  } else if (typeof spec.radius === "object" && spec.radius) {
    if (spec.radiusToken && typeof spec.radiusToken === "object") {
      bindRadius(frame, "topLeftRadius", spec.radiusToken.topLeft, spec.radius.topLeft || 0);
      bindRadius(frame, "topRightRadius", spec.radiusToken.topRight, spec.radius.topRight || 0);
      bindRadius(frame, "bottomLeftRadius", spec.radiusToken.bottomLeft, spec.radius.bottomLeft || 0);
      bindRadius(frame, "bottomRightRadius", spec.radiusToken.bottomRight, spec.radius.bottomRight || 0);
    } else {
      bindRadius(frame, "topLeftRadius", null, spec.radius.topLeft || 0);
      bindRadius(frame, "topRightRadius", null, spec.radius.topRight || 0);
      bindRadius(frame, "bottomLeftRadius", null, spec.radius.bottomLeft || 0);
      bindRadius(frame, "bottomRightRadius", null, spec.radius.bottomRight || 0);
    }
  } else {
    bindRadius(frame, "cornerRadius", "none", 0);
  }

  // Effect style
  if (spec.shadowToken) await applyEffectStyle(frame, spec.shadowToken);

  // Opacity
  if (spec.opacity !== undefined && spec.opacity !== 1) {
    frame.opacity = spec.opacity;
  } else {
    frame.opacity = 1;
  }

  // Clip
  frame.clipsContent = !!(spec.overflow === "hidden" || spec.clipsContent);
}

// Update existing text node in place (mirrors createText logic)
async function updateTextProps(text, spec) {
  var textStyleName = spec.textStyle || resolveTextStyleName(spec.fontFamily, spec.fontWeight, spec.fontSize);
  var styleApplied = false;
  if (textStyleName) {
    var ts = findTextStyleByName(textStyleName);
    if (ts) {
      try {
        await figma.loadFontAsync(ts.fontName);
        await text.setTextStyleIdAsync(ts.id);
        styleApplied = true;
      } catch (e) {}
    }
  }
  if (!styleApplied) {
    var family = spec.fontFamily || "Inter";
    var weight = spec.fontWeight || 400;
    var fontName = await loadFont(family, weight);
    text.fontName = fontName;
    text.fontSize = spec.fontSize || 14;
    if (spec.lineHeight && spec.lineHeight > 0) {
      text.lineHeight = { value: spec.lineHeight, unit: "PIXELS" };
    }
  }

  var newContent = spec.textContent || spec.text || "";
  if (text.characters !== newContent) {
    text.characters = newContent;
  }

  var colorToken = spec.colorToken || resolveColorToken(spec.color);
  if (colorToken) {
    setFillToken(text, colorToken, spec.color);
  } else if (spec.color) {
    var paint = makeSolidPaint(spec.color);
    if (paint) text.fills = [paint];
  }

  if (spec.textAlign) {
    var tmap = { "left": "LEFT", "center": "CENTER", "right": "RIGHT", "justify": "JUSTIFIED" };
    text.textAlignHorizontal = tmap[spec.textAlign] || "LEFT";
  }

  if (spec.fillWidth) {
    text.textAutoResize = "HEIGHT";
  } else {
    text.textAutoResize = "WIDTH_AND_HEIGHT";
  }

  var content = newContent.substring(0, 30);
  text.name = content || "Text";
}

/**
 * Reconcile children of a parent frame with spec children.
 * Match by name → update in place. Create new if missing. Remove if extra.
 */
async function reconcileChildren(parent, childSpecs, parentLayout) {
  childSpecs = childSpecs || [];

  // Build name→[node] map of existing children
  var existingByName = {};
  var allExisting = [];
  for (var i = 0; i < parent.children.length; i++) {
    var ch = parent.children[i];
    allExisting.push(ch);
    var key = ch.name;
    if (!existingByName[key]) existingByName[key] = [];
    existingByName[key].push(ch);
  }

  var matchedSet = []; // nodes that were matched and kept
  var resultOrder = []; // final desired order of children

  for (var si = 0; si < childSpecs.length; si++) {
    var spec = childSpecs[si];
    var specName = spec.name || (spec.textContent || spec.text || "").substring(0, 30) || spec.type || "Frame";

    // Find matching existing child by name
    var candidates = existingByName[specName];
    var matched = null;
    if (candidates && candidates.length > 0) {
      matched = candidates.shift();
    }

    if (matched && canReconcile(matched, spec)) {
      // ── Update in place ──
      matchedSet.push(matched);
      if (matched.type === "FRAME") {
        await updateFrameProps(matched, spec);
        await reconcileChildren(matched, spec.children || [], spec.layout);
      } else if (matched.type === "TEXT") {
        await updateTextProps(matched, spec);
      }
      applySizing(matched, spec, parentLayout);
      resultOrder.push(matched);
    } else {
      // ── Create new (no match or incompatible type) ──
      var newNode = await createNode(spec, parentLayout);
      if (newNode) {
        parent.appendChild(newNode);
        applySizing(newNode, spec, parentLayout);
        resultOrder.push(newNode);
      }
    }
  }

  // Remove unmatched old children
  for (var ri = allExisting.length - 1; ri >= 0; ri--) {
    if (matchedSet.indexOf(allExisting[ri]) === -1) {
      try { allExisting[ri].remove(); } catch (e) {}
    }
  }

  // Reorder children to match spec order
  for (var oi = 0; oi < resultOrder.length; oi++) {
    try { parent.insertChild(oi, resultOrder[oi]); } catch (e) {}
  }
}

// ── Original createFrame (for new nodes only) ──

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
      // Background image failed — fall through to fill token
      setFillToken(frame, node.fillToken, node.fill);
    }
  } else if (node.fill) {
    // setFillToken auto-resolves color token from rgba
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

// ── Text style auto-resolution from font properties ──
var TEXT_STYLE_RULES = [
  // Headings (Plus Jakarta Sans)
  { family: /Plus Jakarta/i, weight: 700, minSize: 29, maxSize: 32, style: "sp-h1" },
  { family: /Plus Jakarta/i, weight: 700, minSize: 23, maxSize: 25, style: "sp-h2" },
  { family: /Plus Jakarta/i, weight: 700, minSize: 19, maxSize: 21, style: "sp-h3" },
  { family: /Plus Jakarta/i, weight: 600, minSize: 15, maxSize: 17, style: "sp-h4" },
  { family: /Plus Jakarta/i, weight: 600, minSize: 13, maxSize: 15, style: "sp-h5" },
  // Body (Inter)
  { family: /Inter/i, weight: 400, minSize: 13, maxSize: 15, style: "sp-body" },
  { family: /Inter/i, weight: 500, minSize: 13, maxSize: 15, style: "sp-body-medium" },
  { family: /Inter/i, weight: 600, minSize: 13, maxSize: 15, style: "sp-body-semibold" },
  { family: /Inter/i, weight: 700, minSize: 13, maxSize: 15, style: "sp-body-bold" },
  // Label (Inter 500 12px)
  { family: /Inter/i, weight: 500, minSize: 11, maxSize: 13, style: "sp-label" },
  // Caption (Inter 400 12px)
  { family: /Inter/i, weight: 400, minSize: 11, maxSize: 13, style: "sp-caption" },
  // Caption Medium (Inter 500 11px)
  { family: /Inter/i, weight: 500, minSize: 10, maxSize: 12, style: "sp-caption-medium" },
  // Data/KPI
  { family: /Plus Jakarta/i, weight: 800, minSize: 35, maxSize: 50, style: "sp-kpi-xl" },
  { family: /Plus Jakarta/i, weight: 700, minSize: 23, maxSize: 31, style: "sp-kpi-lg" },
  { family: /Plus Jakarta/i, weight: 700, minSize: 19, maxSize: 23, style: "sp-kpi-md" },
  { family: /Plus Jakarta/i, weight: 600, minSize: 15, maxSize: 19, style: "sp-kpi-sm" },
  // Mono (JetBrains Mono)
  { family: /JetBrains/i, weight: 400, minSize: 11, maxSize: 15, style: "sp-mono" },
  { family: /JetBrains/i, weight: 500, minSize: 11, maxSize: 15, style: "sp-mono-medium" },
];

function resolveTextStyleName(fontFamily, fontWeight, fontSize) {
  if (!fontFamily) return null;
  var fam = String(fontFamily);
  var w = fontWeight || 400;
  var sz = fontSize || 14;
  // Exact match
  for (var i = 0; i < TEXT_STYLE_RULES.length; i++) {
    var r = TEXT_STYLE_RULES[i];
    if (r.family.test(fam) && r.weight === w && sz >= r.minSize && sz <= r.maxSize) return r.style;
  }
  // Fuzzy: weight within 100
  for (var j = 0; j < TEXT_STYLE_RULES.length; j++) {
    var r2 = TEXT_STYLE_RULES[j];
    if (r2.family.test(fam) && Math.abs(r2.weight - w) <= 100 && sz >= r2.minSize && sz <= r2.maxSize) return r2.style;
  }
  return null;
}

// ── Color auto-resolution from rgba → semantic token ──
// Dark mode: computed rgb values → token names
var COLOR_RGB_TO_TOKEN = {
  "250,250,250": "foreground",       // zinc-50
  "161,161,170": "muted-foreground", // zinc-400
  "124,58,237": "primary",           // violet-600
  "20,20,24": "card",                // #141418
  "12,12,16": "background",          // #0c0c10
  "39,39,42": "border",              // zinc-800
  "24,24,27": "muted",               // zinc-900
  "113,113,122": "foreground-subtle", // zinc-500
  "9,9,11": "card-subtle",           // zinc-950
  "82,82,91": "input",               // zinc-600
  "109,40,217": "ring",              // violet-700
  "220,38,38": "destructive",        // red-600
  "239,68,68": "destructive",        // red-500
  "22,163,74": "success",            // green-600
  "217,119,6": "warning",            // amber-600
  "37,99,235": "emphasis",           // blue-600
  "255,255,255": "foreground",       // pure white
};

function resolveColorToken(colorStr) {
  if (!colorStr) return null;
  var m = String(colorStr).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  var r = parseInt(m[1]), g = parseInt(m[2]), b = parseInt(m[3]);
  var a = m[4] !== undefined ? parseFloat(m[4]) : 1;
  if (a === 0) return null; // fully transparent
  var key = r + "," + g + "," + b;
  var token = COLOR_RGB_TO_TOKEN[key];
  if (token) {
    if (a < 1 && a > 0) return token + "/" + Math.round(a * 100);
    return token;
  }
  return null;
}

// ── Text ──

async function createText(node, parentLayout) {
  const text = figma.createText();

  // Resolve text style: explicit JSON field → auto-resolve from font properties
  var textStyleName = node.textStyle || resolveTextStyleName(node.fontFamily, node.fontWeight, node.fontSize);
  var styleApplied = false;
  if (textStyleName) {
    var ts = findTextStyleByName(textStyleName);
    if (ts) {
      try {
        await figma.loadFontAsync(ts.fontName);
        await text.setTextStyleIdAsync(ts.id);
        styleApplied = true;
      } catch (e) {
        console.log("[HTML→Figma] ✗ text style '" + textStyleName + "' FAILED: " + e.message);
      }
    } else {
      console.log("[HTML→Figma] MISS text style: '" + textStyleName + "' for '" + (node.textContent || "").substring(0, 20) + "'");
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

  // Color — explicit JSON token → auto-resolve from rgba → raw fallback
  var colorToken = node.colorToken || resolveColorToken(node.color);
  if (colorToken) {
    setFillToken(text, colorToken, node.color);
  } else if (node.color) {
    const paint = makeSolidPaint(node.color);
    if (paint) text.fills = [paint];
  }

  // Text align
  if (node.textAlign) {
    const map = { "left": "LEFT", "center": "CENTER", "right": "RIGHT", "justify": "JUSTIFIED" };
    text.textAlignHorizontal = map[node.textAlign] || "LEFT";
  }

  // Sizing: HUG by default, HEIGHT only when fillWidth
  if (node.fillWidth) {
    text.textAutoResize = "HEIGHT";
  } else {
    text.textAutoResize = "WIDTH_AND_HEIGHT";
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

  // Normalize: node.src with data URI → treat as imageBase64
  var imgBase64 = node.imageBase64 || (node.src && node.src.startsWith("data:image") ? node.src : null);

  if (imgBase64) {
    try {
      // Extract base64 data
      const base64 = imgBase64.replace(/^data:image\/\w+;base64,/, "");
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

  // Handle SVG icons — find existing components and swap into icon slots
  if (node.svgIcons && node.svgIcons.length > 0) {
    for (var si = 0; si < node.svgIcons.length; si++) {
      var svgIcon = node.svgIcons[si];
      var iconName = svgIcon.name;

      // Skip generic "Icon" default — these are unidentified SVGs (e.g. custom logos)
      // that shouldn't create standalone "Icon / Icon" components
      if (!iconName || iconName === "Icon") continue;

      // Try "Icon / Name" (foundation icons) first, then "Logo / Name" fallback
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
  var isText = figmaNode.type === "TEXT";
  var hasLayout = !isInstance && !isText && figmaNode.layoutMode && figmaNode.layoutMode !== "NONE";

  if (isText) {
    // Text sizing is driven by textAutoResize, set in createText()
    // FILL = fill parent width, text wraps (textAutoResize=HEIGHT)
    // HUG = shrink to content (textAutoResize=WIDTH_AND_HEIGHT)
    if (dataNode.fillWidth) {
      figmaNode.layoutSizingHorizontal = "FILL";
      figmaNode.textAutoResize = "HEIGHT";
    } else {
      figmaNode.layoutSizingHorizontal = "HUG";
      figmaNode.textAutoResize = "WIDTH_AND_HEIGHT";
    }
    figmaNode.layoutSizingVertical = dataNode.fillHeight ? "FILL" : "HUG";
    return;
  }

  // Sizing: use explicit flags from DOM walker
  // fillWidth/fillHeight = FILL (flex-grow, width:100%)
  // hugWidth/hugHeight = HUG (content-sized, no explicit width/height)
  // otherwise = FIXED (explicit width/height set in CSS)
  if (dataNode.fillWidth) {
    figmaNode.layoutSizingHorizontal = "FILL";
  } else if (dataNode.hugWidth) {
    figmaNode.layoutSizingHorizontal = "HUG";
  } else {
    figmaNode.layoutSizingHorizontal = "FIXED";
  }

  if (dataNode.fillHeight) {
    figmaNode.layoutSizingVertical = "FILL";
  } else if (dataNode.hugHeight) {
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

var VISUAL_PAGE_NAME = "\ud83d\udcf1 Visual";

function ensureVisualPage() {
  // Find or create the target page, then switch to it
  var pages = figma.root.children;
  for (var i = 0; i < pages.length; i++) {
    if (pages[i].name === VISUAL_PAGE_NAME) {
      figma.currentPage = pages[i];
      return;
    }
  }
  // Create new page
  var newPage = figma.createPage();
  newPage.name = VISUAL_PAGE_NAME;
  figma.currentPage = newPage;
}

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

// ── Apply dark mode to a frame (set all variable collections to Dark mode) ──
async function applyDarkMode(node) {
  try {
    var cols = await figma.variables.getLocalVariableCollectionsAsync();
    for (var i = 0; i < cols.length; i++) {
      var c = cols[i];
      for (var j = 0; j < c.modes.length; j++) {
        if (c.modes[j].name.toLowerCase() === "dark") {
          node.setExplicitVariableModeForCollection(c.id, c.modes[j].modeId);
          break;
        }
      }
    }
  } catch (e) {
    console.log("[HTML→Figma] WARN: Failed to set dark mode: " + e.message);
  }
}

// ── Message handler ──

// State for multi-breakpoint responsive generation
var _responsiveFrames = [];
var _responsiveX = 0;
var _responsiveTotalNodes = 0;

figma.ui.onmessage = async (msg) => {
  // Ensure token caches are loaded before any generation
  // Only load once per session: on "generate" or "responsive-start" (NOT on every "responsive-frame")
  if (msg.type === "generate" || msg.type === "responsive-start") {
    try {
      await loadTokenCaches();
    } catch (cacheErr) {
      console.log("[HTML→Figma] WARNING: loadTokenCaches failed: " + cacheErr.message + "\n" + cacheErr.stack);
    }
    // Switch to Visual page once at the start
    ensureVisualPage();
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
        // Reconcile: update frame props + children in place
        await updateFrameProps(existing, root);
        await reconcileChildren(existing, root.children || [], root.layout);

        // Apply dark mode to frame
        await applyDarkMode(existing);

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

        // Apply dark mode to frame
        await applyDarkMode(rootNode);

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

      console.log("[HTML→Figma] responsive-frame: tree has " + (tree.children ? tree.children.length : 0) + " children, layout=" + tree.layout + ", type=" + tree.type);
      var rootNode;
      if (existingFrame) {
        // Reconcile: update frame props + children in place
        rootNode = existingFrame;
        console.log("[HTML→Figma] RECONCILE path: '" + frameName + "' has " + rootNode.children.length + " existing children");
        await updateFrameProps(rootNode, tree);
        await reconcileChildren(rootNode, tree.children || [], tree.layout);
        console.log("[HTML→Figma] Reconciled — now " + rootNode.children.length + " children");
      } else {
        // Create new
        console.log("[HTML→Figma] NEW path: creating full tree");
        rootNode = await createNode(tree);
        if (!rootNode) {
          console.log("[HTML→Figma] ERROR: createNode returned null for root");
          figma.ui.postMessage({ type: "frame-done" });
          return;
        }
        rootNode.name = frameName;
        console.log("[HTML→Figma] Created root '" + frameName + "' with " + rootNode.children.length + " children");
      }

      // Ensure root has vertical auto-layout
      if (rootNode.layoutMode === "NONE" || !rootNode.layoutMode) {
        rootNode.layoutMode = "VERTICAL";
        rootNode.counterAxisAlignItems = "MIN";
        rootNode.primaryAxisAlignItems = "MIN";
      }

      // Width = FIXED, Height depends on layout direction
      if (rootNode.layoutMode === "VERTICAL") {
        rootNode.counterAxisSizingMode = "FIXED";
        rootNode.primaryAxisSizingMode = "AUTO";
      } else {
        // HORIZONTAL: both axes FIXED so FILL children stretch properly
        rootNode.primaryAxisSizingMode = "FIXED";
        rootNode.counterAxisSizingMode = "FIXED";
      }
      rootNode.resize(bpWidth, Math.max(rootNode.height || 100, minH));
      rootNode.minHeight = minH;

      if (!existingFrame) {
        // Position side by side (only for new frames)
        rootNode.x = _responsiveX;
        rootNode.y = 0;
      }
      _responsiveX = rootNode.x + bpWidth + 100;

      // Apply dark mode to frame
      await applyDarkMode(rootNode);

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
