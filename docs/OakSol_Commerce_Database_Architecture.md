# OakSol Commerce — Database Architecture
## Phase 1 — Multi-Tenant PostgreSQL Schema
**Prepared for:** Mokasafat Amir Behesti (Boss)  
**Prepared by:** Aftab | OakSol Commerce  
**Date:** June 4, 2026  
**Database:** PostgreSQL 16+  
**Architecture:** Multi-Tenant · UUID PKs · Row-Level Isolation  

---

### Table of Contents
1.  **Shop & Tenant** (`shops`, `shop_domains`)
2.  **System** (`users`, `settings`, `activity_logs`)
3.  **Product Catalog** (`categories`, `brands`, `products`, `product_gallery`, `product_variants`, `variant_attributes`, `product_sections`, `product_faqs`)
4.  **Inventory** (`warehouses`, `inventory_logs`)
5.  **Customer** (`customers`, `addresses`)
6.  **Cart & Order** (`carts`, `cart_items`, `orders`, `order_items`, `order_status_logs`, `shipping_rates`, `coupons`)
7.  **Payment** (`payment_gateways`, `payments`, `taxes`)
8.  **Content & Marketing** (`reviews`, `notifications`)
9.  **Indexes & Performance** (16 optimized indexes)
10. **Entity-Relationship Map** (19 relationships)
11. **Key Design Decisions** (UUID keys, Isolation, Snapshot Pattern, etc.)

---

### 1. Shop & Tenant

#### `shops` [NEW]
*Every merchant account — core of multi-tenancy*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **name** | VARCHAR(150) NOT NULL | Display name of the shop |
| **slug** | VARCHAR(100) UNIQUE NOT NULL | URL-safe identifier |
| **owner_id** | UUID REFERENCES users(id) NOT NULL | FK → users |
| **plan** | VARCHAR(50) DEFAULT 'free' | free / starter / pro |
| **status** | VARCHAR(30) DEFAULT 'active' | active / suspended / deleted |
| **logo_url** | TEXT | CDN URL |
| **description** | TEXT | Short shop bio |
| **currency** | CHAR(3) DEFAULT 'BDT' | ISO 4217 |
| **timezone** | VARCHAR(60) DEFAULT 'Asia/Dhaka' | |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |
| **updated_at** | TIMESTAMPTZ | DEFAULT NOW() |

#### `shop_domains` [NEW]
*Subdomain + custom domain mapping per shop*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | FK → shops |
| **domain** | VARCHAR(255) UNIQUE NOT NULL | e.g. `aftabshop.oaksolcommerce.in` |
| **type** | VARCHAR(20) DEFAULT 'subdomain' | subdomain / custom |
| **is_primary** | BOOLEAN DEFAULT FALSE | One primary per shop |
| **status** | VARCHAR(30) DEFAULT 'pending' | pending / active / failed |
| **verified_at** | TIMESTAMPTZ NULL | Until DNS verified |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |

---

### 2. System

#### `users` [MOD]
*Admin & staff accounts (per shop)*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | FK → shops |
| **name** | VARCHAR(150) NOT NULL | |
| **email** | VARCHAR(255) UNIQUE NOT NULL | |
| **password_hash** | TEXT NOT NULL | |
| **role** | VARCHAR(30) DEFAULT 'staff' | admin / staff |
| **avatar_url** | TEXT | |
| **is_active** | BOOLEAN DEFAULT TRUE | |
| **last_login_at** | TIMESTAMPTZ | |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |
| **updated_at** | TIMESTAMPTZ | DEFAULT NOW() |

#### `settings`
*Key-value store for shop-level config*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | FK → shops |
| **key** | VARCHAR(100) NOT NULL | e.g. `'smtp_host'` |
| **value** | TEXT | JSON or plain string |
| **group** | VARCHAR(60) | email / payment / seo |
| **updated_at** | TIMESTAMPTZ | DEFAULT NOW() |
| **UNIQUE** | `(shop_id, key)` | |

