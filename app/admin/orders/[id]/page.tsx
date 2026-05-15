"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  AdminOrder,
  ORDER_STATUSES,
  OrderStatus,
  ordersAdminApi,
} from "@/lib/orders-admin";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailPage({ params }: PageProps) {
  const { id: idStr } = use(params);
  const id = parseInt(idStr, 10);
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setError("Invalid order ID");
      return;
    }
    let cancelled = false;
    ordersAdminApi
      .get(id)
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleStatusChange = async (status: OrderStatus) => {
    if (!order) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await ordersAdminApi.updateStatus(order.id, status);
      setOrder(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {error}
      </div>
    );
  }
  if (!order) {
    return <div className="text-sm text-slate-400">Loading order…</div>;
  }

  const addr = order.shippingAddress;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Order {order.orderNumber}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Placed {new Date(order.createdAt).toLocaleString()} · last updated{" "}
            {new Date(order.updatedAt).toLocaleString()}
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-100"
        >
          ← Back
        </Link>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Status">
          <select
            value={order.status}
            onChange={(e) => void handleStatusChange(e.target.value as OrderStatus)}
            disabled={saving}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none disabled:opacity-50"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Card>
        <Card title="Payment">
          <div className="text-sm">
            <div>
              <span className="text-slate-500">Status:</span>{" "}
              {order.paymentStatus}
            </div>
            {order.paymentMethod && (
              <div>
                <span className="text-slate-500">Method:</span>{" "}
                {order.paymentMethod}
              </div>
            )}
            {order.transactionId && (
              <div className="break-all">
                <span className="text-slate-500">Tx:</span>{" "}
                <code className="text-xs">{order.transactionId}</code>
              </div>
            )}
          </div>
        </Card>
        <Card title="Totals">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="text-slate-500">Subtotal</td>
                <td className="text-right tabular-nums">
                  ${Number(order.subtotal).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="text-slate-500">
                  Shipping ({order.shippingMethod})
                </td>
                <td className="text-right tabular-nums">
                  ${Number(order.shippingCost).toFixed(2)}
                </td>
              </tr>
              <tr className="border-t border-slate-200">
                <td className="pt-1.5 font-medium">Total</td>
                <td className="pt-1.5 text-right font-medium tabular-nums">
                  ${Number(order.total).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Customer">
          {order.user ? (
            <div className="text-sm">
              <div>{order.user.email}</div>
              {(order.user.firstName || order.user.lastName) && (
                <div className="text-slate-600">
                  {[order.user.firstName, order.user.lastName]
                    .filter(Boolean)
                    .join(" ")}
                </div>
              )}
              <div className="mt-1 text-xs text-slate-400">
                User #{order.user.id}
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500">Guest checkout</div>
          )}
        </Card>
        <Card title="Shipping address">
          <div className="text-sm leading-relaxed">
            <div>
              {addr.firstName} {addr.lastName}
            </div>
            <div>{addr.street}</div>
            <div>
              {[addr.suburb, addr.state, addr.postcode].filter(Boolean).join(", ")}
            </div>
            <div>{addr.country}</div>
            <div className="mt-1 text-xs text-slate-500">
              {addr.phone && <>📞 {addr.phone} · </>}
              {addr.email}
            </div>
          </div>
        </Card>
      </div>

      <Card title={`Items (${order.items.length})`}>
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-2">Product</th>
              <th className="py-2 w-16 text-right">Qty</th>
              <th className="py-2 w-24 text-right">Unit</th>
              <th className="py-2 w-24 text-right">Line total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 align-top last:border-0">
                <td className="py-2.5">
                  <div className="font-medium">{item.productName}</div>
                  {item.productId != null && (
                    <Link
                      href={`/admin/products/${item.productId}`}
                      className="text-xs text-slate-500 hover:underline"
                    >
                      #{item.productId}
                    </Link>
                  )}
                  {item.previewImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.previewImageUrl}
                      alt=""
                      className="mt-2 h-16 w-16 rounded border border-slate-200 object-cover"
                    />
                  )}
                </td>
                <td className="py-2.5 text-right tabular-nums">
                  {item.quantity}
                </td>
                <td className="py-2.5 text-right tabular-nums">
                  ${Number(item.unitPrice).toFixed(2)}
                </td>
                <td className="py-2.5 text-right tabular-nums">
                  ${Number(item.totalPrice).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        {title}
      </div>
      {children}
    </div>
  );
}
