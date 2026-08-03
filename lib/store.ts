import type {
  DiningTable,
  InstallState,
  MenuCategory,
  MenuItem,
  Order,
  OrderItem,
  OrderStatus,
  PosSettings,
  PosStore,
  SessionUser,
  TableStatus
} from "@/lib/types";
import { createId, seedCategories, seedMenu, seedTables } from "@/lib/seed";

export { createId };

export const STORE_KEY = "restaurant-pos-store";
export const SESSION_KEY = "restaurant-pos-session";
export const PASSWORD_MIN_LENGTH = 6;

export const defaultInstall: InstallState = {
  language: "en",
  businessType: "restaurant",
  restaurantName: "",
  username: "",
  password: "",
  provider: "local"
};

export const defaultSettings: PosSettings = {
  currency: "USD",
  taxRate: 0.08,
  tipEnabled: true
};

function emptyStore(install: InstallState & { installedAt: string }): PosStore {
  return {
    version: 1,
    install,
    settings: defaultSettings,
    categories: seedCategories(),
    menu: seedMenu(),
    tables: seedTables(),
    orders: []
  };
}

function canUseStorage() {
  return typeof window !== "undefined";
}

export function loadStore(): PosStore | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PosStore;
  } catch {
    return null;
  }
}

export function saveStore(store: PosStore) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function isInstalled() {
  return Boolean(loadStore()?.install.installedAt);
}

export function completeInstall(form: InstallState) {
  const store = emptyStore({
    ...form,
    password: "configured",
    installedAt: new Date().toISOString()
  });
  saveStore(store);
  setSession({
    username: form.username,
    role: "admin",
    restaurantName: form.restaurantName
  });
  return store;
}

export function resetInstall() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORE_KEY);
  window.localStorage.removeItem(SESSION_KEY);
}

export function setSession(user: SessionUser) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): SessionUser | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function authenticate(username: string, password: string): SessionUser | null {
  const store = loadStore();
  if (!store) return null;
  const validUser = username.trim().toLowerCase() === store.install.username.trim().toLowerCase();
  const validPass = password.length >= PASSWORD_MIN_LENGTH;
  if (!validUser || !validPass) return null;
  const user: SessionUser = {
    username: store.install.username,
    role: "admin",
    restaurantName: store.install.restaurantName
  };
  setSession(user);
  return user;
}

export function updateSettings(settings: Partial<PosSettings>) {
  const store = loadStore();
  if (!store) return null;
  store.settings = { ...store.settings, ...settings };
  saveStore(store);
  return store;
}

export function upsertCategory(category: MenuCategory) {
  const store = loadStore();
  if (!store) return null;
  const index = store.categories.findIndex((item) => item.id === category.id);
  if (index >= 0) store.categories[index] = category;
  else store.categories.push(category);
  store.categories.sort((a, b) => a.sortOrder - b.sortOrder);
  saveStore(store);
  return store;
}

export function upsertMenuItem(item: MenuItem) {
  const store = loadStore();
  if (!store) return null;
  const index = store.menu.findIndex((entry) => entry.id === item.id);
  if (index >= 0) store.menu[index] = item;
  else store.menu.push(item);
  saveStore(store);
  return store;
}

export function toggleMenuAvailability(itemId: string) {
  const store = loadStore();
  if (!store) return null;
  store.menu = store.menu.map((item) =>
    item.id === itemId ? { ...item, available: !item.available } : item
  );
  saveStore(store);
  return store;
}

export function updateTable(tableId: string, patch: Partial<DiningTable>) {
  const store = loadStore();
  if (!store) return null;
  store.tables = store.tables.map((table) => (table.id === tableId ? { ...table, ...patch } : table));
  saveStore(store);
  return store;
}

export function orderSubtotal(items: OrderItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function orderTotal(order: Pick<Order, "items" | "discount" | "taxRate" | "tip">) {
  const subtotal = orderSubtotal(order.items);
  const afterDiscount = Math.max(0, subtotal - order.discount);
  const tax = afterDiscount * order.taxRate;
  return afterDiscount + tax + order.tip;
}

export function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(amount);
}

