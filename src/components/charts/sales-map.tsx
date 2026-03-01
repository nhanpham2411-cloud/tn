import { useEffect, useRef, useState, useCallback } from "react"
import * as d3 from "d3"

export interface SalesLocation {
  city: string
  country: string
  lat: number
  lng: number
  sales: number
}

interface SalesMapProps {
  locations: SalesLocation[]
  className?: string
  highlightCity?: string | null
  onHover?: (location: SalesLocation | null) => void
}

const GEOJSON_URL =
  "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json"

/* ── point-in-polygon helpers ──────────────────────────── */

function pointInPolygon(pt: [number, number], ring: number[][]) {
  const [x, y] = pt
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      inside = !inside
  }
  return inside
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pointInFeature(pt: [number, number], feature: any) {
  const g = feature.geometry
  if (g.type === "Polygon") {
    if (!pointInPolygon(pt, g.coordinates[0])) return false
    for (let i = 1; i < g.coordinates.length; i++)
      if (pointInPolygon(pt, g.coordinates[i])) return false
    return true
  }
  if (g.type === "MultiPolygon") {
    for (const poly of g.coordinates) {
      if (pointInPolygon(pt, poly[0])) {
        let hole = false
        for (let i = 1; i < poly.length; i++)
          if (pointInPolygon(pt, poly[i])) { hole = true; break }
        if (!hole) return true
      }
    }
  }
  return false
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateDots(feature: any, spacing = 14) {
  const dots: [number, number][] = []
  const [[minLng, minLat], [maxLng, maxLat]] = d3.geoBounds(feature)
  const step = spacing * 0.1
  for (let lng = minLng; lng <= maxLng; lng += step)
    for (let lat = minLat; lat <= maxLat; lat += step)
      if (pointInFeature([lng, lat], feature)) dots.push([lng, lat])
  return dots
}

/* ── country code → flag emoji ───────────────────────── */
const FLAG_MAP: Record<string, string> = {
  US: "🇺🇸", UK: "🇬🇧", GB: "🇬🇧", FR: "🇫🇷", JP: "🇯🇵", AU: "🇦🇺",
  SG: "🇸🇬", AE: "🇦🇪", BR: "🇧🇷", DE: "🇩🇪", CA: "🇨🇦", KR: "🇰🇷",
  CN: "🇨🇳", IN: "🇮🇳", MX: "🇲🇽", NL: "🇳🇱", IT: "🇮🇹", ES: "🇪🇸", NG: "🇳🇬", ZA: "🇿🇦",
}
export function countryFlag(code: string) { return FLAG_MAP[code] || "🌍" }

/* ── component ─────────────────────────────────────────── */

export function SalesMap({ locations, className = "", highlightCity, onHover }: SalesMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [canvasHover, setCanvasHover] = useState<SalesLocation | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)

  const renderRef = useRef<(hoveredCity?: string | null) => void>(() => {})
  const projectionRef = useRef<d3.GeoProjection | null>(null)

  const handleHover = useCallback((loc: SalesLocation | null) => {
    setCanvasHover(loc)
    onHover?.(loc)
  }, [onHover])

  const activeCity = highlightCity ?? canvasHover?.city ?? null
  const activeLoc = locations.find((l) => l.city === activeCity) ?? canvasHover

  useEffect(() => {
    renderRef.current(activeCity)
  }, [activeCity])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    function isDark() {
      return document.documentElement.classList.contains("dark")
    }

    /* ── sizing ─────────────────────────── */
    const w = container.offsetWidth
    const h = container.offsetHeight || w * 0.48
    const dpr = window.devicePixelRatio || 2
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.scale(dpr, dpr)

    /* ── flat equirectangular projection ── */
    const bbox: d3.GeoPermissibleObjects = {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [[[-170, -57], [180, -57], [180, 78], [-170, 78], [-170, -57]]] },
      properties: {},
    }
    const projection = d3
      .geoEquirectangular()
      .fitSize([w, h], bbox)
      .precision(0.1)
    // scale down map content 90% while keeping centered
    projection.scale(projection.scale() * 0.90)
    const [tx, ty] = projection.translate()
    projection.translate([tx, ty + 10])

    projectionRef.current = projection

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let land: any = null
    const allDots: [number, number][] = []
    const maxSales = Math.max(...locations.map((l) => l.sales))

    /* ── bubble scale ──────────────────────── */
    const rScale = d3.scaleSqrt().domain([0, maxSales]).range([3, 8])

    /* ── sparkle state per dot — random phase + speed ── */
    const sparklePhases: number[] = []
    const sparkleSpeeds: number[] = []

    /* ── render ─────────────────────────── */
    let currentHoveredCity: string | null = null
    let frameTime = 0

    function render(hoveredCity?: string | null, time?: number) {
      if (hoveredCity !== undefined) currentHoveredCity = hoveredCity
      if (time !== undefined) frameTime = time
      ctx!.clearRect(0, 0, w, h)
      const dark = isDark()

      const dotR = dark ? [255, 255, 255] : [0, 0, 0]
      const dotBaseAlpha = dark ? 0.08 : 0.08
      const dotPeakExtra = dark ? 0.42 : 0.35

      if (!land) return

      // Land dots with sparkle animation
      allDots.forEach(([lng, lat], i) => {
        const p = projection([lng, lat])
        if (!p || p[0] < 0 || p[0] > w || p[1] < 0 || p[1] > h) return

        const phase = sparklePhases[i] ?? 0
        const speed = sparkleSpeeds[i] ?? 1
        const sparkle = 0.5 + 0.5 * Math.sin(frameTime * 0.001 * speed + phase)
        const alpha = dotBaseAlpha + sparkle * dotPeakExtra
        const radius = 0.8 + sparkle * 0.6

        ctx!.beginPath()
        ctx!.arc(p[0], p[1], radius, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${dotR.join(",")},${alpha.toFixed(3)})`
        ctx!.fill()
      })

      // Bubbles — largest first so small ones render on top
      const sorted = [...locations].sort((a, b) => b.sales - a.sales)
      sorted.forEach((loc) => {
        const p = projection([loc.lng, loc.lat])
        if (!p) return

        const isActive = currentHoveredCity === loc.city
        const r = rScale(loc.sales)
        const drawR = isActive ? r * 1.15 : r

        // Glow ring (globe style)
        const glowAlpha = isActive ? (dark ? 0.35 : 0.4) : (dark ? 0.2 : 0.28)
        ctx!.beginPath()
        ctx!.arc(p[0], p[1], drawR * 2, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(139,92,246,${glowAlpha.toFixed(3)})`
        ctx!.fill()

        // Solid dot (globe style)
        ctx!.beginPath()
        ctx!.arc(p[0], p[1], drawR, 0, Math.PI * 2)
        ctx!.fillStyle = isActive
          ? (dark ? "rgba(196,181,253,0.95)" : "rgba(124,58,237,0.9)")
          : (dark ? "rgba(167,139,250,0.8)" : "rgba(124,58,237,0.75)")
        ctx!.fill()
      })
    }

    renderRef.current = (city) => render(city)

    /* ── sparkle animation loop ──────────── */
    let animId: number
    function animate(time: number) {
      render(undefined, time)
      animId = requestAnimationFrame(animate)
    }

    /* ── load GeoJSON ────────────────────── */
    fetch(GEOJSON_URL)
      .then((r) => r.json())
      .then((data) => {
        land = data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.features.forEach((f: any) => {
          generateDots(f, 20).forEach((d) => {
            if (d[1] > -48) allDots.push(d) // hide Antarctica
          })
        })
        // Assign random sparkle phase + speed to each dot
        for (let i = 0; i < allDots.length; i++) {
          sparklePhases.push(Math.random() * Math.PI * 2)
          sparkleSpeeds.push(0.3 + Math.random() * 1.2)
        }
        setReady(true)
        render(null, 0)
        animId = requestAnimationFrame(animate)
      })
      .catch(() => {
        setReady(true)
        render(null, 0)
      })

    /* ── mouse interaction ─────────────── */
    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      let closest: SalesLocation | null = null
      let closestDist = Infinity
      locations.forEach((loc) => {
        const p = projection([loc.lng, loc.lat])
        if (!p) return
        const r = rScale(loc.sales)
        const dist = Math.sqrt((mx - p[0]) ** 2 + (my - p[1]) ** 2)
        if (dist < r + 10 && dist < closestDist) {
          closest = loc
          closestDist = dist
        }
      })

      if (closest !== null) {
        const cl = closest as SalesLocation
        const p = projection([cl.lng, cl.lat])
        if (p) setTooltipPos({ x: p[0], y: p[1] })
        handleHover(cl)
        currentHoveredCity = cl.city
      } else {
        setTooltipPos(null)
        handleHover(null)
        currentHoveredCity = null
      }
    }

    const handlePointerLeave = () => {
      setTooltipPos(null)
      handleHover(null)
      currentHoveredCity = null
    }

    canvas.addEventListener("pointermove", handlePointerMove)
    canvas.addEventListener("pointerleave", handlePointerLeave)

    /* ── resize ─────────────────────────── */
    const onResize = () => {
      if (!container) return
      const nw = container.offsetWidth
      const nh = container.offsetHeight || nw * 0.48
      canvas.width = nw * dpr
      canvas.height = nh * dpr
      canvas.style.width = `${nw}px`
      canvas.style.height = `${nh}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      projection.fitSize([nw, nh], bbox)
    }
    window.addEventListener("resize", onResize)

    const themeObserver = new MutationObserver(() => {})
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    return () => {
      cancelAnimationFrame(animId)
      canvas.removeEventListener("pointermove", handlePointerMove)
      canvas.removeEventListener("pointerleave", handlePointerLeave)
      window.removeEventListener("resize", onResize)
      themeObserver.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalSales = locations.reduce((s, l) => s + l.sales, 0)

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative w-full aspect-[2.8/1]">
        <canvas
          ref={canvasRef}
          className={`size-full cursor-default transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
          style={{ contain: "layout paint size" }}
        />

        {/* Tooltip */}
        {activeLoc && (tooltipPos || highlightCity) && (() => {
          const proj = projectionRef.current
          const pos = tooltipPos ?? (proj ? (() => { const pp = proj([activeLoc.lng, activeLoc.lat]); return pp ? { x: pp[0], y: pp[1] } : null })() : null)
          if (!pos) return null
          return (
            <div
              className="absolute z-20 pointer-events-none"
              style={{
                left: pos.x,
                top: pos.y,
                transform: "translate(-50%, -100%) translateY(-16px)",
              }}
            >
              <div className="whitespace-nowrap rounded-xl bg-popover backdrop-blur-md border border-border/40 dark:border-white/[0.1] px-lg py-sm shadow-lg">
                <div className="flex items-center gap-xs mb-3xs">
                  <span className="text-[14px] leading-none">{countryFlag(activeLoc.country)}</span>
                  <span className="sp-body-medium text-foreground">{activeLoc.city}</span>
                </div>
                <div className="flex items-center gap-sm">
                  <span className="sp-data text-foreground font-semibold">
                    ${activeLoc.sales.toLocaleString()}
                  </span>
                  <span className="sp-caption text-muted-foreground">
                    {((activeLoc.sales / totalSales) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
