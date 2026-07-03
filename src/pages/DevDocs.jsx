import { useState } from 'react';
import { ChevronRight, ChevronDown, Code, Database, Shield, Globe, Navigation, Layers, Zap, FileText, Package, CreditCard, Map, Bell, Lock } from 'lucide-react';

const SECTIONS = [
  { id: 'overview', label: 'System Overview', icon: Layers },
  { id: 'architecture', label: 'Architecture', icon: Code },
  { id: 'entities', label: 'Data Entities', icon: Database },
  { id: 'pages', label: 'Pages & Navigation', icon: Navigation },
  { id: 'components', label: 'Components', icon: Package },
  { id: 'flows', label: 'User Flows', icon: Zap },
  { id: 'backend', label: 'Backend Functions', icon: FileText },
  { id: 'currency', label: 'Currency & Localisation', icon: Globe },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'tracking', label: 'Tracking & Maps', icon: Map },
  { id: 'notifications', label: 'Email Notifications', icon: Bell },
  { id: 'documents', label: 'Document Management', icon: FileText },
];

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-foreground border-b border-border pb-2 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function SubSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-4 border border-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/70 transition-colors text-left">
        <span className="font-semibold text-sm text-foreground">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 py-4 space-y-2 text-sm text-muted-foreground leading-relaxed">{children}</div>}
    </div>
  );
}

function Code_({ children }) {
  return <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground">{children}</code>;
}

