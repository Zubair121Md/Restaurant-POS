# Restaurant POS

Full-featured restaurant point of sale built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

Manage floor tables, take orders, run the kitchen board, edit your menu, and check out guests — all from one workspace.

## Features

- Guided first-time setup (language, venue, admin, data provider)
- Sign-in gate for the POS workspace
- Dashboard with revenue, open tickets, and table occupancy
- Floor map with available / occupied / billing tables
- Order terminal with menu categories, tips, tax, and cash/card/QR checkout
- Menu manager with availability toggles
- Live kitchen board with prep status updates
- Local-first storage (works without cloud keys)
- Optional Supabase or Firebase provider hooks

## Stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js 15 |
| UI | React 19 + Tailwind CSS |
| Language | TypeScript 5.7 |
| Data | Browser local storage (+ optional Supabase / Firebase clients) |

## Quick start

```bash
git clone https://github.com/Zubair121Md/Restaurant-POS.git
cd Restaurant-POS
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), complete setup, then sign in with your admin credentials.

Cloud providers are optional. Choose **Local storage** during setup to run fully offline.

## Environment

Copy `.env.example` to `.env.local` if you want Supabase or Firebase:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Project structure

```text
app/
  setup/          First-run installer
  login/          Staff sign-in
  (pos)/          Authenticated POS shell
    dashboard/
    tables/
    orders/
    menu/
    kitchen/
    settings/
components/       UI and feature views
lib/              Store, seed data, i18n, providers
```

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint
```

## License

MIT © Zubair121Md
