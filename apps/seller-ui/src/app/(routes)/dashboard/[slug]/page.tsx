"use client";

import { useMemo } from "react";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import Link from "next/link";

function prettyTitle(slug: string) {
    return slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function DashboardPlaceholderPage({ params }: { params: { slug: string } }) {
    const title = useMemo(() => prettyTitle(params.slug), [params.slug]);

    return (
        <div className="space-y-6">
            <div className="rounded-[28px] border border-[#e8ebd4] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7c845b]">{title}</p>
                        <h1 className="mt-3 text-3xl font-extrabold text-[#17320f]">{title} section</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5c6445]">This page is a placeholder for the new minimals-style seller interface. You can replace it with your production content.</p>
                    </div>
                    <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full border border-[#dde1bc] px-4 py-2 text-sm font-semibold text-[#17320f] hover:bg-[#f7f8ef]">
                        Back to dashboard
                    </Link>
                </div>
            </div>

            <Card className="rounded-[24px] border border-[#e8ebd4] bg-[#fafbf5] p-6">
                <p className="text-sm text-[#5c6445]">Use this route to build out the exact minimals.cc experience for each section of the seller UI.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                    <Button variant="secondary" className="rounded-full px-4 py-2">Build section</Button>
                    <Button className="rounded-full bg-[#1f3b16] px-4 py-2 text-white hover:bg-[#17320f]">View style guide</Button>
                </div>
            </Card>
        </div>
    );
}
