"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { Eye, EyeOff, ShoppingBag, Check } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { countries } from "@/utils/countires";

const STEPS = ["Account", "Shop", "Payouts"];
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export default function SignupPage() {
  const [step, setStep] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: "", email: "", password: "",
      shopName: "", shopCategory: "", country: "",
      paypalEmail: "", bankName: "", accountNumber: "",
    },
  });

  const onSubmit = async (data: any) => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/auth/api/seller-registration`, data, { withCredentials: true });
      toast.success("Account created! Please check your email for OTP.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] relative overflow-hidden px-4 py-12">
      {/* Ambient glows */}
      <div className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-pink-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg">
        {/* Brand header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.5)]">
            <ShoppingBag size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Atlas Commerce</span>
        </div>

        {/* Glass card */}
        <div className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-md p-8">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((label, i) => (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < step  ? "bg-gradient-to-br from-violet-600 to-pink-500 text-white shadow-[0_0_12px_rgba(124,58,237,0.5)]"
                    : i === step ? "bg-gradient-to-br from-violet-600 to-pink-500 text-white shadow-[0_0_12px_rgba(124,58,237,0.5)]"
                    : "bg-white/5 border border-white/10 text-white/30"
                  }`}>
                    {i < step ? <Check size={14} /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-semibold tracking-wide ${i <= step ? "text-violet-400" : "text-white/25"}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-3 transition-all ${i < step ? "bg-gradient-to-r from-violet-600 to-pink-500" : "bg-white/8"}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {step === 0 && "Create your account"}
              {step === 1 && "Set up your shop"}
              {step === 2 && "Add payout details"}
            </h1>
            <p className="text-white/35 text-sm mt-0.5">Step {step + 1} of {STEPS.length}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Step 0 — Account */}
            {step === 0 && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Full Name</Label>
                  <Input
                    placeholder="John Doe"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-violet-500 rounded-xl h-11"
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && <p className="text-red-400 text-xs">{String(errors.name.message)}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Email</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-violet-500 rounded-xl h-11"
                    {...register("email", { required: "Email is required" })}
                  />
                  {errors.email && <p className="text-red-400 text-xs">{String(errors.email.message)}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-violet-500 rounded-xl h-11 pr-10"
                      {...register("password", { required: "Password required", minLength: { value: 8, message: "Min 8 characters" } })}
                    />
                    <button type="button" onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs">{String(errors.password.message)}</p>}
                </div>
              </>
            )}

            {/* Step 1 — Shop */}
            {step === 1 && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Shop Name</Label>
                  <Input
                    placeholder="My Awesome Store"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-violet-500 rounded-xl h-11"
                    {...register("shopName", { required: "Shop name is required" })}
                  />
                  {errors.shopName && <p className="text-red-400 text-xs">{String(errors.shopName.message)}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Category</Label>
                  <Input
                    placeholder="e.g. Electronics, Fashion…"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-violet-500 rounded-xl h-11"
                    {...register("shopCategory", { required: "Category is required" })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Country</Label>
                  <Controller
                    name="country"
                    control={control}
                    rules={{ required: "Country is required" }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white/70 rounded-xl h-11 focus:ring-violet-500">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-white/10 text-white max-h-60">
                          {countries.map((c: any) => (
                            <SelectItem key={c.code} value={c.code} className="focus:bg-white/5">
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.country && <p className="text-red-400 text-xs">{String(errors.country.message)}</p>}
                </div>
              </>
            )}

            {/* Step 2 — Payouts */}
            {step === 2 && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-white/50 text-xs font-semibold uppercase tracking-wider">PayPal Email (optional)</Label>
                  <Input
                    type="email"
                    placeholder="paypal@example.com"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-violet-500 rounded-xl h-11"
                    {...register("paypalEmail")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Bank Name (optional)</Label>
                  <Input
                    placeholder="Chase, HSBC…"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-violet-500 rounded-xl h-11"
                    {...register("bankName")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Account Number (optional)</Label>
                  <Input
                    placeholder="••••••••••"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-violet-500 rounded-xl h-11"
                    {...register("accountNumber")}
                  />
                </div>
              </>
            )}

            {/* Nav buttons */}
            <div className="flex gap-3 pt-2">
              {step > 0 && (
                <Button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="flex-1 h-11 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all"
                >
                  Back
                </Button>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-semibold tracking-wide shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition-all border-0"
              >
                {loading ? "Creating…" : step === STEPS.length - 1 ? "Create Account" : "Continue"}
              </Button>
            </div>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
