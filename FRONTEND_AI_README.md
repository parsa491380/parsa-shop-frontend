# FRONTEND AI PROJECT CONTEXT / README

DOCUMENT_PURPOSE = "AI-oriented project memory for the frontend of a self-hosted ecommerce application."
DOCUMENT_SCOPE = "FRONTEND ONLY"
PRIMARY_GOAL = "Allow a future AI model to understand the frontend architecture, backend contract, decisions, completed work, constraints, and intended implementation sequence without needing prior conversation history."
READABILITY_PRIORITY = "Machine/AI context > human prose."
SOURCE_OF_TRUTH = "Current project/conversation state supplied by project owner."
IMPORTANT = "Do not invent missing implementation details. When a file is not listed as confirmed, inspect the repository before modifying it."

============================================================
0. PROJECT IDENTITY
============================================================

PROJECT_TYPE = "Self-owned small ecommerce web application."
BUSINESS_DOMAIN = "Shoes + clothing."
BUSINESS_STAGE = "Early-stage / small."
OWNER_PROFILE = "Frontend developer; React + Next.js; ~2 years frontend experience; zero backend development experience."
BUDGET_CONSTRAINT = "User does not want to pay for infrastructure/services at this stage."
INFRASTRUCTURE_REQUIREMENT = "Completely self-hosted on user's own server."
EXTERNAL_SERVICE_POLICY = "No external services except payment provider/payment processing service."
FRONTEND_BASE = "NextMerce nextjs-ecommerce-template (GitHub)."
BACKEND_BASE = "Django Oscar."
FRONTEND_ROLE = "Presentation/UI/client application."
BACKEND_ROLE = "Authoritative ecommerce/business logic/data source."
DATABASE_ROLE = "Backend persistence; production target is PostgreSQL."
SEARCH_POLICY = "Local/self-hosted search; no hosted search service."
AUTH_POLICY = "Django/session authentication; do not create a second independent frontend auth system."
PRICE_POLICY = "Backend/Oscar is authoritative for price, stock, discount, availability, tax, and order totals."
SECURITY_POLICY = "Do not trust client-controlled price/stock/order calculations."

============================================================
1. TARGET END-TO-END ARCHITECTURE
============================================================

TARGET_RUNTIME:

