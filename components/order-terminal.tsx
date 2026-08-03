"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "@/components/ui";
import {
  createId,
  formatMoney,
  getOrder,
  loadStore,
  orderSubtotal,
  orderTotal,
  payOrder,
  setOrderStatus,
  updateOrderItems
} from "@/lib/store";
import type { MenuItem, Order, OrderItem, PosStore } from "@/lib/types";

export function OrderTerminal({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [store, setStore] = useState<PosStore | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [categoryId, setCategoryId] = useState<string>("");
  const [tip, setTip] = useState(0);

  function refresh() {
    const nextStore = loadStore();
    setStore(nextStore);
    const nextOrder = getOrder(orderId);
    setOrder(nextOrder);
    if (nextStore && !categoryId) {
      setCategoryId(nextStore.categories[0]?.id ?? "");
    }
  }

  useEffect(() => {
    refresh();
  }, [orderId]);

  const visibleMenu = useMemo(() => {
    if (!store) return [];
    return store.menu.filter((item) => item.available && (!categoryId || item.categoryId === categoryId));
  }, [store, categoryId]);

  function persistItems(items: OrderItem[]) {
    updateOrderItems(orderId, items);
    refresh();
  }

  function addItem(menuItem: MenuItem) {
    if (!order || order.status === "paid") return;
    const existing = order.items.find((item) => item.menuItemId === menuItem.id);
    if (existing) {
      persistItems(
        order.items.map((item) =>
          item.id === existing.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
      return;
    }
    persistItems([
      ...order.items,
      {
        id: createId("line"),
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        qty: 1
      }
    ]);
  }

  function changeQty(lineId: string, delta: number) {
    if (!order) return;
    const items = order.items
      .map((item) => (item.id === lineId ? { ...item, qty: item.qty + delta } : item))
      .filter((item) => item.qty > 0);
    persistItems(items);
  }

  function removeLine(lineId: string) {
    if (!order) return;
    persistItems(order.items.filter((item) => item.id !== lineId));
  }

  function sendToKitchen() {
    setOrderStatus(orderId, "preparing");
    refresh();
  }

  function markReady() {
    setOrderStatus(orderId, "ready");
    refresh();
  }

  function checkout(method: "cash" | "card" | "qr") {
    payOrder(orderId, method, tip);
    refresh();
  }

  if (!store || !order) {
    return <p className="text-slate-500">Loading ticket…</p>;
  }

  const subtotal = orderSubtotal(order.items);
  const total = orderTotal({ ...order, tip });
  const locked = order.status === "paid" || order.status === "cancelled";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Ticket</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            {order.tableLabel || "Walk-in"}
          </h2>
          <p className="mt-2 text-slate-600">
            {order.id.slice(-8).toUpperCase()} · <span className="capitalize">{order.status}</span>
          </p>
        </div>
        <SecondaryButton onClick={() => router.push("/orders")}>All orders</SecondaryButton>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {store.categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategoryId(category.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  categoryId === category.id ? "bg-ink text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {visibleMenu.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={locked}
                onClick={() => addItem(item)}
                className="rounded-2xl border border-slate-200 p-4 text-left transition hover:border-accent hover:bg-accentSoft/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <p className="font-semibold">{item.name}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.description}</p>
                <p className="mt-3 text-sm font-bold text-accent">{formatMoney(item.price, store.settings.currency)}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-6">
          <h3 className="font-display text-2xl font-semibold">Current order</h3>
          <div className="mt-4 space-y-3">
            {order.items.length === 0 ? (
              <p className="text-sm text-slate-500">Add items from the menu.</p>
            ) : (
              order.items.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-slate-500">
                        {formatMoney(item.price, store.settings.currency)} each
                      </p>
                    </div>
                    {!locked ? (
                      <button type="button" onClick={() => removeLine(item.id)} className="text-slate-400 hover:text-danger">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        disabled={locked}
                        onClick={() => changeQty(item.id, -1)}
                        className="rounded-lg bg-white p-1.5 disabled:opacity-40"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-6 text-center font-semibold">{item.qty}</span>
                      <button
                        type="button"
                        disabled={locked}
                        onClick={() => changeQty(item.id, 1)}
                        className="rounded-lg bg-white p-1.5 disabled:opacity-40"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="font-semibold">
                      {formatMoney(item.price * item.qty, store.settings.currency)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
            <Row label="Subtotal" value={formatMoney(subtotal, store.settings.currency)} />
            <Row
              label={`Tax (${Math.round(order.taxRate * 100)}%)`}
              value={formatMoney(Math.max(0, subtotal - order.discount) * order.taxRate, store.settings.currency)}
            />
            {store.settings.tipEnabled && !locked ? (
              <div className="flex items-center justify-between gap-3 py-1">
                <span className="text-slate-500">Tip</span>
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={tip}
                  onChange={(event) => setTip(Number(event.target.value) || 0)}
                  className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-right font-semibold"
                />
              </div>
            ) : (
              <Row label="Tip" value={formatMoney(order.tip, store.settings.currency)} />
            )}
            <div className="flex items-center justify-between pt-2 text-base font-bold">
              <span>Total</span>
              <span>{formatMoney(locked ? orderTotal(order) : total, store.settings.currency)}</span>
            </div>
          </div>

          {!locked ? (
            <div className="mt-5 grid gap-2">
              <PrimaryButton onClick={sendToKitchen} disabled={order.items.length === 0}>
                Send to kitchen
              </PrimaryButton>
              <SecondaryButton onClick={markReady} disabled={order.items.length === 0}>
                Mark ready
              </SecondaryButton>
              <div className="grid grid-cols-3 gap-2 pt-2">
                <SecondaryButton onClick={() => checkout("cash")}>Cash</SecondaryButton>
                <SecondaryButton onClick={() => checkout("card")}>Card</SecondaryButton>
                <SecondaryButton onClick={() => checkout("qr")}>QR</SecondaryButton>
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              Paid via {order.paymentMethod || "checkout"}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
