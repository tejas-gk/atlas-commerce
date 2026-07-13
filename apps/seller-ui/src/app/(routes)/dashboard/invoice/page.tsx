"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from "@tanstack/react-table";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

const INVOICES = [
    { id: "INV-19919", customer: "Amiah Pruitt", createdAt: "18 May 2026", dueAt: "11 Jul 2026", amount: "$2,331.63", sent: 9, status: "Paid" },
    { id: "INV-19918", customer: "Ariana Lang", createdAt: "19 May 2026", dueAt: "10 Jul 2026", amount: "$2,372.93", sent: 4, status: "Overdue" },
    { id: "INV-19917", customer: "Lawson Bass", createdAt: "20 May 2026", dueAt: "09 Jul 2026", amount: "$2,283.97", sent: 9, status: "Paid" },
    { id: "INV-19916", customer: "Selina Boyer", createdAt: "21 May 2026", dueAt: "08 Jul 2026", amount: "$2,251.84", sent: 8, status: "Pending" },
    { id: "INV-19915", customer: "Angelique Morse", createdAt: "22 May 2026", dueAt: "07 Jul 2026", amount: "$2,343.51", sent: 11, status: "Paid" },
];

const FILTER_OPTIONS = ["All", "Paid", "Pending", "Overdue", "Draft"];

const STATUS_STYLE: Record<string, string> = {
    Paid: "bg-emerald-50 text-emerald-700",
    Pending: "bg-amber-50 text-amber-700",
    Overdue: "bg-red-50 text-red-700",
    Draft: "bg-slate-50 text-slate-700",
};

