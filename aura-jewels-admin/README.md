# Aura Jewels - Management Dashboard

Full-featured e-commerce administration and content management system built with Next.js, Radix UI, TanStack Table, and Tailwind CSS.

## Architecture & Features

- **Product & Inventory Management**: Catalog curation, variant tracking, diamond attributes, and batch Excel/CSV import pipelines.
- **Order Fulfillment**: Real-time order monitoring, status lifecycle management, return/cancellation handling, and invoice downloads.
- **CMS Management**: Dynamic control over homepage banners, category landing showcases, and mega-menus.
- **Marketing & Pricing**: Promotional coupon codes, discounts, active currency management, and buffer percentage configuration.
- **RBAC**: Staff user roles with granular permission levels.

## Getting Started

### 1. Prerequisites
- Node.js (v18.x or later)
- Aura Jewels API running on port `2110`

### 2. Installation
```bash
npm install
```

### 3. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```
Ensure `NEXT_PUBLIC_API_BASE_URL` points to `http://localhost:2110/`.

### 4. Running the Dashboard
```bash
# Start development server
npm run dev

# Build for production
npm run build
npm run start
```
Open [http://localhost:3001](http://localhost:3001) in your browser.
