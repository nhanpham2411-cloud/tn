import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Loader2 } from "lucide-react"
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
import { ShopPulseLogo } from "@/components/layout/auth-layout"
import { GoogleIcon, FacebookIcon } from "@/components/ui/brand-icons"
import { figma } from "@/lib/figma-dev"

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

    if (!valid) {
      toast.error("Please fix the errors below")
      return
    }

    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      toast.success("Signed in successfully")
      navigate("/dashboard")
    }, 1200)
  }

  return (
    <Card className="w-full max-w-[440px] border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="gap-md">
        {/* Logo — visible on mobile only (desktop has sidebar branding) */}
        <div className="flex w-fit items-center gap-xs lg:hidden" {...figma("Logo", { Type: "Full", Size: "Default" })}>
          <ShopPulseLogo size={32} />
          <span className="font-heading text-lg font-bold text-foreground">ShopPulse</span>
        </div>
        <div className="flex flex-col gap-3xs">
          <CardTitle className="sp-h2">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-md">
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
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? "password-error" : undefined}
              iconRight={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="pointer-events-auto cursor-pointer"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              }
            />
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
          <span className="sp-caption text-muted-foreground whitespace-nowrap">or continue with</span>
          <Separator className="flex-1" />
        </div>
      </CardContent>

      <CardContent className="grid grid-cols-2 gap-sm pt-0">
        <Button variant="outline" className="w-full">
          <GoogleIcon />
          <span>Google</span>
        </Button>
        <Button variant="outline" className="w-full">
          <FacebookIcon />
          <span>Facebook</span>
        </Button>
      </CardContent>

      <CardFooter>
        <p className="sp-body text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/auth/sign-up" className="text-primary font-medium hover:underline">Sign up</Link>
        </p>
      </CardFooter>
    </Card>
  )
}
