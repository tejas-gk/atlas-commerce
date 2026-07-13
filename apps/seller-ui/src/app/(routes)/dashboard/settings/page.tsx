"use client";

import React, { useState } from "react";
import {
  Bell,
  Shield,
  Trash2,
  AlertTriangle,
  Save,
  Globe,
  Wallet,
  Settings2,
  FileText,
  Building2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import toast from "react-hot-toast";
import useSeller from "@/hooks/useSeller";
import CustomDomains from "@/shared/modules/settings";
import WithdrawMethod from "@/shared/modules/settings/withdraw-method";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";

const NAV = [
  { key: "general", label: "General", icon: Settings2 },
  { key: "policies", label: "Policies", icon: FileText },
  { key: "custom-domains", label: "Custom Domains", icon: Globe },
  { key: "withdraw", label: "Withdraw Method", icon: Wallet },
];

const SettingsPage = () => {
  const [active, setActive] = useState("general");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { seller } = useSeller();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      shopName: "",
      supportEmail: "",
      phone: "",
      currency: "USD",
      shopDescription: "",
      lowStockThreshold: "10",
      notificationPreference: "email",
      termsURL: "",
      privacyURL: "",
      refundURL: "",
    },
  });

  const deleteShopMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.delete("/seller/api/delete");
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Shop marked for deletion. It will be removed in 28 days.");
      queryClient.invalidateQueries({ queryKey: ["seller"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete shop. Try again."
      );
    },
  });

  const restoreShopMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.patch("/seller/api/restore");
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Shop restored successfully!");
      queryClient.invalidateQueries({ queryKey: ["seller"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to Restore shop. Try again."
      );
    },
  });

  const onSubmit = (data: any) => {
    toast.success("Settings saved!");
  };

  const deleteShopHandler = () => {
    if (seller?.isDeleted) restoreShopMutation.mutate();
    else deleteShopMutation.mutate();
    setShowDeleteModal(false);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-[-0.05em] text-[#17320f]">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your shop preferences and configurations</p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left nav */}
        <nav className="w-48 shrink-0 flex flex-col gap-1">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-left transition-all ${active === key
                ? "bg-white shadow-sm text-[#17320f] border border-[#e5e9cc]"
                : "text-muted-foreground hover:bg-white/70 hover:text-[#17320f]"
                }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-5">
          {active === "general" && (
            <>
              {/* Shop Profile */}
              <Card className="bg-white rounded-[16px] border border-[#e8ebd4] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0f4d8] shrink-0">
                    <Building2 size={15} className="text-[#556244]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#17320f]">Shop Profile</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Basic information about your store</p>
                  </div>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Shop Name</label>
                      <Input
                        placeholder={seller?.shop?.name || "My Store"}
                        {...register("shopName")}
                        className="rounded-xl border-[#dde1bc] bg-[#fafbf3]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Support Email</label>
                      <Input
                        type="email"
                        placeholder={seller?.email || "support@mystore.com"}
                        {...register("supportEmail")}
                        className="rounded-xl border-[#dde1bc] bg-[#fafbf3]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Phone (optional)</label>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        {...register("phone")}
                        className="rounded-xl border-[#dde1bc] bg-[#fafbf3]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Currency</label>
                      <select
                        {...register("currency")}
                        className="h-10 w-full rounded-xl border border-[#dde1bc] bg-[#fafbf3] px-3 text-sm text-foreground outline-none focus:border-lime-400"
                      >
                        <option value="USD" className="bg-white">USD — US Dollar</option>
                        <option value="EUR" className="bg-white">EUR — Euro</option>
                        <option value="GBP" className="bg-white">GBP — British Pound</option>
                        <option value="INR" className="bg-white">INR — Indian Rupee</option>
                        <option value="CAD" className="bg-white">CAD — Canadian Dollar</option>
                        <option value="AUD" className="bg-white">AUD — Australian Dollar</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Shop Description</label>
                    <textarea
                      placeholder="Tell customers what your shop is about…"
                      {...register("shopDescription")}
                      rows={3}
                      className="w-full rounded-xl border border-[#dde1bc] bg-[#fafbf3] px-3 py-2 text-sm text-[#17320f] placeholder:text-muted-foreground outline-none resize-none focus:border-lime-400"
                    />
                  </div>
                  <Button type="submit" size="sm" className="gap-2 rounded-xl border-0  ">
                    <Save size={13} /> Save Profile
                  </Button>
                </form>
              </Card>

              {/* Low Stock + Notification Prefs side by side */}
              <div className="grid grid-cols-2 gap-5">
                <Card className="bg-white rounded-[16px] border border-[#e8ebd4] p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 shrink-0">
                      <Bell size={15} className="text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#17320f]">Low Stock Alert</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Get notified when stock falls below the limit</p>
                    </div>
                  </div>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Threshold Value</label>
                      <Input
                        type="number"
                        min="1"
                        {...register("lowStockThreshold", { required: "Required" })}
                        className="rounded-xl border-[#dde1bc] bg-[#fafbf3]"
                      />
                      {errors.lowStockThreshold && (
                        <p className="text-red-400 text-xs mt-1.5">{errors.lowStockThreshold.message as string}</p>
                      )}
                    </div>
                    <Button type="submit" size="sm" className="gap-2 rounded-xl border-0  ">
                      <Save size={13} /> Save
                    </Button>
                  </form>
                </Card>

                <Card className="bg-white rounded-[16px] border border-[#e8ebd4] p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 shrink-0">
                      <Shield size={15} className="text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#17320f]">Order Notifications</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Choose how you receive order updates</p>
                    </div>
                  </div>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Notification Method</label>
                      <select
                        {...register("notificationPreference")}
                        className="h-10 w-full rounded-xl border border-[#dde1bc] bg-[#fafbf3] px-3 text-sm text-foreground outline-none focus:border-lime-400"
                      >
                        <option value="email" className="bg-white">Email</option>
                        <option value="web" className="bg-white">Web Push</option>
                        <option value="app" className="bg-white">App Push</option>
                        <option value="all" className="bg-white">All channels</option>
                      </select>
                    </div>
                    <Button type="submit" size="sm" className="gap-2 rounded-xl border-0  ">
                      <Save size={13} /> Save
                    </Button>
                  </form>
                </Card>
              </div>

              {/* Danger Zone */}
              <Card className="rounded-[16px] border border-red-200 bg-red-50/60 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/15 shrink-0">
                    <Trash2 size={15} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#17320f]">Danger Zone</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Irreversible actions — proceed with caution</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  className={`rounded-xl border-0 text-white ${seller?.isDeleted ? " " : "bg-red-600 hover:bg-red-700"}`}
                >
                  {seller?.isDeleted ? "Restore Shop" : "Delete Shop"}
                </Button>
              </Card>
            </>
          )}

          {active === "policies" && (
            <Card className="bg-white rounded-[16px] border border-[#e8ebd4] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 shrink-0">
                  <FileText size={15} className="text-violet-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#17320f]">Policy Links</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Add URLs for your shop's legal and policy pages</p>
                </div>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Terms of Service</label>
                    <Input
                      type="url"
                      placeholder="https://yourshop.com/terms"
                      {...register("termsURL")}
                      className="rounded-xl border-[#dde1bc] bg-[#fafbf3]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Privacy Policy</label>
                    <Input
                      type="url"
                      placeholder="https://yourshop.com/privacy"
                      {...register("privacyURL")}
                      className="rounded-xl border-[#dde1bc] bg-[#fafbf3]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Refund Policy</label>
                    <Input
                      type="url"
                      placeholder="https://yourshop.com/refund"
                      {...register("refundURL")}
                      className="rounded-xl border-[#dde1bc] bg-[#fafbf3]"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground/70">
                  These links appear in your storefront footer and checkout flow.
                </p>
                <Button type="submit" size="sm" className="gap-2 rounded-xl border-0  ">
                  <Save size={13} /> Save Policies
                </Button>
              </form>
            </Card>
          )}

          {active === "custom-domains" && <CustomDomains />}
          {active === "withdraw" && <WithdrawMethod />}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <Card className="relative w-full max-w-md rounded-[20px] border border-[#dde1bc] bg-[#fffdf4] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15 shrink-0">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {seller?.isDeleted ? "Restore Shop" : "Delete Shop"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {seller?.isDeleted ? "Restore your shop to resume selling" : "This action can be reversed within 28 days"}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              {seller?.isDeleted
                ? "Your shop is currently marked for deletion. Restore it to resume all operations."
                : <>Deleting your shop is a <span className="font-medium text-foreground">permanent action</span>. You have <span className="font-medium text-amber-500">28 days</span> to restore it before all data is erased.</>}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(false)} className="rounded-xl border-[#dde1bc] bg-white hover:bg-[#f6f8ea]">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={deleteShopHandler}
                className={`rounded-xl border-0 text-white ${seller?.isDeleted ? " " : "bg-red-600 hover:bg-red-700"}`}
              >
                {seller?.isDeleted ? "Restore Shop" : "Delete Shop"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
