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
  position?: "absolute"  // absolute positioned overlay (decorative background, etc.)
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
      }
      if (parentDisplay === "block" || parentDisplay === "flow-root" || parentDisplay === "") {
        const elDisplay = style.display;
        if ((elDisplay === "block" || elDisplay === "flex" || elDisplay === "grid") && fills) return true;
      }
      // Grid children fill their cell
      if (parentDisplay === "grid" || parentDisplay === "inline-grid") return true;
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
    if (isCol && grow > 0) return true;
    if (h === "100%") return true;
    // Cross-axis stretch only applies in flex/grid containers (not block parents)
    const parentDisplay = parentStyle.display;
    const isFlexParent = parentDisplay === "flex" || parentDisplay === "inline-flex";
    if (isFlexParent && !isCol) {
      const alignSelf = style.alignSelf;
      const parentAlign = parentStyle.alignItems;
      const parentStretches = parentAlign === "stretch" || parentAlign === "normal" || parentAlign === "";
      if (alignSelf === "stretch" || ((alignSelf === "auto" || alignSelf === "") && parentStretches)) {
        const parentH = parentStyle.height;
        if (parentH && parentH !== "auto" && parentH !== "0px") return true;
      }
    }
    return false;
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
        if (grow === 0 && (basis === "auto" || basis === "content" || !basis)) return true;
      } else {
        // Column flex child: width is cross-axis
        // If not stretch → sizes to content width
        var alignSelf = style.alignSelf;
        var alignItems = ps.alignItems;
        var selfIsContent = alignSelf === "flex-start" || alignSelf === "start" || alignSelf === "center";
        var parentIsContent = alignItems === "flex-start" || alignItems === "start" || alignItems === "center";
        if (selfIsContent) return true;
        if ((!alignSelf || alignSelf === "auto") && parentIsContent) return true;
      }
    }
    return false;
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
        if (grow === 0 && (basis === "auto" || basis === "content" || !basis)) return true;
      } else {
        // Row flex child: height is cross-axis
        var alignSelf = style.alignSelf;
        var alignItems = ps.alignItems;
        var selfIsContent = alignSelf === "flex-start" || alignSelf === "start" || alignSelf === "center";
        var parentIsContent = alignItems === "flex-start" || alignItems === "start" || alignItems === "center";
        if (selfIsContent) return true;
        if ((!alignSelf || alignSelf === "auto") && parentIsContent) return true;
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

    // 1. DS component instance (data-figma attribute)
    const figmaComp = el.getAttribute("data-figma");
    if (figmaComp && !CONTAINER_COMPONENTS.has(figmaComp)) {
      const variantsStr = el.getAttribute("data-figma-variants");
      const variants = variantsStr ? JSON.parse(variantsStr) : {};
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
                width: Math.round(parseFloat(child.getAttribute("width") || getComputedStyle(child).width) || svgRect.width || 16),
                height: Math.round(parseFloat(child.getAttribute("height") || getComputedStyle(child).height) || svgRect.height || 16),
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

      // Extract placeholder
      const inputEl = el.tagName === "INPUT" || el.tagName === "TEXTAREA"
        ? el : el.querySelector("input, textarea");
      if (inputEl) {
        const placeholder = inputEl.getAttribute("placeholder");
        if (placeholder) textOverrides["Label"] = placeholder;
        if (inputEl.value) textOverrides["Label"] = inputEl.value;
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
        variants.Icon = "Left";
      }

      // For native input/textarea inside a relative wrapper, use wrapper's dimensions and fillWidth
      const hasWrapper = isNativeInput && el.parentElement &&
        getComputedStyle(el.parentElement).position === "relative";
      const sizeEl = hasWrapper ? el.parentElement : el;
      const sizeRect = hasWrapper ? el.parentElement.getBoundingClientRect() : rect;

      return {
        type: "instance",
        component: figmaComp,
        variants,
        textOverrides: Object.keys(textOverrides).length > 0 ? textOverrides : undefined,
        svgIcons: svgIcons.length > 0 ? svgIcons : undefined,
        width: Math.round(sizeRect.width),
        height: Math.round(sizeRect.height),
        fillWidth: getFlexGrow(sizeEl) || undefined,
        selfAlign: getSelfAlign(sizeEl) || undefined,
      };
    }

    // 2. SVG element
    if (el.tagName === "svg" || el.tagName === "SVG") {
      const w = Math.round(parseFloat(el.getAttribute("width") || style.width) || rect.width);
      const h = Math.round(parseFloat(el.getAttribute("height") || style.height) || rect.height);

      // Small SVG = icon
      if (w <= 100 && h <= 100) {
        const iconName = getIconName(el);
        if (iconName) {
          return {
            type: "icon",
            name: iconName,
            width: w,
            height: h,
            color: normalizeColor(style.color),
          };
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
      return {
        type: "image",
        name: "Illustration",
        src: "",
        selector: getSelector(el),
        width: w,
        height: h,
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
            gap: roundPx(style.fontSize) * 0.25 || 4,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            fillWidth: getFlexGrow(el) || undefined,
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
    for (var ci = 0; ci < children.length - 1; ci++) {
      var curr = children[ci];
      var next = children[ci + 1];
      if (curr.type === "instance" && (curr.component === "Checkbox" || curr.component === "Radio") &&
          next.type === "instance" && next.component === "Label") {
        var labelText = next.textOverrides && next.textOverrides.Label;
        if (labelText) {
          if (!curr.textOverrides) curr.textOverrides = {};
          curr.textOverrides["Label"] = labelText;
          children.splice(ci + 1, 1);
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

    const layout = _isFlex
      ? (style.flexDirection === "column" || style.flexDirection === "column-reverse" ? "vertical" : "horizontal")
      : (style.display === "grid" || style.display === "inline-grid" ? "horizontal" : "vertical");

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
    if (gap === 0 && children.length > 1) gap = inferGapFromMargins(el, layout);

    // Detect extra margins on children that stack with CSS gap
    // CSS gap + margin stack in flex — but Figma only has one itemSpacing
    // Add margin as extra paddingBottom/paddingRight on the child node
    if (gap > 0 && children.length > 1) {
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
        if (extraMargin > 0 && children[i].type === "frame") {
          // Add margin as padding to the child frame
          if (isVertical) {
            children[i].paddingBottom = (children[i].paddingBottom || 0) + extraMargin;
            children[i].height = (children[i].height || 0) + extraMargin;
          } else {
            children[i].paddingRight = (children[i].paddingRight || 0) + extraMargin;
            children[i].width = (children[i].width || 0) + extraMargin;
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
    var _shadow = style.boxShadow && style.boxShadow !== "none" ? style.boxShadow : undefined;

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
      wrap: style.flexWrap === "wrap" || undefined,
      width: w,
      height: h,
      fillWidth: getFlexGrow(el) || undefined,
      fillHeight: getFillHeight(el) || undefined,
      hugWidth: getHugWidth(el) || undefined,
      hugHeight: getHugHeight(el) || undefined,
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
  return result;
}
`
