import { COMPANY, DEMO } from "@/lib/brand";
import { computeKpis, getSmartAlerts, topSellingItems } from "@/lib/analytics";
import { formatMoney } from "@/lib/store";
import type { PosStore } from "@/lib/types";

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export const ASSISTANT_NAME = "MIA Assistant";

export const SUGGESTED_PROMPTS = [
  "How are sales today?",
  "What is low in stock?",
  "Any kitchen delays?",
  "Top selling items?",
  "Show table occupancy",
  "Help me run a discount"
];

function match(text: string, words: string[]) {
  const lower = text.toLowerCase();
  return words.some((word) => lower.includes(word));
}

export function createWelcomeMessage(store: PosStore | null, branchId?: string): ChatMessage {
  const branch = store?.branches.find((item) => item.id === (branchId || store.activeBranchId));
  return {
    id: `msg_welcome_${Date.now()}`,
    role: "assistant",
    createdAt: new Date().toISOString(),
    content: [
      `Hi — I'm **${ASSISTANT_NAME}**, the showcase AI copilot from **${COMPANY.legalName}**.`,
      "",
      `You're in the **${DEMO.restaurantName}** demo${branch ? ` (${branch.name})` : ""}. Ask me about sales, stock, kitchen, tables, customers, or how to use any module.`,
      "",
      "_This is a product demo assistant — responses are simulated from live local POS data to show what an AI layer can do._"
    ].join("\n")
  };
}