Browser
  -> Next.js storefront
  -> Next.js same-origin /api/* server routes
  -> Django API
  -> Django Oscar
  -> PostgreSQL

Assets:

Browser
  -> Next.js /media/*
  -> Django /media/*
  -> server filesystem/media directory

Admin:

Admin user
  -> Django Oscar Dashboard
  -> Oscar catalogue/orders/inventory/etc.

Production target:

Internet
  -> Nginx
  -> Next.js
  -> Django/Gunicorn
  -> PostgreSQL + local media/static files

FRONTEND PRINCIPLE:
"Next.js owns UI, routing, rendering, UX state, and presentation. Django/Oscar owns commerce rules and persistent ecommerce state."

BROWSER MUST NOT:
- calculate authoritative price
- calculate authoritative discount
- decide whether stock exists
- create authoritative orders locally
- directly access Django internal URLs in normal application code
- depend on Sanity/NextAuth/hosted CMS/auth/search

FRONTEND SHOULD:
- call same-origin /api/*
- consume typed backend DTOs
- adapt backend DTOs into existing NextMerce component shapes when necessary
- keep UI reusable and backend-agnostic where practical

============================================================
2. IMPORTANT NEXTMERCE STRUCTURE DISCOVERED
============================================================

ACTUAL_APP_STRUCTURE:

src/
  app/
    (site)/
      layout.tsx
      ...
    api/
      products/
        route.ts
      media/
        [...path]/
          route.ts
  components/
    Shop/
      shopData.ts
      SingleGridItem.tsx                 # existing component; inspect before changing
      SingleListItem.tsx                 # existing component; inspect before changing
    ShopWithSidebar/
      index.tsx
      ...
    ShopWithoutSidebar/
      index.tsx
    Home/
      BestSeller/
        index.tsx
      NewArrivals/
        index.tsx
    ShopDetails/
      RecentlyViewd/
        index.tsx
    BlogDetailsWithSidebar/
      index.tsx
    BlogGridWithSidebar/
      index.tsx
  lib/
    api.ts
    store-api.ts
  types/
    product.ts

ROUTE_GROUP_FACT:
- "(site)" is a Next.js route group.
- "(site)" does not appear in the URL.
- The project originally has only src/app/(site)/layout.tsx as the relevant root/site layout.
- That existing layout contains the required <html> and <body> tags.
- A temporary src/app/layout.tsx was created during troubleshooting and then should NOT remain.
- Pages that need the site layout must live under src/app/(site)/.
- src/app/api/* is intentionally outside the "(site)" route group because it is a server API layer and does not need the site HTML layout.

DO_NOT_RECREATE_STANDARD_ROOT_LAYOUT_UNLESS_REPO_STRUCTURE_CHANGES:
"Do not blindly create src/app/layout.tsx. Current intended structure uses src/app/(site)/layout.tsx with html/body."

============================================================
3. CURRENT FRONTEND/BACKEND API BOUNDARY
============================================================

PUBLIC_BROWSER_ENDPOINT:
GET /api/products/

INTERNAL_NEXTJS_HANDLER:
src/app/api/products/route.ts

INTERNAL_DJANGO_ENDPOINT:
http://127.0.0.1:8000/api/products/

CURRENT_FLOW:
Browser GET /api/products/
  -> Next.js Route Handler src/app/api/products/route.ts
  -> server-side fetch to Django
  -> Django /api/products/
  -> Oscar
  -> JSON response
  -> Next.js returns response
  -> Browser

IMPORTANT_RESULT:
"GET http://127.0.0.1:3000/api/products/ works and returns Django/Oscar JSON."

DIRECT_DJANGO_TEST:
"http://127.0.0.1:8000/api/products/ works."

FAILED/REMOVED APPROACH:
- Tried next.config.js rewrites to proxy /api/* to Django.
- This did not work in the user's environment.
- Rewrites were removed/reverted.
- The project now uses a Next.js Route Handler for /api/products/.
- Do not reintroduce rewrites unless there is a concrete reason and the route-handler proxy is intentionally replaced.

CURRENT_NEXT_CONFIG_INTENT:
"Simple config; no Django rewrite dependency."

============================================================
4. CURRENT MEDIA/IMAGE FLOW
============================================================

PROBLEM_SOLVED:
Oscar returned image URLs such as:
  /media/...

The browser was on port 3000, so /media/... resolved to Next.js and images did not load.

CURRENT_SOLUTION:
src/app/media/[...path]/route.ts

FLOW:
Browser GET /media/images/...
  -> Next.js media Route Handler
  -> Django http://127.0.0.1:8000/media/images/...
  -> local Django media file
  -> Next.js forwards response
  -> Browser

CONFIRMED_RESULT:
"Product image is now visible through the Next.js application."

MEDIA_POLICY:
- Do not expose Django's internal host as the normal browser URL.
- Keep browser-facing media path same-origin: /media/...
- Later production can be served directly by Nginx if desired, without changing application-level media URLs.

============================================================
5. API CLIENT FILES
============================================================

FILE = "src/lib/api.ts"

ROLE:
"Low-level generic HTTP client for the frontend."

RESPONSIBILITIES:
- get browser cookies when running client-side
- ensure Django CSRF cookie exists for unsafe requests
- send X-CSRFToken for POST/PUT/PATCH/DELETE
- send credentials: include
- build server-side API URL when required
- parse JSON responses
- throw usable errors on non-2xx responses

IMPORTANT_SECURITY:
- Django session cookie must be HttpOnly.
- CSRF cookie is intentionally readable by JS because frontend must place it in X-CSRFToken.
- Do not disable CSRF to make POST requests easier.
- Do not replace session/CSRF design with JWT unless there is an explicit architectural decision.

FILE = "src/lib/store-api.ts"

ROLE:
"Typed shop-specific API client + DTO types + Oscar-to-NextMerce adapter."

CURRENT/INTENDED EXPORTS:
- StoreProduct
- StoreProduct price/type structures
- ProductVariant
- ProductImage
- StoreCategory
- ProductListResponse
- getProducts()
- getProduct(slug)
- getCategories()
- adaptOscarProduct()

STORE API CONTRACT (CURRENT/INTENDED):
StoreProduct:
{
  id: number,
  title: string,
  slug: string,
  description: string,
  rating: number,
  images: ProductImage[],
  attributes: Record<string,string>,
  categories: StoreCategory[],
  structure: string,
  price: ProductPrice,
  children: ProductVariant[]
}

ProductImage:
{
  url: string,
  caption: string,
  is_primary: boolean
}

ProductPrice:
{
  available: boolean,
  availability_message: string | null,
  currency: string | null,
  price: string | null,
  price_excl_tax: string | null,
  tax: string | null,
  tax_included: boolean,
  stock: number | null,
  sku: string | null
}

ProductVariant:
{
  id: number,
  title: string,
  attributes: Record<string,string>,
  price: ProductPrice
}

ProductListResponse:
{
  count: number,
  next: string | null,
  previous: string | null,
  results: StoreProduct[]
}

NOTES:
- Backend monetary values are strings because precision must not be lost by JavaScript floating point handling.
- The current adapter converts price to number only because the legacy NextMerce Product type requires number.
- This is a UI compatibility decision, NOT the authoritative monetary representation.
- Authoritative pricing remains in Django/Oscar.
- Later, storefront monetary display should ideally use a dedicated money/formatting layer and avoid arithmetic with JS floating point.

============================================================
6. LEGACY NEXTMERCE PRODUCT MODEL
============================================================

FILE = "src/types/product.ts"

CURRENT_TYPE:
type Product = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  id: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

INTERPRETATION:
"This type belongs to the original NextMerce UI. It is not the ecommerce backend domain model."

IMPORTANT:
- Do not force Oscar data to use this type as the canonical business model.
- Use an adapter from StoreProduct -> Product while reusing existing visual components.
- Over time, the legacy type may be extended/replaced, but this should be deliberate and based on actual component needs.

============================================================
7. LEGACY STATIC DATA
============================================================

FILE = "src/components/Shop/shopData.ts"

CURRENT ROLE:
"Original NextMerce/demo product source."

CURRENT DATA:
- Havit HV-G69 USB Gamepad
- iPhone 14 Plus, 6/128GB
- Apple iMac M1 24-inch 2021
- MacBook Air M1 chip, 8/256GB
- Apple Watch Ultra
- Logitech MX Master 3 Mouse
- Apple iPad Air 5th Gen - 64GB
- Asus RT Dual Band Router

DATA SHAPE:
Product[] using the legacy Product type.

IMPORTANT MIGRATION POLICY:
- shopData.ts is NOT the final product source.
- Do not continue expanding this file for real store products.
- It may remain temporarily while individual components are migrated.
- Final source of truth must be Oscar via Django API.
- Remove shopData dependency from migrated components.
- Eventually delete shopData.ts when no production component imports it.

============================================================
8. COMPONENTS KNOWN TO CONSUME shopData / PRODUCT DATA
============================================================

KNOWN_FILES:
src/components/Shop/shopData.ts

Consumers identified:
src/components/ShopWithoutSidebar/index.tsx
src/components/BlogDetailsWithSidebar/index.tsx
src/components/BlogGridWithSidebar/index.tsx
src/components/Home/BestSeller/index.tsx
src/components/Home/NewArrivals/index.tsx
src/components/ShopDetails/RecentlyViewd/index.tsx
src/components/ShopWithSidebar/index.tsx

POSSIBLE ADDITIONAL_CONSUMERS:
"Search repository before deleting shopData.ts."

MIGRATION_STRATEGY:
1. Build stable StoreProduct API contract.
2. Build adaptOscarProduct().
3. Migrate actual shop listing first.
4. Migrate homepage sections.
5. Migrate related/recently viewed logic.
6. Decide how blog-related product references should behave.
7. Remove static shopData only after all references are gone.

DO_NOT:
"Copy/paste fetch logic into every component."

PREFERRED:
"Use src/lib/store-api.ts and shared hooks/server-data patterns."

============================================================
9. SHOPWITHSIDEBAR CURRENT STATE
============================================================

FILE = "src/components/ShopWithSidebar/index.tsx"

ORIGINAL_IMPORT:
import shopData from "../Shop/shopData";

ORIGINAL_RENDERING:
shopData.map(...)
  -> SingleGridItem OR SingleListItem

KNOWN_HARDCODED_DEMO_DATA:
- categories = Desktop, Laptop, Monitor, UPS, Phone, Watch
- genders = Men, Women, Unisex
- "Showing 9 of 50 Products"
- pagination links 1..10 with static href="#"

CURRENT INTENDED/IMPLEMENTED MIGRATION:
- import getProducts + adaptOscarProduct from @/lib/store-api
- keep existing SingleGridItem / SingleListItem UI
- add local products state using legacy Product[] only as a compatibility layer
- fetch getProducts() on mount
- map response.results through adaptOscarProduct()
- render products instead of shopData
- show dynamic product count instead of "9 of 50"

IMPORTANT:
"Do not assume all ShopWithSidebar changes are production-complete just because the migration was planned. Inspect the current file if exact state matters."

KNOWN UI RENDER POINT:
The product area originally rendered:
productStyle === "grid" ? <SingleGridItem ...> : <SingleListItem ...>

NEXT_ACTION:
"Inspect SingleGridItem.tsx and SingleListItem.tsx before modifying visual rendering, discount behavior, links, image arrays, or cart buttons."

============================================================
10. TEMPORARY API TEST PAGE
============================================================

FILE:
src/app/(site)/api-test/page.tsx

PURPOSE:
"Temporary integration-test page proving Next.js -> Django -> Oscar works."

MOVED_TO_SITE_GROUP_BECAUSE:
- Initially created at src/app/api-test/page.tsx
- This caused missing root layout tags because no src/app/layout.tsx existed.
- Correct location is src/app/(site)/api-test/page.tsx so it inherits existing (site)/layout.tsx.

CURRENT_EXPECTATION:
- Fetch getProducts()
- display product title, brand, price, image, variant count
- use real Oscar data
- image should load through /media/* proxy

STATUS:
"Useful diagnostic only; not final storefront UI."

FUTURE:
"Delete once real NextMerce product grid and product detail pages are connected and stable."

============================================================
11. NEXTMERCE AUTH/SERVICE CLEANUP
============================================================

ORIGINAL/UPSTREAM_TEMPLATE_CONTEXT:
"The free NextMerce template includes references/integrations for Sanity and NextAuth in its broader template setup."

PROJECT_DECISION:
- Do not use Sanity.
- Do not use NextAuth as the store authentication authority.
- Django owns customer identity/auth/session.
- Remove unused next-auth/next-sanity/sanity dependencies and references if still present.
- Search source and package config for stale references before considering cleanup complete.

SEARCH_TERMS:
next-auth
next-sanity
sanity
NEXTAUTH
SANITY

CAUTION:
"Do not delete arbitrary files merely because a search result contains one of these strings. Inspect each usage."

============================================================
12. FRONTEND AUTHENTICATION DESIGN
============================================================

CURRENT_TARGET:
Django session authentication.

LOGIN_FLOW_TARGET:
Browser
  -> Next.js /api/auth/login/*
  -> Django API
  -> django.contrib.auth.login()
  -> Django session cookie
  -> browser sends credentials with requests

CURRENT_DJANGO_ENDPOINTS KNOWN:
GET /api/auth/csrf/
POST /api/auth/login/
POST /api/auth/register/
POST /api/auth/logout/
GET /api/auth/me/

FRONTEND_RULE:
- UI should not store passwords.
- UI should not generate its own session token.
- UI should not trust localStorage "loggedIn=true" as authentication.
- Use backend session state as source of truth.
- Use CSRF for unsafe requests.

IMPORTANT:
"The exact Next.js proxy routes for auth have not been fully documented/implemented in this frontend context yet. Inspect repository/current code before adding them."

============================================================
13. TARGET CATALOGUE FEATURES
============================================================

MVP_CATALOGUE:
- product listing
- categories
- product detail
- product images
- product attributes
- sizes
- colours
- variants
- stock availability
- price
- optional discount later
- search
- filtering later
- pagination

SHOES_PRODUCT_EXAMPLE:
Parent:
  Nike Air Max 90
Children:
  size 41
  size 42
  size 43
  size 44

CLOTHING_EXAMPLE:
Parent:
  Basic Hoodie
Children may vary by:
  size
  color

FRONTEND_RULE:
"Parent product is the storefront product presentation; purchasable variants are selected children/variant records."

============================================================
14. PRODUCT DETAIL URL STRATEGY
============================================================

TARGET_URL:
 /products/<slug>

API_TARGET:
 /api/products/<slug>/

CURRENT_INTENT:
"Use slug, not numeric ID, for customer-facing product URLs."

REASON:
- cleaner URLs
- useful for SEO
- stable semantic identity
- matches product data already returned by Oscar API

CURRENT_STORE_API_SIGNATURE:
getProduct(slug: string)

DO_NOT:
"Create customer-facing URLs based solely on database IDs if slug routing is available."

============================================================
15. CURRENT API PRODUCT LIST BEHAVIOR
============================================================

GET:
 /api/products/

OPTIONAL_QUERY_PARAMS:
 ?search=<text>
 ?category=<category-slug>

BACKEND CURRENT_QUERY_INTENT:
- public products only
- exclude child products from top-level list
- order by priority/date
- search title/description
- filter category
- distinct results

FRONTEND_IMPLICATION:
"Top-level listing should show parent/standalone products. Variant children belong to product detail/variant selection."

PAGINATION:
Backend returns:
count
next
previous
results

FRONTEND SHOULD EVENTUALLY:
- use response.next/previous
- display accurate total
- stop hardcoded pagination
- preserve filter/search query state

============================================================
16. CURRENT CATEGORIES CONTRACT
============================================================

GET:
 /api/categories/

CURRENT_SHAPE:
[
  {
    id: number,
    name: string,
    slug: string
  }
]

FUTURE:
- root categories
- nested category support if backend exposes it
- dynamic sidebar/navigation
- category product counts should come from backend, not hardcoded frontend data

CURRENT_PROHIBITED_PATTERN:
const categories = [
  { name: "Desktop", products: 10, ... }
]

REPLACEMENT_TARGET:
"Fetch actual Oscar categories and actual product counts when the API supports them."

============================================================
17. FILTERS: CURRENT VS TARGET
============================================================

CURRENT_SHOPWITHSIDEBAR_FILTER_UI:
- CategoryDropdown
- GenderDropdown
- SizeDropdown
- ColorsDropdwon
- PriceDropdown

CURRENT_STATE:
"These contain/expect template-era data and have not been fully connected to Oscar."

TARGET:
Filters must eventually become backend-driven.

FILTER_SOURCE_TARGET:
Category -> Oscar categories
Size -> Oscar product attributes/variants
Color -> Oscar attributes
Brand -> Oscar attributes
Price -> backend query
Gender/fit -> only if represented in actual product attributes
Availability -> backend/Oscar stock state

IMPORTANT:
"Do not invent 'gender' as a universal field. If the business needs gender filtering, add it as an explicit backend attribute/product-class concept and expose it through API."

============================================================
18. PRICE / DISCOUNT RULES
============================================================

CURRENT_LEGACY_NEXTMERCE:
price = normal price
discountedPrice = discounted price

CURRENT_ADAPTER:
price = current Oscar price
discountedPrice = current Oscar price

REASON:
"Oscar offers/discount presentation has not yet been exposed through a dedicated frontend contract."

CRITICAL:
"This is temporary UI compatibility, NOT final discount modeling."

FUTURE_TARGET:
Backend response should expose enough information for:
- original price
- final/current price
- discount amount/percentage when applicable
- tax display rules when applicable
- currency

FRONTEND MUST NEVER:
- calculate "discount" from user-controlled data
- decide checkout payment amount
- send frontend-calculated totals as authoritative

============================================================
19. REVIEWS / RATINGS
============================================================

LEGACY_NEXTMERCE:
reviews = number

CURRENT_OSCAR_API:
rating is currently exposed.
Total review count is not currently modeled in the frontend StoreProduct contract.

CURRENT_ADAPTER_POLICY:
reviews = 0
because rating is NOT the same thing as review count.

FUTURE:
Create a proper review API contract:
- average_rating
- review_count
- optional review summaries
- customer review creation/edit rules

DO_NOT:
"Use average rating as review count."

============================================================
20. IMAGE RULES
============================================================

BACKEND_IMAGE_URL:
"/media/..."

FRONTEND_BROWSER_IMAGE_URL:
same-origin "/media/..."

CURRENT_MEDIA_PROXY:
src/app/media/[...path]/route.ts

LEGACY_NEXTMERCE_EXPECTS:
imgs.thumbnails: string[]
imgs.previews: string[]

CURRENT_ADAPTER:
Both arrays currently use the same Oscar image URLs.

FUTURE:
- generate/serve optimized image sizes
- map thumbnail URLs to smaller images
- map preview URLs to larger images
- preserve order
- identify primary image
- use Next.js Image only after configuring local/known image behavior appropriately

IMPORTANT:
"Do not hardcode product image paths like /images/products/product-1-bg-1.png for real products."

============================================================
21. PRODUCT COMPONENT MIGRATION PATTERN
============================================================

RECOMMENDED_PATTERN:

const response = await getProducts();

const viewModels = response.results.map(
  adaptOscarProduct
);

render existing NextMerce components with viewModels.

WHY:
- existing UI stays intact
- backend data becomes authoritative
- migration is incremental
- fewer simultaneous changes
- easy rollback

LONG-TERM:
"Reduce dependence on the legacy Product type and let domain-specific UI components accept StoreProduct or dedicated frontend view models."

============================================================
22. NEXT IMPLEMENTATION ORDER
============================================================

PHASE_A = "Catalogue storefront integration"
1. Verify ShopWithSidebar uses getProducts() rather than shopData.
2. Inspect SingleGridItem.tsx.
3. Inspect SingleListItem.tsx.
4. Make existing card UI render:
   - Oscar image
   - title
   - current price
   - primary image
   - availability
   - optionally brand
5. Add links from card -> /products/<slug>.
6. Build real product detail page.
7. Render parent product + variant choices.
8. Add size/color selection based on actual Oscar child attributes.

PHASE_B = "Homepage migration"
1. NewArrivals -> backend query/sorting.
2. BestSeller -> backend order/statistics rule.
3. RecentlyViewed -> backend or browser/session strategy; decide explicitly.
4. Remove static shopData dependencies.

PHASE_C = "Search/filter/pagination"
1. search query state
2. category query
3. size/color/brand filters
4. price range
5. pagination using API next/previous
6. URL query-string synchronization

PHASE_D = "Basket"
1. Next.js proxy for basket endpoints.
2. Oscar basket is authoritative.
3. Product variant selection.
4. quantity update.
5. stock validation.
6. basket total returned by backend.
7. frontend cart UI mirrors backend basket.

PHASE_E = "Auth/customer"
1. CSRF initialization.
2. register.
3. login.
4. logout.
5. current user.
6. account UI.
7. address API/UI.

PHASE_F = "Checkout/order/payment"
1. shipping address
2. shipping method
3. order review
4. payment provider integration
5. payment verification
6. order confirmation
7. never trust frontend payment amount

PHASE_G = "Production"
1. production environment variables
2. HTTPS
3. Nginx
4. static/media serving
5. production API security
6. database backup strategy
7. logging
8. deployment scripts
9. server hardening

============================================================
23. BACKEND CONTRACT RULES FOR FRONTEND AI
============================================================

WHEN MODIFYING FRONTEND:
- Prefer existing Django API.
- Do not create duplicate product models in Next.js.
- Do not assume database schema beyond documented API fields.
- Ask/inspect backend API before consuming undocumented fields.
- Keep money as strings/structured values at the API boundary whenever possible.
- Preserve SKU/variant IDs for future basket operations.
- Preserve slug for URLs.
- Preserve child IDs for add-to-basket variant selection.

WHEN ADDING A UI FEATURE:
1. Determine whether the data already exists in StoreProduct.
2. If not, inspect Django API before adding client mock data.
3. Add backend contract first when the information is authoritative.
4. Then update StoreProduct types.
5. Then add adapter/view-model mapping.
6. Then update UI.

============================================================
24. DO NOT USE MOCK/DUMMY BUSINESS DATA IN PRODUCTION
============================================================

PROHIBITED_PRODUCTION_PATTERNS:
- hardcoded prices
- hardcoded stock
- hardcoded product counts
- hardcoded categories
- hardcoded product arrays
- fake discount values
- frontend-only availability decisions
- fake review counts presented as real
- fake order totals

ALLOWED_TEMPORARILY:
- temporary API test page
- skeleton loading UI
- explicit development fixtures for tests
- UI placeholders clearly separated from production data

============================================================
25. ERROR HANDLING
============================================================

EXPECTED_FRONTEND_STATES:
- loading
- successful data
- empty data
- API error
- unavailable product
- unavailable variant
- missing image
- network failure

UI RULE:
"Do not render undefined product properties without guards."

IMAGE_RULE:
"Always provide an intentional fallback when a product has no images."

ERROR_RULE:
"Do not swallow errors silently."

SECURITY_RULE:
"Do not display backend traceback details to customers."

============================================================
26. PERFORMANCE/DATA-FETCHING DIRECTION
============================================================

CURRENT:
ShopWithSidebar is a client component and can fetch through getProducts().

FUTURE:
"Choose server components/server-side fetching where appropriate, especially for SEO-facing catalogue/product pages, unless client interactivity requires client fetching."

PRODUCT_LIST_TARGET:
- efficient pagination
- limited page size
- no loading of entire catalogue
- avoid duplicate requests
- cache public catalogue data where appropriate
- invalidate/revalidate intentionally after product changes

IMPORTANT:
"Do not optimize prematurely. First establish correct data flow."

============================================================
27. SEO DIRECTION
============================================================

TARGET:
- /products/<slug>
- metadata generated from product
- title/description
- canonical URLs
- product structured data when appropriate
- accessible image alt text
- crawlable category/product pages

DO_NOT:
"Expose internal numeric IDs as the only customer-facing identity."

============================================================
28. ACCESSIBILITY/UI PRESERVATION
============================================================

UI_SOURCE_OF_TRUTH:
"Existing NextMerce visual design should be preserved during backend migration unless an explicit redesign task is requested."

WHEN CHANGING DATA:
- preserve existing Tailwind/class structure when practical
- preserve grid/list modes
- preserve responsive behavior
- preserve keyboard accessibility
- do not remove labels/aria attributes while refactoring
- do not replace working SVG icons unnecessarily

============================================================
29. DEVELOPMENT COMMANDS
============================================================

FRONTEND_DIRECTORY:
frontend/

START_DEV:
npm run dev

EXPECTED_FRONTEND:
http://127.0.0.1:3000/

BACKEND_DIRECTORY:
backend/

EXPECTED_DJANGO:
http://127.0.0.1:8000/

DIRECT_DJANGO_PRODUCTS:
http://127.0.0.1:8000/api/products/

NEXTJS_PROXY_PRODUCTS:
http://127.0.0.1:3000/api/products/

TEMP_TEST_PAGE:
http://127.0.0.1:3000/api-test/

============================================================
30. TROUBLESHOOTING HISTORY / LESSONS LEARNED
============================================================

ISSUE_1:
"Missing <html> and <body> tags in root layout."

CAUSE:
A test page was created directly under src/app/api-test/ while the project had only src/app/(site)/layout.tsx containing html/body.

FIX:
Move test page to src/app/(site)/api-test/page.tsx.
Do not create a competing root layout unless architecture changes.

ISSUE_2:
"Next.js rewrite proxy /api/products did not work."

DIRECT_DJANGO:
127.0.0.1:8000/api/products/ worked.

FAILED_PROXY:
127.0.0.1:3000/api/products/ did not work via next.config.js rewrites.

FIX:
Use src/app/api/products/route.ts as a server-side proxy.

ISSUE_3:
"Product image did not load."

CAUSE:
Django API returned relative /media/... but browser was requesting it from Next.js port 3000 and there was no media route.

FIX:
Create src/app/media/[...path]/route.ts proxying /media/* to Django.

CURRENT_RESULT:
Product image loads through Next.js.

ISSUE_4:
"Temporary product card looked bad."

CAUSE:
The api-test page used a hand-written generic card, not the actual NextMerce UI.

FIX/DIRECTION:
Do not spend time polishing api-test into the storefront.
Use existing NextMerce SingleGridItem/SingleListItem/etc. and feed them adapted Oscar data.

============================================================
31. CURRENT MIGRATION PHILOSOPHY
============================================================

RULE_1:
"Keep NextMerce UI; replace its data source."

RULE_2:
"Use adapters instead of rewriting every component at once."

RULE_3:
"Keep Oscar authoritative."

RULE_4:
"Build vertical slices and test each one."

RULE_5:
"Do not add infrastructure unless it solves a real current problem."

RULE_6:
"Prefer self-hosted/open-source/local solutions because budget = zero."

RULE_7:
"Backend user has zero backend experience; explain backend-facing changes clearly when collaborating with the project owner."

RULE_8:
"Comment important backend-facing integration code, but do not fill files with comments that add no information."

============================================================
32. CURRENT TODO / NEXT IMMEDIATE TASK
============================================================

NEXT_IMMEDIATE_TASK:
"Finish the actual NextMerce product-card integration."

REQUIRED_INSPECTION_FILES:
src/components/Shop/SingleGridItem.tsx
src/components/Shop/SingleListItem.tsx

THEN:
- verify adapted Product fields match exactly
- verify image rendering
- verify price/discount rendering
- verify card click/navigation
- verify existing wishlist/cart buttons are not accidentally disconnected
- replace shopWithSidebar demo data with real Oscar data if not already done
- remove hardcoded "Showing 9 of 50"
- later remove hardcoded category/gender lists

AFTER_CARD:
"Build the real product detail page using slug and Oscar child variants."

============================================================
33. AI INSTRUCTIONS / GUARDRAILS
============================================================

AN_AI_WORKING_ON_THIS_PROJECT_MUST:
1. Read this document first.
2. Inspect actual repository files before modifying any filename not confirmed here.
3. Preserve NextMerce UI unless explicit redesign requested.
4. Keep Django/Oscar authoritative for commerce.
5. Prefer existing API utilities.
6. Do not reintroduce Sanity/NextAuth/hosted services without explicit approval.
7. Do not invent API fields.
8. Do not put secrets in NEXT_PUBLIC_* variables.
9. Do not put Django SECRET_KEY/payment secrets in frontend code.
10. Do not calculate authoritative totals in the browser.
11. Use same-origin /api/* where possible.
12. Use same-origin /media/* where possible.
13. Preserve CSRF/session requirements for unsafe requests.
14. When a backend change is required, state the Django endpoint/data contract needed before writing frontend code.
15. When uncertain about current file contents, inspect the file rather than assuming template/upstream content.

AI_RESPONSE_STYLE_FOR_PROJECT:
- Step-by-step.
- Beginner-friendly backend explanation because owner has no backend experience.
- File-by-file changes.
- Exact paths.
- Full replacement snippets when safer than partial ambiguous edits.
- Explain why a change exists.
- Avoid unnecessary architecture changes.
- Prefer incremental/testable changes.
- Never claim a change is complete unless it was actually confirmed.

============================================================
34. CURRENT STATUS SUMMARY
============================================================

CONFIRMED/ESTABLISHED:
- NextMerce selected as frontend base.
- Django Oscar selected as backend.
- Frontend/backend are separate applications.
- Django product API works directly.
- Next.js /api/products/ Route Handler works.
- Product JSON reaches browser through Next.js.
- Django media image proxy works.
- Product image is visible in Next.js.
- Existing NextMerce Product type is documented.
- shopData.ts is identified as demo product source.
- Multiple components consuming shopData are identified.
- ShopWithSidebar is identified as a primary migration target.
- (site) route-group layout architecture is understood.
- Static template data is being replaced incrementally rather than by rewriting the UI.

NOT_FINAL_YET:
- Real NextMerce product card fully integrated with Oscar.
- Real product detail page.
- Variant selection UI.
- Basket/Oscar cart integration.
- Authentication UI integration.
- Checkout.
- Payment.
- Orders/customer account.
- Dynamic filters.
- Dynamic pagination.
- Production deployment.
- Full removal of static shopData.
- Full cleanup of Sanity/NextAuth references must be verified in repository.

END_OF_FRONTEND_CONTEXT
