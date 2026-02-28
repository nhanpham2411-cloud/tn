import { useState } from "react"
import { Link } from "react-router-dom"
import { Eye, EyeOff, Check, X } from "lucide-react"

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
const strengthColors = ["bg-destructive", "bg-destructive", "bg-warning", "bg-primary", "bg-chart-2"]

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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

    if (Object.keys(newErrors).length === 0) {
      window.location.href = "/auth/onboarding"
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-sm flex size-3xl items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <span className="typo-heading-3">D</span>
        </div>
        <CardTitle className="typo-heading-2">Create an account</CardTitle>
        <CardDescription>
          Get started with DataFlow in minutes
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          {/* Name */}
          <div className="flex flex-col gap-xs">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="typo-paragraph-mini text-destructive">{errors.name}</p>
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
              <p className="typo-paragraph-mini text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-xs">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
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
            {errors.password && (
              <p className="typo-paragraph-mini text-destructive">{errors.password}</p>
            )}

            {/* Password strength */}
            {password && (
              <div className="flex flex-col gap-xs">
                <div className="flex items-center gap-xs">
                  <Progress
                    value={(strength / 5) * 100}
                    className="h-1.5 flex-1"
                  />
                  <span className="typo-paragraph-mini text-muted-foreground">
                    {strengthLabels[strength - 1] || "Too Short"}
                  </span>
                </div>
                <ul className="flex flex-col gap-3xs">
                  {requirements.map((req) => (
                    <li key={req.label} className="flex items-center gap-xs">
                      {req.met ? (
                        <Check className="size-sm text-chart-2" />
                      ) : (
                        <X className="size-sm text-muted-foreground" />
                      )}
                      <span
                        className={`typo-paragraph-mini ${
                          req.met ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
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
            <Label htmlFor="terms" className="typo-paragraph-sm cursor-pointer leading-tight">
              I agree to the{" "}
              <span className="text-primary hover:underline cursor-pointer">Terms of Service</span>{" "}
              and{" "}
              <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>
            </Label>
          </div>
          {errors.terms && (
            <p className="typo-paragraph-mini text-destructive">{errors.terms}</p>
          )}

          {/* Submit */}
          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>
      </CardContent>

      {/* Social signup */}
      <CardContent className="pt-0">
        <div className="flex items-center gap-md">
          <Separator className="flex-1" />
          <span className="typo-paragraph-mini text-muted-foreground">or</span>
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
        <p className="typo-paragraph-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/auth/sign-in" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

void strengthColors // used dynamically
