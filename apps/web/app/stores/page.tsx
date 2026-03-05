import HeroBanner from "@/components/banners/HeroBanner"
import PromoGrid from "@/components/banners/PromoGrid"
import CategoryRow from "@/components/category/CategoryRow"
import ProductSection from "@/components/product/ProductSection"

export default function Page() {
  return (
    <main className="max-w-[1400px] mx-auto px-6 py-6">
      <HeroBanner />
      <PromoGrid />
      <CategoryRow />
      <ProductSection />
    </main>
  )
}
