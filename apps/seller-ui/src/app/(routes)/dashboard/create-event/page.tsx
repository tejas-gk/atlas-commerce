"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Package, Tag, IndianRupee, Image as ImageIcon, CheckCircle2, Save, Wand2 } from "lucide-react";

import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import ImagePlaceHolder from "@/shared/components/image-placeholder";
import ColorSelector from "@/shared/components/color-selector";
import CustomSpecifications from "../custom-specifications";
import CustomProperties from "@/shared/components/custom-properties";
import SizeSelector from "@/shared/components/size-selector";
import RichTextEditor from "@/shared/components/rich-text-editor";

interface UploadedImage {
  fileId: string;
  file_url: string;
}

export default function CreateProduct() {
  const [activeSection, setActiveSection] = useState("basic");
  const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [slugValue, setSlugValue] = useState("");
  const [isSlugChecking, setIsSlugChecking] = useState(false);

  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (slugValue) {
        setIsSlugChecking(true);
        axiosInstance
          .post("/product/api/slug-validator", { slug: slugValue }, isProtected)
          .then((res) => {
            if (res.data.available) toast.success("Slug is available!");
            else {
              setValue("slug", res.data.slug);
              toast.info("Slug taken. Suggested new one applied.");
            }
          })
          .catch(() => toast.error("Error checking slug!"))
          .finally(() => setIsSlugChecking(false));
      }
    }, 1500);
    return () => clearTimeout(delayDebounce);
  }, [slugValue, setValue]);

  const { onChange: formOnChange, ...restSlugProps } = register("slug", {
    required: "Slug is required!",
    pattern: {
      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      message: "Lowercase, numbers, and dashes only.",
    },
  });

  const { data: catData, isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await axiosInstance.get("/product/api/get-categories")).data,
    staleTime: 1000 * 60 * 5,
  });

  const { data: discountCodes = [] } = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => (await axiosInstance.get("/product/api/get-discount-codes"))?.data?.discount_codes || [],
  });

  const categories = catData?.categories || [];
  const subCategoriesData = catData?.subCategories || {};
  const selectedCategory = watch("category");
  const regularPrice = watch("regular_price");

  const subcategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
  }, [selectedCategory, subCategoriesData]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await axiosInstance.post("/product/api/create-product", data);
      toast.success("Product created successfully!");
      router.push("/dashboard/all-products");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:bg-white/[0.05] focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 outline-none transition-all";

  return (
    <div className="flex h-screen bg-[#09090B] font-sans text-zinc-100 selection:bg-red-500/30">
      
      <aside className="w-64 border-r border-white/10 bg-[#09090B] p-6 hidden md:block shrink-0">
        <h2 className="text-lg font-bold mb-8 tracking-tight">Create Product</h2>
        <nav className="space-y-1">
          {[
            { id: "basic", icon: Package, label: "Basic Info" },
            { id: "pricing", icon: IndianRupee, label: "Pricing & Stock" },
            { id: "variants", icon: Tag, label: "Variants & Details" },
            { id: "media", icon: ImageIcon, label: "Images & Media" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeSection === item.id ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
              }`}
            >
              <item.icon size={16} /> {item.label}
              {activeSection === item.id && <CheckCircle2 size={14} className="ml-auto text-red-500" />}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0A0A0C]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          
          <header className="h-16 border-b border-white/10 flex items-center justify-end px-8 shrink-0 bg-[#09090B]/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white">Discard</button>
              <button 
                type="submit" disabled={loading}
                className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-500 transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)] disabled:opacity-50"
              >
                <Save size={16} /> {loading ? "Publishing..." : "Publish Product"}
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-8 custom-scrollbar">
            <div className="max-w-3xl space-y-8 pb-20">

              <div className={activeSection === "basic" ? "block" : "hidden"}>
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1">Basic Information</h3>
                  <p className="text-zinc-500 text-sm">Core details and categorization.</p>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Product Title *</label>
                    <input {...register("title", { required: "Title required" })} placeholder="Enter title" className={inputClass} />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Slug *</label>
                    <div className="relative">
                      <input 
                        placeholder="product-slug"
                        className={`${inputClass} pr-10`}
                        value={watch("slug")}
                        onChange={(e) => {
                          setSlugValue(e.target.value);
                          setValue("slug", e.target.value);
                          formOnChange(e);
                        }}
                        {...restSlugProps}
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const title = getValues("title");
                          if (!title) return toast.error("Enter a title first!");
                          const rawSlug = title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
                          setSlugValue(rawSlug);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/10 hover:bg-red-500 hover:text-white rounded text-zinc-400 transition-colors"
                      >
                        <Wand2 size={14} />
                      </button>
                    </div>
                    {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message as string}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Category *</label>
                      <select {...register("category", { required: "Category required" })} className={`${inputClass} appearance-none`}>
                        <option value="" className="bg-[#09090B]">Select Category</option>
                        {categories?.map((c: string) => <option key={c} value={c} className="bg-[#09090B]">{c}</option>)}
                      </select>
                      {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message as string}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Sub Category *</label>
                      <select {...register("subCategory", { required: "Subcategory required" })} className={`${inputClass} appearance-none`}>
                        <option value="" className="bg-[#09090B]">Select Subcategory</option>
                        {subcategories?.map((s: string) => <option key={s} value={s} className="bg-[#09090B]">{s}</option>)}
                      </select>
                      {errors.subCategory && <p className="text-red-500 text-xs mt-1">{errors.subCategory.message as string}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Short Description</label>
                    <textarea rows={3} {...register("short_description", { required: "Required" })} className={`${inputClass} resize-none`} />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Detailed Description</label>
                    <Controller
                      name="detailed_description"
                      control={control}
                      rules={{ required: "Detailed description is required" }}
                      render={({ field }) => (
                        <div className="border border-white/10 rounded-lg overflow-hidden">
                          <RichTextEditor value={field.value} onChange={field.onChange} />
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className={activeSection === "pricing" ? "block" : "hidden"}>
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1">Pricing & Inventory</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Regular Price</label>
                    <input type="number" {...register("regular_price", { valueAsNumber: true })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest text-red-400">Sale Price *</label>
                    <input type="number" {...register("sale_price", { required: true, valueAsNumber: true })} className={`${inputClass} border-red-500/30 text-red-100 focus:border-red-500`} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Stock *</label>
                    <input type="number" {...register("stock", { required: true, valueAsNumber: true })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Cash on Delivery</label>
                    <select {...register("cashOnDelivery")} className={`${inputClass} appearance-none`}>
                      <option value="Yes" className="bg-[#09090B]">Yes</option>
                      <option value="No" className="bg-[#09090B]">No</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={activeSection === "variants" ? "block" : "hidden"}>
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1">Variants & Details</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Brand</label>
                    <input {...register("brand")} className={inputClass} />
                  </div>
                  
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl space-y-4">
                     <ColorSelector control={control} errors={errors} />
                  </div>
                  
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl space-y-4">
                    <SizeSelector control={control} errors={errors} />
                  </div>

                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl space-y-4">
                    <CustomSpecifications control={control} errors={errors} />
                  </div>

                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl space-y-4">
                    <CustomProperties control={control} errors={errors} />
                  </div>
                </div>
              </div>

              <div className={activeSection === "media" ? "block" : "hidden"}>
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1">Images & Media</h3>
                </div>
                
                <div className="space-y-4">
                  {images?.length > 0 && (
                    <ImagePlaceHolder size="765 x 850" small={false} images={images} setImages={setImages} setValue={setValue} index={0} />
                  )}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {images.slice(1).map((_, index) => (
                      <ImagePlaceHolder key={index} size="765 x 850" images={images} setImages={setImages} small setValue={setValue} index={index + 1} />
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </form>
      </main>
    </div>
  );
}