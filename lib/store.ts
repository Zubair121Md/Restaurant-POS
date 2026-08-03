import type {
  AttendanceRecord, Customer, DiningTable, Expense, Feedback, Ingredient, InstallState,
  LedgerEntry, MenuCategory, MenuItem, Order, OrderItem, OrderStatus, Payment, PosSettings,
  PosStore, PurchaseOrder, Recipe, Reservation, SessionUser, StaffMember, StockMovement,
  Transfer, Vendor, WaitlistEntry
} from "@/lib/types";
import {
  createId, seedBranches, seedCategories, seedCustomers, seedIngredients, seedMenu,
  seedRecipes, seedReservations, seedStaff, seedTables, seedVendors, seedWaitlist
} from "@/lib/seed";
import { getSmartAlerts } from "@/lib/analytics";

export { createId };

export const STORE_KEY = "restaurant-pos-store";
export const SESSION_KEY = "restaurant-pos-session";
export const PASSWORD_MIN_LENGTH = 6;

export const defaultInstall: InstallState = {
  language: "en", businessType: "restaurant", restaurantName: "", username: "", password: "", provider: "local"
};

export const defaultSettings: PosSettings = {
  currency: "USD",
  taxRate: 0.08,
  tipEnabled: true,
  gstEnabled: false,
  gstRate: 0,
  serviceChargeRate: 0,
  allowDiscounts: true,
  maxDiscountPercent: 20,
  offlineMode: true
};

function buildStore(install: PosStore["install"]): PosStore {
  return {
    version: 2,
    install,
    settings: { ...defaultSettings },
    branches: seedBranches(),
    activeBranchId: "branch_main",
    categories: seedCategories(),
    menu: seedMenu(),
    tables: seedTables(),
    reservations: seedReservations(),
    waitlist: seedWaitlist(),
    orders: [],
    ingredients: seedIngredients(),
    recipes: seedRecipes(),
    movements: [],
    purchaseOrders: [],
    vendors: seedVendors(),
    staff: seedStaff(),
    customers: seedCustomers(),
    feedback: [],
    ledger: [],
    expenses: [],
    alerts: [],
    transfers: [],
    orderSeq: 0
  };
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function normalizedItems(store: PosStore, items: OrderItem[]): OrderItem[] {
  return items.map((item) => ({
    ...item,
    station: item.station ?? store.menu.find((menuItem) => menuItem.id === item.menuItemId)?.station ?? "general"
  }));
}

function migrateStore(value: unknown): PosStore | null {
  if (!value || typeof value !== "object") return null;
  const legacy = value as Partial<PosStore> & { install?: PosStore["install"] };
  if (!legacy.install?.installedAt) return null;
  const base = buildStore(legacy.install);
  const merged = { ...base, ...legacy, version: 2, settings: { ...base.settings, ...(legacy.settings ?? {}) } } as PosStore;
  merged.branches = legacy.branches?.length ? legacy.branches : base.branches;
  merged.activeBranchId = legacy.activeBranchId ?? merged.branches[0]?.id ?? "branch_main";
  merged.menu = (legacy.menu ?? base.menu).map((item) => ({
    ...item,
    station: item.station ?? "general",
    prepMinutes: item.prepMinutes ?? 10,
    isActive: item.isActive ?? true
  }));
  merged.tables = (legacy.tables ?? base.tables).map((table) => ({
    ...table, branchId: table.branchId ?? merged.activeBranchId
  }));
  merged.orders = (legacy.orders ?? []).map((order, index) => ({
    ...order,
    branchId: order.branchId ?? merged.activeBranchId,
    orderNumber: order.orderNumber ?? `ORD-${String(index + 1).padStart(5, "0")}`,
    type: order.type ?? (order.tableId ? "dine_in" : "takeaway"),
    payments: order.payments ?? [],
    kotPriority: order.kotPriority ?? "normal",
    items: normalizedItems(merged, order.items ?? [])
  }));
  saveStore(merged);
  return merged;
}

export function loadStore(): PosStore | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    return migrateStore(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveStore(store: PosStore) {
  if (canUseStorage()) window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

function mutate(mutator: (store: PosStore) => void) {
  const store = loadStore();
  if (!store) return null;
  mutator(store);
  saveStore(store);
  return store;
}

export function isInstalled() {
  return Boolean(loadStore()?.install.installedAt);
}

export function completeInstall(form: InstallState) {
  const store = buildStore({ ...form, installedAt: new Date().toISOString() });
  const owner: StaffMember = {
    id: createId("staff"), branchId: store.activeBranchId, name: form.username, username: form.username,
    role: "owner", active: true, joinDate: new Date().toISOString().slice(0, 10), attendance: []
  };
  store.staff.unshift(owner);
  saveStore(store);
  setSession({
    id: createId("session"), username: form.username, role: "owner", restaurantName: form.restaurantName,
    branchId: store.activeBranchId, staffId: owner.id
  });
  return store;
}

export function resetInstall() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORE_KEY);
  window.localStorage.removeItem(SESSION_KEY);
}

export function setSession(user: SessionUser) {
  if (canUseStorage()) window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): SessionUser | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as SessionUser : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (canUseStorage()) window.localStorage.removeItem(SESSION_KEY);
}

