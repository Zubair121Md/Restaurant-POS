# Restaurant POS

**Product of MIA Solutions Pvt. Ltd.**

Static test / demo website for a connected restaurant OS (billing, kitchen, floor, inventory, recipes, staff, CRM, accounting, multi-branch, and MIA Assistant).

**No database. No backend server.** Everything runs in the browser with `localStorage` after a static HTML/JS export.

## Architecture (test site)

| Layer | What it is |
| --- | --- |
| Hosting | Static files (`out/`) on Render CDN |
| Data | Browser `localStorage` only |
| Auth | Demo username/password in local storage |
| Cloud DB | Not required (Supabase/Firebase hooks are optional stubs) |

## Demo workspace

On first visit open `/setup/` and click **Launch Spice Garden demo**.

| Field | Value |
| --- | --- |
| Restaurant | Spice Garden |
| Branches | Koramangala, Indiranagar, Airport Express (Bengaluru) |
| Admin | `admin` / `demo1234` |
| Currency | INR + GST |
| Operator | MIA Solutions Pvt. Ltd. |

## MIA Assistant (demo AI)

Floating **Ask MIA** chatbot + `/assistant/` page. Fake/showcase copilot that answers from live local Spice Garden data.

## Local development

```bash
git clone https://github.com/Zubair121Md/Restaurant-POS.git
cd Restaurant-POS
npm install
npm run dev
```

Static production build:

```bash
npm run build    # writes static site to ./out
npm start        # serves ./out locally
```

## Deploy on Render (static)

[`render.yaml`](./render.yaml) publishes `./out` as a **static** site:

1. Push to GitHub  
2. Render → **Blueprints** → New Blueprint Instance  
3. Apply (`restaurant-pos` static service)

Build: `npm install --include=dev && npm run build`  
Publish directory: `./out`

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
