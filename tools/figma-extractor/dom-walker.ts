/**
 * DOM Walker — Playwright page.evaluate() script
 *
 * Runs INSIDE the browser context. Walks the DOM tree,
 * identifies DS components (via data-figma) and layout frames,
 * extracts computed styles and text content.
 */

export interface ExtractedNode {
  type: "instance" | "frame" | "text" | "icon" | "image"
  name?: string
  // Instance (DS component)
  component?: string
  variants?: Record<string, string>
  textOverrides?: Record<string, string>
  // Frame (layout container)
  layout?: "horizontal" | "vertical"
  gap?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  primaryAlign?: string
  counterAlign?: string
  wrap?: boolean
  // Grid info
  gridCols?: number
  // Sizing
  width?: number
  height?: number
  fillWidth?: boolean
  fillHeight?: boolean
  selfAlign?: "center" | "end"  // per-child cross-axis alignment (mx-auto → center)
  // Visual
  fill?: string           // raw rgba
  stroke?: string         // raw rgba
  strokeWidth?: number
  radius?: number
  opacity?: number
  overflow?: string
  // Text
  textContent?: string
  fontFamily?: string
  fontWeight?: number
  fontSize?: number
  lineHeight?: number
  color?: string          // raw rgba
  textAlign?: string
  // Image
  src?: string
  objectFit?: string
  selector?: string        // CSS selector for Playwright screenshot
  // Children
  children?: ExtractedNode[]
  // Debug
  tagName?: string
  className?: string
  dataSlot?: string
}

/**
 * This function runs in browser context via page.evaluate()
 * It returns a serializable tree of ExtractedNodes
 */
