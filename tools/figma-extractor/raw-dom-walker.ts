/**
 * Raw DOM Walker — Extracts DOM with RAW pixel values
 *
 * Unlike the token-mapped dom-walker.ts, this outputs:
 * - Raw rgba() colors (no token mapping)
 * - Raw px values for spacing/radius (no token snapping)
 * - SVG innerHTML for illustrations (createNodeFromSvg)
 * - Base64 screenshots for charts/complex visuals
 *
 * Output format matches the "HTML to Figma" plugin's createNode() API.
 */

export interface RawExtractedNode {
  type: "frame" | "text" | "icon" | "image" | "svg" | "instance" | "separator" | "placeholder"
  name?: string
  // Frame
  layout?: "horizontal" | "vertical"
  gap?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  primaryAlign?: string
  counterAlign?: string
  wrap?: boolean
  wrapGap?: number
  // Sizing
  width?: number
  height?: number
  fillWidth?: boolean
  fillHeight?: boolean
  hugWidth?: boolean
  hugHeight?: boolean
  selfAlign?: "center" | "end"  // per-child cross-axis alignment (mx-auto → center)
  // Visual
  fill?: string          // raw rgba
  stroke?: string        // raw rgba
  strokeWidth?: number
  radius?: number | { topLeft: number; topRight: number; bottomLeft: number; bottomRight: number }
  opacity?: number
  overflow?: string
  clipsContent?: boolean
  shadow?: string        // raw CSS box-shadow value
  position?: "absolute"  // absolute positioned overlay (modal, toast, decorative background)
  x?: number             // absolute x position (viewport-relative)
  y?: number             // absolute y position (viewport-relative)
  rightMargin?: number   // margin from right edge (for MAX constraint positioning)
  bottomMargin?: number  // margin from bottom edge (for MAX constraint positioning)
  constraints?: { horizontal: string; vertical: string }  // Figma constraints for absolute elements
  backgroundSelector?: string  // CSS selector for background screenshot (decorative effects)
  backgroundImage?: string     // base64 screenshot of decorative background (filled by extractor)
  // Text
  textContent?: string
  text?: string
  fontFamily?: string
  fontWeight?: number
  fontSize?: number
  lineHeight?: number
  color?: string         // raw rgba
  textAlign?: string
  // Image
  src?: string
  imageBase64?: string
  objectFit?: string
  selector?: string
  // SVG
  svgContent?: string
  // Instance (DS component)
  component?: string
  variants?: Record<string, string>
  textOverrides?: Record<string, string>
  // Children
  children?: RawExtractedNode[]
  // Token mappings (added by post-processor)
  fillToken?: string       // semantic color token for fill (e.g. "card", "primary/10")
  strokeToken?: string     // semantic color token for stroke (e.g. "border")
  colorToken?: string      // semantic color token for text color (e.g. "foreground", "primary")
  gapToken?: string        // spacing token for gap (e.g. "md", "xs")
  paddingTopToken?: string
  paddingRightToken?: string
  paddingBottomToken?: string
  paddingLeftToken?: string
  radiusToken?: string | { topLeft: string; topRight: string; bottomLeft: string; bottomRight: string }
  shadowToken?: string     // effect style name (e.g. "Shadow/sm", "Shadow/md")
  textStyle?: string       // text style name (e.g. "sp-body", "sp-h2")
  // Debug
  tagName?: string
}

/**
 * Raw DOM walker script — runs in browser context via page.evaluate()
 * Returns pixel-perfect node tree for the HTML to Figma plugin
 */