export function replyToMessage(input: string, store: PosStore | null, branchId?: string): string {
  const text = input.trim();
  if (!text) return "Ask me anything about today's restaurant operations.";

  if (!store) {
    return `I need an active Spice Garden workspace first. Open **/setup** and launch the demo, then come back — ${COMPANY.shortName} can wire this to a real model later.`;
  }

  const selected = branchId || store.activeBranchId;
  const branch = store.branches.find((item) => item.id === selected);
  const kpi = computeKpis(store, selected);
  const money = (value: number) => formatMoney(value, store.settings.currency);
  const alerts = getSmartAlerts(store, selected).filter((alert) => !alert.resolved);
  const sellers = topSellingItems(store, selected, 3);
  const openOrders = store.orders.filter((order) => order.branchId === selected && !["paid", "cancelled"].includes(order.status));
  const lowStock = store.ingredients.filter((item) => item.branchId === selected && item.stockQty <= item.reorderLevel);
  const expiring = store.ingredients.filter((item) => {
    if (item.branchId !== selected || !item.expiryDate) return false;
    const days = (new Date(item.expiryDate).getTime() - Date.now()) / 86400000;
    return days <= 3;
  });

  if (match(text, ["hello", "hi", "hey", "namaste"])) {
    return `Namaste! I can brief you on **${branch?.name ?? DEMO.restaurantName}** right now — sales, kitchen, stock, or CRM. Try “How are sales today?”`;
  }

  if (match(text, ["who are you", "what are you", "mia assistant", "chatbot", "ai"])) {
    return [
      `I'm **${ASSISTANT_NAME}** by **${COMPANY.legalName}** — a showcase copilot embedded in Restaurant POS.`,
      "",
      "In production this panel can connect to OpenAI / Azure / an on-prem model. In this demo I read your live local store and answer like an operations analyst."
    ].join("\n");
  }

  if (match(text, ["sales", "revenue", "earning", "aov", "orders today", "how are we doing", "pnl", "profit"])) {
    return [
      `**Today at ${branch?.name ?? "this branch"}**`,
      `• Revenue: **${money(kpi.revenueToday)}**`,
      `• Paid orders: **${kpi.ordersToday}**`,
      `• AOV: **${money(kpi.aov)}**`,
      `• Gross margin: **${money(kpi.grossMargin)}**`,
      `• Food cost: **${kpi.foodCostPct.toFixed(1)}%** · Labor: **${kpi.laborCostPct.toFixed(1)}%**`,
      `• Net (after labor/expenses): **${money(kpi.netProfit)}**`,
      "",
      openOrders.length ? `There are still **${openOrders.length} open tickets** on the floor.` : "No open tickets — floor is clear."
    ].join("\n");
  }

  if (match(text, ["stock", "inventory", "low stock", "reorder", "expiry", "wastage", "ingredient"])) {
    const lines = [
      `**Inventory pulse — ${branch?.name ?? "branch"}**`,
      `• On-hand value: **${money(kpi.inventoryValue)}**`,
      `• Wastage today: **${money(kpi.wastageValue)}**`,
      `• Below reorder: **${lowStock.length}** items`,
      `• Expiring ≤ 3 days: **${expiring.length}** items`
    ];
    if (lowStock.length) {
      lines.push("", "**Reorder now:**");
      lowStock.slice(0, 5).forEach((item) => {
        lines.push(`• ${item.name} — ${item.stockQty} ${item.unit} (reorder ${item.reorderLevel})`);
      });
    }
    if (expiring.length) {
      lines.push("", "**Watch expiry:**");
      expiring.slice(0, 4).forEach((item) => {
        lines.push(`• ${item.name} — expires ${new Date(item.expiryDate!).toLocaleDateString("en-IN")}`);
      });
    }
    lines.push("", "Open **Inventory** or **Procurement** to raise a PO — I can draft suggestions in a live AI build.");
    return lines.join("\n");
  }

  if (match(text, ["kitchen", "kot", "prep", "delay", "chef", "station"])) {
    const delayed = openOrders.flatMap((order) =>
      order.items
        .filter((item) => item.kotSentAt && !item.preparedAt)
        .map((item) => {
          const menu = store.menu.find((entry) => entry.id === item.menuItemId);
          const elapsed = (Date.now() - new Date(item.kotSentAt!).getTime()) / 60000;
          const limit = (menu?.prepMinutes ?? 12) * 1.5;
          return { order: order.orderNumber, name: item.name, elapsed, delayed: elapsed > limit, station: item.station };
        })
    );
    const late = delayed.filter((item) => item.delayed);
    return [
      `**Kitchen board summary**`,
      `• Open tickets: **${openOrders.length}**`,
      `• Avg prep (completed today): **${kpi.avgPrepMinutes.toFixed(1)} min**`,
      `• Items cooking now: **${delayed.length}**`,
      `• Likely delayed: **${late.length}**`,
      "",
      ...(late.length
        ? late.slice(0, 4).map((item) => `• ${item.name} on ${item.order} (~${item.elapsed.toFixed(0)} min, ${item.station})`)
        : ["Kitchen looks on pace — no rush alerts from prep timers."]),
      "",
      "Jump to **Kitchen display** for the live KDS."
    ].join("\n");
  }

  if (match(text, ["table", "occupancy", "floor", "reservation", "waitlist", "seat"])) {
    const tables = store.tables.filter((table) => table.branchId === selected);
    const waiting = store.waitlist.filter((entry) => entry.branchId === selected && entry.status === "waiting");
    const booked = store.reservations.filter((entry) => entry.branchId === selected && entry.status === "booked");
    return [
      `**Floor status**`,
      `• Occupancy: **${kpi.tableOccupancy.toFixed(0)}%** (${kpi.occupiedTables} busy)`,
      `• Tables total: **${tables.length}**`,
      `• Waitlist parties: **${waiting.length}**`,
      `• Upcoming reservations: **${booked.length}**`,
      "",
      waiting.length
        ? `Next waitlist: **${waiting[0].guestName}** (party of ${waiting[0].partySize}).`
        : "Waitlist is empty.",
      "",
      "Use **Tables** / **Reservations** to seat guests."
    ].join("\n");
  }

  if (match(text, ["top", "best sell", "popular", "menu engineering", "least profitable"])) {
    if (!sellers.length) {
      return "No paid sales in this branch yet today. Once tickets close, I'll rank bestsellers and margin killers.";
    }
    return [
      "**Top sellers (paid)**",
      ...sellers.map((item, index) => `${index + 1}. ${item.name} — ${item.qty} sold · ${money(item.revenue)}`),
      "",
      "For full menu engineering (dogs/stars/puzzles/plowhorses), open **Recipes** + **Dashboard**."
    ].join("\n");
  }

  if (match(text, ["customer", "crm", "loyalty", "repeat", "feedback", "complaint"])) {
    const openFeedback = store.feedback.filter((item) => item.status === "open");
    const vip = store.customers.filter((item) => item.tags?.includes("vip"));
    return [
      `**CRM snapshot**`,
      `• Customers on file: **${store.customers.length}**`,
      `• VIP tags: **${vip.length}**`,
      `• Repeat rate today: **${kpi.repeatCustomerRate.toFixed(0)}%**`,
      `• Open feedback tickets: **${openFeedback.length}**`,
      "",
      openFeedback[0]
        ? `Latest open note: “${openFeedback[0].comment ?? "No comment"}” (${openFeedback[0].rating}/5).`
        : "No open complaints — nice.",
      "",
      "Open **Customers** to resolve tickets or push a loyalty offer."
    ].join("\n");
  }

  if (match(text, ["staff", "attendance", "waiter", "payroll", "labor"])) {
    const onDuty = store.staff.filter((person) => {
      if (person.branchId !== selected || !person.active) return false;
      const today = new Date().toISOString().slice(0, 10);
      return person.attendance.some((record) => record.date === today && record.status === "present");
    });
    return [
      `**People**`,
      `• Active staff at branch: **${store.staff.filter((person) => person.branchId === selected && person.active).length}**`,
      `• Marked present today: **${onDuty.length}**`,
      `• Labor cost % today: **${kpi.laborCostPct.toFixed(1)}%**`,
      "",
      onDuty.slice(0, 5).map((person) => `• ${person.name} (${person.role.replaceAll("_", " ")})`).join("\n") || "No attendance punched yet.",
      "",
      "Manage roster in **Staff**."
    ].join("\n");
  }

  if (match(text, ["discount", "promo", "coupon", "offer"])) {
    return [
      "**Discount playbook (demo)**",
      `1. Open a ticket in **POS / Orders**.`,
      `2. Apply discount with a reason (max **${store.settings.maxDiscountPercent}%** in settings).`,
      `3. Unusual discounts surface as owner alerts.`,
      "",
      "In a live AI build I can suggest safe promo amounts from AOV and food-cost guardrails."
    ].join("\n");
  }

  if (match(text, ["alert", "risk", "warning", "critical"])) {
    if (!alerts.length) return "No critical/warning alerts right now. I'll keep watching stock, kitchen timers, and discount spikes.";
    return [
      `**${alerts.length} smart alerts**`,
      ...alerts.slice(0, 6).map((alert) => `• [${alert.severity}] ${alert.title} — ${alert.message}`),
      "",
      "Full list sits on the **Dashboard**."
    ].join("\n");
  }

  if (match(text, ["branch", "multi", "indiranagar", "airport", "koramangala"])) {
    return [
      "**Multi-branch**",
      ...store.branches.map((item) => {
        const local = computeKpis(store, item.id);
        return `• ${item.name}: ${money(local.revenueToday)} today · ${local.openTickets} open`;
      }),
      "",
      "Switch branches from the sidebar to pivot my answers."
    ].join("\n");
  }

  if (match(text, ["help", "what can you", "modules", "feature", "how do i"])) {
    return [
      `I can demo answers across the ${COMPANY.productName} suite:`,
      "• Sales & P&L style KPIs",
      "• Inventory / expiry / wastage",
      "• Kitchen delays & stations",
      "• Tables, waitlist, reservations",
      "• CRM & feedback",
      "• Staff attendance",
      "• Multi-branch comparison",
      "",
      `Built as a showcase by **${COMPANY.legalName}** — swap this fake brain for a real LLM + tools when you go live.`
    ].join("\n");
  }

  return [
    `I didn't catch a specific ops metric in “${text}”.`,
    "",
    "Try one of these showcase prompts:",
    ...SUGGESTED_PROMPTS.map((prompt) => `• ${prompt}`),
    "",
    `_Demo mode · ${COMPANY.legalName}_`
  ].join("\n");
}
