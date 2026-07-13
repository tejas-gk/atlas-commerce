"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ShieldCheck, Trash2, Users } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import useSeller from "@/hooks/useSeller";

type Member = {
  id: string;
  role: "owner" | "manager" | "staff";
  user: { id: string; name: string; email: string };
};
export default function TeamPage() {
  const { seller } = useSeller(),
    qc = useQueryClient();
  const shopId = seller?.activeShopId || seller?.shop?.id;
  const [open, setOpen] = useState(false),
    [email, setEmail] = useState(""),
    [role, setRole] = useState("staff"),
    [error, setError] = useState("");
  const members = useQuery({
    queryKey: ["shop-members", shopId],
    enabled: !!shopId,
    queryFn: async () => {
      const { data } = await axiosInstance.get("/seller/api/shop-members", {
        params: { shopId },
      });
      return data.members as Member[];
    },
  });
  const add = useMutation({
    mutationFn: () =>
      axiosInstance.post("/seller/api/shop-members", { shopId, email, role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shop-members", shopId] });
      setOpen(false);
      setEmail("");
      setError("");
    },
    onError: (e: any) =>
      setError(
        e?.response?.data?.message ||
          "Could not add this user. They must already have an Atlas account.",
      ),
  });
  const remove = useMutation({
    mutationFn: (memberId: string) =>
      axiosInstance.delete("/seller/api/shop-members", {
        data: { shopId, memberId },
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["shop-members", shopId] }),
  });
  return (
    <div className="shopify-page">
      <div className="shopify-page-header">
        <div>
          <p className="shopify-eyebrow">Settings</p>
          <h1>Users and permissions</h1>
          <p>Give your team access to manage this store.</p>
        </div>
        <button
          className="shopify-primary-button"
          onClick={() => setOpen(true)}
        >
          <Plus size={15} />
          Add user
        </button>
      </div>
      <section className="shopify-card overflow-hidden">
        <div className="flex items-center gap-3 border-b p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f4d0] text-[#4d6b20]">
            <ShieldCheck size={20} />
          </span>
          <div>
            <h2 className="text-sm font-bold">Store users</h2>
            <p className="text-xs text-[#6d7175]">
              {members.data?.length || 0} people can access this store
            </p>
          </div>
        </div>
        <div className="divide-y">
          {members.isLoading ? (
            <p className="p-8 text-center text-xs text-[#6d7175]">
              Loading users…
            </p>
          ) : members.data?.length ? (
            members.data.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f1f2e9] text-xs font-bold">
                  {(m.user.name || m.user.email).slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {m.user.name || "Atlas user"}
                  </p>
                  <p className="truncate text-xs text-[#8c9196]">
                    {m.user.email}
                  </p>
                </div>
                <span className="shopify-badge capitalize">{m.role}</span>
                {m.role !== "owner" && (
                  <button
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(m.id)}
                    title="Remove user"
                    className="rounded-lg p-2 text-[#8c9196] hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="grid min-h-56 place-items-center text-center">
              <div>
                <Users className="mx-auto text-[#8c9196]" />
                <p className="mt-3 text-sm font-semibold">
                  No additional users
                </p>
                <p className="mt-1 text-xs text-[#8c9196]">
                  Add staff or managers to help run your store.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
      <section className="shopify-card p-5">
        <h2 className="text-sm font-bold">Permission levels</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Role
            title="Owner"
            text="Full access, including ownership and users."
          />
          <Role
            title="Manager"
            text="Manage products, orders, content, and staff."
          />
          <Role
            title="Staff"
            text="Handle catalog and daily order operations."
          />
        </div>
      </section>
      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#202223]/40 p-4 backdrop-blur-sm"
          onMouseDown={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="border-b p-5">
              <h2 className="font-bold">Add store user</h2>
              <p className="mt-1 text-xs text-[#6d7175]">
                The user must already have an Atlas account.
              </p>
            </div>
            <div className="space-y-4 p-5">
              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
                  {error}
                </p>
              )}
              <label className="block text-xs font-semibold">
                Email address
                <input
                  autoFocus
                  type="email"
                  className="shopify-input mt-1.5"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </label>
              <label className="block text-xs font-semibold">
                Role
                <select
                  className="shopify-input mt-1.5"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="owner">Owner</option>
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t p-4">
              <button
                className="shopify-secondary-button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                disabled={!email || add.isPending}
                className="shopify-primary-button disabled:opacity-50"
                onClick={() => add.mutate()}
              >
                {add.isPending ? "Adding…" : "Add user"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function Role({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border bg-[#fafbf7] p-4">
      <p className="text-xs font-bold">{title}</p>
      <p className="mt-1 text-[11px] leading-5 text-[#6d7175]">{text}</p>
    </div>
  );
}
