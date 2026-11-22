<div align="center">

  <img src="public/images/suvora-logo.png" alt="SUVORA Seller Hub" width="420" />

  <br />

  <h3>Enterprise Hyperlocal Commerce Operating System</h3>
  <p>Powering Neighbourhood Merchants with Real-time Order Dispatch, 15-Minute SLAs, and Instant Local Commerce Operations.</p>

  <p>
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16.4.6%20(Turbopack)-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.3.0-61dafb?style=for-the-badge&logo=react" alt="React" /></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4.3-38bdf8?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" /></a>
    <a href="https://github.com/pmndrs/zustand"><img src="https://img.shields.io/badge/Zustand-v5.1-4338ca?style=for-the-badge" alt="Zustand" /></a>
    <img src="https://img.shields.io/badge/Status-Production%20Ready-10b981?style=for-the-badge" alt="Status" />
    <img src="https://img.shields.io/badge/Build-24%2F24%20Routes%20Passing-brightgreen?style=for-the-badge" alt="Build" />
  </p>

  <br />

</div>

---

## 📌 Executive Overview

**SUVORA Seller Hub** is a mission-critical, enterprise-grade Seller Operating System (OS) crafted specifically for high-velocity quick commerce and neighbourhood grocery/retail merchants.

Engineered with sub-15-minute dispatch SLAs at its core, the platform gives retail store owners complete command over their live incoming order queue, automated inventory audits, customer lifetime value analytics, staff permissions, and transparent financial payout reconciliations.

Inspired by modern high-density SaaS design systems (**Bredar UI Kit**), SUVORA combines a royal blue and slate aesthetic with ergonomic visual hierarchy, zero horizontal overflow, and lightning-fast reactivity.

---

