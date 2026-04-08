"use client";

import CreateShop from "@/shared/modules/auth/create-shop";
import axiosInstance from "@/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { Home } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import axios from "axios";

const fetchCurrentAccount = async () => {
  const response = await axiosInstance.get("/auth/api/logged-in-seller");
  return response.data.seller;
};

const Signup = () => {
  const [activeStep, setActiveStep] = useState(1);
  const { data: seller, isLoading, isError } = useQuery({
    queryKey: ["seller-onboarding-account"],
    queryFn: fetchCurrentAccount,
    retry: false,
  });

  const hasShop = useMemo(() => Boolean(seller?.shops?.length), [seller]);

  const connectStripe = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/auth/api/create-stripe-link",
        { sellerId: seller?.id },
        { withCredentials: true }
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Stripe Connection Error:", error);
    }
  };

  React.useEffect(() => {
    if (seller?.id) {
      setActiveStep(2);
    }
  }, [seller?.id]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#0b121a]" />;
  }

  return (
    <div className="w-full bg-[#0b121a] text-foreground flex flex-col items-center pt-10 min-h-screen px-4">
      <div className="relative flex items-center justify-between md:w-[50%] mb-8">
        <div className="absolute top-[25%] left-0 w-[80%] md:w-[90%] h-1 bg-white/10 z-10" />
        {[1, 2, 3].map((step) => (
          <div key={step}>
            <div
              className={`w-10 h-10 relative z-20 flex items-center justify-center rounded-full text-white font-bold ${step <= activeStep ? "bg-emerald-600" : "bg-white/20"
                }`}
            >
              {step}
            </div>
            <span className="ml-[-15px] text-xs text-muted-foreground">
              {step === 1
                ? "Login"
                : step === 2
                  ? "Create Shop"
                  : "Connect Bank"}
            </span>
          </div>
        ))}
      </div>

      <div className="md:w-[480px] p-8 bg-card/70 border border-border/60 shadow-2xl rounded-xl backdrop-blur-sm">
        {!seller?.id || isError ? (
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-4">
              Start from your buyer account
            </h3>
            <p className="text-muted-foreground mb-6">
              Sign in with the account you already use as a buyer. Once you are
              logged in, you can create your first shop and we will upgrade that
              same account to seller automatically.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full text-lg bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg transition-colors"
            >
              Login with Existing Account
            </Link>
          </div>
        ) : null}

        {seller?.id ? (
          <CreateShop sellerId={seller.id} setActiveStep={setActiveStep} />
        ) : null}

        {seller?.id && hasShop ? (
          <div className="text-center mt-8 pt-8 border-t border-border/60">
            <h3 className="text-2xl font-semibold">Withdraw Method</h3>
            <p className="text-muted-foreground mt-3 mb-6">
              You can keep adding shops under the same seller account and switch
              between them from the dashboard sidebar.
            </p>
            <button
              className="w-full m-auto flex items-center justify-center gap-3 text-lg bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg transition-colors"
              onClick={connectStripe}
            >
              Connect Stripe <Home />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Signup;
