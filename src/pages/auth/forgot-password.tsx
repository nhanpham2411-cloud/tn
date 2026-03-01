import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, BarChart3, CheckCircle2, Loader2, Mail } from "lucide-react"
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
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
      <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-sm flex size-[48px] items-center justify-center rounded-full bg-success/10 dark:bg-success/20">
            <CheckCircle2 className="size-xl text-success" />
          </div>
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
            Didn't receive the email? Check your spam folder or{" "}
            <Button
              variant="ghost"
              onClick={() => setSent(false)}
              className="h-auto p-0 text-primary hover:underline hover:bg-transparent"
            >
              try another email
            </Button>
          </p>
        </CardContent>

        <CardFooter className="justify-center">
          <Link
            to="/auth/sign-in"
            className="sp-body text-muted-foreground hover:text-foreground inline-flex items-center gap-xs transition-colors"
          >
            <ArrowLeft className="size-md" />
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-sm flex size-[40px] items-center justify-center rounded-xl bg-primary text-primary-foreground lg:hidden">
          <BarChart3 className="size-[20px]" />
        </div>
        <CardTitle className="sp-h2">Forgot password?</CardTitle>
        <CardDescription>Enter your email and we'll send you a reset link</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
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

          <Button type="submit" className="w-full" disabled={!email || submitting}>
            {submitting ? <Loader2 className="size-md animate-spin" /> : "Send Reset Link"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <Link
          to="/auth/sign-in"
          className="sp-body text-muted-foreground hover:text-foreground inline-flex items-center gap-xs transition-colors"
        >
          <ArrowLeft className="size-md" />
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  )
}