const columns: ColumnDef<typeof INVOICES[0]>[] = [
    {
        accessorKey: "customer",
        header: "Customer",
        cell: ({ row }) => (
            <div className="min-w-0">
                <p className="text-sm font-medium text-[#111]">{row.original.customer}</p>
                <p className="text-xs text-muted-foreground">{row.original.id}</p>
            </div>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Create",
        cell: ({ getValue }) => <span className="text-sm text-[#444]">{getValue<string>()}</span>,
    },
    {
        accessorKey: "dueAt",
        header: "Due",
        cell: ({ getValue }) => <span className="text-sm text-[#444]">{getValue<string>()}</span>,
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }) => <span className="font-semibold text-[#111]">{getValue<string>()}</span>,
    },
    {
        accessorKey: "sent",
        header: "Sent",
        cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue<number>()}</span>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
            const value = getValue<string>();
            return <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_STYLE[value] ?? "bg-slate-50 text-slate-700"}`}>{value}</span>;
        },
    },
    {
        id: "actions",
        header: "",
        cell: ({ row }) => (
            <Link href={`/dashboard/invoice/${row.original.id}`} className="rounded-full px-3 py-1.5 text-sm font-semibold text-[#1f3b16] hover:bg-[#f7f9ef] transition-colors">
                View
            </Link>
        ),
    },
];

export default function InvoicePage() {
    const [activeFilter, setActiveFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [service, setService] = useState("All services");
    const [startDate, setStartDate] = useState("2026-05-18");
    const [endDate, setEndDate] = useState("2026-07-22");

    const filteredInvoices = useMemo(() => {
        return INVOICES.filter((invoice) => {
            const matchesStatus = activeFilter === "All" || invoice.status === activeFilter;
            const matchesService = service === "All services" || invoice.customer.includes(service);
            const matchesSearch = invoice.customer.toLowerCase().includes(search.toLowerCase()) || invoice.id.toLowerCase().includes(search.toLowerCase());
            return matchesStatus && matchesService && matchesSearch;
        });
    }, [activeFilter, search, service]);

    const table = useReactTable({
        data: filteredInvoices,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="space-y-6">
            <section className="rounded-[28px] border border-[#e8ebd4] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-2xl">
                        <span className="inline-flex rounded-full border border-[#dde1bc] bg-[#f6f7e8] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b734d]">
                            Invoice summary
                        </span>
                        <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-[#17320f]">Invoice management</h1>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-[#5c6445]">
                            Manage every invoice from your seller dashboard with filters, summaries, and quick access to invoice drafts.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button className="rounded-full bg-[#1f3b16] px-4 py-2 text-white hover:bg-[#17320f]">New invoice</Button>
                        <Button variant="outline" className="rounded-full px-4 py-2">Export</Button>
                    </div>
                </div>
            </section>

            <div className="grid gap-4 xl:grid-cols-5">
                {[
                    { label: "Total", value: "20 invoices", description: "$46,218.04" },
                    { label: "Paid", value: "10 invoices", description: "$23,110.23" },
                    { label: "Pending", value: "6 invoices", description: "$13,825.05" },
                    { label: "Overdue", value: "2 invoices", description: "$4,655.63" },
                    { label: "Draft", value: "2 invoices", description: "$4,627.13" },
                ].map((card) => (
                    <div key={card.label} className="rounded-[24px] border border-[#e8ebd4] bg-white p-5 shadow-[0_10px_28px_rgba(0,0,0,0.05)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7c845b]">{card.label}</p>
                        <p className="mt-3 text-lg font-semibold text-[#17320f]">{card.value}</p>
                        <p className="mt-1 text-sm text-[#5e664a]">{card.description}</p>
                    </div>
                ))}
            </div>

            <section className="rounded-[28px] border border-[#e8ebd4] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 rounded-2xl border border-[#dde1bc] bg-[#fbfbf5] px-3 py-2">
                            <span className="text-sm font-semibold text-[#17320f]">Service</span>
                            <select value={service} onChange={(event) => setService(event.target.value)} className="rounded-full border-none bg-transparent px-2 text-sm text-[#17320f] outline-none">
                                <option>All services</option>
                                <option>Service</option>
                                <option>Design</option>
                                <option>Marketing</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 rounded-2xl border border-[#dde1bc] bg-[#fbfbf5] px-3 py-2">
                            <span className="text-sm text-[#5b623e]">Start</span>
                            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="rounded-full border-none bg-transparent text-sm text-[#17320f] outline-none" />
                        </div>
                        <div className="flex items-center gap-2 rounded-2xl border border-[#dde1bc] bg-[#fbfbf5] px-3 py-2">
                            <span className="text-sm text-[#5b623e]">End</span>
                            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="rounded-full border-none bg-transparent text-sm text-[#17320f] outline-none" />
                        </div>
                    </div>
                    <div className="flex flex-1 min-w-0 items-center gap-3 rounded-full border border-[#dde1bc] bg-[#f8f9ee] px-3 py-2 shadow-sm">
                        <Search size={16} className="text-[#7c8966]" />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search customer or invoice number..."
                            className="min-w-0 flex-1 bg-transparent text-sm text-[#17320f] outline-none"
                        />
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2 text-sm text-[#5a6344]">
                        <span className="rounded-full bg-[#eef0dc] px-3 py-1">All</span>
                        <span className="rounded-full bg-[#f5f6e8] px-3 py-1">Paid</span>
                        <span className="rounded-full bg-[#f5f6e8] px-3 py-1">Pending</span>
                        <span className="rounded-full bg-[#f5f6e8] px-3 py-1">Overdue</span>
                        <span className="rounded-full bg-[#f5f6e8] px-3 py-1">Draft</span>
                    </div>
                    <div className="rounded-2xl border border-[#dde1bc] bg-[#f8f9ee] px-4 py-2 text-sm text-[#5a6344]">Rows per page: 5</div>
                </div>

                <div className="mt-6 overflow-hidden rounded-[24px] border border-[#f1f2dc]">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-[#fbfbf5] text-[11px] uppercase tracking-[0.14em] text-[#7f8563]">
                            {table.getHeaderGroups().map((group) => (
                                <tr key={group.id}>
                                    {group.headers.map((header) => (
                                        <th key={header.id} className="px-4 py-4">{flexRender(header.column.columnDef.header, header.getContext())}</th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-[#f1f2dc] bg-white">
                            {table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="hover:bg-[#f9f9ef] transition-colors">
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-4 py-4 align-top">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 text-sm text-[#5a6344]">
                    <div>Showing 1–{filteredInvoices.length} of {INVOICES.length} invoices</div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="rounded-full px-3 py-2"><ChevronLeft size={16} /></Button>
                        <Button variant="outline" className="rounded-full px-3 py-2"><ChevronRight size={16} /></Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
