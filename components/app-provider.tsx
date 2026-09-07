"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getSession,
  isDemoInstall,
  isInstalled,
  loadStore,
  refreshAlerts,
  refreshDemoDay,
  setActiveBranch as storeSetActiveBranch
} from "@/lib/store";
import { getTodayBounds } from "@/lib/analytics";
import type { PosStore, SessionUser } from "@/lib/types";

type AppContextValue = {
  ready: boolean;
  installed: boolean;
  store: PosStore | null;
  session: SessionUser | null;
  branchId: string;
  refresh: () => void;
  setBranch: (branchId: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [store, setStore] = useState<PosStore | null>(null);
  const [session, setSessionState] = useState<SessionUser | null>(null);

  const refresh = useCallback(() => {
    const next = loadStore();
    if (next) {
      refreshAlerts();
      setStore(loadStore());
    } else {
      setStore(null);
    }
    setSessionState(getSession());
  }, []);

  useEffect(() => {
    const existing = loadStore();
    if (existing && isDemoInstall(existing.install)) {
      const { start } = getTodayBounds();
      const hasTodayPaid = existing.orders.some(
        (order) => order.status === "paid" && order.createdAt >= start
      );
      if (!hasTodayPaid) refreshDemoDay();
    }
    refresh();
    setReady(true);
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    const timer = window.setInterval(refresh, 4000);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(timer);
    };
  }, [refresh]);

  const setBranch = useCallback(
    (branchId: string) => {
      storeSetActiveBranch(branchId);
      refresh();
    },
    [refresh]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      installed: Boolean(store?.install.installedAt) || isInstalled(),
      store,
      session,
      branchId: session?.branchId || store?.activeBranchId || "",
      refresh,
      setBranch
    }),
    [ready, store, session, refresh, setBranch]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function useBranchData() {
  const { store, branchId, refresh, session } = useApp();
  const branch = store?.branches.find((item) => item.id === branchId);
  const tables = store?.tables.filter((item) => item.branchId === branchId) ?? [];
  const orders = store?.orders.filter((item) => item.branchId === branchId) ?? [];
  const ingredients = store?.ingredients.filter((item) => item.branchId === branchId) ?? [];
  const staff = store?.staff.filter((item) => item.branchId === branchId) ?? [];
  const reservations = store?.reservations.filter((item) => item.branchId === branchId) ?? [];
  const waitlist = store?.waitlist.filter((item) => item.branchId === branchId) ?? [];
  const purchaseOrders = store?.purchaseOrders.filter((item) => item.branchId === branchId) ?? [];
  const ledger = store?.ledger.filter((item) => item.branchId === branchId) ?? [];
  const expenses = store?.expenses.filter((item) => item.branchId === branchId) ?? [];
  const alerts = store?.alerts.filter((item) => !item.resolved) ?? [];
  return {
    store,
    branch,
    branchId,
    tables,
    orders,
    ingredients,
    staff,
    reservations,
    waitlist,
    purchaseOrders,
    ledger,
    expenses,
    alerts,
    session,
    refresh,
    menu: store?.menu ?? [],
    categories: store?.categories ?? [],
    recipes: store?.recipes ?? [],
    vendors: store?.vendors ?? [],
    customers: store?.customers ?? [],
    feedback: store?.feedback ?? [],
    movements: store?.movements.filter((item) => item.branchId === branchId) ?? [],
    transfers: store?.transfers ?? [],
    settings: store?.settings
  };
}
