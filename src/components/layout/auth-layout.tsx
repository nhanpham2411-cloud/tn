import { Outlet } from "react-router-dom"
import { BarChart3, Shield, Zap, Globe } from "lucide-react"

const features = [
  { icon: BarChart3, text: "Real-time analytics & insights" },
  { icon: Shield, text: "Enterprise-grade security" },
  { icon: Zap, text: "Lightning-fast performance" },
  { icon: Globe, text: "Multi-channel tracking" },
]

export function AuthLayout() {
  return (
    <div className="flex min-h-svh">
      {/* Left — branding panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between bg-primary p-2xl text-primary-foreground relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-20%] right-[-10%] size-[400px] rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-[-15%] left-[-10%] size-[350px] rounded-full bg-white/15 blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-sm">
          <div className="flex size-[36px] items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <BarChart3 className="size-[20px]" />
          </div>
          <span className="sp-h4 font-bold tracking-tight">ShopPulse</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col gap-xl">
          <div className="flex flex-col gap-sm">
            <h2 className="text-[28px] font-bold leading-tight tracking-tight">
              Your e-commerce<br />analytics, simplified.
            </h2>
            <p className="text-white/70 sp-body-lg leading-relaxed max-w-[360px]">
              Track revenue, monitor orders, and grow your business with powerful insights.
            </p>
          </div>

          <div className="flex flex-col gap-md">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-sm">
                <div className="flex size-[32px] items-center justify-center rounded-md bg-white/15">
                  <f.icon className="size-[16px]" />
                </div>
                <span className="sp-body text-white/85">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="sp-caption text-white/50">&copy; 2026 ShopPulse. All rights reserved.</p>
        </div>
      </div>

      {/* Right — form area */}
      <div className="flex flex-1 items-center justify-center bg-background p-lg sm:p-xl">
        <Outlet />
      </div>
    </div>
  )
}
