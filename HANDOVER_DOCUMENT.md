# SENDITHOME — Project Handover Document

**Prepared for:** Receiving Development / DevOps Team
**Project:** SENDITHOME Multi-Portal Logistics & Settlement Platform
**Platform:** Base44 (Backend-as-a-Service) + React + Vite + Tailwind CSS
**Document version:** 1.0
**Date:** August 2026

---

## 1. Project Overview

SENDITHOME is a multi-portal logistics and settlement ecosystem that enables international tourists to ship duty-free retail purchases from their hotel back to their home country. The platform connects six distinct user groups through a single unified codebase:

| Portal | Primary Users | Purpose |
|---|---|---|
| **Tourist / Customer** | International hotel guests | Register, create shipments, upload receipts, pay, track delivery |
| **Hotel Partner** | Hotel GMs, concierges, front-desk staff | Onboard hotels, manage box inventory, view shipments originating from their property |
| **Retailer Partner** | Participating retail stores | Verify tourist purchases against receipts, approve/query commissions |
| **Government** | Customs, Tourism Authority, Ministry of Finance | Oversight of declarations, commission collection, audit trail |
| **Admin** | SENDITHOME operations team | Manage all entities, retailers, hotels, couriers, inventory, financials |
| **Courier / Logistics** | Assigned courier partners | Manage deliveries by destination country |

### Core Value Proposition
Tourists shop at partner retailers, leave purchases at their hotel, and SENDITHOME consolidates, customs-clears, and ships the items home — with a **tiered variable commission structure** shared between retailers and a **Sovereign Escrow Fund** (government settlement).

### Branding Standards
- Platform name is written as one word: **SENDITHOME**
- The **"IT"** portion is always uppercase and coloured pink (`text-accent` / `#FF00AA`)
- Primary headings: `SENDITHOME`
- Secondary copy / UI: `SendITHome`
- Visual theme: full-dark "charcoal-to-sapphire" gradient (`linear-gradient(135deg, #191919 0%, #0D3E7F 100%)`)

---

## 2. Technical Architecture

### 2.1 Stack
- **Frontend:** React 18 (Vite 6, ESM modules only)
- **Styling:** Tailwind CSS 3.4 + shadcn/ui component library (Radix UI primitives)
- **Routing:** React Router DOM v6
- **State / Data:** Base44 SDK (`@base44/sdk`) — entities, auth, integrations; `@tanstack/react-query` for query caching
- **Backend:** Base44 BaaS (managed: auth, database, file storage, serverless functions, automations, hosting)
- **Charts:** Recharts
- **Maps:** react-leaflet
- **3D:** three.js
- **PDF generation:** jsPDF + html2canvas
- **Forms:** react-hook-form + zod
- **Animations:** framer-motion
- **Icons:** lucide-react

### 2.2 Application Structure
```
src/
├── api/base44Client.js          # Pre-initialised Base44 SDK client
├── App.jsx                      # Router (routes + auth gate)
├── main.jsx                     # Vite entry
├── index.css                    # Design tokens (HSL variables) + global gradient
├── pages/                       # All route-level pages
├── components/
│   ├── ui/                      # shadcn/ui primitives
│   ├── admin/                   # Admin portal components
│   ├── retailer/                # Retailer portal components
│   ├── government/              # Government portal components
│   ├── hotel/                   # Hotel portal components
│   ├── oxford/                  # Oxford strategic-overview sections
│   ├── inventory/               # Inventory management widgets
│   └── ...shared components
├── lib/                         # AuthContext, utils, query-client, PageNotFound
├── hooks/                       # use-mobile
└── utils/                       # pricing, commissionTiers, currencyConversion, countryRestrictions
base44/
├── entities/                    # JSON-schema entity definitions (.jsonc)
├── functions/                   # Backend serverless functions (entry.ts)
├── agents/                      # In-app AI agent configs
└── config.jsonc                 # Site build config
```

### 2.3 Data Model (Entities)
The platform persists data through the following Base44 entities (JSON schemas in `base44/entities/`):

