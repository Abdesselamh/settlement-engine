# InstantSettlement.ai — Enterprise Settlement Platform

An institutional-grade, AI-driven T+0 settlement engine built for Tier-1 Banks, Hedge Funds, and Central Banks.

---

## Overview

InstantSettlement.ai eliminates counterparty risk and unlocks liquidity by processing financial settlements in sub-millisecond time using AI-driven validation and real-time routing.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **Routing** | Wouter |
| **UI Components** | Shadcn/UI, Radix UI |
| **Styling** | Tailwind CSS |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Backend** | Node.js, Express |
| **Database** | PostgreSQL (via Neon) |
| **ORM** | Drizzle ORM |
| **Payments** | Stripe (via Replit Connector) |
| **Validation** | Zod |
| **State** | TanStack Query v5 |

---

## Features

### Home Page
- Hero section with animated trust bar
- Bento grid with platform capabilities
- Social proof and institutional logos

### Live Dashboard (`/dashboard`)
- Real-time settlement feed with live simulation
- Settlement Latency Area Chart
- Liquidity Throughput Bar Chart
- KPI cards (throughput volume, avg latency, total settlements)
- CSV and PDF transaction export

### Pricing (`/pricing`)
- 3 institutional tiers: Essential ($5k/mo), Professional ($25k/mo), Enterprise (Custom)
- Live Stripe checkout integration (sandbox mode)
- Interactive Settlement Revenue Calculator (slider: $100M–$10B daily volume)

### Enterprise Admin Dashboard (`/admin`)
- User management table with subscription status
- Platform analytics (volume, latency charts)
- Audit log viewer
- Invoice management with PDF receipt generation

### Security & 2FA (`/login`)
- Two-Factor Authentication via email (6-digit OTP)
- 10-minute code expiry
- Full audit trail on every login

### Audit Log (`/audit-log`)
- Searchable, filterable log of all platform actions
- Action types: LOGIN, EXPORT, SUBSCRIPTION_CREATED, 2FA events
- Immutable records stored in PostgreSQL

### Data Export (`/dashboard`)
- CSV export of all transaction data
- PDF/HTML transaction summary report with platform branding
- Per-invoice PDF receipts

### Request Demo (`/request-demo`)
- Lead capture form saved to PostgreSQL
- Suitable for institutional sales pipeline

---

## Database Schema

```
transactions     - Settlement records (TX ID, amount, currency, parties, status, latency)
leads            - Demo request leads (name, email, company, role, message)
users            - Platform users (email, role, 2FA state, Stripe IDs)
audit_logs       - Security audit trail (action, user, IP, timestamp)
invoices         - Payment records linked to Stripe sessions
stripe.*         - Managed by stripe-replit-sync (products, prices, subscriptions)
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Session signing secret |
| Stripe keys | Managed automatically via Replit Stripe Connector |
| GitHub token | Managed automatically via Replit GitHub Connector |

---

## Local Development

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Seed Stripe products (run once)
npx tsx script/seed-stripe-products.ts

# Start development server
npm run dev
```

The development server starts on port 5000. The Vite frontend and Express backend are served from the same port.

---

## Deployment (Production)

### Replit Deployment
1. Click **Deploy** in the Replit workspace
2. In the Stripe integration, switch to **Live Mode** and provide:
   - Live Publishable Key (`pk_live_...`)
   - Live Secret Key (`sk_live_...`)
3. Replit automatically copies Stripe products from sandbox to production

### Scaling Considerations

**Horizontal Scaling:**
- The Express backend is stateless — deploy multiple instances behind a load balancer
- Use a connection pooler (PgBouncer) in front of PostgreSQL for high concurrency

**Database:**
- Neon PostgreSQL scales automatically with connection pooling built in
- For very high volume (>10B/day), consider read replicas for analytics queries

**Stripe:**
- Stripe webhooks are managed automatically via `stripe-replit-sync`
- Webhook endpoints update automatically on new deployments

**Caching:**
- Add Redis for session storage and API response caching at scale
- TanStack Query provides client-side caching already

**Security Hardening (Pre-production):**
- Replace demo 2FA (console log) with real SMTP (SendGrid / AWS SES)
- Add rate limiting to `/api/auth/2fa/send`
- Implement proper session management (replace localStorage with httpOnly cookies)
- Add CSRF protection

---

## Project Structure

```
├── client/
│   └── src/
│       ├── pages/           # Route pages (Home, Dashboard, Pricing, Admin, Login...)
│       ├── components/      # Shared components (Navbar, Footer, UI library)
│       ├── hooks/           # Custom React hooks
│       └── lib/             # API client, utilities
├── server/
│   ├── index.ts             # Express server entry point
│   ├── routes.ts            # API route handlers
│   ├── storage.ts           # Database access layer
│   ├── stripeClient.ts      # Stripe API client (via Replit connector)
│   ├── webhookHandlers.ts   # Stripe webhook processing
│   └── email.ts             # Email service (2FA, invoices)
├── shared/
│   ├── schema.ts            # Drizzle ORM schema (all tables + types)
│   └── routes.ts            # Shared API route definitions + Zod schemas
└── script/
    ├── build.ts             # Production build script
    ├── seed-stripe-products.ts  # Create Stripe products (run once)
    └── sync-github-api.ts   # GitHub sync utility
```

---

## License

Proprietary — InstantSettlement.ai. All rights reserved.
