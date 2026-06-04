# OakSol Commerce
## Business Plan — Phase 1
**E-Commerce Platform · India Market · Single Store Launch**  
*Prepared by Aftab | June 2026*  

---

### 01 Platform Flow — Top to Bottom

```
OakSol Commerce Platform
          │
          ▼
   Admin Dashboard
          │
          ▼
    Store Website
          │
          ▼
       Customer
```

> [!NOTE]  
> OakSol Commerce is a single platform. Admin controls everything from the top. Customers shop from the bottom. One backend, one database — clean and simple.

---

### 02 How the System Works — Detailed Page Architecture

#### Layer 1 — Admin Dashboard Pages (Merchant Operations)
The Admin Panel is divided into 9 functional pages and editors, giving merchants complete control over products, orders, and system configurations.

1.  **Staff Login Page:** Secure email/password entry, signs Admin JWT, handles session authorizations. (Tables: `users`)
2.  **Analytics Overview:** Charts GMV, order volume, recent payments, and lists low-stock item warning alerts. (Tables: `orders`, `product_variants`, `payments`)
3.  **Product List Page:** Filters catalog items, search by name/SKU, toggle Active/Draft state to instantly hide/show on website. (Tables: `products`, `categories`, `brands`)
4.  **Product Editor Form:** Configure description, upload images, manage 20+ variants (SKU, price, stock per variant), write SEO metadata, FAQs. (Tables: `products`, `product_variants`, `product_gallery`, `product_faqs`)
5.  **Categories & Brands:** Build self-referential subcategory trees, upload brand logo banners, toggle display status. (Tables: `categories`, `brands`)
6.  **Inventory & Warehouses:** Register warehouse spots, view atomic stock audit logs (sales deductions / manual adjustments). (Tables: `warehouses`, `inventory_logs`)
7.  **Orders Hub (List & Details):** Track order flows, update states: *Pending → Confirmed → Shipped → Delivered*, view logs. (Tables: `orders`, `order_items`, `order_status_logs`)
8.  **Coupons & Shipping Rates:** Create promo codes (limits, usage counts, dates), set flat delivery fees per zone. (Tables: `coupons`, `shipping_rates`)
9.  **Settings & Domains:** Set shop metadata, connect custom domains, save encrypted Razorpay API keys (UPI/Cards). (Tables: `settings`, `shop_domains`, `payment_gateways`)

#### Layer 2 — Storefront Website Pages (Customer Checkout Journey)
The end-user store contains 6 optimized checkout pages designed to maximize transaction conversion.

1.  **Homepage:** Features active sliding banners, promotional banner blocks, and dynamic product sections (e.g., Best Sellers, New Arrivals) loaded in customer-preferred order. Banners are fetched dynamically per store. (Tables: `banners`, `product_sections`, `products`)
2.  **Catalog Browser:** Search catalog, filter by price range, category tags, brands; sort dynamically. (Tables: `products`, `categories`, `brands`)
3.  **Product Details Page:** Select variants (real-time price & stock updates), scroll image gallery, check expandable FAQs, view star reviews, and see detailed product tabs (Key Benefits, Active Ingredients, Ideal Usage, How to Use steps). Also displays related products from the same category. (Tables: `products`, `product_variants`, `product_gallery`, `product_faqs`, `reviews`)
4.  **Cart Drawer / Page:** Review order list, modify item quantities, apply promo coupon codes to deduct cart total. (Tables: `carts`, `cart_items`, `coupons`)
5.  **Checkout Page:** Enters delivery addresses, chooses shipping zone, initiates Razorpay payment checkout pop-up. (Tables: `addresses`, `orders`, `order_items`, `payments`)
6.  **Order Success & Tracking:** Presents order invoice summary and tracks shipping updates: *Confirmed → Shipped → Delivered*. (Tables: `orders`, `order_status_logs`, `notifications`)

---

### 03 Product Page — What Admin Can Manage

*   **Basic Info**
    *   Product name
    *   Full description
    *   Short description
    *   Price + compare price
    *   Cost price (internal)
    *   Master SKU
