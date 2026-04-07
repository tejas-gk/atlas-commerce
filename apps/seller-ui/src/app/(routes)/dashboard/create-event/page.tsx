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

interface UploadedImage {
  fileId: string;
  file_url: string;
}

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
  const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
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

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/product/api/get-categories");
        return res.data;
      } catch (error) {
        console.log(error);
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const { data: discountCodes = [], isLoading: discountLoading } = useQuery({
    queryKey: ["shop-discounts", seller?.activeShopId],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-discount-codes");
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
    <form
      className="w-full mx-auto"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Heading & Breadcrumbs */}
      <h2 className="text-2xl font-semibold tracking-tight">
        Create Event
      </h2>
      <BreadCrumbs title="Create Event" />

      {/* Content Layout */}
      <div className="py-4 w-full flex gap-6">
        {/* Left side - Image upload section */}
        <div className="md:w-[35%]">
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

        {/* Right side - form inputs */}
        <div className="md:w-[65%]">
          <div className="w-full flex gap-6">
            {/* Product Title Input */}
            <div className="w-2/4">
              <div>
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5">Event Title *</Label>
                <Input
                  placeholder="Enter event title"
                  className="border-white/[0.08] bg-white/[0.03] focus-visible:border-rose-500"
                  {...register("title", { required: "Title is required" })}
                />
              </div>
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message as string}
                </p>
              )}

              <div className="mt-2">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5">Short Description * (Max 150 words)</Label>
                <Textarea
                  rows={7}
                  placeholder="Enter event description for quick view"
                  className="border-white/[0.08] bg-white/[0.03] focus-visible:border-rose-500 resize-none"
                  {...register("short_description", {
                    required: "Description is required",
                    validate: (value) => {
                      const wordCount = value.trim().split(/\s+/).length;
                      return (
                        wordCount <= 150 ||
                        `Description cannot exceed 150 words (Current: ${wordCount})`
                      );
                    },
                  })}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5">Tags *</Label>
                <Input
                  placeholder="apple,flagship"
                  className="focus-visible:border-rose-500"
                  {...register("tags", {
                    required: "Seperate related products tags with a coma,",
                  })}
                />
                {errors.tags && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tags.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Starting Date *
                </Label>
                <Input
                  type="date"
                  className="focus-visible:border-rose-500"
                  {...register("starting_date", {
                    required: "Starting Date is required!",
                  })}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="mt-2">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5">Warranty *</Label>
                <Input
                  placeholder="1 Year / No Warranty"
                  className="focus-visible:border-rose-500"
                  {...register("warranty", {
                    required: "Warranty is required!",
                  })}
                />
                {errors.tags && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tags.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <div className="relative">
                  <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5">Slug *</Label>
                  <Input
                    placeholder="event-slug"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setSlugValue(e.target.value);
                      setValue("slug", e.target.value);
                      formOnChange(e);
                    }}
                    value={watch("slug") ?? ""}
                    className="pr-10 focus-visible:border-rose-500"
                    {...restSlugProps}
                  />

                  <div className="absolute w-7 h-7 flex items-center justify-center bg-rose-600 !rounded shadow top-[70%] right-3 transform -translate-y-1/2 text-white cursor-pointer hover:bg-rose-700">
                    <Wand2
                      size={16}
                      onClick={async () => {
                        const title = getValues("title");
                        if (!title) {
                          toast.error(
                            "Please enter a event title to generate a slug!"
                          );
                          return;
                        }

                        // Generate slug from title
                        const rawSlug = title
                          .toLowerCase()
                          .trim()
                          .replace(/[^a-z0-9\s-]/g, "")
                          .replace(/\s+/g, "-")
                          .replace(/-+/g, "-");

                        try {
                          // Check slug validity via API
                          const res = await axiosInstance.post(
                            "/product/api/slug-validator",
                            { slug: rawSlug }
                          );
                          const { available, suggestedSlug } = res.data;

                          if (available) {
                            setValue("slug", rawSlug);
                            toast.success("Slug is available!");
                          } else if (suggestedSlug) {
                            setValue("slug", suggestedSlug);
                            toast.info(
                              "Slug not available, suggested new one!"
                            );
                          } else {
                            toast.error(
                              "Slug is already taken, try editing it."
                            );
                          }
                        } catch (err) {
                          toast.error("Failed to validate slug. Try again.");
                        }
                      }}
                    />
                  </div>
                </div>

                {errors.slug && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.slug.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5">Brand</Label>
                <Input
                  placeholder="Apple"
                  className="focus-visible:border-rose-500"
                  {...register("brand")}
                />
                {errors.tags && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tags.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <ColorSelector control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <CustomSpecifications control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <CustomProperties control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Cash On Delivery *
                </Label>
                <select
                  {...register("cash_on_delivery", {
                    required: "Cash on Delivery is required",
                  })}
                  defaultValue="yes"
                  className="w-full h-10 px-3 rounded-xl bg-background border border-white/[0.08] text-foreground text-sm outline-none focus:border-rose-500 transition-all"
                >
                  <option value="yes" className="bg-card">
                    Yes
                  </option>
                  <option value="no" className="bg-card">
                    No
                  </option>
                </select>
                {errors.cash_on_delivery && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.cash_on_delivery.message as string}
                  </p>
                )}
              </div>
            </div>
            <div className="w-2/4">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5">
                Category *
              </Label>
              {isLoading ? (
                <p className="text-muted-foreground text-sm">Loading categories...</p>
              ) : isError ? (
                <p className="text-red-500">Failed to load categories</p>
              ) : (
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full h-10 px-3 rounded-xl bg-background border border-white/[0.08] text-foreground text-sm outline-none focus:border-rose-500 transition-all"
                    >
                      <option value="" className="bg-card">
                        Select Category
                      </option>
                      {categories?.map((category: string) => (
                        <option
                          value={category}
                          key={category}
                          className="bg-card"
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                  )}
                />
              )}
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.category.message as string}
                </p>
              )}

              <div className="mt-2">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Subcategory *
                </Label>
                <Controller
                  name="subCategory"
                  control={control}
                  rules={{ required: "Subcategory is required" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full h-10 px-3 rounded-xl bg-background border border-white/[0.08] text-foreground text-sm outline-none focus:border-rose-500 transition-all"
                    >
                      <option value="" className="bg-card">
                        Select Subcategory
                      </option>
                      {subcategories?.map((subcategory: string) => (
                        <option
                          key={subcategory}
                          value={subcategory}
                          className="bg-card"
                        >
                          {subcategory}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.subcategory && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.subcategory.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Detailed Description * (Min 100 words)
                </Label>
                <Controller
                  name="detailed_description"
                  control={control}
                  rules={{
                    required: "Detailed description is required!",
                  }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.detailed_description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.detailed_description.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Ending Date *
                </Label>
                <Input
                  type="date"
                  className="focus-visible:border-rose-500"
                  {...register("ending_date", {
                    required: "Ending Date is required!",
                  })}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="mt-2">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5">Video URL</Label>
                <Input
                  placeholder="https://www.youtube.com/embed/xyz123"
                  className="focus-visible:border-rose-500"
                  {...register("video_url", {
                    pattern: {
                      value:
                        /^https:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+$/,
                      message:
                        "Invalid YouTube embed URL! Use format: https://www.youtube.com/embed/xyz123",
                    },
                  })}
                />
                {errors.video_url && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.video_url.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5">Regular Price</Label>
                <Input
                  type="number"
                  placeholder="20"
                  className="focus-visible:border-rose-500"
                  {...register("regular_price", {
                    valueAsNumber: true,
                    min: { value: 1, message: "Price must be at least 1" },
                    validate: (value) =>
                      !isNaN(value) || "Only numbers are allowed",
                  })}
                />
                {errors.regular_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.regular_price.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5">Sale Price *</Label>
                <Input
                  type="number"
                  placeholder="15"
                  className="focus-visible:border-rose-500"
                  {...register("sale_price", {
                    required: "Sale Price is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Sale Price must be at least 1" },
                    validate: (value) => {
                      if (isNaN(value)) return "Only numbers are allowed";
                      if (regularPrice && value >= regularPrice) {
                        return "Sale Price must be less than Regular Price";
                      }
                      return true;
                    },
                  })}
                />
                {errors.sale_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sale_price.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5">Stock *</Label>
                <Input
                  type="number"
                  placeholder="100"
                  className="focus-visible:border-rose-500"
                  {...register("stock", {
                    required: "Stock is required!",
                    valueAsNumber: true,
                    min: { value: 1, message: "Stock must be at least 1" },
                    max: {
                      value: 1000,
                      message: "Stock cannot exceed 1,000",
                    },
                    validate: (value) => {
                      if (isNaN(value)) return "Only numbers are allowed!";
                      if (!Number.isInteger(value))
                        return "Stock must be a whole number!";
                      return true;
                    },
                  })}
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.stock.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <SizeSelector control={control} errors={errors} />
              </div>

              <div className="mt-3">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Select Discount Codes (optional)
                </Label>

                {discountLoading ? (
                  <p className="text-muted-foreground text-sm">Loading discount codes...</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {discountCodes?.map((code: any) => (
                      <button
                        key={code.id}
                        type="button"
                        className={`px-3 py-1 rounded-md text-sm font-semibold border ${watch("discountCodes")?.includes(code.id)
                            ? "bg-rose-600 text-white border-rose-500"
                            : "bg-muted text-muted-foreground border-white/[0.08] hover:bg-muted/80 hover:text-foreground"
                          }`}
                        onClick={() => {
                          const currentSelection = watch("discountCodes") || [];
                          const updatedSelection = currentSelection?.includes(
                            code.id
                          )
                            ? currentSelection.filter(
                              (id: string) => id !== code.id
                            )
                            : [...currentSelection, code.id];
                          setValue("discountCodes", updatedSelection);
                        }}
                      >
                        {code?.public_name} ({code.discountValue}
                        {code.discountType === "percentage" ? "%" : "$"})
                      </button>
                    ))}
                  </div>
                )}

                {discountCodes?.length === 0 && (
                  <p className="text-muted-foreground text-sm">No discount codes available yet!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold border-0 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Event"}
        </Button>
      </div>
    </form>
  );
};

export default Page;
