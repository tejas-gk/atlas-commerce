import axiosInstance from "@/utils/axiosInstance";
import { useQueryClient } from "@tanstack/react-query";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

interface Props {
  title: string;
  icon: React.ReactNode;
  isActive?: boolean;
  href: string;
}

const SidebarItem = ({ icon, title, isActive, href }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logoutHandler = async () => {
    try {
      await axiosInstance.get("/api/logout-seller");
      queryClient.invalidateQueries({ queryKey: ["seller"] });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (title === "Logout") {
      e.preventDefault();
      logoutHandler();
    }
  };

  return (
    <Link href={href} onClick={handleClick} className="block">
      <div
        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
          isActive
            ? "bg-blue-500/10 text-blue-400"
            : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
        }`}
      >
        <span className="flex-shrink-0">{icon}</span>
        <span className={`text-sm font-medium ${
          isActive ? "text-blue-400" : "text-gray-300"
        }`}>{title}</span>
        {isActive && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
        )}
      </div>
    </Link>
  );
};

export default SidebarItem;