## 🚀 Key Architectural Highlights & Modules

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SUVORA SELLER PLATFORM                          │
├─────────────────────┬───────────────────────────┬──────────────────────┤
│  🏪 STOREFRONT      │  📦 DISPATCH & LOGISTICS  │  📈 FINANCIAL OPS    │
│  • Geofencing       │  • Sub-15m SLA Timer      │  • Gross vs Net P&L  │
│  • Availability Hub │  • 5-Stage Live Pipeline  │  • T+1 Auto Payouts  │
│  • Operating Hours  │  • Printable Tax Invoices │  • GST Tax Ledger    │
│  • Catalog Control  │  • Fast Rider Handover    │  • Commission Audit  │
└─────────────────────┴───────────────────────────┴──────────────────────┘
```

### 1. ⚡ Live Dispatch SLA & Order Fulfillment Engine
- **5-Stage Order Pipeline**: Real-time transition tracking (`New` ➜ `Accepted` ➜ `Preparing` ➜ `Ready for Handover` ➜ `Completed`).
- **One-Click Order Transitions**: Contextual status advancement buttons with immediate toast confirmations.
- **In-Line Decline Modal**: Instant order rejection dialog with standard compliance reasons (`Item out of stock`, `Store closing`, `Address out of radius`).
- **GST Tax Invoice Generator**: Instant formatted packing slip and invoice printing ready for delivery bag stapling.

### 2. 📊 Advanced Business Analytics & Insights
- **Dual-Series Spline Visualizer**: Interactive Year-over-Year customer acquisition curve (2022 vs 2021) powered by Recharts.
- **AOV (Average Order Value) Trajectory**: Longitudinal tracking of customer basket size velocity.
- **Shopper Retention Cohorts**: Donut chart breakdown differentiating First-Time vs Returning Buyers.
- **Product Performance Matrices**: Ranked catalog tables showcasing view counts, conversion rates, and revenue contributions.

### 3. 📦 Stock & Warehouse Control
- **Low-Stock Automatic Triggers**: Real-time threshold warnings preventing overselling.
- **Non-Negative Guard Rails**: Strict quantity validation preventing sellers from reducing stock below zero.
- **Comprehensive Audit Log**: Full historical ledger documenting inventory adjustments (`Supplier Intake`, `Damaged Goods`, `Physical Audit`).

### 4. 🏷️ Promotions, Coupons & Basket Discounts
- **Flexible Promo Engine**: Support for percentage discounts, flat cashbacks, and free delivery thresholds.
- **Strict Guard Validation**: Client-side enforcement of `discountValue > 0`, `percentage <= 100%`, and chronological expiration checks (`endDate >= startDate`).
- **1-Click Promo Copy**: Direct clipboard integration for instant customer broadcast.

### 5. 👥 Role-Based Access Control (RBAC)
- **Granular Privilege Matrix**: Distinct access scopes for **Store Owner**, **Store Manager**, **Inventory Manager**, and **Cashier**.
- **Module Safeguards**: Fine-grained visibility toggles across Orders, Catalog, Finances, and Configuration.

### 6. 🛡️ Secure Zero-Bypass Authentication Flow
- **Session Protection**: State persistence using Zustand middleware (`localStorage`).
- **AuthGuard Architecture**: Automatic route interception redirecting unauthenticated visitors to `/login`.
- **Intelligent OTP Input**: Auto-advancing 6-digit verification with full multi-digit clipboard paste support.
- **4-Step Merchant Onboarding**: Structured KYC application capturing trade licenses, GSTIN, PAN, and store geodata.

---

## 🎨 Design System & Visual Hierarchy

SUVORA Seller Hub implements an enterprise multi-color palette built on clean, accessible contrast:

| Color Role | Hex Code | Purpose |
|:---|:---|:---|
| **Primary Blue** | `#2563EB` | Primary navigation, branding highlights, active tabs |
| **Deep Slate** | `#0F172A` | Core typography, modal headers, high-contrast headings |
| **Canvas Background** | `#F8FAFC` | Main application workspace with zero glare |
| **Emerald (Success)** | `#10B981` | Delivered orders, positive growth trends, store live status |
| **Amber (Warning)** | `#F59E0B` | Low-stock triggers, preparing queue, pending reviews |
| **Rose (Danger)** | `#EF4444` | Order cancellations, stock depletion, destructive actions |
| **Royal Purple** | `#8B5CF6` | Loyalty metrics, marketing promotions, secondary badges |

---

## 📁 Repository File Structure