| Entity | Role |
|---|---|
| **Order** | Core shipment record — tourist, hotel, destination, items, status pipeline, tracking |
| **OrderItem** | Individual line items within an order |
| **Receipt** | Uploaded purchase receipts + extracted data |
| **OrderDocument** | Customs invoices, packing lists, declarations |
| **Retailer** | Partner store profile, trade license, status, commission rate, approval history |
| **RetailerVerification** | Per-shipment verification request sent to a retailer (approve / query / overdue) |
| **CommissionRecord** | Commission owed/paid to a retailer per shipment |
| **Hotel** | Hotel master profile (contacts, GM, AGM, FDM, HOC) |
| **HotelApplication** | Hotel onboarding application + trade license + employment cards |
| **HotelOnboardingStatus** | Logistics onboarding pipeline (dispatch → site visit → materials delivered) |
| **HotelInventory** | Per-hotel box allocation (10kg / 20kg), reorder triggers, stock status |
| **InventoryUsageLog** | Audit log of box usage |
| **ReplenishmentOrder** | Auto-triggered stock replenishment orders |
| **CourierPartner** | Courier company profile + assigned destination countries |
| **NDA** | Non-disclosure agreement records (signature capture) |
| **User** | Built-in user accounts (managed via Base44 auth / invites) |

### 2.4 Order Status Pipeline
`pending → receipt_uploaded → payment_pending → paid → packed → picked_up → in_transit → delivered`
(plus `cancelled`)

Multi-retailer workflow flag: `multi_retailer_status` — `not_applicable → pending_retailer_approvals → all_retailers_approved → consolidated`

### 2.5 Authentication
- Managed entirely by the Base44 platform (tokens, sessions, email verification, OTP).
- Boilerplate auth pages exist: `Login`, `Register`, `ForgotPassword`, `ResetPassword`.
- Protected routes are gated by `src/components/ProtectedRoute.jsx`.
- Several portals (Government, Retailer, Courier, Hotel) use **session-based demo logins** (credentials stored in `sessionStorage`) rather than full Base44 auth — these are placeholders intended for production hardening.
- Google OAuth is wired into the standard Login/Register flows.

---

## 3. Implemented Features (by Portal)

### Tourist / Customer Flow
1. **QR Landing** (`/guest-onboarding/:hotelId`) — hotel-branded onboarding splash with dynamic QR code + "How It Works" modal.
2. **Registration** (`/register`) — account creation with OTP verification.
3. **New Shipment** (`/new-order`) — box size selection (10kg/20kg), sender/recipient details, passport capture, destination address.
4. **Receipt Upload** (`/order/:id/receipts`) — multi-receipt upload with AI extraction.
5. **Payment** (`/order/:id/payment`) — checkout summary, simulated card payment (Stripe SDK installed but not fully wired to live keys).
6. **Shipment Details** (`/order/:id`) — status pipeline, tracking timeline, downloadable documents (customs, invoice, receipt).
7. **My Shipments** (`/my-orders`) — order list with status cards.
8. **Track Shipment** (`/track`) — tracking number lookup.
9. **Tourist Portal** (`/shipment/:id`) — public shipment view with declared items + declaration preview.
10. **Profile** (`/profile`).

### Hotel Partner Portal
- Hotel Partner Landing page (`/hotel-onboarding`) — value proposition, onboarding workflow.
- Hotel Sign-Up (`/hotel-signup`) — registration + NDA signing flow (`/nda-signing` with signature pad).
- Hotel Dashboard (`/hotel-dashboard`) — shipments originating from the property, inventory snapshot.
- Hotel Inventory (`/hotel-inventory`) — live 10kg/20kg stock, auto-replenishment triggers, usage logs.
- Hotel Demo Dashboard (`/hotel-demo`) — demo/sandbox view.

### Retailer Partner Portal
- Retailer Registration (`/retailer-registration`) — store profile, trade license upload, category selection.
- Retailer Portal / Login (`/retailer-portal`) — credentials-based login.
- Retailer Dashboard (`/retailer-dashboard`) — pending verifications, shipment list, commission tracking, approved history, analytics, PDF export.
- Retailer Settings (`/retailer-settings`) — account settings with "Remember Me" persistent session.

### Government Portal
- Government Login (`/government-login`) — department code + officer email + 2FA (demo), subtitle: "Tourism Retail Settlement Authority".
- Government Dashboard (`/government-dashboard`) — tabs: Analytics, Commission Collection, Customs Declarations, Consolidated Shipments, Passport Copies, Audit Trail, Clearance Queue, Declaration Breakdown, Review Modal.