function Badge({ color = 'bg-blue-100 text-blue-700', children }) {
  return <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`}>{children}</span>;
}

function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-xs">
        <thead className="bg-muted/60">
          <tr>{headers.map(h => <th key={h} className="text-left px-3 py-2 font-semibold text-foreground">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-muted/20">
              {row.map((cell, j) => <td key={j} className="px-3 py-2 text-muted-foreground">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DevDocs() {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border bg-card sticky top-0 h-screen overflow-y-auto">
        <div className="px-4 py-5 border-b border-border">
          <p className="text-xs font-black uppercase tracking-widest text-accent">Send It Home</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Developer Documentation</p>
        </div>
        <nav className="p-2 space-y-0.5 flex-1">
          {SECTIONS.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                  activeSection === s.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {s.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <p className="text-[9px] text-muted-foreground">v1.0 · March 2026</p>
        </div>
      </aside>

      {/* Mobile section picker */}
      <div className="md:hidden w-full fixed top-0 z-10 bg-card border-b border-border px-4 py-2">
        <select
          className="w-full text-xs bg-muted rounded-lg px-2 py-1.5"
          value={activeSection}
          onChange={e => setActiveSection(e.target.value)}
        >
          {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {/* Content */}
      <main className="flex-1 px-6 py-8 mt-10 md:mt-0 max-w-4xl">

        {/* ── OVERVIEW ── */}
        {activeSection === 'overview' && (
          <Section title="System Overview">
            <SubSection title="What is Send It Home?">
              <p><strong className="text-foreground">Send It Home</strong> is a hotel-based international shipping platform built for tourists shopping in the UAE (Dubai). Guests scan a QR code at their hotel, register, create a shipment order, upload shopping receipts, pay online, and have their luggage shipped directly to their home.</p>
              <p className="mt-2">The platform covers the complete logistics journey: from hotel room pickup → packing → courier handover → delivery to the customer's home country.</p>
            </SubSection>
            <SubSection title="Tech Stack">
              <Table
                headers={['Layer', 'Technology', 'Notes']}
                rows={[
                  ['Frontend', 'React 18 + Vite', 'SPA, no SSR'],
                  ['Styling', 'Tailwind CSS + shadcn/ui', 'Design tokens in index.css'],
                  ['Routing', 'react-router-dom v6', 'Client-side routing'],
                  ['State', 'React useState / useEffect', 'No global state library'],
                  ['Backend DB', 'Base44 BaaS', 'Entities SDK, auto-auth'],
                  ['Auth', 'Base44 AuthProvider', 'JWT-based, built-in'],
                  ['File Storage', 'Base44 UploadFile', 'Public CDN URLs'],
                  ['AI', 'Base44 InvokeLLM', 'GPT-4o-mini by default'],
                  ['Email', 'Base44 SendEmail', 'HTML transactional emails'],
                  ['Maps', 'react-leaflet + CARTO tiles', 'No API key needed'],
                  ['Animations', 'framer-motion', 'Page transitions, UI'],
                  ['Currency', 'exchangerate.host API', 'Free, cached globally'],
                ]}
              />
            </SubSection>
            <SubSection title="Key Business Rules">
              <ul className="list-disc pl-4 space-y-1">
                <li><strong className="text-foreground">Personal shopping only</strong> — no commercial goods.</li>
                <li>Flat-rate pricing per box regardless of destination (see pricing tiers).</li>
                <li>Box sizes: <Code_>10kg</Code_> and <Code_>20kg</Code_> — same price per box.</li>
                <li>Origin is always <strong className="text-foreground">Dubai, UAE</strong>.</li>
                <li>Passport verification is required before order creation.</li>
                <li>Items are AI-screened for eligibility based on destination country restrictions.</li>
              </ul>
            </SubSection>
          </Section>
        )}

        {/* ── ARCHITECTURE ── */}
        {activeSection === 'architecture' && (
          <Section title="Architecture">
            <SubSection title="Frontend File Structure">
              <Table
                headers={['Path', 'Purpose']}
                rows={[
                  ['src/pages/', 'Route-level page components'],
                  ['src/components/', 'Reusable UI components'],
                  ['src/components/ui/', 'shadcn/ui primitives (auto-generated)'],
                  ['src/entities/', 'JSON schema definitions for DB entities'],
                  ['src/functions/', 'Deno-based backend functions'],
                  ['src/utils/', 'Shared utilities (pricing, currency, countries)'],
                  ['src/lib/', 'Auth context, router, query client'],
                  ['src/App.jsx', 'Root router — all routes defined here'],
                  ['src/index.css', 'CSS variables / design tokens'],
                  ['tailwind.config.js', 'Tailwind theme (maps CSS vars → classes)'],
                ]}
              />
            </SubSection>
            <SubSection title="Routing Structure (App.jsx)">
              <Table
                headers={['Route', 'Component', 'Access']}
                rows={[
                  ['/', 'Redirect → /hotel/:id', 'Public'],
                  ['/hotel/:hotelId', 'QRLanding', 'Public'],
                  ['/register', 'Register', 'Public'],
                  ['/new-order', 'NewOrder', 'Auth required'],
                  ['/order/:id/receipts', 'ReceiptUpload', 'Auth required'],
                  ['/order/:id/payment', 'Payment', 'Auth required'],
                  ['/my-orders', 'MyOrders', 'Auth required'],
                  ['/order/:id', 'OrderDetail', 'Auth required'],
                  ['/profile', 'Profile', 'Auth required'],
                  ['/track', 'TrackingPage', 'Public'],
                  ['/docs', 'DevDocs', 'Auth required'],
                ]}
              />
            </SubSection>
            <SubSection title="Data Flow">
              <p>1. User action in React component</p>
              <p>→ 2. <Code_>base44.entities.EntityName.method()</Code_> call</p>
              <p>→ 3. Base44 BaaS processes request with user's JWT</p>
              <p>→ 4. Response returned as plain JS object</p>
              <p>→ 5. Component updates local state → React re-renders</p>
              <p className="mt-2">For AI / Email: React calls <Code_>base44.integrations.Core.InvokeLLM()</Code_> or <Code_>SendEmail()</Code_> which proxies to the integration service.</p>
              <p className="mt-2">For backend functions: <Code_>base44.functions.invoke('functionName', payload)</Code_> → Deno function on the edge → returns Axios response object (data in <Code_>response.data</Code_>).</p>
            </SubSection>
            <SubSection title="Authentication Flow">
              <p>All pages are wrapped in <Code_>AppLayout</Code_> which is inside <Code_>AuthProvider</Code_>. The <Code_>useAuth()</Code_> hook provides: <Code_>isLoadingAuth</Code_>, <Code_>authError</Code_>, <Code_>navigateToLogin</Code_>.</p>
              <p className="mt-2">If <Code_>authError.type === 'auth_required'</Code_> → user is redirected to the Base44 login page automatically. On success, redirected back to origin URL.</p>
            </SubSection>
          </Section>
        )}

        {/* ── ENTITIES ── */}
        {activeSection === 'entities' && (
          <Section title="Data Entities">
            <p className="text-sm text-muted-foreground mb-4">All entities are defined in <Code_>src/entities/*.json</Code_> as JSON Schema. Base44 BaaS auto-generates REST + SDK endpoints. Every record has built-in fields: <Code_>id</Code_>, <Code_>created_date</Code_>, <Code_>updated_date</Code_>, <Code_>created_by</Code_> (user email).</p>
            <SubSection title="Order">
              <Table
                headers={['Field', 'Type', 'Notes']}
                rows={[
                  ['order_number', 'string', 'SIH-XXXXXXX format, generated on creation'],
                  ['status', 'enum', 'pending → receipt_uploaded → payment_pending → paid → packed → picked_up → in_transit → delivered | cancelled'],
                  ['box_size', 'enum', '10kg or 20kg'],
                  ['price', 'number', 'USD flat rate'],
                  ['hotel_name / hotel_room', 'string', 'Collection point'],
                  ['destination_country/city/address', 'string', 'Delivery address'],
                  ['recipient_name / recipient_phone', 'string', 'Who receives the package'],
                  ['tracking_number', 'string', 'Set by admin when in_transit'],
                  ['payment_status', 'enum', 'unpaid | paid | refunded'],
                  ['estimated_delivery', 'string', 'ISO date set after payment'],
                ]}
              />
            </SubSection>
            <SubSection title="OrderItem">
              <Table
                headers={['Field', 'Type', 'Notes']}
                rows={[
                  ['order_id', 'string', 'FK → Order.id'],
                  ['item_name', 'string', 'Product name from receipt'],
                  ['category', 'string', 'AI-classified category'],
                  ['quantity', 'number', 'Default 1'],
                  ['price / currency', 'number/string', 'Extracted from receipt'],
                  ['eligible', 'boolean', 'AI-determined shipping eligibility'],
                  ['ineligible_reason', 'string', 'Reason if eligible=false'],
                  ['receipt_url', 'string', 'Source receipt file URL'],
                ]}
              />
            </SubSection>
            <SubSection title="Receipt">
              <Table
                headers={['Field', 'Type', 'Notes']}
                rows={[
                  ['order_id', 'string', 'FK → Order.id'],
                  ['file_url', 'string', 'Uploaded file CDN URL'],
                  ['store_name / purchase_date', 'string', 'AI-extracted'],
                  ['total_amount / currency', 'number/string', 'AI-extracted'],
                  ['processing_status', 'enum', 'uploading → processing → completed | failed'],
                  ['extracted_items_count', 'number', 'How many items were found'],
                ]}
              />
            </SubSection>
            <SubSection title="Hotel">
              <Table
                headers={['Field', 'Type', 'Notes']}
                rows={[
                  ['name / city / country', 'string', 'Required'],
                  ['star_rating', 'number', 'Used in UI display'],
                  ['logo_url / cover_image_url', 'string', 'Branding assets'],
                  ['contact_email / contact_phone', 'string', 'Hotel contact'],
                  ['concierge_name', 'string', 'Named concierge for QR landing'],
                  ['active', 'boolean', 'Whether hotel is live'],
                ]}
              />
            </SubSection>
            <SubSection title="OrderDocument (New)">
              <Table
                headers={['Field', 'Type', 'Notes']}
                rows={[
                  ['order_id', 'string', 'FK → Order.id'],
                  ['doc_type', 'enum', 'commercial_invoice | packing_list | customs_declaration | receipt | other'],
                  ['file_name', 'string', 'Original filename'],
                  ['file_url', 'string', 'CDN URL to file'],
                  ['notes', 'string', 'Optional notes'],
                ]}
              />
            </SubSection>
            <SubSection title="User (Built-in)">
              <p>Base44 built-in entity. Read-only: <Code_>id</Code_>, <Code_>email</Code_>, <Code_>full_name</Code_>, <Code_>created_date</Code_>. Editable custom fields saved via <Code_>base44.auth.updateMe(data)</Code_>: <Code_>first_name</Code_>, <Code_>last_name</Code_>, <Code_>middle_name</Code_>, <Code_>nationality</Code_>, <Code_>passport_number</Code_>, <Code_>passport_expiry</Code_>, <Code_>phone_number</Code_>, <Code_>whatsapp_number</Code_>, <Code_>home_address</Code_>, <Code_>home_address2</Code_>, <Code_>home_city</Code_>, <Code_>home_postal_code</Code_>, <Code_>home_country</Code_>, <Code_>hotel_id</Code_>, <Code_>hotel_name</Code_>, <Code_>hotel_city</Code_>, <Code_>hotel_country</Code_>.</p>
            </SubSection>
          </Section>
        )}

        {/* ── PAGES ── */}
        {activeSection === 'pages' && (
          <Section title="Pages & Navigation">
            <SubSection title="QRLanding (/hotel/:hotelId)">
              <p>Entry point for hotel guests. Loads Hotel entity by <Code_>hotelId</Code_> param. Displays hotel name, star rating, city. Shows two CTAs:</p>
              <ul className="list-disc pl-4 mt-2 space-y-1">
                <li><strong className="text-foreground">Register</strong> → navigates to <Code_>/register?hotelId=X</Code_></li>
                <li><strong className="text-foreground">Log In</strong> → navigates to <Code_>/new-order?hotelId=X</Code_> after auth</li>
              </ul>
            </SubSection>
            <SubSection title="Register (/register)">
              <p>Multi-field registration form. Key interactions:</p>
              <ul className="list-disc pl-4 mt-2 space-y-1">
                <li><strong className="text-foreground">Passport scan</strong> → file input → upload → InvokeLLM extracts fields → auto-fills form</li>
                <li><strong className="text-foreground">Nationality field change</strong> → auto-updates country + phone dial code</li>
                <li><strong className="text-foreground">Country select</strong> → shows shipping price + box cards preview</li>
                <li><strong className="text-foreground">PassportVerification component</strong> → debounced AI check, blocks submit if failed</li>
                <li>On submit → <Code_>base44.auth.updateMe()</Code_> → redirect to <Code_>/new-order</Code_></li>
              </ul>
            </SubSection>
            <SubSection title="NewOrder (/new-order)">
              <p>3-step wizard: <strong className="text-foreground">Your Details → Home Address → Confirm</strong>. Pre-fills all fields from user profile. On step 2, shows shipping price with currency conversion. On confirm → creates Order entity → navigates to <Code_>/order/:id/receipts</Code_>.</p>
            </SubSection>
            <SubSection title="ReceiptUpload (/order/:id/receipts)">
              <p>Upload receipts (images/PDF). Each upload:</p>
              <ol className="list-decimal pl-4 mt-2 space-y-1">
                <li>File → <Code_>UploadFile</Code_> integration → CDN URL</li>
                <li>Creates Receipt entity with status <Code_>processing</Code_></li>
                <li>InvokeLLM extracts items + checks eligibility vs destination country restrictions</li>
                <li>Creates OrderItem entities. Ineligible items flagged with reason.</li>
                <li>User reviews items, selects box size</li>
                <li>Generates ShipmentDeclarationForm PDF (with e-signature)</li>
                <li>Proceed to payment → <Code_>/order/:id/payment</Code_></li>
              </ol>
            </SubSection>
            <SubSection title="Payment (/order/:id/payment)">
              <p>Displays order summary with price in local currency. Mock credit card form. On pay → updates order status to <Code_>paid</Code_>, sets <Code_>estimated_delivery</Code_>, redirects to <Code_>/my-orders</Code_>.</p>
            </SubSection>
            <SubSection title="MyOrders (/my-orders)">
              <p>Lists all orders for current user (<Code_>filter by created_by</Code_>). Each OrderCard shows status badge, destination, price. Click → navigate to <Code_>/order/:id</Code_>.</p>
            </SubSection>
            <SubSection title="OrderDetail (/order/:id)">
              <p>Full order view. Conditionally renders:</p>
              <ul className="list-disc pl-4 mt-2 space-y-1">
                <li>Receipt upload CTA (if status = <Code_>pending</Code_>)</li>
                <li>Payment CTA (if <Code_>receipt_uploaded</Code_> or <Code_>payment_pending</Code_>)</li>
                <li>TrackingTimeline (if paid+)</li>
                <li>Delivery details block</li>
                <li>Items list</li>
                <li>OrderDocuments section (always visible)</li>
              </ul>
            </SubSection>
            <SubSection title="TrackingPage (/track)">
              <p>Public page. User enters order number or tracking number. Searches Order entity. Shows: status badge, order summary, interactive ShipmentMap, TrackingTimeline. Refresh button re-fetches.</p>
            </SubSection>
            <SubSection title="Profile (/profile)">
              <p>Edit personal info, contact details, home address, passport fields. Passport scan re-uses same AI extraction flow as Register. Logout button calls <Code_>base44.auth.logout()</Code_>.</p>
            </SubSection>
          </Section>
        )}

        {/* ── COMPONENTS ── */}
        {activeSection === 'components' && (
          <Section title="Components">
            <SubSection title="AppLayout">
              <p>Root layout wrapper using React Router <Code_>Outlet</Code_>. Renders:</p>
              <ul className="list-disc pl-4 mt-2 space-y-1">
                <li>Top header: brand logo + LanguageSelector</li>
                <li>Bottom navigation bar (mobile): Home, My Orders, Track, Profile</li>
                <li>On mount: calls <Code_>initRates()</Code_> from currencyConversion.js to pre-warm exchange rate cache</li>
              </ul>
            </SubSection>
            <SubSection title="TrackingTimeline">
              <p>Visual step-by-step status tracker. Receives <Code_>status</Code_> prop. Maps statuses to ordered indices, renders steps with completed/active/pending states.</p>
            </SubSection>
            <SubSection title="ShipmentMap">
              <p>react-leaflet map showing origin (Dubai), destination (country centroid), and animated package marker. Route: completed portion (pink solid) + remaining (grey dashed). Package position interpolated from STATUS_PROGRESS map (0–1 scale). Uses CARTO light tiles (no API key).</p>
            </SubSection>
            <SubSection title="PassportVerification">
              <p>Watches passport fields via props. Debounced (800ms) AI call to <Code_>verifyPassport</Code_> backend function. Shows per-check breakdown: format, expiry, name match, nationality. Calls <Code_>onResult()</Code_> with result object. Register form blocks submission if not verified.</p>
            </SubSection>
            <SubSection title="PhoneInput">
              <p>Composite input: searchable dial-code dropdown + number field. Value format: <Code_>+971|501234567</Code_> (pipe-separated). Stores dial code and number together.</p>
            </SubSection>
            <SubSection title="CountrySelect">
              <p>Popover-based searchable country picker. Reads from <Code_>lib/countries.js</Code_>. Fires <Code_>onChange(countryName)</Code_>.</p>
            </SubSection>
            <SubSection title="BoxCard">
              <p>Selection card for 10kg / 20kg box. Framer Motion scale on hover/tap. Shows price, features list. Fires <Code_>onSelect(size)</Code_>.</p>
            </SubSection>
            <SubSection title="ShipmentDeclarationForm">
              <p>Printable customs form component with Sections A–F: Sender, Consignee, Nature of Contents, Item Table, Shipping Details, Declaration + e-signature. Integrates <Code_>SignaturePad</Code_> component.</p>
            </SubSection>
            <SubSection title="OrderDocuments">
              <p>Manages OrderDocument entity records for an order. Type selector (5 types), file upload via UploadFile integration, list with view (external link) and delete actions. Fully self-contained — receives only <Code_>orderId</Code_> prop.</p>
            </SubSection>
          </Section>
        )}

        {/* ── USER FLOWS ── */}
        {activeSection === 'flows' && (
          <Section title="User Flows">
            <SubSection title="New Guest Flow (QR → Delivery)">
              <ol className="list-decimal pl-4 space-y-2">
                <li>Guest scans hotel QR code → lands on <Code_>/hotel/:hotelId</Code_></li>
                <li>Clicks <strong>Register</strong> → <Code_>/register?hotelId=X</Code_></li>
                <li>Optionally scans passport (AI auto-fill)</li>
                <li>Fills form → passport verification runs in background</li>
                <li>Submit → profile saved → redirected to <Code_>/new-order</Code_></li>
                <li>Reviews pre-filled details, enters room number</li>
                <li>Confirms home address → Creates Order</li>
                <li>Lands on ReceiptUpload → uploads shopping receipts</li>
                <li>AI processes receipts → items listed, ineligible flagged</li>
                <li>Selects box size → signs declaration → proceeds to Payment</li>
                <li>Pays → order status → <Code_>paid</Code_> → email sent</li>
                <li>Admin packs → status <Code_>packed</Code_> → email sent</li>
                <li>Courier picks up → <Code_>in_transit</Code_> → tracking number set → email sent</li>
                <li>Delivered → status <Code_>delivered</Code_> → email sent</li>
              </ol>
            </SubSection>
            <SubSection title="Returning User Flow">
              <ol className="list-decimal pl-4 space-y-1">
                <li>Visits app → AuthProvider checks auth → redirects to login if needed</li>
                <li>After login → lands on <Code_>/my-orders</Code_></li>
                <li>Can create new orders, track existing, manage documents, update profile</li>
              </ol>
            </SubSection>
            <SubSection title="Public Tracking Flow">
              <ol className="list-decimal pl-4 space-y-1">
                <li>Anyone visits <Code_>/track</Code_></li>
                <li>Enters order number (SIH-XXXXX) or tracking number</li>
                <li>App queries Order entity in parallel for both fields</li>
                <li>If found → shows map + timeline + summary card</li>
                <li>If not found → error message shown</li>
              </ol>
            </SubSection>
          </Section>
        )}

        {/* ── BACKEND FUNCTIONS ── */}
        {activeSection === 'backend' && (
          <Section title="Backend Functions">
            <SubSection title="verifyPassport">
              <p><Badge color="bg-green-100 text-green-700">POST</Badge> <Code_>/verifyPassport</Code_></p>
              <p className="mt-2"><strong className="text-foreground">Purpose:</strong> Validates passport details using AI.</p>
              <p className="mt-1"><strong className="text-foreground">Payload:</strong> <Code_>{`{ passport_number, nationality, expiry_date, first_name, last_name }`}</Code_></p>
              <p className="mt-1"><strong className="text-foreground">Returns:</strong> <Code_>{`{ verified: bool, checks: { format, expiry, name, nationality } }`}</Code_></p>
              <p className="mt-1"><strong className="text-foreground">Auth:</strong> Requires authenticated user (<Code_>base44.auth.me()</Code_>).</p>
            </SubSection>
            <SubSection title="sendStatusEmail">
              <p><Badge color="bg-blue-100 text-blue-700">AUTOMATION</Badge> Triggered by Order entity update events.</p>
              <p className="mt-2"><strong className="text-foreground">Purpose:</strong> Sends branded HTML email when order reaches a milestone status.</p>
              <p className="mt-1"><strong className="text-foreground">Milestone statuses:</strong> <Code_>paid</Code_>, <Code_>packed</Code_>, <Code_>in_transit</Code_>, <Code_>delivered</Code_></p>
              <p className="mt-1"><strong className="text-foreground">Logic:</strong> Checks if <Code_>status</Code_> field changed → sends email to <Code_>order.created_by</Code_> (user email).</p>
              <p className="mt-1"><strong className="text-foreground">Email template:</strong> Inline HTML with color-coded status badge, order details table, tracking number (if available), next-step message.</p>
            </SubSection>
            <SubSection title="Adding New Functions">
              <p>Create file in <Code_>functions/myFunction.js</Code_>. Must use <Code_>Deno.serve(async (req) =&gt; {'{ ... }'})</Code_> wrapper. Import SDK as: <Code_>import {'{ createClientFromRequest }'} from 'npm:@base44/sdk@0.8.23'</Code_>. Call from frontend: <Code_>base44.functions.invoke('myFunction', payload)</Code_>.</p>
            </SubSection>
          </Section>
        )}

        {/* ── CURRENCY ── */}
        {activeSection === 'currency' && (
          <Section title="Currency & Localisation">
            <SubSection title="Currency Conversion System">
              <p>File: <Code_>utils/currencyConversion.js</Code_></p>
              <ul className="list-disc pl-4 mt-2 space-y-1">
                <li><strong className="text-foreground">API:</strong> <Code_>https://api.exchangerate.host/latest?base=USD</Code_> — free, no key required</li>
                <li><strong className="text-foreground">Cache:</strong> Global module-level cache, fetched once per app session</li>
                <li><strong className="text-foreground">Init:</strong> <Code_>initRates()</Code_> called on app mount in AppLayout</li>
                <li><strong className="text-foreground">Function:</strong> <Code_>convertToLocalCurrency(usdAmount, countryName)</Code_> → returns formatted string like <Code_>"£ 47"</Code_> or <Code_>"₹ 4,980"</Code_></li>
                <li><strong className="text-foreground">Mapping:</strong> Country name → ISO currency code (defined in the module)</li>
                <li>Returns <Code_>null</Code_> if country not mapped or rates not loaded yet</li>
              </ul>
            </SubSection>
            <SubSection title="Shipping Pricing (utils/pricing.js)">
              <Table
                headers={['Region / Country', 'Price (USD)']}
                rows={[
                  ['GCC (UAE, Saudi, Qatar, Kuwait, Bahrain, Oman)', '$60'],
                  ['Rest of Middle East / South Asia', '$80'],
                  ['Europe / North America / Australia', '$100'],
                  ['Rest of World', '$120'],
                ]}
              />
              <p className="mt-3">Function: <Code_>getShippingPrice(countryName)</Code_> → returns number. <Code_>getPriceTierLabel(price)</Code_> → returns human-readable tier name.</p>
            </SubSection>
            <SubSection title="Language / Localisation">
              <p>Currently implemented: <strong className="text-foreground">LanguageSelector</strong> component in the header. The system is set up for multi-language support. Full i18n (react-i18next or similar) has not yet been integrated — all text is currently English. The LanguageSelector component is a UI placeholder ready for integration.</p>
            </SubSection>
          </Section>
        )}

        {/* ── SECURITY ── */}
        {activeSection === 'security' && (
          <Section title="Security">
            <SubSection title="Authentication & Authorisation">
              <ul className="list-disc pl-4 space-y-1">
                <li>All authenticated routes guarded by Base44 <Code_>AuthProvider</Code_> — unauthenticated users auto-redirected to login</li>
                <li>User entity has built-in RLS: users can only read/update their own record; admins can manage all</li>
                <li>Order / Receipt / OrderItem data is user-scoped (filtered by <Code_>created_by</Code_>)</li>
                <li>Admin-only backend functions check <Code_>user.role === 'admin'</Code_> before proceeding</li>
              </ul>
            </SubSection>
            <SubSection title="Backend Function Security">
              <ul className="list-disc pl-4 space-y-1">
                <li>All functions call <Code_>base44.auth.me()</Code_> → return 401 if unauthenticated</li>
                <li>Service-role operations (<Code_>base44.asServiceRole</Code_>) only used after verifying user identity</li>
                <li>Webhook/automation functions validate event payload structure before processing</li>
                <li>No secrets stored in frontend code — all API keys in Base44 environment variables</li>
              </ul>
            </SubSection>
            <SubSection title="Data Protection">
              <ul className="list-disc pl-4 space-y-1">
                <li>Passport numbers and personal data stored in Base44 (encrypted at rest)</li>
                <li>File uploads go through Base44's UploadFile — files stored on CDN, not directly exposed to other users</li>
                <li>No raw SQL — Base44 SDK uses parameterised queries, preventing injection</li>
                <li>HTTPS enforced on all Base44 endpoints</li>
              </ul>
            </SubSection>
            <SubSection title="Content Protection (Frontend)">
              <ul className="list-disc pl-4 space-y-1">
                <li>Sensitive pages require authentication — not accessible without valid session</li>
                <li>Dynamic watermarks can be added to order documents by overlaying user email / session ID using CSS <Code_>::before</Code_> pseudo-elements</li>
                <li>For PDF documents: embed user data into generated PDFs (ShipmentDeclarationForm) to identify source if leaked</li>
                <li>Right-click / copy disable: add <Code_>onContextMenu={`{e => e.preventDefault()}`}</Code_> and <Code_>user-select: none</Code_> CSS on sensitive content blocks</li>
              </ul>
              <p className="mt-2 text-xs"><Badge color="bg-amber-100 text-amber-700">NOTE</Badge> 100% screenshot/screen-recording prevention is technically impossible in web browsers. Combine watermarking + session tracking + legal disclaimers for maximum deterrence.</p>
            </SubSection>
            <SubSection title="Content Security Policy (CSP)">
              <p>Add to <Code_>index.html</Code_> or server headers:</p>
              <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto mt-2">{`<meta http-equiv="Content-Security-Policy"
  content="default-src 'self';
           script-src 'self' 'unsafe-inline';
           style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
           img-src 'self' data: https:;
           connect-src 'self' https://api.base44.com https://api.exchangerate.host;
           frame-ancestors 'none';">`}</pre>
            </SubSection>
          </Section>
        )}

        {/* ── TRACKING ── */}
        {activeSection === 'tracking' && (
          <Section title="Tracking & Maps">
            <SubSection title="ShipmentMap Component">
              <p>File: <Code_>components/ShipmentMap.jsx</Code_></p>
              <Table
                headers={['Prop', 'Type', 'Description']}
                rows={[
                  ['order', 'Object', 'Full Order entity record'],
                ]}
              />
              <p className="mt-3"><strong className="text-foreground">Map tiles:</strong> CARTO Light (no API key). Library: react-leaflet v4.</p>
              <p className="mt-2"><strong className="text-foreground">Markers:</strong> ✈️ Origin (Dubai 25.2°N, 55.3°E) · 🏠 Destination (country centroid from COUNTRY_COORDS map) · 📦 Current package position (animated pulse)</p>
              <p className="mt-2"><strong className="text-foreground">Route:</strong> Completed portion = pink (#ff0066) solid line · Remaining = grey dashed</p>
              <p className="mt-2"><strong className="text-foreground">Progress mapping (STATUS_PROGRESS):</strong></p>
              <Table
                headers={['Status', 'Map Progress']}
                rows={[
                  ['pending / receipt_uploaded / payment_pending', '0% (at origin)'],
                  ['paid', '5%'],
                  ['packed', '15%'],
                  ['picked_up', '30%'],
                  ['in_transit', '65%'],
                  ['delivered', '100% (at destination, package marker hidden)'],
                ]}
              />
            </SubSection>
            <SubSection title="TrackingTimeline Component">
              <p>File: <Code_>components/TrackingTimeline.jsx</Code_>. Receives <Code_>status</Code_> prop. Defines ordered steps array, maps current status to index, renders each step with past/current/future visual states.</p>
            </SubSection>
            <SubSection title="Adding New Destination Countries">
              <p>Add entry to <Code_>COUNTRY_COORDS</Code_> object in <Code_>ShipmentMap.jsx</Code_>: <Code_>{`'Country Name': [lat, lng]`}</Code_>. Also add to <Code_>COUNTRY_TO_CURRENCY</Code_> in <Code_>currencyConversion.js</Code_> and to <Code_>lib/countries.js</Code_> for the picker.</p>
            </SubSection>
          </Section>
        )}

        {/* ── NOTIFICATIONS ── */}
        {activeSection === 'notifications' && (
          <Section title="Email Notifications">
            <SubSection title="Automation Setup">
              <p>Automation: <Code_>Shipment Status Email Notifications</Code_> (entity automation on Order updates). Trigger conditions:</p>
              <ul className="list-disc pl-4 mt-2 space-y-1">
                <li><Code_>changed_fields</Code_> contains <Code_>status</Code_></li>
                <li><Code_>data.status</Code_> in list: <Code_>[paid, packed, in_transit, delivered]</Code_></li>
              </ul>
              <p className="mt-2">Fires backend function: <Code_>sendStatusEmail</Code_></p>
            </SubSection>
            <SubSection title="Email Templates">
              <Table
                headers={['Status', 'Subject', 'Color']}
                rows={[
                  ['paid', '✅ Payment Confirmed – Your Shipment is Being Prepared', 'Green #22c55e'],
                  ['packed', '📦 Your Box is Packed & Ready for Pickup', 'Amber #f59e0b'],
                  ['in_transit', '🚀 Your Shipment is On Its Way!', 'Blue #3b82f6'],
                  ['delivered', '🎉 Your Shipment Has Been Delivered!', 'Purple #8b5cf6'],
                ]}
              />
              <p className="mt-3">All emails use inline HTML with brand header (dark navy + pink logo), order details table, tracking number (if set), and a next-step message. Sent from Base44 SendEmail integration to <Code_>order.created_by</Code_> (user's registered email).</p>
            </SubSection>
            <SubSection title="Extending Notifications">
              <p>To add a new milestone: add status to <Code_>MILESTONE_STATUSES</Code_> array and <Code_>STATUS_CONTENT</Code_> object in <Code_>functions/sendStatusEmail.js</Code_>. Update the automation trigger condition's <Code_>in_list</Code_> value accordingly.</p>
            </SubSection>
          </Section>
        )}

        {/* ── DOCUMENTS ── */}
        {activeSection === 'documents' && (
          <Section title="Document Management">
            <SubSection title="Overview">
              <p>Each order has a dedicated document section (component: <Code_>OrderDocuments</Code_>, entity: <Code_>OrderDocument</Code_>). Supports 5 document types: Commercial Invoice, Packing List, Customs Declaration, Receipt, Other.</p>
            </SubSection>
            <SubSection title="Upload Flow">
              <ol className="list-decimal pl-4 space-y-1">
                <li>User selects document type (pill buttons)</li>
                <li>Clicks file input → browser file picker (PDF, JPG, PNG, WEBP)</li>
                <li>File uploaded via <Code_>base44.integrations.Core.UploadFile()</Code_> → returns CDN URL</li>
                <li>OrderDocument entity created with <Code_>order_id</Code_>, <Code_>doc_type</Code_>, <Code_>file_name</Code_>, <Code_>file_url</Code_></li>
                <li>List refreshes automatically</li>
              </ol>
            </SubSection>
            <SubSection title="View & Delete">
              <ul className="list-disc pl-4 space-y-1">
                <li><strong className="text-foreground">View:</strong> External link icon → opens file URL in new tab</li>
                <li><strong className="text-foreground">Delete:</strong> Trash icon → calls <Code_>base44.entities.OrderDocument.delete(id)</Code_> → removes from local state immediately</li>
              </ul>
            </SubSection>
            <SubSection title="Component Props">
              <Table
                headers={['Prop', 'Type', 'Required']}
                rows={[
                  ['orderId', 'string', 'Yes — used to filter documents'],
                ]}
              />
            </SubSection>
          </Section>
        )}

      </main>
    </div>
  );
}