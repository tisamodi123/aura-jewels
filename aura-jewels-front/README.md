# Aura Jewels - Customer Storefront

High-performance, modern D2C luxury jewellery storefront built with Next.js, React, and Tailwind CSS.

## Architecture & Features

- **Framework**: Next.js (App Router, Server-Side Rendering, Static Optimization)
- **Styling**: Tailwind CSS with custom typography, fluid responsive design, and micro-interactions.
- **Product Catalog**: Dynamic faceted filtering (metal purity, diamond shapes, carats, price brackets, occasions).
- **Cart & Checkout**: Multi-step checkout pipeline, coupon validation, currency selection, and order review.
- **Security**: Google ReCAPTCHA v2/v3 integration and protected authentication routes.
- **SEO & Social Sharing**: Dynamic metadata generation, OpenGraph tags, and automated sitemap.
- **State Management**: Zustand / React Context for lightweight global cart and user state.

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
Ensure `NEXT_PUBLIC_API_BASE_URL` points to your backend (`http://localhost:2110/`).

### 4. Running the Storefront
```bash
# Start development server
npm run dev

# Build for production
npm run build
npm run start
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront in your browser.
