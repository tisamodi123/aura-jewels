# 💎 Aura Jewels — Full-Stack Luxury E-Commerce Platform

A production-grade, end-to-end fullstack e-commerce ecosystem built specifically for modern fine jewelry, lab-grown diamonds, and bespoke jewelry workflows. Designed with a high-performance Next.js storefront, a feature-rich Next.js management dashboard, and a resilient Express/MongoDB REST API.

---

## 🏗️ Architecture & Modules

The repository is organized as a unified fullstack monorepo:

```
aura-jewels/
├── aura-jewels-front/     # Customer-facing storefront (Next.js 16, React 19, Tailwind CSS)
├── aura-jewels-admin/     # Back-office ERP & CMS panel (Next.js 15, Turbopack, Radix UI)
└── aura-jewels-api/       # Core REST API engine (Node.js, Express, MongoDB, Redis)
```

### 1. Storefront (`aura-jewels-front`)
* **Framework:** Next.js (App Router), React 19, Tailwind CSS, Zustand.
* **Key Features:**
  * Dynamic Diamond & Jewelry Filtering (Cut, Clarity, Color, Carat, Metal purity).
  * Interactive Custom Jewelry Ring Builder & Bespoke Inquiry pipeline.
  * Real-time Multi-Currency & Internationalization support.
  * Responsive luxury design, micro-animations, fast SSR/ISR performance.
  * Secure Customer Portal (Order tracking, Wishlist, Wallet, RMA return requests).

### 2. Admin Dashboard (`aura-jewels-admin`)
* **Framework:** Next.js, Radix UI primitives, Recharts, TanStack Table.
* **Key Features:**
  * Catalog & Inventory Management (Diamonds, Metals, Collections, Categories).
  * Live Metal Price Sync & Dynamic Margin calculation.
  * Order Management, Shipment Lifecycle & Order Return/Exchange workflow.
  * Granular Role-Based Access Control (RBAC) & Staff activity audits.
  * Bulk Excel/CSV imports with schema validation.

### 3. Backend API (`aura-jewels-api`)
* **Runtime:** Node.js, Express 5, Mongoose (MongoDB), Redis cache.
* **Key Features:**
  * Dynamic Price Calculator accounting for daily gold/platinum rate fluctuations.
  * Complete Order Cancellation & Time-based Tiered Refund calculation engine.
  * Wallet credit/debit transaction ledger with double-refund protection.
  * AWS S3 cloud asset upload pipeline with local fallback.
  * JWT Auth with refresh tokens, OTP verification, and rate limiting.

---

## 🛠️ Tech Stack Overview

| Layer | Technologies |
| :--- | :--- |
| **Frontend Storefront** | Next.js 16, React 19, Tailwind CSS, Lucide, Zustand, Swiper |
| **Admin Panel** | Next.js 15, Radix UI, TanStack Table, Recharts, Formik, Yup |
| **Backend API** | Node.js, Express 5, MongoDB, Mongoose, Redis, Nodemailer, ExcelJS |
| **Storage & Media** | AWS S3 / CloudFront CDN support with local fallback |
| **Payment Gateway** | Razorpay integration with webhook reconciliation |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
* **Node.js**: v18.x or v20.x
* **MongoDB**: Running locally or URI
* **Redis**: (Optional, for caching and queue workers)

### 1. Backend Setup
```bash
cd aura-jewels-api
cp .env.example .env
npm install
npm run dev
# Server runs on http://localhost:2110
```

### 2. Storefront Setup
```bash
cd ../aura-jewels-front
cp .env.example .env
npm install
npm run dev
# Storefront runs on http://localhost:3000
```

### 3. Admin Panel Setup
```bash
cd ../aura-jewels-admin
cp .env.example .env
npm install
npm run dev
# Admin dashboard runs on http://localhost:3001
