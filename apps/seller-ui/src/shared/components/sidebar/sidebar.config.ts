// sidebar.config.ts
import {
    Home,
    ListOrdered,
    PartyPopper,
    SquarePlus,
    PackageSearch,
    CalendarPlus,
    BellPlus,
    Mail,
    Settings,
    BellRing,
    TicketPercent,
    LogOut,
} from "lucide-react";

export const sidebarConfig = [
    {
        title: "Dashboard",
        items: [
            { title: "Dashboard", href: "/dashboard", icon: Home },
        ],
    },
    {
        title: "Main Menu",
        items: [
            { title: "Orders", href: "/dashboard/orders", icon: ListOrdered },
            { title: "Payments", href: "/dashboard/payments", icon: PartyPopper },
        ],
    },
    {
        title: "Products",
        items: [
            { title: "Create Product", href: "/dashboard/create-product", icon: SquarePlus },
            { title: "All Products", href: "/dashboard/all-products", icon: PackageSearch },
        ],
    },
    {
        title: "Events",
        items: [
            { title: "Create Event", href: "/dashboard/create-event", icon: CalendarPlus },
            { title: "All Events", href: "/dashboard/all-events", icon: BellPlus },
        ],
    },
    {
        title: "Controllers",
        items: [
            { title: "Inbox", href: "/dashboard/inbox", icon: Mail },
            { title: "Settings", href: "/dashboard/settings", icon: Settings },
            { title: "Notifications", href: "/dashboard/notifications", icon: BellRing },
        ],
    },
    {
        title: "Extras",
        items: [
            { title: "Discount Codes", href: "/dashboard/discount-codes", icon: TicketPercent },
            { title: "Logout", href: "/logout", icon: LogOut, isLogout: true },
        ],
    },
];