#### `activity_logs` [NEW]
*Admin action audit trail*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | FK → shops |
| **user_id** | UUID REFERENCES users(id) | FK → users |
| **action** | VARCHAR(100) NOT NULL | e.g. `'order.status_updated'` |
| **entity_type** | VARCHAR(60) | order / product / user |
| **entity_id** | UUID | |
| **metadata** | JSONB DEFAULT '{}' | Extra context |
| **ip_address** | INET | |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |

---

### 3. Product Catalog

#### `categories`
*Nested category tree (self-referential)*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | FK → shops |
| **parent_id** | UUID REFERENCES categories(id) | NULL = root |
| **name** | VARCHAR(150) NOT NULL | |
| **slug** | VARCHAR(150) NOT NULL | |
| **image_url** | TEXT | |
| **sort_order** | INT DEFAULT 0 | |
| **is_active** | BOOLEAN DEFAULT TRUE | |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |
| **UNIQUE** | `(shop_id, slug)` | |

#### `brands`
*Product brands / manufacturers*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | FK → shops |
| **name** | VARCHAR(150) NOT NULL | |
| **slug** | VARCHAR(150) NOT NULL | |
| **logo_url** | TEXT | |
| **is_active** | BOOLEAN DEFAULT TRUE | |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |
| **UNIQUE** | `(shop_id, slug)` | |

#### `products`
*Core product record*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | FK → shops |
| **category_id** | UUID REFERENCES categories(id) | |
| **brand_id** | UUID REFERENCES brands(id) | |
| **name** | VARCHAR(255) NOT NULL | |
| **slug** | VARCHAR(255) NOT NULL | |
| **description** | TEXT | |
| **short_desc** | TEXT | For listing cards |
| **price** | NUMERIC(12,2) NOT NULL | Display price |
| **compare_price** | NUMERIC(12,2) | Crossed-out original |
| **cost_price** | NUMERIC(12,2) | Internal only |
| **master_sku** | VARCHAR(100) | Optional master SKU |
| **status** | VARCHAR(30) DEFAULT 'draft' | draft / active / archived |
| **is_featured** | BOOLEAN DEFAULT FALSE | |
| **has_variants** | BOOLEAN DEFAULT FALSE | |
| **tax_id** | UUID REFERENCES taxes(id) | |
| **total_sold** | INT DEFAULT 0 | |
| **meta_title** | VARCHAR(255) | |
| **meta_description** | TEXT | |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |
| **updated_at** | TIMESTAMPTZ | DEFAULT NOW() |
| **UNIQUE** | `(shop_id, slug)` | |

#### `product_gallery`
*Product images (multiple per product)*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | |
| **product_id** | UUID REFERENCES products(id) ON DELETE CASCADE | |
| **url** | TEXT NOT NULL | |
| **alt_text** | TEXT | |
| **sort_order** | INT DEFAULT 0 | |
| **is_cover** | BOOLEAN DEFAULT FALSE | |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |

#### `product_variants`
*Each SKU with its own price & stock*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | |
| **product_id** | UUID REFERENCES products(id) ON DELETE CASCADE | |
| **sku** | VARCHAR(100) UNIQUE NOT NULL | |
| **label** | VARCHAR(255) | e.g. `'Red / XL'` |
| **price** | NUMERIC(12,2) NOT NULL | |
| **compare_price** | NUMERIC(12,2) | |
| **cost_price** | NUMERIC(12,2) | |
| **stock_qty** | INT DEFAULT 0 NOT NULL | |
| **low_stock_at** | INT DEFAULT 5 | Alert threshold |
| **image_url** | TEXT | |
| **total_sold** | INT DEFAULT 0 | |
| **is_active** | BOOLEAN DEFAULT TRUE | |
| **sort_order** | INT DEFAULT 0 | |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |
| **updated_at** | TIMESTAMPTZ | DEFAULT NOW() |

