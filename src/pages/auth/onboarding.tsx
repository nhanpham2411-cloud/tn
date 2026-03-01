import { useState } from "react"
import { Check } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"

const steps = [
  { title: "Company Info", description: "Tell us about your organization" },
  { title: "Invite Team", description: "Add your team members" },
  { title: "Preferences", description: "Customize your experience" },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [companyName, setCompanyName] = useState("")
  const [industry, setIndustry] = useState("")
  const [teamSize, setTeamSize] = useState("1-10")
  const [emails, setEmails] = useState([""])
  const [timezone, setTimezone] = useState("")

  const progress = ((currentStep + 1) / steps.length) * 100

  function addEmail() {
    setEmails([...emails, ""])
  }

  function updateEmail(index: number, value: string) {
    const updated = [...emails]
    updated[index] = value
    setEmails(updated)
  }

  function removeEmail(index: number) {
    if (emails.length <= 1) return
    setEmails(emails.filter((_, i) => i !== index))
  }

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      window.location.href = "/dashboard"
    }
  }

  function handleBack() {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        {/* Step indicator */}
        <div className="flex items-center gap-sm mb-md">
          {steps.map((step, i) => (
            <div key={step.title} className="flex items-center gap-xs">
              <div
                className={`flex size-2xl items-center justify-center rounded-full typo-paragraph-sm-bold ${
                  i < currentStep
                    ? "bg-primary text-primary-foreground"
                    : i === currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i < currentStep ? <Check className="size-sm" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 w-lg ${
                    i < currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Progress value={progress} className="mb-md" />

        <CardTitle className="typo-heading-3">{steps[currentStep].title}</CardTitle>
        <CardDescription>{steps[currentStep].description}</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Step 1: Company Info */}
        {currentStep === 0 && (
          <div className="flex flex-col gap-md">
            <div className="flex flex-col gap-xs">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                placeholder="Acme Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-xs">
              <Label>Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="fintech">Fintech</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-xs">
              <Label>Team Size</Label>
              <RadioGroup value={teamSize} onValueChange={setTeamSize} className="flex gap-md">
                {["1-10", "11-50", "51-200", "200+"].map((size) => (
                  <div key={size} className="flex items-center gap-xs">
                    <RadioGroupItem value={size} id={`size-${size}`} />
                    <Label htmlFor={`size-${size}`} className="cursor-pointer">
                      {size}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        )}

        {/* Step 2: Invite Team */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-md">
            <p className="typo-paragraph-sm text-muted-foreground">
              Invite team members by email. You can always add more later.
            </p>
            {emails.map((email, i) => (
              <div key={i} className="flex items-center gap-xs">
                <Input
                  type="email"
                  placeholder="colleague@example.com"
                  value={email}
                  onChange={(e) => updateEmail(i, e.target.value)}
                />
                {emails.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEmail(i)}
                    aria-label="Remove email"
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addEmail} className="w-fit">
              + Add another
            </Button>
          </div>
        )}

        {/* Step 3: Preferences */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-md">
            <div className="flex flex-col gap-xs">
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                  <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                  <SelectItem value="utc+0">UTC</SelectItem>
                  <SelectItem value="utc+1">Central European (UTC+1)</SelectItem>
                  <SelectItem value="utc+7">Indochina Time (UTC+7)</SelectItem>
                  <SelectItem value="utc+9">Japan/Korea (UTC+9)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl border border-border bg-muted/50 p-lg">
              <h4 className="typo-paragraph-reg-semibold text-foreground mb-xs">You're all set!</h4>
              <p className="typo-paragraph-sm text-muted-foreground">
                Click "Get Started" to access your ShopPulse dashboard. You can update these settings anytime from your profile.
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Back
        </Button>
        <Button onClick={handleNext}>
          {currentStep === steps.length - 1 ? "Get Started" : "Continue"}
        </Button>
      </CardFooter>
    </Card>
  )
}
