"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, EyeOff, ShoppingBag, Zap, BarChart3, Globe } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";

type FormValues = { email: string; password: string };

const features = [
  { icon: BarChart3, title: "Real-time Analytics", desc: "Live revenue tracking and insights" },
  { icon: ShoppingBag, title: "Order Management",  desc: "Manage orders from one place"       },
  { icon: Globe,       title: "Global Reach",       desc: "Sell to customers worldwide"        },
  { icon: Zap,         title: "Instant Payouts",    desc: "Fast and reliable payment processing" },
];

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>();
  const [showPass, setShowPass] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const onSubmit = async (data: FormValues) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/auth/api/login-seller`, data, { withCredentials: true });
      queryClient.invalidateQueries({ queryKey: ["seller"] });
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0d0d0d]">
      {/* ── Left Panel ─────────────────────── */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-[#0d0d0d]" />

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Atlas Commerce</span>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-bold leading-tight text-white">
              Your store,<br />
              <span className="text-violet-400 font-bold">
                supercharged.
              </span>
            </h2>
            <p className="text-white/40 mt-3 text-sm leading-relaxed">
              Everything you need to run a modern e-commerce business — analytics, orders, products, and payouts — in one beautiful dashboard.
            </p>
          </div>

          {/* Feature tiles */}
          <div className="grid grid-cols-2 gap-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title} className="bg-white/5 border-white/8 p-4">
                  <Icon size={16} className="text-violet-400 mb-2" />
                  <p className="text-white text-xs font-semibold">{f.title}</p>
                  <p className="text-white/35 text-[11px] mt-0.5">{f.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="relative z-10 text-white/30 text-xs">
          Trusted by 5,000+ sellers worldwide
        </p>
      </div>

      {/* ── Right Panel ─────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Glass card */}
          <Card className="bg-white/5 border-white/8 p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white tracking-tight">Sign in</h1>
              <p className="text-white/40 text-sm mt-1">Enter your credentials to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-white/60 text-xs font-semibold uppercase tracking-wider">Email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-violet-500 focus-visible:border-violet-500/50 rounded-xl h-11"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-white/60 text-xs font-semibold uppercase tracking-wider">Password</Label>
                  <Link href="/forgot-password" className="text-violet-400 hover:text-violet-300 text-xs transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-violet-500 focus-visible:border-violet-500/50 rounded-xl h-11 pr-10"
                    {...register("password", { required: "Password is required" })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold tracking-wide transition-all border-0"
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <p className="text-center text-white/30 text-sm mt-6">
              No account?{" "}
              <Link href="/signup" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">
                Create one
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
