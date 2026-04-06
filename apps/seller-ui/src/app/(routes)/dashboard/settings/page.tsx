"use client";

import React, { useState } from "react";
import { Bell, Shield, Trash2, AlertTriangle, Save, Store, Globe, CreditCard, Settings as SettingsIcon } from "lucide-react";
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

export default function SettingsPage() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { seller } = useSeller();
  const queryClient = useQueryClient();

  const { register, handleSubmit } = useForm({
    defaultValues: { lowStockThreshold: "10", notificationPreference: "email" },
  });

  const deleteShopMutation = useMutation({
    mutationFn: async () => (await axiosInstance.delete("/seller/api/delete")).data,
    onSuccess: () => { toast.success("Shop marked for deletion. Restore within 28 days."); queryClient.invalidateQueries({ queryKey: ["seller"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to delete shop."),
  });
  const restoreShopMutation = useMutation({
    mutationFn: async () => (await axiosInstance.patch("/seller/api/restore")).data,
    onSuccess: () => { toast.success("Shop restored!"); queryClient.invalidateQueries({ queryKey: ["seller"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to restore shop."),
  });

  const onSubmit = () => toast.success("Settings saved!");
  const handleDelete = () => {
    seller?.isDeleted ? restoreShopMutation.mutate() : deleteShopMutation.mutate();
    setShowDeleteModal(false);
  };

  const initials = seller?.name
    ? seller.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "S";

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Configure your store preferences and account</p>
      </div>

      {/* Store profile card */}
      <Card className="border border-white/[0.08] bg-card/50 p-5">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-rose-500/15 border border-rose-500/20 flex items-center justify-center shrink-0">
            <span className="text-rose-400 font-semibold text-lg">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{seller?.name || "Your Store"}</p>
            <p className="text-sm text-muted-foreground/60 mt-0.5 truncate">{seller?.email || "—"}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${seller?.isDeleted ? "bg-red-400" : "bg-emerald-400"}`} />
              <span className="text-[11px] text-muted-foreground/50">
                {seller?.isDeleted ? "Pending deletion" : "Active seller"}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:text-foreground shrink-0"
          >
            <Store size={12} /> Edit Profile
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="general">
        <TabsList className="bg-white/[0.03] border border-white/[0.06] p-1 rounded-xl w-fit gap-0.5">
          {[
            { key: "general", label: "General", Icon: SettingsIcon },
            { key: "custom-domains", label: "Domains", Icon: Globe },
            { key: "withdraw", label: "Withdraw", Icon: CreditCard },
          ].map(({ key, label, Icon }) => (
            <TabsTrigger
              key={key}
              value={key}
              className="flex items-center gap-1.5 rounded-lg text-xs font-medium px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-white/[0.08] data-[state=inactive]:text-muted-foreground transition-all"
            >
              <Icon size={12} />{label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general" className="max-w-2xl space-y-4 mt-5">
          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="lowStock" className="rounded-xl border border-white/[0.06] bg-card/50 overflow-hidden px-0">
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500/15 shrink-0">
                    <Bell size={16} className="text-rose-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-foreground font-medium text-[13px]">Low Stock Alert Threshold</p>
                    <p className="text-muted-foreground/60 text-xs mt-0.5">Get notified when stock falls below the set limit.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 border-t border-white/[0.05] pt-4 space-y-3">
                <Input type="number" min="1"
                  className="border-white/[0.08] bg-white/[0.03] focus:border-rose-500"
                  {...register("lowStockThreshold", { required: true })} />
                <Button onClick={handleSubmit(onSubmit)} className="gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold border-0">
                  <Save size={15} /> Save Changes
                </Button>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="notifications" className="rounded-xl border border-white/[0.06] bg-card/50 overflow-hidden px-0">
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/15 shrink-0">
                    <Shield size={16} className="text-amber-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-foreground font-medium text-[13px]">Order Notification Preferences</p>
                    <p className="text-muted-foreground/60 text-xs mt-0.5">Choose how you receive order notifications.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 border-t border-white/[0.05] pt-4 space-y-3">
                <select {...register("notificationPreference")}
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-foreground text-sm outline-none focus:border-rose-500">
                  <option value="email" className="bg-card">Email</option>
                  <option value="web" className="bg-card">Web Push</option>
                  <option value="app" className="bg-card">App Push</option>
                  <option value="all" className="bg-card">All Channels</option>
                </select>
                <Button onClick={handleSubmit(onSubmit)} className="gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold border-0">
                  <Save size={15} /> Save Changes
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Danger Zone */}
          <Card className="border border-red-500/15 bg-red-950/10 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={13} className="text-red-400" />
              <h3 className="text-red-400 font-semibold text-xs uppercase tracking-wider">Danger Zone</h3>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10 shrink-0">
                  <Trash2 size={15} className="text-red-400" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-semibold">
                    {seller?.isDeleted ? "Restore Shop" : "Delete Shop"}
                  </p>
                  <p className="text-red-400/60 text-xs mt-0.5">
                    {seller?.isDeleted
                      ? "Your shop is pending deletion. Restore it before 28 days."
                      : "Mark your shop for deletion. You have 28 days to restore."}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className={`shrink-0 ${
                  seller?.isDeleted
                    ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-400"
                    : "border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                }`}
              >
                {seller?.isDeleted ? "Restore" : "Delete"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="custom-domains" className="mt-5"><CustomDomains /></TabsContent>
        <TabsContent value="withdraw" className="mt-5"><WithdrawMethod /></TabsContent>
      </Tabs>

      {/* Delete modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-card border border-white/[0.08]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 size={18} className="text-red-400" />
              {seller?.isDeleted ? "Restore Shop" : "Delete Shop"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm leading-relaxed">
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
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1">
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
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Configure your store preferences</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="bg-muted/50 border border-white/[0.06] p-1 rounded-xl w-fit">
          <TabsTrigger value="general" className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-white/[0.08] data-[state=inactive]:text-muted-foreground">
            General
          </TabsTrigger>
          <TabsTrigger value="custom-domains" className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-white/[0.08] data-[state=inactive]:text-muted-foreground">
            Custom Domains
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-white/[0.08] data-[state=inactive]:text-muted-foreground">
            Withdraw Method
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="max-w-2xl space-y-3 mt-4">
          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="lowStock" className="rounded-xl border border-white/[0.06] bg-card/50 overflow-hidden px-0">
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500/15 shrink-0">
                    <Bell size={16} className="text-rose-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-foreground font-medium text-[13px]">Low Stock Alert Threshold</p>
                    <p className="text-muted-foreground/60 text-xs mt-0.5">Get notified when stock falls below the set limit.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 border-t border-white/[0.05] pt-4 space-y-3">
                <Input type="number" min="1"
                  className="border-white/[0.08] bg-white/[0.03] focus:border-rose-500"
                  {...register("lowStockThreshold", { required: true })} />
                <Button onClick={handleSubmit(onSubmit)}
                  className="gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold border-0">
                  <Save size={15} /> Save Changes
                </Button>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="notifications" className="rounded-xl border border-white/[0.06] bg-card/50 overflow-hidden px-0">
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/15 shrink-0">
                    <Shield size={16} className="text-amber-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-foreground font-medium text-[13px]">Order Notification Preferences</p>
                    <p className="text-muted-foreground/60 text-xs mt-0.5">Choose how you receive order notifications.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 border-t border-white/[0.05] pt-4 space-y-3">
                <select {...register("notificationPreference")}
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-foreground text-sm outline-none focus:border-rose-500">
                  <option value="email" className="bg-card">Email</option>
                  <option value="web" className="bg-card">Web Push</option>
                  <option value="app" className="bg-card">App Push</option>
                  <option value="all" className="bg-card">All</option>
                </select>
                <Button onClick={handleSubmit(onSubmit)}
                  className="gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold border-0">
                  <Save size={15} /> Save Changes
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Danger Zone */}
          <Card className="border-red-500/15 bg-red-950/10 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={14} className="text-red-400" />
              <h3 className="text-red-400 font-semibold text-xs uppercase tracking-wider">Danger Zone</h3>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trash2 size={18} className="text-muted-foreground" />
                <div>
                  <p className="text-foreground text-sm font-semibold">
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
        <DialogContent className="bg-card border border-white/[0.08]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 size={18} className="text-red-400" />
              {seller?.isDeleted ? "Restore Shop" : "Delete Shop"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm leading-relaxed">
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
              className="flex-1">
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
