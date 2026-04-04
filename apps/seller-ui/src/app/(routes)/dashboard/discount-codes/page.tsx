"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { Plus, Trash, Tag } from "lucide-react";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
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

  const { register, handleSubmit, control, reset } = useForm({
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
          <h1 className="text-2xl font-bold tracking-tight text-white">Discount Codes</h1>
          <p className="text-white/50 text-sm mt-0.5">Create and manage promotional codes</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-semibold shadow-[0_0_20px_rgba(124,58,237,0.3)]"
        >
          <Plus size={15} /> Add Code
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
        </div>
      ) : discountCodes.length === 0 ? (
        <Card className="bg-white/5 border-white/8 flex flex-col items-center justify-center py-20">
          <Tag size={36} className="text-white/15 mb-3" />
          <p className="text-white/25 text-sm">No discount codes yet</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {discountCodes.map((code: any) => (
            <Card key={code.id} className="bg-white/5 border-white/8">
              <CardContent className="p-5 flex items-start justify-between">
                <div>
                  <Badge className={code.discountType === "percentage" ? "bg-violet-500/10 text-violet-400 border-0" : "bg-white/5 text-white/60 border-0"}>
                    {code.discountType.toUpperCase()}
                  </Badge>
                  <p className="font-mono text-violet-300 bg-white/5 rounded px-2 py-1 text-sm mt-2 inline-block">{code.discountCode}</p>
                  <p className="text-white/50 text-sm mt-1">{code.public_name}</p>
                  <p className="text-white/70 text-sm mt-1 font-semibold">
                    {code.discountValue}{code.discountType === "percentage" ? "%" : " off"}
                  </p>
                </div>
                <Button variant="ghost" size="icon"
                  onClick={() => { setSelectedDiscount(code); setShowDeleteModal(true); }}
                  className="text-white/25 hover:text-red-400 hover:bg-red-500/5 h-7 w-7">
                  <Trash size={15} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-[#111111] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white font-bold">Create Discount Code</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-white/70 text-sm font-medium">Public Name</Label>
              <Input placeholder="Summer Sale" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500"
                {...register("public_name", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/70 text-sm font-medium">Discount Code</Label>
              <Input placeholder="SAVE20" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500 font-mono uppercase"
                {...register("discountCode", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/70 text-sm font-medium">Type</Label>
              <Controller name="discountType" control={control} render={({ field }) => (
                <select {...field} className="w-full h-10 px-3 rounded-lg bg-[#0d0d0d] border border-white/10 text-white text-sm outline-none focus:border-violet-500">
                  <option value="percentage" className="bg-[#111]">Percentage</option>
                  <option value="flat" className="bg-[#111]">Flat Amount</option>
                </select>
              )} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/70 text-sm font-medium">Value</Label>
              <Input type="number" placeholder="20" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500"
                {...register("discountValue", { required: true })} />
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}
                className="flex-1 bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10">
                Cancel
              </Button>
              <Button type="submit"
                className="flex-1 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-semibold shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                Create
              </Button>
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
