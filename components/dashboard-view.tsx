"use client";

import Link from "next/link";
import { ArrowRight, ChefHat, ClipboardList, Package, Table2 } from "lucide-react";
import { useBranchData } from "@/components/app-provider";
import { StatCard } from "@/components/ui";
import { computeKpis, getSmartAlerts, leastProfitableItems, peakHourBuckets, topSellingItems } from "@/lib/analytics";
import { formatMoney } from "@/lib/store";

export function DashboardView() {
  const { store, branch, branchId } = useBranchData();
  if (!store) return <p className="text-slate-500">Loading dashboard…</p>;

  const kpi = computeKpis(store, branchId);
  const money = (value: number) => formatMoney(value, store.settings.currency);
  const alerts = getSmartAlerts(store, branchId).filter((alert) => alert.severity !== "info");
  const sellers = topSellingItems(store, branchId);
  const lowMargin = leastProfitableItems(store, branchId);
  const peaks = peakHourBuckets(store, branchId).filter((bucket) => bucket.orders > 0).sort((a, b) => b.orders - a.orders).slice(0, 5);
  const cards = [
    ["Revenue today", money(kpi.revenueToday), `${kpi.ordersToday} paid orders`],
    ["Orders today", String(kpi.ordersToday), `${kpi.openTickets} open tickets`],
    ["AOV", money(kpi.aov), "Average order value"],
    ["Food cost %", `${kpi.foodCostPct.toFixed(1)}%`, "Recipe-based"],
    ["Labor cost %", `${kpi.laborCostPct.toFixed(1)}%`, "Clocked labor today"],
    ["Gross margin", money(kpi.grossMargin), "Revenue less food cost"],
    ["Net profit", money(kpi.netProfit), "After labor and expenses"],
    ["Table occupancy", `${kpi.tableOccupancy.toFixed(0)}%`, `${kpi.occupiedTables} tables in use`],
    ["Avg prep time", `${kpi.avgPrepMinutes.toFixed(1)} min`, "Completed KOT items"],
    ["Repeat rate", `${kpi.repeatCustomerRate.toFixed(0)}%`, "Returning customers"],
    ["Inventory value", money(kpi.inventoryValue), "Current stock on hand"],
    ["Wastage value", money(kpi.wastageValue), "Recorded today"]
  ];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Owner overview</p>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">{branch?.name ?? "Dashboard"}</h2>
        <p className="mt-2 text-slate-600">Today&apos;s operating pulse across sales, service, kitchen, and stock.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, hint]) => <StatCard key={label} label={label} value={value} hint={hint} />)}
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl font-semibold text-ink">Smart alerts</h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{alerts.length} active</span>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {alerts.length ? alerts.slice(0, 8).map((alert) => (
            <div key={alert.id} className={`rounded-2xl border p-4 ${alert.severity === "critical" ? "border-rose-200 bg-rose-50" : "border-amber-200 bg-amber-50"}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-ink">{alert.title}</p>
                <span className="text-xs font-bold uppercase tracking-wider">{alert.severity}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{alert.message}</p>
            </div>
          )) : <p className="text-sm text-slate-500">No critical or warning alerts.</p>}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <Insight title="Top sellers" empty="Paid sales will appear here.">
          {sellers.map((item) => <MetricRow key={item.menuItemId} label={item.name} detail={`${item.qty} sold`} value={money(item.revenue)} />)}
        </Insight>
        <Insight title="Least profitable" empty="Margin data will appear after sales.">
          {lowMargin.map((item) => <MetricRow key={item.menuItemId} label={item.name} detail={`${item.marginPct.toFixed(1)}% margin`} value={money(item.profit)} />)}
        </Insight>
        <Insight title="Peak hours" empty="Hourly demand will appear after sales.">
          {peaks.map((item) => <MetricRow key={item.hour} label={`${String(item.hour).padStart(2, "0")}:00`} detail={`${item.orders} orders`} value={money(item.revenue)} />)}
        </Insight>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <QuickLink href="/tables" icon={<Table2 className="h-5 w-5" />} label="Manage floor" />
        <QuickLink href="/orders" icon={<ClipboardList className="h-5 w-5" />} label="Take orders" />
        <QuickLink href="/kitchen" icon={<ChefHat className="h-5 w-5" />} label="Kitchen board" />
        <QuickLink href="/inventory" icon={<Package className="h-5 w-5" />} label="Inventory" />
      </div>
    </div>
  );
}

function Insight({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft"><h3 className="font-display text-xl font-semibold">{title}</h3><div className="mt-4 space-y-3">{hasChildren ? children : <p className="text-sm text-slate-500">{empty}</p>}</div></section>;
}

function MetricRow({ label, detail, value }: { label: string; detail: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3"><div><p className="font-semibold">{label}</p><p className="text-xs text-slate-500">{detail}</p></div><p className="text-sm font-bold text-accent">{value}</p></div>;
}

function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return <Link href={href} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 font-semibold shadow-soft transition hover:border-accent"><span className="flex items-center gap-3">{icon}{label}</span><ArrowRight className="h-4 w-4 text-accent" /></Link>;
}