*   **Variants & Stock**
    *   Size / Color variants
    *   Price per variant
    *   Stock per variant
    *   Low stock alert
    *   Image per variant
    *   On / Off per variant
*   **Dynamic Layout Tabs**
    *   Custom Sections (dynamic JSON array of custom sections e.g., Size Guide, Materials, Ingredients, Specifications)
    *   Universal Support (supports Skincare, Fashion, Electronics categories out of the box)
*   **Settings & QA**
    *   Active / Draft / Archive status
    *   Featured toggle
    *   Category & Brand
    *   Tax rate & GST configuration
    *   SEO title & description
    *   Product Q&A (FAQ) list

> [!NOTE]  
> **Variant Scalability & Stock Isolation:** If a product has 20 or more variants, the database maintains each variant as a separate row in the `product_variants` table with its own SKU, stock count, and price. Stock deductions run inside atomic database transactions using PostgreSQL locks, with every adjustment logged in the `inventory_logs` table. This prevents double-selling (race conditions) during high-traffic flash sales.

---

### 04 Database — What Gets Stored
32 tables total. Every piece of data has its own dedicated storage. The system never loses any record — orders, stock changes, and admin actions are all permanently logged.

*   **Shop & Domain**
    *   `shops` — Store info
    *   `shop_domains` — Website address / custom domain
*   **System**
    *   `users` — Admin & staff
    *   `settings` — Config per shop
    *   `activity_logs` — Who did what
*   **Product Catalog & Layout**
    *   `products` — Core product with dynamic custom_sections JSON array
    *   `product_variants` — Size/Color SKUs & atomic stock
    *   `product_gallery` — Multiple image URLs
    *   `variant_attributes` — Attributes (Red, XL)
    *   `product_sections` — Homepage content sections config
    *   `banners` — Promo banners & sliders list
    *   `product_faqs` — Q&A accordion list
    *   `categories` — Nested category tree
    *   `brands` — Product brands
*   **Inventory**
    *   `warehouses` — Warehouse locations
    *   `inventory_logs` — Every stock change
*   **Customer**
    *   `customers` — Buyers (registered + guest)
    *   `addresses` — Shipping & billing
*   **Cart & Order**
    *   `carts` — Active shopping carts
    *   `cart_items` — Items in cart
    *   `orders` — All placed orders
    *   `order_items` — Products per order
    *   `order_status_logs` — Order status history
    *   `shipping_rates` — Delivery pricing
    *   `coupons` — Discount codes
*   **Payment**
    *   `payment_gateways` — Razorpay / COD config
    *   `payments` — Transaction record
    *   `taxes` — GST/VAT rates
*   **Marketing**
    *   `reviews` — Product ratings
    *   `notifications` — Order alerts to customer

---

### 05 Income Model

| Phase | Source | How |
| :--- | :--- | :--- |
| **Phase 1** | Direct Sales | Customer buys from your store → Revenue |
| **Phase 2** | Subscription | Merchants pay monthly: Free / Starter / Pro |
| **Phase 2** | Transaction Fee | Small % on every merchant sale |

> [!NOTE]  
> Phase 1 income is direct — sell products, collect money via Razorpay. The database is already built for Phase 2 multi-merchant SaaS. Adding subscription plans later requires no major changes to the backend.

---

### 06 Phase 1 vs Phase 2 Plan

| Phase 1 — Now (Launch) | Phase 2 — Future (SaaS) |
| :--- | :--- |
| 1 Store only | Multiple Merchants |
| Admin Dashboard | Each Merchant gets own Dashboard |
| Products + Orders | Subscription Billing (monthly) |
| Razorpay Payments | Super Admin Analytics |
| Customer Management | Custom Domain per Shop |
| Inventory + Coupons | Unlimited Shops on 1 Backend |
| `yourdomain.com` | `shopname.oaksolcommerce.in` |

---

### 07 Payment — Razorpay (India)

