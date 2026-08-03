"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import {
  ChefHat,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  Table2,
  UtensilsCrossed,
  X
} from "lucide-react";
import { clearSession, getSession, isInstalled, loadStore } from "@/lib/store";
import type { SessionUser } from "@/lib/types";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tables", label: "Tables", icon: Table2 },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/kitchen", label: "Kitchen", icon: ChefHat },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function PosShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isInstalled()) {
      router.replace("/setup");
      return;
    }
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setUser(session);
    setReady(true);
  }, [router]);

  function logout() {
    clearSession();
    router.replace("/login");
  }

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-slate-500">
        Loading Restaurant POS…
      </div>
    );
  }

  const store = loadStore();
  const venue = store?.install.restaurantName || user.restaurantName;

  return (
    <div className="min-h-screen bg-surface text-ink lg:grid lg:grid-cols-[260px_1fr]">
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-[260px] bg-panel text-white transition lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col px-4 py-5">
          <div className="mb-8 flex items-start justify-between gap-3 px-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">Restaurant POS</p>
              <h1 className="mt-2 font-display text-2xl font-semibold leading-tight">{venue}</h1>
            </div>
            <button type="button" className="rounded-lg p-2 text-white/70 lg:hidden" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                    active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 rounded-2xl bg-white/5 p-4">
            <p className="text-sm font-semibold">{user.username}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-white/50">{user.role}</p>
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
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/80 bg-surface/90 px-4 py-3 backdrop-blur lg:px-8">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-4 w-4" />
            Menu
          </button>
          <div className="hidden lg:block">
            <p className="text-sm text-slate-500">Point of sale workspace</p>
          </div>
          <div className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
            Live
          </div>
        </header>
        <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
