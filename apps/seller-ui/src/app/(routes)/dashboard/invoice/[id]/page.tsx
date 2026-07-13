import Link from "next/link";

interface InvoiceDetailPageProps {
    params: { id: string };
}

const lineItems = [
    { title: "Urban Explorer Sneakers", description: "Casual streetwear with a modern edge.", quantity: 5, price: 83.74, total: 417.00 },
    { title: "Classic Leather Loafers", description: "Premium leather shoes with a polished finish.", quantity: 10, price: 97.14, total: 971.40 },
    { title: "Mountain Trekking Boots", description: "All-terrain boots built for comfort and traction.", quantity: 7, price: 68.71, total: 480.97 },
];

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const shipping = 52.17;
    const discount = 85.21;
    const taxes = 68.71;
    const total = subtotal + shipping - discount + taxes;

    return (
        <div className="space-y-6">
            <div className="rounded-[28px] border border-[#e8ebd4] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7c845b]">Invoice</p>
                        <h1 className="mt-3 text-3xl font-extrabold text-[#17320f]">Edit invoice {params.id}</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5c6445]">Review invoice details, shipping, and totals before saving or sending to your customer.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button className="rounded-full bg-[#1f3b16] px-4 py-2 text-white hover:bg-[#17320f]">Save as draft</Button>
                        <Button className="rounded-full bg-[#17320f] px-4 py-2 text-white hover:bg-[#112a0f]">Update & send</Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
                <section className="rounded-[28px] border border-[#e8ebd4] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-3xl border border-[#dde1bc] bg-[#fbfbf5] p-5">
                            <h2 className="text-sm font-semibold text-[#17320f]">From</h2>
                            <p className="mt-3 text-sm text-[#5c6445]">Lucian Obrien</p>
                            <p className="text-sm text-[#5c6445]">1147 Rohan Drive Suite 819</p>
                            <p className="text-sm text-[#5c6445]">Burlington, VT / 82021</p>
                            <p className="mt-2 text-sm text-[#5c6445]">+1 416-555-0198</p>
                        </div>
                        <div className="rounded-3xl border border-[#dde1bc] bg-[#fbfbf5] p-5">
                            <h2 className="text-sm font-semibold text-[#17320f]">To</h2>
                            <p className="mt-3 text-sm text-[#5c6445]">Deja Brady</p>
                            <p className="text-sm text-[#5c6445]">18865 Thompson Circle Apt. 086</p>
                            <p className="text-sm text-[#5c6445]">Idaho Falls, WV / 50357</p>
                            <p className="mt-2 text-sm text-[#5c6445]">+44 20 7946 0958</p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-3xl border border-[#dde1bc] bg-[#fffdfa] p-5">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-[#7c845b]">Invoice number</p>
                            <p className="mt-2 text-lg font-semibold text-[#17320f]">{params.id}</p>
                        </div>
                        <div className="rounded-3xl border border-[#dde1bc] bg-[#fffdfa] p-5">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-[#7c845b]">Status</p>
                            <p className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">Paid</p>
                        </div>
                        <div className="rounded-3xl border border-[#dde1bc] bg-[#fffdfa] p-5">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-[#7c845b]">Due date</p>
                            <p className="mt-2 text-lg font-semibold text-[#17320f]">06/22/2026</p>
                        </div>
                    </div>

                    <div className="mt-8 overflow-hidden rounded-[24px] border border-[#f1f2dc] bg-[#fbfbf5]">
                        <div className="grid gap-4 p-5 text-sm font-semibold text-[#5a6244] sm:grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr]">
                            <span>Title</span>
                            <span>Service</span>
                            <span>Quantity</span>
                            <span className="text-right">Price</span>
                        </div>
                        <div className="divide-y divide-[#eef0dc] p-5">
                            {lineItems.map((item) => (
                                <div key={item.title} className="grid gap-4 text-sm sm:grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr]">
                                    <div>
                                        <p className="font-semibold text-[#17320f]">{item.title}</p>
                                        <p className="mt-1 text-sm text-[#5a6344]">{item.description}</p>
                                    </div>
                                    <p className="text-sm text-[#5a6344]">Design</p>
                                    <p className="text-sm text-[#5a6344]">{item.quantity}</p>
                                    <p className="text-right text-sm text-[#17320f]">{formatCurrency(item.total)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <aside className="rounded-[28px] border border-[#e8ebd4] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                    <div className="space-y-4">
                        <div className="rounded-[24px] border border-[#f1f2dc] bg-[#fbfbf5] p-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-[#17320f]">Subtotal</p>
                                    <p className="mt-2 text-lg font-semibold text-[#111]">{formatCurrency(subtotal)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-[24px] border border-[#f1f2dc] bg-[#fbfbf5] p-5">
                            <div className="grid gap-4">
                                <div className="flex items-center justify-between text-sm text-[#5a6344]">
                                    <span>Shipping</span>
                                    <span>{formatCurrency(shipping)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-[#5a6344]">
                                    <span>Discount</span>
                                    <span className="text-red-600">-{formatCurrency(discount)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-[#5a6344]">
                                    <span>Taxes</span>
                                    <span>{formatCurrency(taxes)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-[24px] border border-[#dde1bc] bg-[#ffffff] p-5">
                            <div className="flex items-center justify-between text-sm text-[#5a6344]">
                                <span className="font-semibold text-[#17320f]">Total</span>
                                <span className="text-lg font-semibold text-[#17320f]">{formatCurrency(total)}</span>
                            </div>
                        </div>
                        <Link href="/dashboard/invoice" className="inline-flex w-full items-center justify-center rounded-full border border-[#dde1bc] bg-[#fffdfa] px-4 py-2 text-sm font-semibold text-[#17320f] transition-colors hover:bg-[#f7f8ef]">
                            Back to invoices
                        </Link>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return <button {...props} className={`${className || ""}`} />;
}
