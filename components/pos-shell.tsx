"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import {
  Bell,
  BookOpen,
  Bot,
  Building2,
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Table2,
  Truck,
  Users,
  UserRound,
  UtensilsCrossed,
  Wallet,
  X,
  CalendarDays
} from "lucide-react";
import { useApp } from "@/components/app-provider";
import { MiaAssistant } from "@/components/mia-assistant";
import { clearSession } from "@/lib/store";
import { COMPANY, DEMO } from "@/lib/brand";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/branches", label: "Branches", icon: Building2 },
      { href: "/assistant", label: "MIA Assistant", icon: Bot }
    ]
  },
  {
    label: "Front of house",
    items: [
      { href: "/tables", label: "Tables", icon: Table2 },
      { href: "/reservations", label: "Reservations", icon: CalendarDays },
      { href: "/orders", label: "POS / Orders", icon: ShoppingBag },
      { href: "/customers", label: "Customers", icon: UserRound }
    ]
  },
  {
    label: "Kitchen",
    items: [{ href: "/kitchen", label: "Kitchen display", icon: ChefHat }]
  },
  {
    label: "Menu & cost",
    items: [
      { href: "/menu", label: "Menu", icon: UtensilsCrossed },
      { href: "/recipes", label: "Recipes", icon: BookOpen }
    ]
  },
  {
    label: "Supply",
    items: [
      { href: "/inventory", label: "Inventory", icon: Package },
      { href: "/procurement", label: "Procurement", icon: Truck }
    ]
  },
  {
    label: "People & finance",
    items: [
      { href: "/staff", label: "Staff", icon: Users },
      { href: "/accounting", label: "Accounting", icon: Wallet },
      { href: "/settings", label: "Settings", icon: Settings }
    ]
  }
];

export function PosShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, installed, store, session, branchId, setBranch } = useApp();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!installed) {
      router.replace("/setup");
      return;
    }
    if (!session) router.replace("/login");
  }, [ready, installed, session, router]);

  if (!ready || !installed || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-slate-500">
        Loading Restaurant POS…
      </div>
    );
  }

  const branch = store?.branches.find((item) => item.id === branchId);
  const alertCount = store?.alerts.filter((item) => !item.resolved).length ?? 0;
  const venue = store?.install.restaurantName || session.restaurantName;

  function logout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-surface text-ink lg:grid lg:grid-cols-[280px_1fr]">
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-panel text-white transition lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-300">{COMPANY.productName}</p>
            <h1 className="mt-2 font-display text-xl font-semibold leading-tight">{venue}</h1>
            <p className="mt-1 text-xs text-white/50">{branch?.name ?? "Branch"}</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-white/35">{COMPANY.legalName}</p>
          </div>
          <button type="button" className="rounded-lg p-2 text-white/70 lg:hidden" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 pb-3">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/40">Active branch</label>
          <select
            value={branchId}
            onChange={(event) => setBranch(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white outline-none"
          >
            {store?.branches.filter((item) => item.isActive).map((item) => (
              <option key={item.id} value={item.id} className="text-ink">
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={clsx(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition",
                        active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-sm font-semibold">{session.username}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-white/45">{session.role.replaceAll("_", " ")}</p>
            <button
              type="button"
              onClick={logout}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-200 transition hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {open ? (
        <button type="button" aria-label="Close menu" className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
      ) : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200/80 bg-surface/90 px-4 py-3 backdrop-blur lg:px-8">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-4 w-4" />
            Menu
          </button>
          <div className="hidden items-center gap-2 text-sm text-slate-500 lg:flex">
            <ClipboardList className="h-4 w-4" />
            {DEMO.notice}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/assistant"
              className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink sm:inline-flex"
            >
              <Bot className="h-3.5 w-3.5 text-accent" />
              Ask MIA
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-accentSoft px-3 py-1.5 text-xs font-semibold text-accent"
            >
              <Bell className="h-3.5 w-3.5" />
              {alertCount} alerts
            </Link>
          </div>
        </header>
        <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
      <MiaAssistant />
    </div>
  );
}
