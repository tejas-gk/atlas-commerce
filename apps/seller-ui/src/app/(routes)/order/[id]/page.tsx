"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { useParams, useRouter } from "next/navigation";

const statuses = [
  "Ordered",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const Page = () => {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const fetchOrder = async () => {
    try {
      const res = await axiosInstance.get(
        `/order/api/get-order-details/${orderId}`
      );
      setOrder(res.data.order);
    } catch (err) {
      setLoading(false);
      console.error("Failed to fetch order details", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value;
    setUpdating(true);
    try {
      await axiosInstance.put(`/order/api/update-status/${order.id}`, {
        deliveryStatus: newStatus,
      });
      setOrder((prev: any) => ({ ...prev, deliveryStatus: newStatus }));
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[40vh]">
        <div className="w-8 h-8 rounded-full border-2 border-rose-500/30 border-t-rose-500 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return <p className="text-center text-sm text-red-400">Order not found.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Back + Title */}
      <div>
        <button
          onClick={() => router.push("/dashboard/orders")}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-all duration-200 mb-3"
        >
          <ArrowLeft size={14} />
          Back to Orders
        </button>
        <h1 className="text-2xl font-bold text-white">
          Order #{order.id.slice(-6).toUpperCase()}
        </h1>
        <p className="text-white/40 text-sm mt-0.5">
          Placed on {new Date(order.createdAt).toLocaleDateString("en-UK", { dateStyle: "medium" })}
        </p>
      </div>

      {/* Delivery status + progress */}
      <div className="rounded-2xl border border-white/8 bg-white/5 backdrop-blur-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-sm">Delivery Status</h2>
          <div className="flex items-center gap-2">
            {updating && <Loader2 size={14} className="animate-spin text-rose-400" />}
            <select
              value={order.deliveryStatus}
              onChange={handleStatusChange}
              disabled={updating}
              className="h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-white/80 text-xs outline-none focus:border-rose-500/50 transition-all"
            >
              {statuses.map((status) => {
                const currentIndex = statuses.indexOf(order.deliveryStatus);
                const statusIndex = statuses.indexOf(status);
                return (
                  <option key={status} value={status} disabled={statusIndex < currentIndex} className="bg-[#111]">
                    {status}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center">
          {statuses.map((step, idx) => {
            const reached = idx <= statuses.indexOf(order.deliveryStatus);
            const current = step === order.deliveryStatus;
            return (
              <div key={step} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex items-center">
                  {idx > 0 && (
                    <div className={`flex-1 h-0.5 ${reached ? "bg-rose-600" : "bg-white/10"}`} />
                  )}
                  <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${current ? "bg-rose-600 ring-2 ring-rose-500/30" : reached ? "bg-rose-600" : "bg-white/10"}`} />
                  {idx < statuses.length - 1 && (
                    <div className={`flex-1 h-0.5 ${reached && idx < statuses.indexOf(order.deliveryStatus) ? "bg-rose-600" : "bg-white/10"}`} />
                  )}
                </div>
                <span className={`text-[10px] text-center leading-tight ${current ? "text-rose-400 font-semibold" : reached ? "text-white/50" : "text-white/25"}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary + Shipping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/8 bg-white/5 backdrop-blur-md p-5 space-y-2.5">
          <h2 className="text-white font-semibold text-sm mb-3">Payment Summary</h2>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Payment Status</span>
            <span className={`font-semibold ${order.status === "Paid" ? "text-emerald-400" : "text-amber-400"}`}>{order.status}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Total Paid</span>
            <span className="text-white font-bold">${order.total.toFixed(2)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Discount Applied</span>
              <span className="text-emerald-400 font-semibold">
                -${order.discountAmount.toFixed(2)} ({order.couponCode?.discountType === "percentage" ? `${order.couponCode.discountValue}%` : `$${order.couponCode.discountValue}`} off)
              </span>
            </div>
          )}
          {order.couponCode && (
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Coupon Used</span>
              <span className="text-rose-400 font-mono text-xs">{order.couponCode.public_name}</span>
            </div>
          )}
          <div className="border-t border-white/5 pt-2 flex justify-between text-sm">
            <span className="text-white/50">Your Earnings (90%)</span>
            <span className="text-white font-bold">${(order.total * 0.9).toFixed(2)}</span>
          </div>
        </div>

        {order.shippingAddress && (
          <div className="rounded-2xl border border-white/8 bg-white/5 backdrop-blur-md p-5">
            <h2 className="text-white font-semibold text-sm mb-3">Shipping Address</h2>
            <p className="text-white text-sm font-medium">{order.shippingAddress.name}</p>
            <p className="text-white/50 text-sm">{order.shippingAddress.street}</p>
            <p className="text-white/50 text-sm">{order.shippingAddress.city}, {order.shippingAddress.zip}</p>
            <p className="text-white/50 text-sm">{order.shippingAddress.country}</p>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="rounded-2xl border border-white/8 bg-white/5 backdrop-blur-md overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold text-sm">Order Items</h2>
        </div>
        <div className="divide-y divide-white/5">
          {order.items.map((item: any) => (
            <div key={item.productId} className="flex items-center gap-4 px-5 py-4">
              <img
                src={item.product?.images[0]?.url || "/placeholder.png"}
                alt={item.product?.title || "Product image"}
                className="w-14 h-14 object-cover rounded-xl border border-white/10 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{item.product?.title || "Unnamed Product"}</p>
                <p className="text-white/40 text-xs mt-0.5">Qty: {item.quantity}</p>
                {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(item.selectedOptions).map(([key, value]: [string, any]) =>
                      value && (
                        <span key={key} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-white/50">
                          <span className="capitalize">{key}:</span> {value}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>
              <p className="text-white font-semibold text-sm flex-shrink-0">${item.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
