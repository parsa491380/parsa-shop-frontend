# Shoes & Clothing Store - Next.js Frontend

This is the storefront application built from the free NextMerce template.

## Architecture

```text
Browser
  -> Next.js App Router
  -> same-origin /api/*
  -> Django REST API
  -> Django Oscar
```

Next.js is responsible for UI/presentation. Django/Oscar is responsible for ecommerce truth.

## Run locally

```bash
npm install
```

Create `.env.local` from `.env.example`:

```env
DJANGO_INTERNAL_URL=http://127.0.0.1:8000
NEXT_PUBLIC_STORE_NAME=My Store
NEXT_PUBLIC_STORE_EMAIL=
NEXT_PUBLIC_STORE_PHONE=
NEXT_PUBLIC_STORE_ADDRESS=
```

Then:

```bash
npm run dev
```

Open:
http://127.0.0.1:3000

Django must be running on port 8000.

## Important folders

- `src/app/(site)/` storefront routes/layout
- `src/app/api/[...path]/` same-origin Django API proxy
- `src/app/media/[...path]/` Django media proxy for development
- `src/components/` UI
- `src/app/context/StoreContext.tsx` server-backed basket/customer state
- `src/lib/api.ts` generic HTTP/CSRF client
- `src/lib/store-api.ts` typed ecommerce API client

## Ecommerce rules

- Do not calculate authoritative order totals in the browser.
- Do not create a second local cart. Oscar's basket is authoritative.
- Parent products require variant selection before adding to basket.
- Never mark an order paid from frontend code.

## Current limitation

A real payment provider has not yet been selected/configured. The backend therefore supports development-only pending orders but blocks production order creation until payment verification is implemented.

## AI context

Read `FRONTEND_AI_README.md` and `../PROJECT_STATUS_CURRENT.md` before changing architecture.