### Admin Portal
- Admin Dashboard (`/admin-dashboard`) — executive overview, orders, shipments, retailers, hotels, inventory, financials, operations, courier management, analytics (shipment/hotel/retailer/tourist), replenishment, onboarding pipeline.
- Admin Retailers (`/admin-retailers`) — retailer approval/rejection, approval history, drill-downs.

### Courier / Logistics Portal
- Courier Login (`/courier-login`) + Courier Dashboard (`/courier-dashboard`) — deliveries by assigned destination countries.

### Supporting Pages
- **Showcase** (`/showcase`) — internal iframe-based preview of all portal pages.
- **Oxford Overview** (`/oxford-overview`) — strategic market report (Dubai tourism + logistics gap analysis).
- **Brand Directory** (`/brand-directory`).
- **Declaration Preview** (`/declaration-preview`).
- **DevDocs** (`/docs`).

---

## 4. Business Logic — Key Workflows

### 4.1 Shipment Lifecycle
1. Tourist scans hotel QR → registers → creates order (box + details).
2. Uploads purchase receipts → AI extracts line items (`ExtractDataFromUploadedFile`).
3. Pays online (price includes shipment + Global Membership + US$3,000 insurance).
4. System creates **RetailerVerification** records for each store on the receipts.
5. Retailers approve / query within a 24-hour deadline.
6. Once all retailers approve → `consolidateShipment` backend function merges items into one customs declaration.
7. Shipment moves through `packed → picked_up → in_transit → delivered`.
8. Commission records generated per retailer per tier.

### 4.2 Tiered Variable Commission Structure
Commission is **not** a flat 10%. It is tiered based on:
- **Tourist country group:** `preferred` (GCC, India, Egypt, Jordan, Russia) vs `row` (Rest of World).
- **Shipment value brackets** — 8 tiers for preferred-group countries, 7 tiers for ROW.
- Rates scale from 10% (lowest tier) down to 2% (highest tier).

Logic lives in `src/utils/commissionTiers.js`. All frontend components (ShipmentsTab, GovCommissionTab, ReviewModal, CommissionTab) and the `createRetailerVerifications` backend function use these tiers.

### 4.3 Hotel Inventory & Auto-Replenishment
- Each hotel is assigned an inventory tier (1–5) based on room count (`src/utils/inventoryTiers.js`).
- Standard allocations of 10kg and 20kg boxes.
- When stock drops below `reorder_trigger_level`, a `ReplenishmentOrder` is auto-created.
- `checkInventoryLevels` backend function (run via scheduled automation) monitors thresholds.

### 4.4 Government Settlement
- Commissions flow to a **Sovereign Escrow Fund** / **Sovereign Trust Fund**.
- Government portal provides oversight of declarations, commission collection performance, and a full audit trail.

---

## 5. Backend Functions

Serverless functions live in `base44/functions/<name>/entry.ts`:

| Function | Purpose |
|---|---|
| `approveRetailer` | Approves a retailer application, generates partner code + password, sends credentials email |
| `resendRetailerCredentials` | Re-sends retailer login credentials |
| `createRetailerVerifications` | Generates per-retailer verification records from an order's receipts (applies commission tiers) |
| `consolidateShipment` | Merges approved retailer verifications into a consolidated customs declaration |
| `checkInventoryLevels` | Scheduled check of hotel box stock vs reorder triggers; auto-creates replenishment orders |
| `initializeHotelInventory` | Provisions initial inventory allocation for a newly onboarded hotel |
| `generateDeclarationPDF` | Generates a customs declaration PDF for a shipment |
| `generateRetailerDeclarationPDF` | Generates retailer-facing declaration PDF |
| `notifyHotelApproval` | Notifies a hotel when their application is approved (email) |
| `sendStatusEmail` | Generic status-update email to registered users |
| `verifyPassport` | Passport image verification / data extraction |

### Built-in Integrations (Core package)
- `InvokeLLM` — AI extraction & analysis (receipts, passports, declarations). Supports models: automatic, gpt_5_mini, gemini_3_flash, gpt_5_4, claude_sonnet_4_6, etc.
- `UploadFile` / `UploadPrivateFile` — file storage.
- `ExtractDataFromUploadedFile` — structured data extraction from CSV/XLSX/JSON/PDF/images.
- `SendEmail` — emails to **registered app users only** (cannot send to unregistered external addresses).
- `GenerateImage` / `GenerateVideo` / `GenerateSpeech` / `TranscribeAudio` — media generation.
- `CreateFileSignedUrl` — time-limited signed download URLs for private files.

