import { useEffect, useState } from "react"

// Recharts needs resolved hex colors, not CSS custom properties
export function useChartColors() {
  const [colors, setColors] = useState<Record<string, string>>({})

  useEffect(() => {
    function resolve() {
      const style = getComputedStyle(document.documentElement)
      const colorNames = [
        "chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6",
        "primary", "muted", "border", "foreground", "muted-foreground",
        "card", "background", "success", "destructive", "surface-inset",
      ]
      const resolved: Record<string, string> = {}
      for (const name of colorNames) {
        // Try --color-* first (@theme), fall back to --* (inline tokens)
        const val = style.getPropertyValue(`--color-${name}`).trim()
          || style.getPropertyValue(`--${name}`).trim()
        resolved[name] = val || "#888"
      }
      setColors(resolved)
    }

    resolve()

    // Re-resolve on theme change
    const observer = new MutationObserver(resolve)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [])

  return colors
}