export const DOM_WALKER_SCRIPT = `
() => {
  const SKIP_TAGS = new Set([
    "SCRIPT", "STYLE", "LINK", "META", "HEAD", "NOSCRIPT", "BR",
    "TEMPLATE", "SLOT", "PORTAL",
  ]);

  // Container components: recurse into children instead of treating as opaque instance
  const CONTAINER_COMPONENTS = new Set([
    "Card", "Dialog", "Sheet", "Drawer", "Collapsible", "Accordion",
  ]);

  // Generate a CSS selector path for an element (for Playwright screenshot)
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
    if (style.opacity === "0") return true;
    // Check sr-only (absolute + clip)
    if (style.position === "absolute" && style.clip === "rect(0px, 0px, 0px, 0px)") return true;
    return false;
  }

  // Decorative elements: gradient orbs, blur overlays, etc.
  function isDecorative(el) {
    const style = getComputedStyle(el);
    // pointer-events-none + aria-hidden = purely decorative overlay
    if (el.getAttribute("aria-hidden") === "true" && style.pointerEvents === "none") return true;
    // Huge blur = gradient orb
    const filter = style.filter || "";
    if (filter.includes("blur(") && parseFloat(filter.match(/blur\\((\\d+)/)?.[1] || "0") > 50) return true;
    return false;
  }

  function isTextOnly(el) {
    if (el.childElementCount === 0 && el.textContent && el.textContent.trim()) {
      return true;
    }
    return false;
  }

  // Mixed inline content: <p> with text nodes + inline elements like <a>, <span>, <strong>
  // e.g. "Don't have an account? <a>Sign up</a>" → single text node
  const INLINE_TAGS = new Set(["A", "SPAN", "STRONG", "EM", "B", "I", "U", "SMALL", "MARK", "SUB", "SUP", "CODE", "ABBR", "BR"]);
  function isMixedInline(el) {
    if (el.childElementCount === 0) return false;
    // Must have at least one text node with content
    let hasTextNode = false;
    let hasInlineElement = false;
    for (const child of el.childNodes) {
      if (child.nodeType === 3 && child.textContent.trim()) hasTextNode = true;
      if (child.nodeType === 1) {
        if (!INLINE_TAGS.has(child.tagName)) return false; // block element = not inline mix
        hasInlineElement = true;
      }
    }
    return hasTextNode && hasInlineElement;
  }

  function getMixedInlineText(el) {
    let text = "";
    for (const child of el.childNodes) {
      if (child.nodeType === 3) text += child.textContent;
      if (child.nodeType === 1) {
        // <br> → newline/space
        if (child.tagName === "BR") { text += " "; continue; }
        text += child.textContent || "";
      }
    }
    return text.replace(/\\s+/g, " ").trim();
  }

  // NAV elements with multiple A children → treat as navigation, extract each link separately
  function isNavList(el) {
    if (el.tagName === "NAV") return true;
    // Flex container with only A children
    const children = Array.from(el.children);
    if (children.length > 2 && children.every(c => c.tagName === "A")) return true;
    return false;
  }

  // Force any CSS color (oklab, oklch, color(), etc.) → rgba() via canvas
  const _colorCanvas = document.createElement("canvas");
  _colorCanvas.width = 1;
  _colorCanvas.height = 1;
  const _colorCtx = _colorCanvas.getContext("2d");

  function normalizeColor(str) {
    if (!str || str === "rgba(0, 0, 0, 0)" || str === "transparent" || str === "rgb(0, 0, 0)") return null;
    // Already rgb/rgba → return as-is
    if (str.startsWith("rgb")) return str;
    // Convert via canvas (handles oklab, oklch, color(), etc.)
    if (_colorCtx) {
      _colorCtx.clearRect(0, 0, 1, 1);
      _colorCtx.fillStyle = str;
      _colorCtx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = _colorCtx.getImageData(0, 0, 1, 1).data;
      if (a === 0) return null;
      const alpha = Math.round((a / 255) * 100) / 100;
      if (alpha >= 1) return "rgb(" + r + ", " + g + ", " + b + ")";
      return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    }
    return str;
  }

  function parseRGBA(str) {
    return normalizeColor(str);
  }

  function roundPx(val) {
    return Math.round(parseFloat(val) || 0);
  }

  function mapFlexDir(style) {
    const dir = style.flexDirection;
    if (dir === "column" || dir === "column-reverse") return "vertical";
    return "horizontal";
  }

  function mapJustify(val) {
    const map = {
      "flex-start": "start", "start": "start",
      "flex-end": "end", "end": "end",
      "center": "center",
      "space-between": "space-between",
      "space-around": "space-around",
      "space-evenly": "space-evenly",
    };
    return map[val] || "start";
  }

  function mapAlign(val) {
    const map = {
      "flex-start": "start", "start": "start",
      "flex-end": "end", "end": "end",
      "center": "center",
      "stretch": "stretch",
      "baseline": "start",
    };
    return map[val] || "start";
  }

  function extractBorderRadius(style) {
    const tl = parseFloat(style.borderTopLeftRadius) || 0;
    // Cap at 9999 (full) for very large values
    const rounded = Math.round(tl);
    return rounded > 9999 ? 9999 : rounded;
  }

  function getStrokeInfo(style) {
    const width = parseFloat(style.borderTopWidth) || 0;
    if (width === 0) return null;
    const color = parseRGBA(style.borderTopColor);
    if (!color) return null;
    return { width: Math.round(width), color };
  }

  function getFlexGrow(el) {
    const style = getComputedStyle(el);
    const grow = parseFloat(style.flexGrow) || 0;
    const basis = style.flexBasis;
    const w = style.width;
    // flex-grow > 0, width: 100%, flex-basis: 100%, or flex: 1 1 0% (flex-basis: 0px + grow)
    if (grow > 0 || w === "100%" || basis === "100%" || (basis === "0px" && grow >= 1)) return true;

    // Cross-axis stretch / block fill detection
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

      // 1. Flex column parent + stretch alignment (default)
      if (parentDisplay === "flex" || parentDisplay === "inline-flex") {
        const parentDir = parentStyle.flexDirection;
        const isColumnParent = parentDir === "column" || parentDir === "column-reverse";
        if (isColumnParent && fills) {
          const alignSelf = style.alignSelf;
          const alignItems = parentStyle.alignItems;
          const selfStretch = !alignSelf || alignSelf === "auto" || alignSelf === "stretch";
          const parentStretch = !alignItems || alignItems === "stretch" || alignItems === "normal";
          if (selfStretch && parentStretch) return true;
        }
      }

      // 2. Block-level child in block/flow parent — fills width naturally
      if (parentDisplay === "block" || parentDisplay === "flow-root" || parentDisplay === "") {
        const elDisplay = style.display;
        if ((elDisplay === "block" || elDisplay === "flex" || elDisplay === "grid") && fills) {
          return true;
        }
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
    const parentDir = parentStyle.flexDirection;
    const isColumnParent = parentDir === "column" || parentDir === "column-reverse";
    // In column flex: flex-grow stretches height
    if (isColumnParent && grow > 0) return true;
    // In row flex: height: 100% or align-self: stretch
    if (h === "100%") return true;
    const alignSelf = style.alignSelf;
    if (!isColumnParent && (alignSelf === "stretch" || (alignSelf === "auto" && parentStyle.alignItems === "stretch"))) {
      // Only mark fillHeight if parent has explicit height (not hug)
      const parentH = parentStyle.height;
      if (parentH && parentH !== "auto" && parentH !== "0px") return true;
    }
    return false;
  }

  // Detect per-child cross-axis alignment (mx-auto → center)
  // getComputedStyle resolves "auto" margins to pixel values, so we check
  // by comparing element position vs parent content area
  function getSelfAlign(el) {
    const parent = el.parentElement;
    if (!parent) return undefined;
    const parentStyle = getComputedStyle(parent);
    const parentDisplay = parentStyle.display;
    const parentDir = parentStyle.flexDirection || "row";
    const isColumnParent = parentDir === "column" || parentDir === "column-reverse";
    const isFlexParent = parentDisplay === "flex" || parentDisplay === "inline-flex";
    const isBlockParent = parentDisplay === "block" || parentDisplay === "flow-root";

    // Only detect cross-axis centering for vertical flex or block parents
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

  // Extract Lucide icon name from SVG element
  function getIconName(svgEl) {
    // Method 1: Lucide adds class like "lucide lucide-arrow-right"
    const cls = svgEl.getAttribute("class") || "";
    const lucideMatch = cls.match(/lucide-([\\w-]+)/);
    if (lucideMatch) {
      // Convert kebab-case to PascalCase: "arrow-right" → "ArrowRight"
      return lucideMatch[1].split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
    }
    // Method 2: data-lucide attribute on parent or self
    const lucideAttr = svgEl.getAttribute("data-lucide") || svgEl.closest("[data-lucide]")?.getAttribute("data-lucide");
    if (lucideAttr) {
      return lucideAttr.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
    }
    // Method 3: aria-label
    const ariaLabel = svgEl.getAttribute("aria-label");
    if (ariaLabel) return ariaLabel;
    // Fallback
    return "Icon";
  }

  // Infer gap from child margins when style.gap is 0
  // Tailwind space-y-* / space-x-* uses margin-top/margin-left on siblings
  // Also checks marginBottom/marginRight of previous sibling (e.g. mb-md)
  function inferGapFromMargins(el, layout) {
    const visibleChildren = Array.from(el.children).filter(c => {
      const s = getComputedStyle(c);
      return s.display !== "none" && s.visibility !== "hidden";
    });
    if (visibleChildren.length < 2) return 0;
    const isVertical = layout === "vertical";
    // Measure actual pixel gap between consecutive children using bounding rects
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
    // Use the most common gap value (handles mixed margins gracefully)
    const first = gaps[0];
    const allEqual = gaps.every(g => Math.abs(g - first) <= 1);
    if (allEqual) return first;
    // If gaps differ, use the maximum (preserves the largest spacing)
    return Math.max(...gaps);
  }

  // Get grid column count from computed style
  function getGridCols(style) {
    const cols = style.gridTemplateColumns;
    if (!cols || cols === "none") return 1;
    // Count number of column tracks
    return cols.split(/\\s+/).filter(s => s && s !== "0px").length;
  }

  function walkDOM(el, depth) {
    if (depth > 30) return null;
    if (!el || !el.tagName) return null;
    if (SKIP_TAGS.has(el.tagName.toUpperCase())) return null;
    if (isHidden(el)) return null;
    if (isDecorative(el)) return null;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0 && el.childElementCount === 0) return null;

    const style = getComputedStyle(el);

    // 1. Check for DS component (data-figma attribute)
    const figmaComp = el.getAttribute("data-figma");
    if (figmaComp) {
      const variantsStr = el.getAttribute("data-figma-variants");
      const variants = variantsStr ? JSON.parse(variantsStr) : {};

      // Container components (Card, Dialog, etc.) → recurse into children
      if (CONTAINER_COMPONENTS.has(figmaComp)) {
        // Fall through to layout frame logic below, but mark as instance frame
        // Don't return here — let it be processed as a frame with children
      } else {
        // Leaf component (Button, Input, Badge, etc.) → opaque instance
        const textOverrides = {};
        const directText = [];
        for (const child of el.childNodes) {
          if (child.nodeType === 3) { // TEXT_NODE
            const t = child.textContent.trim();
            if (t) directText.push(t);
          } else if (child.nodeType === 1) { // ELEMENT_NODE
            const childEl = child;
            if (childEl.tagName === "svg" || childEl.tagName === "SVG") continue;
            if (getComputedStyle(childEl).display === "none") continue;
            const t = childEl.textContent?.trim();
            if (t) directText.push(t);
          }
        }
        if (directText.length > 0) {
          textOverrides["Label"] = directText.join(" ");
        }
        // Extract placeholder from input/textarea elements
        const inputEl = el.tagName === "INPUT" || el.tagName === "TEXTAREA"
          ? el
          : el.querySelector("input, textarea");
        if (inputEl) {
          const placeholder = inputEl.getAttribute("placeholder");
          if (placeholder) textOverrides["Label"] = placeholder;
          const value = inputEl.value || "";
          if (value) textOverrides["Label"] = value;
        }

        return {
          type: "instance",
          component: figmaComp,
          variants,
          textOverrides: Object.keys(textOverrides).length > 0 ? textOverrides : undefined,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          fillWidth: getFlexGrow(el),
          selfAlign: getSelfAlign(el) || undefined,
          tagName: el.tagName,
          dataSlot: el.getAttribute("data-slot") || undefined,
        };
      }
    }

    // 2. Check for SVG icon (NOT skipped by SKIP_TAGS anymore)
    if (el.tagName === "svg" || el.tagName === "SVG") {
      const w = parseFloat(el.getAttribute("width") || style.width) || Math.round(rect.width);
      const h = parseFloat(el.getAttribute("height") || style.height) || Math.round(rect.height);
      // Large SVGs (>100px) are likely illustrations, not icons → image placeholder
      // Use parent container selector for screenshot (SVG elements may fail)
      if (Math.round(w) > 100 || Math.round(h) > 100) {
        var parentEl = el.parentElement;
        var useParent = parentEl && parentEl !== document.body && parentEl.children.length <= 5;
        var screenshotEl = useParent ? parentEl : el;
        var ssRect = screenshotEl.getBoundingClientRect();
        return {
          type: "image",
          name: "Illustration",
          src: "",
          selector: getSelector(screenshotEl),
          width: Math.round(ssRect.width) || Math.round(w),
          height: Math.round(ssRect.height) || Math.round(h),
          fillWidth: getFlexGrow(el) || undefined,
          objectFit: "contain",
          tagName: "svg",
        };
      }
      return {
        type: "icon",
        name: getIconName(el),
        width: Math.round(w),
        height: Math.round(h),
        color: parseRGBA(style.color),
        tagName: "svg",
      };
    }

    // 3. Check for image
    if (el.tagName === "IMG") {
      return {
        type: "image",
        src: el.getAttribute("src") || "",
        selector: getSelector(el),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        objectFit: style.objectFit || "cover",
        tagName: "IMG",
      };
    }

    // 4. Check for text-only element (leaf text node, no child elements)
    if (isTextOnly(el)) {
      const text = el.textContent?.trim();
      if (!text) return null;
      return {
        type: "text",
        textContent: text,
        fontFamily: style.fontFamily,
        fontWeight: parseInt(style.fontWeight) || 400,
        fontSize: parseFloat(style.fontSize) || 14,
        lineHeight: parseFloat(style.lineHeight) || undefined,
        color: parseRGBA(style.color),
        textAlign: style.textAlign !== "start" ? style.textAlign : undefined,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        fillWidth: getFlexGrow(el),
        fillHeight: getFillHeight(el) || undefined,
        tagName: el.tagName,
        dataSlot: el.getAttribute("data-slot") || undefined,
      };
    }

    // 4b. Mixed inline content (text + <a>, <span>, etc.) → merge into single text
    if (isMixedInline(el)) {
      const text = getMixedInlineText(el);
      if (text) {
        return {
          type: "text",
          textContent: text,
          fontFamily: style.fontFamily,
          fontWeight: parseInt(style.fontWeight) || 400,
          fontSize: parseFloat(style.fontSize) || 14,
          lineHeight: parseFloat(style.lineHeight) || undefined,
          color: parseRGBA(style.color),
          textAlign: style.textAlign !== "start" ? style.textAlign : undefined,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          fillWidth: getFlexGrow(el),
          fillHeight: getFillHeight(el) || undefined,
          tagName: el.tagName,
          dataSlot: el.getAttribute("data-slot") || undefined,
        };
      }
    }

    // 5. Layout frame — recurse children
    const children = [];
    for (const child of el.children) {
      // Skip absolutely positioned overlays (toggles, tooltips, floating elements)
      // These overlay sibling elements and don't participate in flex layout
      const childStyle = getComputedStyle(child);
      if (childStyle.position === "absolute" || childStyle.position === "fixed") {
        continue;
      }
      const node = walkDOM(child, depth + 1);
      if (node) children.push(node);
    }

    // Skip wrapper frames with only 1 child (flatten) — but keep if it has visual properties or meaningful alignment
    const _isFlex = style.display === "flex" || style.display === "inline-flex";
    const hasAlignment = _isFlex && (
      style.justifyContent === "center" || style.justifyContent === "space-between" ||
      style.justifyContent === "flex-end" || style.justifyContent === "space-around" ||
      style.alignItems === "center" || style.alignItems === "flex-end"
    );
    if (children.length === 1 && !parseRGBA(style.backgroundColor) && !getStrokeInfo(style) && !el.getAttribute("data-slot") && !hasAlignment) {
      const onlyChild = children[0];
      if (getFlexGrow(el) && !onlyChild.fillWidth) {
        onlyChild.fillWidth = true;
      }
      if (getFillHeight(el) && !onlyChild.fillHeight) {
        onlyChild.fillHeight = true;
      }
      return onlyChild;
    }

    if (children.length === 0) {
      const bg = parseRGBA(style.backgroundColor);
      if (bg) {
        return {
          type: "frame",
          name: el.getAttribute("data-slot") || undefined,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          fill: bg,
          radius: extractBorderRadius(style),
          opacity: parseFloat(style.opacity) !== 1 ? parseFloat(style.opacity) : undefined,
          tagName: el.tagName,
          dataSlot: el.getAttribute("data-slot") || undefined,
        };
      }
      return null;
    }

    const isFlex = style.display === "flex" || style.display === "inline-flex";
    const isGrid = style.display === "grid" || style.display === "inline-grid";
    const bg = parseRGBA(style.backgroundColor);
    const strokeInfo = getStrokeInfo(style);
    const gridCols = isGrid ? getGridCols(style) : undefined;
    const layout = isFlex ? mapFlexDir(style) : isGrid ? "horizontal" : "vertical";

    // Gap: first try computed gap, fallback to margin-based inference (space-y/space-x)
    let gap = isFlex || isGrid ? roundPx(style.gap || style.columnGap || "0") : 0;
    if (gap === 0 && children.length > 1) {
      gap = inferGapFromMargins(el, layout);
    }

    const node = {
      type: "frame",
      name: el.getAttribute("data-slot") || undefined,
      layout: layout,
      gap: gap,
      paddingTop: roundPx(style.paddingTop),
      paddingRight: roundPx(style.paddingRight),
      paddingBottom: roundPx(style.paddingBottom),
      paddingLeft: roundPx(style.paddingLeft),
      primaryAlign: isFlex ? mapJustify(style.justifyContent) : undefined,
      counterAlign: isFlex ? mapAlign(style.alignItems) : undefined,
      wrap: style.flexWrap === "wrap" || undefined,
      gridCols: gridCols,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      fillWidth: getFlexGrow(el),
      fillHeight: getFillHeight(el) || undefined,
      selfAlign: getSelfAlign(el) || undefined,
      fill: bg || undefined,
      stroke: strokeInfo ? strokeInfo.color : undefined,
      strokeWidth: strokeInfo ? strokeInfo.width : undefined,
      radius: extractBorderRadius(style) || undefined,
      overflow: style.overflow === "hidden" ? "hidden" : undefined,
      opacity: parseFloat(style.opacity) !== 1 ? parseFloat(style.opacity) : undefined,
      children,
      tagName: el.tagName,
      dataSlot: el.getAttribute("data-slot") || undefined,
      className: (typeof el.className === "string" ? el.className : "").substring(0, 200),
    };

    return node;
  }

  const root = document.getElementById("root") || document.body;
  const result = walkDOM(root, 0);
  return result;
}
`
