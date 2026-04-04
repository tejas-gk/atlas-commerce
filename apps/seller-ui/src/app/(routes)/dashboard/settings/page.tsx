"use client";

import React, { useState } from "react";
import { Bell, Shield, Trash2, AlertTriangle, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";
import useSeller from "@/hooks/useSeller";
import CustomDomains from "@/shared/modules/settings";
import WithdrawMethod from "@/shared/modules/settings/withdraw-method";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";

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
  const handleDelete = () => { seller?.isDeleted ? restoreShopMutation.mutate() : deleteShopMutation.mutate(); setShowDeleteModal(false); };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-white/50 text-sm mt-0.5">Configure your store preferences</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="bg-white/5 border border-white/8 p-1 rounded-xl w-fit">
          <TabsTrigger value="general" className="rounded-lg text-sm font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/15 data-[state=inactive]:text-white/50">
            General
          </TabsTrigger>
          <TabsTrigger value="custom-domains" className="rounded-lg text-sm font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/15 data-[state=inactive]:text-white/50">
            Custom Domains
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="rounded-lg text-sm font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/15 data-[state=inactive]:text-white/50">
            Withdraw Method
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="max-w-2xl space-y-3 mt-4">
          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="lowStock" className="rounded-2xl border border-white/8 bg-white/5 overflow-hidden px-0">
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-white/3">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-violet-400" />
                  <div className="text-left">
                    <p className="text-white font-semibold text-sm">Low Stock Alert Threshold</p>
                    <p className="text-white/50 text-xs mt-0.5">Get notified when stock falls below the set limit.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 border-t border-white/5 pt-4 space-y-3">
                <Input type="number" min="1"
                  className="bg-white/5 border-white/10 text-white focus:border-violet-500"
                  {...register("lowStockThreshold", { required: true })} />
                <Button onClick={handleSubmit(onSubmit)}
                  className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-semibold shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                  <Save size={15} /> Save Changes
                </Button>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="notifications" className="rounded-2xl border border-white/8 bg-white/5 overflow-hidden px-0">
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-white/3">
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-amber-400" />
                  <div className="text-left">
                    <p className="text-white font-semibold text-sm">Order Notification Preferences</p>
                    <p className="text-white/50 text-xs mt-0.5">Choose how you receive order notifications.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 border-t border-white/5 pt-4 space-y-3">
                <select {...register("notificationPreference")}
                  className="w-full h-10 px-3 rounded-lg bg-[#0d0d0d] border border-white/10 text-white text-sm outline-none focus:border-violet-500">
                  <option value="email" className="bg-[#111]">Email</option>
                  <option value="web" className="bg-[#111]">Web Push</option>
                  <option value="app" className="bg-[#111]">App Push</option>
                  <option value="all" className="bg-[#111]">All</option>
                </select>
                <Button onClick={handleSubmit(onSubmit)}
                  className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-semibold shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                  <Save size={15} /> Save Changes
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Danger Zone */}
          <Card className="border-red-500/20 bg-red-950/20 p-5">
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
              <Button variant="outline" size="sm"
                onClick={() => setShowDeleteModal(true)}
                className={seller?.isDeleted
                  ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-400"
                  : "border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"}>
                {seller?.isDeleted ? "Restore" : "Delete"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="custom-domains" className="mt-4"><CustomDomains /></TabsContent>
        <TabsContent value="withdraw" className="mt-4"><WithdrawMethod /></TabsContent>
      </Tabs>

      {/* Delete modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-[#111111] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Trash2 size={18} className="text-red-400" />
              {seller?.isDeleted ? "Restore Shop" : "Delete Shop"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-white/50 text-sm leading-relaxed">
            {seller?.isDeleted
              ? "Your shop is pending deletion. Restoring it will resume normal operations immediately."
              : "Deleting your shop will mark it for permanent removal. You have 28 days to restore it. After that, it cannot be recovered, and this email cannot be reused."}
          </p>
          <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-amber-400 text-xs">
              {seller?.isDeleted
                ? "Restoring will cancel the scheduled deletion."
                : "You can restore your shop within 28 days after deletion."}
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}
              className="flex-1 bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button onClick={handleDelete}
              className={`flex-1 text-white font-semibold ${seller?.isDeleted ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}>
              {seller?.isDeleted ? "Restore Shop" : "Confirm Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
              className="flex-1 bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button onClick={handleDelete}
              className={`flex-1 text-white font-semibold ${seller?.isDeleted ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}>
              {seller?.isDeleted ? "Restore Shop" : "Confirm Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
