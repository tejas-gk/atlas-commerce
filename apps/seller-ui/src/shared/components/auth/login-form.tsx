"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Clock3, Rocket, Store } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Checkbox } from "@workspace/ui/components/checkbox";
import axiosInstance from "@/utils/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { DEV_MOCK_SELLER } from "@/hooks/useSeller";

type LoginData = { email: string; password: string };

const highlights = [
  { icon: Clock3, title: "10-minute operations view", text: "See what needs attention across orders, payouts, and stock in one place." },
  { icon: Rocket, title: "Fast actions for sellers", text: "Push products live, manage offers, and review trends without extra clicks." },
  { icon: Store, title: "Made for quick commerce", text: "A brighter workflow tuned for high-velocity catalogs and daily campaigns." },
];

function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-12 w-12 items-center justify-center rounded-[20px] bg-[#1f3b16] text-white shadow-[0_18px_34px_rgba(31,59,22,0.18)]", className)}>
      <Store size={20} />
    </div>
  );
}

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const { setLoggedIn } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>();

  const onSubmit = async (data: LoginData) => {
    setServerError(null);

    if (data.email === "demo@atlas.dev" && data.password === "demo1234") {
      sessionStorage.setItem("__atlas_dev__", "true");
      setLoggedIn(true);
      queryClient.setQueryData(["seller"], DEV_MOCK_SELLER);
      router.push("/dashboard");
      return;
    }

    try {
      await axiosInstance.post("/auth/api/login-seller", data);
      setLoggedIn(true);
      queryClient.invalidateQueries({ queryKey: ["seller"] });
      router.push("/dashboard");
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? "Login failed. Please try again.");
    }
  };

  return (
    <div className={cn("seller-auth-shell grid min-h-svh lg:grid-cols-[1.1fr_0.9fr]", className)} {...props}>
      <section className="relative hidden overflow-hidden px-12 py-14 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,213,79,0.55),transparent_26%),radial-gradient(circle_at_75%_25%,rgba(153,222,78,0.26),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.28),transparent)]" />
        <div className="relative z-10 flex items-center gap-3">
          <LogoMark />
          <div>
            <p className="text-sm font-extrabold tracking-[-0.03em] text-[#17320f]">Atlas Seller</p>
            <p className="text-xs text-[#5f6e43]">Blinkit-inspired operations for modern sellers</p>
          </div>
        </div>

        <div className="relative z-10 max-w-xl space-y-8">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-[#dfe3bc] bg-white/75 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#65704a]">
              Seller control tower
            </span>
            <h1 className="max-w-xl text-6xl font-extrabold leading-[0.94] tracking-[-0.06em] text-[#17320f]">
              Run your store at
              <span className="block text-[#86b81d]">Blinkit speed.</span>
            </h1>
            <p className="max-w-lg text-base leading-7 text-[#556244]">
              A brighter seller workspace for catalog updates, operational alerts, and revenue tracking that feels quick the moment you open it.
            </p>
          </div>

          <div className="grid gap-3">
            {highlights.map((item) => (
              <article key={item.title} className="seller-panel rounded-[28px] p-4">
                <div className="flex items-start gap-3">
                  <div className="seller-metric-icon flex h-11 w-11 items-center justify-center rounded-[18px] text-[#86b81d]">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#17320f]">{item.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-[#5f6e43]">{item.text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-xs text-[#64714a]">
          <span className="rounded-full bg-white/70 px-3 py-1">Real-time operations</span>
          <span className="rounded-full bg-white/70 px-3 py-1">Mobile-friendly dashboard</span>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12 lg:px-12">
        <div className="seller-auth-card w-full max-w-md rounded-[34px] p-7 md:p-8">
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <LogoMark className="h-11 w-11 rounded-[18px]" />
            <div>
              <p className="text-sm font-extrabold tracking-[-0.03em] text-[#17320f]">Atlas Seller</p>
              <p className="text-xs text-[#5f6e43]">Quick commerce dashboard</p>
            </div>
          </div>

          <div className="mb-7 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7b7f59]">Welcome back</p>
            <h2 className="text-3xl font-extrabold tracking-[-0.05em] text-[#17320f]">Sign in to manage your store</h2>
            <p className="text-sm leading-6 text-[#5e6b46]">Track orders, edit products, and launch campaigns from one fast workspace.</p>
          </div>

          <div className="mb-5 rounded-[24px] border border-[#dde1bc] bg-[#f8fbe8] p-4 text-sm text-[#556244]">
            Use `demo@atlas.dev` with `demo1234` to jump into the demo seller account.
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-[#556244]" htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="h-12 rounded-2xl border-[#dde1bc] bg-white text-[#17320f] placeholder:text-[#8f9670] focus-visible:border-lime-400 focus-visible:ring-lime-200"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="mt-0.5 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-[#556244]" htmlFor="password">Password</Label>
                <a href="/forgot-password" className="text-xs font-medium text-[#729717] hover:text-[#5f7e12]">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-12 rounded-2xl border-[#dde1bc] bg-white pr-11 text-[#17320f] placeholder:text-[#8f9670] focus-visible:border-lime-400 focus-visible:ring-lime-200"
                  {...register("password", { required: "Password is required" })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b916a] hover:text-[#17320f]"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-0.5 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="flex items-center gap-2.5">
              <Checkbox id="remember" className="border-[#cfd6aa] data-[state=checked]:border-lime-500 data-[state=checked]:bg-lime-500" />
              <Label htmlFor="remember" className="cursor-pointer text-sm text-[#5d6947]">Remember this device</Label>
            </div>

            {serverError && <p className="text-center text-xs text-red-500">{serverError}</p>}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-2xl border-0 bg-[#86b81d] text-sm font-bold text-white shadow-[0_18px_34px_rgba(134,184,29,0.28)] hover:bg-[#77a51b] disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 rounded-[24px] border border-[#e0e4be] bg-white/70 px-4 py-3 text-sm text-[#5f6e43]">
            New here?{" "}
            <a href="/signup" className="font-bold text-[#729717] hover:text-[#5f7e12]">
              Create your seller account
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

