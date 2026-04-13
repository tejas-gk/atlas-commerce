"use client";

import React from "react";
import { Banknote, Link, CheckCircle, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import useSeller from "@/hooks/useSeller";
import axios from "axios";

// Fetch Stripe account details
const fetchStripeAccount = async () => {
  const res = await axiosInstance.get("/product/api/get-stripe-account");
  return res?.data?.stripeAccount || null;
};

const connectStripe = async (sellerId?: string) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/create-stripe-link`,
      { sellerId },
      { withCredentials: true }
    );

    if (response.data.url) {
      window.location.href = response.data.url;
      return;
    }
  } catch (error) {
    console.error("Stripe Connection Error:", error);
  }

  window.location.href = "/product/api/connect-stripe";
};

const WithdrawMethod = () => {
  const { seller } = useSeller();

  // Fetch connected Stripe account
  const { data: stripeAccount, isLoading } = useQuery({
    queryKey: ["stripe-account"],
    queryFn: fetchStripeAccount,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return (
    <div className="max-w-2xl space-y-6">
      {/* Withdraw Method Header */}
      <div className="px-4 rounded-lg">
        <div className="flex items-center gap-3">
          <Banknote size={22} className="text-[#86b81d]" />
          <div>
            <h3 className="text-[#17320f] font-semibold">Withdraw Method</h3>
            <p className="text-[#687259] text-sm">
              Manage your Stripe payout settings.
            </p>
          </div>
        </div>
      </div>

      {/* Connected Stripe Account */}
      <div className="px-4 rounded-lg">
        {isLoading ? (
          <p className="text-[#687259]">Loading...</p>
        ) : stripeAccount ? (
          <div className="p-4 border border-[#dde1bc] rounded-md space-y-4">
            {/* Stripe Status */}
            <div className="flex items-center gap-3">
              <CheckCircle size={22} className="text-green-500" />
              <div>
                <p className="text-[#17320f] font-semibold">Connected to Stripe</p>
                <p className="text-[#687259] text-sm">{stripeAccount.email}</p>
              </div>
            </div>

            {/* Stripe Account Details */}
            <div className="grid grid-cols-2 gap-4 text-[#556244] text-sm">
              <div>
                <p className="text-[#687259]">Business Name:</p>
                <p className="text-[#17320f]">
                  {stripeAccount.business_name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[#687259]">Country:</p>
                <p className="text-[#17320f]">
                  {stripeAccount.country || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-[#687259]">Payouts Enabled:</p>
                <p
                  className={
                    stripeAccount.payouts_enabled
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {stripeAccount.payouts_enabled ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-[#687259]">Charges Enabled:</p>
                <p
                  className={
                    stripeAccount.charges_enabled
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {stripeAccount.charges_enabled ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-[#687259]">Last Payout:</p>
                <p className="text-[#17320f]">
                  {stripeAccount.last_payout || "No payouts yet"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <a
                href={stripeAccount.dashboard_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#86b81d] hover:text-[#6a9317] flex items-center gap-2"
              >
                <Globe size={18} /> Open Stripe Dashboard
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 border border-[#dde1bc] p-4 rounded-md">
            <p className="text-[#687259]">No Stripe account connected.</p>
            <button
              type="button"
              onClick={() => connectStripe(seller?.id)}
              className="bg-[#86b81d] hover:bg-[#6a9317] text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <Link size={18} /> Connect Stripe
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawMethod;
