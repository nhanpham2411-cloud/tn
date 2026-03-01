import { useState } from "react"
import { Link } from "react-router-dom"
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

export default function SignInPage() {
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
        window.location.href = "/dashboard"
      }, 1200)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-sm flex size-3xl items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <span className="sp-h3">D</span>
        </div>
        <CardTitle className="sp-h2">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
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
              <p id="email-error" className="sp-caption text-destructive">
                {emailError}
              </p>
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
                size="sm"
                className="absolute right-0 top-0 h-full px-sm hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-md" /> : <Eye className="size-md" />}
              </Button>
            </div>
            {passwordError && (
              <p id="password-error" className="sp-caption text-destructive">
                {passwordError}
              </p>
            )}
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-xs">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="sp-body cursor-pointer">
                Remember me
              </Label>
            </div>
            <Link
              to="/auth/forgot-password"
              className="sp-body text-primary hover:underline"
            >
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
          <span className="sp-caption text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>
      </CardContent>

      <CardContent className="flex flex-col gap-sm pt-0">
        <Button variant="outline" className="w-full">
          Continue with Google
        </Button>
        <Button variant="outline" className="w-full">
          Continue with GitHub
        </Button>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="sp-body text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/auth/sign-up" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
