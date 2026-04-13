"use client";

import React, { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";
import { X, Globe } from "lucide-react";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const VISITORS = [
    { name: "United States of America", label: "United States", users: 12400, pct: 32, coords: [-100, 40] as [number, number] },
    { name: "India",                    label: "India",          users: 9800,  pct: 25, coords: [78,   22] as [number, number] },
    { name: "United Kingdom",           label: "United Kingdom", users: 5200,  pct: 14, coords: [-2,   54] as [number, number] },
    { name: "Germany",                  label: "Germany",        users: 3700,  pct: 10, coords: [10,   51] as [number, number] },
    { name: "Canada",                   label: "Canada",         users: 2600,  pct: 7,  coords: [-96,  60] as [number, number] },
    { name: "Australia",                label: "Australia",      users: 1900,  pct: 5,  coords: [135, -25] as [number, number] },
    { name: "France",                   label: "France",         users: 1400,  pct: 4,  coords: [2,    46] as [number, number] },
    { name: "Brazil",                   label: "Brazil",         users: 1100,  pct: 3,  coords: [-51, -10] as [number, number] },
];

const MAX = Math.max(...VISITORS.map((c) => c.users));

function mapFill(name: string, isSelected: boolean) {
    if (isSelected) return "#f59e0b";
    const c = VISITORS.find((d) => d.name === name);
    if (!c) return "#dde2c5";
    const r = c.users / MAX;
    if (r > 0.8)  return "#1a5208";
    if (r > 0.55) return "#2e7a10";
    if (r > 0.35) return "#52a824";
    if (r > 0.15) return "#86c840";
    return "#b8df78";
}

type Country = typeof VISITORS[0];

const GeographicalMap: React.FC = () => {
    const [hovered, setHovered]   = useState<Country | null>(null);
    const [pos,     setPos]       = useState({ x: 0, y: 0 });
    const [selected, setSelected] = useState<Country | null>(null);

    const toggle = (c: Country) => setSelected((prev) => (prev?.name === c.name ? null : c));

    return (
        <div className="w-full">
            {/* ── Map ── */}
            <div
                className="relative w-full overflow-hidden rounded-2xl"
                style={{ background: "linear-gradient(155deg, #eef3e2 0%, #e3ead0 100%)" }}
            >
                {/* Dot ocean texture */}
                <svg
                    className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.045]"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <pattern id="mapdots" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                            <circle cx="1.5" cy="1.5" r="1.5" fill="#17320f" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#mapdots)" />
                </svg>

                <ComposableMap
                    projection="geoEqualEarth"
                    projectionConfig={{ scale: 160, center: [10, 0] }}
                    width={800}
                    height={400}
                    style={{ width: "100%", height: "auto", display: "block" }}
                >
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                const name: string = geo.properties.name;
                                const match = VISITORS.find((c) => c.name === name);
                                const isSel = selected?.name === name;
                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        onMouseEnter={(e) => {
                                            if (match) { setPos({ x: e.pageX, y: e.pageY }); setHovered(match); }
                                        }}
                                        onMouseMove={(e) => { if (match) setPos({ x: e.pageX, y: e.pageY }); }}
                                        onMouseLeave={() => setHovered(null)}
                                        onClick={() => match && toggle(match)}
                                        fill={mapFill(name, isSel)}
                                        stroke={isSel ? "#d97706" : "#c5cba8"}
                                        strokeWidth={isSel ? 0.8 : 0.35}
                                        style={{
                                            default: { outline: "none", transition: "fill 0.15s ease" },
                                            hover:   { fill: match ? "#f59e0b" : "#c0c8a5", outline: "none", cursor: match ? "pointer" : "default" },
                                            pressed: { outline: "none" },
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>

                    {/* Pin markers for tracked countries */}
                    {VISITORS.map((v) => {
                        const isSel = selected?.name === v.name;
                        const r = v.users === MAX ? 5 : v.users > 5000 ? 4 : 3;
                        return (
                            <Marker key={v.name} coordinates={v.coords}>
                                <circle
                                    r={r + 2.5}
                                    fill="#17320f"
                                    fillOpacity={0.1}
                                    stroke="none"
                                />
                                <circle
                                    r={r}
                                    fill={isSel ? "#f59e0b" : "#17320f"}
                                    stroke="#fffef8"
                                    strokeWidth={1.5}
                                    style={{ cursor: "pointer", transition: "fill 0.15s ease" }}
                                    onMouseEnter={(e) => { setPos({ x: e.pageX, y: e.pageY }); setHovered(v); }}
                                    onMouseLeave={() => setHovered(null)}
                                    onClick={() => toggle(v)}
                                />
                            </Marker>
                        );
                    })}
                </ComposableMap>

                {/* Gradient legend */}
                <div className="absolute bottom-3 right-4 flex items-center gap-2">
                    <span className="text-[10px] font-medium text-[#6b7c52]">Low</span>
                    <div className="h-2 w-24 rounded-full" style={{ background: "linear-gradient(to right, #b8df78, #1a5208)" }} />
                    <span className="text-[10px] font-medium text-[#6b7c52]">High</span>
                </div>

                {/* Active regions badge */}
                <div className="absolute left-4 bottom-3 rounded-full border border-[#d0d8b4] bg-white/65 px-2.5 py-1 backdrop-blur-sm">
                    <p className="text-[10px] font-semibold text-[#17320f]">{VISITORS.length} tracked regions · click to explore</p>
                </div>
            </div>

            {/* ── Selected country panel ── */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden rounded-2xl border border-[#dde5be] bg-gradient-to-r from-[#f7fbe8] to-[#f2f8e0]"
                    >
                        <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#17320f] text-white">
                                    <Globe size={15} />
                                </div>
                                <div>
                                    <p className="text-[13px] font-bold text-[#17320f]">{selected.label}</p>
                                    <p className="text-[11px] text-muted-foreground">{selected.pct}% of total traffic</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-[10px] text-muted-foreground">Monthly visitors</p>
                                    <p className="text-[15px] font-bold text-[#17320f]">{selected.users.toLocaleString()}</p>
                                </div>
                                <div className="flex h-5 w-32 overflow-hidden rounded-full bg-[#e4ead0]">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${Math.min(selected.pct * 3, 100)}%`,
                                            background: "linear-gradient(to right, #86b81d, #1a5208)",
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e4ead0] text-[#6b7c52] hover:bg-[#d8e0bc] transition-colors"
                                >
                                    <X size={11} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Country breakdown rows ── */}
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5">
                {VISITORS.slice(0, 6).map((c, i) => (
                    <button
                        key={c.name}
                        onClick={() => toggle(c)}
                        className={`flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors ${
                            selected?.name === c.name
                                ? "bg-[#edf3d6] ring-1 ring-[#c8d89e]"
                                : "hover:bg-[#f4f7ec]"
                        }`}
                    >
                        <span className="w-3.5 shrink-0 text-[10px] font-bold text-muted-foreground/40">{i + 1}</span>
                        <p className="w-[86px] shrink-0 truncate text-[11px] text-muted-foreground">{c.label}</p>
                        <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-[#eef1e2]">
                            <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                    width: `${c.pct}%`,
                                    background: "linear-gradient(to right, #86b81d, #1a5208)",
                                }}
                            />
                        </div>
                        <p className="w-7 shrink-0 text-right text-[11px] font-semibold text-[#17320f]">{c.pct}%</p>
                    </button>
                ))}
            </div>

            {/* ── Hover tooltip ── */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        key={hovered.name}
                        initial={{ opacity: 0, y: 5, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.97 }}
                        transition={{ duration: 0.1, ease: "easeOut" }}
                        className="fixed pointer-events-none z-[9999] min-w-[148px] rounded-2xl border border-[#dfe5be] bg-[#fffdf4] px-3.5 py-2.5 shadow-[0_6px_24px_rgba(0,0,0,0.12)]"
                        style={{ top: pos.y - 75, left: pos.x + 16 }}
                    >
                        <p className="text-[12px] font-bold text-[#17320f]">{hovered.label}</p>
                        <div className="mt-1 space-y-0.5">
                            <p className="text-[11px] text-muted-foreground">
                                <span className="font-semibold text-[#17320f]">{hovered.users.toLocaleString()}</span> visitors / mo
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                <span className="font-semibold text-[#86b81d]">{hovered.pct}%</span> of traffic
                            </p>
                        </div>
                        <p className="mt-1.5 text-[10px] text-muted-foreground/50">Click to pin details</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GeographicalMap;

