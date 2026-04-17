"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Pencil, CalendarDays, ArrowRight, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import useSeller from "@/hooks/useSeller";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";

type EventDraft = {
  title: string;
  sale_price: string;
  stock: string;
  short_description: string;
  starting_date: string;
  ending_date: string;
};

const fetchEvents = async () => {
  const res = await axiosInstance.get("/product/api/get-shop-products");
  return res.data.products?.filter((item: any) => item.starting_date) ?? [];
};

const formatMoney = (value: any) => {
  const numberValue = Number(value ?? 0);
  return Number.isNaN(numberValue) ? "0.00" : numberValue.toFixed(2);
};

const toDateInputValue = (value: string | null | undefined) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const EditEventPage = () => {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const { seller } = useSeller();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["shop-events", seller?.activeShopId],
    queryFn: fetchEvents,
    staleTime: 1000 * 60 * 5,
    enabled: !!seller?.activeShopId,
  });

  const selectedEvent = useMemo(
    () => events.find((item: any) => item.id === productId),
    [events, productId]
  );

  const [draft, setDraft] = useState<EventDraft>({
    title: "",
    sale_price: "",
    stock: "",
    short_description: "",
    starting_date: "",
    ending_date: "",
  });

  useEffect(() => {
    if (!selectedEvent) return;

    setDraft({
      title: selectedEvent.title ?? "",
      sale_price: String(selectedEvent.sale_price ?? ""),
      stock: String(selectedEvent.stock ?? ""),
      short_description: selectedEvent.short_description ?? "",
      starting_date: toDateInputValue(selectedEvent.starting_date),
      ending_date: toDateInputValue(selectedEvent.ending_date),
    });
  }, [selectedEvent]);

  const onSaveDraft = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.info("Event update API is not available yet. The edit page and routing are now ready.");
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="seller-page-header">
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-0.05em] text-[#17320f]">Edit Event</h1>
          <BreadCrumbs title="Edit Event" />
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-10 rounded-2xl border-[#dde1bc] bg-white px-4 text-[#556244] hover:bg-[#f6f8e8] hover:text-[#17320f]"
        >
          <Link href="/dashboard/all-events">Back to All Events</Link>
        </Button>
      </div>

      {isLoading ? (
        <Card className="seller-panel rounded-[30px] border-0 p-10">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-[#86b81d]/30 border-t-[#86b81d] animate-spin" />
          </div>
        </Card>
      ) : !selectedEvent ? (
        <Card className="seller-panel rounded-[30px] border-0 p-8">
          <div className="flex flex-col gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0f4d8] text-[#6a9317]">
              <Pencil size={20} />
            </div>
            <h2 className="text-xl font-bold text-[#17320f]">Choose An Event To Edit</h2>
            <p className="max-w-2xl text-sm text-[#556244]">
              Open an event from the All Events table using the Edit Event button, or pick one from this list.
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {events.slice(0, 9).map((event: any) => (
              <div key={event.id} className="rounded-2xl border border-[#e3e7c7] bg-white p-3">
                <p className="truncate text-sm font-semibold text-[#17320f]">{event.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground/70">{event.category || "Uncategorized"}</p>
                <p className="mt-2 text-xs text-[#556244]">${formatMoney(event.sale_price)} • Stock {event.stock ?? 0}</p>
                <Button asChild size="sm" className="mt-3 h-8 rounded-xl bg-[#86b81d] px-3 text-xs font-semibold text-white hover:bg-[#77a51b] hover:text-white">
                  <Link href={`/dashboard/edit-event?productId=${event.id}`}>
                    Edit Event
                    <ArrowRight size={12} />
                  </Link>
                </Button>
              </div>
            ))}
          </div>

          {events.length === 0 && (
            <p className="mt-6 text-sm text-muted-foreground/70">No events found for this shop yet.</p>
          )}
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="seller-panel rounded-[30px] border-0 p-5">
            <form className="space-y-4" onSubmit={onSaveDraft}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">Event Title</p>
                  <Input
                    value={draft.title}
                    onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                    className="h-10 rounded-2xl border-[#dde1bc] bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">Event Price</p>
                  <Input
                    type="number"
                    value={draft.sale_price}
                    onChange={(event) => setDraft((prev) => ({ ...prev, sale_price: event.target.value }))}
                    className="h-10 rounded-2xl border-[#dde1bc] bg-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">Stock</p>
                  <Input
                    type="number"
                    value={draft.stock}
                    onChange={(event) => setDraft((prev) => ({ ...prev, stock: event.target.value }))}
                    className="h-10 rounded-2xl border-[#dde1bc] bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">Start Date</p>
                  <Input
                    type="date"
                    value={draft.starting_date}
                    onChange={(event) => setDraft((prev) => ({ ...prev, starting_date: event.target.value }))}
                    className="h-10 rounded-2xl border-[#dde1bc] bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">End Date</p>
                  <Input
                    type="date"
                    value={draft.ending_date}
                    onChange={(event) => setDraft((prev) => ({ ...prev, ending_date: event.target.value }))}
                    className="h-10 rounded-2xl border-[#dde1bc] bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">Short Description</p>
                <Textarea
                  rows={6}
                  value={draft.short_description}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, short_description: event.target.value }))
                  }
                  className="resize-none rounded-[20px] border-[#dde1bc] bg-white"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <p className="text-xs text-muted-foreground/70">
                  This UI is ready. Connect your update-event endpoint to persist edits.
                </p>
                <Button type="submit" className="h-10 rounded-2xl bg-[#86b81d] px-4 text-white hover:bg-[#77a51b]">
                  Save Event Changes
                </Button>
              </div>
            </form>
          </Card>

          <Card className="seller-panel rounded-[30px] border-0 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">Selected Event</p>
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-[#e3e7c7] bg-white">
                  {selectedEvent.images?.[0]?.url ? (
                    <img src={selectedEvent.images[0].url} alt={selectedEvent.title} className="h-full w-full object-cover" />
                  ) : (
                    <CalendarDays size={18} className="text-muted-foreground/40" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#17320f]">{selectedEvent.title}</p>
                  <p className="text-xs text-muted-foreground/70">{selectedEvent.category || "Uncategorized"}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#e3e7c7] bg-white p-3 text-sm text-[#556244]">
                <p>Slug: {selectedEvent.slug || "-"}</p>
                <p className="mt-1">Price: ${formatMoney(selectedEvent.sale_price)}</p>
                <p className="mt-1">Stock: {selectedEvent.stock ?? 0}</p>
                <p className="mt-1">Window: {toDateInputValue(selectedEvent.starting_date) || "-"} to {toDateInputValue(selectedEvent.ending_date) || "-"}</p>
              </div>

              <Button
                asChild
                variant="outline"
                className="h-9 w-full rounded-xl border-[#dde1bc] bg-white text-[#556244] hover:bg-[#f6f8e8] hover:text-[#17320f]"
              >
                <Link href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${selectedEvent.slug}`} target="_blank">
                  View Event On Storefront
                  <ExternalLink size={13} />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EditEventPage;
