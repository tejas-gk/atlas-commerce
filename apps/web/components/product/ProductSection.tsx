import ProductCard from "./ProductCard";

export const products = [
    {
        id: "1",
        image: "/milk.png",
        name: "Nandini Cow Milk",
        weight: "500 ml",
        price: 26,
    },
    {
            id: "2",
        image: "/curd.png",
        name: "Nandini Pouch Curd",
        weight: "415 g",
        price: 27,
    },
    {
        id: "3",
        image: "/curd.png",
        name: "Nandini Pouch Curd",
        weight: "415 g",
        price: 27,
    },
    {
        id: "4",
        image: "/curd.png",
        name: "Nandini Pouch Curd",
        weight: "415 g",
        price: 27,
    },
    {
        id: "5",
        image: "/curd.png",
        name: "Nandini Pouch Curd",
        weight: "415 g",
        price: 27,
    },
    {
        id: "6",
        image: "/curd.png",
        name: "Nandini Pouch Curd",
        weight: "415 g",
        price: 27,
    },
    {
        id: "7",
        image: "/curd.png",
        name: "Nandini Pouch Curd",
        weight: "415 g",
        price: 27,
    },
];
export default function ProductSection() {

    return (
        <div className="mt-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                    Dairy, Bread & Eggs
                </h2>
                <button className="text-green-600 text-sm font-semibold">
                    see all
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {products.map((product, index) => (
                    <ProductCard key={index} {...product} />
                ))}
            </div>
        </div>
    );
}