*   **Gateway:** Razorpay — India's #1 payment platform
*   **UPI:** Google Pay, PhonePe, Paytm, BHIM
*   **Cards:** Credit Card, Debit Card (all Indian banks)
*   **Banking:** Net Banking — 50+ banks supported
*   **Offline:** Cash on Delivery (COD) option
*   **EMI:** EMI option for higher value orders
*   **Refunds:** Instant refund capability from dashboard
*   **Security:** PCI-DSS compliant, API keys encrypted in DB

> [!TIP]  
> **Future Gateway Scalability:** Although Phase 1 launches exclusively with Razorpay (India) and COD, the backend routing architecture is database-driven. Additional payment options (e.g., PhonePe, Cashfree, Paytm PG) can be added in the future by introducing new provider configurations in the `payment_gateways` database schema without requiring frontend edits or backend server rebuilds.

---

### 08 Domain & Website Address

*   **Default URL:** `shop.oaksolcommerce.in` — Free, automatic
*   **Custom Domain:** `yourdomain.com` — Connect your own domain
*   **Both work:** Customers reach the same store either way
*   **SSL & Custom Domains:** HTTPS configuration is automatic on both default and custom domains, managed dynamically by the host mapping middleware.
*   **Dynamic Domain Mapping:** When a request hits the backend, a custom middleware queries the `shop_domains` table to instantly map the incoming hostname to its unique `shop_id` dynamically.
*   **Future:** Every merchant gets their own subdomain when SaaS launches.

> [!IMPORTANT]  
> **Architecture Note:** The database is built multi-tenant from Day 1. This means Phase 1 (1 store) and Phase 2 (many merchants) use the exact same backend. No rebuild needed — just unlock the merchant features when ready.

---

### 09 High-Variant Scalability & Concurrency Flow

If a product has 20 or more variants, the database maintains each variant as a separate row in the `product_variants` table. This isolates pricing, SKU, and stock calculations.

**Stock Deduction & Locking Pipeline:**
```
[Customer buys variant]
           │
           ▼
[Database Transaction Lock] (PostgreSQL locks specific variant row)
           │
           ▼
[Atomic Stock Update] (Deducts stock_qty & writes transaction to inventory_logs)
```
This isolates each variant's stock balance, preventing double-selling (race conditions) during peak checkout events.

---

### 10 Custom Domain Routing Architecture

Merchants can connect custom domains dynamically. The server routes requests dynamically without requiring reboots.

**Routing Pipeline:**
```
[Customer visits: yourdomain.com]
           │
           ▼
[NestJS Middleware Host Inspection] (Reads Host: yourdomain.com)
           │
           ▼
[Query Domain Registry] (Queries shop_domains to get shop_id)
           │
           ▼
[Dynamic Catalog Service] (Injects shop_id, serves specific merchant catalog)
```
HTTPS configuration and SSL provisioning are handled automatically by the routing proxy for both default subdomains and custom domains.

---

### 10.1 Homepage & Product Page Content Logic

#### Homepage Content Resolution Pipeline
The storefront homepage is fully dynamic, loading layout elements based on active database registries in two layers:
1. **Banners & Sliders:** The system fetches active `banners` for the resolved `shop_id`, ordered by `sort_order`. These represent promotional slides at the top of the homepage.
2. **Product Sections:** The system fetches active `product_sections`. Each section contains a `config` JSON column that specifies how products are resolved:
   * If config has `product_ids: [uuid1, uuid2, ...]` or category IDs, products from those targets are loaded.
   * If config type is `featured`, products marked with `is_featured = true` are loaded.

#### Product Detailed Page Content Resolution Pipeline
When a customer views a product page (e.g. Charcoal Ubtan), the catalog service aggregates and compiles all details:
1. **Metadata & Variants:** Fetches name, description, SEO tags, variants, attributes, and stock quantities dynamically.
2. **Rich Tabs:** Loads dynamic structural sections directly from the product's `custom_sections` JSON array (supporting skincare benefits, fashion size guides, or electronics specs dynamically).
3. **FAQs & Reviews:** Queries related accordion FAQs from `product_faqs` and approved reviews from `reviews`.
4. **Related Products:** Automatically queries other active products in the same category (up to 4 items) to render recommendations.



