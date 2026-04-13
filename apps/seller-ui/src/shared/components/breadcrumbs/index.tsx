import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

const BreadCrumbs = ({ title }: { title: string }) => {
  return (
    <div className="w-full text-[#17320f] flex items-center">
      <Link href="/dashboard" className="text-[#86b81d] hover:text-[#6a9317] cursor-pointer">
        Dashboard
      </Link>
      <ChevronRight size={20} className="opacity-[.8]" />
      <span>{title}</span>
    </div>
  );
};

export default BreadCrumbs;