### Automations
Scheduled and entity-event automations are configured via the Base44 Builder (not all are code-committed). Key scheduled automation: `checkInventoryLevels` (inventory monitoring).

---

## 6. Dependencies

### Runtime Dependencies (package.json)
React 18, Vite 6, @base44/sdk, @base44/vite-plugin, @tanstack/react-query, react-router-dom v6, Tailwind CSS 3.4, full shadcn/ui (Radix UI) suite, framer-motion, recharts, react-leaflet, three, jspdf, html2canvas, react-hook-form, zod, lucide-react, moment, date-fns, lodash, react-markdown, react-quill, @hello-pangea/dnd, @stripe/react-stripe-js + @stripe/stripe-js, canvas-confetti, sonner, vaul, cmdk, input-otp.

### Dev Dependencies
ESLint 9, TypeScript 5.8, PostCSS, Autoprefixer, tailwindcss-animate.

> **Note:** Only the packages listed in `package.json` are installed and supported. Adding any package not in this list requires explicit approval — the Base44 build environment restricts unauthorised packages.

---

## 7. Integrations & External Services

| Integration | Status | Notes |
|---|---|---|
| **Stripe** | SDK installed, not live | `@stripe/react-stripe-js` present; live API keys not configured. Payment page currently simulates processing. |
| **Base44 Core (LLM, File, Email)** | Active | Used for receipt/passport extraction, file uploads, user emails |
| **OAuth Connectors** | Not authorised | No app connectors (Google, Slack, etc.) are currently connected. Available connectors include Google Calendar/Drive/Gmail, Slack, GitHub, etc. |
| **Maps (Leaflet)** | Active | Shipment map rendering |
| **Push Notifications** | Available | `SendPushNotification` — requires native mobile build with push credentials (not yet configured) |

---

## 8. Environment Configuration

### Required Environment Variables (`.env.local`)
```
VITE_BASE44_APP_ID=<your_app_id>
VITE_BASE44_APP_BASE_URL=<your_backend_url>
```
Example:
```
VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE44_APP_BASE_URL=https://sendithome.base44.app
```

### Optional / Feature Flags
```
BASE44_LEGACY_SDK_IMPORTS=true|false   # Legacy @/integrations import support
APP_URL                                # Used by notifyHotelApproval for email links (currently missing — see Known Issues)
```

### Design Tokens
All theme values are HSL CSS variables in `src/index.css` (`:root` and `.dark`). The global body background is a fixed charcoal-to-sapphire gradient. `bg-background` is overridden to transparent so the gradient shows through on all pages.

### Build Configuration
- Build command: `npm run build`
- Output directory: `./dist`
- Serve command (dev): `npm run dev`
- Defined in `base44/config.jsonc` and `vite.config.js`.

---

## 9. Setup & Deployment Instructions

### Local Development
```bash
# 1. Clone the repository
git clone <repo-url>
cd sendithome

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local   # (create .env.local if no example exists)
#   Set VITE_BASE44_APP_ID and VITE_BASE44_APP_BASE_URL

# 4. Run development server
npm run dev
# App available at http://localhost:5173
```

### Build & Preview
```bash
npm run build      # Production build → ./dist
npm run preview    # Preview the production build locally
npm run lint       # ESLint check
npm run typecheck  # TypeScript check (jsconfig)
```

### Deployment
- **Primary deployment path:** Publish via the Base44 Builder (Base44.com → Publish). This handles hosting, CDN, and backend.
- **Static hosting alternative:** The `./dist` output can be deployed to any static host (Vercel, Netlify, etc.), provided the Base44 backend URL environment variables are set at build time.
- **Database migrations:** Managed by Base44 — entity schema changes in `base44/entities/*.jsonc` are applied through the Builder; no manual migration scripts are required.
- **Deployment scripts:** No custom deployment scripts exist; the platform-managed pipeline is used.

### Accessing the Codebase
The repository is synced with the Base44 Builder. Any push to the connected Git branch is reflected in the Builder. Please confirm the target branch (typically `main`) for the handover.

---

## 10. Known Limitations & Issues