export function authenticate(username: string, password: string): SessionUser | null {
  const store = loadStore();
  if (!store || password.length < PASSWORD_MIN_LENGTH) return null;
  const ownerLogin = username.trim().toLowerCase() === store.install.username.trim().toLowerCase();
  const staff = store.staff.find((item) => item.active && item.username.toLowerCase() === username.trim().toLowerCase());
  if (!ownerLogin && !staff) return null;

  const stored = store.install.password;
  const passwordConfigured = !stored || stored === "configured";
  const matchesInstallPassword = passwordConfigured || password === stored;
  const matchesPin = Boolean(staff?.pin && password === staff.pin);

  if (ownerLogin && !matchesInstallPassword) return null;
  if (!ownerLogin && !matchesPin && !matchesInstallPassword) return null;

  const user: SessionUser = {
    id: createId("session"),
    username: ownerLogin ? store.install.username : staff!.username,
    role: ownerLogin ? "owner" : staff!.role,
    restaurantName: store.install.restaurantName,
    branchId: staff?.branchId ?? store.activeBranchId,
    staffId: staff?.id
  };
  setSession(user);
  return user;
}

export function setActiveBranch(branchId: string) {
  return mutate((store) => {
    if (!store.branches.some((branch) => branch.id === branchId && branch.isActive)) throw new Error("Active branch not found");
    store.activeBranchId = branchId;
    const session = getSession();
    if (session) setSession({ ...session, branchId });
  });
}

export function updateSettings(settings: Partial<PosSettings>) {
  return mutate((store) => { store.settings = { ...store.settings, ...settings }; });
}

export function upsertCategory(category: MenuCategory) {
  return mutate((store) => {
    const index = store.categories.findIndex((item) => item.id === category.id);
    if (index >= 0) store.categories[index] = category; else store.categories.push(category);
    store.categories.sort((a, b) => a.sortOrder - b.sortOrder);
  });
}

export function upsertMenuItem(item: MenuItem) {
  return mutate((store) => {
    const index = store.menu.findIndex((entry) => entry.id === item.id);
    if (index >= 0) store.menu[index] = item; else store.menu.push(item);
  });
}

export function toggleMenuAvailability(itemId: string) {
  return mutate((store) => {
    store.menu = store.menu.map((item) => item.id === itemId ? { ...item, available: !item.available } : item);
  });
}

export function updateTable(tableId: string, patch: Partial<DiningTable>) {
  return mutate((store) => {
    store.tables = store.tables.map((table) => table.id === tableId ? { ...table, ...patch } : table);
  });
}

