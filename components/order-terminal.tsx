"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useBranchData } from "@/components/app-provider";
import { Field, PrimaryButton, SecondaryButton, TextInput } from "@/components/ui";
import {
  applyDiscount,
  createId,
  formatMoney,
  orderSubtotal,
  orderTotal,
  patchOrder,
  payOrder,
  sendKot,
  setOrderStatus,
  splitBill,
  updateOrderItems
} from "@/lib/store";
import type { MenuItem, OrderItem, Payment } from "@/lib/types";

export function OrderTerminal({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { store, orders, categories, menu, customers, refresh } = useBranchData();
  const order = orders.find((entry) => entry.id === orderId) ?? store?.orders.find((entry) => entry.id === orderId) ?? null;
  const [categoryId, setCategoryId] = useState<string>("");
  const [tip, setTip] = useState(0);
  const [discount, setDiscount] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [priority, setPriority] = useState<"normal" | "rush" | "vip">("normal");
  const [splitIds, setSplitIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => { if (!categoryId) setCategoryId(categories[0]?.id ?? ""); }, [categories, categoryId]);
  useEffect(() => { if (order) { setTip(order.tip); setPriority(order.kotPriority); } }, [order]);

  const visibleMenu = useMemo(() => {
    return menu.filter((item) => item.available && item.isActive && (!categoryId || item.categoryId === categoryId));
  }, [menu, categoryId]);

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
        qty: 1,
        station: menuItem.station
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

  function updateNotes(lineId: string, notes: string) {
    if (!order) return;
    persistItems(order.items.map((item) => item.id === lineId ? { ...item, notes } : item));
  }

  function sendToKitchen() {
    sendKot(orderId, priority);
    setMessage(priority === "normal" ? "KOT sent to kitchen." : `${priority.toUpperCase()} KOT sent.`);
    refresh();
  }

  function checkout(method: Payment["method"]) {
    payOrder(orderId, method, tip);
    setMessage("Payment complete. Recipe inventory was deducted and the sale was posted to the ledger.");
    refresh();
  }

  function applyOrderDiscount() {
    try {
      applyDiscount(orderId, Number(discount) || 0, discountReason.trim() || "Manager discount");
      setMessage("Discount applied.");
      refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not apply discount.");
    }
  }

  function createSplit() {
    if (!order || !splitIds.length || splitIds.length === order.items.length) return;
    const result = splitBill(order.id, [
      order.items.filter((item) => !splitIds.includes(item.id)),
      order.items.filter((item) => splitIds.includes(item.id))
    ]);
    if (result) {
      setSplitIds([]);
      setMessage(`Split created as ${result.orders[1].orderNumber}.`);
      refresh();
    }
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
            {order.orderNumber} · {order.type.replace("_", " ")} · <span className="capitalize">{order.status}</span>
          </p>
        </div>
        <SecondaryButton onClick={() => router.push("/orders")}>All orders</SecondaryButton>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map((category) => (
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
                <div className="mt-3 flex items-center justify-between"><p className="text-sm font-bold text-accent">{formatMoney(item.price, store.settings.currency)}</p><span className="text-xs capitalize text-slate-400">{item.station}</span></div>
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
                    <div className="flex min-w-0 gap-2">
                      {!locked && order.items.length > 1 ? <input type="checkbox" aria-label={`Move ${item.name} to split bill`} checked={splitIds.includes(item.id)} onChange={(event) => setSplitIds((ids) => event.target.checked ? [...ids, item.id] : ids.filter((id) => id !== item.id))} /> : null}
                      <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-slate-500">{formatMoney(item.price, store.settings.currency)} each · <span className="capitalize">{item.station ?? "general"}</span></p>
                      </div>
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
                  {!locked ? <input value={item.notes ?? ""} onChange={(event) => updateNotes(item.id, event.target.value)} placeholder="Kitchen note (optional)" className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-accent" /> : item.notes ? <p className="mt-2 text-xs italic text-slate-500">{item.notes}</p> : null}
                </div>
              ))
            )}
          </div>

          {!locked ? (
            <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 p-4">
              <Field label="Customer">
                <select value={order.customerId ?? ""} onChange={(event) => { patchOrder(orderId, { customerId: event.target.value || undefined }); refresh(); }} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-accent">
                  <option value="">Guest / no customer</option>
                  {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} · {customer.phone}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-[1fr_1.4fr_auto] gap-2">
                <TextInput type="number" value={discount} onChange={setDiscount} placeholder="Discount" />
                <TextInput value={discountReason} onChange={setDiscountReason} placeholder="Reason" />
                <SecondaryButton onClick={applyOrderDiscount}>Apply</SecondaryButton>
              </div>
              {splitIds.length ? <SecondaryButton onClick={createSplit}>Move {splitIds.length} line(s) to new bill</SecondaryButton> : null}
            </div>
          ) : null}

          <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
            <Row label="Subtotal" value={formatMoney(subtotal, store.settings.currency)} />
            {order.discount > 0 ? <Row label={`Discount${order.discountReason ? ` · ${order.discountReason}` : ""}`} value={`−${formatMoney(order.discount, store.settings.currency)}`} /> : null}
            <Row
              label={`Tax (${Math.round(order.taxRate * 100)}%)`}
              value={formatMoney(Math.max(0, subtotal - order.discount) * order.taxRate, store.settings.currency)}
            />
            {store.settings.gstEnabled ? <Row label={`GST (${(store.settings.gstRate * 100).toFixed(1)}%)`} value={formatMoney(order.gstAmount ?? 0, store.settings.currency)} /> : null}
            {store.settings.serviceChargeRate > 0 ? <Row label={`Service (${(store.settings.serviceChargeRate * 100).toFixed(1)}%)`} value={formatMoney(order.serviceCharge ?? 0, store.settings.currency)} /> : null}
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
              <div className="grid grid-cols-3 gap-2">
                {(["normal", "rush", "vip"] as const).map((value) => <button key={value} type="button" onClick={() => setPriority(value)} className={`rounded-xl px-3 py-2 text-xs font-bold uppercase ${priority === value ? "bg-accent text-white" : "bg-slate-100 text-slate-600"}`}>{value}</button>)}
              </div>
              <PrimaryButton onClick={sendToKitchen} disabled={order.items.length === 0}>
                Send KOT
              </PrimaryButton>
              <div className="grid grid-cols-3 gap-2">
                <SecondaryButton onClick={() => { setOrderStatus(orderId, "preparing"); refresh(); }} disabled={order.items.length === 0}>Preparing</SecondaryButton>
                <SecondaryButton onClick={() => { setOrderStatus(orderId, "ready"); refresh(); }} disabled={order.items.length === 0}>Ready</SecondaryButton>
                <SecondaryButton onClick={() => { setOrderStatus(orderId, "served"); refresh(); }} disabled={order.items.length === 0}>Served</SecondaryButton>
              </div>
              <p className="pt-2 text-xs font-bold uppercase tracking-wider text-slate-400">Collect payment</p>
              <div className="grid grid-cols-4 gap-2">
                <SecondaryButton onClick={() => checkout("cash")}>Cash</SecondaryButton>
                <SecondaryButton onClick={() => checkout("card")}>Card</SecondaryButton>
                <SecondaryButton onClick={() => checkout("upi")}>UPI</SecondaryButton>
                <SecondaryButton onClick={() => checkout("qr")}>QR</SecondaryButton>
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              Payment successful via {order.paymentMethod || order.payments[0]?.method || "checkout"}. Inventory ingredients were deducted automatically.
            </p>
          )}
          {message ? <p className="mt-3 rounded-xl bg-accentSoft px-4 py-3 text-sm font-medium text-accent">{message}</p> : null}
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
