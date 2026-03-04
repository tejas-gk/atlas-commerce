import CategoryCard from "./CategoryCard";

export default function CategoryRow() {
    const categories = [
        { image: "/cat1.png", label: "Dairy, Bread & Eggs" },
        { image: "/cat2.png", label: "Fruits & Vegetables" },
        { image: "/cat3.png", label: "Snacks & Munchies" },
        { image: "/cat4.png", label: "Tea, Coffee & Drinks" },
    ];

    return (
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4 mt-6">
            {categories.map((cat, index) => (
                <CategoryCard key={index} {...cat} />
            ))}
        </div>
    );
}