export function orderSubtotal(items: OrderItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function orderTotal(order: Pick<Order, "items" | "discount" | "taxRate" | "tip"> & Partial<Pick<Order, "gstAmount" | "serviceCharge">>) {
  const afterDiscount = Math.max(0, orderSubtotal(order.items) - order.discount);
  return afterDiscount + afterDiscount * order.taxRate + order.tip + (order.gstAmount ?? 0) + (order.serviceCharge ?? 0);
}

export function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function createOrder(input: {
  branchId?: string; tableId?: string; customerId?: string; waiterId?: string; createdBy: string;
  type?: Order["type"]; items?: OrderItem[]; kotPriority?: Order["kotPriority"];
}) {
  const store = loadStore();
  if (!store) return null;
  const branchId = input.branchId ?? store.activeBranchId;
  const table = store.tables.find((entry) => entry.id === input.tableId && entry.branchId === branchId);
  const now = new Date().toISOString();
  store.orderSeq += 1;
  const items = normalizedItems(store, input.items ?? []);
  const subtotal = orderSubtotal(items);
  const order: Order = {
    id: createId("ord"), branchId, orderNumber: `${store.branches.find((b) => b.id === branchId)?.code ?? "ORD"}-${String(store.orderSeq).padStart(5, "0")}`,
    tableId: table?.id, tableLabel: table?.label, customerId: input.customerId, waiterId: input.waiterId,
    type: input.type ?? (table ? "dine_in" : "takeaway"), items, status: "pending", createdAt: now, updatedAt: now,
    createdBy: input.createdBy, discount: 0, taxRate: store.settings.taxRate, tip: 0,
    gstAmount: store.settings.gstEnabled ? subtotal * store.settings.gstRate : 0,
    serviceCharge: subtotal * store.settings.serviceChargeRate, payments: [],
    kotPriority: input.kotPriority ?? "normal", isOffline: store.settings.offlineMode
  };
  store.orders.unshift(order);
  if (table) Object.assign(table, { status: "occupied", activeOrderId: order.id });
  saveStore(store);
  return { store, order };
}

export function getOrder(orderId: string) {
  return loadStore()?.orders.find((order) => order.id === orderId) ?? null;
}

export function updateOrderItems(orderId: string, items: OrderItem[]) {
  return mutate((store) => {
    const order = store.orders.find((entry) => entry.id === orderId);
    if (!order || ["paid", "cancelled"].includes(order.status)) return;
    order.items = normalizedItems(store, items);
    const taxable = Math.max(0, orderSubtotal(order.items) - order.discount);
    order.gstAmount = store.settings.gstEnabled ? taxable * store.settings.gstRate : 0;
    order.serviceCharge = taxable * store.settings.serviceChargeRate;
    order.updatedAt = new Date().toISOString();
  });
}

export function patchOrder(orderId: string, patch: Partial<Order>) {
  return mutate((store) => {
    const order = store.orders.find((entry) => entry.id === orderId);
    if (!order || ["paid", "cancelled"].includes(order.status)) return;
    Object.assign(order, patch, { id: order.id, branchId: order.branchId, updatedAt: new Date().toISOString() });
    if (patch.items) order.items = normalizedItems(store, patch.items);
  });
}

export function setOrderStatus(orderId: string, status: OrderStatus) {
  return mutate((store) => {
    const order = store.orders.find((entry) => entry.id === orderId);
    if (!order) return;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (status === "ready") order.items.forEach((item) => { item.preparedAt ??= order.updatedAt; });
    const table = store.tables.find((item) => item.id === order.tableId);
    if (table && ["paid", "cancelled"].includes(status)) Object.assign(table, { status: "available", activeOrderId: undefined });
    else if (table && status === "ready") table.status = "billing";
  });
}

export function sendKot(orderId: string, priority?: Order["kotPriority"]) {
  return mutate((store) => {
    const order = store.orders.find((entry) => entry.id === orderId);
    if (!order || ["paid", "cancelled"].includes(order.status)) return;
    const now = new Date().toISOString();
    order.status = "preparing";
    order.kotPriority = priority ?? order.kotPriority;
    order.items.forEach((item) => {
      item.kotSentAt ??= now;
      item.priority = order.kotPriority;
    });
    order.updatedAt = now;
  });
}

export function payOrder(orderId: string, payment: Payment["method"] | Payment[], tip = 0) {
  return mutate((store) => {
    const order = store.orders.find((entry) => entry.id === orderId);
    if (!order || order.status === "paid" || order.status === "cancelled") return;
    order.tip = tip;
    const now = new Date().toISOString();
    const total = orderTotal(order);
    order.payments = Array.isArray(payment) ? payment : [{ id: createId("pay"), method: payment, amount: total, paidAt: now }];
    order.paymentMethod = order.payments[0]?.method;
    order.status = "paid";
    order.updatedAt = now;
    const table = store.tables.find((item) => item.id === order.tableId);
    if (table) Object.assign(table, { status: "available", activeOrderId: undefined });

    for (const line of order.items) {
      const recipe = store.recipes.find((item) => item.menuItemId === line.menuItemId);
      if (!recipe) continue;
      for (const recipeLine of recipe.ingredients) {
        const qty = recipeLine.qty / Math.max(1, recipe.yieldPortions) * line.qty * (1 + recipeLine.wastePercent / 100);
        const ingredient = store.ingredients.find((item) => item.id === recipeLine.ingredientId && item.branchId === order.branchId)
          ?? store.ingredients.find((item) => item.id === recipeLine.ingredientId);
        if (!ingredient) continue;
        ingredient.stockQty = Math.max(0, ingredient.stockQty - qty);
        store.movements.push({
          id: createId("mov"), branchId: order.branchId, ingredientId: ingredient.id, type: "sale_deduct",
          qty: -qty, note: `Inventory used by ${order.orderNumber}`, createdAt: now, createdBy: order.createdBy, refId: order.id
        });
      }
    }
    store.ledger.push({
      id: createId("ledger"), branchId: order.branchId, type: "sale", category: "Food sales",
      amount: total, note: order.orderNumber, refId: order.id, createdAt: now, createdBy: order.createdBy
    });
    if (order.customerId) {
      const customer = store.customers.find((item) => item.id === order.customerId);
      if (customer) {
        customer.visits += 1;
        customer.totalSpend += total;
        customer.loyaltyPoints += Math.floor(total);
        customer.lastVisitAt = now;
      }
    }
    order.items.forEach((item) => { item.preparedAt ??= now; });
    store.alerts = getSmartAlerts(store, store.activeBranchId);
  });
}

export function applyDiscount(orderId: string, amount: number, reason: string, approvedBy?: string) {
  return mutate((store) => {
    const order = store.orders.find((item) => item.id === orderId);
    if (!order || order.status === "paid" || !store.settings.allowDiscounts) return;
    const max = orderSubtotal(order.items) * store.settings.maxDiscountPercent / 100;
    if (amount > max && !approvedBy) throw new Error("Discount above the configured limit requires approval");
    order.discount = Math.max(0, Math.min(amount, orderSubtotal(order.items)));
    order.discountReason = reason;
    order.discountApprovedBy = approvedBy;
    order.updatedAt = new Date().toISOString();
  });
}

export function splitBill(orderId: string, groups: OrderItem[][]) {
  const store = loadStore();
  if (!store || groups.length < 2) return null;
  const original = store.orders.find((item) => item.id === orderId);
  if (!original || original.status === "paid") return null;
  const splitGroupId = original.splitGroupId ?? createId("split");
  const now = new Date().toISOString();
  original.items = normalizedItems(store, groups[0]);
  original.splitGroupId = splitGroupId;
  original.updatedAt = now;
  const created = groups.slice(1).map((items) => {
    store.orderSeq += 1;
    return {
      ...original, id: createId("ord"), orderNumber: `${store.branches.find((b) => b.id === original.branchId)?.code ?? "ORD"}-${String(store.orderSeq).padStart(5, "0")}`,
      tableId: undefined, tableLabel: original.tableLabel, items: normalizedItems(store, items), discount: 0,
      payments: [], status: "pending" as const, createdAt: now, updatedAt: now
    };
  });
  store.orders.unshift(...created);
  saveStore(store);
  return { store, orders: [original, ...created] };
}

export function mergeBills(targetOrderId: string, sourceOrderIds: string[]) {
  return mutate((store) => {
    const target = store.orders.find((item) => item.id === targetOrderId);
    const sources = store.orders.filter((item) => sourceOrderIds.includes(item.id) && item.id !== targetOrderId && item.status !== "paid");
    if (!target || target.status === "paid") return;
    target.items.push(...sources.flatMap((item) => item.items));
    target.discount += sources.reduce((sum, item) => sum + item.discount, 0);
    target.mergedFrom = [...(target.mergedFrom ?? []), ...sources.map((item) => item.id)];
    target.updatedAt = new Date().toISOString();
    for (const source of sources) {
      source.status = "cancelled";
      source.updatedAt = target.updatedAt;
      const table = store.tables.find((item) => item.activeOrderId === source.id);
      if (table) Object.assign(table, { status: "available", activeOrderId: undefined });
    }
  });
}

export function createReservation(input: Omit<Reservation, "id" | "status"> & Partial<Pick<Reservation, "id" | "status">>) {
  let created: Reservation | null = null;
  const store = mutate((state) => {
    created = { ...input, id: input.id ?? createId("res"), status: input.status ?? "booked" };
    state.reservations.push(created);
    const table = state.tables.find((item) => item.id === created?.tableId);
    if (table) table.status = "reserved";
  });
  return store && created ? { store, reservation: created } : null;
}

export function updateReservation(id: string, patch: Partial<Reservation>) {
  return mutate((store) => {
    const reservation = store.reservations.find((item) => item.id === id);
    if (reservation) Object.assign(reservation, patch);
  });
}

export function seatReservation(id: string, tableId?: string) {
  return mutate((store) => {
    const reservation = store.reservations.find((item) => item.id === id);
    if (!reservation) return;
    reservation.status = "seated";
    reservation.tableId = tableId ?? reservation.tableId;
    const table = store.tables.find((item) => item.id === reservation.tableId);
    if (table) table.status = "occupied";
  });
}

export function addWaitlist(input: Omit<WaitlistEntry, "id" | "createdAt" | "status"> & Partial<Pick<WaitlistEntry, "id" | "createdAt" | "status">>) {
  let created: WaitlistEntry | null = null;
  const store = mutate((state) => {
    created = { ...input, id: input.id ?? createId("wait"), createdAt: input.createdAt ?? new Date().toISOString(), status: input.status ?? "waiting" };
    state.waitlist.push(created);
  });
  return store && created ? { store, entry: created } : null;
}

export function seatWaitlist(id: string, tableId: string) {
  return mutate((store) => {
    const entry = store.waitlist.find((item) => item.id === id);
    if (entry) entry.status = "seated";
    const table = store.tables.find((item) => item.id === tableId);
    if (table) table.status = "occupied";
  });
}

export function updateWaitlist(id: string, patch: Partial<WaitlistEntry>) {
  return mutate((store) => {
    const entry = store.waitlist.find((item) => item.id === id);
    if (entry) Object.assign(entry, patch);
  });
}

export function upsertIngredient(ingredient: Ingredient) {
  return mutate((store) => {
    const index = store.ingredients.findIndex((item) => item.id === ingredient.id);
    if (index >= 0) store.ingredients[index] = ingredient; else store.ingredients.push(ingredient);
  });
}

function stockChange(store: PosStore, ingredientId: string, qty: number, type: StockMovement["type"], note: string, createdBy: string, refId?: string) {
  const ingredient = store.ingredients.find((item) => item.id === ingredientId);
  if (!ingredient) throw new Error("Ingredient not found");
  ingredient.stockQty = Math.max(0, ingredient.stockQty + qty);
  store.movements.push({ id: createId("mov"), branchId: ingredient.branchId, ingredientId, type, qty, note, createdAt: new Date().toISOString(), createdBy, refId });
}

export function recordWastage(ingredientId: string, qty: number, note: string, createdBy: string) {
  return mutate((store) => stockChange(store, ingredientId, -Math.abs(qty), "wastage", note, createdBy));
}

export function adjustStock(ingredientId: string, qty: number, note: string, createdBy: string) {
  return mutate((store) => stockChange(store, ingredientId, qty, "adjustment", note, createdBy));
}

export function receivePurchase(ingredientId: string, qty: number, unitCost: number, createdBy: string, refId?: string) {
  return mutate((store) => {
    const ingredient = store.ingredients.find((item) => item.id === ingredientId);
    if (!ingredient) return;
    ingredient.costPerUnit = unitCost;
    stockChange(store, ingredientId, Math.abs(qty), "purchase", "Purchase received", createdBy, refId);
  });
}

export function upsertRecipe(recipe: Recipe) {
  return mutate((store) => {
    const index = store.recipes.findIndex((item) => item.id === recipe.id);
    if (index >= 0) store.recipes[index] = recipe; else store.recipes.push(recipe);
  });
}

export function calculateRecipeCost(recipeId: string) {
  const store = loadStore();
  const recipe = store?.recipes.find((item) => item.id === recipeId);
  if (!store || !recipe) return 0;
  return recipe.ingredients.reduce((sum, line) => {
    const ingredient = store.ingredients.find((item) => item.id === line.ingredientId);
    return sum + (ingredient?.costPerUnit ?? 0) * line.qty * (1 + line.wastePercent / 100);
  }, 0) / Math.max(1, recipe.yieldPortions);
}

export function upsertVendor(vendor: Vendor) {
  return mutate((store) => {
    const index = store.vendors.findIndex((item) => item.id === vendor.id);
    if (index >= 0) store.vendors[index] = vendor; else store.vendors.push(vendor);
  });
}

export function createPurchaseOrder(input: Omit<PurchaseOrder, "id" | "createdAt" | "status"> & Partial<Pick<PurchaseOrder, "id" | "createdAt" | "status">>) {
  let created: PurchaseOrder | null = null;
  const store = mutate((state) => {
    created = { ...input, id: input.id ?? createId("po"), createdAt: input.createdAt ?? new Date().toISOString(), status: input.status ?? "draft" };
    state.purchaseOrders.unshift(created);
  });
  return store && created ? { store, purchaseOrder: created } : null;
}

export function receivePurchaseOrder(id: string, createdBy: string, received?: { ingredientId: string; qty: number }[]) {
  return mutate((store) => {
    const po = store.purchaseOrders.find((item) => item.id === id);
    if (!po || ["received", "cancelled"].includes(po.status)) return;
    const lines = received ?? po.items.map((item) => ({ ingredientId: item.ingredientId, qty: item.qty }));
    for (const line of lines) {
      const poLine = po.items.find((item) => item.ingredientId === line.ingredientId);
      const ingredient = store.ingredients.find((item) => item.id === line.ingredientId);
      if (!poLine || !ingredient) continue;
      ingredient.costPerUnit = poLine.unitCost;
      stockChange(store, ingredient.id, Math.abs(line.qty), "purchase", `Received ${po.id}`, createdBy, po.id);
    }
    po.status = received ? "partial" : "received";
    if (!received) po.receivedAt = new Date().toISOString();
  });
}

export function upsertStaff(staff: StaffMember) {
  return mutate((store) => {
    const index = store.staff.findIndex((item) => item.id === staff.id);
    if (index >= 0) store.staff[index] = staff; else store.staff.push(staff);
  });
}

export function markAttendance(staffId: string, record: AttendanceRecord) {
  return mutate((store) => {
    const staff = store.staff.find((item) => item.id === staffId);
    if (!staff) return;
    const index = staff.attendance.findIndex((item) => item.id === record.id || item.date === record.date);
    if (index >= 0) staff.attendance[index] = record; else staff.attendance.push(record);
  });
}

export function upsertCustomer(customer: Customer) {
  return mutate((store) => {
    const index = store.customers.findIndex((item) => item.id === customer.id);
    if (index >= 0) store.customers[index] = customer; else store.customers.push(customer);
  });
}

export function addFeedback(input: Omit<Feedback, "id" | "createdAt" | "status"> & Partial<Pick<Feedback, "id" | "createdAt" | "status">>) {
  return mutate((store) => {
    store.feedback.unshift({ ...input, id: input.id ?? createId("feedback"), createdAt: input.createdAt ?? new Date().toISOString(), status: input.status ?? "open" });
  });
}

export function resolveFeedback(id: string) {
  return mutate((store) => {
    const feedback = store.feedback.find((item) => item.id === id);
    if (feedback) feedback.status = "resolved";
  });
}

export function addLedgerEntry(entry: Omit<LedgerEntry, "id" | "createdAt"> & Partial<Pick<LedgerEntry, "id" | "createdAt">>) {
  return mutate((store) => {
    store.ledger.unshift({ ...entry, id: entry.id ?? createId("ledger"), createdAt: entry.createdAt ?? new Date().toISOString() });
  });
}

export function addExpense(input: Omit<Expense, "id" | "createdAt"> & Partial<Pick<Expense, "id" | "createdAt">>, createdBy = "system") {
  return mutate((store) => {
    const expense = { ...input, id: input.id ?? createId("expense"), createdAt: input.createdAt ?? new Date().toISOString() };
    store.expenses.unshift(expense);
    store.ledger.unshift({ id: createId("ledger"), branchId: expense.branchId, type: "expense", category: expense.category, amount: expense.amount, note: expense.note, refId: expense.id, createdAt: expense.createdAt, createdBy });
  });
}

export function createTransfer(input: Omit<Transfer, "id" | "createdAt" | "status"> & Partial<Pick<Transfer, "id" | "createdAt" | "status">>) {
  let created: Transfer | null = null;
  const store = mutate((state) => {
    created = { ...input, id: input.id ?? createId("transfer"), createdAt: input.createdAt ?? new Date().toISOString(), status: input.status ?? "pending" };
    state.transfers.unshift(created);
  });
  return store && created ? { store, transfer: created } : null;
}

export function completeTransfer(id: string, createdBy: string) {
  return mutate((store) => {
    const transfer = store.transfers.find((item) => item.id === id);
    if (!transfer || transfer.status !== "pending") return;
    const source = store.ingredients.find((item) => item.id === transfer.ingredientId && item.branchId === transfer.fromBranchId)
      ?? store.ingredients.find((item) => item.id === transfer.ingredientId);
    if (!source || source.stockQty < transfer.qty) throw new Error("Insufficient stock for transfer");
    source.stockQty -= transfer.qty;
    let target = store.ingredients.find((item) => item.branchId === transfer.toBranchId && item.name === source.name);
    if (!target) {
      target = { ...source, id: createId("ing"), branchId: transfer.toBranchId, stockQty: 0 };
      store.ingredients.push(target);
    }
    target.stockQty += transfer.qty;
    const now = new Date().toISOString();
    store.movements.push(
      { id: createId("mov"), branchId: transfer.fromBranchId, ingredientId: source.id, type: "transfer_out", qty: -transfer.qty, createdAt: now, createdBy, refId: transfer.id },
      { id: createId("mov"), branchId: transfer.toBranchId, ingredientId: target.id, type: "transfer_in", qty: transfer.qty, createdAt: now, createdBy, refId: transfer.id }
    );
    transfer.status = "completed";
  });
}

export function refreshAlerts() {
  return mutate((store) => { store.alerts = getSmartAlerts(store, store.activeBranchId); });
}

export function getStoreSnapshot() {
  const store = loadStore();
  return store ? structuredClone(store) : null;
}

export function dashboardStats(store: PosStore) {
  const paid = store.orders.filter((order) => order.status === "paid");
  const open = store.orders.filter((order) => !["paid", "cancelled"].includes(order.status));
  const branchTables = store.tables.filter((table) => table.branchId === store.activeBranchId);
  const occupied = branchTables.filter((table) => table.status !== "available").length;
  const counts = new Map<string, { name: string; qty: number; revenue: number }>();
  paid.forEach((order) => order.items.forEach((item) => {
    const row = counts.get(item.menuItemId) ?? { name: item.name, qty: 0, revenue: 0 };
    row.qty += item.qty; row.revenue += item.qty * item.price; counts.set(item.menuItemId, row);
  }));
  return {
    revenue: paid.reduce((sum, order) => sum + orderTotal(order), 0),
    paidCount: paid.length, openCount: open.length, occupiedTables: occupied,
    availableTables: branchTables.length - occupied,
    topItems: [...counts.values()].sort((a, b) => b.qty - a.qty).slice(0, 5)
  };
}

export function addMenuItemDraft(categoryId: string, name: string, price: number) {
  return upsertMenuItem({
    id: createId("item"), categoryId, name, description: "", price, available: true,
    station: "general", prepMinutes: 10, isActive: true
  });
}