```text
suvora-seller/
├── public/
│   ├── images/
│   │   └── suvora-logo.png         # Official high-resolution SUVORA logo
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── (auth)/                 # Isolated authentication route group
│   │   │   ├── layout.tsx          # Auth layout with branded visual panel
│   │   │   ├── login/page.tsx      # Seller sign-in with demo auto-fill
│   │   │   ├── register/page.tsx   # Proprietor registration
│   │   │   ├── verify/page.tsx     # OTP verification with paste handling
│   │   │   ├── onboarding/page.tsx # 4-step merchant KYC onboarding
│   │   │   └── verification-status/# Application review & sandbox launcher
│   │   ├── (dashboard)/            # Authenticated workspace route group
│   │   │   ├── layout.tsx          # Application shell with AuthGuard
│   │   │   ├── dashboard/page.tsx  # Central command dashboard
│   │   │   ├── analytics/page.tsx  # Sales velocity & retention charts
│   │   │   ├── categories/page.tsx # Category hierarchies & visibility
│   │   │   ├── customers/          # Shopper directory & purchase profiles
│   │   │   ├── earnings/page.tsx   # Settlements, payout batches & GST ledger
│   │   │   ├── inventory/page.tsx  # Stock levels, adjustments & alerts
│   │   │   ├── notifications/      # Real-time operational alerts
│   │   │   ├── offers/page.tsx     # Promo coupons & campaign manager
│   │   │   ├── orders/             # Live order pipeline & dispatch details
│   │   │   ├── products/           # Catalog management & barcode creation
│   │   │   ├── settings/page.tsx   # Merchant profile & store configuration
│   │   │   ├── staff/page.tsx      # Employee team members & permissions
│   │   │   └── store/page.tsx      # Store profile, operating hours & radius
│   │   ├── globals.css             # Tailwind v4 theme tokens & scrollbar rules
│   │   ├── layout.tsx              # Root HTML wrapper & metadata
│   │   ├── not-found.tsx           # Custom 404 error experience
│   │   └── page.tsx                # Dynamic root session gate
│   ├── components/
│   │   ├── common/                 # Reusable UI primitives
│   │   │   ├── ChartCard.tsx       # Recharts responsive wrapper
│   │   │   ├── ConfirmDialog.tsx   # Destructive action safety modal
│   │   │   ├── FormField.tsx       # Standardized form label & error state
│   │   │   ├── PageHeader.tsx      # Consistent section titles & CTA slots
│   │   │   ├── SearchBar.tsx       # Debounced search input
│   │   │   ├── StatusBadge.tsx     # Tinted status indicator pills
│   │   │   └── Toast.tsx           # Operational notification toasts
│   │   └── layout/
│   │       ├── Header.tsx          # Full-width 80px navigation header
│   │       ├── MobileNav.tsx       # Slide-over drawer for mobile devices
│   │       └── Sidebar.tsx         # Collapsible 250px vertical navigation rail
│   ├── lib/
│   │   ├── store.ts                # Zustand global stores with persistence
│   │   └── utils.ts                # Currency formatters, deterministic IDs
│   ├── mock/
│   │   └── data.ts                 # Quick-commerce Indian retail mock dataset
│   └── types/
│       └── index.ts                # Strict TypeScript domain interfaces
├── next.config.ts                  # Next.js compiler configuration
├── package.json                    # Project dependencies & scripts
├── tsconfig.json                   # Strict TypeScript compiler options
└── README.md                       # Comprehensive platform documentation
```

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|:---|:---|:---|
| **Framework** | Next.js 16.4.6 | App Router, Turbopack, Fast Refresh, Static Prerendering |
| **Language** | TypeScript 5.x | Strict null checks, typed API models, zero implicit `any` |
| **Runtime** | React 19.3.0 | Modern concurrent features, transitions, hooks |
| **Styling** | Tailwind CSS v4.3.3 | Built-in CSS variables, JIT compilation, `@theme inline` |
| **State** | Zustand 5.1 | Lightweight reactive stores with `persist` middleware |
| **Data Viz** | Recharts 3.11 | Responsive spline charts, area gradients, bar charts, donut graphs |
| **Primitives** | Radix UI | Accessible dialogs, dropdowns, and tooltips |
| **Icons** | Lucide React | Crisp 24x24 outline vector iconography |

---

## 💻 Getting Started

### Prerequisites
- **Node.js**: v18.18.0 or later (v20+ recommended)
- **Package Manager**: `npm`, `yarn`, or `pnpm`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/devillikevd/seller-suvora.git
   cd seller-suvora
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🔑 Demo Access Credentials

The application includes mock data pre-configured for **FreshMart General Store** (Koramangala Hub):

- **Quick Login**: On the `/login` screen, click the **"Sign in as Store Owner"** button to auto-fill demo credentials.
- **Manual Credentials**:
  - **Email**: `rajesh@freshmart.in`
  - **Password**: `password123`
- **Role**: Store Owner (Full Access across all platform modules)

---

## 🧪 Build & Quality Verification

Run production build and linting to verify zero compiler errors:

```bash
# Verify static prerendering across all 24 routes
npm run build

# Run strict ESLint verification
npm run lint
```

**Build Output:**
```text
✓ Compiled successfully in 1.8s
✓ Finished TypeScript checks in 1.4s
✓ Generating static pages using 15 workers (24/24)
✓ Finalizing page optimization
```

---

## 📄 License & Ownership

Developed with pride for the **SUVORA Local Commerce Ecosystem**.
All rights reserved © 2026 SUVORA Technologies.
co