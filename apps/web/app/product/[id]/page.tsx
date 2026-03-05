import ProductDetailsPage from "@/components/product-details/ProductDetailsPage";

interface PageProps {
    params: {
        id: string;
    };
}

export default function Page({ params }: PageProps) {
    return <ProductDetailsPage productId={params.id} />;
}