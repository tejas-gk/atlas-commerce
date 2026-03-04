import PromoBanner from "./PromoBanner";

export default function PromoGrid() {
    return (
        <div className="grid md:grid-cols-3 gap-4 mt-6">
            <PromoBanner
                title="Pharmacy at your doorstep!"
                subtitle="Cough syrups, pain relief sprays & more"
                bg="bg-teal-500"
                image="/pharma.png"
            />
            <PromoBanner
                title="Pet care supplies at your door"
                subtitle="Food, treats, toys & more"
                bg="bg-yellow-400"
                image="/pets.png"
            />
            <PromoBanner
                title="No time for a diaper run?"
                subtitle="Get baby care essentials"
                bg="bg-gray-300"
                image="/baby.png"
            />
        </div>
    );
}