#### `variant_attributes`
*Key-value attributes for each variant*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | |
| **variant_id** | UUID REFERENCES product_variants(id) ON DELETE CASCADE | |
| **attr_key** | VARCHAR(60) NOT NULL | e.g. `'color'`, `'size'` |
| **attr_value** | VARCHAR(150) NOT NULL | e.g. `'Red'`, `'XL'` |
| **sort_order** | INT DEFAULT 0 | |

#### `product_sections`
*Homepage & page layout sections*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | |
| **title** | VARCHAR(200) NOT NULL | |
| **type** | VARCHAR(50) | banner / grid / carousel |
| **config** | JSONB DEFAULT '{}' | |
| **sort_order** | INT DEFAULT 0 | |
| **is_active** | BOOLEAN DEFAULT TRUE | |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |

#### `product_faqs`
*Q&A per product*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | |
| **product_id** | UUID REFERENCES products(id) ON DELETE CASCADE | |
| **question** | TEXT NOT NULL | |
| **answer** | TEXT NOT NULL | |
| **sort_order** | INT DEFAULT 0 | |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |

---

### 4. Inventory

#### `warehouses` [NEW]
*Warehouse / location reference*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | |
| **name** | VARCHAR(150) NOT NULL | e.g. `'Main Warehouse'` |
| **address** | TEXT | |
| **is_active** | BOOLEAN DEFAULT TRUE | |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |

#### `inventory_logs` [MOD]
*Stock change audit trail per variant*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | |
| **variant_id** | UUID REFERENCES product_variants(id) | |
| **warehouse_id** | UUID REFERENCES warehouses(id) | FK added — MOD |
| **type** | VARCHAR(30) NOT NULL | restock / sale / adjustment |
| **qty_change** | INT NOT NULL | +ve in, -ve out |
| **qty_after** | INT NOT NULL | Stock snapshot |
| **ref_id** | UUID | `order_id` / `NULL` |
| **note** | TEXT | |
| **created_by** | UUID REFERENCES users(id) | |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |

---

### 5. Customer

#### `customers` [MOD]
*Registered & guest shoppers*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | |
| **name** | VARCHAR(150) | |
| **email** | VARCHAR(255) | |
| **phone** | VARCHAR(30) | |
| **password_hash** | TEXT | NULL for guests |
| **guest_token** | VARCHAR(255) UNIQUE | Session token for guests |
| **is_verified** | BOOLEAN DEFAULT FALSE | |
| **avatar_url** | TEXT | |
| **total_orders** | INT DEFAULT 0 | |
| **total_spent** | NUMERIC(14,2) DEFAULT 0 | |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |
| **updated_at** | TIMESTAMPTZ | DEFAULT NOW() |
| **UNIQUE** | `(shop_id, email)` | WHERE email IS NOT NULL |

#### `addresses`
*Shipping & billing addresses*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | |
| **customer_id** | UUID REFERENCES customers(id) ON DELETE CASCADE | |
| **type** | VARCHAR(20) DEFAULT 'shipping' | shipping / billing |
| **full_name** | VARCHAR(150) NOT NULL | |
| **phone** | VARCHAR(30) | |
| **address_line1** | TEXT NOT NULL | |
| **address_line2** | TEXT | |
| **city** | VARCHAR(100) NOT NULL | |
| **state** | VARCHAR(100) | |
| **postal_code** | VARCHAR(20) | |
| **country** | CHAR(2) DEFAULT 'BD' | ISO 3166-1 alpha-2 |
| **is_default** | BOOLEAN DEFAULT FALSE | |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |

---

### 6. Cart & Order

#### `carts`
*Active shopping carts (registered + guest)*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | |
| **customer_id** | UUID REFERENCES customers(id) | NULL for guests |
| **session_id** | VARCHAR(255) UNIQUE | Guest cart token |
| **coupon_id** | UUID REFERENCES coupons(id) | |
| **expires_at** | TIMESTAMPTZ | |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |
| **updated_at** | TIMESTAMPTZ | DEFAULT NOW() |

