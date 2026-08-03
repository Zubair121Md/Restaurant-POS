"use client";

import { useEffect, useState } from "react";
import { PrimaryButton, SecondaryButton } from "@/components/ui";
import { formatMoney, loadStore, orderTotal, setOrderStatus } from "@/lib/store";
import type { PosStore } from "@/lib/types";

export function KitchenView() {
  const [store, setStore] = useState<PosStore | null>(null);

  function refresh() {
    setStore(loadStore());
  }

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 2500);
    return () => window.clearInterval(timer);
  }, []);

  if (!store) return <p className="text-slate-500">Loading kitchen…</p>;

  const tickets = store.orders.filter((order) => ["pending", "preparing", "ready"].includes(order.status));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Expo</p>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Kitchen</h2>
        <p className="mt-2 text-slate-600">Live board for tickets waiting on prep and fire.</p>
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-500">
          Kitchen is clear. New tickets will show up here automatically.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tickets.map((order) => (
            <article key={order.id} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-2xl font-semibold">{order.tableLabel || "Walk-in"}</p>
                  <p className="mt-1 text-sm capitalize text-slate-500">{order.status}</p>
                </div>
                <p className="text-sm font-semibold">{formatMoney(orderTotal(order), store.settings.currency)}</p>
              </div>
              <ul className="mt-4 space-y-2">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                    <span className="font-semibold">
                      {item.qty}× {item.name}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-2">
                {order.status === "pending" ? (
                  <PrimaryButton
                    className="flex-1"
                    onClick={() => {
                      setOrderStatus(order.id, "preparing");
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
