"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, BarChart2, Zap, Globe } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Checkbox } from "@workspace/ui/components/checkbox"
import axiosInstance from "@/utils/axiosInstance"
import { useAuthStore } from "@/store/authStore"
import { useQueryClient } from "@tanstack/react-query"
import { DEV_MOCK_SELLER } from "@/hooks/useSeller"

type LoginData = { email: string; password: string }

const features = [
  { icon: BarChart2, title: "Real-time analytics", description: "Track every metric that matters to your business." },
  { icon: Zap, title: "Instant payouts", description: "Get paid faster with automated settlement." },
  { icon: Globe, title: "Global reach", description: "Sell to customers in 190+ countries." },
]

function GoogleIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function LogoMark({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  )
}

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const router = useRouter()
  const { setLoggedIn } = useAuthStore()
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>()

  const onSubmit = async (data: LoginData) => {
    setServerError(null)

    // ── Dev bypass: use demo@atlas.dev / demo1234 to skip real API ──
    if (data.email === "demo@atlas.dev" && data.password === "demo1234") {
      sessionStorage.setItem("__atlas_dev__", "true")
      setLoggedIn(true)
      queryClient.setQueryData(["seller"], DEV_MOCK_SELLER)
      router.push("/dashboard")
      return
    }

    try {
      await axiosInstance.post("/auth/api/login-seller", data)
      setLoggedIn(true)
      queryClient.invalidateQueries({ queryKey: ["seller"] })
      router.push("/dashboard")
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? "Login failed. Please try again.")
    }
  }

  return (
    <div className={cn("grid min-h-svh lg:grid-cols-2", className)} {...props}>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes aurora-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .anim-fade-up {
          animation: fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .anim-fade-in {
          animation: fade-in 0.6s ease both;
        }
      `}</style>

      {/* ── LEFT PANEL ── */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[#080b14] p-12">

        {/* Aurora mesh — soft, slow-drifting ambient lights */}
        <div
          className="pointer-events-none absolute -top-24 -left-24 h-[500px] w-[500px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #f43f5e 0%, transparent 70%)", animation: "aurora-drift 25s ease-in-out infinite" }}
        />
        <div
          className="pointer-events-none absolute bottom-[-10%] right-[-5%] h-[550px] w-[550px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #ef4444 0%, transparent 70%)", animation: "aurora-drift 30s ease-in-out infinite reverse" }}
        />
        <div
          className="pointer-events-none absolute top-[40%] left-[50%] h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #fb7185 0%, transparent 70%)", animation: "aurora-drift 35s ease-in-out infinite" }}
        />

        {/* Grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px)", backgroundSize: "48px 48px" }}
        />

        {/* Logo */}
        <div className="anim-fade-in relative z-10 flex items-center gap-2.5" style={{ animationDelay: "0.1s" }}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.08] ring-1 ring-white/[0.06]">
            <LogoMark className="h-4 w-4 text-slate-300" />
          </div>
          <span className="text-sm font-semibold text-slate-200">Atlas Commerce</span>
        </div>

        {/* Headline + features */}
        <div className="relative z-10 space-y-8">
          <div className="anim-fade-up space-y-4" style={{ animationDelay: "0.2s" }}>
            <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-slate-400">
              Seller Platform
            </span>
            <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight text-white">
              Sell smarter.<br />
              <span className="text-[#fecdd3]" style={{ textShadow: "0 0 40px rgba(244,63,94,0.15)" }}>
                Scale faster.
              </span>
            </h1>
            <p className="max-w-sm text-[15px] leading-relaxed text-slate-500">
              Everything you need to launch, manage, and grow your online store — all in one place.
            </p>
          </div>

          <div className="space-y-2.5">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="anim-fade-up flex items-center gap-3.5 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5 backdrop-blur-sm transition-colors duration-300 hover:bg-white/[0.05]"
                style={{ animationDelay: `${0.35 + i * 0.08}s` }}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] ring-1 ring-white/[0.04]">
                  <f.icon className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{f.title}</p>
                  <p className="text-xs text-slate-500">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="relative flex items-center justify-center overflow-hidden bg-[#0a0d16] px-6 py-12 lg:px-12">

        {/* Ambient glow — right panel */}
        <div
          className="pointer-events-none absolute bottom-[-15%] right-[-10%] h-[400px] w-[400px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #f43f5e 0%, transparent 70%)", animation: "aurora-drift 28s ease-in-out infinite" }}
        />

        <div className="relative z-10 w-full max-w-sm space-y-6">

          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.08] ring-1 ring-white/[0.06]">
              <LogoMark className="h-3.5 w-3.5 text-slate-300" />
            </div>
            <span className="text-sm font-semibold text-slate-200">Atlas Commerce</span>
          </div>

          <div className="anim-fade-up space-y-1.5 text-center" style={{ animationDelay: "0.15s" }}>
            <h2 className="text-2xl font-semibold tracking-tight text-white">Welcome back</h2>
            <p className="text-sm text-slate-500">Sign in to your seller dashboard</p>
          </div>

          {/* Google */}
          <div className="anim-fade-up" style={{ animationDelay: "0.25s" }}>
            <Button
              variant="outline"
              type="button"
              className="h-11 w-full gap-3 border-white/[0.08] bg-white/[0.04] text-sm text-slate-200 transition-all duration-200 hover:bg-white/[0.07] hover:text-white"
            >
              <GoogleIcon />
              Continue with Google
            </Button>
          </div>

          {/* Divider */}
          <div className="anim-fade-in flex items-center gap-3" style={{ animationDelay: "0.3s" }}>
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-[11px] font-medium uppercase tracking-widest text-slate-600">or</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          {/* Fields */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="anim-fade-up space-y-1.5" style={{ animationDelay: "0.35s" }}>
              <Label className="text-sm font-medium text-slate-400" htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="h-11 border-white/[0.08] bg-white/[0.04] text-white transition-all duration-200 placeholder:text-slate-600 focus-visible:border-rose-500/40 focus-visible:bg-white/[0.06] focus-visible:ring-rose-500/10"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="text-xs text-red-400 mt-0.5">{errors.email.message}</p>}
            </div>

            <div className="anim-fade-up space-y-1.5" style={{ animationDelay: "0.4s" }}>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-400" htmlFor="password">Password</Label>
                <a href="/forgot-password" className="text-xs text-slate-500 transition-colors hover:text-slate-300">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-11 border-white/[0.08] bg-white/[0.04] pr-10 text-white transition-all duration-200 placeholder:text-slate-600 focus-visible:border-rose-500/40 focus-visible:bg-white/[0.06] focus-visible:ring-rose-500/10"
                  {...register("password", { required: "Password is required" })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 transition-colors duration-150 hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-0.5">{errors.password.message}</p>}
            </div>

            <div className="anim-fade-up flex items-center gap-2" style={{ animationDelay: "0.45s" }}>
              <Checkbox id="remember" className="border-white/15 data-[state=checked]:border-rose-500/60 data-[state=checked]:bg-rose-600/80" />
              <Label htmlFor="remember" className="cursor-pointer text-sm font-normal text-slate-500">
                Remember me
              </Label>
            </div>

            {serverError && (
              <p className="text-xs text-red-400 text-center">{serverError}</p>
            )}

            <div className="anim-fade-up" style={{ animationDelay: "0.5s" }}>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="relative h-11 w-full overflow-hidden border border-rose-500/20 bg-[#1a0f10] text-sm font-semibold text-rose-200 shadow-[inset_0_1px_0_rgba(244,63,94,0.1)] transition-all duration-200 hover:border-rose-500/30 hover:bg-[#1f1214] hover:text-white hover:shadow-[inset_0_1px_0_rgba(244,63,94,0.15),0_0_20px_rgba(244,63,94,0.08)] disabled:opacity-60"
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </div>
          </form>

          <p className="anim-fade-in text-center text-sm text-slate-500" style={{ animationDelay: "0.55s" }}>
            Don&apos;t have an account?{" "}
            <a href="/signup" className="font-medium text-slate-300 transition-colors hover:text-white">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

