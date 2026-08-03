"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CircleDollarSign, ShoppingBag, Table2 } from "lucide-react";
import { StatCard } from "@/components/ui";
import { dashboardStats, formatMoney, loadStore } from "@/lib/store";
import type { PosStore } from "@/lib/types";

export function DashboardView() {
  const [store, setStore] = useState<PosStore | null>(null);

  useEffect(() => {
    setStore(loadStore());
  }, []);

  if (!store) {
    return <p className="text-slate-500">Loading dashboard…</p>;
  }

  const stats = dashboardStats(store);
  const recent = store.orders.slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Overview</p>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Dashboard</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Track sales, open tickets, and floor occupancy for {store.install.restaurantName}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={formatMoney(stats.revenue, store.settings.currency)} hint={`${stats.paidCount} paid orders`} />
        <StatCard label="Open tickets" value={String(stats.openCount)} hint="Active service orders" />
        <StatCard label="Occupied tables" value={String(stats.occupiedTables)} hint={`${stats.availableTables} free`} />
        <StatCard label="Menu items" value={String(store.menu.length)} hint={`${store.categories.length} categories`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-2xl font-semibold">Recent orders</h3>
            <Link href="/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 divide-y divide-slate-100">
            {recent.length === 0 ? (
              <p className="py-8 text-sm text-slate-500">No orders yet. Open a table to start the first ticket.</p>
            ) : (
              recent.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="font-semibold">{order.tableLabel || "Walk-in"}</p>
                    <p className="text-sm text-slate-500">
                      {order.items.length} items · {order.status}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatMoney(
                      order.items.reduce((sum, item) => sum + item.price * item.qty, 0),
                      store.settings.currency
                    )}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft">
          <h3 className="font-display text-2xl font-semibold">Top sellers</h3>
          <div className="mt-5 space-y-3">
            {stats.topItems.length === 0 ? (
              <p className="text-sm text-slate-500">Sales will appear here after checkout.</p>
            ) : (
              stats.topItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.qty} sold</p>
                  </div>
                  <p className="text-sm font-semibold">{formatMoney(item.revenue, store.settings.currency)}</p>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 grid gap-3">
            <QuickLink href="/tables" icon={<Table2 className="h-4 w-4" />} label="Manage floor" />
            <QuickLink href="/orders" icon={<ShoppingBag className="h-4 w-4" />} label="Take an order" />
            <QuickLink href="/kitchen" icon={<CircleDollarSign className="h-4 w-4" />} label="Kitchen board" />
          </div>
        </section>
      </div>
    </div>
  );
}

function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold transition hover:bg-slate-50"
    >
      {icon}
      {label}
    </Link>
  );
}