#### `cart_items`
*Line items inside a cart*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | |
| **cart_id** | UUID REFERENCES carts(id) ON DELETE CASCADE | |
| **variant_id** | UUID REFERENCES product_variants(id) | |
| **qty** | INT NOT NULL DEFAULT 1 | CHECK (qty > 0) |
| **unit_price** | NUMERIC(12,2) NOT NULL | Price at time of add |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |
| **UNIQUE** | `(cart_id, variant_id)` | |

#### `orders`
*Placed orders — financial record*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | |
| **customer_id** | UUID REFERENCES customers(id) | |
| **order_number** | VARCHAR(30) UNIQUE NOT NULL | Human-readable # |
| **status** | VARCHAR(30) DEFAULT 'pending' | pending / confirmed / shipped / cancelled |
| **subtotal** | NUMERIC(12,2) NOT NULL | |
| **discount_amount**| NUMERIC(12,2) DEFAULT 0 | |
| **shipping_amount**| NUMERIC(12,2) DEFAULT 0 | |
| **tax_amount** | NUMERIC(12,2) DEFAULT 0 | |
| **total** | NUMERIC(12,2) NOT NULL | |
| **coupon_id** | UUID REFERENCES coupons(id) | |
| **shipping_rate_id**| UUID REFERENCES shipping_rates(id) | |
| **shipping_address**| JSONB NOT NULL | Snapshot at order time |
| **billing_address**| JSONB | |
| **notes** | TEXT | |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |
| **updated_at** | TIMESTAMPTZ | DEFAULT NOW() |

#### `order_items`
*Product snapshot per order line*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | |
| **order_id** | UUID REFERENCES orders(id) ON DELETE CASCADE | |
| **variant_id** | UUID REFERENCES product_variants(id) | |
| **product_snap** | JSONB NOT NULL | Name, SKU, image at order time |
| **qty** | INT NOT NULL | |
| **unit_price** | NUMERIC(12,2) NOT NULL | |
| **line_total** | NUMERIC(12,2) NOT NULL | |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |

#### `order_status_logs` [NEW]
*Full audit trail of order status changes*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | |
| **order_id** | UUID REFERENCES orders(id) ON DELETE CASCADE | |
| **from_status** | VARCHAR(30) NULL | NULL for first entry |
| **to_status** | VARCHAR(30) NOT NULL | |
| **note** | TEXT | |
| **changed_by** | UUID REFERENCES users(id) | |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |

#### `shipping_rates` [NEW]
*Flat-rate or zone-based delivery pricing*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | |
| **name** | VARCHAR(150) NOT NULL | e.g. `'Inside Dhaka'` / `'Inside Delhi'` |
| **rate** | NUMERIC(10,2) NOT NULL | |
| **free_above** | NUMERIC(10,2) DEFAULT 0 | Free shipping threshold |
| **zone_label** | VARCHAR(100) | Geo zone label |
| **is_active** | BOOLEAN DEFAULT TRUE | |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |

#### `coupons`
*Discount codes*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | |
| **code** | VARCHAR(60) NOT NULL | |
| **type** | VARCHAR(20) NOT NULL | percent / fixed / free_shipping |
| **value** | NUMERIC(10,2) NOT NULL | |
| **min_order** | NUMERIC(10,2) DEFAULT 0 | |
| **usage_limit** | INT | NULL = unlimited |
| **used_count** | INT DEFAULT 0 | |
| **starts_at** | TIMESTAMPTZ | |
| **ends_at** | TIMESTAMPTZ | |
| **is_active** | BOOLEAN DEFAULT TRUE | |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |
| **UNIQUE** | `(shop_id, code)` | |

---

### 7. Payment

