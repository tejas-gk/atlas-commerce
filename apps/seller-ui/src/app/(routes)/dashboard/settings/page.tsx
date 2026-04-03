"use client";

import React, { useState } from "react";
import { Bell, Shield, Trash2, AlertTriangle, ChevronDown, ChevronRight, Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";
import useSeller from "@/hooks/useSeller";
import CustomDomains from "@/shared/modules/settings";
import WithdrawMethod from "@/shared/modules/settings/withdraw-method";
import { Input } from "@workspace/ui/components/input";

const TABS = [
  { key: "general", label: "General" },
  { key: "custom-domains", label: "Custom Domains" },
  { key: "withdraw", label: "Withdraw Method" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { seller } = useSeller();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { lowStockThreshold: "10", notificationPreference: "email" },
  });

  const deleteShopMutation = useMutation({
    mutationFn: async () => { const res = await axiosInstance.delete("/seller/api/delete"); return res.data; },
    onSuccess: () => { toast.success("Shop marked for deletion. Restore within 28 days."); queryClient.invalidateQueries({ queryKey: ["seller"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to delete shop."),
  });
  const restoreShopMutation = useMutation({
    mutationFn: async () => { const res = await axiosInstance.patch("/seller/api/restore"); return res.data; },
    onSuccess: () => { toast.success("Shop restored!"); queryClient.invalidateQueries({ queryKey: ["seller"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to restore shop."),
  });

  const onSubmit = (data: any) => toast.success("Settings saved!");
  const toggleSection = (s: string) => setExpandedSection((p) => (p === s ? null : s));
  const handleDelete = () => { seller?.isDeleted ? restoreShopMutation.mutate() : deleteShopMutation.mutate(); setShowDeleteModal(false); };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">Settings</h1>
        <p className="text-white/35 text-sm mt-0.5">Configure your store preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/4 border border-white/8 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.35)]"
                : "text-white/40 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* General tab */}
      {activeTab === "general" && (
        <div className="max-w-2xl space-y-3">
          {/* Low Stock Alert */}
          <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-md overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4"
              onClick={() => toggleSection("lowStock")}
            >
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-violet-400" />
                <div className="text-left">
                  <p className="text-white font-semibold text-sm">Low Stock Alert Threshold</p>
                  <p className="text-white/35 text-xs mt-0.5">Get notified when stock falls below the set limit.</p>
                </div>
              </div>
              {expandedSection === "lowStock"
                ? <ChevronDown size={16} className="text-white/30" />
                : <ChevronRight size={16} className="text-white/30" />}
            </button>
            {expandedSection === "lowStock" && (
              <form onSubmit={handleSubmit(onSubmit)} className="px-5 pb-5 border-t border-white/5 pt-4 space-y-3">
                <Input type="number" min="1"
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-violet-500 rounded-xl h-10"
                  {...register("lowStockThreshold", { required: true })} />
                <button type="submit"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-semibold shadow-[0_0_12px_rgba(124,58,237,0.3)] transition-all">
                  <Save size={15} /> Save Changes
                </button>
              </form>
            )}
          </div>

          {/* Notification Preferences */}
          <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-md overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4"
              onClick={() => toggleSection("notifications")}
            >
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-amber-400" />
                <div className="text-left">
                  <p className="text-white font-semibold text-sm">Order Notification Preferences</p>
                  <p className="text-white/35 text-xs mt-0.5">Choose how you receive order notifications.</p>
                </div>
              </div>
              {expandedSection === "notifications"
                ? <ChevronDown size={16} className="text-white/30" />
                : <ChevronRight size={16} className="text-white/30" />}
            </button>
            {expandedSection === "notifications" && (
              <form onSubmit={handleSubmit(onSubmit)} className="px-5 pb-5 border-t border-white/5 pt-4 space-y-3">
                <select {...register("notificationPreference")}
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm outline-none focus:border-violet-500/50">
                  <option value="email" className="bg-[#111]">Email</option>
                  <option value="web" className="bg-[#111]">Web Push</option>
                  <option value="app" className="bg-[#111]">App Push</option>
                  <option value="all" className="bg-[#111]">All</option>
                </select>
                <button type="submit"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-semibold shadow-[0_0_12px_rgba(124,58,237,0.3)] transition-all">
                  <Save size={15} /> Save Changes
                </button>
              </form>
            )}
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-md p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-red-400" />
              <h3 className="text-red-400 font-bold text-sm">Danger Zone</h3>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trash2 size={18} className="text-white/40" />
                <div>
                  <p className="text-white text-sm font-semibold">
                    {seller?.isDeleted ? "Restore Shop" : "Delete Shop"}
                  </p>
                  <p className="text-red-400/70 text-xs mt-0.5">
                    {seller?.isDeleted
                      ? "Your shop is pending deletion. Restore it before 28 days."
                      : "Deleting your shop is irreversible. Proceed with caution."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  seller?.isDeleted
                    ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    : "border-red-500/30 text-red-400 hover:bg-red-500/10"
                }`}
              >
                {seller?.isDeleted ? "Restore" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "custom-domains" && <CustomDomains />}
      {activeTab === "withdraw" && <WithdrawMethod />}

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111111] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trash2 size={18} className="text-red-400" />
                <h3 className="text-white font-bold">{seller?.isDeleted ? "Restore Shop" : "Delete Shop"}</h3>
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="text-white/30 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              {seller?.isDeleted
                ? "Your shop is pending deletion. Restoring it will resume normal operations immediately."
                : "Deleting your shop will mark it for permanent removal. You have 28 days to restore it. After that, it cannot be recovered, and this email cannot be reused."}
            </p>
            <div className="mt-4 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <p className="text-amber-400 text-xs">
                {seller?.isDeleted
                  ? "Restoring will cancel the scheduled deletion."
                  : "You can restore your shop within 28 days after deletion."}
              </p>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowDeleteModal(false)}
                className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-sm transition-all">
                Cancel
              </button>
              <button onClick={handleDelete}
                className={`flex-1 h-10 rounded-xl text-white text-sm font-semibold transition-all ${
                  seller?.isDeleted
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:opacity-90"
                    : "bg-gradient-to-r from-red-600 to-red-500 hover:opacity-90"
                }`}>
                {seller?.isDeleted ? "Restore Shop" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
