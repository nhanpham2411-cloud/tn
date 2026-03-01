import { Link } from "react-router-dom"
import { ArrowLeft, Home, Search } from "lucide-react"

import { Button } from "@/components/ui/button"

/* ─── Inline SVG Illustration ─── */
function NotFoundIllustration() {
  return (
    <svg width="320" height="220" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[320px]" aria-hidden="true">
      {/* Ground shadow */}
      <ellipse cx="160" cy="200" rx="120" ry="12" className="fill-muted/60" />

      {/* Floating document — left */}
      <g className="animate-[float_4s_ease-in-out_infinite]">
        <rect x="30" y="80" width="56" height="72" rx="8" className="fill-card stroke-border" strokeWidth="1.5" />
        <rect x="40" y="96" width="36" height="4" rx="2" className="fill-muted-foreground/20" />
        <rect x="40" y="106" width="28" height="4" rx="2" className="fill-muted-foreground/20" />
        <rect x="40" y="116" width="32" height="4" rx="2" className="fill-muted-foreground/20" />
        <circle cx="58" cy="132" r="6" className="fill-destructive/20" />
        <path d="M55 132L57 134L61 130" className="stroke-destructive" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Main broken page — center */}
      <g className="animate-[float_5s_ease-in-out_0.5s_infinite]">
        <rect x="110" y="40" width="100" height="130" rx="12" className="fill-card stroke-border" strokeWidth="2" />
        {/* Header bar */}
        <rect x="122" y="54" width="76" height="8" rx="4" className="fill-primary/15" />
        {/* Content lines */}
        <rect x="122" y="72" width="60" height="4" rx="2" className="fill-muted-foreground/15" />
        <rect x="122" y="82" width="48" height="4" rx="2" className="fill-muted-foreground/15" />
        <rect x="122" y="92" width="54" height="4" rx="2" className="fill-muted-foreground/15" />
        {/* Broken / crack line */}
        <path d="M140 108 L155 114 L145 124 L160 130 L148 140" className="stroke-destructive/40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" />
        {/* Question mark */}
        <circle cx="160" cy="115" r="18" className="fill-destructive/10" />
        <text x="160" y="122" textAnchor="middle" className="fill-destructive/60" fontSize="20" fontWeight="700">?</text>
      </g>

      {/* Floating document — right */}
      <g className="animate-[float_4.5s_ease-in-out_1s_infinite]">
        <rect x="234" y="70" width="56" height="72" rx="8" className="fill-card stroke-border" strokeWidth="1.5" />
        <rect x="244" y="86" width="36" height="4" rx="2" className="fill-muted-foreground/20" />
        <rect x="244" y="96" width="24" height="4" rx="2" className="fill-muted-foreground/20" />
        <rect x="244" y="106" width="30" height="4" rx="2" className="fill-muted-foreground/20" />
        <circle cx="262" cy="122" r="6" className="fill-primary/20" />
        <rect x="258" y="119" width="8" height="6" rx="1" className="fill-primary/40" />
      </g>

      {/* Sparkles / dots decoration */}
      <circle cx="100" cy="50" r="3" className="fill-primary/30 animate-pulse" />
      <circle cx="230" cy="45" r="2.5" className="fill-warning/40 animate-pulse" style={{ animationDelay: "0.5s" }} />
      <circle cx="55" cy="170" r="2" className="fill-success/30 animate-pulse" style={{ animationDelay: "1s" }} />
      <circle cx="275" cy="160" r="2.5" className="fill-emphasis/30 animate-pulse" style={{ animationDelay: "1.5s" }} />
      <circle cx="160" cy="25" r="2" className="fill-destructive/25 animate-pulse" style={{ animationDelay: "0.8s" }} />
    </svg>
  )
}

export default function NotFoundPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-xl">
      <div className="flex flex-col items-center gap-2xl text-center max-w-lg">
        {/* Illustration */}
        <NotFoundIllustration />

        {/* 404 badge */}
        <div className="inline-flex items-center gap-xs px-md py-2xs rounded-full border border-destructive/20 bg-destructive/5 dark:bg-destructive/10">
          <Search className="size-[14px] text-destructive/60" />
          <span className="sp-label font-semibold text-destructive/80 tracking-wider">ERROR 404</span>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-sm">
          <h1 className="sp-h1 text-foreground">Page not found</h1>
          <p className="sp-body-lg text-muted-foreground max-w-sm mx-auto leading-relaxed">
            The page you're looking for doesn't exist, has been moved, or you may not have permission to view it.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-sm w-full sm:w-auto">
          <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
            <Link to={-1 as unknown as string} onClick={(e) => { e.preventDefault(); window.history.back() }}>
              <ArrowLeft className="mr-xs size-md" />
              Go Back
            </Link>
          </Button>
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link to="/dashboard">
              <Home className="mr-xs size-md" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
