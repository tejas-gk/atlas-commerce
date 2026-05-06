"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ExternalLink,
  Package,
  Pencil,
  Sparkles,
  Tags,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import useSeller from "@/hooks/useSeller";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";

type ProductDraft = {
  title: string;
  sale_price: string;
  stock: string;
  short_description: string;
};

const FIELD_SHELL_CLASS =
  "seller-field-shell rounded-[18px] border border-[#d9deba] bg-white/78 px-3";
const INPUT_CLASS =
  "!h-10 !border-0 !bg-transparent !shadow-none px-0 text-sm text-[#1f2f18] placeholder:text-[#788760] focus-visible:!ring-0";
const TEXTAREA_CLASS =
  "!min-h-[140px] !border-0 !bg-transparent !shadow-none px-0 py-2 text-sm text-[#1f2f18] placeholder:text-[#788760] focus-visible:!ring-0";
const LABEL_CLASS =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-[#607045]";

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
      <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#4d5d34]">{title}</h2>
      <p className="text-xs text-[#75835f]">{subtitle}</p>
    </div>
  </div>
);

const fetchProducts = async () => {
  const res = await axiosInstance.get("/product/api/get-shop-products");
  return res.data.products?.filter((item: any) => !item.starting_date) ?? [];
};

const formatMoney = (value: any) => {
  const numberValue = Number(value ?? 0);
  return Number.isNaN(numberValue) ? "0.00" : numberValue.toFixed(2);
};