export const RAW_DOM_WALKER_SCRIPT = `
() => {
  const SKIP_TAGS = new Set([
    "SCRIPT", "STYLE", "LINK", "META", "HEAD", "NOSCRIPT",
    "TEMPLATE", "SLOT", "PORTAL",
  ]);

  const INLINE_TAGS = new Set([
    "A", "SPAN", "STRONG", "EM", "B", "I", "U", "SMALL",
    "MARK", "SUB", "SUP", "CODE", "ABBR", "BR",
  ]);

  // Container DS components — recurse into children
  const CONTAINER_COMPONENTS = new Set([
    "Card", "Dialog", "Sheet", "Drawer", "Collapsible", "Accordion",
    "Screen", "Illustration", "Tabs",
  ]);

  // ── Helpers ──

  // Canvas-based color normalization (oklab/oklch → rgba)
  const _cc = document.createElement("canvas");
  _cc.width = 1; _cc.height = 1;
  const _ctx = _cc.getContext("2d");

  function normalizeColor(str) {
    if (!str || str === "rgba(0, 0, 0, 0)" || str === "transparent") return null;
    if (str === "rgb(0, 0, 0)" || str === "rgba(0, 0, 0, 1)") {
      // Could be actual black — keep it
      return str;
    }
    if (str.startsWith("rgb")) return str;
    if (_ctx) {
      _ctx.clearRect(0, 0, 1, 1);
      _ctx.fillStyle = str;
      _ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = _ctx.getImageData(0, 0, 1, 1).data;
      if (a === 0) return null;
      const alpha = Math.round((a / 255) * 100) / 100;
      if (alpha >= 1) return "rgb(" + r + ", " + g + ", " + b + ")";
      return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    }
    return str;
  }

  function roundPx(val) {
    return Math.round(parseFloat(val) || 0);
  }

  function getSelector(el) {
    const parts = [];
    let cur = el;
    while (cur && cur !== document.body && cur !== document.documentElement) {
      let sel = cur.tagName.toLowerCase();
      if (cur.id) {
        sel = "#" + cur.id;
        parts.unshift(sel);
        break;
      }
      const parent = cur.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(c => c.tagName === cur.tagName);
        if (siblings.length > 1) {
          const idx = siblings.indexOf(cur) + 1;
          sel += ":nth-of-type(" + idx + ")";
        }
      }
      parts.unshift(sel);
      cur = cur.parentElement;
    }
    return parts.join(" > ");
  }

  function isHidden(el) {
    const style = getComputedStyle(el);
    if (style.display === "none") return true;
    if (style.visibility === "hidden") return true;
    // opacity 0 = hidden UNLESS element has animation (page-in starts at opacity 0)
    if (style.opacity === "0" && (!style.animationName || style.animationName === "none")) return true;
    if (style.position === "absolute" && style.clip === "rect(0px, 0px, 0px, 0px)") return true;
    // Width/height 0 with overflow hidden
    if (style.width === "0px" && style.height === "0px" && style.overflow === "hidden") return true;
    return false;
  }

  function isDecorative(el) {
    const style = getComputedStyle(el);
    // aria-hidden + pointer-events: none = purely decorative (screen reader hidden + non-interactive)
    // BUT skip this check if the element has visual background effects we want to capture
    if (el.getAttribute("aria-hidden") === "true" && style.pointerEvents === "none") {
      // Check if this element or its parent container has decorative backgrounds worth capturing
      // Those will be handled by hasDecorativeBackground() instead
      if (!hasVisualBackground(el)) return true;
    }
    return false;
  }

  // Check if an element has visual background worth capturing (blur glow, gradient pattern)
  function hasVisualBackground(el) {
    const style = getComputedStyle(el);
    const bg = normalizeColor(style.backgroundColor);
    const filter = style.filter || "";
    const hasBlur = filter.includes("blur(");
    const hasBgImage = style.backgroundImage && style.backgroundImage !== "none";
    return !!(bg && hasBlur) || !!hasBgImage;
  }

  // Check if a parent element has absolute-positioned decorative children (glow, grid, etc.)
  // Returns true if the parent should get a screenshot background image
  function getColorAlpha(colorStr) {
    if (!colorStr || colorStr === "transparent" || colorStr === "rgba(0, 0, 0, 0)") return 0;
    // rgba(r, g, b, a)
    const rgbaMatch = colorStr.match(/rgba?\\(\\s*[\\d.]+,\\s*[\\d.]+,\\s*[\\d.]+(?:,\\s*([\\d.]+))?\\)/);
    if (rgbaMatch) return rgbaMatch[1] !== undefined ? parseFloat(rgbaMatch[1]) : 1;
    // oklab(.../ alpha) or oklch(.../ alpha) or color(...)
    const slashAlpha = colorStr.match(/\\/\\s*([\\d.]+)\\s*\\)/);
    if (slashAlpha) return parseFloat(slashAlpha[1]);
    return 1;
  }

  function hasDecorativeBackground(el) {
    let decorativeCount = 0;
    for (const child of el.children) {
      const cs = getComputedStyle(child);
      if (cs.position !== "absolute" && cs.position !== "fixed") continue;
      const filter = cs.filter || "";
      const hasBlur = filter.includes("blur(") && parseFloat(filter.match(/blur\\((\\d+)/)?.[1] || "0") > 20;
      const hasBgImage = cs.backgroundImage && cs.backgroundImage !== "none";
      const hasBg = !!normalizeColor(cs.backgroundColor);
      const bgAlpha = getColorAlpha(cs.backgroundColor);
      const opacity = parseFloat(cs.opacity);
      // Skip very subtle decorative elements (color alpha <= 5% = barely visible)
      const effectiveOpacity = opacity * bgAlpha;
      if (hasBgImage) {
        decorativeCount++;
      } else if (hasBlur && effectiveOpacity > 0.05) {
        decorativeCount++;
      } else if (hasBg && opacity < 0.1 && effectiveOpacity > 0.05) {
        decorativeCount++;
      }
      // Also check grandchildren (the gradient bg container has blur children inside)
      if (cs.position === "absolute") {
        for (const gc of child.children) {
          const gcs = getComputedStyle(gc);
          const gcFilter = gcs.filter || "";
          if (gcFilter.includes("blur(") && parseFloat(gcFilter.match(/blur\\((\\d+)/)?.[1] || "0") > 20) {
            decorativeCount++;
          }
        }
      }
    }
    return decorativeCount >= 2; // At least 2 decorative elements = intentional background
  }

  function isTextOnly(el) {
    return el.childElementCount === 0 && el.textContent && el.textContent.trim();
  }

  function isMixedInline(el) {
    if (el.childElementCount === 0) return false;
    let hasTextNode = false;
    let hasInlineElement = false;
    for (const child of el.childNodes) {
      if (child.nodeType === 3 && child.textContent.trim()) hasTextNode = true;
      if (child.nodeType === 1) {
        if (!INLINE_TAGS.has(child.tagName)) return false;
        hasInlineElement = true;
      }
    }
    return hasTextNode && hasInlineElement;
  }

  function getMixedInlineText(el) {
    var text = "";
    for (var ci = 0; ci < el.childNodes.length; ci++) {
      var child = el.childNodes[ci];
      if (child.nodeType === 3) text += child.textContent;
      if (child.nodeType === 1) {
        if (child.tagName === "BR") { text += " "; continue; }
        text += child.textContent || "";
      }
    }
    return text.replace(/\\s+/g, " ").trim();
  }

  // Check if mixed inline content has children with different colors (links, colored spans)
  function hasColoredInlineChildren(el) {
    var parentColor = getComputedStyle(el).color;
    for (var ci = 0; ci < el.children.length; ci++) {
      var child = el.children[ci];
      if (!INLINE_TAGS.has(child.tagName)) continue;
      var childColor = getComputedStyle(child).color;
      if (childColor !== parentColor) return true;
    }
    return false;
  }

  // Extract mixed inline content as separate text runs with fills
  function getMixedInlineRuns(el) {
    var runs = [];
    var parentStyle = getComputedStyle(el);
    var parentRect = el.getBoundingClientRect();
    for (var ci = 0; ci < el.childNodes.length; ci++) {
      var child = el.childNodes[ci];
      if (child.nodeType === 3) {
        var t = child.textContent.replace(/\\s+/g, " ");
        if (t.trim()) {
          // Use a Range to measure text node dimensions
          var range = document.createRange();
          range.selectNodeContents(child);
          var rRect = range.getBoundingClientRect();
          runs.push({
            type: "text",
            textContent: t.trim(),
            fontFamily: parentStyle.fontFamily,
            fontWeight: parseInt(parentStyle.fontWeight) || 400,
            fontSize: roundPx(parentStyle.fontSize),
            lineHeight: roundPx(parentStyle.lineHeight) || undefined,
            color: normalizeColor(parentStyle.color),
            width: Math.round(rRect.width) || undefined,
            height: Math.round(rRect.height) || Math.round(parentRect.height) || undefined,
          });
        }
      } else if (child.nodeType === 1) {
        if (child.tagName === "BR") continue;
        var childStyle = getComputedStyle(child);
        var childRect = child.getBoundingClientRect();
        var ct = (child.textContent || "").replace(/\\s+/g, " ").trim();
        if (ct) {
          runs.push({
            type: "text",
            textContent: ct,
            fontFamily: childStyle.fontFamily,
            fontWeight: parseInt(childStyle.fontWeight) || 400,
            fontSize: roundPx(childStyle.fontSize),
            lineHeight: roundPx(childStyle.lineHeight) || undefined,
            color: normalizeColor(childStyle.color),
            width: Math.round(childRect.width) || undefined,
            height: Math.round(childRect.height) || Math.round(parentRect.height) || undefined,
          });
        }
      }
    }
    return runs;
  }

  function getFlexGrow(el) {
    const style = getComputedStyle(el);
    const grow = parseFloat(style.flexGrow) || 0;
    const basis = style.flexBasis;
    const w = style.width;
    if (grow > 0 || w === "100%" || basis === "100%" || (basis === "0px" && grow >= 1)) return true;
    const parent = el.parentElement;
    if (parent) {
      const parentStyle = getComputedStyle(parent);
      const parentDisplay = parentStyle.display;
      const parentRect = parent.getBoundingClientRect();
      const parentPadL = parseFloat(parentStyle.paddingLeft) || 0;
      const parentPadR = parseFloat(parentStyle.paddingRight) || 0;
      const parentContentW = parentRect.width - parentPadL - parentPadR;
      const childRect = el.getBoundingClientRect();
      const fills = parentContentW > 0 && Math.abs(childRect.width - parentContentW) <= 2;

      if (parentDisplay === "flex" || parentDisplay === "inline-flex") {
        const isCol = parentStyle.flexDirection === "column" || parentStyle.flexDirection === "column-reverse";
        if (isCol && fills) {
          const alignSelf = style.alignSelf;
          const alignItems = parentStyle.alignItems;
          if ((!alignSelf || alignSelf === "auto" || alignSelf === "stretch") &&
              (!alignItems || alignItems === "stretch" || alignItems === "normal")) return true;
        }
        // Horizontal flex: child width matches parent content width
        // But if parent has only 1 visible child, width match is trivial (parent HUGs child)
        // — require explicit flex-grow or width: 100% for single-child case
        if (!isCol) {
          const visibleSiblings = Array.from(parent.children).filter(function(c) {
            var cs = getComputedStyle(c);
            return cs.display !== "none" && c.getBoundingClientRect().width > 0;
          });
          if (visibleSiblings.length <= 1) {
            // Single child — fillWidth only if parent genuinely fills its container
            // (otherwise parent HUGs child, width match is trivial)
            if (!fills) return false;
            var _pGrow = parseFloat(parentStyle.flexGrow) || 0;
            var _pW = parentStyle.width;
            if (_pGrow > 0 || _pW === "100%") return true;
            // Parent in column flex → stretches by default → fills width
            var _gp = parent.parentElement;
            if (_gp) {
              var _gpS = getComputedStyle(_gp);
              var _gpD = _gpS.flexDirection || "row";
              if ((_gpS.display === "flex" || _gpS.display === "inline-flex") &&
                  (_gpD === "column" || _gpD === "column-reverse")) {
                return true;
              }
            }
            return false;
          }
          // Multi-child: child fills if width matches parent OR takes majority of space
          if (fills) return true;
          // Check if child takes > 70% of parent width (e.g. Input w-full with small sibling button)
          if (parentContentW > 0 && childRect.width / parentContentW > 0.7) return true;
        }
      }
      if (parentDisplay === "block" || parentDisplay === "flow-root" || parentDisplay === "") {
        const elDisplay = style.display;
        if ((elDisplay === "block" || elDisplay === "flex" || elDisplay === "grid") && fills) return true;
      }
      // Grid children: Figma has no CSS grid — fake with horizontal frame + fixed children
      if (parentDisplay === "grid" || parentDisplay === "inline-grid") {
        const gridChildren = Array.from(parent.children).filter(function(c) {
          const cs = getComputedStyle(c);
          return cs.display !== "none" && cs.position !== "absolute" && cs.position !== "fixed";
        });
        if (gridChildren.length <= 1) return true; // single child → fill
        // Check if multi-row grid (items on different y positions)
        const firstTop = gridChildren[0].getBoundingClientRect().top;
        const lastTop = gridChildren[gridChildren.length - 1].getBoundingClientRect().top;
        if (lastTop > firstTop + 2) return false; // multi-row → FIXED width (wrap handles layout)
        // Single-row: fill only if all cells same width (uniform columns)
        const widths = gridChildren.map(function(c) { return Math.round(c.getBoundingClientRect().width); });
        const allSame = widths.every(function(w) { return Math.abs(w - widths[0]) <= 2; });
        if (allSame) return true; // uniform single-row columns → fill equally
        return false; // different column widths → keep FIXED
      }
    }
    return false;
  }

  function getFillHeight(el) {
    const style = getComputedStyle(el);
    const h = style.height;
    const grow = parseFloat(style.flexGrow) || 0;
    const parent = el.parentElement;
    if (!parent) return false;
    const parentStyle = getComputedStyle(parent);
    const isCol = parentStyle.flexDirection === "column" || parentStyle.flexDirection === "column-reverse";
    if (isCol && grow > 0) {
      // flex-grow only stretches when parent has extra space to distribute
      // If parent has no explicit height (auto) → grow has no effect → child is content-sized (HUG)
      // Check if element is ACTUALLY stretched beyond its content
      if (!hasExplicitHeight(el)) return false; // height matches content → not actually stretched
      return true;
    }
    if (h === "100%") return true;
    // Cross-axis stretch only applies in flex/grid containers (not block parents)
    const parentDisplay = parentStyle.display;
    const isFlexParent = parentDisplay === "flex" || parentDisplay === "inline-flex";
    if (isFlexParent && !isCol) {
      const alignSelf = style.alignSelf;
      const parentAlign = parentStyle.alignItems;
      const parentStretches = parentAlign === "stretch" || parentAlign === "normal" || parentAlign === "";
      if (alignSelf === "stretch" || ((alignSelf === "auto" || alignSelf === "") && parentStretches)) {
        // Check if element is actually being stretched by a taller sibling
        // (if no taller sibling exists, hugHeight fallback handles it)
        const myH = el.getBoundingClientRect().height;
        const siblings = parent.children;
        for (var si = 0; si < siblings.length; si++) {
          if (siblings[si] === el) continue;
          const sibS = getComputedStyle(siblings[si]);
          if (sibS.display === "none" || sibS.position === "absolute" || sibS.position === "fixed") continue;
          if (siblings[si].getBoundingClientRect().height > myH + 2) {
            return true; // taller sibling → this element IS being stretched → FILL
          }
        }
        // No taller sibling + parent has explicit height → FILL
        const parentH = parentStyle.height;
        if (parentH && parentH !== "auto" && parentH !== "0px") return true;
      }
    }
    return false;
  }

  // Check if element has explicit width larger than its content
  // Returns true if element width > children total width (indicating CSS width is set)
  function hasExplicitWidth(el) {
    if (el.children.length === 0) return false;
    var r = el.getBoundingClientRect();
    var s = getComputedStyle(el);
    var totalChildW = 0;
    var visibleCount = 0;
    for (var i = 0; i < el.children.length; i++) {
      var cs = getComputedStyle(el.children[i]);
      if (cs.display === "none" || cs.position === "absolute" || cs.position === "fixed") continue;
      totalChildW += el.children[i].getBoundingClientRect().width;
      visibleCount++;
    }
    if (visibleCount === 0) return false;
    var padW = parseFloat(s.paddingLeft) + parseFloat(s.paddingRight);
    var gapW = parseFloat(s.columnGap) || parseFloat(s.gap) || 0;
    var contentW = totalChildW + Math.max(0, visibleCount - 1) * gapW + padW;
    return r.width > contentW + 2;
  }

  // Check if element has explicit height larger than its content
  function hasExplicitHeight(el) {
    var r = el.getBoundingClientRect();
    var s = getComputedStyle(el);
    // Leaf element or all children hidden: compare against text line height + padding + border
    var totalChildH = 0;
    var totalMarginH = 0;
    var visibleCount = 0;
    for (var i = 0; i < el.children.length; i++) {
      var cs = getComputedStyle(el.children[i]);
      if (cs.display === "none" || cs.position === "absolute" || cs.position === "fixed") continue;
      totalChildH += el.children[i].getBoundingClientRect().height;
      totalMarginH += parseFloat(cs.marginTop) || 0;
      totalMarginH += parseFloat(cs.marginBottom) || 0;
      visibleCount++;
    }
    if (visibleCount === 0) {
      // No visible element children (leaf or all hidden):
      // Check if element has no text → purely visual element with explicit size
      var textContent = (el.textContent || "").trim();
      if (!textContent) return true; // No text, no visible children → explicit size (checkbox, icon container)
      // Has text: compare height against text line height + padding + border
      var lineH = parseFloat(s.lineHeight) || (parseFloat(s.fontSize) * 1.2);
      var padH = parseFloat(s.paddingTop) + parseFloat(s.paddingBottom);
      var borderH = parseFloat(s.borderTopWidth) + parseFloat(s.borderBottomWidth);
      return r.height > lineH + padH + borderH + 4;
    }
    var padH = parseFloat(s.paddingTop) + parseFloat(s.paddingBottom);
    var gapH = parseFloat(s.rowGap) || parseFloat(s.gap) || 0;
    // Content height = children + gaps/margins + padding (use max of gap-based vs margin-based)
    var gapTotal = Math.max(0, visibleCount - 1) * gapH;
    var spacingH = Math.max(gapTotal, totalMarginH);
    var contentH = totalChildH + spacingH + padH;
    return r.height > contentH + 2;
  }

  // Detect if element should HUG width (content-sized, no explicit width)
  // Any element in a flex parent that sizes to its content → HUG
  function getHugWidth(el) {
    var style = getComputedStyle(el);
    var display = style.display;
    // inline-flex always sizes to content
    if (display === "inline-flex") return true;
    // If fills parent → FILL, not HUG
    if (getFlexGrow(el)) return false;
    // If has max-width → explicit sizing intent, not HUG
    var maxW = style.maxWidth;
    if (maxW && maxW !== "none") return false;
    // Check parent context
    var parent = el.parentElement;
    if (!parent) return false;
    var ps = getComputedStyle(parent);
    var pd = ps.display;
    if (pd === "flex" || pd === "inline-flex") {
      var dir = ps.flexDirection || "row";
      var isRow = dir === "row" || dir === "row-reverse";
      if (isRow) {
        // Row flex child: no grow + auto basis → sizes to content width
        // Applies to ANY element (flex, block, etc.) in a row flex parent
        var grow = parseFloat(style.flexGrow) || 0;
        var basis = style.flexBasis;
        if (grow === 0 && (basis === "auto" || basis === "content" || !basis)) {
          // Verify content is not smaller than element (explicit width like size-[48px])
          if (hasExplicitWidth(el)) return false;
          return true;
        }
      } else {
        // Column flex child: width is cross-axis
        // If not stretch → sizes to content width
        var alignSelf = style.alignSelf;
        var alignItems = ps.alignItems;
        var selfIsContent = alignSelf === "flex-start" || alignSelf === "start" || alignSelf === "center";
        var parentIsContent = alignItems === "flex-start" || alignItems === "start" || alignItems === "center";
        if (selfIsContent || ((!alignSelf || alignSelf === "auto") && parentIsContent)) {
          // Verify content is not smaller than element (explicit width like size-[48px])
          if (hasExplicitWidth(el)) return false;
          return true;
        }
      }
    }
    return false;
  }

  // Fallback: check if element auto-sizes to content height
  // Returns true when element has visible flow children AND height matches content
  // Used as safety net when getHugHeight/getFillHeight miss common cases
  function isContentSizedHeight(el) {
    var visibleCount = 0;
    for (var i = 0; i < el.children.length; i++) {
      var cs = getComputedStyle(el.children[i]);
      if (cs.display !== "none" && cs.position !== "absolute" && cs.position !== "fixed") visibleCount++;
    }
    if (visibleCount === 0) return false;
    return !hasExplicitHeight(el);
  }

  // Detect if element should HUG height (content-sized, no explicit height)
  function getHugHeight(el) {
    var style = getComputedStyle(el);
    var display = style.display;
    if (display === "inline-flex") return true;
    if (getFillHeight(el)) return false;
    var maxH = style.maxHeight;
    if (maxH && maxH !== "none") return false;
    var parent = el.parentElement;
    if (!parent) return false;
    var ps = getComputedStyle(parent);
    var pd = ps.display;
    if (pd === "flex" || pd === "inline-flex") {
      var dir = ps.flexDirection || "row";
      var isCol = dir === "column" || dir === "column-reverse";
      if (isCol) {
        var grow = parseFloat(style.flexGrow) || 0;
        var basis = style.flexBasis;
        if (grow === 0 && (basis === "auto" || basis === "content" || !basis)) {
          if (hasExplicitHeight(el)) return false;
          return true;
        }
      } else {
        // Row flex child: height is cross-axis
        var alignSelf = style.alignSelf;
        var alignItems = ps.alignItems;
        var selfIsContent = alignSelf === "flex-start" || alignSelf === "start" || alignSelf === "center";
        var parentIsContent = alignItems === "flex-start" || alignItems === "start" || alignItems === "center";
        if (selfIsContent || ((!alignSelf || alignSelf === "auto") && parentIsContent)) {
          if (hasExplicitHeight(el)) return false;
          return true;
        }
      }
    }
    return false;
  }

  function getIconName(svgEl) {
    // Check data-icon first (brand icons)
    const dataIcon = svgEl.getAttribute("data-icon");
    if (dataIcon) return dataIcon;

    const cls = svgEl.getAttribute("class") || "";
    const lucideMatch = cls.match(/lucide-([\\w-]+)/);
    if (lucideMatch) {
      return lucideMatch[1].split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
    }
    const lucideAttr = svgEl.getAttribute("data-lucide") || svgEl.closest("[data-lucide]")?.getAttribute("data-lucide");
    if (lucideAttr) {
      return lucideAttr.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
    }
    const ariaLabel = svgEl.getAttribute("aria-label");
    if (ariaLabel) return ariaLabel;
    return null;
  }

  function inferGapFromMargins(el, layout) {
    const visibleChildren = Array.from(el.children).filter(c => {
      const s = getComputedStyle(c);
      return s.display !== "none" && s.visibility !== "hidden";
    });
    if (visibleChildren.length < 2) return 0;
    const isVertical = layout === "vertical";
    // Measure actual pixel gap between consecutive children using bounding rects
    // This captures both margin-top on next child AND margin-bottom on prev child
    const gaps = [];
    for (let i = 1; i < visibleChildren.length; i++) {
      const prevRect = visibleChildren[i - 1].getBoundingClientRect();
      const currRect = visibleChildren[i].getBoundingClientRect();
      const g = isVertical
        ? currRect.top - prevRect.bottom
        : currRect.left - prevRect.right;
      if (g > 0) gaps.push(Math.round(g));
    }
    if (gaps.length === 0) return 0;
    const first = gaps[0];
    if (gaps.every(g => Math.abs(g - first) <= 1)) return first;
    // Different gaps — use the max to preserve largest spacing
    return Math.max(...gaps);
  }

  // Detect per-child cross-axis alignment (mx-auto → center)
  // getComputedStyle resolves "auto" margins to pixel values,
  // so we detect centering by comparing element position vs parent content area
  function getSelfAlign(el) {
    const parent = el.parentElement;
    if (!parent) return undefined;
    const parentStyle = getComputedStyle(parent);
    const parentDisplay = parentStyle.display;
    const parentDir = parentStyle.flexDirection || "row";
    const isColumnParent = parentDir === "column" || parentDir === "column-reverse";
    const isFlexParent = parentDisplay === "flex" || parentDisplay === "inline-flex";
    const isBlockParent = parentDisplay === "block" || parentDisplay === "flow-root";

    // Only detect horizontal centering for vertical flex or block parents
    if (!(isFlexParent && isColumnParent) && !isBlockParent) return undefined;

    const parentRect = parent.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const parentPadL = parseFloat(parentStyle.paddingLeft) || 0;
    const parentPadR = parseFloat(parentStyle.paddingRight) || 0;
    const parentContentW = parentRect.width - parentPadL - parentPadR;

    // If element fills parent width, no self-alignment needed
    if (Math.abs(elRect.width - parentContentW) <= 2) return undefined;

    // Calculate left offset within parent content area
    const leftOffset = elRect.left - parentRect.left - parentPadL;
    const rightOffset = parentContentW - elRect.width - leftOffset;

    // mx-auto: equal left/right offsets = centered
    if (leftOffset > 2 && Math.abs(leftOffset - rightOffset) <= 2) return "center";
    // ml-auto: pushed to end
    if (leftOffset > 10 && rightOffset <= 2) return "end";

    return undefined;
  }

  function extractBorderRadius(style) {
    const tl = parseFloat(style.borderTopLeftRadius) || 0;
    const tr = parseFloat(style.borderTopRightRadius) || 0;
    const bl = parseFloat(style.borderBottomLeftRadius) || 0;
    const br = parseFloat(style.borderBottomRightRadius) || 0;
    // All same → single value
    if (tl === tr && tr === bl && bl === br) {
      return Math.min(Math.round(tl), 9999);
    }
    // Mixed → return object
    return {
      topLeft: Math.min(Math.round(tl), 9999),
      topRight: Math.min(Math.round(tr), 9999),
      bottomLeft: Math.min(Math.round(bl), 9999),
      bottomRight: Math.min(Math.round(br), 9999),
    };
  }

  function getStrokeInfo(style) {
    const width = parseFloat(style.borderTopWidth) || 0;
    if (width === 0) return null;
    const color = normalizeColor(style.borderTopColor);
    if (!color) return null;
    return { width: Math.round(width), color };
  }

  /**
   * Serialize SVG element to string for figma.createNodeFromSvg()
   * Cleans up attributes that Figma can't handle
   */
  function serializeSVG(svgEl) {
    try {
      // Clone to avoid modifying the live DOM
      const clone = svgEl.cloneNode(true);
      // Remove class attributes (Tailwind classes not useful in Figma)
      clone.removeAttribute("class");
      // Ensure width/height attributes are set
      const rect = svgEl.getBoundingClientRect();
      if (!clone.getAttribute("width")) clone.setAttribute("width", String(Math.round(rect.width)));
      if (!clone.getAttribute("height")) clone.setAttribute("height", String(Math.round(rect.height)));
      // Ensure viewBox exists
      if (!clone.getAttribute("viewBox")) {
        clone.setAttribute("viewBox", "0 0 " + Math.round(rect.width) + " " + Math.round(rect.height));
      }
      // Ensure xmlns
      if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      // Remove data-* attributes
      const attrs = Array.from(clone.attributes);
      for (const attr of attrs) {
        if (attr.name.startsWith("data-")) clone.removeAttribute(attr.name);
      }
      const html = clone.outerHTML;
      // Basic size check — don't send huge SVGs (>50KB)
      if (html.length > 50000) return null;
      return html;
    } catch {
      return null;
    }
  }

  // ── Main walker ──

  function walkDOM(el, depth) {
    if (depth > 30) return null;
    if (!el || !el.tagName) return null;
    if (SKIP_TAGS.has(el.tagName.toUpperCase())) return null;
    if (isHidden(el)) return null;
    if (isDecorative(el)) return null;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0 && el.childElementCount === 0) return null;

    const style = getComputedStyle(el);

    // 0. Sonner toast detection (portal-rendered, no data-figma)
    if (el.hasAttribute("data-sonner-toast")) {
      const typeMap = { default: "Default", success: "Success", error: "Error", warning: "Warning", info: "Info" };
      let dataType = el.getAttribute("data-type") || "default";
      // toast.custom() sets data-type="custom" — check inner element for actual type
      if (dataType === "custom") {
        const inner = el.querySelector("[data-toast-type]");
        if (inner) dataType = inner.getAttribute("data-toast-type") || "default";
      }
      const variants = { "Type": typeMap[dataType] || "Default" };

      // Detect description
      const hasDesc = !!el.querySelector("[data-description]");
      variants["Show Description"] = hasDesc ? "True" : "False";

      // Detect action button
      const hasAction = !!el.querySelector("[data-button]") || !!el.querySelector("button[data-action]") || !!el.querySelector("[data-action]");
      variants["Show Action"] = hasAction ? "True" : "False";

      // Extract text overrides
      const textOverrides = {};
      const titleEl = el.querySelector("[data-title]");
      if (titleEl) textOverrides["Title"] = titleEl.textContent.trim();
      const descEl = el.querySelector("[data-description]");
      if (descEl) textOverrides["Description"] = descEl.textContent.trim();

      const vw = window.innerWidth;
      const isMobile = vw <= 480;

      // Fixed margins per breakpoint (design spec)
      // Desktop/Tablet: 24px right, 24px bottom
      // Mobile: 16px left/right (width = viewport - 32), 16px bottom
      const sonnerWidth = isMobile ? (vw - 32) : Math.round(rect.width);
      const rightMargin = isMobile ? 16 : 24;
      const bottomMargin = isMobile ? 16 : 24;

      return {
        type: "instance",
        component: "Sonner",
        variants,
        textOverrides: Object.keys(textOverrides).length > 0 ? textOverrides : undefined,
        width: sonnerWidth,
        height: Math.round(rect.height),
        position: "absolute",
        rightMargin,
        bottomMargin,
        constraints: isMobile
          ? { horizontal: "CENTER", vertical: "MAX" }
          : { horizontal: "MAX", vertical: "MAX" },
      };
    }

    // 1. DS component instance (data-figma attribute)
    // Skip instance extraction for Label with mixed-color inline children (e.g. link text)
    // so it falls through to mixed inline logic preserving per-run color tokens
    const figmaComp = el.getAttribute("data-figma");
    const skipInstanceForMixedLabel = figmaComp === "Label" && hasColoredInlineChildren(el);
    // Detect inline text link: Button/element styled as inline text (p-0, h-auto, text-primary)
    // Extract as text node instead of instance so color token is preserved
    var isInlineTextLink = false;
    if (figmaComp && !CONTAINER_COMPONENTS.has(figmaComp)) {
      var _cs2 = getComputedStyle(el);
      var _vPad = parseFloat(_cs2.paddingTop) + parseFloat(_cs2.paddingBottom);
      var _hPad = parseFloat(_cs2.paddingLeft) + parseFloat(_cs2.paddingRight);
      var _hasText = el.textContent && el.textContent.trim().length > 0;
      // Inline link: near-zero padding + has text + small height (close to line height)
      isInlineTextLink = _vPad < 4 && _hPad < 4 && _hasText && rect.height < 28;
    }
    if (isInlineTextLink && !skipInstanceForMixedLabel) {
      // Extract as text node with correct computed color
      const cs = getComputedStyle(el);
      return {
        type: "text",
        textContent: el.textContent.trim(),
        fontFamily: cs.fontFamily.split(",")[0].replace(/['"]/g, "").trim(),
        fontWeight: parseFloat(cs.fontWeight) || 400,
        fontSize: roundPx(parseFloat(cs.fontSize)) || 14,
        lineHeight: roundPx(parseFloat(cs.lineHeight)) || undefined,
        color: normalizeColor(cs.color),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        fillWidth: getFlexGrow(el) || undefined,
      };
    }
    // Auto-detect complex containers: if a DS component wraps other DS components
    // (e.g. Button wrapping Avatar + Badge), treat as container frame, not instance
    var _autoContainer = false;
    if (figmaComp && !CONTAINER_COMPONENTS.has(figmaComp) && !skipInstanceForMixedLabel) {
      var _innerComps = el.querySelectorAll("[data-figma]");
      if (_innerComps.length > 0) _autoContainer = true;
    }
    if (figmaComp && !CONTAINER_COMPONENTS.has(figmaComp) && !skipInstanceForMixedLabel && !_autoContainer) {
      const variantsStr = el.getAttribute("data-figma-variants");
      const variants = variantsStr ? JSON.parse(variantsStr) : {};

      // Override Value variant from Radix data-state (Radio, Checkbox, Switch only)
      // figma() sets Value at render time but Radix updates data-state dynamically
      // Skip for Progress — its data-state is "loading"/"complete"/"indeterminate", not checkbox states
      const dataState = el.getAttribute("data-state");
      const DATA_STATE_COMPONENTS = ["Checkbox", "Switch", "Radio"];
      if (dataState && variants.Value && DATA_STATE_COMPONENTS.includes(figmaComp)) {
        if (dataState === "checked") variants.Value = "Checked";
        else if (dataState === "unchecked") variants.Value = "Unchecked";
        else if (dataState === "indeterminate") variants.Value = "Indeterminate";
      }

      const textOverrides = {};

      // Extract text content and SVG icons
      const directText = [];
      const svgIcons = [];
      for (const child of el.childNodes) {
        if (child.nodeType === 3) {
          const t = child.textContent.trim();
          if (t) directText.push(t);
        } else if (child.nodeType === 1) {
          if (child.tagName === "svg" || child.tagName === "SVG") {
            // Extract SVG icon data instead of skipping
            const iconName = getIconName(child);
            const svgStr = serializeSVG(child);
            if (svgStr) {
              const svgRect = child.getBoundingClientRect();
              svgIcons.push({
                name: iconName || "Icon",
                svgContent: svgStr,
                width: Math.round(svgRect.width || parseFloat(getComputedStyle(child).width) || parseFloat(child.getAttribute("width") || "16")),
                height: Math.round(svgRect.height || parseFloat(getComputedStyle(child).height) || parseFloat(child.getAttribute("height") || "16")),
              });
            }
            continue;
          }
          if (getComputedStyle(child).display === "none") continue;
          const t = child.textContent?.trim();
          if (t) directText.push(t);
        }
      }
      if (directText.length > 0) textOverrides["Label"] = directText.join(" ");

      // Alert: map data-slot children to Figma text node names (Title / Description)
      if (figmaComp === "Alert") {
        delete textOverrides["Label"];
        var titleEl = el.querySelector('[data-slot="alert-title"]');
        var descEl = el.querySelector('[data-slot="alert-description"]');
        if (titleEl) textOverrides["Title"] = titleEl.textContent.trim();
        if (descEl) textOverrides["Description"] = descEl.textContent.trim();
      }

      // Select/Combobox: detect filled state from Radix data-placeholder attribute
      // Radix SelectValue <span> gets data-placeholder when no value selected, removed when selected
      // figma() hardcodes Value="Placeholder" — override to "Filled" when value is selected
      if ((figmaComp === "Select" || figmaComp === "Combobox") && variants.Value === "Placeholder") {
        var _hasPlaceholder = false;
        for (var _si = 0; _si < el.children.length; _si++) {
          if (el.children[_si].tagName === "SPAN" && el.children[_si].hasAttribute("data-placeholder")) {
            _hasPlaceholder = true; break;
          }
        }
        // No data-placeholder span found AND has text content → value is filled
        if (!_hasPlaceholder && el.textContent && el.textContent.trim().length > 0) {
          variants.Value = "Filled";
        }
      }

      // Extract placeholder / value
      // Input/Select/Textarea/Combobox use "Value" text node in Figma, others use "Label"
      const isFormInput = figmaComp === "Input" || figmaComp === "Select" || figmaComp === "Textarea" || figmaComp === "Combobox";
      const textKey = isFormInput ? "Value" : "Label";
      if (isFormInput && textOverrides["Label"]) {
        textOverrides[textKey] = textOverrides["Label"];
        delete textOverrides["Label"];
      }
      const inputEl = el.tagName === "INPUT" || el.tagName === "TEXTAREA"
        ? el : el.querySelector("input, textarea");
      if (inputEl) {
        const placeholder = inputEl.getAttribute("placeholder");
        if (placeholder) textOverrides[textKey] = placeholder;
        if (inputEl.value) {
          // Mask password fields with bullet characters
          const inputType = inputEl.getAttribute("type") || inputEl.type;
          textOverrides[textKey] = inputType === "password"
            ? "\u2022".repeat(inputEl.value.length)
            : inputEl.value;
          // Override Value variant to "Filled" when input has value
          if (variants.Value === "Placeholder") variants.Value = "Filled";
        }
      }

      // For <input>/<textarea> data-figma elements: scan parent wrapper for sibling SVG icons
      // Input component renders: <div class="relative"><input data-figma/><span>...<svg/></span></div>
      // Only scan when parent is a relative/flex wrapper (not a form container)
      const isNativeInput = el.tagName === "INPUT" || el.tagName === "TEXTAREA";
      if (isNativeInput && svgIcons.length === 0 && el.parentElement) {
        const wrapper = el.parentElement;
        const wrapperStyle = getComputedStyle(wrapper);
        const isInputWrapper = wrapperStyle.position === "relative" &&
          (wrapperStyle.display === "flex" || wrapperStyle.display === "inline-flex");
        const allSvgs = isInputWrapper ? wrapper.querySelectorAll("svg") : [];
        for (const svg of allSvgs) {
          const iconName = getIconName(svg);
          const svgStr = serializeSVG(svg);
          if (svgStr) {
            const svgRect = svg.getBoundingClientRect();
            svgIcons.push({
              name: iconName || "Icon",
              svgContent: svgStr,
              width: Math.round(parseFloat(svg.getAttribute("width") || getComputedStyle(svg).width) || svgRect.width || 16),
              height: Math.round(parseFloat(svg.getAttribute("height") || getComputedStyle(svg).height) || svgRect.height || 16),
            });
          }
        }
      }

      // Override Button Icon variant when SVG icons are present
      if (figmaComp === "Button" && svgIcons.length > 0 && variants.Icon === "None") {
        if (directText.length === 0) {
          // No text content = icon-only button (dev forgot to use icon size)
          variants.Icon = "Icon Only";
        } else {
          // Has text + icon — detect position (last child SVG = Right, else Left)
          const lastChild = el.lastElementChild;
          const isLastSvg = lastChild && (lastChild.tagName === "svg" || lastChild.tagName === "SVG");
          variants.Icon = isLastSvg && svgIcons.length === 1 ? "Right" : "Left";
        }
      }

      // For native input/textarea inside a relative wrapper, use wrapper's dimensions and fillWidth
      const hasWrapper = isNativeInput && el.parentElement &&
        getComputedStyle(el.parentElement).position === "relative";
      const sizeEl = hasWrapper ? el.parentElement : el;
      const sizeRect = hasWrapper ? el.parentElement.getBoundingClientRect() : rect;

      var _instFillW = getFlexGrow(sizeEl) || undefined;
      var _instHugW = !_instFillW ? (getHugWidth(sizeEl) || undefined) : undefined;

      return {
        type: "instance",
        component: figmaComp,
        variants,
        textOverrides: Object.keys(textOverrides).length > 0 ? textOverrides : undefined,
        svgIcons: svgIcons.length > 0 ? svgIcons : undefined,
        width: Math.round(sizeRect.width),
        height: Math.round(sizeRect.height),
        fillWidth: _instFillW,
        hugWidth: _instHugW,
        fillHeight: getFillHeight(sizeEl) || undefined,
        selfAlign: getSelfAlign(sizeEl) || undefined,
      };
    }

    // 2. SVG element
    if (el.tagName === "svg" || el.tagName === "SVG") {
      // Prefer CSS computed size (handles size-sm, size-md classes) over SVG attribute (always 24)
      const w = Math.round(rect.width || parseFloat(style.width) || parseFloat(el.getAttribute("width") || "16"));
      const h = Math.round(rect.height || parseFloat(style.height) || parseFloat(el.getAttribute("height") || "16"));

      // Small SVG = icon
      if (w <= 100 && h <= 100) {
        const iconName = getIconName(el);
        if (iconName) {
          var iconNode = {
            type: "icon",
            name: iconName,
            width: w,
            height: h,
            color: normalizeColor(style.color),
          };
          // Include SVG content so plugin can create from source when foundation icon doesn't match
          var iconSvg = serializeSVG(el);
          if (iconSvg) iconNode.svgContent = iconSvg;
          return iconNode;
        }
      }

      // Large SVG = illustration → try to serialize for createNodeFromSvg()
      const svgString = serializeSVG(el);
      if (svgString) {
        return {
          type: "svg",
          name: el.getAttribute("aria-label") || "Illustration",
          svgContent: svgString,
          width: w,
          height: h,
          fillWidth: getFlexGrow(el) || undefined,
        };
      }

      // Fallback: screenshot it
      // If SVG has negative margins, screenshot the overflow-hidden parent to avoid bleed
      var screenshotEl = el;
      var screenshotW = w;
      var screenshotH = h;
      var pEl = el.parentElement;
      if (pEl) {
        var pCs = getComputedStyle(pEl);
        if (pCs.overflow === "hidden" || pCs.overflowX === "hidden" || pCs.overflowY === "hidden") {
          var pRect = pEl.getBoundingClientRect();
          screenshotEl = pEl;
          screenshotW = Math.round(pRect.width);
          screenshotH = Math.round(pRect.height);
        }
      }
      return {
        type: "image",
        name: "Illustration",
        src: "",
        selector: getSelector(screenshotEl),
        width: screenshotW,
        height: screenshotH,
        fillWidth: getFlexGrow(el) || undefined,
        objectFit: "contain",
      };
    }

    // 3. Image
    if (el.tagName === "IMG") {
      return {
        type: "image",
        src: el.getAttribute("src") || "",
        selector: getSelector(el),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        objectFit: style.objectFit || "cover",
        radius: extractBorderRadius(style) || undefined,
      };
    }

    // 4. Canvas (charts) → screenshot
    if (el.tagName === "CANVAS") {
      return {
        type: "image",
        name: "Chart",
        src: "",
        selector: getSelector(el),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    }

    // 5. Text-only leaf
    if (isTextOnly(el)) {
      const text = el.textContent?.trim();
      if (!text) return null;

      // Check if this text-only element has visual properties (bg, stroke, radius)
      // If so, wrap text in a frame to preserve visual styling (e.g. step indicator circles)
      const _leafBg = normalizeColor(style.backgroundColor);
      const _leafStroke = getStrokeInfo(style);
      const _leafRadius = extractBorderRadius(style);
      if (_leafBg || _leafStroke || _leafRadius > 0) {
        const _isFlex = style.display === "flex" || style.display === "inline-flex";
        const textChild = {
          type: "text",
          textContent: text,
          fontFamily: style.fontFamily,
          fontWeight: parseInt(style.fontWeight) || 400,
          fontSize: roundPx(style.fontSize),
          lineHeight: roundPx(style.lineHeight) || undefined,
          color: normalizeColor(style.color),
        };
        return {
          type: "frame",
          layout: "horizontal",
          gap: 0,
          paddingTop: roundPx(style.paddingTop) || 0,
          paddingRight: roundPx(style.paddingRight) || 0,
          paddingBottom: roundPx(style.paddingBottom) || 0,
          paddingLeft: roundPx(style.paddingLeft) || 0,
          primaryAlign: _isFlex && (style.justifyContent === "center" || style.justifyContent === "space-around") ? "center" : undefined,
          counterAlign: _isFlex && style.alignItems === "center" ? "center" : undefined,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          fill: _leafBg || undefined,
          stroke: _leafStroke ? _leafStroke.color : undefined,
          strokeWidth: _leafStroke ? _leafStroke.width : undefined,
          radius: _leafRadius || undefined,
          fillWidth: getFlexGrow(el) || undefined,
          fillHeight: getFillHeight(el) || undefined,
          children: [textChild],
        };
      }

      return {
        type: "text",
        textContent: text,
        fontFamily: style.fontFamily,
        fontWeight: parseInt(style.fontWeight) || 400,
        fontSize: roundPx(style.fontSize),
        lineHeight: roundPx(style.lineHeight) || undefined,
        color: normalizeColor(style.color),
        textAlign: style.textAlign !== "start" && style.textAlign !== "left" ? style.textAlign : undefined,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        fillWidth: getFlexGrow(el) || undefined,
        fillHeight: getFillHeight(el) || undefined,
      };
    }

    // 5b. Mixed inline content
    if (isMixedInline(el)) {
      // If children have different colors (links, colored spans), extract as frame with text runs
      if (hasColoredInlineChildren(el)) {
        var runs = getMixedInlineRuns(el);
        if (runs.length > 1) {
          return {
            type: "frame",
            layout: "horizontal",
            wrap: true,
            gap: roundPx(style.fontSize) * 0.25 || 4,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            fillWidth: getFlexGrow(el) || true,
            primaryAlign: style.textAlign === "center" ? "center" : undefined,
            children: runs,
          };
        }
      }
      var text = getMixedInlineText(el);
      if (text) {
        return {
          type: "text",
          textContent: text,
          fontFamily: style.fontFamily,
          fontWeight: parseInt(style.fontWeight) || 400,
          fontSize: roundPx(style.fontSize),
          lineHeight: roundPx(style.lineHeight) || undefined,
          color: normalizeColor(style.color),
          textAlign: style.textAlign !== "start" && style.textAlign !== "left" ? style.textAlign : undefined,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          fillWidth: getFlexGrow(el) || undefined,
        };
      }
    }

    // 5c. Mixed content: text nodes + non-inline element children (e.g. <p>text <button>link</button></p>)
    // isMixedInline() misses this because BUTTON/DIV are not in INLINE_TAGS
    // We need to extract text nodes as text frames + recurse element children
    if (el.childElementCount > 0) {
      var hasDirectText = false;
      var hasNonInlineChild = false;
      for (var mci = 0; mci < el.childNodes.length; mci++) {
        var mcNode = el.childNodes[mci];
        if (mcNode.nodeType === 3 && mcNode.textContent.trim()) hasDirectText = true;
        if (mcNode.nodeType === 1 && !INLINE_TAGS.has(mcNode.tagName)) hasNonInlineChild = true;
      }
      if (hasDirectText && hasNonInlineChild) {
        var mixedChildren = [];
        for (var mci2 = 0; mci2 < el.childNodes.length; mci2++) {
          var mcn = el.childNodes[mci2];
          if (mcn.nodeType === 3) {
            var txt = mcn.textContent.replace(/\\s+/g, " ").trim();
            if (txt) {
              mixedChildren.push({
                type: "text",
                textContent: txt,
                fontFamily: style.fontFamily,
                fontWeight: parseInt(style.fontWeight) || 400,
                fontSize: roundPx(style.fontSize),
                lineHeight: roundPx(style.lineHeight) || undefined,
                color: normalizeColor(style.color),
              });
            }
          } else if (mcn.nodeType === 1) {
            // Inline tags: extract as styled text
            if (INLINE_TAGS.has(mcn.tagName)) {
              var inlineTxt = mcn.textContent.trim();
              if (inlineTxt) {
                var inlineStyle = getComputedStyle(mcn);
                mixedChildren.push({
                  type: "text",
                  textContent: inlineTxt,
                  fontFamily: inlineStyle.fontFamily,
                  fontWeight: parseInt(inlineStyle.fontWeight) || 400,
                  fontSize: roundPx(inlineStyle.fontSize),
                  lineHeight: roundPx(inlineStyle.lineHeight) || undefined,
                  color: normalizeColor(inlineStyle.color),
                });
              }
            } else {
              // Non-inline element: recurse (Button, div, etc.)
              var childNode = walkDOM(mcn, depth + 1);
              if (childNode) mixedChildren.push(childNode);
            }
          }
        }
        if (mixedChildren.length > 0) {
          return {
            type: "frame",
            layout: "horizontal",
            wrap: true,
            gap: 4,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            fillWidth: getFlexGrow(el) || undefined,
            selfAlign: getSelfAlign(el) || undefined,
            primaryAlign: style.textAlign === "center" ? "center" : undefined,
            children: mixedChildren,
          };
        }
      }
    }

    // 6. Layout frame — recurse children
    const children = [];

    // Check for decorative background children (glow, grid pattern, etc.)
    // If found, mark this frame for background screenshot — the frame fill will be
    // an image of the full element (including decorative effects), and auto-layout
    // children render on top.
    // Skip if frame contains SVG/IMG children — screenshot would double the visual content.
    var hasVisualChild = false;
    for (var vi = 0; vi < el.children.length; vi++) {
      var vc = el.children[vi];
      var vcTag = vc.tagName.toUpperCase();
      var vcPos = getComputedStyle(vc).position;
      if (vcPos === "absolute" || vcPos === "fixed") continue;
      if (vcTag === "SVG" || vcTag === "IMG" || vcTag === "VIDEO" || vcTag === "CANVAS") {
        hasVisualChild = true;
        break;
      }
    }
    const hasDecoBg = !hasVisualChild && hasDecorativeBackground(el);

    for (const child of el.children) {
      const childStyle = getComputedStyle(child);
      // Skip absolutely positioned elements (overlays, decorative backgrounds)
      if (childStyle.position === "absolute" || childStyle.position === "fixed") continue;
      const node = walkDOM(child, depth + 1);
      if (node) children.push(node);
    }

    // Merge adjacent Checkbox/Radio + Label pairs
    // When Checkbox is followed by Label, merge label text into checkbox textOverrides
    // When Label was converted to frame (mixed colors), hide checkbox default label text
    for (var ci = 0; ci < children.length - 1; ci++) {
      var curr = children[ci];
      var next = children[ci + 1];
      if (curr.type === "instance" && (curr.component === "Checkbox" || curr.component === "Radio")) {
        if (next.type === "instance" && next.component === "Label") {
          var labelText = next.textOverrides && next.textOverrides.Label;
          if (labelText) {
            if (!curr.textOverrides) curr.textOverrides = {};
            curr.textOverrides["Label"] = labelText;
            children.splice(ci + 1, 1);
          }
        } else if (next.type === "frame" && next.children && next.children.length > 1 &&
                   next.children.every(function(c) { return c.type === "text"; })) {
          // Mixed-color label (e.g. text + link spans) — hide checkbox default label
          if (!curr.textOverrides) curr.textOverrides = {};
          curr.textOverrides["Label"] = " ";
        }
      }
    }

    // Flatten single-child wrappers (no visual properties, no alignment, no padding)
    const _isFlex = style.display === "flex" || style.display === "inline-flex";
    const hasAlignment = _isFlex && (
      style.justifyContent === "center" || style.justifyContent === "space-between" ||
      style.justifyContent === "flex-end" || style.justifyContent === "space-around" ||
      style.alignItems === "center" || style.alignItems === "flex-end"
    );
    const bg = normalizeColor(style.backgroundColor);
    const strokeInfo = getStrokeInfo(style);
    const hasPadding = (roundPx(style.paddingTop) + roundPx(style.paddingRight) +
      roundPx(style.paddingBottom) + roundPx(style.paddingLeft)) > 0;

    if (children.length === 1 && !bg && !strokeInfo && !hasAlignment && !hasPadding && !hasDecoBg) {
      const onlyChild = children[0];
      if (getFlexGrow(el) && !onlyChild.fillWidth) onlyChild.fillWidth = true;
      if (getFillHeight(el) && !onlyChild.fillHeight) onlyChild.fillHeight = true;
      return onlyChild;
    }

    // Empty frame with bg = colored box
    if (children.length === 0) {
      if (bg) {
        return {
          type: "frame",
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          fill: bg,
          radius: extractBorderRadius(style) || undefined,
          opacity: parseFloat(style.opacity) !== 1 ? parseFloat(style.opacity) : undefined,
        };
      }
      return null;
    }

    // Detect separator (thin 1-2px elements)
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (children.length === 0 && ((h <= 2 && w > 2) || (w <= 2 && h > 2))) {
      return {
        type: "separator",
        direction: w <= 2 ? "vertical" : undefined,
        width: w,
        height: h,
      };
    }

    const _isGrid = style.display === "grid" || style.display === "inline-grid";
    const layout = _isFlex
      ? (style.flexDirection === "column" || style.flexDirection === "column-reverse" ? "vertical" : "horizontal")
      : (_isGrid ? "horizontal" : "vertical");

    // Detect multi-row CSS grid (children total width > container → needs wrap)
    let _isGridWrap = false;
    if (_isGrid && children.length > 1) {
      const visibleEls = Array.from(el.children).filter(function(c) {
        const cs = getComputedStyle(c);
        return cs.display !== "none" && cs.position !== "absolute" && cs.position !== "fixed";
      });
      if (visibleEls.length > 1) {
        const firstTop = visibleEls[0].getBoundingClientRect().top;
        const lastTop = visibleEls[visibleEls.length - 1].getBoundingClientRect().top;
        _isGridWrap = lastTop > firstTop + 2; // items span multiple rows
      }
    }

    // Gap: use CSS gap property first
    let gap = 0;
    if (_isFlex || style.display === "grid" || style.display === "inline-grid") {
      if (layout === "vertical") {
        gap = roundPx(style.rowGap !== "normal" ? style.rowGap : "0");
      } else {
        gap = roundPx(style.columnGap !== "normal" ? style.columnGap : "0");
      }
      if (gap === 0) {
        const gapStr = style.gap;
        if (gapStr && gapStr !== "normal") gap = roundPx(gapStr);
      }
    }
    var gapFromCSS = gap > 0;
    // Skip gap inference for space-between — Figma handles via SPACE_BETWEEN alignment, not gap
    var isSpaceBetween = _isFlex && style.justifyContent === "space-between";
    if (gap === 0 && children.length > 1 && !isSpaceBetween) gap = inferGapFromMargins(el, layout);

    // Detect extra margins on children that stack with CSS gap
    // CSS gap + margin stack in flex — but Figma only has one itemSpacing
    // Add margin as extra paddingBottom/paddingRight on the child node
    // Handles ALL node types: frame (add padding), instance/text (wrap in frame)
    // SKIP when gap was inferred from margins (not CSS gap) — margins already accounted for
    if (gapFromCSS && gap > 0 && children.length > 1) {
      const visibleEls = Array.from(el.children).filter(c => {
        const s = getComputedStyle(c);
        return s.display !== "none" && s.visibility !== "hidden" &&
          s.position !== "absolute" && s.position !== "fixed";
      });
      const isVertical = layout === "vertical";
      // Map walker children to DOM elements (they should correspond 1:1 after filtering)
      for (let i = 0; i < Math.min(visibleEls.length, children.length); i++) {
        const cs = getComputedStyle(visibleEls[i]);
        const extraMargin = isVertical
          ? roundPx(cs.marginBottom)
          : roundPx(cs.marginRight);
        if (extraMargin > 0) {
          const child = children[i];
          const childType = child.type;

          if (childType === "frame") {
            // Visual frames (has radius + fill, small size) should NOT have margin
            // added as internal padding — it distorts the visual shape.
            const isVisualFrame = child.radius > 0 && child.fill &&
              (child.width || 0) <= 100 && (child.height || 0) <= 100;
            if (isVisualFrame) {
              // Wrap in transparent frame with margin as padding
              const wrapper = {
                type: "frame",
                layout: isVertical ? "vertical" : "horizontal",
                gap: 0,
                paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0,
                fillWidth: true,
                hugHeight: isVertical ? true : undefined,
                hugWidth: !isVertical ? true : undefined,
                counterAlign: "center",
                children: [child],
              };
              if (isVertical) wrapper.paddingBottom = extraMargin;
              else wrapper.paddingRight = extraMargin;
              if (child.selfAlign) delete child.selfAlign;
              if (child.fillWidth) delete child.fillWidth;
              children[i] = wrapper;
            } else {
              // Regular frame: add margin as padding
              if (isVertical) {
                child.paddingBottom = (child.paddingBottom || 0) + extraMargin;
                child.height = (child.height || 0) + extraMargin;
              } else {
                child.paddingRight = (child.paddingRight || 0) + extraMargin;
                child.width = (child.width || 0) + extraMargin;
              }
            }
          } else if (childType === "instance" || childType === "text" || childType === "icon" || childType === "svg") {
            // Non-frame types: wrap in transparent frame with margin as padding
            const wrapper = {
              type: "frame",
              layout: isVertical ? "vertical" : "horizontal",
              gap: 0,
              paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0,
              fillWidth: child.fillWidth || undefined,
              hugHeight: isVertical ? true : undefined,
              hugWidth: !isVertical ? true : undefined,
              children: [child],
            };
            if (isVertical) wrapper.paddingBottom = extraMargin;
            else wrapper.paddingRight = extraMargin;
            children[i] = wrapper;
          }
        }
      }
    }

    // For layout frames, always emit gap/padding (even 0) so tokens can bind "none"
    var _pTop = roundPx(style.paddingTop);
    var _pRight = roundPx(style.paddingRight);
    var _pBottom = roundPx(style.paddingBottom);
    var _pLeft = roundPx(style.paddingLeft);
    var _radius = extractBorderRadius(style);
    // Extract box-shadow for effect style mapping
    // Filter out fully transparent shadows (rgba(0,0,0,0) 0px 0px 0px 0px)
    var _shadowRaw = style.boxShadow && style.boxShadow !== "none" ? style.boxShadow : undefined;
    var _shadow = _shadowRaw;
    if (_shadow && _shadow.indexOf("rgba(0, 0, 0, 0)") !== -1) {
      // Check if ALL rgba values in the shadow are transparent
      // Note: inside template literal → use double-escaped regex
      var _stripped = _shadow.replace(/rgba\\(0, 0, 0, 0\\)/g, "").replace(/0px/g, "").replace(/[, ]/g, "");
      if (_stripped.length === 0) _shadow = undefined;
    }

    const node = {
      type: "frame",
      name: el.getAttribute("data-slot") || undefined,
      layout,
      gap: layout ? (gap || 0) : (gap || undefined),
      paddingTop: layout ? (_pTop || 0) : (_pTop || undefined),
      paddingRight: layout ? (_pRight || 0) : (_pRight || undefined),
      paddingBottom: layout ? (_pBottom || 0) : (_pBottom || undefined),
      paddingLeft: layout ? (_pLeft || 0) : (_pLeft || undefined),
      primaryAlign: _isFlex ? mapJustify(style.justifyContent) : undefined,
      counterAlign: _isFlex ? mapAlign(style.alignItems) : undefined,
      wrap: style.flexWrap === "wrap" || _isGridWrap || undefined,
      wrapGap: _isGridWrap ? roundPx(style.rowGap !== "normal" ? style.rowGap : "0") : undefined,
      width: w,
      height: h,
      fillWidth: getFlexGrow(el) || undefined,
      fillHeight: getFillHeight(el) || undefined,
      hugWidth: getHugWidth(el) || undefined,
      hugHeight: getHugHeight(el) || (!getFillHeight(el) && isContentSizedHeight(el)) || undefined,
      selfAlign: getSelfAlign(el) || undefined,
      fill: bg || undefined,
      stroke: strokeInfo ? strokeInfo.color : undefined,
      strokeWidth: strokeInfo ? strokeInfo.width : undefined,
      radius: _radius != null ? _radius : undefined,
      shadow: _shadow,
      overflow: style.overflow === "hidden" ? "hidden" : undefined,
      opacity: parseFloat(style.opacity) !== 1 ? parseFloat(style.opacity) : undefined,
      clipsContent: style.overflow === "hidden" || undefined,
      backgroundSelector: hasDecoBg ? getSelector(el) : undefined,
      children,
    };

    // Clean up undefined values for smaller JSON
    for (const key of Object.keys(node)) {
      if (node[key] === undefined || node[key] === false) delete node[key];
    }

    return node;
  }

  function mapJustify(val) {
    const m = { "flex-start": "start", "start": "start", "flex-end": "end", "end": "end",
      "center": "center", "space-between": "space-between" };
    return m[val] || undefined;
  }

  function mapAlign(val) {
    const m = { "flex-start": "start", "start": "start", "flex-end": "end", "end": "end",
      "center": "center", "stretch": "stretch" };
    return m[val] || undefined;
  }

  const root = document.getElementById("root") || document.body;
  const result = walkDOM(root, 0);

  // Sonner toasts render in a portal outside #root — walk them separately
  const sonnerToaster = document.querySelector("[data-sonner-toaster]");
  if (sonnerToaster && result && result.children) {
    const toasts = sonnerToaster.querySelectorAll("[data-sonner-toast]");
    for (const toast of toasts) {
      const toastNode = walkDOM(toast, 1);
      if (toastNode) {
        result.children.push(toastNode);
      }
    }
  }

  return result;
}
`
