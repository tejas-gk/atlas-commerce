"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Plus, Search } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

const segmentLabelMap: Record<string, string> = {
	dashboard: "Dashboard",
	orders: "Orders",
	products: "Products",
	"all-products": "All Products",
	"create-product": "Create Product",
	"edit-product": "Edit Product",
	"all-events": "All Events",
	"create-event": "Create Event",
	"edit-event": "Edit Event",
	"discount-codes": "Discount Codes",
	notifications: "Notifications",
	payments: "Payments",
	settings: "Settings",
	inbox: "Inbox",
};

function toTitleCase(segment: string) {
	if (segmentLabelMap[segment]) {
		return segmentLabelMap[segment];
	}

	return segment
		.split("-")
		.filter(Boolean)
		.map((word) => word[0]?.toUpperCase() + word.slice(1))
		.join(" ");
}

export function SellerSiteHeader() {
	const pathname = usePathname();
	const segments = pathname.split("/").filter(Boolean);
	const headerSegments = segments[0] === "dashboard" ? segments : ["dashboard", ...segments];

	return (
		<header className="sticky top-0 z-20 border-b border-[#d8dbbb]/90 bg-[#fffef8]/95 backdrop-blur">
			<div className="mx-auto flex h-16 w-full max-w-[1480px] items-center gap-3 px-4 md:px-6">
				<nav className="hidden items-center gap-2 text-xs text-[#6f7757] md:flex" aria-label="Breadcrumb">
					{headerSegments.map((segment, index) => {
						const href = `/${headerSegments.slice(0, index + 1).join("/")}`;
						const isLast = index === headerSegments.length - 1;

						return (
							<div key={href} className="flex items-center gap-2">
								{index > 0 && <span className="text-[#a5ab84]">/</span>}
								{isLast ? (
									<span className="font-semibold text-[#243716]">{toTitleCase(segment)}</span>
								) : (
									<Link href={href} className="transition-colors hover:text-[#243716]">
										{toTitleCase(segment)}
									</Link>
								)}
							</div>
						);
					})}
				</nav>

				<div className="relative ml-auto hidden w-full max-w-sm items-center md:flex">
					<Search size={14} className="pointer-events-none absolute left-3 text-[#8a916d]" />
					<input
						type="search"
						placeholder="Search orders, products, events"
						className="h-10 w-full rounded-xl border border-[#d5dbb6] bg-white pl-9 pr-3 text-sm text-[#243716] outline-none transition-colors placeholder:text-[#8a916d] focus:border-[#b9ca7b]"
					/>
				</div>

				<div className="ml-auto flex items-center gap-2 md:ml-0">
					<Link
						href="/dashboard/create-product"
						className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d3dcab] bg-[#f5f9e4] px-3 text-sm font-medium text-[#27411a] transition-colors hover:bg-[#eff6d5]"
					>
						<Plus size={14} />
						<span className="hidden sm:inline">Create</span>
					</Link>

					<button
						type="button"
						className={cn(
							"relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d5dbb6]",
							"bg-white text-[#6b7454] transition-colors hover:text-[#243716]"
						)}
						aria-label="Notifications"
					>
						<Bell size={15} />
						<span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-lime-500" />
					</button>
				</div>
			</div>
		</header>
	);
}

export default SellerSiteHeader;
