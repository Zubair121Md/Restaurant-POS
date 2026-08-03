"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { useBranchData } from "@/components/app-provider";
import { PrimaryButton, SecondaryButton } from "@/components/ui";
import { patchOrder, sendKot, setOrderStatus } from "@/lib/store";
import type { KitchenStation, Order, OrderItem } from "@/lib/types";

export function KitchenView() {
  const { store, orders, menu, refresh } = useBranchData();
  const [station, setStation] = useState<"all" | KitchenStation>("all");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => { setNow(Date.now()); refresh(); }, 2500);
    return () => window.clearInterval(timer);
  }, [refresh]);

  if (!store) return <p className="text-slate-500">Loading kitchen…</p>;

  const tickets = orders.filter((order) => ["pending", "preparing", "ready"].includes(order.status) && (station === "all" || order.items.some((item) => (item.station ?? "general") === station)));
  const stations = [...new Set(menu.map((item) => item.station))];

  function markItemReady(order: Order, line: OrderItem) {
    const items = order.items.map((item) => item.id === line.id ? { ...item, preparedAt: new Date().toISOString() } : item);
    patchOrder(order.id, { items });
    if (items.every((item) => item.preparedAt)) setOrderStatus(order.id, "ready");
    refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Expo</p>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Kitchen</h2>
        <p className="mt-2 text-slate-600">Live board for tickets waiting on prep and fire.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", ...stations] as ("all" | KitchenStation)[]).map((value) => <button key={value} type="button" onClick={() => setStation(value)} className={clsx("rounded-full px-4 py-2 text-sm font-semibold capitalize", station === value ? "bg-ink text-white" : "bg-white text-slate-600")}>{value}</button>)}
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-500">
          Kitchen is clear. New tickets will show up here automatically.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tickets.map((order) => (
            <article key={order.id} className={clsx("rounded-3xl border bg-white p-5 shadow-soft", order.kotPriority === "rush" ? "border-rose-300" : order.kotPriority === "vip" ? "border-violet-300" : "border-slate-200")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-2xl font-semibold">{order.tableLabel || "Walk-in"}</p>
                  <p className="mt-1 text-sm text-slate-500">{order.orderNumber} · <span className="capitalize">{order.status}</span></p>
                </div>
                {order.kotPriority !== "normal" ? <span className={clsx("rounded-full px-3 py-1 text-xs font-bold uppercase", order.kotPriority === "rush" ? "bg-rose-100 text-rose-700" : "bg-violet-100 text-violet-700")}>{order.kotPriority}</span> : null}
              </div>
              <div className="mt-4 space-y-4">
                {[...new Set(order.items.map((item) => item.station ?? "general"))].filter((value) => station === "all" || value === station).map((group) => (
                  <div key={group}>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-accent">{group}</p>
                    <ul className="space-y-2">
                      {order.items.filter((item) => (item.station ?? "general") === group).map((item) => {
                        const menuItem = menu.find((entry) => entry.id === item.menuItemId);
                        const elapsed = item.kotSentAt ? Math.max(0, Math.floor((now - new Date(item.kotSentAt).getTime()) / 60000)) : 0;
                        const delayed = Boolean(item.kotSentAt && !item.preparedAt && elapsed > (menuItem?.prepMinutes ?? 10) * 1.5);
                        return (
                          <li key={item.id} className={clsx("rounded-xl px-3 py-2 text-sm", delayed ? "bg-rose-50 ring-1 ring-rose-200" : item.preparedAt ? "bg-emerald-50" : "bg-slate-50")}>
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-semibold">{item.qty}× {item.name}</span>
                              <span className={clsx("text-xs font-bold", delayed ? "text-rose-700" : "text-slate-500")}>{item.preparedAt ? "Ready" : item.kotSentAt ? `${elapsed}m / ${menuItem?.prepMinutes ?? 10}m` : "Not fired"}</span>
                            </div>
                            {item.notes ? <p className="mt-1 text-xs italic text-slate-600">{item.notes}</p> : null}
                            {order.status === "preparing" && !item.preparedAt ? <button type="button" onClick={() => markItemReady(order, item)} className="mt-2 text-xs font-bold text-accent">Mark item ready</button> : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                {order.status === "pending" ? (
                  <PrimaryButton
                    className="flex-1"
                    onClick={() => {
                      sendKot(order.id, order.kotPriority);
                      refresh();
                    }}
                  >
                    Start prep
                  </PrimaryButton>
                ) : null}
                {order.status === "preparing" ? (
                  <PrimaryButton
                    className="flex-1"
                    onClick={() => {
                      setOrderStatus(order.id, "ready");
                      refresh();
                    }}
                  >
                    Mark ready
                  </PrimaryButton>
                ) : null}
                {order.status === "ready" ? (
                  <SecondaryButton
                    className="flex-1"
                    onClick={() => {
                      setOrderStatus(order.id, "served");
                      refresh();
                    }}
                  >
                    Served
                  </SecondaryButton>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