#### `payment_gateways`
*Gateway config per shop (Razorpay / COD config)*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | |
| **name** | VARCHAR(100) NOT NULL | e.g. `'Razorpay'` / `'COD'` |
| **slug** | VARCHAR(60) NOT NULL | |
| **config** | JSONB DEFAULT '{}' | API keys — encrypted at rest |
| **is_active** | BOOLEAN DEFAULT TRUE | |
| **sort_order** | INT DEFAULT 0 | |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |

#### `payments`
*Transaction record per order*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | |
| **order_id** | UUID REFERENCES orders(id) | |
| **gateway_id** | UUID REFERENCES payment_gateways(id) | |
| **amount** | NUMERIC(12,2) NOT NULL | |
| **currency** | CHAR(3) DEFAULT 'INR' | |
| **status** | VARCHAR(30) DEFAULT 'pending' | pending / paid / failed / refunded |
| **transaction_id** | VARCHAR(255) UNIQUE | Gateway reference |
| **gateway_resp** | JSONB DEFAULT '{}' | Raw gateway response |
| **paid_at** | TIMESTAMPTZ | |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |

#### `taxes` [NEW]
*VAT / GST rate definitions*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | |
| **name** | VARCHAR(100) NOT NULL | e.g. `'GST 18%'` |
| **rate** | NUMERIC(5,2) NOT NULL | 18.00 = 18% |
| **type** | VARCHAR(30) DEFAULT 'percent' | |
| **is_inclusive** | BOOLEAN DEFAULT FALSE | |
| **is_active** | BOOLEAN DEFAULT TRUE | |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |

---

### 8. Content & Marketing

#### `reviews`
*Customer product reviews & ratings*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | |
| **product_id** | UUID REFERENCES products(id) ON DELETE CASCADE | |
| **customer_id** | UUID REFERENCES customers(id) | |
| **rating** | SMALLINT NOT NULL | CHECK (rating BETWEEN 1 AND 5) |
| **title** | VARCHAR(200) | |
| **body** | TEXT | |
| **status** | VARCHAR(20) DEFAULT 'pending' | pending / approved / rejected |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |

#### `notifications` [NEW]
*Order & system alerts per customer*

| Column | Type / Constraint | Note |
| :--- | :--- | :--- |
| **id** | UUID PRIMARY KEY | DEFAULT gen_random_uuid() |
| **shop_id** | UUID REFERENCES shops(id) ON DELETE CASCADE | |
| **customer_id** | UUID REFERENCES customers(id) ON DELETE CASCADE | |
| **type** | VARCHAR(60) NOT NULL | `order_confirmed` / `shipped` / ... |
| **title** | VARCHAR(255) NOT NULL | |
| **body** | TEXT | |
| **is_read** | BOOLEAN DEFAULT FALSE | |
| **ref_id** | UUID | `order_id` or `NULL` |
| **created_at** | TIMESTAMPTZ | DEFAULT NOW() |

---

### 9. Indexes & Performance
Every query in a multi-tenant system must be prefixed by `shop_id`. The 16 indexes below ensure PostgreSQL never performs a full table scan.

| Index Name | On Table (Columns) | Purpose |
| :--- | :--- | :--- |
| `idx_products_shop` | `products(shop_id)` | Multi-tenancy filter |
| `idx_orders_shop` | `orders(shop_id)` | Multi-tenancy filter |
| `idx_customers_shop` | `customers(shop_id)` | Multi-tenancy filter |
| `idx_variants_product`| `product_variants(product_id)` | Catalog loading |
| `idx_variants_sku` | `product_variants(sku)` | Unique SKU scanning |
| `idx_cart_items_cart` | `cart_items(cart_id)` | Cart checkout querying |
| `idx_order_items_order`| `order_items(order_id)` | Invoicing detail lookup |
| `idx_payments_order` | `payments(order_id)` | Gateway response matching |
| `idx_inventory_variant`| `inventory_logs(variant_id)` | Stock history auditing |
| `idx_reviews_product` | `reviews(product_id)` | Star rating querying |
| `idx_notifications_cust`| `notifications(customer_id, is_read)`| Unread user alerts inbox |
| `idx_activity_shop_time`| `activity_logs(shop_id, created_at DESC)`| Admin log timeline lookup |
| `idx_shop_domain` | `shop_domains(domain)` **UNIQUE** | Routing requests to tenant |
| `idx_order_number` | `orders(shop_id, order_number)` **UNIQUE**| Customer order tracking |
| `idx_cart_session` | `carts(session_id)` **PARTIAL** | Guest cart lookup (WHERE non-NULL) |
| `idx_variant_stock` | `product_variants(shop_id, stock_qty)` **PARTIAL**| Low-stock warnings (WHERE low stock) |

