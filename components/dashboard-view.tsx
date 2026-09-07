"use client";

import Link from "next/link";
import { ArrowRight, ChefHat, ClipboardList, Package, RefreshCw, Table2 } from "lucide-react";
import { useBranchData } from "@/components/app-provider";
import { PrimaryButton, StatCard } from "@/components/ui";
import { computeKpis, getSmartAlerts, leastProfitableItems, peakHourBuckets, topSellingItems } from "@/lib/analytics";
import { DEMO } from "@/lib/brand";
import { formatMoney, isDemoInstall, refreshDemoDay } from "@/lib/store";

export function DashboardView() {
  const { store, branch, branchId, refresh } = useBranchData();
  if (!store) return <p className="text-slate-500">Loading dashboard…</p>;

  const kpi = computeKpis(store, branchId);
  const money = (value: number) => formatMoney(value, store.settings.currency);
  const alerts = getSmartAlerts(store, branchId).filter((alert) => alert.severity !== "info");
  const sellers = topSellingItems(store, branchId);
  const lowMargin = leastProfitableItems(store, branchId);
  const peaks = peakHourBuckets(store, branchId).filter((bucket) => bucket.orders > 0).sort((a, b) => b.orders - a.orders).slice(0, 5);
  const demo = isDemoInstall(store.install);
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

  function reloadDemo() {
    refreshDemoDay();
    refresh();
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Owner overview</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">{branch?.name ?? "Dashboard"}</h2>
          <p className="mt-2 text-slate-600">Today&apos;s operating pulse across sales, service, kitchen, and stock.</p>
        </div>
        {demo ? (
          <PrimaryButton onClick={reloadDemo} className="shrink-0">
            <RefreshCw className="h-4 w-4" />
            Refresh today&apos;s demo data
          </PrimaryButton>
        ) : null}
      </header>

      {demo ? (
        <p className="rounded-2xl border border-accent/20 bg-accentSoft/50 px-4 py-3 text-sm text-slate-700">
          {DEMO.notice} Every branch ships with paid tickets, labor, prep times, and wastage for today. Use{" "}
          <strong>Refresh today&apos;s demo data</strong> if figures look empty after switching days.
        </p>
      ) : null}

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
  const items = Array.isArray(children) ? children : [children];
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <h3 className="font-display text-2xl font-semibold text-ink">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.filter(Boolean).length ? children : <p className="text-sm text-slate-500">{empty}</p>}
      </div>
    </section>
  );
}

function MetricRow({ label, detail, value }: { label: string; detail: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
      <div>
        <p className="font-semibold text-ink">{label}</p>
        <p className="text-sm text-slate-500">{detail}</p>
      </div>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-slate-50">
      {icon}
      {label}
      <ArrowRight className="ml-auto h-4 w-4 text-slate-400" />
    </Link>
  );
}
