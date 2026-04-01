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
import { GalleryVerticalEndIcon, AudioLinesIcon, TerminalIcon, TerminalSquareIcon, BotIcon, BookOpenIcon, Settings2Icon, FrameIcon, PieChartIcon, MapIcon, PencilRuler, LogOut, Settings, ListOrdered, Home } from "lucide-react"

// This is sample data.
const data = {
  user: {
    name: "Admin",
    email:  "admin@example.com",
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
      icon: <ListOrdered />,
      items: [
        {
          title: "Orders",
          url: "/dashboard/orders",
        },
        {
          title: "Payments",
          url: "/dashboard/payments",
        },
        {
          title: "Products",
          url: "/dashboard/products",
        },
        {
          title: "Events",
          url: "/dashboard/events",
        },
        {
          title: "Users",
          url: "/dashboard/users",
        },
        {
          title: "Sellers",
          url: "/dashboard/sellers",
        },
      ],
    },
    {
      title: "Controllers",
      icon: <Settings />,
      items: [
        {
          title: "Loggers",
          url: "/dashboard/loggers",
        },
        {
          title: "Management",
          url: "/dashboard/management",
        },
        {
          title: "Notifications",
          url: "/dashboard/notifications",
        },
      ],
    },
    {
      title: "Customization",
      icon: <PencilRuler />,
      items: [
        {
          title: "All Customization",
          url: "/dashboard/customization",
        },
      ],
    },
    {
      title: "Extras",
      icon: <LogOut />,
      items: [
        {
          title: "Logout",
          url: "/",
        },
      ],
    },
  ],

  projects: [], // optional — you can remove NavProjects if unused
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
