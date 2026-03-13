import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react"
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
import { Progress } from "@/components/ui/progress"
import { ShopPulseLogo } from "@/components/layout/auth-layout"
import { GoogleIcon, FacebookIcon } from "@/components/ui/brand-icons"
import { figma } from "@/lib/figma-dev"

function getPasswordStrength(password: string) {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"]
const strengthColors: Record<number, string> = {
  1: "text-destructive",
  2: "text-destructive",
  3: "text-warning",
  4: "text-primary",
  5: "text-success",
}

export default function SignUpPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const strength = getPasswordStrength(password)

  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(password) },
  ]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = "Name is required"
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Please enter a valid email address"
    if (!password || password.length < 8)
      newErrors.password = "Password must be at least 8 characters"
    if (!terms) newErrors.terms = "You must accept the terms"

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors below")
      return
    }

    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      toast.success("Account created successfully")
      navigate("/auth/onboarding")
    }, 1200)
  }

  return (
    <Card className="w-full max-w-[440px] border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="gap-md">
        <div className="flex w-fit items-center gap-xs lg:hidden" {...figma("Logo", { Type: "Full", Size: "Default" })}>
          <ShopPulseLogo size={32} />
          <span className="font-heading text-lg font-bold text-foreground">ShopPulse</span>
        </div>
        <div className="flex flex-col gap-3xs">
          <CardTitle className="sp-h2">Create an account</CardTitle>
          <CardDescription>Get started with ShopPulse in minutes</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-md">
          {/* Name */}
          <div className="flex flex-col gap-xs">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="sp-caption text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-xs">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="sp-caption text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-xs">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
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
            {errors.password && (
              <p className="sp-caption text-destructive">{errors.password}</p>
            )}

            {/* Password strength */}
            {password && (
              <div className="flex flex-col gap-xs">
                <div className="flex items-center gap-xs">
                  <Progress value={(strength / 5) * 100} className="h-1.5 flex-1" />
                  <span className={`sp-caption ${strengthColors[strength] || "text-muted-foreground"}`}>
                    {strengthLabels[strength - 1] || "Too Short"}
                  </span>
                </div>
                <ul className="flex flex-col gap-3xs">
                  {requirements.map((req) => (
                    <li key={req.label} className="flex items-center gap-xs">
                      {req.met ? (
                        <Check className="size-sm text-success" />
                      ) : (
                        <X className="size-sm text-muted-foreground" />
                      )}
                      <span className={`sp-caption ${req.met ? "text-foreground" : "text-muted-foreground"}`}>
                        {req.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-xs">
            <Checkbox
              id="terms"
              checked={terms}
              onCheckedChange={(checked) => setTerms(checked === true)}
              aria-invalid={!!errors.terms}
            />
            <Label htmlFor="terms" className="sp-body cursor-pointer leading-tight">
              I agree to the{" "}
              <span className="text-primary hover:underline cursor-pointer">Terms of Service</span>{" "}
              and{" "}
              <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>
            </Label>
          </div>
          {errors.terms && (
            <p className="sp-caption text-destructive">{errors.terms}</p>
          )}

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={!name.trim() || !email || !password || !terms || submitting}>
            {submitting ? <Loader2 className="size-md animate-spin" /> : "Create Account"}
          </Button>
        </form>
      </CardContent>

      {/* Social signup */}
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
          Already have an account?{" "}
          <Link to="/auth/sign-in" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </CardFooter>
    </Card>
  )
}
