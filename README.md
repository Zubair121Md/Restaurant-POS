# Restaurant POS

Connected restaurant operating system for billing, kitchen, floor, inventory, recipes, staff, CRM, accounting, and multi-branch control.

Built to cover the same problem space as Petpooja, Restroworks, Toast POS, and ERPNext — with a simpler UI, stronger inventory/recipe costing, and a real-time owner dashboard.

## What it solves

| Area | Capabilities |
| --- | --- |
| **POS & billing** | Touch order terminal, discounts with reason, split/merge bills, GST/service charge, multi-tender (cash/card/UPI/QR), offline-friendly local mode |
| **Kitchen** | Live KDS, station routing, prep timers, rush/VIP priority, delay highlighting |
| **Tables** | Live floor status, reservations, waitlist seating, turnover-aware table flow |
| **Inventory** | Raw stock, reorder/expiry alerts, wastage, adjustments, recipe-based deduction on payment |
| **Recipes & costing** | Recipe builder, waste %, food cost %, margin vs menu price |
| **Procurement** | Vendors, purchase orders, goods receipt, inter-branch transfers |
| **Staff** | Roles, roster, attendance, hourly labor cost into KPIs |
| **CRM** | Customers, loyalty points, visit/spend history, feedback tickets |
| **Accounting** | Sales ledger on checkout, expenses, daily P&L-style totals |
| **Multi-branch** | Branch switcher, per-branch KPIs, inventory transfers |
| **Owner dashboard** | Revenue, AOV, food/labor cost %, margin, occupancy, prep time, repeat rate, inventory & wastage value, smart alerts |

## Connected flows

1. Seat a table or take a walk-in → open ticket  
2. Send KOT → kitchen board with timers/stations  
3. Pay bill → inventory deducted via recipes → ledger sale posted → customer loyalty updated → table freed  
4. Low stock / expiry / slow tickets / unusual discounts → alerts on the owner dashboard  

## Stack

- Next.js 15 + React 19 + TypeScript  
- Tailwind CSS  
- Local-first storage (optional Supabase / Firebase hooks)  

## Quick start

```bash
git clone https://github.com/Zubair121Md/Restaurant-POS.git
cd Restaurant-POS
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), complete setup, sign in, then explore modules from the sidebar.

> First setup creates a seeded **Harbor Kitchen** demo (2 branches, menu, recipes, stock, staff, customers, vendors) so every module is immediately usable.

## Module map

```text
Overview        → Dashboard, Branches
Front of house  → Tables, Reservations, POS/Orders, Customers
Kitchen         → Kitchen display
Menu & cost     → Menu, Recipes
Supply          → Inventory, Procurement
People & finance→ Staff, Accounting, Settings
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## License

MIT © Zubair121Md
