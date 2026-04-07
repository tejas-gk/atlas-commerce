"use client";
import { useQuery } from "@tanstack/react-query";

import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import { Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";

import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import ImagePlaceHolder from "@/shared/components/image-placeholder";
import ColorSelector from "@/shared/components/color-selector";
import CustomSpecifications from "../custom-specifications";
import CustomProperties from "@/shared/components/custom-properties";
import SizeSelector from "@/shared/components/size-selector";
import RichTextEditor from "@/shared/components/rich-text-editor";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import useSeller from "@/hooks/useSeller";

const Page = () => {
  const { seller } = useSeller();
  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { onChange: formOnChange, ...restSlugProps } = register("slug", {
    required: "Slug is required!",
    pattern: {
      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      message:
        "Invalid slug format! Use only lowercase letters, numbers, and dashes (e.g., product-slug).",
    },
    minLength: {
      value: 3,
      message: "Slug must be at least 3 characters long.",
    },
    maxLength: {
      value: 50,
      message: "Slug cannot be longer than 50 characters.",
    },
  });

  const [images, setImages] = useState<
    (null | { file: File; base64: string })[]
  >([null]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [slugValue, setSlugValue] = useState("");
  const [isSlugChecking, setIsSlugChecking] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (slugValue) {
        setIsSlugChecking(true);
        axiosInstance
          .post("/product/api/slug-validator", { slug: slugValue }, isProtected)
          .then((res) => {
            if (res.data.available) {
              toast.success("Slug is available and applied!");
            } else {
              setValue("slug", res.data.slug);
              toast.info("Slug was taken. Suggested new one applied.");
            }
          })
          .catch(() => {
            toast.error("Error checking slug!");
          })
          .finally(() => {
            setIsSlugChecking(false);
          });
      }
    }, 3000);

    return () => clearTimeout(delayDebounce);
  }, [slugValue]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(
          "/product/api/get-categories",
          isProtected
        );
        return res.data;
      } catch (error) {
        console.log(error);
        return { categories: [], subCategories: {} };
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const { data: discountCodes = [], isLoading: discountLoading } = useQuery({
    queryKey: ["shop-discounts", seller?.activeShopId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-discount-codes",
        isProtected
      );
      return res?.data?.discount_codes || [];
    },
    enabled: !!seller?.activeShopId,
  });

  const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || {};

  const selectedCategory = watch("category");
  const regularPrice = watch("regular_price");

  const subcategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
  }, [selectedCategory, subCategoriesData]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await axiosInstance.post("/product/api/create-product", data);
      router.push("/dashboard/all-products");
    } catch (error: any) {
      toast.error(error?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="w-full pb-8" onSubmit={handleSubmit(onSubmit)}>

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create Product</h1>
          <BreadCrumbs title="Create Product" />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold border-0 disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create Product"}
        </Button>
      </div>

      {/* ── Layout ──────────────────────────────────────────────── */}
      <div className="flex gap-6 items-start">

        {/* ── Left column: Images ─────────────────────────────────── */}
        <div className="w-[35%] shrink-0">
          <div className="rounded-xl border border-white/[0.06] bg-card/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-4">Product Images</p>
            {images?.length > 0 && (
              <ImagePlaceHolder
                size="765 x 850"
                small={false}
                images={images}
                setImages={setImages}
                setValue={setValue}
                index={0}
              />
            )}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {images.slice(1).map((_, index) => (
                <ImagePlaceHolder
                  size="765 x 850"
                  images={images}
                  setImages={setImages}
                  key={index}
                  small
                  setValue={setValue}
                  index={index + 1}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column: Form ──────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Section 1: Product Details ─────────────────────────── */}
          <div className="rounded-xl border border-white/[0.06] bg-card/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-4">Product Details</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Product Title *</Label>
                <Input
                  placeholder="Enter product title"
                  className="h-9 border-white/[0.08] bg-white/[0.03] focus-visible:border-rose-500/60 focus-visible:bg-white/[0.05]"
                  {...register("title", { required: "Title is required" })}
                />
                {errors.title && <p className="text-red-400 text-xs">{errors.title.message as string}</p>}
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Category *</Label>
                {isLoading ? (
                  <p className="text-muted-foreground/60 text-xs h-9 flex items-center">Loading…</p>
                ) : (
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: "Category is required" }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full h-9 px-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-foreground text-sm outline-none focus:border-rose-500/60 transition-colors"
                      >
                        <option value="" className="bg-card">Select Category</option>
                        {categories?.map((c: string) => (
                          <option value={c} key={c} className="bg-card">{c}</option>
                        ))}
                      </select>
                    )}
                  />
                )}
                {errors.category && <p className="text-red-400 text-xs">{errors.category.message as string}</p>}
              </div>

              {/* Short Description */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Short Description * <span className="text-muted-foreground/50">(max 150 words)</span></Label>
                <Textarea
                  rows={5}
                  placeholder="Enter product description for quick view"
                  className="border-white/[0.08] bg-white/[0.03] resize-none focus-visible:border-rose-500/60 focus-visible:bg-white/[0.05]"
                  {...register("short_description", {
                    required: "Description is required",
                    validate: (v) => {
                      const wc = v.trim().split(/\s+/).length;
                      return wc <= 150 || `Exceeds 150 words (${wc})`;
                    },
                  })}
                />
                {errors.short_description && <p className="text-red-400 text-xs">{errors.short_description.message as string}</p>}
              </div>

              {/* Subcategory */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Subcategory *</Label>
                <Controller
                  name="subCategory"
                  control={control}
                  rules={{ required: "Subcategory is required" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full h-9 px-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-foreground text-sm outline-none focus:border-rose-500/60 transition-colors"
                    >
                      <option value="" className="bg-card">Select Subcategory</option>
                      {subcategories?.map((s: string) => (
                        <option key={s} value={s} className="bg-card">{s}</option>
                      ))}
                    </select>
                  )}
                />
                {errors.subCategory && <p className="text-red-400 text-xs">{errors.subCategory.message as string}</p>}
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Tags * <span className="text-muted-foreground/50">(comma separated)</span></Label>
                <Input
                  placeholder="apple, flagship, new"
                  className="h-9 border-white/[0.08] bg-white/[0.03] focus-visible:border-rose-500/60 focus-visible:bg-white/[0.05]"
                  {...register("tags", { required: "Separate tags with a comma" })}
                />
                {errors.tags && <p className="text-red-400 text-xs">{errors.tags.message as string}</p>}
              </div>

              {/* Warranty */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Warranty *</Label>
                <Input
                  placeholder="1 Year / No Warranty"
                  className="h-9 border-white/[0.08] bg-white/[0.03] focus-visible:border-rose-500/60 focus-visible:bg-white/[0.05]"
                  {...register("warranty", { required: "Warranty is required" })}
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Slug *</Label>
                <div className="relative">
                  <Input
                    placeholder="product-slug"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setSlugValue(e.target.value);
                      setValue("slug", e.target.value);
                      formOnChange(e);
                    }}
                    value={watch("slug") ?? ""}
                    className="h-9 pr-10 border-white/[0.08] bg-white/[0.03] focus-visible:border-rose-500/60 focus-visible:bg-white/[0.05]"
                    {...restSlugProps}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-md bg-rose-600/80 hover:bg-rose-600 transition-colors text-white"
                    onClick={async () => {
                      const title = getValues("title");
                      if (!title) { toast.error("Enter a title first"); return; }
                      const rawSlug = title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
                      try {
                        const res = await axiosInstance.post("/product/api/slug-validator", { slug: rawSlug });
                        const { available, suggestedSlug } = res.data;
                        if (available) { setValue("slug", rawSlug); toast.success("Slug available!"); }
                        else if (suggestedSlug) { setValue("slug", suggestedSlug); toast.info("Suggested slug applied."); }
                        else { toast.error("Slug taken, try editing it."); }
                      } catch { toast.error("Failed to validate slug."); }
                    }}
                  >
                    <Wand2 size={12} />
                  </button>
                </div>
                {errors.slug && <p className="text-red-400 text-xs">{errors.slug.message as string}</p>}
              </div>

              {/* Brand */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Brand</Label>
                <Input
                  placeholder="Apple"
                  className="h-9 border-white/[0.08] bg-white/[0.03] focus-visible:border-rose-500/60 focus-visible:bg-white/[0.05]"
                  {...register("brand")}
                />
              </div>
            </div>

            {/* Detailed Description — full width */}
            <div className="mt-4 space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Detailed Description * <span className="text-muted-foreground/50">(min 100 words)</span></Label>
              <Controller
                name="detailed_description"
                control={control}
                rules={{
                  required: "Detailed description is required",
                  validate: (v) => {
                    const wc = v?.split(/\s+/).filter((w: string) => w).length;
                    return wc >= 100 || "Minimum 100 words required";
                  },
                }}
                render={({ field }) => (
                  <RichTextEditor value={field.value} onChange={field.onChange} />
                )}
              />
              {errors.detailed_description && (
                <p className="text-red-400 text-xs">{errors.detailed_description.message as string}</p>
              )}
            </div>
          </div>

          {/* Section 2: Variants & Properties ──────────────────── */}
          <div className="rounded-xl border border-white/[0.06] bg-card/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-4">Variants &amp; Properties</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-4">
                <ColorSelector control={control} errors={errors} />
                <CustomSpecifications control={control} errors={errors} />
              </div>
              <div className="space-y-4">
                <SizeSelector control={control} errors={errors} />
                <CustomProperties control={control} errors={errors} />
              </div>
            </div>
          </div>

          {/* Section 3: Pricing & Inventory ─────────────────────── */}
          <div className="rounded-xl border border-white/[0.06] bg-card/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-4">Pricing &amp; Inventory</p>
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              {/* Regular Price */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Regular Price</Label>
                <Input
                  type="number"
                  placeholder="0"
                  className="h-9 border-white/[0.08] bg-white/[0.03] focus-visible:border-rose-500/60 focus-visible:bg-white/[0.05]"
                  {...register("regular_price", {
                    valueAsNumber: true,
                    min: { value: 1, message: "Must be at least 1" },
                    validate: (v) => !isNaN(v) || "Numbers only",
                  })}
                />
                {errors.regular_price && <p className="text-red-400 text-xs">{errors.regular_price.message as string}</p>}
              </div>

              {/* Sale Price */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Sale Price *</Label>
                <Input
                  type="number"
                  placeholder="0"
                  className="h-9 border-white/[0.08] bg-white/[0.03] focus-visible:border-rose-500/60 focus-visible:bg-white/[0.05]"
                  {...register("sale_price", {
                    required: "Sale price is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Must be at least 1" },
                    validate: (v) => {
                      if (isNaN(v)) return "Numbers only";
                      if (regularPrice && v >= regularPrice) return "Must be less than regular price";
                      return true;
                    },
                  })}
                />
                {errors.sale_price && <p className="text-red-400 text-xs">{errors.sale_price.message as string}</p>}
              </div>

              {/* Stock */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Stock *</Label>
                <Input
                  type="number"
                  placeholder="100"
                  className="h-9 border-white/[0.08] bg-white/[0.03] focus-visible:border-rose-500/60 focus-visible:bg-white/[0.05]"
                  {...register("stock", {
                    required: "Stock is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "At least 1" },
                    max: { value: 1000, message: "Max 1,000" },
                    validate: (v) => {
                      if (isNaN(v)) return "Numbers only";
                      if (!Number.isInteger(v)) return "Whole number only";
                      return true;
                    },
                  })}
                />
                {errors.stock && <p className="text-red-400 text-xs">{errors.stock.message as string}</p>}
              </div>

              {/* Video URL */}
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Video URL <span className="text-muted-foreground/50">(YouTube embed)</span></Label>
                <Input
                  placeholder="https://www.youtube.com/embed/xyz123"
                  className="h-9 border-white/[0.08] bg-white/[0.03] focus-visible:border-rose-500/60 focus-visible:bg-white/[0.05]"
                  {...register("video_url", {
                    pattern: {
                      value: /^https:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+$/,
                      message: "Use format: https://www.youtube.com/embed/xyz123",
                    },
                  })}
                />
                {errors.video_url && <p className="text-red-400 text-xs">{errors.video_url.message as string}</p>}
              </div>

              {/* Cash on Delivery */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Cash on Delivery *</Label>
                <select
                  {...register("cash_on_delivery", { required: "Required" })}
                  defaultValue="yes"
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-foreground text-sm outline-none focus:border-rose-500/60 transition-colors"
                >
                  <option value="yes" className="bg-card">Yes</option>
                  <option value="no" className="bg-card">No</option>
                </select>
              </div>
            </div>

            {/* Discount Codes */}
            <div className="mt-4 space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Discount Codes <span className="text-muted-foreground/50">(optional)</span></Label>
              {discountLoading ? (
                <p className="text-muted-foreground/60 text-xs">Loading codes…</p>
              ) : discountCodes?.length === 0 ? (
                <p className="text-muted-foreground/50 text-xs">No discount codes available.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {discountCodes?.map((code: any) => (
                    <button
                      key={code.id}
                      type="button"
                      className={`px-3 py-1 rounded-md text-xs font-semibold border transition-colors ${
                        watch("discountCodes")?.includes(code.id)
                          ? "bg-rose-600/90 text-white border-rose-500/60"
                          : "bg-white/[0.03] text-muted-foreground border-white/[0.08] hover:border-border hover:text-foreground"
                      }`}
                      onClick={() => {
                        const cur = watch("discountCodes") || [];
                        setValue(
                          "discountCodes",
                          cur.includes(code.id) ? cur.filter((id: string) => id !== code.id) : [...cur, code.id]
                        );
                      }}
                    >
                      {code?.public_name} ({code.discountValue}{code.discountType === "percentage" ? "%" : "$"})
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </form>
  );
};

export default Page;
