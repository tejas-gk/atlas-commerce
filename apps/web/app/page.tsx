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
    <main className="max-w-[1400px] mx-auto px-6 py-6">
      <HeroBanner />
      <PromoGrid />
      <CategoryRow />

      {!isLoading && !isError && isLoggedIn && (
        <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
          {products?.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {products?.length === 0 && (
        <p className="text-center">No Products available yet!</p>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
            ></div>
          ))}
        </div>
      )}

      <div className="my-8 block">
        {/* <SectionTitle title="Latest Products" /> */}
      </div>
      {!LatestProductsLoading && (
        <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
          {latestProducts?.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
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
        <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
          {offers?.map((product: any) => (
            <ProductCard key={product.id} product={product} isEvent={true} />
          ))}
        </div>
      )}



      <ProductSection />
    </main >
  )
}
