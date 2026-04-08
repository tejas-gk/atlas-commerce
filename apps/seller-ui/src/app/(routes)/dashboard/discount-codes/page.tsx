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
import useSeller from "@/hooks/useSeller";

export default function DiscountCodesPage() {
  const { seller } = useSeller();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>();
  const queryClient = useQueryClient();
  const shopId = seller?.activeShopId || seller?.shop?.id;

  const { data: discountCodes = [], isLoading } = useQuery({
    queryKey: ["shop-discounts", shopId],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-discount-codes", {
        params: { shopId },
      });
      return res?.data?.discount_codes || [];
    },
    enabled: !!shopId,
  });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-0.05em] text-[#17320f]">Discount Codes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create and manage promotional codes</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          size="sm"
          className="gap-1.5 rounded-2xl border-0 bg-[#86b81d] text-white font-semibold hover:bg-[#77a51b]"
        >
          <Plus size={15} /> Add Code
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
        </div>
      ) : discountCodes.length === 0 ? (
        <Card className="seller-panel flex flex-col items-center justify-center rounded-[30px] border-0 py-20">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06] mb-4">
            <Tag size={24} className="text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground">No discount codes yet</p>
          <p className="text-xs text-muted-foreground/50 mt-1">Create your first promotional code</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {discountCodes.map((code: any) => (
            <Card key={code.id} className="seller-panel rounded-[28px] border-0 transition-colors duration-200 hover:bg-white">
              <CardContent className="p-5 flex items-start justify-between">
                <div>
                  <Badge className={code.discountType === "percentage" ? "border-0 bg-lime-100 text-lime-700" : "border-0 bg-[#f7f8ea] text-muted-foreground"}>
                    {code.discountType.toUpperCase()}
                  </Badge>
                  <p className="mt-2 inline-block rounded-2xl bg-white px-3 py-1.5 font-mono text-sm text-foreground">{code.discountCode}</p>
                  <p className="text-muted-foreground/70 text-sm mt-1">{code.public_name}</p>
                  <p className="text-foreground text-sm mt-1 font-semibold">
                    {code.discountValue}{code.discountType === "percentage" ? "%" : " off"}
                  </p>
                </div>
                <Button variant="ghost" size="icon"
                  onClick={() => { setSelectedDiscount(code); setShowDeleteModal(true); }}
                  className="text-muted-foreground hover:text-red-400 h-7 w-7">
                  <Trash size={15} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="rounded-[28px] border border-[#dde1bc] bg-[#fffdf4]">
          <DialogHeader>
            <DialogTitle className="font-bold">Create Discount Code</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm font-medium">Public Name</Label>
              <Input placeholder="Summer Sale" className="rounded-2xl border-[#dde1bc] bg-white focus:border-lime-400"
                {...register("public_name", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm font-medium">Discount Code</Label>
              <Input placeholder="SAVE20" className="rounded-2xl border-[#dde1bc] bg-white font-mono uppercase focus:border-lime-400"
                {...register("discountCode", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm font-medium">Type</Label>
              <Controller name="discountType" control={control} render={({ field }) => (
                <select {...field} className="h-10 w-full rounded-2xl border border-[#dde1bc] bg-white px-3 text-sm text-foreground outline-none focus:border-lime-400">
                  <option value="percentage" className="bg-white">Percentage</option>
                  <option value="flat" className="bg-white">Flat Amount</option>
                </select>
              )} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm font-medium">Value</Label>
              <Input type="number" placeholder="20" className="rounded-2xl border-[#dde1bc] bg-white focus:border-lime-400"
                {...register("discountValue", { required: true })} />
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}
                className="flex-1 rounded-2xl border-[#dde1bc] bg-white hover:bg-[#f6f8ea]">
                Cancel
              </Button>
              <Button type="submit"
                className="flex-1 rounded-2xl border-0 bg-[#86b81d] text-white font-semibold hover:bg-[#77a51b]">
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

