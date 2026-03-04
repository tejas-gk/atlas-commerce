import HeroBanner from "@/components/banners/HeroBanner"
import PromoGrid from "@/components/banners/PromoGrid"
import CategoryRow from "@/components/category/CategoryRow"
import { HeroCarousel } from "@/components/hero-carousel"
import Navbar from "@/components/navbar"
import ProductSection from "@/components/product/ProductSection"
import { Button } from "@workspace/ui/components/button"

export default function Page() {
  return (
    <main className="max-w-[1400px] mx-auto px-6 py-6">
      <HeroBanner />
      <HeroCarousel/>
      <PromoGrid />
      <CategoryRow />
      <ProductSection />
    </main>
  )
}
