"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { createOrder, getSession, loadStore } from "@/lib/store";
import type { DiningTable, PosStore, TableStatus } from "@/lib/types";

const STATUS_STYLE: Record<TableStatus, string> = {
  available: "border-emerald-200 bg-emerald-50 text-emerald-800",
  occupied: "border-amber-200 bg-amber-50 text-amber-900",
  reserved: "border-sky-200 bg-sky-50 text-sky-900",
  billing: "border-violet-200 bg-violet-50 text-violet-900"
};

export function TablesView() {
  const router = useRouter();
  const [store, setStore] = useState<PosStore | null>(null);

  useEffect(() => {
    setStore(loadStore());
  }, []);

  function refresh() {
    setStore(loadStore());
  }

  function openTable(table: DiningTable) {
    const session = getSession();
    if (!session) return;

    if (table.activeOrderId) {
      router.push(`/orders/${table.activeOrderId}`);
      return;
    }

    const result = createOrder({ tableId: table.id, createdBy: session.username });
    if (result) {
      refresh();
      router.push(`/orders/${result.order.id}`);
    }
  }

  if (!store) return <p className="text-slate-500">Loading tables…</p>;

  const zones = [...new Set(store.tables.map((table) => table.zone))];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Floor</p>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Tables</h2>
        <p className="mt-2 text-slate-600">Tap a free table to open a ticket, or reopen an active order.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["available", "occupied", "billing", "reserved"] as TableStatus[]).map((status) => (
          <span key={status} className={clsx("rounded-full border px-3 py-1 text-xs font-semibold capitalize", STATUS_STYLE[status])}>
            {status}
          </span>
        ))}
      </div>

      {zones.map((zone) => (
        <section key={zone}>
          <h3 className="mb-4 font-display text-2xl font-semibold">{zone}</h3>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {store.tables
              .filter((table) => table.zone === zone)
              .map((table) => (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => openTable(table)}
                  className={clsx(
                    "rounded-3xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-soft",
                    STATUS_STYLE[table.status]
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-display text-3xl font-semibold">{table.label}</p>
                    <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold capitalize">
                      {table.status}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-medium opacity-80">{table.seats} seats</p>
                  {table.activeOrderId ? (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wider opacity-70">Active ticket</p>
                  ) : null}
                </button>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
