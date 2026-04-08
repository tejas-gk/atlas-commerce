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
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your shop preferences and configurations</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.05] w-fit">
        {SETTINGS_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 h-9 rounded-md text-sm font-medium transition-all duration-150 ${activeTab === tab.key
                  ? "bg-card text-foreground border border-white/[0.08] shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
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
              <Card key={section.key} className="border border-white/[0.06] bg-card/50 overflow-hidden">
                <button
                  onClick={() => toggleSection(section.key)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
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
                  <div className="px-5 pb-5 border-t border-white/[0.05]">
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
                            className="border-white/[0.08] bg-white/[0.03]"
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
                            className="w-full h-9 px-3 text-sm border border-white/[0.08] bg-white/[0.03] rounded-md text-foreground outline-none focus:border-emerald-500/50 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="email" className="bg-card">Email</option>
                            <option value="web" className="bg-card">Web Push Notification</option>
                            <option value="app" className="bg-card">App Push Notification</option>
                            <option value="all" className="bg-card">All of the above</option>
                          </select>
                        </div>
                      )}

                      <Button
                        type="submit"
                        size="sm"
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
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
          <Card className="border border-red-500/20 bg-red-500/[0.02] overflow-hidden mt-8">
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
          <Card className="relative w-full max-w-md p-6 border border-white/[0.08] bg-card shadow-2xl">
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
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <p className="text-xs text-amber-400/80">
                    <span className="font-medium">⚠️ Important:</span> Once permanently deleted,
                    you cannot create a new account with the same email.
                  </p>
                </div>
              )}

              <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-3">
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
                className="border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={deleteShopHandler}
                className={seller?.isDeleted
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                  : "bg-red-600 hover:bg-red-700 text-white border-0"
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
