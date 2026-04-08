import CategoryCard from "./CategoryCard";

export default function CategoryRow() {
    const categories = [
        { image: "/cat1.png", label: "Dairy, Bread & Eggs" },
        { image: "/cat2.png", label: "Fruits & Vegetables" },
        { image: "/cat3.png", label: "Snacks & Munchies" },
        { image: "/cat4.png", label: "Tea, Coffee & Drinks" },
    ];

    return (
        <section className="mt-6">
            <h2 className="mb-3 text-lg font-semibold text-black">Shop by category</h2>
            <div className="grid grid-cols-4 gap-2 md:grid-cols-8 md:gap-3">
                {categories.map((cat, index) => (
                    <CategoryCard key={index} {...cat} />
                ))}
            </div>
        </section>
    );
}