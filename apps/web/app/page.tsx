"use client"
import HeroBanner from "@/components/banners/HeroBanner"
import PromoGrid from "@/components/banners/PromoGrid"
import CategoryRow from "@/components/category/CategoryRow"
import ProductCard from "@/components/product/ProductCard"
import ProductSection from "@/components/product/ProductSection"
import { useAuthStore } from "@/store/authStore"
import axiosInstance from "@/utils/axiosInstance"
import { useQuery } from "@tanstack/react-query";
export default function Page() {
  const { isLoggedIn } = useAuthStore();

  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/recommendation/api/get-recommendation-products"
      );
      return res.data.recommendations;
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: latestProducts, isLoading: LatestProductsLoading } = useQuery({
    queryKey: ["latest-products"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-all-products?page=1&limit=10&type=latest"
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: shops, isLoading: shopLoading } = useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/top-shops");
      return res.data.shops;
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-all-events?page=1&limit=10"
      );
      return res.data.events;
    },
    staleTime: 1000 * 60 * 2,
  });
  return (
    <main className="max-w-[1400px] mx-auto px-4 py-5 md:px-6 md:py-6">
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {[
          "Express Delivery",
          "Fresh Fruits",
          "Daily Essentials",
          "Dairy & Bakery",
          "Snacks",
          "Beverages",
        ].map((chip) => (
          <span
            key={chip}
            className="shrink-0 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-black/70"
          >
            {chip}
          </span>
        ))}
      </div>

      <HeroBanner />
      <PromoGrid />
      <CategoryRow />

      {!isLoading && !isError && isLoggedIn && (
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-black">Recommended for you</h2>
            <button className="text-sm font-semibold text-[#0c831f]">See all</button>
          </div>
          <div className="m-auto grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 md:gap-4">
            {products?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {products?.length === 0 && (
        <p className="text-center">No Products available yet!</p>
      )}

      {isLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 md:gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="h-[250px] animate-pulse rounded-xl bg-gray-200"
            ></div>
          ))}
        </div>
      )}

      <div className="my-8 block">
        {/* <SectionTitle title="Latest Products" /> */}
      </div>
      {!LatestProductsLoading && (
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-black">Fresh arrivals</h2>
            <button className="text-sm font-semibold text-[#0c831f]">See all</button>
          </div>
          <div className="m-auto grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 md:gap-4">
            {latestProducts?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {latestProducts?.length === 0 && (
        <p className="text-center">No products Available yet!</p>
      )}

      <div className="my-8 block">
        {/* <SectionTitle title="Top Shops" /> */}
      </div>

      {/* {!shopLoading && (
        <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
          {shops?.map((shop: any) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )} */}

      {shops?.length === 0 && (
        <p className="text-center">No shops Available yet!</p>
      )}

      <div className="my-8 block">
        {/* <SectionTitle title="Top offers" /> */}
      </div>
      {!offersLoading && !isError && (
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-black">Top offers</h2>
            <button className="text-sm font-semibold text-[#0c831f]">See all</button>
          </div>
          <div className="m-auto grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 md:gap-4">
            {offers?.map((product: any) => (
              <ProductCard key={product.id} product={product} isEvent={true} />
            ))}
          </div>
        </section>
      )}



      <ProductSection />
    </main >
  )
}
