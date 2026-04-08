"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Sparkles, Store, TicketPercent } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import axiosInstance from "@/utils/axiosInstance"

function getStrength(pw: string) {
    if (!pw) return null
    if (pw.length < 6) return { label: "Too short", color: "bg-red-500", pct: "25%" }
    if (pw.length < 10) return { label: "Fair", color: "bg-yellow-500", pct: "50%" }
    if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw))
        return { label: "Good", color: "bg-blue-500", pct: "75%" }
    return { label: "Strong", color: "bg-emerald-500", pct: "100%" }
}

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
    const router = useRouter()

    // Step 1 fields
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")

    // Step 2 fields
    const [otp, setOtp] = useState("")
    const [password, setPassword] = useState("")
    const [phone, setPhone] = useState("")
    const [country, setCountry] = useState("")
    const [showPw, setShowPw] = useState(false)
    const strength = getStrength(password)

    const [step, setStep] = useState<1 | 2>(1)
    const [loading, setLoading] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setServerError(null)
        setLoading(true)
        try {
            await axiosInstance.post("/auth/api/seller-registration", { name, email })
            setStep(2)
        } catch (err: any) {
            setServerError(err?.response?.data?.message ?? "Registration failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setServerError(null)
        setLoading(true)
        try {
            await axiosInstance.post("/auth/api/verify-seller", {
                name, email, otp, password, phone_number: phone, country,
            })
            router.push("/login")
        } catch (err: any) {
            setServerError(err?.response?.data?.message ?? "Verification failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className={cn(
                "seller-auth-shell relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-12",
                className
            )}
            {...props}
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,219,88,0.75),transparent_24%),radial-gradient(circle_at_78%_18%,rgba(153,222,78,0.36),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.3),transparent)]" />

            <div className="relative z-10 mb-8 flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-[#1f3b16] text-white shadow-[0_18px_34px_rgba(31,59,22,0.18)]">
                    <Store size={20} />
                </div>
                <span className="text-sm font-extrabold tracking-[-0.03em] text-[#17320f]">Atlas Seller</span>
            </div>

            <div className="seller-auth-card relative z-10 w-full max-w-md rounded-[34px] p-8">
                <div className="mb-6 rounded-[24px] border border-[#dde1bc] bg-[#f8fbe8] p-4">
                    <div className="flex items-start gap-3">
                        <div className="seller-metric-icon flex h-10 w-10 items-center justify-center rounded-[18px] text-[#86b81d]">
                            {step === 1 ? <Sparkles size={18} /> : <TicketPercent size={18} />}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#17320f]">{step === 1 ? "Create your seller account" : "Verify and go live"}</p>
                            <p className="mt-1 text-sm leading-6 text-[#5f6e43]">
                                {step === 1
                                    ? "Get started with the quick-commerce seller workspace in a few steps."
                                    : "Finish verification so your dashboard, products, and payouts are ready to use."}
                            </p>
                        </div>
                    </div>
                </div>

                {step === 1 ? (
                    <>
                        <div className="mb-6 space-y-1">
                            <h1 className="text-3xl font-extrabold tracking-[-0.05em] text-[#17320f]">Tell us about you</h1>
                            <p className="text-sm text-[#5f6e43]">We’ll send an OTP and take you into setup.</p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-[#556244]" htmlFor="name">Full name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Jane Smith"
                                    autoComplete="name"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-12 rounded-2xl border-[#dde1bc] bg-white text-[#17320f] placeholder:text-[#8f9670] focus-visible:border-lime-400 focus-visible:ring-lime-200"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-[#556244]" htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 rounded-2xl border-[#dde1bc] bg-white text-[#17320f] placeholder:text-[#8f9670] focus-visible:border-lime-400 focus-visible:ring-lime-200"
                                />
                            </div>

                            {serverError && <p className="text-center text-xs text-red-500">{serverError}</p>}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="mt-1 h-12 w-full rounded-2xl border-0 bg-[#86b81d] text-sm font-bold text-white shadow-[0_18px_34px_rgba(134,184,29,0.28)] hover:bg-[#77a51b] disabled:opacity-60"
                            >
                                {loading ? "Sending OTP..." : "Continue"}
                            </Button>
                        </form>
                    </>
                ) : (
                    <>
                        <div className="mb-6 space-y-1">
                            <h1 className="text-3xl font-extrabold tracking-[-0.05em] text-[#17320f]">Verify your account</h1>
                            <p className="text-sm text-[#5f6e43]">Enter the OTP sent to <span className="font-semibold text-[#17320f]">{email}</span> and complete your profile.</p>
                        </div>

                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-[#556244]" htmlFor="otp">OTP code</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="123456"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="h-12 rounded-2xl border-[#dde1bc] bg-white text-[#17320f] placeholder:text-[#8f9670] focus-visible:border-lime-400 focus-visible:ring-lime-200"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-[#556244]" htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPw ? "text" : "password"}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 rounded-2xl border-[#dde1bc] bg-white pr-10 text-[#17320f] placeholder:text-[#8f9670] focus-visible:border-lime-400 focus-visible:ring-lime-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw((p) => !p)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b916a] transition-colors duration-150 hover:text-[#17320f]"
                                        tabIndex={-1}
                                    >
                                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {strength && (
                                    <div className="space-y-1 pt-0.5">
                                        <div className="h-1 w-full overflow-hidden rounded-full bg-[#eef0de]">
                                            <div
                                                className={cn("h-full rounded-full transition-all duration-300", strength.color)}
                                                style={{ width: strength.pct }}
                                            />
                                        </div>
                                        <p className="text-[11px] text-[#6c7554]">{strength.label}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-[#556244]" htmlFor="phone">Phone number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+1 555 000 0000"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="h-12 rounded-2xl border-[#dde1bc] bg-white text-[#17320f] placeholder:text-[#8f9670] focus-visible:border-lime-400 focus-visible:ring-lime-200"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-[#556244]" htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    type="text"
                                    placeholder="United States"
                                    required
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className="h-12 rounded-2xl border-[#dde1bc] bg-white text-[#17320f] placeholder:text-[#8f9670] focus-visible:border-lime-400 focus-visible:ring-lime-200"
                                />
                            </div>

                            {serverError && <p className="text-center text-xs text-red-500">{serverError}</p>}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="mt-1 h-12 w-full rounded-2xl border-0 bg-[#86b81d] text-sm font-bold text-white shadow-[0_18px_34px_rgba(134,184,29,0.28)] hover:bg-[#77a51b] disabled:opacity-60"
                            >
                                {loading ? "Verifying..." : "Create account"}
                            </Button>

                            <button
                                type="button"
                                onClick={() => { setStep(1); setServerError(null); }}
                                className="w-full text-center text-xs font-medium text-[#6f7856] hover:text-[#17320f] transition-colors"
                            >
                                Back
                            </button>
                        </form>
                    </>
                )}

                <p className="mt-5 text-center text-sm text-[#5f6e43]">
                    Already have an account?{" "}
                    <a href="/login" className="font-bold text-[#729717] transition-colors hover:text-[#5f7e12]">
                        Sign in
                    </a>
                </p>
            </div>

            <p className="relative z-10 mt-6 text-xs text-[#6d7655]">
                © {new Date().getFullYear()} Atlas Commerce. All rights reserved.
            </p>
        </div>
    )
}
