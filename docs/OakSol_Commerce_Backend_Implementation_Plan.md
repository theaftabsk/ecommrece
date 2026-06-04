# OakSol Commerce — Backend Implementation Plan
## Phase 1 — Node.js & PostgreSQL Service Engine (India Focus)
**Prepared for:** Mokasafat Amir Behesti (Boss)  
**Prepared by:** Aftab  
**Date:** June 4, 2026  
**Version:** v1.0  
**Security:** Confidential — Internal Developer Specs  

---

### 1. Architecture & Technology Stack

The OakSol Commerce backend is architected using a modular TypeScript framework to ensure robustness, explicit typing, and enterprise scalability.

| Technology Component | Implementation Choice | Business / Technical Value |
| :--- | :--- | :--- |
| **Runtime Environment** | Node.js (v24.x LTS) | Asynchronous non-blocking I/O for high transaction volumes. |
| **Application Framework**| NestJS (v10.x) | Modular structure, dependency injection, and clean architectural patterns. |
| **Database Engine** | PostgreSQL (v16+) | Strict relational integrity, JSONB support for order snapshots. |
| **ORM Layer** | Prisma ORM | Type-safe database client and simplified schema migrations. |
| **Authentication** | Passport JWT | Stateless, secure JSON Web Token authentication for admins & buyers. |
| **Payment API** | Razorpay SDK (India) | Secure API integration for UPI, Cards, Net Banking, and webhooks. |

---

### 2. Project Folder Directory Structure
The directory structure follows standard NestJS conventions. Modules are logically isolated by domain namespaces, ensuring they are independent and SaaS-ready.

```
oaksol-commerce-backend/
├── prisma/
│   ├── schema.prisma (Database tables specifications)
│   └── migrations/ (Prisma migration files history)
├── src/
│   ├── common/ (Guards, filters, interceptors, middleware)
│   │   └── middleware/
│   │       └── tenant.middleware.ts (Resolves shop_id from host URL)
│   ├── modules/
│   │   ├── auth/ (Staff and customer auth modules)
│   │   ├── shop/ (Shops and shop_domains management)
│   │   ├── catalog/ (Products, categories, brands, variants)
│   │   ├── inventory/ (Warehouses, stock levels, adjustment logs)
│   │   ├── customer/ (Buyer profiles, guest tokens, addresses)
│   │   ├── order/ (Cart checkout, order items, status logs)
│   │   └── payment/ (Razorpay client and gateway webhook handlers)
│   ├── app.module.ts (Root application configuration module)
│   └── main.ts (Application execution entry point)
├── package.json
└── tsconfig.json
```

---

### 3. Multi-Tenant Domain Middleware
Multi-tenancy is enforced at the network entry point. A custom NestJS middleware intercepts incoming HTTP requests, inspects the `Host` header, resolves the tenant's `shop_id`, and attaches it to the request context.

```typescript
// src/common/middleware/tenant.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: any, res: any, next: () => void) {
    const host = req.headers.host; // e.g. 'aftabshop.oaksolcommerce.in'
    
    // Query database domain registry
    const domainRecord = await this.prisma.shopDomain.findUnique({
      where: { domain: host },
      select: { shop_id: true }
    });

    if (!domainRecord) {
      return res.status(404).json({ error: 'Domain mapping not found' });
    }

    // Attach resolved shop_id to request context
    req.shopId = domainRecord.shop_id;
    next();
  }
}
```

---

### 4. Razorpay Payment Webhook Pipeline
To prevent cart abandonment and guarantee immediate order processing, the payment webhook must process asynchronously and verify signatures to prevent spoofing.

```
[Razorpay Webhook Payload Receival]
                 │
                 ▼
[Signature Integrity Validation] (Verify x-razorpay-signature using secret key)
                 │
                 ▼
[Database Transaction Execution] (Update payment log → Update order status to 'confirmed')
                 │
                 ▼
[Notification & Logistics Trigger] (Deduct stock quantities, email customer receipt)
```

---

### 5. Core API Endpoints Specification
The endpoints list provides a standardized REST interface. All routes require the `shop_id` mapping context resolved by the Tenant Middleware.

| Method | Path | Auth | Business Role & Operations |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Verifies staff credentials, signs and returns Admin JWT. |
| `GET` | `/api/v1/catalog/products` | Public | Fetches catalog list with sorting and category filter scopes. |
| `POST` | `/api/v1/catalog/products` | Admin | Creates a new product with multiple variants, SKU codes, and stock. |
| `POST` | `/api/v1/checkout/cart` | Public/Guest | Validates stock quantities and initializes/updates cart items. |
| `POST` | `/api/v1/checkout/order` | Public/Guest | Locks stock levels, generates order receipt record in database. |
| `POST` | `/api/v1/payments/razorpay/order`| Public/Guest | Initiates Razorpay API request, returns external `razorpay_order_id`. |
| `POST` | `/api/v1/payments/razorpay/webhook`| Public (Webhook)| Listens for `payment.captured` and signs/processes transactions. |
| `GET` | `/api/v1/orders/admin` | Admin | Lists received orders for processing, filtering by state. |
| `PATCH`| `/api/v1/orders/admin/:id/status`| Admin | Updates status (e.g. Shipped) and creates audit status logs. |

---

### 6. Implementation Timeline Roadmap

#### Week 1: Infrastructure & Environment Setup
Initialize the NestJS boilerplate. Set up the Prisma engine configurations. Run SQL database migrations to deploy the 29 schema tables with UUID extensions. Implement the base Tenant middleware to verify hostname requests.

#### Week 2: Authentication & Catalog Services
Deploy Passport JWT guards. Implement the core Product Catalog APIs (CRUD operations for products, variants, brands, and categories). Build admin management panels mapping custom fields, stock alert variables, and FAQ tables.

#### Week 3: Cart, Orders & Checkout Pipeline
Build the shopping cart module supporting both guests and registered users. Implement the checkout order generation pipeline, ensuring order items snap products using the JSONB Snapshot Pattern. Set up flat-rate shipping calculations.

#### Week 4: Razorpay Payments & Notification Webhooks
Integrate the Razorpay SDK. Build order creation and webhook listener endpoints. Add cryptographic validation to incoming webhook headers. Trigger automated customer notification actions, inventory logging updates, and SMS alerts.

#### Week 5: Quality Assurance, Security Audits & Launch
Execute automated unit tests for payment APIs and multi-tenant middleware. Run query profiling audits to check PostgreSQL indexes. Deploy code on secure cloud VMs, configure SSL certificates, and prepare API configurations for launch.

---
*CONFIDENTIAL — FOR INTERNAL USE ONLY — OAKSOL COMMERCE SPECIFICATION v1.0*
