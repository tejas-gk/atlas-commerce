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
import { Input } from "../../../../../../../packages/ui/src/components/input";
import ColorSelector from "@/shared/components/color-selector";
import CustomSpecifications from "../custom-specifications";
import CustomProperties from "@/shared/components/custom-properties";
import SizeSelector from "@/shared/components/size-selector";
import RichTextEditor from "@/shared/components/rich-text-editor";
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
  } = useForm<any>({ defaultValues: { slug: "" } });
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
      const res = await axiosInstance.get("/product/api/get-categories");
      return res.data;
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
    <form className="w-full pb-8" onSubmit={handleSubmit(onSubmit)}>
      <div className="seller-page-header mb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-[-0.05em] text-[#17320f]">Create Event</h2>
          <BreadCrumbs title="Create Event" />
        </div>
        <button
          type="submit"
          className="h-11 rounded-2xl bg-[#86b81d] px-5 font-semibold text-white shadow-[0_18px_34px_rgba(134,184,29,0.28)]"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </div>

      <div className="w-full flex gap-6">
        <div className="md:w-[35%]">
          <div className="seller-panel rounded-[30px] p-5">
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
                key={`slot-${index + 1}`}
                small
                setValue={setValue}
                index={index + 1}
              />
            ))}
          </div>
          </div>
        </div>

        <div className="md:w-[65%]">
          <div className="seller-panel w-full rounded-[30px] p-5">
          <div className="w-full flex gap-6">
            <div className="w-2/4">
              <label className="mb-1 block font-semibold text-[#556244]">
                Product Title *
              </label>
              <Input
                placeholder="Enter product title"
                className="rounded-2xl border-[#dde1bc] bg-white"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message as string}
                </p>
              )}

              <div className="mt-2">
                <label className="mb-1 block font-semibold text-[#556244]">
                  Short Description * (Max 150 words)
                </label>
                <textarea
                  rows={7}
                  className="w-full rounded-[20px] border border-[#dde1bc] bg-white p-3 text-[#17320f] outline-none"
                  placeholder="Enter product description for quick view"
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
                <label className="mb-1 block font-semibold text-[#556244]">
                  Tags *
                </label>
                <Input
                  placeholder="apple,flagship"
                  className="rounded-2xl border-[#dde1bc] bg-white"
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
                <label className="mb-1 block font-semibold text-[#556244]">
                  Starting Date *
                </label>
                <input
                  type="date"
                  className="w-full rounded-2xl border border-[#dde1bc] bg-white p-2.5 text-[#17320f] outline-none"
                  {...register("starting_date", {
                    required: "Starting Date is required!",
                  })}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="mt-2">
                <label className="mb-1 block font-semibold text-[#556244]">
                  Warranty *
                </label>
                <Input
                  placeholder="1 Year / No Warranty"
                  className="rounded-2xl border-[#dde1bc] bg-white"
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
                  <label className="mb-1 block font-semibold text-[#556244]">
                    Slug *
                  </label>
                  <Input
                    placeholder="product_slug"
                    className="rounded-2xl border-[#dde1bc] bg-white pr-10"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setSlugValue(e.target.value);
                      setValue("slug", e.target.value);
                      formOnChange(e);
                    }}
                    value={watch("slug")}
                    {...restSlugProps}
                  />

                  <div className="absolute top-[70%] right-3 flex h-7 w-7 -translate-y-1/2 transform items-center justify-center rounded-xl bg-[#86b81d] text-white shadow cursor-pointer hover:bg-[#77a51b]">
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
                <label className="mb-1 block font-semibold text-[#556244]">
                  Brand
                </label>
                <Input
                  placeholder="Apple"
                  className="rounded-2xl border-[#dde1bc] bg-white"
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
                <label className="mb-1 block font-semibold text-[#556244]">
                  Cash On Delivery *
                </label>
                <select
                  {...register("cash_on_delivery", {
                    required: "Cash on Delivery is required",
                  })}
                  defaultValue="yes"
                  className="w-full rounded-2xl border border-[#dde1bc] bg-white p-2.5 text-[#17320f] outline-none"
                >
                  <option value="yes" className="bg-white">
                    Yes
                  </option>
                  <option value="no" className="bg-white">
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
              <label className="mb-1 block font-semibold text-[#556244]">
                Category *
              </label>
              {isLoading ? (
                <p className="text-gray-400">Loading categories...</p>
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
                      className="w-full rounded-2xl border border-[#dde1bc] bg-white p-2.5 text-[#17320f] outline-none"
                    >
                      <option value="" className="bg-white">
                        Select Category
                      </option>
                      {categories?.map((category: string) => (
                        <option
                          value={category}
                          key={category}
                          className="bg-white"
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
                <label className="mb-1 block font-semibold text-[#556244]">
                  Subcategory *
                </label>
                <Controller
                  name="subCategory"
                  control={control}
                  rules={{ required: "Subcategory is required" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full rounded-2xl border border-[#dde1bc] bg-white p-2.5 text-[#17320f] outline-none"
                    >
                      <option value="" className="bg-white">
                        Select Subcategory
                      </option>
                      {subcategories?.map((subcategory: string) => (
                        <option
                          key={subcategory}
                          value={subcategory}
                          className="bg-white"
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
                <label className="mb-1 block font-semibold text-[#556244]">
                  Detailed Description * (Min 100 words)
                </label>
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
                <label className="mb-1 block font-semibold text-[#556244]">
                  Ending Date *
                </label>
                <input
                  type="date"
                  className="w-full rounded-2xl border border-[#dde1bc] bg-white p-2.5 text-[#17320f] outline-none"
                  {...register("ending_date", {
                    required: "Ending Date is required!",
                  })}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="mt-2">
                <label className="mb-1 block font-semibold text-[#556244]">
                  Video URL
                </label>
                <Input
                  placeholder="https://www.youtube.com/embed/xyz123"
                  className="rounded-2xl border-[#dde1bc] bg-white"
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
                <label className="mb-1 block font-semibold text-[#556244]">
                  Regular Price
                </label>
                <Input
                  placeholder="20$"
                  className="rounded-2xl border-[#dde1bc] bg-white"
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
                <label className="mb-1 block font-semibold text-[#556244]">
                  Sale Price *
                </label>
                <Input
                  placeholder="15$"
                  className="rounded-2xl border-[#dde1bc] bg-white"
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
                <label className="mb-1 block font-semibold text-[#556244]">
                  Stock *
                </label>
                <Input
                  placeholder="100"
                  className="rounded-2xl border-[#dde1bc] bg-white"
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
                <label className="block font-semibold text-gray-300 mb-1">
                  Select Discount Codes (optional)
                </label>

                {discountLoading ? (
                  <p className="text-gray-400">Loading discount codes...</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {discountCodes?.map((code: any) => (
                      <button
                        key={code.id}
                        type="button"
                        className={`rounded-xl border px-3 py-1 text-sm font-semibold ${watch("discountCodes")?.includes(code.id)
                          ? "bg-lime-500 text-white border-lime-500"
                          : "bg-white text-[#5f6e43] border-[#dde1bc] hover:bg-[#f7f8ea]"
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
                  <p className="text-gray-400">
                    No discount codes available yet!
                  </p>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Page;
