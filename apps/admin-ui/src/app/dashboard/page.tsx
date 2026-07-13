"use client";

import dynamic from "next/dynamic";
import { ArrowUpRight, Clock3, IndianRupee, PackageCheck, ShoppingBag, Store, Users } from "lucide-react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const SalesChart = dynamic(() => import("../../shared/components/charts/sale-chart").then((m) => m.SalesChart), { ssr: false });
const GeographicalMap = dynamic(() => import("../../shared/components/charts/geographicalMap"), { ssr: false });

const metrics = [
  { label: "Gross revenue", value: "₹12.8L", change: "+12.4%", note: "vs last month", icon: IndianRupee, tint: "bg-lime-100 text-lime-700" },
  { label: "Total orders", value: "8,492", change: "+8.2%", note: "1,204 today", icon: ShoppingBag, tint: "bg-amber-100 text-amber-700" },
  { label: "Active sellers", value: "1,248", change: "+5.7%", note: "42 joined this week", icon: Store, tint: "bg-emerald-100 text-emerald-700" },
  { label: "Customers", value: "24.6K", change: "+14.1%", note: "68% returning", icon: Users, tint: "bg-sky-100 text-sky-700" },
];
const devices = [{ name: "Mobile", value: 64 }, { name: "Desktop", value: 26 }, { name: "Tablet", value: 10 }];
const colors = ["#84cc16", "#facc15", "#17320f"];
const orders = [
  { id: "#AT-49021", customer: "Aarav Sharma", seller: "Fresh Basket", amount: "₹2,450", status: "Delivered" },
  { id: "#AT-49020", customer: "Meera Iyer", seller: "Daily Pantry", amount: "₹1,180", status: "Processing" },
  { id: "#AT-49019", customer: "Kabir Singh", seller: "Green Cart", amount: "₹3,420", status: "Delivered" },
  { id: "#AT-49018", customer: "Sara Khan", seller: "Home Harvest", amount: "₹890", status: "Pending" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-7 lg:p-8">
      <section className="overflow-hidden rounded-[28px] bg-[#17320f] p-6 text-white shadow-[0_20px_50px_rgba(23,50,15,.16)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-lime-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-400" /> Live platform overview</span><h1 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-[-.045em] sm:text-4xl">Good morning. Commerce is moving fast.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-white/65">Track marketplace health, spot fulfillment gaps, and keep sellers moving from one clean control room.</p></div>
          <div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white/10 px-4 py-3"><p className="text-[10px] uppercase tracking-wider text-white/50">Live orders</p><p className="mt-1 text-xl font-bold">184</p></div><div className="rounded-2xl bg-[#f8d84a] px-4 py-3 text-[#17320f]"><p className="text-[10px] uppercase tracking-wider opacity-60">Avg. delivery</p><p className="mt-1 text-xl font-bold">18 min</p></div></div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, change, note, icon: Icon, tint }) => <article key={label} className="admin-card p-5"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold text-[#7c846d]">{label}</p><p className="mt-2 text-3xl font-extrabold tracking-[-.04em] text-[#17320f]">{value}</p></div><span className={`grid h-10 w-10 place-items-center rounded-2xl ${tint}`}><Icon size={19} /></span></div><div className="mt-4 flex items-center gap-2 border-t border-[#edf0dc] pt-3 text-[11px]"><span className="flex items-center font-bold text-lime-700">{change}<ArrowUpRight size={12} /></span><span className="text-[#969c88]">{note}</span></div></article>)}</div>

      <div className="grid gap-5 xl:grid-cols-12">
        <section className="admin-card p-5 xl:col-span-8"><PanelTitle title="Revenue performance" subtitle="Marketplace GMV across the last seven months" action="Last 7 months" /><SalesChart /></section>
        <section className="admin-card p-5 xl:col-span-4"><PanelTitle title="Shopping devices" subtitle="How customers access Atlas" /><div className="h-[330px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={devices} dataKey="value" innerRadius={72} outerRadius={104} paddingAngle={5} stroke="none">{devices.map((d, i) => <Cell key={d.name} fill={colors[i]} />)}</Pie><Tooltip contentStyle={{ border: "1px solid #e4e7cf", borderRadius: 14, boxShadow: "0 12px 30px rgba(23,50,15,.1)" }} /><Legend iconType="circle" /></PieChart></ResponsiveContainer></div></section>
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <section className="admin-card overflow-hidden xl:col-span-7"><div className="p-5"><PanelTitle title="Marketplace reach" subtitle="Customers and sellers by region" /></div><div className="px-5 pb-3"><GeographicalMap /></div></section>
        <section className="admin-card overflow-hidden xl:col-span-5"><div className="p-5"><PanelTitle title="Recent orders" subtitle="Latest marketplace transactions" action="View all" /></div><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-[#f7f8ed] text-[10px] uppercase tracking-wider text-[#899078]"><tr>{["Order", "Customer", "Amount", "Status"].map(h => <th key={h} className="px-5 py-3 font-bold">{h}</th>)}</tr></thead><tbody>{orders.map(order => <tr key={order.id} className="border-t border-[#edf0dc] hover:bg-[#fbfced]"><td className="px-5 py-4 font-bold text-[#17320f]">{order.id}</td><td className="px-5 py-4"><p className="font-semibold text-[#35422e]">{order.customer}</p><p className="mt-0.5 text-[10px] text-[#9aa08e]">{order.seller}</p></td><td className="px-5 py-4 font-bold text-[#35422e]">{order.amount}</td><td className="px-5 py-4"><Status value={order.status} /></td></tr>)}</tbody></table></div>
          <div className="m-4 flex items-center gap-2 rounded-2xl bg-[#f7f9e8] px-4 py-3 text-[11px] text-[#707961]"><PackageCheck size={15} className="text-lime-700" /> 96.4% of orders are on track today</div>
        </section>
      </div>
    </div>
  );
}

function PanelTitle({ title, subtitle, action }: { title: string; subtitle: string; action?: string }) { return <div className="mb-2 flex items-start justify-between gap-3"><div><h2 className="text-[15px] font-extrabold tracking-[-.02em] text-[#17320f]">{title}</h2><p className="mt-1 text-[11px] text-[#8c9380]">{subtitle}</p></div>{action && <button className="shrink-0 rounded-xl border border-[#e2e6ca] bg-[#fafbf3] px-3 py-2 text-[10px] font-bold text-[#59644d] hover:border-lime-300">{action}</button>}</div> }
function Status({ value }: { value: string }) { const cls = value === "Delivered" ? "bg-lime-100 text-lime-700" : value === "Processing" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"; return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${cls}`}><Clock3 size={10} />{value}</span> }
