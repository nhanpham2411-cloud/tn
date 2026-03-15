import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Thumbnail } from "@/components/ui/thumbnail"
import { ShopPulseLogo } from "@/components/layout/auth-layout"
import { figma } from "@/lib/figma-dev"

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
      toast.error("Please enter a valid email address")
      return
    }

    setError("")
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      toast.success("Reset link sent to your email")
      setSent(true)
    }, 1200)
  }

  if (sent) {
    return (
      <Card className="w-full max-w-[440px] border-0 shadow-none sm:border sm:shadow-sm">
        <CardHeader className="items-center text-center">
          <Thumbnail type="icon" shape="circle" size="lg" color="success" icon={<CheckCircle2 className="size-[24px]" />} className="mb-sm" />
          <CardTitle className="sp-h2">Check your email</CardTitle>
          <CardDescription>
            We've sent a password reset link to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-sm">
          <Button variant="outline" className="w-full" asChild>
            <a href={`mailto:${email}`}>
              <Mail className="mr-xs size-md" />
              Open Email App
            </a>
          </Button>
          <p className="sp-caption text-center text-muted-foreground">
            Didn't receive the email? Check your spam folder or
            <br />
            <span
              onClick={() => setSent(false)}
              className="text-primary font-medium hover:underline cursor-pointer"
            >
              try another email
            </span>
          </p>
        </CardContent>

        <CardFooter className="justify-center">
          <Button variant="ghost" className="w-full" onClick={() => navigate("/auth/sign-in")}>
            <ArrowLeft />
            Back to sign in
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-[440px] border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="gap-md">
        <div className="flex w-fit items-center gap-xs lg:hidden" {...figma("Logo", { Type: "Full", Size: "Default" })}>
          <ShopPulseLogo size={32} />
          <span className="font-heading text-lg font-bold text-foreground">ShopPulse</span>
        </div>
        <div className="flex flex-col gap-3xs">
          <CardTitle className="sp-h2">Forgot password?</CardTitle>
          <CardDescription>Enter your email and we'll send you a reset link</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-md">
          <div className="flex flex-col gap-3xs">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? "email-error" : undefined}
            />
            {error && (
              <p id="email-error" className="sp-caption text-destructive">{error}</p>
            )}
          </div>

          <div className="flex flex-col gap-xs">
            <Button type="submit" className="w-full" disabled={!email || submitting}>
              {submitting ? <Loader2 className="size-md animate-spin" /> : "Send Reset Link"}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate("/auth/sign-in")}>
              <ArrowLeft />
              Back to sign in
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