export function createOrder(input: {
  tableId?: string;
  createdBy: string;
  items?: OrderItem[];
}) {
  const store = loadStore();
  if (!store) return null;

  const table = store.tables.find((entry) => entry.id === input.tableId);
  const now = new Date().toISOString();
  const order: Order = {
    id: createId("ord"),
    tableId: table?.id,
    tableLabel: table?.label,
    items: input.items ?? [],
    status: "pending",
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
    discount: 0,
    taxRate: store.settings.taxRate,
    tip: 0
  };

  store.orders.unshift(order);
  if (table) {
    store.tables = store.tables.map((entry) =>
      entry.id === table.id
        ? { ...entry, status: "occupied" as TableStatus, activeOrderId: order.id }
        : entry
    );
  }
  saveStore(store);
  return { store, order };
}

export function getOrder(orderId: string) {
  return loadStore()?.orders.find((order) => order.id === orderId) ?? null;
}

export function updateOrderItems(orderId: string, items: OrderItem[]) {
  const store = loadStore();
  if (!store) return null;
  store.orders = store.orders.map((order) =>
    order.id === orderId
      ? { ...order, items, updatedAt: new Date().toISOString(), status: order.status === "paid" ? order.status : "preparing" }
      : order
  );
  saveStore(store);
  return store;
}

export function setOrderStatus(orderId: string, status: OrderStatus) {
  const store = loadStore();
  if (!store) return null;
  store.orders = store.orders.map((order) =>
    order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order
  );

  if (status === "paid" || status === "cancelled") {
    const order = store.orders.find((entry) => entry.id === orderId);
    if (order?.tableId) {
      store.tables = store.tables.map((table) =>
        table.id === order.tableId
          ? { ...table, status: "available", activeOrderId: undefined }
          : table
      );
    }
  }

  if (status === "ready" || status === "served") {
    const order = store.orders.find((entry) => entry.id === orderId);
    if (order?.tableId) {
      store.tables = store.tables.map((table) =>
        table.id === order.tableId
          ? { ...table, status: status === "ready" ? "billing" : table.status }
          : table
      );
    }
  }

  saveStore(store);
  return store;
}

export function payOrder(orderId: string, paymentMethod: "cash" | "card" | "qr", tip = 0) {
  const store = loadStore();
  if (!store) return null;
  store.orders = store.orders.map((order) =>
    order.id === orderId
      ? {
          ...order,
          tip,
          paymentMethod,
          status: "paid",
          updatedAt: new Date().toISOString()
        }
      : order
  );
  const order = store.orders.find((entry) => entry.id === orderId);
  if (order?.tableId) {
    store.tables = store.tables.map((table) =>
      table.id === order.tableId
        ? { ...table, status: "available", activeOrderId: undefined }
        : table
    );
  }
  saveStore(store);
  return store;
}

export function dashboardStats(store: PosStore) {
  const paid = store.orders.filter((order) => order.status === "paid");
  const open = store.orders.filter((order) => !["paid", "cancelled"].includes(order.status));
  const revenue = paid.reduce((sum, order) => sum + orderTotal(order), 0);
  const occupied = store.tables.filter((table) => table.status !== "available").length;
  return {
    revenue,
    paidCount: paid.length,
    openCount: open.length,
    occupiedTables: occupied,
    availableTables: store.tables.length - occupied,
    topItems: topSellingItems(paid)
  };
}

function topSellingItems(orders: Order[]) {
  const counts = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const current = counts.get(item.menuItemId) ?? { name: item.name, qty: 0, revenue: 0 };
      current.qty += item.qty;
      current.revenue += item.qty * item.price;
      counts.set(item.menuItemId, current);
    }
  }
  return [...counts.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
}

export function addMenuItemDraft(categoryId: string, name: string, price: number) {
  return upsertMenuItem({
    id: createId("item"),
    categoryId,
    name,
    description: "",
    price,
    available: true
  });
}
