# FRONTEND AI CONTEXT - CURRENT PROJECT STATE

PROJECT_PURPOSE = "AI continuation context for the current Next.js storefront."
SOURCE_OF_TRUTH = "Actual repository files in this frontend directory. This document is generated from the current implementation and should not override code."
BUSINESS = "Small self-hosted shoes and clothing ecommerce store."
OWNER = "Frontend React/Next.js developer with ~2 years frontend experience and little/no backend experience."
BUDGET = "Zero-cost/self-hosted software/services except payment provider."
BACKEND = "Django + Django Oscar + Django REST Framework."
FRONTEND_BASE = "NextMerce free template."

============================================================
ARCHITECTURE
============================================================

Browser
-> Next.js App Router storefront
-> same-origin /api/* Route Handler
-> Django API
-> Django Oscar
-> database

Browser media
-> same-origin /media/* Next.js Route Handler
-> Django media filesystem

Production target
Nginx -> Next.js :3000
Next.js server routes -> Django :8000
Django -> PostgreSQL
Nginx -> /static + /media

RULE:
"Frontend is presentation/client state; Django/Oscar is authoritative for ecommerce truth."

============================================================
ACTUAL APP STRUCTURE
============================================================

src/app/(site)/layout.tsx

- actual site layout
- contains html/body
- wraps storefront pages
- provides StoreProvider and Redux/provider infrastructure

src/app/(site)/(pages)/products/[slug]/page.tsx

- real product detail route

src/app/(site)/(pages)/shop-with-sidebar/page.tsx
src/app/(site)/(pages)/shop-without-sidebar/page.tsx
src/app/(site)/(pages)/cart/page.tsx
src/app/(site)/(pages)/checkout/page.tsx
src/app/(site)/(pages)/signin/page.tsx
src/app/(site)/(pages)/signup/page.tsx
src/app/(site)/(pages)/my-account/page.tsx
src/app/(site)/(pages)/wishlist/page.tsx
src/app/(site)/(pages)/contact/page.tsx
src/app/(site)/(pages)/shop-details/page.tsx

- legacy route redirects to /shop-with-sidebar

src/app/api/[...path]/route.ts

- generic server-side Django proxy
- forwards query string, cookies, CSRF, content type, origin/referer
- supports GET/POST/PUT/PATCH/DELETE

src/app/media/[...path]/route.ts

- development same-origin proxy for Django media files

src/app/context/StoreContext.tsx

- global server-backed basket + user state

src/lib/api.ts

- generic HTTP/CSRF client

src/lib/store-api.ts

- typed ecommerce API contract and functions
- Oscar -> NextMerce Product adapter

src/lib/site-config.ts

- public store name/contact/social config from NEXT_PUBLIC_* vars

src/types/product.ts

- legacy-compatible Product view model for reused NextMerce visual components

============================================================
IMPORTANT ROUTE-LAYOUT FACT
============================================================

There is intentionally NO src/app/layout.tsx in the current application.
The relevant root/site layout is src/app/(site)/layout.tsx and it contains <html> and <body>.
API routes are outside the (site) route group.
Do not create a competing root layout unless the whole routing architecture is intentionally changed.

============================================================
NEXT.JS CONFIG
============================================================

next.config.js currently contains only reactStrictMode.
Do NOT reintroduce the failed next.config.js Django rewrite approach.
The current working architecture uses a Next.js Route Handler proxy.

============================================================
CURRENT API CONTRACT
============================================================

The browser should use same-origin paths:

GET /api/products/
GET /api/products/<slug>/
GET /api/categories/
GET /api/countries/
GET /api/basket/
POST /api/basket/items/
PUT /api/basket/items/<line_id>/
DELETE /api/basket/items/<line_id>/
DELETE /api/basket/
GET /api/shipping/methods/
POST /api/checkout/orders/
GET /api/orders/
GET /api/orders/<number>/
GET /api/addresses/
POST /api/addresses/
DELETE /api/addresses/<id>/
GET /api/auth/csrf/
POST /api/auth/login/
POST /api/auth/register/
POST /api/auth/logout/
GET /api/auth/me/

Django internally runs on http://127.0.0.1:8000 by default in development.

============================================================
PRODUCT DATA
============================================================

Canonical frontend DTO = StoreProduct from src/lib/store-api.ts.

StoreProduct:
id
title
slug
description
rating
images
attributes
categories
structure
price
children

ProductVariant:
id
title
slug
attributes
images
price

ProductPrice:
available
availability_message
currency
price
price_excl_tax
tax
tax_included
stock
sku

Important:

- money values from Django are strings
- do not perform authoritative checkout calculations in JavaScript
- Oscar/Django is authoritative

============================================================
NEXTMERCE LEGACY PRODUCT ADAPTER
============================================================

src/types/product.ts keeps a small view model so existing template components can be reused:

Product:
title
reviews
rating?
price
discountedPrice
id
slug?
currency?
available?
stock?
hasVariants?
reviewCount?
imgs?

adaptOscarProduct() in src/lib/store-api.ts converts StoreProduct -> Product.

Current compatibility behavior:

- price = current Oscar price
- discountedPrice = same as current price until backend exposes separate before/after discount data
- reviews = 0 because rating != review count
- rating = Oscar rating
- reviewCount = 0 until review count API exists

DO NOT make the legacy Product type the canonical business model.

============================================================
CATALOGUE UI
============================================================

Main current catalogue component:
src/components/ShopWithSidebar/index.tsx

It now:

- loads categories from Django
- loads products from Django
- supports search
- supports category filtering
- supports sort latest/oldest/price asc/price desc
- supports grid/list view
- supports pagination
- uses existing NextMerce visual wrappers

Product cards:
src/components/Common/ProductItem.tsx
src/components/Shop/SingleGridItem.tsx
src/components/Shop/SingleListItem.tsx

Current card behavior:

- real Oscar image
- real title
- real currency + current price
- real slug navigation
- parent product -> "Choose options" -> product detail
- standalone product -> server-backed Oscar basket add
- wishlist remains local Redux for now
- quick view remains template Redux/view mechanism

Legacy static demo source shopData.ts has been removed.

============================================================
PRODUCT DETAIL
============================================================

Route:
/products/<slug>

Backend:
GET /api/products/<slug>/

Component:
src/components/ProductDetails.tsx

Supports:

- gallery
- parent/child product variants
- attribute option buttons
- size/color/other attribute selection based on actual child attributes
- real selected-variant price
- selected-variant stock
- quantity control
- add to Oscar basket
- cart link
- description

Important variant rule:
For parent products, add-to-basket uses the selected child product ID.
Do not add the parent product directly.

============================================================
BASKET
============================================================

Redux cart source has been removed from the live store flow.

Real flow:
Product page/card
-> StoreContext.addToBasket()
-> POST /api/basket/items/
-> Django/Oscar basket
-> returned basket state
-> StoreContext updates UI

StoreContext also supports:

- refresh basket
- update line quantity
- remove line
- clear basket
- current user
- sign in
- sign up
- sign out

The server basket is authoritative.

============================================================
AUTHENTICATION
============================================================

Frontend uses Django session authentication.
No NextAuth.
No JWT requirement.
No client-side password storage.

StoreContext initializes:

- basket
- current user

Auth functions live in store-api.ts.
CSRF is handled in api.ts and Django's /api/auth/csrf/ route.

============================================================
CHECKOUT / PAYMENT STATUS
============================================================

Checkout UI exists and supports:

- authenticated customer
- address data
- country selection from backend
- shipping method list
- order summary
- create pending order in development

The application deliberately does NOT pretend payment is complete.
Backend setting:
CHECKOUT_ALLOW_PENDING_ORDERS

Default behavior:

- DEBUG development -> pending orders can be enabled
- production -> order creation is blocked until a real payment provider is configured

Do NOT mark an order paid from the frontend.

============================================================
HOME PAGE
============================================================

Current home uses backend-driven:

- Hero
- Categories
- New Arrivals
- Best Sellers

Template-only electronics promotional content has been removed from the active home composition.

============================================================
CONTACT / SITE CONFIG
============================================================

Public config is read from:
NEXT_PUBLIC_STORE_NAME
NEXT_PUBLIC_STORE_EMAIL
NEXT_PUBLIC_STORE_PHONE
NEXT_PUBLIC_STORE_ADDRESS
NEXT_PUBLIC_STORE_FACEBOOK
NEXT_PUBLIC_STORE_INSTAGRAM
NEXT_PUBLIC_STORE_TWITTER

These are public values, not secrets.

============================================================
LEGACY / UNUSED TEMPLATE DATA
============================================================

The project may still contain inactive template blog/demo components/assets because they are not part of the ecommerce data path.
Do not reintroduce electronics demo products as live business data.
Search the repository before deleting unrelated template features.

============================================================
CURRENTLY REMOVED
============================================================

Removed from live architecture:

- shopData.ts
- cart-slice.ts
- old local cart item/order summary files
- temporary /api-test page
- unused template categoryData.ts
- unused template ordersData.tsx
- unused fake MyAccount AddressModal.tsx
- unused PromoBanner component with fake electronics products

============================================================
FRONTEND PACKAGE / TOOLING
============================================================

Next.js = 16.x
React = 19.x
Redux Toolkit / react-redux
Oxc formatter
Tailwind CSS
react-hot-toast

Oxc is configured as the VS Code formatter.

Current package.json still has eslint-config-next 15.x while Next is 16.x and the old "next lint" script is still present in the inherited template. This was not fully dependency-installed/built in the analysis environment. Treat lint/build as a local verification step before production.

============================================================
DEVELOPMENT
============================================================

cd frontend
npm install
npm run dev

Set frontend .env.local from .env.example:
DJANGO_INTERNAL_URL=http://127.0.0.1:8000

Open:
http://127.0.0.1:3000

Backend must be running separately.

============================================================
VERIFICATION STATUS
============================================================

Confirmed from conversation:

- Django direct product API works.
- Next.js /api/products/ proxy works.
- Product media image is visible through /media/* proxy.

Static verification performed on current files:

- all frontend TS/TSX files parse successfully with TypeScript parser
- backend Python compileall passes

NOT FULLY VERIFIED IN THIS TOOL ENVIRONMENT:

- npm install/build/lint because frontend dependencies are not installed in the current analysis container
- full Django runtime tests because Django/Oscar packages are not installed in the current analysis container

Therefore the source is consolidated, but the owner should run install/build/checks locally.

============================================================
NEXT PLANNED FEATURES
============================================================

1. Real review count/review submission API.
2. Dynamic filter controls for size/color/brand/price.
3. Better offer/discount representation.
4. Persistent wishlist through backend if desired.
5. Real payment provider integration.
6. More shipping methods/rates.
7. Production deployment + PostgreSQL + Nginx + Gunicorn.
8. Admin/dashboard UI customization.
9. SEO structured data / richer metadata.

AI RULES:

- inspect actual files first
- do not resurrect shopData
- do not create a second cart
- do not trust frontend price/stock/payment state
- prefer Oscar extension points
- keep secrets server-side
- keep same-origin /api/* architecture
- explain backend changes simply to the project owner
