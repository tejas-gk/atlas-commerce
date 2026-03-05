"use client";

import { usePathname, useRouter } from "next/navigation";
import {DistrictNavbar} from "./DistrictNavbar";
import StoresNavbar from "./StoresNavbar";
import { ArrowLeft } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();

    const isHome = pathname === "/";
    const isMovies = pathname.startsWith("/movies");
    const isEvents = pathname.startsWith("/events");
    const isPlay = pathname.startsWith("/play");

    const isStores =
        pathname.startsWith("/stores") ||
        pathname.startsWith("/product") ||
        pathname.startsWith("/category");

    if (isHome) {
        return <DistrictNavbar />;
    }

    if (isStores) {
        return <StoresNavbar />;
    }

    if (isMovies) {
        return (
            <SectionNavbar title="Movies" onBack={() => router.push("/")} />
        );
    }

    if (isEvents) {
        return (
            <SectionNavbar title="Events" onBack={() => router.push("/")} />
        );
    }

    if (isPlay) {
        return (
            <SectionNavbar title="Play" onBack={() => router.push("/")} />
        );
    }

    return null;
}

function SectionNavbar({
    title,
    onBack,
}: {
    title: string;
    onBack: () => void;
}) {
    return (
        <header className="border-b bg-white">
            <div className="max-w-7xl mx-auto flex items-center gap-4 px-4 py-3">

                <button
                    onClick={onBack}
                    className="p-2 rounded-md hover:bg-gray-100"
                >
                    <ArrowLeft size={20} />
                </button>

                <h1 className="font-semibold text-lg">{title}</h1>

            </div>
        </header>
    );
}