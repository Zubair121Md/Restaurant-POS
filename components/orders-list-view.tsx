"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder, formatMoney, getSession, loadStore, orderTotal } from "@/lib/store";
import type { PosStore } from "@/lib/types";
import { PrimaryButton, SecondaryButton } from "@/components/ui";

export function OrdersListView() {
  const router = useRouter();
  const [store, setStore] = useState<PosStore | null>(null);

  useEffect(() => {
    setStore(loadStore());
  }, []);

  function startWalkIn() {
    const session = getSession();
    if (!session) return;
    const result = createOrder({ createdBy: session.username });
    if (result) router.push(`/orders/${result.order.id}`);
  }

  if (!store) return <p className="text-slate-500">Loading orders…</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Service</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Orders</h2>
          <p className="mt-2 text-slate-600">Open tickets, walk-ins, and checkout history.</p>
        </div>
        <div className="flex gap-3">
          <SecondaryButton onClick={() => router.push("/tables")}>From table</SecondaryButton>
          <PrimaryButton onClick={startWalkIn}>New walk-in</PrimaryButton>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-soft">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Ticket</th>
              <th className="px-5 py-3 font-semibold">Table</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Items</th>
              <th className="px-5 py-3 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {store.orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-slate-500">
                  No orders yet.
                </td>
              </tr>
            ) : (
              store.orders.map((order) => (
                <tr key={order.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <Link href={`/orders/${order.id}`} className="font-semibold text-accent">
                      {order.id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-5 py-4">{order.tableLabel || "Walk-in"}</td>
                  <td className="px-5 py-4 capitalize">{order.status}</td>
                  <td className="px-5 py-4">{order.items.reduce((sum, item) => sum + item.qty, 0)}</td>
                  <td className="px-5 py-4 font-semibold">
                    {formatMoney(orderTotal(order), store.settings.currency)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
