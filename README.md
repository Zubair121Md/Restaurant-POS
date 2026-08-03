# Restaurant POS

**Product of MIA Solutions Pvt. Ltd.**

Connected restaurant operating system for billing, kitchen, floor, inventory, recipes, staff, CRM, accounting, and multi-branch control.

This repository ships as a **demo / test site** with a full Spice Garden dataset so every module is immediately reviewable.

## Demo workspace

On first visit open `/setup` and click **Launch Spice Garden demo**.

| Field | Value |
| --- | --- |
| Restaurant | Spice Garden |
| Branches | Koramangala, Indiranagar, Airport Express (Bengaluru) |
| Admin | `admin` / `demo1234` |
| Currency | INR + GST |
| Operator | MIA Solutions Pvt. Ltd. |

Includes seeded open tickets, paid history, kitchen KOTs, stock (incl. low/expiry), recipes, purchase orders, vendors, staff attendance, CRM, feedback, ledger, expenses, and inter-branch transfers.

## Stack

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS
- Local-first storage (optional Supabase / Firebase)

## Local development

```bash
git clone https://github.com/Zubair121Md/Restaurant-POS.git
cd Restaurant-POS
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Render (Blueprint)

This repo includes [`render.yaml`](./render.yaml).

1. Push to GitHub  
2. Render Dashboard → **Blueprints** → **New Blueprint Instance**  
3. Select this repository  
4. Apply the blueprint (`restaurant-pos` web service)

Build: `npm install && npm run build`  
Start: `npm run start`  
Health check: `/api/health`

Free plan is configured by default; upgrade the plan in Render if you need always-on capacity.

## Module map

```text
Overview        → Dashboard, Branches
Front of house  → Tables, Reservations, POS/Orders, Customers
Kitchen         → Kitchen display
Menu & cost     → Menu, Recipes
Supply          → Inventory, Procurement
People & finance→ Staff, Accounting, Settings
```

## License

MIT © MIA Solutions Pvt. Ltd.
