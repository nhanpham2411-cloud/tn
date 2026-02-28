import { useEffect, useState } from "react"

// Recharts needs resolved hex colors, not CSS custom properties
export function useChartColors() {
  const [colors, setColors] = useState<Record<string, string>>({})

  useEffect(() => {
    function resolve() {
      const style = getComputedStyle(document.documentElement)
      const colorNames = [
        "chart-1", "chart-2", "chart-3", "chart-4", "chart-5",
        "primary", "muted", "border", "foreground", "muted-foreground",
      ]
      const resolved: Record<string, string> = {}
      for (const name of colorNames) {
        const val = style.getPropertyValue(`--color-${name}`).trim()
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
