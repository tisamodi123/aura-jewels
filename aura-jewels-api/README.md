# Aura Jewels - RESTful API Backend

Production-ready backend API service for the **Aura Jewels** luxury e-commerce platform built with Node.js, Express, and MongoDB.

## Architecture & Tech Stack

- **Framework**: Express.js (ES Modules)
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT Access Token & Refresh Token lifecycle with Role-Based Access Control (RBAC).
- **Payment Processing**: Razorpay gateway integration with cryptographic HMAC-SHA256 signature verification and idempotent webhook processing.
- **File Management**: AWS S3 SDK v3 & CloudFront CDN integration with local development fallback.
- **Geo & Currency Engine**: IP-based geolocation and currency switching (INR, USD, etc.) with configurable buffers.
- **Communications**: Automated transactional email system (Nodemailer) and OTP SMS delivery.
- **Caching**: In-memory and Redis caching support for exchange rates and product catalog queries.

## Getting Started

### 1. Prerequisites
- Node.js (v18.x or later)
- MongoDB instance (Local or Atlas)
- Redis (Optional, falls back to in-memory)

### 2. Installation
```bash
npm install
```

### 3. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```
Fill in your database connection, JWT secret keys, and credentials.

### 4. Running the Server
```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start
```
The server will run on `http://localhost:2110`.

## Key Scripts

- `npm run dev`: Runs the API server via nodemon.
- `npm start`: Runs the server in production mode.