---

### 10. Entity-Relationship Map

| From | To | Description | Cardinality |
| :--- | :--- | :--- | :--- |
| `shops` | `users` | 1 shop → many staff users | 1 : N |
| `shops` | `shop_domains` | 1 shop → many domains | 1 : N |
| `shops` | `products` | 1 shop → many products | 1 : N |
| `products` | `product_variants` | 1 product → many variants (SKUs) | 1 : N |
| `product_variants`| `variant_attributes` | 1 variant → many attributes | 1 : N |
| `product_variants`| `inventory_logs` | 1 variant → full stock history | 1 : N |
| `warehouses` | `inventory_logs` | 1 warehouse → many stock events | 1 : N |
| `customers` | `carts` | 1 customer → 1 active cart | 1 : 1 |
| `carts` | `cart_items` | 1 cart → many items | 1 : N |
| `customers` | `orders` | 1 customer → many orders | 1 : N |
| `orders` | `order_items` | 1 order → many line items | 1 : N |
| `orders` | `order_status_logs` | 1 order → full status history | 1 : N |
| `orders` | `payments` | 1 order → 1+ payment attempts | 1 : N |
| `payment_gateways`| `payments` | 1 gateway → many transactions | 1 : N |
| `products` | `reviews` | 1 product → many reviews | 1 : N |
| `customers` | `notifications` | 1 customer → many notifications | 1 : N |
| `taxes` | `products` | 1 tax rate → many products | 1 : N |
| `shipping_rates` | `orders` | 1 shipping rate → many orders | 1 : N |
| `coupons` | `orders` | 1 coupon → many orders | 1 : N |

---

### 11. Key Design Decisions

1.  **UUID Primary Keys:** All PKs use `gen_random_uuid()` — safe for distributed systems, no sequential enumeration risk.
2.  **Multi-Tenant Isolation:** Every table carries `shop_id`. Row-level isolation — no cross-tenant data leak possible at DB layer.
3.  **Custom Domain Routing:** `shop_domains` handles both subdomains (`shopname.oaksolcommerce.in`) and custom domains with SSL status tracking.
4.  **Variant Stock System:** `product_variants` holds per-SKU stock. `inventory_logs` gives a full audit trail. `low_stock_at` enables automated alerts.
5.  **Guest Checkout:** `customers.guest_token` + `carts.session_id` enables guest checkout. Guests can be merged into registered accounts later.
6.  **Order Snapshot Pattern:** `order_items.product_snap` (JSONB) stores product name/price/image at order time — price changes never corrupt history.
7.  **Address Snapshot:** `orders.shipping_address` (JSONB) snapshots the address — customers can change addresses without breaking old orders.
8.  **TIMESTAMPTZ:** All timestamps use `TIMESTAMPTZ` (timezone-aware) — essential for multi-region and DST correctness.
9.  **Soft Deletes:** Use status/is_active columns rather than hard deletes — preserves referential integrity and history.

---
*CONFIDENTIAL — FOR INTERNAL USE ONLY — OAKSOL COMMERCE DATABASE ARCHITECTURE v1.0*