| # | Issue | Impact | Recommended Action |
|---|---|---|---|
| 1 | **Missing `APP_URL` environment variable** | `notifyHotelApproval` email links may be incorrect/relative | Set `APP_URL` in production environment |
| 2 | **Stripe not live** | Payment page simulates transactions; no real charges | Configure live Stripe API keys via secrets before production |
| 3 | **Demo logins for Government / Retailer / Courier / Hotel portals** | These portals use `sessionStorage`-based mock auth, not Base44 auth | Replace with secure Base44-backed authentication before production |
| 4 | **Government 2FA is hardcoded** | Demo code `123456` accepted | Integrate a real TOTP / authenticator backend |
| 5 | **SendEmail limited to registered users** | Cannot email unregistered external recipients | Use registered-user emails or configure an external email provider/domain |
| 6 | **External Claude artifacts** | "Premium & Luxury Retailer Intelligence Platform" and "Master Target Countries Dashboard" are hosted externally on Claude artifacts and cannot be edited in-codebase | Rebuild as internal app pages if full control is required |
| 7 | **No automated test suite** | No unit/integration tests exist | QA team should plan manual + introduce a testing framework (Vitest) |
| 8 | **No CI/CD pipeline** | Builds are manual via Builder | Establish a CI pipeline if required by the deployment process |
| 9 | **Push notifications not configured** | `SendPushNotification` will fail without native mobile build credentials | Only required if shipping as native iOS/Android app |
| 10 | **Legacy terminology** | Some code/comments may reference old terms ("Property", "luggage friction", "Fiscal Agent") | Standardise to "Hotel", "Fashion Categories", "Tourism Retail Settlement Authority" |

---

## 11. Outstanding Items / To-Do

- [ ] Configure live Stripe payment integration and webhook handling.
- [ ] Replace demo `sessionStorage` auth with secure Base44 authentication across Government, Retailer, Courier, and Hotel portals.
- [ ] Set the `APP_URL` environment variable for correct email link generation.
- [ ] Implement real two-factor authentication for the Government portal.
- [ ] Rebuild external Claude-artifact dashboards as internal app pages (if ownership/control is required).
- [ ] Add an automated test suite (Vitest + React Testing Library recommended).
- [ ] Establish a CI/CD pipeline.
- [ ] Update 2025 international overnight visitor statistics on the Master Dashboard.
- [ ] Finalise copy for Phase 1–3 expansion headings (Pilot Markets / Priority Expansion / Future Opportunities).
- [ ] Configure native mobile push notification credentials (if native app distribution is planned).
- [ ] Production-readiness security review (OWASP, dependency audit, secrets scan).

---

## 12. Handover & Deployment Plan (per your process)

Aligned to the six-step process you outlined:

| Step | SENDITHOME Status | Action Required |
|---|---|---|
| **1. Repository & source-code handover** | ✅ Ready | Repository is synced with the Base44 Builder. We will confirm the branch (`main`) and grant GitHub access to your team's account once provided. All dependency files (`package.json`, `package-lock.json`), build config, and entity schemas are committed. No manual DB migration scripts — managed by platform. |
| **2. Business & technical documentation** | ✅ This document | Covers project overview, features, business logic, architecture, dependencies, integrations, environment, deployment, limitations, and outstanding items. |
| **3. Technical & security review** | ⏳ Pending | Recommend focus areas: demo-auth portals (#3, #4 above), Stripe wiring (#2), `APP_URL` (#1), and dependency audit. |
| **4. Testing-environment deployment** | ⏳ Pending | Deploy `./dist` to a staging host with staging Base44 backend env vars. QA against the documented order lifecycle and portal workflows. |
| **5. Business acceptance & production deployment** | ⏳ Pending | Publish via Base44 Builder (production). Ensure backup/rollback via Builder version history. Final business sign-off on commission tiers and government settlement views. |
| **6. Ongoing support & future development** | ✅ Available | Future features/enhancements can be scoped and prioritised through the agreed development process post-handover. |

### Confirmations Requested
1. **Completion date & repository readiness:** Current development is complete and the repository is ready for handover now. GitHub access can be granted immediately upon receipt of your team's GitHub account details.
2. **Handover document:** ✅ Provided (this document).

This information is provided ahead of next Wednesday's meeting so your team can review in advance. We are happy to address any outstanding questions during the meeting or to provide any additional information you require to facilitate the handover.

---

*End of document — SENDITHOME Project Handover v1.0*