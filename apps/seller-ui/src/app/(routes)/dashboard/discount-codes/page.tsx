"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { Plus, Trash, Tag, Percent, DollarSign, Copy, BarChart2 } from "lucide-react";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import DeleteDiscountCodeModal from "@/shared/components/modals/delete.discount-codes";
import useSeller from "@/hooks/useSeller";

const SAMPLE_CODES = [
  { id: "s1", public_name: "Summer Sale", discountCode: "SUMMER25", discountType: "percentage", discountValue: "25" },
  { id: "s2", public_name: "New User Welcome", discountCode: "WELCOME10", discountType: "flat", discountValue: "10" },
  { id: "s3", public_name: "Flash Deal", discountCode: "FLASH50", discountType: "percentage", discountValue: "50" },
];

export default function DiscountCodesPage() {
  const { seller } = useSeller();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>();
  const queryClient = useQueryClient();
  const shopId = seller?.activeShopId || seller?.shop?.id;

  const { data: apiCodes = [], isLoading } = useQuery({
    queryKey: ["shop-discounts", shopId],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-discount-codes", {
        params: { shopId },
      });
      return res?.data?.discount_codes || [];
    },
    enabled: !!shopId,
  });

  const discountCodes: any[] = apiCodes.length ? apiCodes : SAMPLE_CODES;

  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: { public_name: "", discountType: "percentage", discountValue: "", discountCode: "" },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await axiosInstance.post("/product/api/create-discount-code", {
        ...data,
        shopId,
      });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["shop-discounts"] }); reset(); setShowModal(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: any) => {
      await axiosInstance.delete(`/product/api/delete-discount-code/${id}`, {
        params: { shopId },
      });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["shop-discounts"] }); setShowDeleteModal(false); },
  });

  const onSubmit = (data: any) => {
    if (discountCodes.length >= 8) { toast.error("Max 8 discount codes allowed."); return; }
    createMutation.mutate(data);
  };

  const percentCount = discountCodes.filter((c) => c.discountType === "percentage").length;
  const flatCount = discountCodes.filter((c) => c.discountType === "flat").length;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-0.05em] text-[#17320f]">Discount Codes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create and manage promotional codes</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          size="sm"
          className="gap-1.5 rounded-2xl border-0  text-white font-semibold "
        >
          <Plus size={15} /> Add Code
        </Button>
      </div>

      {/* Stats row */}
      {(() => {
        const remaining = Math.max(0, 8 - discountCodes.length);
        const usedPct = Math.round((discountCodes.length / 8) * 100);
        const totalValue = discountCodes.reduce((sum: number, c: any) => sum + Number(c.discountValue || 0), 0);
        const avgValue = discountCodes.length ? Math.round(totalValue / discountCodes.length) : 0;
        const suffix = percentCount >= flatCount ? "%" : "$";
        const highest = discountCodes.length ? Math.max(...discountCodes.map((c: any) => Number(c.discountValue))) : 0;
        const lowest = discountCodes.length ? Math.min(...discountCodes.map((c: any) => Number(c.discountValue))) : 0;
        const splitPct = discountCodes.length ? Math.round((percentCount / discountCodes.length) * 100) : 0;
        const R = 18, CIRC = 2 * Math.PI * R;
        const dash = (usedPct / 100) * CIRC;
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Codes */}
            <Card className="rounded-[12px] border border-[#e8ebd4] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.07)]">
              <div className="flex items-start justify-between">
                <p className="text-[13px] font-medium text-[#888]">Total Codes</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0f4d8]">
                  <Tag size={15} className="text-[#556244]" />
                </div>
              </div>
              <p className="mt-3 text-[2rem] font-bold leading-none tracking-tight text-[#111]">{discountCodes.length}</p>
              <div className="mt-2.5 flex items-center gap-4 border-t border-[#f4f5ec] pt-2.5">
                <div><p className="text-[10px] text-muted-foreground leading-none">Percentage</p><p className="text-[12px] font-semibold text-[#17320f] mt-0.5 leading-none">{percentCount}</p></div>
                <div><p className="text-[10px] text-muted-foreground leading-none">Flat</p><p className="text-[12px] font-semibold text-[#17320f] mt-0.5 leading-none">{flatCount}</p></div>
              </div>
            </Card>

            {/* Avg Discount */}
            <Card className="rounded-[12px] border border-[#e8ebd4] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.07)]">
              <div className="flex items-start justify-between">
                <p className="text-[13px] font-medium text-[#888]">Avg Discount</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                  <BarChart2 size={15} className="text-emerald-600" />
                </div>
              </div>
              <p className="mt-3 text-[2rem] font-bold leading-none tracking-tight text-[#111]">{avgValue}{suffix}</p>
              <div className="mt-2.5 flex items-center gap-4 border-t border-[#f4f5ec] pt-2.5">
                <div><p className="text-[10px] text-muted-foreground leading-none">Highest</p><p className="text-[12px] font-semibold text-[#17320f] mt-0.5 leading-none">{highest}{suffix}</p></div>
                <div><p className="text-[10px] text-muted-foreground leading-none">Lowest</p><p className="text-[12px] font-semibold text-[#17320f] mt-0.5 leading-none">{lowest}{suffix}</p></div>
              </div>
            </Card>

            {/* Type Split */}
            <Card className="rounded-[12px] border border-[#e8ebd4] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.07)]">
              <div className="flex items-start justify-between">
                <p className="text-[13px] font-medium text-[#888]">Type Split</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50">
                  <Percent size={15} className="text-violet-500" />
                </div>
              </div>
              <p className="mt-3 text-[2rem] font-bold leading-none tracking-tight text-[#111]">{splitPct}%</p>
              <div className="mt-2.5 space-y-1.5">
                <div className="h-1.5 w-full rounded-full bg-[#f0f2e0] overflow-hidden">
                  <div className="h-full rounded-full bg-violet-400" style={{ width: `${splitPct}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground">% Percentage</p>
                  <p className="text-[10px] text-muted-foreground">$ Flat</p>
                </div>
              </div>
            </Card>

            {/* Remaining Slots */}
            <Card className="rounded-[12px] border border-[#e8ebd4] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.07)]">
              <div className="flex items-start justify-between">
                <p className="text-[13px] font-medium text-[#888]">Remaining Slots</p>
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r={R} fill="none" stroke="#f0f2e0" strokeWidth="3.5" />
                  <circle cx="20" cy="20" r={R} fill="none" stroke="#86b81d" strokeWidth="3.5"
                    strokeDasharray={`${dash} ${CIRC}`}
                    strokeDashoffset={CIRC / 4}
                    strokeLinecap="round"
                  />
                  <text x="20" y="24" textAnchor="middle" fontSize="9" fontWeight="700" fill="#17320f">{usedPct}%</text>
                </svg>
              </div>
              <p className="mt-1 text-[2rem] font-bold leading-none tracking-tight text-[#111]">{remaining}</p>
              <div className="mt-2.5 flex items-center gap-4 border-t border-[#f4f5ec] pt-2.5">
                <div><p className="text-[10px] text-muted-foreground leading-none">Used</p><p className="text-[12px] font-semibold text-[#17320f] mt-0.5 leading-none">{discountCodes.length}</p></div>
                <div><p className="text-[10px] text-muted-foreground leading-none">Max</p><p className="text-[12px] font-semibold text-[#17320f] mt-0.5 leading-none">8</p></div>
              </div>
            </Card>
          </div>
        );
      })()}

      {/* Table / empty state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-[#86b81d]/30 border-t-[#86b81d] animate-spin" />
        </div>
      ) : discountCodes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 bg-white rounded-[16px] border border-[#e8ebd4] shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0f4d8] mb-4">
            <Tag size={22} className="text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground">No discount codes yet</p>
          <p className="text-xs text-muted-foreground/50 mt-1">Create your first promotional code</p>
          <Button size="sm" onClick={() => setShowModal(true)} className="mt-5 gap-1.5 rounded-xl border-0  ">
            <Plus size={14} /> Add Code
          </Button>
        </Card>
      ) : (
        <Card className="bg-white rounded-[16px] border border-[#e8ebd4] shadow-sm overflow-hidden">
          {/* Table head */}
          <div className="grid grid-cols-[2fr_1.5fr_80px_80px_40px] items-center px-5 py-2.5 border-b border-[#f0f2e0] bg-[#fafbf5]">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Name / Code</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Type</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Value</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Limit</span>
            <span />
          </div>
          {discountCodes.map((code: any) => (
            <div
              key={code.id}
              className="grid grid-cols-[2fr_1.5fr_80px_80px_40px] items-center px-5 py-3.5 border-b border-[#f5f6ee] last:border-0 hover:bg-[#fafbf5] transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-[#17320f]">{code.public_name}</p>
                <span className="inline-flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-[11px] text-muted-foreground bg-[#f0f2e0] rounded px-1.5 py-0.5">
                    {code.discountCode}
                  </span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(code.discountCode); toast.success("Copied!"); }}
                    className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground/40 hover:text-[#17320f] transition-colors"
                  >
                    <Copy size={11} />
                  </button>
                </span>
              </div>
              <div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${code.discountType === "percentage"
                  ? "bg-[#e6f9f0] text-[#16a34a]"
                  : "bg-blue-50 text-blue-600"
                  }`}>
                  {code.discountType === "percentage" ? <Percent size={10} /> : <DollarSign size={10} />}
                  {code.discountType === "percentage" ? "Percentage" : "Flat"}
                </span>
              </div>
              <p className="text-sm font-bold tracking-tight text-[#111]">
                {code.discountType === "percentage" ? `${code.discountValue}%` : `$${code.discountValue}`}
              </p>
              <p className="text-xs text-muted-foreground">8 max</p>
              <button
                onClick={() => { setSelectedDiscount(code); setShowDeleteModal(true); }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <Trash size={14} />
              </button>
            </div>
          ))}
        </Card>
      )}

      {/* Create dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="rounded-[20px] border border-[#dde1bc] bg-[#fffdf4]">
          <DialogHeader>
            <DialogTitle className="font-bold">Create Discount Code</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm font-medium">Public Name</Label>
              <Input placeholder="Summer Sale" className="rounded-xl border-[#dde1bc] bg-white focus:border-lime-400"
                {...register("public_name", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm font-medium">Discount Code</Label>
              <Input placeholder="SAVE20" className="rounded-xl border-[#dde1bc] bg-white font-mono uppercase focus:border-lime-400"
                {...register("discountCode", { required: true })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm font-medium">Type</Label>
                <Controller name="discountType" control={control} render={({ field }) => (
                  <select {...field} className="h-10 w-full rounded-xl border border-[#dde1bc] bg-white px-3 text-sm text-foreground outline-none focus:border-lime-400">
                    <option value="percentage" className="bg-white">Percentage</option>
                    <option value="flat" className="bg-white">Flat Amount</option>
                  </select>
                )} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm font-medium">Value</Label>
                <Input type="number" placeholder="20" className="rounded-xl border-[#dde1bc] bg-white focus:border-lime-400"
                  {...register("discountValue", { required: true })} />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl border-[#dde1bc] bg-white hover:bg-[#f6f8ea]">Cancel</Button>
              <Button type="submit"
                className="flex-1 rounded-xl border-0  text-white font-semibold ">Create</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {showDeleteModal && selectedDiscount && (
        <DeleteDiscountCodeModal
          discount={selectedDiscount}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => deleteMutation.mutate(selectedDiscount.id)}
        />
      )}
    </div>
  );
}

