import type { Alert, Order, PosStore, Recipe } from "@/lib/types";

export function getTodayBounds(now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function filterOrdersForBranch(store: PosStore, branchId?: string) {
  const selectedBranch = branchId ?? store.activeBranchId;
  return store.orders.filter((order) => !selectedBranch || order.branchId === selectedBranch);
}

function recipeCost(store: PosStore, recipe?: Recipe) {
  if (!recipe) return 0;
  const yieldPortions = Math.max(1, recipe.yieldPortions);
  return recipe.ingredients.reduce((sum, line) => {
    const ingredient = store.ingredients.find((item) => item.id === line.ingredientId);
    return sum + (ingredient?.costPerUnit ?? 0) * line.qty * (1 + line.wastePercent / 100) / yieldPortions;
  }, 0);
}

function orderRevenue(order: Order) {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discounted = Math.max(0, subtotal - order.discount);
  const tax = discounted * order.taxRate;
  return discounted + tax + order.tip + (order.gstAmount ?? 0) + (order.serviceCharge ?? 0);
}

export function computeKpis(store: PosStore, branchId?: string) {
  const selectedBranch = branchId ?? store.activeBranchId;
  const { start, end } = getTodayBounds();
  const orders = filterOrdersForBranch(store, selectedBranch);
  const todayOrders = orders.filter((order) => order.createdAt >= start && order.createdAt < end);
  const paidToday = todayOrders.filter((order) => order.status === "paid");
  const revenueToday = paidToday.reduce((sum, order) => sum + orderRevenue(order), 0);
  const foodCost = paidToday.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => {
    const recipe = store.recipes.find((entry) => entry.menuItemId === item.menuItemId);
    return itemSum + recipeCost(store, recipe) * item.qty;
  }, 0), 0);
  const laborCost = store.staff
    .filter((staff) => staff.branchId === selectedBranch)
    .reduce((sum, staff) => sum + staff.attendance
      .filter((record) => record.date >= start.slice(0, 10) && record.date < end.slice(0, 10) && record.checkIn)
      .reduce((staffSum, record) => {
        const checkIn = new Date(record.checkIn!).getTime();
        const checkOut = record.checkOut ? new Date(record.checkOut).getTime() : Date.now();
        return staffSum + Math.max(0, checkOut - checkIn) / 3600000 * (staff.hourlyRate ?? 0);
      }, 0), 0);
  const expensesToday = store.expenses
    .filter((expense) => expense.branchId === selectedBranch && expense.createdAt >= start && expense.createdAt < end)
    .reduce((sum, expense) => sum + expense.amount, 0);
  const branchTables = store.tables.filter((table) => table.branchId === selectedBranch);
  const occupiedTables = branchTables.filter((table) => table.status !== "available" && table.status !== "dirty").length;
  const prepTimes = todayOrders.flatMap((order) => order.items)
    .filter((item) => item.kotSentAt && item.preparedAt)
    .map((item) => (new Date(item.preparedAt!).getTime() - new Date(item.kotSentAt!).getTime()) / 60000)
    .filter((minutes) => minutes >= 0);
  const customerIds = new Set(paidToday.flatMap((order) => order.customerId ? [order.customerId] : []));
  const repeatCustomers = [...customerIds].filter((id) => (store.customers.find((customer) => customer.id === id)?.visits ?? 0) > 1).length;
  const ingredients = store.ingredients.filter((ingredient) => ingredient.branchId === selectedBranch);
  const inventoryValue = ingredients.reduce((sum, ingredient) => sum + ingredient.stockQty * ingredient.costPerUnit, 0);
  const wastageValue = store.movements
    .filter((movement) => movement.branchId === selectedBranch && movement.type === "wastage" && movement.createdAt >= start && movement.createdAt < end)
    .reduce((sum, movement) => sum + Math.abs(movement.qty) * (store.ingredients.find((item) => item.id === movement.ingredientId)?.costPerUnit ?? 0), 0);
  const grossMargin = revenueToday - foodCost;

  return {
    revenueToday,
    ordersToday: paidToday.length,
    aov: paidToday.length ? revenueToday / paidToday.length : 0,
    foodCostPct: revenueToday ? foodCost / revenueToday * 100 : 0,
    laborCostPct: revenueToday ? laborCost / revenueToday * 100 : 0,
    grossMargin,
    netProfit: grossMargin - laborCost - expensesToday,
    tableOccupancy: branchTables.length ? occupiedTables / branchTables.length * 100 : 0,
    avgPrepMinutes: prepTimes.length ? prepTimes.reduce((sum, value) => sum + value, 0) / prepTimes.length : 0,
    repeatCustomerRate: customerIds.size ? repeatCustomers / customerIds.size * 100 : 0,
    inventoryValue,
    wastageValue,
    openTickets: orders.filter((order) => !["paid", "cancelled"].includes(order.status)).length,
    occupiedTables
  };
}

