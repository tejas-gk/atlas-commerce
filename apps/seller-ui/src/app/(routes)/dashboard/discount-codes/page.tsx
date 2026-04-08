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
          <h1 className="text-2xl font-semibold tracking-tight">Discount Codes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create and manage promotional codes</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          size="sm"
          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold border-0"
        >
          <Plus size={15} /> Add Code
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
        </div>
      ) : discountCodes.length === 0 ? (
        <Card className="border border-white/[0.06] bg-card/50 flex flex-col items-center justify-center py-20">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06] mb-4">
            <Tag size={24} className="text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground">No discount codes yet</p>
          <p className="text-xs text-muted-foreground/50 mt-1">Create your first promotional code</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {discountCodes.map((code: any) => (
            <Card key={code.id} className="border border-white/[0.06] bg-card/50 hover:bg-card/80 transition-colors duration-200">
              <CardContent className="p-5 flex items-start justify-between">
                <div>
                  <Badge className={code.discountType === "percentage" ? "bg-emerald-500/10 text-emerald-400 border-0" : "bg-muted text-muted-foreground border-0"}>
                    {code.discountType.toUpperCase()}
                  </Badge>
                  <p className="font-mono text-foreground bg-white/[0.06] rounded-lg px-3 py-1.5 text-sm mt-2 inline-block">{code.discountCode}</p>
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
        <DialogContent className="bg-card border border-white/[0.08]">
          <DialogHeader>
            <DialogTitle className="font-bold">Create Discount Code</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm font-medium">Public Name</Label>
              <Input placeholder="Summer Sale" className="focus:border-emerald-500"
                {...register("public_name", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm font-medium">Discount Code</Label>
              <Input placeholder="SAVE20" className="focus:border-emerald-500 font-mono uppercase"
                {...register("discountCode", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm font-medium">Type</Label>
              <Controller name="discountType" control={control} render={({ field }) => (
                <select {...field} className="w-full h-10 px-3 rounded-lg bg-background border border-white/[0.08] text-foreground text-sm outline-none focus:border-emerald-500">
                  <option value="percentage" className="bg-card">Percentage</option>
                  <option value="flat" className="bg-card">Flat Amount</option>
                </select>
              )} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm font-medium">Value</Label>
              <Input type="number" placeholder="20" className="focus:border-emerald-500"
                {...register("discountValue", { required: true })} />
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}
                className="flex-1">
                Cancel
              </Button>
              <Button type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold border-0">
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

