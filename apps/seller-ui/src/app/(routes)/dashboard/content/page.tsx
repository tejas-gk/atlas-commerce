"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  Copy,
  ExternalLink,
  FileText,
  FolderOpen,
  Menu,
  Pencil,
  Plus,
  Search,
  Shapes,
  Trash2,
  Upload,
} from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import useSeller from "@/hooks/useSeller";

type Kind = "Files" | "Metaobjects" | "Blogs" | "Menus";
type LinkItem = { label: string; url: string };
type Resource = {
  id: string;
  kind: Kind;
  title: string;
  updatedAt: string;
  url?: string;
  fileType?: string;
  size?: string;
  status?: string;
  body?: string;
  fields?: string[];
  entries?: Record<string, string>[];
  links?: LinkItem[];
};
const tabs = [
  { kind: "Files" as Kind, icon: FolderOpen },
  { kind: "Metaobjects" as Kind, icon: Shapes },
  { kind: "Blogs" as Kind, icon: BookOpen },
  { kind: "Menus" as Kind, icon: Menu },
];

export default function ContentPage() {
  const { seller } = useSeller();
  const storageKey = `atlas-content-${seller?.activeShopId || "default"}`;
  const [kind, setKind] = useState<Kind>("Files");
  const [items, setItems] = useState<Resource[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Resource | null>(null);
  const [copied, setCopied] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    setItems(raw ? JSON.parse(raw) : starter());
  }, [storageKey]);
  const save = (next: Resource[]) => {
    setItems(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };
  const visible = useMemo(
    () =>
      items.filter(
        (x) =>
          x.kind === kind &&
          x.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [items, kind, query],
  );
  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])];
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      const uploaded: Resource[] = [];
      for (const file of files) {
        const base64 = await readFile(file);
        const { data } = await axiosInstance.post("/seller/api/upload-image", {
          file: base64,
          fileName: file.name,
          folder: `/atlas/content/${seller?.activeShopId || "store"}`,
        });
        uploaded.push({
          id: data.file_id || crypto.randomUUID(),
          kind: "Files",
          title: file.name,
          url: data.url,
          fileType: file.type || "File",
          size: formatSize(file.size),
          updatedAt: new Date().toISOString(),
        });
      }
      save([...uploaded, ...items]);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          "Upload failed. Check the media service and try again.",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };
  const copy = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(""), 1600);
  };
  const upsert = (item: Resource) => {
    save(
      items.some((x) => x.id === item.id)
        ? items.map((x) => (x.id === item.id ? item : x))
        : [item, ...items],
    );
    setEditing(null);
  };

  return (
    <div className="shopify-page">
      <div className="shopify-page-header">
        <div>
          <p className="shopify-eyebrow">Online store</p>
          <h1>Content</h1>
          <p>Manage files and structured storefront content from one place.</p>
        </div>
        {kind === "Files" ? (
          <label
            className={`shopify-primary-button cursor-pointer ${uploading ? "pointer-events-none opacity-60" : ""}`}
          >
            <Upload size={15} />
            {uploading ? "Uploading…" : "Upload files"}
            <input type="file" multiple className="hidden" onChange={upload} />
          </label>
        ) : (
          <button
            className="shopify-primary-button"
            onClick={() => setEditing(blank(kind))}
          >
            <Plus size={15} /> Add {singular(kind)}
          </button>
        )}
      </div>
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-4">
        {tabs.map(({ kind: k, icon: Icon }) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`shopify-card flex items-center gap-3 p-4 text-left ${kind === k ? "ring-2 ring-[#5c6ac4]" : ""}`}
          >
            <Icon
              size={19}
              className={kind === k ? "text-[#5c6ac4]" : "text-[#5c7042]"}
            />
            <div>
              <p className="text-sm font-semibold">{k}</p>
              <p className="text-[10px] text-[#8c9196]">
                {items.filter((x) => x.kind === k).length} items
              </p>
            </div>
          </button>
        ))}
      </div>
      <section className="shopify-card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[#e1e3df] p-4">
          <div>
            <h2 className="text-sm font-bold">{kind}</h2>
            <p className="text-[11px] text-[#8c9196]">{description(kind)}</p>
          </div>
          <label className="relative ml-auto w-64 max-w-[50%]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c9196]"
            />
            <input
              className="shopify-input pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${kind.toLowerCase()}`}
            />
          </label>
        </div>
        {visible.length ? (
          <div className="divide-y divide-[#e1e3df]">
            {visible.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#fafbf7]"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border bg-white text-[#647252]">
                  {kind === "Files" ? (
                    <FileText size={18} />
                  ) : kind === "Blogs" ? (
                    <BookOpen size={18} />
                  ) : kind === "Metaobjects" ? (
                    <Shapes size={18} />
                  ) : (
                    <Menu size={18} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.title}</p>
                  <p className="truncate text-[11px] text-[#8c9196]">
                    {summary(item)}
                  </p>
                </div>
                {item.status && (
                  <span className="shopify-badge hidden sm:inline-flex">
                    {item.status}
                  </span>
                )}
                <span className="hidden text-[11px] text-[#8c9196] md:block">
                  {new Date(item.updatedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                {item.url ? (
                  <>
                    <button
                      title="Copy link"
                      onClick={() => copy(item.url!, item.id)}
                      className="rounded-lg p-2 text-[#6d7175] hover:bg-[#f1f2e9]"
                    >
                      {copied === item.id ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                    <a
                      title="Open file"
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg p-2 text-[#6d7175] hover:bg-[#f1f2e9]"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </>
                ) : (
                  <button
                    title="Edit"
                    onClick={() => setEditing(item)}
                    className="rounded-lg p-2 text-[#6d7175] hover:bg-[#f1f2e9]"
                  >
                    <Pencil size={15} />
                  </button>
                )}
                <button
                  title="Delete"
                  onClick={() => save(items.filter((x) => x.id !== item.id))}
                  className="rounded-lg p-2 text-[#8c9196] hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            kind={kind}
            onAdd={() => kind !== "Files" && setEditing(blank(kind))}
          />
        )}
      </section>
      {editing && (
        <ResourceEditor
          value={editing}
          onClose={() => setEditing(null)}
          onSave={upsert}
        />
      )}
    </div>
  );
}

function ResourceEditor({
  value,
  onClose,
  onSave,
}: {
  value: Resource;
  onClose: () => void;
  onSave: (r: Resource) => void;
}) {
  const [draft, setDraft] = useState(value);
  const set = (key: keyof Resource, v: any) =>
    setDraft({ ...draft, [key]: v, updatedAt: new Date().toISOString() });
  const addField = () => set("fields", [...(draft.fields || []), ""]);
  const addEntry = () =>
    set("entries", [
      ...(draft.entries || []),
      Object.fromEntries((draft.fields || []).map((f) => [f, ""])),
    ]);
  const addLink = () =>
    set("links", [...(draft.links || []), { label: "", url: "" }]);
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#202223]/40 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="border-b p-5">
          <h2 className="font-bold">
            {value.title ? "Edit" : "Add"} {singular(value.kind)}
          </h2>
          <p className="mt-1 text-xs text-[#6d7175]">
            {description(value.kind)}
          </p>
        </div>
        <div className="space-y-5 p-5">
          <Field
            label="Name"
            value={draft.title}
            onChange={(v) => set("title", v)}
          />
          {draft.kind === "Blogs" && (
            <>
              <label className="block text-xs font-semibold">
                Status
                <select
                  className="shopify-input mt-1.5"
                  value={draft.status}
                  onChange={(e) => set("status", e.target.value)}
                >
                  <option>Draft</option>
                  <option>Published</option>
                </select>
              </label>
              <label className="block text-xs font-semibold">
                Article body
                <textarea
                  className="mt-1.5 min-h-48 w-full rounded-lg border border-[#c9cccf] p-3 text-sm outline-none focus:border-[#5c6ac4]"
                  value={draft.body}
                  onChange={(e) => set("body", e.target.value)}
                  placeholder="Write your article…"
                />
              </label>
            </>
          )}
          {draft.kind === "Metaobjects" && (
            <>
              <EditorHeading
                title="Fields"
                action="Add field"
                onClick={addField}
              />
              {(draft.fields || []).map((f, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="shopify-input"
                    value={f}
                    onChange={(e) =>
                      set(
                        "fields",
                        draft.fields!.map((x, n) =>
                          n === i ? e.target.value : x,
                        ),
                      )
                    }
                  />
                  <button
                    onClick={() =>
                      set(
                        "fields",
                        draft.fields!.filter((_, n) => n !== i),
                      )
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <EditorHeading
                title={`Entries (${draft.entries?.length || 0})`}
                action="Add entry"
                onClick={addEntry}
              />
              {(draft.entries || []).map((entry, i) => (
                <div key={i} className="rounded-xl border bg-[#fafbf7] p-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(draft.fields || []).map((field) => (
                      <Field
                        key={field}
                        label={field || "Untitled field"}
                        value={entry[field] || ""}
                        onChange={(v) =>
                          set(
                            "entries",
                            draft.entries!.map((x, n) =>
                              n === i ? { ...x, [field]: v } : x,
                            ),
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
          {draft.kind === "Menus" && (
            <>
              <EditorHeading
                title="Menu items"
                action="Add menu item"
                onClick={addLink}
              />
              {(draft.links || []).map((link, i) => (
                <div key={i} className="grid grid-cols-[1fr_1.4fr_auto] gap-2">
                  <input
                    className="shopify-input"
                    placeholder="Label"
                    value={link.label}
                    onChange={(e) =>
                      set(
                        "links",
                        draft.links!.map((x, n) =>
                          n === i ? { ...x, label: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <input
                    className="shopify-input"
                    placeholder="/collections/all"
                    value={link.url}
                    onChange={(e) =>
                      set(
                        "links",
                        draft.links!.map((x, n) =>
                          n === i ? { ...x, url: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <button
                    onClick={() =>
                      set(
                        "links",
                        draft.links!.filter((_, n) => n !== i),
                      )
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
        <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-white p-4">
          <button className="shopify-secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button
            disabled={!draft.title.trim()}
            className="shopify-primary-button disabled:opacity-40"
            onClick={() => onSave(draft)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-xs font-semibold">
      {label}
      <input
        className="shopify-input mt-1.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
function EditorHeading({
  title,
  action,
  onClick,
}: {
  title: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b pb-2">
      <h3 className="text-xs font-bold">{title}</h3>
      <button
        className="text-xs font-semibold text-[#4f5ab7]"
        onClick={onClick}
      >
        + {action}
      </button>
    </div>
  );
}
function Empty({ kind, onAdd }: { kind: Kind; onAdd: () => void }) {
  return (
    <div className="grid min-h-64 place-items-center p-8 text-center">
      <div>
        <FolderOpen className="mx-auto text-[#8c9196]" />
        <h3 className="mt-3 text-sm font-bold">No {kind.toLowerCase()} yet</h3>
        <p className="mt-1 text-xs text-[#8c9196]">{description(kind)}</p>
        {kind !== "Files" && (
          <button className="shopify-secondary-button mt-4" onClick={onAdd}>
            <Plus size={14} />
            Add {singular(kind)}
          </button>
        )}
      </div>
    </div>
  );
}
function blank(kind: Kind): Resource {
  return {
    id: crypto.randomUUID(),
    kind,
    title: "",
    updatedAt: new Date().toISOString(),
    status: kind === "Blogs" ? "Draft" : undefined,
    body: kind === "Blogs" ? "" : undefined,
    fields: kind === "Metaobjects" ? ["Title"] : undefined,
    entries: kind === "Metaobjects" ? [] : undefined,
    links: kind === "Menus" ? [] : undefined,
  };
}
function starter(): Resource[] {
  return [
    {
      ...blank("Metaobjects"),
      id: "meta-products",
      title: "Product highlights",
      fields: ["Title", "Description"],
      entries: [],
    },
    {
      ...blank("Blogs"),
      id: "blog-journal",
      title: "Store journal",
      status: "Draft",
    },
    {
      ...blank("Menus"),
      id: "menu-main",
      title: "Main menu",
      links: [
        { label: "Home", url: "/" },
        { label: "Catalog", url: "/products" },
      ],
    },
  ];
}
function singular(kind: Kind) {
  return kind === "Metaobjects"
    ? "metaobject"
    : kind.slice(0, -1).toLowerCase();
}
function description(kind: Kind) {
  return kind === "Files"
    ? "Upload, open, and copy permanent media links."
    : kind === "Metaobjects"
      ? "Define reusable fields and manage structured entries."
      : kind === "Blogs"
        ? "Create, edit, and publish storefront articles."
        : "Build the navigation menus used by your storefront.";
}
function summary(r: Resource) {
  return r.kind === "Files"
    ? `${r.fileType || "File"} · ${r.size || ""}`
    : r.kind === "Blogs"
      ? `${r.status || "Draft"} · ${(r.body || "").length} characters`
      : r.kind === "Metaobjects"
        ? `${r.fields?.length || 0} fields · ${r.entries?.length || 0} entries`
        : `${r.links?.length || 0} menu items`;
}
function formatSize(n: number) {
  return n < 1048576
    ? `${Math.max(1, Math.round(n / 1024))} KB`
    : `${(n / 1048576).toFixed(1)} MB`;
}
function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
