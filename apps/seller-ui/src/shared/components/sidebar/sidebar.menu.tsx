import {
  Bell,
  Boxes,
  CalendarDays,
  CalendarPlus,
  CreditCard,
  Inbox,
  LayoutDashboard,
  PackagePlus,
  Pencil,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Tag,
  type LucideIcon,
} from "lucide-react";

export interface SidebarNavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
}

export interface SidebarNavSection {
  label: string;
  items: SidebarNavItem[];
}

export const sellerSidebarMenu: SidebarNavSection[] = [
  {
    label: "Main Menu",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
      { title: "Payments", href: "/dashboard/payments", icon: CreditCard },
    ],
  },
  {
    label: "Products",
    items: [
      { title: "Create Product", href: "/dashboard/create-product", icon: PackagePlus },
      { title: "Edit Product", href: "/dashboard/edit-product", icon: Pencil },
      { title: "All Products", href: "/dashboard/all-products", icon: Boxes },
    ],
  },
  {
    label: "Events",
    items: [
      { title: "Create Event", href: "/dashboard/create-event", icon: CalendarPlus },
      { title: "Edit Event", href: "/dashboard/edit-event", icon: Pencil },
      { title: "All Events", href: "/dashboard/all-events", icon: CalendarDays },
    ],
  },
  {
    label: "Controllers",
    items: [
      { title: "Inbox", href: "/dashboard/inbox", icon: Inbox },
      { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
      { title: "App Platform", href: "/dashboard/app-platform", icon: SlidersHorizontal },
      { title: "Settings", href: "/dashboard/settings", icon: Settings },
      { title: "Discount Codes", href: "/dashboard/discount-codes", icon: Tag },
    ],
  },
];
