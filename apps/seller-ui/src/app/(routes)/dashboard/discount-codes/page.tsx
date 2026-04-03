"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { Plus, Trash, X, Tag } from "lucide-react";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@workspace/ui/components/input";
import DeleteDiscountCodeModal from "@/shared/components/modals/delete.discount-codes";

export default function DiscountCodesPage() {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>();
  const queryClient = useQueryClient();

  const { data: discountCodes = [], isLoading } = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-discount-codes");
      return res?.data?.discount_codes || [];
    },
  });

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: { public_name: "", discountType: "percentage", discountValue: "", discountCode: "" },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await axiosInstance.post("/product/api/create-discount-code", data);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["shop-discounts"] }); reset(); setShowModal(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: any) => {
      await axiosInstance.delete(`/product/api/delete-discount-code/${id}`);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["shop-discounts"] }); setShowDeleteModal(false); },
  });

  const onSubmit = (data: any) => {
    if (discountCodes.length >= 8) { toast.error("Max 8 discount codes allowed."); return; }
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">Discount Codes</h1>
          <p className="text-white/35 text-sm mt-0.5">Create and manage promotional codes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-sm font-semibold shadow-[0_0_15px_rgba(124,58,237,0.35)] transition-all"
        >
          <Plus size={15} /> Add Code
        </button>
      </div>

      {/* Code list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
        </div>
      ) : discountCodes.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-md flex flex-col items-center justify-center py-20">
          <Tag size={36} className="text-white/15 mb-3" />
          <p className="text-white/25 text-sm">No discount codes yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {discountCodes.map((code: any) => (
            <div key={code.id} className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-md p-5 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-semibold tracking-widest text-violet-400 uppercase">{code.discountType}</span>
                <p className="text-white font-bold text-lg mt-0.5 font-mono">{code.discountCode}</p>
                <p className="text-white/50 text-sm">{code.public_name}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 font-semibold">
                    {code.discountValue}{code.discountType === "percentage" ? "%" : " off"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => { setSelectedDiscount(code); setShowDeleteModal(true); }}
                className="text-white/25 hover:text-red-400 transition-colors"
              >
                <Trash size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111111] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">Create Discount Code</h2>
              <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Public Name</label>
                <Input placeholder="Summer Sale" className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-violet-500 rounded-xl h-10"
                  {...register("public_name", { required: true })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Discount Code</label>
                <Input placeholder="SAVE20" className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-violet-500 rounded-xl h-10 font-mono uppercase"
                  {...register("discountCode", { required: true })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Type</label>
                <Controller name="discountType" control={control} render={({ field }) => (
                  <select {...field} className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm outline-none focus:border-violet-500/50">
                    <option value="percentage" className="bg-[#111]">Percentage</option>
                    <option value="flat" className="bg-[#111]">Flat Amount</option>
                  </select>
                )} />
              </div>
              <div className="space-y-1.5">
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Value</label>
                <Input type="number" placeholder="20" className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-violet-500 rounded-xl h-10"
                  {...register("discountValue", { required: true })} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-sm transition-all">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-sm font-semibold shadow-[0_0_15px_rgba(124,58,237,0.35)] transition-all">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && selectedDiscount && (
        <DeleteDiscountCodeModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => deleteMutation.mutate(selectedDiscount.id)}
        />
      )}
    </div>
  );
}
