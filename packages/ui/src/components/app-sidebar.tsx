"use client"
import * as React from "react"
import { NavMain } from "@workspace/ui/components/nav-main"
import { NavProjects } from "@workspace/ui/components/nav-projects"
import { NavUser } from "@workspace/ui/components/nav-user"
import { TeamSwitcher } from "@workspace/ui/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { PencilRuler, LogOut, Settings, ListOrdered, Home } from "lucide-react"

const data = {
  user: {
    name: "Admin",
    email: "admin@example.com",
    avatar: "/avatars/admin.jpg",
  },
  teams: [
    {
      name: "PXLSGRDS",
      logo: <Home />,
      plan: "Admin Panel",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <Home />,
      isActive: true,
    },
    {
      title: "Main Menu",
      url: "#", // <-- ADDED
      icon: <ListOrdered />,
      items: [
        { title: "Orders", url: "/dashboard/orders" },
        { title: "Payments", url: "/dashboard/payments" },
        { title: "Products", url: "/dashboard/products" },
        { title: "Events", url: "/dashboard/events" },
        { title: "Users", url: "/dashboard/users" },
        { title: "Sellers", url: "/dashboard/sellers" },
      ],
    },
    {
      title: "Controllers",
      url: "#", // <-- ADDED
      icon: <Settings />,
      items: [
        { title: "Loggers", url: "/dashboard/loggers" },
        { title: "Management", url: "/dashboard/management" },
        { title: "Notifications", url: "/dashboard/notifications" },
      ],
    },
    {
      title: "Customization",
      url: "#", // <-- ADDED
      icon: <PencilRuler />,
      items: [
        { title: "All Customization", url: "/dashboard/customization" },
      ],
    },
    {
      title: "Extras",
      url: "#", // <-- ADDED
      icon: <LogOut />,
      items: [
        { title: "Logout", url: "/" },
      ],
    },
  ],
  projects: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}