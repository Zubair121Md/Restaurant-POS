"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBranchData } from "@/components/app-provider";
import { createOrder, formatMoney, orderTotal } from "@/lib/store";
import { PrimaryButton, SecondaryButton } from "@/components/ui";

export function OrdersListView() {
  const router = useRouter();
  const { store, branchId, orders, staff, session, refresh } = useBranchData();
  const [filter, setFilter] = useState<"open" | "paid">("open");

  function startOrder(type: "takeaway" | "delivery") {
    if (!session) return;
    const result = createOrder({ branchId, createdBy: session.username, waiterId: session.staffId, type });
    if (result) {
      refresh();
      router.push(`/orders/ticket/?id=${result.order.id}`);
    }
  }

  if (!store) return <p className="text-slate-500">Loading orders…</p>;
  const visible = orders.filter((order) => filter === "paid" ? order.status === "paid" : !["paid", "cancelled"].includes(order.status));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Service</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Orders</h2>
          <p className="mt-2 text-slate-600">Open tickets, walk-ins, and checkout history.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <SecondaryButton onClick={() => router.push("/tables")}>New dine-in</SecondaryButton>
          <SecondaryButton onClick={() => startOrder("delivery")}>New delivery</SecondaryButton>
          <PrimaryButton onClick={() => startOrder("takeaway")}>Walk-in / takeaway</PrimaryButton>
        </div>
      </div>

      <div className="flex gap-2">
        {(["open", "paid"] as const).map((value) => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${filter === value ? "bg-ink text-white" : "bg-white text-slate-600"}`}>{value} orders</button>)}
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-soft">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Ticket</th>
              <th className="px-5 py-3 font-semibold">Table</th>
              <th className="px-5 py-3 font-semibold">Type</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Total</th>
              <th className="px-5 py-3 font-semibold">Waiter</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-slate-500">No {filter} orders.</td>
              </tr>
            ) : (
              visible.map((order) => (
                <tr key={order.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <Link href={`/orders/ticket/?id=${order.id}`} className="font-semibold text-accent">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-4">{order.tableLabel || "—"}</td>
                  <td className="px-5 py-4 capitalize">{order.type.replace("_", " ")}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize">{order.status}</span></td>
                  <td className="px-5 py-4 font-semibold">
                    {formatMoney(orderTotal(order), store.settings.currency)}
                  </td>
                  <td className="px-5 py-4">{staff.find((person) => person.id === order.waiterId)?.name ?? order.createdBy}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
