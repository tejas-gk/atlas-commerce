"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

function getStrength(pw: string) {
  if (!pw) return null
  if (pw.length < 6) return { label: "Too short", color: "bg-red-500",     pct: "25%" }
  if (pw.length < 10) return { label: "Fair",      color: "bg-yellow-500", pct: "50%" }
  if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw))
    return { label: "Good",   color: "bg-blue-500",    pct: "75%" }
  return   { label: "Strong", color: "bg-emerald-500", pct: "100%" }
}

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

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const [showPw, setShowPw] = useState(false)
  const [pw, setPw]         = useState("")
  const strength            = getStrength(pw)

  return (
    <div
      className={cn(
        "relative min-h-svh overflow-hidden bg-[#080b14] flex flex-col items-center justify-center px-4 py-12",
        className
      )}
      {...props}
    >
      {/* Keyframes */}
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

      {/* Aurora mesh background */}
      <div
        className="pointer-events-none absolute -top-24 left-[20%] h-[500px] w-[500px] rounded-full opacity-[0.07]"
        style={{ background: "radial-gradient(circle, #f43f5e 0%, transparent 70%)", animation: "aurora-drift 25s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute bottom-[-15%] right-[15%] h-[450px] w-[450px] rounded-full opacity-[0.05]"
        style={{ background: "radial-gradient(circle, #ef4444 0%, transparent 70%)", animation: "aurora-drift 30s ease-in-out infinite reverse" }}
      />
      <div
        className="pointer-events-none absolute top-[45%] left-[55%] h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.04]"
        style={{ background: "radial-gradient(circle, #fb7185 0%, transparent 70%)", animation: "aurora-drift 35s ease-in-out infinite" }}
      />

      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px)", backgroundSize: "48px 48px" }}
      />

      {/* Logo */}
      <div className="anim-fade-up relative z-10 mb-8 flex flex-col items-center gap-2" style={{ animationDelay: "0.1s" }}>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.08] shadow-lg ring-1 ring-white/[0.06]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-slate-300">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-slate-200">Atlas Commerce</span>
      </div>

      {/* Card */}
      <div className="anim-fade-up relative z-10 w-full max-w-sm rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 shadow-2xl shadow-black/50 backdrop-blur-xl" style={{ animationDelay: "0.2s" }}>

        {/* Inner top glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

        <div className="mb-6 space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-white">Create your account</h1>
          <p className="text-sm text-slate-500">Start selling on Atlas Commerce today.</p>
        </div>

        {/* Google */}
        <Button
          variant="outline"
          type="button"
          className="h-11 w-full gap-3 border-white/[0.08] bg-white/[0.04] text-sm text-slate-200 transition-all duration-200 hover:bg-white/[0.07] hover:text-white"
        >
          <GoogleIcon />
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-[11px] font-medium uppercase tracking-widest text-slate-600">or</span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div className="anim-fade-up space-y-1.5" style={{ animationDelay: "0.3s" }}>
            <Label className="text-sm font-medium text-slate-400" htmlFor="name">Full name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Jane Smith"
              autoComplete="name"
              className="h-11 border-white/[0.08] bg-white/[0.04] text-white transition-all duration-200 placeholder:text-slate-600 focus-visible:border-rose-500/40 focus-visible:bg-white/[0.06] focus-visible:ring-rose-500/10"
            />
          </div>

          <div className="anim-fade-up space-y-1.5" style={{ animationDelay: "0.35s" }}>
            <Label className="text-sm font-medium text-slate-400" htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="h-11 border-white/[0.08] bg-white/[0.04] text-white transition-all duration-200 placeholder:text-slate-600 focus-visible:border-rose-500/40 focus-visible:bg-white/[0.06] focus-visible:ring-rose-500/10"
            />
          </div>

          <div className="anim-fade-up space-y-1.5" style={{ animationDelay: "0.4s" }}>
            <Label className="text-sm font-medium text-slate-400" htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                className="h-11 border-white/[0.08] bg-white/[0.04] pr-10 text-white transition-all duration-200 placeholder:text-slate-600 focus-visible:border-rose-500/40 focus-visible:bg-white/[0.06] focus-visible:ring-rose-500/10"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 transition-colors duration-150 hover:text-slate-300"
                tabIndex={-1}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {strength && (
              <div className="space-y-1 pt-0.5">
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className={cn("h-full rounded-full transition-all duration-300", strength.color)}
                    style={{ width: strength.pct }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">{strength.label}</p>
              </div>
            )}
          </div>

          <div className="anim-fade-up" style={{ animationDelay: "0.45s" }}>
            <Button
              type="submit"
              className="relative mt-1 h-11 w-full overflow-hidden border border-rose-500/20 bg-[#1a0f10] text-sm font-semibold text-rose-200 shadow-[inset_0_1px_0_rgba(244,63,94,0.1)] transition-all duration-200 hover:border-rose-500/30 hover:bg-[#1f1214] hover:text-white hover:shadow-[inset_0_1px_0_rgba(244,63,94,0.15),0_0_20px_rgba(244,63,94,0.08)]"
            >
              Create account
            </Button>
          </div>
        </div>

        <p className="anim-fade-in mt-5 text-center text-sm text-slate-500" style={{ animationDelay: "0.5s" }}>
          Already have an account?{" "}
          <a href="/login" className="font-medium text-slate-300 transition-colors hover:text-white">
            Sign in
          </a>
        </p>
      </div>

      <p className="anim-fade-in relative z-10 mt-6 text-xs text-slate-600" style={{ animationDelay: "0.55s" }}>
        © {new Date().getFullYear()} Atlas Commerce. All rights reserved.
      </p>
    </div>
  )
}
