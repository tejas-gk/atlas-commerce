"use client";
import { useQuery } from "@tanstack/react-query";

import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import {
  Boxes,
  CalendarDays,
  Clock3,
  DollarSign,
  ImageIcon,
  Sparkles,
  Tags,
  Wand2,
  type LucideIcon,
} from "lucide-react";
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

const FIELD_SHELL_CLASS =
  "seller-field-shell rounded-[18px] border border-[#d9deba] bg-white/78 px-3";
const INPUT_CLASS =
  "!h-10 !border-0 !bg-transparent !shadow-none px-0 text-sm text-[#1f2f18] placeholder:text-[#788760] focus-visible:!ring-0";
const TEXTAREA_CLASS =
  "!min-h-[128px] !border-0 !bg-transparent !shadow-none px-0 py-2 text-sm text-[#1f2f18] placeholder:text-[#788760] focus-visible:!ring-0";
const SELECT_CLASS =
  "h-10 w-full border-0 bg-transparent px-0 text-sm text-[#1f2f18] outline-none";
const LABEL_CLASS =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-[#607045]";
const ERROR_CLASS = "text-red-600 text-xs";

const SectionHeading = ({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) => (
  <div className="mb-4 flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#d9deba] bg-white/90 text-[#6c9132] shadow-[0_10px_20px_rgba(128,158,67,0.18)]">
      <Icon size={17} />
    </div>
    <div>
      <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#4d5d34]">
        {title}
      </h2>
      <p className="text-xs text-[#75835f]">{subtitle}</p>
    </div>
  </div>
);

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

  const [images, setImages] = useState<(null | { file: File; base64: string })[]>([
    null,
  ]);
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
  }, [slugValue, setValue]);

  const { onChange: formOnChange, ...restSlugProps } = register("slug", {
    required: "Slug is required!",
    pattern: {
      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      message:
        "Invalid slug format! Use only lowercase letters, numbers, and dashes (e.g., event-slug).",
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
        const res = await axiosInstance.get("/product/api/get-categories", isProtected);
        return res.data;
      } catch (error) {
        console.error(error);
        return { categories: [], subCategories: {} };
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const { data: discountCodes = [], isLoading: discountLoading } = useQuery({
    queryKey: ["shop-discounts", seller?.activeShopId],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-discount-codes", isProtected);
      return res?.data?.discount_codes || [];
    },
    enabled: !!seller?.activeShopId,
  });

  const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || {};

  const selectedCategory = watch("category");
  const regularPrice = watch("regular_price");
  const startDate = watch("starting_date");
  const selectedDiscounts = (watch("discountCodes") as string[] | undefined) || [];

  const subcategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
  }, [selectedCategory, subCategoriesData]);

  const onSubmit = async (formData: any) => {
    try {
      setLoading(true);
      await axiosInstance.post("/product/api/create-product", formData);
      router.push("/dashboard/all-events");
    } catch (error: any) {
      toast.error(error?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="seller-page-transition seller-compose-shell w-full pb-10"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="seller-page-header mb-6">
        <div className="space-y-1.5">
          <p className="seller-section-kicker">New Event Draft</p>
          <h1 className="text-4xl font-extrabold tracking-[-0.055em] text-[#17320f]">
            Create Event
          </h1>
          <BreadCrumbs title="Create Event" />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="seller-soft-panel rounded-2xl px-4 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6a7b4d]">
              Event Lifecycle
            </p>
            <p className="text-xs text-[#55663c]">
              Plan launch windows and inventory before publishing
            </p>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="seller-glow-button h-11 rounded-2xl border-0 px-5 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Event"}
          </Button>
        </div>
      </div>

      <div className="seller-stagger mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="seller-quick-stat">
          <Sparkles size={16} />
          <div>
            <p>Campaign Ready</p>
            <strong>Structured fields for high-converting launches</strong>
          </div>
        </div>
        <div className="seller-quick-stat">
          <CalendarDays size={16} />
          <div>
            <p>Time-Driven</p>
            <strong>Start and end dates for event urgency</strong>
          </div>
        </div>
        <div className="seller-quick-stat">
          <Tags size={16} />
          <div>
            <p>Discount Hooks</p>
            <strong>Attach promo codes directly to the campaign</strong>
          </div>
        </div>
      </div>

      <div className="seller-compose-grid">
        <aside className="seller-compose-column-sticky space-y-5">
          <section className="seller-panel seller-compose-panel rounded-[30px] p-5">
            <SectionHeading
              icon={ImageIcon}
              title="Event Cover"
              subtitle="Strong visual identity improves campaign performance."
            />
            <p className="mb-3 text-xs text-[#73815f]">
              Recommended ratio: <span className="font-semibold text-[#4e5d34]">765 x 850</span>
            </p>

            {images.length > 0 && (
              <ImagePlaceHolder
                size="765 x 850"
                small={false}
                images={images}
                setImages={setImages}
                setValue={setValue}
                index={0}
              />
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
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
          </section>

          <section className="seller-soft-panel seller-stagger-list rounded-[26px] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5f7043]">
              Timeline Checklist
            </p>
            <div className="space-y-2 pt-2 text-xs text-[#57673e]">
              <p>Set the start date close to launch communications.</p>
              <p>Keep end date realistic for stock and conversion goals.</p>
              <p>Attach discounts only when campaign margins allow.</p>
            </div>
          </section>
        </aside>

        <div className="seller-stagger-list space-y-5">
          <section className="seller-panel seller-compose-panel rounded-[30px] p-5">
            <SectionHeading
              icon={Clock3}
              title="Event Details"
              subtitle="Define campaign identity, taxonomy, and active window."
            />

            <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className={LABEL_CLASS}>Event Title *</Label>
                <div className={FIELD_SHELL_CLASS}>
                  <Input
                    placeholder="Enter event title"
                    className={INPUT_CLASS}
                    {...register("title", { required: "Title is required" })}
                  />
                </div>
                {errors.title && <p className={ERROR_CLASS}>{errors.title.message as string}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className={LABEL_CLASS}>Category *</Label>
                {isLoading ? (
                  <div className="seller-field-shell flex h-10 items-center rounded-[18px] border border-[#d9deba] bg-white/70 px-3 text-xs text-[#6a7855]">
                    Loading categories...
                  </div>
                ) : isError ? (
                  <div className="seller-field-shell flex h-10 items-center rounded-[18px] border border-red-300 bg-red-50/70 px-3 text-xs text-red-600">
                    Failed to load categories
                  </div>
                ) : (
                  <div className={FIELD_SHELL_CLASS}>
                    <Controller
                      name="category"
                      control={control}
                      rules={{ required: "Category is required" }}
                      render={({ field }) => (
                        <select {...field} className={SELECT_CLASS}>
                          <option value="" className="bg-card">
                            Select Category
                          </option>
                          {categories.map((category: string) => (
                            <option value={category} key={category} className="bg-card">
                              {category}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                )}
                {errors.category && <p className={ERROR_CLASS}>{errors.category.message as string}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className={LABEL_CLASS}>
                  Short Description *{" "}
                  <span className="normal-case tracking-normal text-[#80906c]">(max 150 words)</span>
                </Label>
                <div className={FIELD_SHELL_CLASS}>
                  <Textarea
                    rows={4}
                    placeholder="Enter event description for quick view"
                    className={TEXTAREA_CLASS}
                    {...register("short_description", {
                      required: "Description is required",
                      validate: (value) => {
                        const wordCount = value.trim().split(/\s+/).length;
                        return wordCount <= 150 || `Exceeds 150 words (${wordCount})`;
                      },
                    })}
                  />
                </div>
                {errors.short_description && (
                  <p className={ERROR_CLASS}>{errors.short_description.message as string}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className={LABEL_CLASS}>Subcategory *</Label>
                <div className={FIELD_SHELL_CLASS}>
                  <Controller
                    name="subCategory"
                    control={control}
                    rules={{ required: "Subcategory is required" }}
                    render={({ field }) => (
                      <select {...field} className={SELECT_CLASS}>
                        <option value="" className="bg-card">
                          Select Subcategory
                        </option>
                        {subcategories.map((subcategory: string) => (
                          <option key={subcategory} value={subcategory} className="bg-card">
                            {subcategory}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>
                {errors.subCategory && <p className={ERROR_CLASS}>{errors.subCategory.message as string}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className={LABEL_CLASS}>Tags * <span className="normal-case tracking-normal text-[#80906c]">(comma separated)</span></Label>
                <div className={FIELD_SHELL_CLASS}>
                  <Input
                    placeholder="launch, seasonal, exclusive"
                    className={INPUT_CLASS}
                    {...register("tags", {
                      required: "Separate related tags with a comma",
                    })}
                  />
                </div>
                {errors.tags && <p className={ERROR_CLASS}>{errors.tags.message as string}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className={LABEL_CLASS}>Warranty *</Label>
                <div className={FIELD_SHELL_CLASS}>
                  <Input
                    placeholder="1 Year / No Warranty"
                    className={INPUT_CLASS}
                    {...register("warranty", {
                      required: "Warranty is required",
                    })}
                  />
                </div>
                {errors.warranty && <p className={ERROR_CLASS}>{errors.warranty.message as string}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className={LABEL_CLASS}>Start Date *</Label>
                <div className={FIELD_SHELL_CLASS}>
                  <input
                    type="date"
                    className={SELECT_CLASS}
                    {...register("starting_date", {
                      required: "Starting date is required",
                    })}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                {errors.starting_date && (
                  <p className={ERROR_CLASS}>{errors.starting_date.message as string}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className={LABEL_CLASS}>End Date *</Label>
                <div className={FIELD_SHELL_CLASS}>
                  <input
                    type="date"
                    className={SELECT_CLASS}
                    {...register("ending_date", {
                      required: "Ending date is required",
                      validate: (value) => {
                        if (!startDate || !value) return true;
                        return value >= startDate || "End date must be after start date";
                      },
                    })}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                {errors.ending_date && (
                  <p className={ERROR_CLASS}>{errors.ending_date.message as string}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className={LABEL_CLASS}>Slug *</Label>
                  {isSlugChecking && (
                    <span className="text-[10px] font-medium text-[#729142]">Checking...</span>
                  )}
                </div>
                <div className={`${FIELD_SHELL_CLASS} relative`}>
                  <Input
                    placeholder="event-slug"
                    className={`${INPUT_CLASS} pr-9`}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setSlugValue(event.target.value);
                      setValue("slug", event.target.value);
                      formOnChange(event);
                    }}
                    value={watch("slug") ?? ""}
                    {...restSlugProps}
                  />

                  <button
                    type="button"
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-xl bg-[#86b81d] text-white transition-colors hover:bg-[#77a51b]"
                    onClick={async () => {
                      const title = getValues("title");
                      if (!title) {
                        toast.error("Please enter an event title to generate a slug!");
                        return;
                      }

                      const rawSlug = title
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9\s-]/g, "")
                        .replace(/\s+/g, "-")
                        .replace(/-+/g, "-");

                      try {
                        const res = await axiosInstance.post("/product/api/slug-validator", {
                          slug: rawSlug,
                        });
                        const { available, suggestedSlug } = res.data;

                        if (available) {
                          setValue("slug", rawSlug);
                          toast.success("Slug is available!");
                        } else if (suggestedSlug) {
                          setValue("slug", suggestedSlug);
                          toast.info("Slug not available, suggested new one applied.");
                        } else {
                          toast.error("Slug is already taken, try editing it.");
                        }
                      } catch {
                        toast.error("Failed to validate slug. Try again.");
                      }
                    }}
                  >
                    <Wand2 size={13} />
                  </button>
                </div>

                {errors.slug && <p className={ERROR_CLASS}>{errors.slug.message as string}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className={LABEL_CLASS}>Brand</Label>
                <div className={FIELD_SHELL_CLASS}>
                  <Input placeholder="Apple" className={INPUT_CLASS} {...register("brand")} />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label className={LABEL_CLASS}>
                  Detailed Description *{" "}
                  <span className="normal-case tracking-normal text-[#80906c]">(min 100 words)</span>
                </Label>
                <div className="seller-soft-panel overflow-hidden rounded-[24px] p-1.5">
                  <Controller
                    name="detailed_description"
                    control={control}
                    rules={{
                      required: "Detailed description is required",
                    }}
                    render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} />}
                  />
                </div>
                {errors.detailed_description && (
                  <p className={ERROR_CLASS}>{errors.detailed_description.message as string}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className={LABEL_CLASS}>Cash on Delivery *</Label>
                <div className={FIELD_SHELL_CLASS}>
                  <select
                    {...register("cash_on_delivery", {
                      required: "Cash on Delivery is required",
                    })}
                    defaultValue="yes"
                    className={SELECT_CLASS}
                  >
                    <option value="yes" className="bg-card">
                      Yes
                    </option>
                    <option value="no" className="bg-card">
                      No
                    </option>
                  </select>
                </div>
                {errors.cash_on_delivery && (
                  <p className={ERROR_CLASS}>{errors.cash_on_delivery.message as string}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className={LABEL_CLASS}>Video URL <span className="normal-case tracking-normal text-[#80906c]">(YouTube embed)</span></Label>
                <div className={FIELD_SHELL_CLASS}>
                  <Input
                    placeholder="https://www.youtube.com/embed/xyz123"
                    className={INPUT_CLASS}
                    {...register("video_url", {
                      pattern: {
                        value: /^https:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+$/,
                        message: "Use format: https://www.youtube.com/embed/xyz123",
                      },
                    })}
                  />
                </div>
                {errors.video_url && <p className={ERROR_CLASS}>{errors.video_url.message as string}</p>}
              </div>
            </div>
          </section>

          <section className="seller-panel seller-compose-panel rounded-[30px] p-5">
            <SectionHeading
              icon={Boxes}
              title="Variants and Properties"
              subtitle="Configure sizes, colors, and campaign-specific custom properties."
            />
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-2">
              <div className="space-y-4">
                <ColorSelector control={control} errors={errors} />
                <CustomSpecifications control={control} errors={errors} />
              </div>
              <div className="space-y-4">
                <SizeSelector control={control} errors={errors} />
                <CustomProperties control={control} errors={errors} />
              </div>
            </div>
          </section>

          <section className="seller-panel seller-compose-panel rounded-[30px] p-5">
            <SectionHeading
              icon={DollarSign}
              title="Commercial Setup"
              subtitle="Set pricing strategy, stock, and optional promotional code links."
            />

            <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label className={LABEL_CLASS}>Regular Price</Label>
                <div className={FIELD_SHELL_CLASS}>
                  <Input
                    type="number"
                    placeholder="0"
                    className={INPUT_CLASS}
                    {...register("regular_price", {
                      valueAsNumber: true,
                      min: { value: 1, message: "Price must be at least 1" },
                      validate: (value) => !isNaN(value) || "Only numbers are allowed",
                    })}
                  />
                </div>
                {errors.regular_price && (
                  <p className={ERROR_CLASS}>{errors.regular_price.message as string}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className={LABEL_CLASS}>Sale Price *</Label>
                <div className={FIELD_SHELL_CLASS}>
                  <Input
                    type="number"
                    placeholder="0"
                    className={INPUT_CLASS}
                    {...register("sale_price", {
                      required: "Sale price is required",
                      valueAsNumber: true,
                      min: { value: 1, message: "Sale price must be at least 1" },
                      validate: (value) => {
                        if (isNaN(value)) return "Only numbers are allowed";
                        if (regularPrice && value >= regularPrice)
                          return "Sale price must be less than regular price";
                        return true;
                      },
                    })}
                  />
                </div>
                {errors.sale_price && <p className={ERROR_CLASS}>{errors.sale_price.message as string}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className={LABEL_CLASS}>Stock *</Label>
                <div className={FIELD_SHELL_CLASS}>
                  <Input
                    type="number"
                    placeholder="100"
                    className={INPUT_CLASS}
                    {...register("stock", {
                      required: "Stock is required",
                      valueAsNumber: true,
                      min: { value: 1, message: "Stock must be at least 1" },
                      max: { value: 1000, message: "Stock cannot exceed 1,000" },
                      validate: (value) => {
                        if (isNaN(value)) return "Only numbers are allowed";
                        if (!Number.isInteger(value)) return "Stock must be a whole number";
                        return true;
                      },
                    })}
                  />
                </div>
                {errors.stock && <p className={ERROR_CLASS}>{errors.stock.message as string}</p>}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label className={LABEL_CLASS}>
                Discount Codes{" "}
                <span className="normal-case tracking-normal text-[#80906c]">(optional)</span>
              </Label>

              {discountLoading ? (
                <p className="text-xs text-[#6d7a58]">Loading discount codes...</p>
              ) : discountCodes.length === 0 ? (
                <p className="text-xs text-[#8a9775]">No discount codes available yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {discountCodes.map((code: any) => {
                    const isSelected = selectedDiscounts.includes(code.id);
                    return (
                      <button
                        key={code.id}
                        type="button"
                        className={`rounded-2xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                          isSelected
                            ? "border-lime-500 bg-lime-500 text-white shadow-[0_10px_20px_rgba(134,184,29,0.3)]"
                            : "border-[#d6dbb6] bg-white/80 text-[#5f6e43] hover:border-[#bfd06f] hover:text-[#33411f]"
                        }`}
                        onClick={() => {
                          const nextSelection = isSelected
                            ? selectedDiscounts.filter((id: string) => id !== code.id)
                            : [...selectedDiscounts, code.id];
                          setValue("discountCodes", nextSelection);
                        }}
                      >
                        {code.public_name} ({code.discountValue}
                        {code.discountType === "percentage" ? "%" : "$"})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </form>
  );
};

export default Page;
