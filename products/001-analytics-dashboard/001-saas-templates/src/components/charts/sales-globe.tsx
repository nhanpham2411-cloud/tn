import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { CountryFlag } from "@/components/charts/sales-map"

export interface SalesLocation {
  city: string
  country: string
  lat: number
  lng: number
  sales: number
}

interface SalesGlobeProps {
  locations: SalesLocation[]
  className?: string
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
function generateDots(feature: any, spacing = 16) {
  const dots: [number, number][] = []
  const [[minLng, minLat], [maxLng, maxLat]] = d3.geoBounds(feature)
  const step = spacing * 0.08
  for (let lng = minLng; lng <= maxLng; lng += step)
    for (let lat = minLat; lat <= maxLat; lat += step)
      if (pointInFeature([lng, lat], feature)) dots.push([lng, lat])
  return dots
}

/* ── country flags → imported from sales-map ─── */

/* ── component ─────────────────────────────────────────── */

export function SalesGlobe({ locations, className = "" }: SalesGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const labelsRef = useRef<(HTMLDivElement | null)[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    /* ── theme detection ─────────────────── */
    function isDark() {
      return document.documentElement.classList.contains("dark")
    }

    /* ── sizing ─────────────────────────── */
    const size = container.offsetWidth
    const dpr = window.devicePixelRatio || 2
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const radius = size / 2.3
    const cx = size / 2
    const cy = size / 2

    /* ── d3 projection ──────────────────── */
    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([cx, cy])
      .clipAngle(90)

    const pathGen = d3.geoPath().projection(projection).context(ctx)
    const graticule = d3.geoGraticule()

    /* ── state ──────────────────────────── */
    const rotation: [number, number] = [0, -15]
    let autoRotate = true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let land: any = null
    const allDots: [number, number][] = []

    /* ── visibility check — front hemisphere only ── */
    function isVisible(lng: number, lat: number) {
      const r = projection.rotate() as [number, number, number]
      const rotated = d3.geoRotation(r)([lng, lat])
      return rotated ? d3.geoDistance(rotated, [0, 0]) < Math.PI / 2 : false
    }

    /* ── edge fade — front hemisphere, dim near limb ── */
    function edgeFade(lng: number, lat: number) {
      const r = projection.rotate() as [number, number, number]
      const rotated = d3.geoRotation(r)([lng, lat])
      if (!rotated) return 0
      const dist = d3.geoDistance(rotated, [0, 0])
      const t = dist / (Math.PI / 2)
      return Math.max(0, 1 - t * 0.6)
    }

    /* ── render ─────────────────────────── */
    function render() {
      ctx!.clearRect(0, 0, size, size)
      const s = projection.scale()
      const sf = s / radius
      const dark = isDark()

      // Theme-aware palette
      const discFill = dark ? "rgba(10,10,16,0.05)" : "rgba(0,0,0,0.04)"
      const discStroke = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.12)"
      const gridStroke = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"
      const landStroke = dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.25)"
      const dotBase = dark ? [255, 255, 255] : [0, 0, 0]
      const dotAlpha = dark ? 0.35 : 0.35

      // Globe disc
      ctx!.beginPath()
      ctx!.arc(cx, cy, s, 0, Math.PI * 2)
      ctx!.fillStyle = discFill
      ctx!.fill()
      ctx!.strokeStyle = discStroke
      ctx!.lineWidth = 1 * sf
      ctx!.stroke()

      if (!land) return

      // Graticule grid
      ctx!.beginPath()
      pathGen(graticule())
      ctx!.strokeStyle = gridStroke
      ctx!.lineWidth = 0.5 * sf
      ctx!.stroke()

      // Land outlines
      ctx!.beginPath()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      land.features.forEach((f: any) => pathGen(f))
      ctx!.strokeStyle = landStroke
      ctx!.lineWidth = 0.8 * sf
      ctx!.stroke()

      // Halftone dots (land) — front hemisphere only, edge-faded
      allDots.forEach(([lng, lat]) => {
        if (!isVisible(lng, lat)) return
        const p = projection([lng, lat])
        if (p) {
          const fade = edgeFade(lng, lat)
          ctx!.beginPath()
          ctx!.arc(p[0], p[1], 1 * sf, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${dotBase.join(",")},${(dotAlpha * fade).toFixed(3)})`
          ctx!.fill()
        }
      })

      // Marker dots for sales locations — only when label is visible enough
      locations.forEach((loc) => {
        if (!isVisible(loc.lng, loc.lat)) return
        const fade = edgeFade(loc.lng, loc.lat)
        if (fade < 0.15) return // skip near-limb dots where labels won't show
        const p = projection([loc.lng, loc.lat])
        if (p) {
          // Glow
          const glowAlpha = dark ? 0.25 : 0.35
          ctx!.beginPath()
          ctx!.arc(p[0], p[1], 5 * sf, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(139,92,246,${(glowAlpha * fade).toFixed(3)})`
          ctx!.fill()
          // Dot
          ctx!.beginPath()
          ctx!.arc(p[0], p[1], 2.5 * sf, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(124,58,237,${fade.toFixed(3)})`
          ctx!.fill()
        }
      })

      // Project HTML labels — front hemisphere only, edge-faded
      locations.forEach((loc, i) => {
        const el = labelsRef.current[i]
        if (!el) return
        if (!isVisible(loc.lng, loc.lat)) { el.style.opacity = "0"; return }
        const p = projection([loc.lng, loc.lat])
        if (p && p[0] >= 0 && p[0] <= size && p[1] >= 0 && p[1] <= size) {
          const fade = edgeFade(loc.lng, loc.lat)
          el.style.transform = `translate(${p[0]}px, ${p[1]}px)`
          el.style.opacity = String(Math.min(1, fade * 1.5))
        } else {
          el.style.opacity = "0"
        }
      })
    }

    /* ── load data ──────────────────────── */
    fetch(GEOJSON_URL)
      .then((r) => r.json())
      .then((data) => {
        land = data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.features.forEach((f: any) => {
          generateDots(f, 16).forEach((d) => allDots.push(d))
        })
        setReady(true)
        render()
      })
      .catch(() => {
        // Fallback: still render globe sphere + markers without land
        setReady(true)
        render()
      })

    /* ── auto-rotate ────────────────────── */
    const timer = d3.timer(() => {
      if (autoRotate) {
        rotation[0] += 0.3
        projection.rotate(rotation)
        render()
      }
    })

    /* ── drag interaction (360°) ────────── */
    const handlePointerDown = (e: PointerEvent) => {
      autoRotate = false
      const startX = e.clientX
      const startY = e.clientY
      const startRot: [number, number] = [...rotation]

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX
        const dy = ev.clientY - startY
        rotation[0] = startRot[0] + dx * 0.4
        rotation[1] = Math.max(-60, Math.min(60, startRot[1] - dy * 0.4))
        projection.rotate(rotation)
        render()
      }

      const onUp = () => {
        document.removeEventListener("pointermove", onMove)
        document.removeEventListener("pointerup", onUp)
        setTimeout(() => { autoRotate = true }, 50)
      }

      document.addEventListener("pointermove", onMove)
      document.addEventListener("pointerup", onUp)
    }

    canvas.addEventListener("pointerdown", handlePointerDown)

    /* ── resize ─────────────────────────── */
    const onResize = () => {
      if (!container) return
      const w = container.offsetWidth
      canvas.width = w * dpr
      canvas.height = w * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${w}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      projection.translate([w / 2, w / 2]).scale(w / 2.3)
      render()
    }
    window.addEventListener("resize", onResize)

    /* ── re-render on theme change ────────── */
    const themeObserver = new MutationObserver(() => render())
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    return () => {
      timer.stop()
      canvas.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("resize", onResize)
      themeObserver.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={containerRef} className={className}>
      <div className="relative aspect-square w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className={`size-full cursor-grab transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
          style={{ contain: "layout paint size" }}
        />

        {/* HTML labels overlay */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {locations.map((loc, i) => (
            <div
              key={loc.city}
              ref={(el) => { labelsRef.current[i] = el }}
              className="absolute left-0 top-0"
              style={{ opacity: 0, willChange: "transform, opacity" }}
            >
              <div className="flex flex-col items-center -translate-x-1/2 -translate-y-full pb-xs">
                <div className="whitespace-nowrap rounded-lg bg-popover backdrop-blur-md border border-border-subtle dark:border-white/[0.1] px-sm py-2xs flex items-center gap-2xs shadow-md dark:shadow-lg">
                  <CountryFlag code={loc.country} size={16} />
                  <span className="sp-label text-foreground leading-none">
                    {loc.city}
                  </span>
                  <span className="sp-label text-primary font-bold leading-none">
                    {(loc.sales / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