export function topSellingItems(store: PosStore, branchId?: string, limit = 5) {
  const totals = new Map<string, { menuItemId: string; name: string; qty: number; revenue: number }>();
  for (const order of filterOrdersForBranch(store, branchId).filter((entry) => entry.status === "paid")) {
    for (const item of order.items) {
      const row = totals.get(item.menuItemId) ?? { menuItemId: item.menuItemId, name: item.name, qty: 0, revenue: 0 };
      row.qty += item.qty;
      row.revenue += item.qty * item.price;
      totals.set(item.menuItemId, row);
    }
  }
  return [...totals.values()].sort((a, b) => b.qty - a.qty).slice(0, limit);
}

export function leastProfitableItems(store: PosStore, branchId?: string, limit = 5) {
  const sales = topSellingItems(store, branchId, Number.MAX_SAFE_INTEGER);
  return sales.map((sale) => {
    const menuItem = store.menu.find((item) => item.id === sale.menuItemId);
    const recipe = store.recipes.find((item) => item.menuItemId === sale.menuItemId);
    const unitCost = recipe ? recipeCost(store, recipe) : (menuItem?.costPrice ?? 0);
    const profit = sale.revenue - unitCost * sale.qty;
    return { ...sale, unitCost, profit, marginPct: sale.revenue ? profit / sale.revenue * 100 : 0 };
  }).sort((a, b) => a.marginPct - b.marginPct).slice(0, limit);
}

export function peakHourBuckets(store: PosStore, branchId?: string) {
  const buckets = Array.from({ length: 24 }, (_, hour) => ({ hour, orders: 0, revenue: 0 }));
  for (const order of filterOrdersForBranch(store, branchId).filter((entry) => entry.status === "paid")) {
    const bucket = buckets[new Date(order.createdAt).getHours()];
    bucket.orders += 1;
    bucket.revenue += orderRevenue(order);
  }
  return buckets;
}

export function getSmartAlerts(store: PosStore, branchId?: string): Alert[] {
  const selectedBranch = branchId ?? store.activeBranchId;
  const now = Date.now();
  const alerts: Alert[] = [];
  const makeAlert = (severity: Alert["severity"], module: string, key: string, title: string, message: string, meta?: Alert["meta"]) => {
    alerts.push({ id: `smart_${module}_${key}`, severity, module, title, message, createdAt: new Date().toISOString(), resolved: false, meta });
  };

  for (const ingredient of store.ingredients.filter((item) => item.branchId === selectedBranch)) {
    if (ingredient.stockQty <= ingredient.reorderLevel) {
      makeAlert(ingredient.stockQty <= 0 ? "critical" : "warning", "inventory", `low_${ingredient.id}`, "Low stock", `${ingredient.name} has ${ingredient.stockQty} ${ingredient.unit} remaining.`, { ingredientId: ingredient.id });
    }
    if (ingredient.expiryDate) {
      const days = (new Date(ingredient.expiryDate).getTime() - now) / 86400000;
      if (days <= 3) makeAlert(days < 0 ? "critical" : "warning", "inventory", `expiry_${ingredient.id}`, "Ingredient expiring", `${ingredient.name} ${days < 0 ? "has expired" : `expires in ${Math.ceil(days)} day(s)`}.`, { ingredientId: ingredient.id });
    }
  }

  const weekAgo = now - 7 * 86400000;
  const wastageValue = store.movements.filter((movement) =>
    movement.branchId === selectedBranch && movement.type === "wastage" && new Date(movement.createdAt).getTime() >= weekAgo
  ).reduce((sum, movement) => sum + Math.abs(movement.qty) * (store.ingredients.find((item) => item.id === movement.ingredientId)?.costPerUnit ?? 0), 0);
  const inventoryValue = store.ingredients.filter((item) => item.branchId === selectedBranch).reduce((sum, item) => sum + item.stockQty * item.costPerUnit, 0);
  if (wastageValue > Math.max(25, inventoryValue * 0.05)) {
    makeAlert("warning", "inventory", "wastage", "High wastage", `Wastage reached ${wastageValue.toFixed(2)} in the last 7 days.`);
  }

  for (const order of filterOrdersForBranch(store, selectedBranch).filter((item) => !["paid", "cancelled"].includes(item.status))) {
    for (const item of order.items.filter((line) => line.kotSentAt && !line.preparedAt)) {
      const menuItem = store.menu.find((entry) => entry.id === item.menuItemId);
      if (menuItem && now - new Date(item.kotSentAt!).getTime() > menuItem.prepMinutes * 1.5 * 60000) {
        makeAlert("critical", "kitchen", `slow_${order.id}_${item.id}`, "Slow kitchen ticket", `${item.name} on ${order.orderNumber} exceeded its prep target.`, { orderId: order.id, itemId: item.id });
      }
    }
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const discountPct = subtotal ? order.discount / subtotal * 100 : 0;
    if (discountPct > store.settings.maxDiscountPercent) {
      makeAlert("critical", "sales", `discount_${order.id}`, "Unusual discount", `${order.orderNumber} has a ${discountPct.toFixed(1)}% discount.`, { orderId: order.id });
    }
  }

  for (const feedback of store.feedback.filter((item) => item.status === "open")) {
    makeAlert(feedback.rating <= 2 ? "critical" : "warning", "feedback", feedback.id, "Unresolved feedback", `${feedback.rating}-star feedback needs follow-up.`, { feedbackId: feedback.id });
  }
  return alerts;
}
