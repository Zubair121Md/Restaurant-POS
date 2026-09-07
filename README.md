# Restaurant POS

**Product of MIA Solutions Pvt. Ltd.**

Static test / demo website for a connected restaurant OS (billing, kitchen, floor, inventory, recipes, staff, CRM, accounting, multi-branch, and MIA Assistant).

**No database. No always-on Node server.** Built as static HTML/JS (`out/`) and hosted on Render’s CDN — so it stays fast and does **not** spin down like a free Web Service.

## Architecture (test site)

| Layer | What it is |
| --- | --- |
| Hosting | Render **Static Site** (CDN) |
| Build output | `./out` from `next export` |
| Data | Browser `localStorage` only |
| Auth | Demo username/password in local storage |

## Demo workspace

On first visit open `/setup/` and click **Launch Spice Garden demo**.

| Field | Value |
| --- | --- |
| Restaurant | Spice Garden |
| Branches | Koramangala, Indiranagar, Airport Express (Bengaluru) |
| Admin | `admin` / `demo1234` |
| Currency | INR + GST |
| Operator | MIA Solutions Pvt. Ltd. |

## Local development

```bash
git clone https://github.com/Zubair121Md/Restaurant-POS.git
cd Restaurant-POS
npm install
npm run dev          # local Next dev server
npm run build        # writes static site to ./out
npm start            # optional local preview of ./out
```

## Deploy on Render as a Static Site

[`render.yaml`](./render.yaml) defines service **`restaurant-pos-site`** with `runtime: static`.

### If you currently have a Web Service (spinning down)

Render **cannot** change `runtime` on an existing service. Do this once:

1. Render Dashboard → open the old **Web Service** (`restaurant-pos`) → **Settings** → **Delete**
2. Dashboard → **Blueprints** → sync / apply this repo  
   **or** **New → Static Site** and set:
   - Build Command: `NPM_CONFIG_PRODUCTION=false npm install --include=dev && npm run build`
   - Publish Directory: `out`
3. Use the new static URL (always-on CDN, no cold starts)

### Fresh Blueprint apply

1. Push to GitHub  
2. Render → **Blueprints** → New / Sync  
3. Deploy `restaurant-pos-site`

## Module map

```text
Overview        → Dashboard, Branches, MIA Assistant
Front of house  → Tables, Reservations, POS/Orders, Customers
Kitchen         → Kitchen display
Menu & cost     → Menu, Recipes
Supply          → Inventory, Procurement
People & finance→ Staff, Accounting, Settings
```

## License

MIT © MIA Solutions Pvt. Ltd.
