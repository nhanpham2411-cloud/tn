import { Link } from "react-router-dom"
import { ArrowLeft, Home } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-xl">
      <div className="flex flex-col items-center gap-lg text-center max-w-md">
        <div className="flex size-4xl items-center justify-center rounded-2xl bg-muted">
          <span className="sp-h1 text-muted-foreground">404</span>
        </div>

        <div className="flex flex-col gap-xs">
          <h1 className="sp-h2 text-foreground">Page not found</h1>
          <p className="sp-body-lg text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex gap-sm">
          <Button variant="outline" asChild>
            <Link to={-1 as unknown as string} onClick={(e) => { e.preventDefault(); window.history.back() }}>
              <ArrowLeft className="mr-xs size-md" />
              Go Back
            </Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard">
              <Home className="mr-xs size-md" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