const EditProductPage = () => {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const { seller } = useSeller();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shop-products", seller?.activeShopId],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
    enabled: !!seller?.activeShopId,
  });

  const selectedProduct = useMemo(
    () => products.find((item: any) => item.id === productId),
    [products, productId]
  );

  const [draft, setDraft] = useState<ProductDraft>({
    title: "",
    sale_price: "",
    stock: "",
    short_description: "",
  });

  useEffect(() => {
    if (!selectedProduct) return;

    setDraft({
      title: selectedProduct.title ?? "",
      sale_price: String(selectedProduct.sale_price ?? ""),
      stock: String(selectedProduct.stock ?? ""),
      short_description: selectedProduct.short_description ?? "",
    });
  }, [selectedProduct]);

  const onSaveDraft = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.info("Product update API is not available yet. Connect update endpoint to persist these edits.");
  };

  const storefrontBase = process.env.NEXT_PUBLIC_USER_UI_LINK ?? "";
  const storefrontUrl =
    selectedProduct?.slug && storefrontBase
      ? `${storefrontBase}/product/${selectedProduct.slug}`
      : undefined;

  return (
    <div className="seller-page-transition seller-compose-shell space-y-6 pb-10">
      <div className="seller-page-header">
        <div className="space-y-1.5">
          <p className="seller-section-kicker">Product Edit Mode</p>
          <h1 className="text-4xl font-extrabold tracking-[-0.055em] text-[#17320f]">
            Edit Product
          </h1>
          <BreadCrumbs title="Edit Product" />
        </div>

        <Button
          asChild
          variant="outline"
          className="h-10 rounded-2xl border-[#dde1bc] bg-white px-4 text-[#556244] hover:bg-[#f6f8e8] hover:text-[#17320f]"
        >
          <Link href="/dashboard/all-products">Back to All Products</Link>
        </Button>
      </div>

      <div className="seller-stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="seller-quick-stat">
          <Sparkles size={16} />
          <div>
            <p>Live Editing</p>
            <strong>Refine details with instant visual context</strong>
          </div>
        </div>
        <div className="seller-quick-stat">
          <Tags size={16} />
          <div>
            <p>Catalog Integrity</p>
            <strong>Keep titles, prices, and copy aligned</strong>
          </div>
        </div>
        <div className="seller-quick-stat">
          <Truck size={16} />
          <div>
            <p>Inventory Accuracy</p>
            <strong>Update stock before campaign pushes</strong>
          </div>
        </div>
      </div>

      {isLoading ? (
        <section className="seller-panel rounded-[30px] p-10">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#86b81d]/30 border-t-[#86b81d]" />
          </div>
        </section>
      ) : !selectedProduct ? (
        <section className="seller-panel seller-compose-panel rounded-[30px] p-6">
          <SectionHeading
            icon={Pencil}
            title="Select Product"
            subtitle="Pick any product to open the premium editor workspace."
          />
          <p className="max-w-2xl text-sm text-[#556244]">
            Open a product from the All Products table using the Edit Product action,
            or choose one quickly below.
          </p>

          <div className="seller-stagger-list mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {products.slice(0, 9).map((product: any) => (
              <div key={product.id} className="seller-soft-panel rounded-[20px] p-3.5">
                <p className="truncate text-sm font-semibold text-[#17320f]">{product.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground/70">
                  {product.category || "Uncategorized"}
                </p>
                <p className="mt-2 text-xs text-[#556244]">
                  ${formatMoney(product.sale_price)} • Stock {product.stock ?? 0}
                </p>
                <Button
                  asChild
                  size="sm"
                  className="seller-glow-button mt-3 h-8 rounded-xl border-0 px-3 text-xs font-semibold text-white"
                >
                  <Link href={`/dashboard/edit-product?productId=${product.id}`}>
                    Edit Product
                    <ArrowRight size={12} />
                  </Link>
                </Button>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <p className="mt-5 text-sm text-muted-foreground/70">
              No products found for this shop yet.
            </p>
          )}
        </section>
      ) : (
        <div className="seller-compose-grid">
          <aside className="seller-compose-column-sticky space-y-5">
            <section className="seller-panel seller-compose-panel rounded-[30px] p-5">
              <SectionHeading
                icon={Package}
                title="Selected Product"
                subtitle="Real-time context while adjusting product details."
              />
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-[#e3e7c7] bg-white">
                    {selectedProduct.images?.[0]?.url ? (
                      <img
                        src={selectedProduct.images[0].url}
                        alt={selectedProduct.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package size={18} className="text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#17320f]">
                      {selectedProduct.title}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {selectedProduct.category || "Uncategorized"}
                    </p>
                  </div>
                </div>

                <div className="seller-soft-panel rounded-2xl p-3 text-sm text-[#556244]">
                  <p>Slug: {selectedProduct.slug || "-"}</p>
                  <p className="mt-1">Price: ${formatMoney(selectedProduct.sale_price)}</p>
                  <p className="mt-1">Stock: {selectedProduct.stock ?? 0}</p>
                  <p className="mt-1">Status: {selectedProduct.isDeleted ? "Deleted" : "Active"}</p>
                </div>

                <div className="grid gap-2">
                  <Button
                    asChild
                    variant="outline"
                    className="h-9 rounded-xl border-[#dde1bc] bg-white text-[#556244] hover:bg-[#f6f8e8] hover:text-[#17320f]"
                  >
                    <Link href="/dashboard/all-products">Browse Product List</Link>
                  </Button>

                  {storefrontUrl ? (
                    <Button
                      asChild
                      variant="outline"
                      className="h-9 rounded-xl border-[#dde1bc] bg-white text-[#556244] hover:bg-[#f6f8e8] hover:text-[#17320f]"
                    >
                      <Link href={storefrontUrl} target="_blank">
                        View On Storefront
                        <ExternalLink size={13} />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      disabled
                      className="h-9 rounded-xl border-[#dde1bc] bg-white text-[#94a285]"
                    >
                      Storefront Link Unavailable
                    </Button>
                  )}
                </div>
              </div>
            </section>

            <section className="seller-soft-panel seller-stagger-list rounded-[26px] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5f7043]">
                Editing Notes
              </p>
              <div className="space-y-2 pt-2 text-xs text-[#57673e]">
                <p>Use clear naming for better catalog search visibility.</p>
                <p>Sync stock updates before activating major discounts.</p>
                <p>Keep short description concise for faster decision-making.</p>
              </div>
            </section>
          </aside>

          <section className="seller-panel seller-compose-panel rounded-[30px] p-5">
            <SectionHeading
              icon={Pencil}
              title="Product Editor"
              subtitle="Adjust commercial fields while preserving storefront quality."
            />

            <form className="space-y-4" onSubmit={onSaveDraft}>
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className={LABEL_CLASS}>Product Title</Label>
                  <div className={FIELD_SHELL_CLASS}>
                    <Input
                      value={draft.title}
                      onChange={(event) =>
                        setDraft((prev) => ({ ...prev, title: event.target.value }))
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className={LABEL_CLASS}>Sale Price</Label>
                  <div className={FIELD_SHELL_CLASS}>
                    <Input
                      type="number"
                      value={draft.sale_price}
                      onChange={(event) =>
                        setDraft((prev) => ({ ...prev, sale_price: event.target.value }))
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className={LABEL_CLASS}>Stock</Label>
                  <div className={FIELD_SHELL_CLASS}>
                    <Input
                      type="number"
                      value={draft.stock}
                      onChange={(event) =>
                        setDraft((prev) => ({ ...prev, stock: event.target.value }))
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className={LABEL_CLASS}>Category</Label>
                  <div className="seller-soft-panel flex h-[42px] items-center rounded-[18px] px-3 text-sm text-[#4e5d34]">
                    {selectedProduct.category || "Uncategorized"}
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label className={LABEL_CLASS}>Short Description</Label>
                  <div className={FIELD_SHELL_CLASS}>
                    <Textarea
                      rows={6}
                      value={draft.short_description}
                      onChange={(event) =>
                        setDraft((prev) => ({ ...prev, short_description: event.target.value }))
                      }
                      className={TEXTAREA_CLASS}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-xs text-muted-foreground/70">
                  The premium editor is wired. Connect your update-product endpoint to persist changes.
                </p>
                <Button
                  type="submit"
                  className="seller-glow-button h-10 rounded-2xl border-0 px-4 text-white"
                >
                  Save Product Changes
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default EditProductPage;
