import { useLocation } from "react-router-dom"

/**
 * Wraps page content with a fade-in + slide-up animation on route change.
 * Uses CSS keyframes (no extra library needed).
 */
export function PageTransition({ children, className }: { children: React.ReactNode; className?: string }) {
  const location = useLocation()
  return (
    <div key={location.pathname} className={`animate-page-in${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  )
}
