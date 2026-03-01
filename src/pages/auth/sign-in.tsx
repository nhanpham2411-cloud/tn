import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BarChart3, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

/* Social icons (inline SVG for zero deps) */
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  )
}

export default function SignInPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    let valid = true

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address")
      valid = false
    } else {
      setEmailError("")
    }

    if (!password || password.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      valid = false
    } else {
      setPasswordError("")
    }

    if (valid) {
      setSubmitting(true)
      setTimeout(() => {
        setSubmitting(false)
        toast.success("Signed in successfully")
        navigate("/dashboard")
      }, 1200)
    }
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="text-center">
        {/* Logo — visible on mobile only (desktop has sidebar branding) */}
        <div className="mx-auto mb-sm flex size-[40px] items-center justify-center rounded-xl bg-primary text-primary-foreground lg:hidden">
          <BarChart3 className="size-[20px]" />
        </div>
        <CardTitle className="sp-h2">Welcome back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          {/* Email */}
          <div className="flex flex-col gap-xs">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-error" : undefined}
            />
            {emailError && (
              <p id="email-error" className="sp-caption text-destructive">{emailError}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-xs">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? "password-error" : undefined}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full w-[40px] hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-md" /> : <Eye className="size-md" />}
              </Button>
            </div>
            {passwordError && (
              <p id="password-error" className="sp-caption text-destructive">{passwordError}</p>
            )}
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-xs">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="sp-body cursor-pointer">Remember me</Label>
            </div>
            <Link to="/auth/forgot-password" className="sp-body text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={!email || !password || submitting}>
            {submitting ? <Loader2 className="size-md animate-spin" /> : "Sign In"}
          </Button>
        </form>
      </CardContent>

      {/* Social login */}
      <CardContent className="pt-0">
        <div className="flex items-center gap-md">
          <Separator className="flex-1" />
          <span className="sp-caption text-muted-foreground">or continue with</span>
          <Separator className="flex-1" />
        </div>
      </CardContent>

      <CardContent className="flex gap-sm pt-0">
        <Button variant="outline" className="w-full">
          <GoogleIcon />
          Google
        </Button>
        <Button variant="outline" className="w-full">
          <GitHubIcon />
          GitHub
        </Button>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="sp-body text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/auth/sign-up" className="text-primary font-medium hover:underline">Sign up</Link>
        </p>
      </CardFooter>
    </Card>
  )
}
