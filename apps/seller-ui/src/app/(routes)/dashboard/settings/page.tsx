"use client";

import React, { useState } from "react";
import {
  Bell,
  Shield,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Save,
  Globe,
  Wallet,
  Settings2,
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

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [expandedSection, setExpandedSection] = useState<string | null>("lowStock");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { seller } = useSeller();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
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
    console.log("Settings Updated:", data);
    toast.success("Settings saved successfully!");
  };

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  const deleteShopHandler = () => {
    if (seller?.isDeleted) {
      restoreShopMutation.mutate();
    } else {
      deleteShopMutation.mutate();
    }
    setShowDeleteModal(false);
  };

  const SETTINGS_TABS = [
    { key: "general", label: "General", icon: Settings2 },
    { key: "custom-domains", label: "Custom Domains", icon: Globe },
    { key: "withdraw", label: "Withdraw Method", icon: Wallet },
  ];

  const SETTINGS_SECTIONS = [
    {
      key: "lowStock",
      icon: Bell,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/15",
      title: "Low Stock Alert Threshold",
      description: "Get notified when stock falls below the set limit.",
    },
    {
      key: "notifications",
      icon: Shield,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/15",
      title: "Order Notification Preferences",
      description: "Choose how you receive order notifications (Email, Web, App).",
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-[-0.05em] text-[#17320f]">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your shop preferences and configurations</p>
      </div>

      <div className="flex w-fit items-center gap-0.5 rounded-2xl border border-[#e0e4be] bg-white/70 p-1">
        {SETTINGS_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex h-9 items-center gap-2 rounded-xl px-4 text-sm font-medium transition-all duration-150 ${activeTab === tab.key
                  ? "seller-tab-active"
                  : "seller-tab hover:text-foreground"
                }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <div className="max-w-3xl space-y-4">
          {SETTINGS_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === section.key;

            return (
              <Card key={section.key} className="seller-panel overflow-hidden rounded-[28px] border-0">
                <button
                  onClick={() => toggleSection(section.key)}
                  className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-[#fbfced]"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${section.iconBg}`}>
                      <Icon size={18} className={section.iconColor} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-foreground font-medium">{section.title}</h3>
                      <p className="text-sm text-muted-foreground/60 mt-0.5">{section.description}</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown size={18} className="text-muted-foreground" />
                  ) : (
                    <ChevronRight size={18} className="text-muted-foreground" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-[#ecefd8] px-5 pb-5">
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
                      {section.key === "lowStock" && (
                        <div>
                          <label className="text-xs text-muted-foreground mb-2 block">
                            Threshold Value
                          </label>
                          <Input
                            type="number"
                            min="1"
                            {...register("lowStockThreshold", { required: "Required" })}
                            className="rounded-2xl border-[#dde1bc] bg-white"
                            onClick={(e: any) => e.stopPropagation()}
                          />
                          {errors.lowStockThreshold && (
                            <p className="text-red-400 text-xs mt-1.5">
                              {errors.lowStockThreshold.message}
                            </p>
                          )}
                        </div>
                      )}

                      {section.key === "notifications" && (
                        <div>
                          <label className="text-xs text-muted-foreground mb-2 block">
                            Notification Method
                          </label>
                          <select
                            {...register("notificationPreference", { required: "Required" })}
                            className="h-10 w-full rounded-2xl border border-[#dde1bc] bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-lime-400"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="email" className="bg-white">Email</option>
                            <option value="web" className="bg-white">Web Push Notification</option>
                            <option value="app" className="bg-white">App Push Notification</option>
                            <option value="all" className="bg-white">All of the above</option>
                          </select>
                        </div>
                      )}

                      <Button
                        type="submit"
                        size="sm"
                        className="gap-2 rounded-2xl border-0 bg-[#86b81d] text-white hover:bg-[#77a51b]"
                      >
                        <Save size={14} />
                        Save Changes
                      </Button>
                    </form>
                  </div>
                )}
              </Card>
            );
          })}

          {/* Danger Zone */}
          <Card className="mt-8 overflow-hidden rounded-[28px] border border-red-200 bg-red-50/70">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-red-500/[0.04] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full shrink-0 bg-red-500/15">
                  <Trash2 size={18} className="text-red-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-foreground font-medium">Delete Shop</h3>
                  <p className="text-sm text-red-400/60 mt-0.5">
                    Permanently delete your shop and all associated data
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-red-400/60" />
            </button>
          </Card>
        </div>
      )}

      {activeTab === "custom-domains" && <CustomDomains />}

      {activeTab === "withdraw" && <WithdrawMethod />}

      {/* Delete Shop Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <Card className="relative w-full max-w-md rounded-[28px] border border-[#dde1bc] bg-[#fffdf4] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {seller?.isDeleted ? "Restore Shop" : "Delete Shop"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {seller?.isDeleted
                    ? "Restore your shop to resume selling"
                    : "This action can be reversed within 28 days"}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm text-muted-foreground">
                {seller?.isDeleted ? (
                  "Your shop is currently marked for deletion. You can restore it now to resume all operations."
                ) : (
                  <>
                    Deleting your shop is a <span className="text-foreground font-medium">permanent action</span>.
                    However, you have <span className="text-amber-400 font-medium">28 days</span> to restore your
                    shop before it is permanently removed.
                  </>
                )}
              </p>

              {!seller?.isDeleted && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs text-amber-400/80">
                    <span className="font-medium">⚠️ Important:</span> Once permanently deleted,
                    you cannot create a new account with the same email.
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-[#dde1bc] bg-white p-3">
                <p className="text-xs text-muted-foreground">
                  {seller?.isDeleted ? (
                    "Restoring your shop will reactivate all your products and settings immediately."
                  ) : (
                    <>
                      Recovery period ends in <span className="text-foreground font-medium">28 days</span>.
                      After that, all data will be permanently erased.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-2xl border-[#dde1bc] bg-white hover:bg-[#f6f8ea]"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={deleteShopHandler}
                className={seller?.isDeleted
                  ? "rounded-2xl border-0 bg-[#86b81d] text-white hover:bg-[#77a51b]"
                  : "rounded-2xl border-0 bg-red-600 text-white hover:bg-red-700"
                }
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
