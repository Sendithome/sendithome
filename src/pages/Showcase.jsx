import { useState } from 'react';
import {
  Package, Smartphone, Hotel, Store, Shield, Truck, Boxes,
  FileText, LayoutDashboard, ExternalLink, X, Menu
} from 'lucide-react';

const SHOWCASE_PAGES = [
  {
    group: 'Tourist / Customer',
    icon: Smartphone,
    color: 'text-accent',
    bg: 'bg-accent/10',
    pages: [
      { label: 'QR Landing (Guest Onboarding)', path: '/guest-onboarding/69c10e96d7e89842ae433412' },
      { label: 'Register / New Account', path: '/register' },
      { label: 'New Order', path: '/new-order' },
      { label: 'Receipt Upload', path: '/order/6a3ba85284af787d7be0cca3/receipts' },
      { label: 'Payment', path: '/order/6a2fbf7d5f12048618aab1dd/payment' },
      { label: 'My Orders', path: '/my-orders' },
      { label: 'Order Detail', path: '/order/6a3ba85284af787d7be0cca3' },
      { label: 'Track Shipment', path: '/track' },
      { label: 'Profile', path: '/profile' },
      { label: 'Tourist Portal (Shipment View)', path: '/shipment/6a3ba85284af787d7be0cca3' },
      { label: 'Declaration Preview', path: '/declaration-preview' },
      { label: 'Login Page', path: '/login' },
    ],
  },
  {
    group: 'Hotel Partner',
    icon: Hotel,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    pages: [
      { label: 'Hotel Partner Landing', path: '/hotel-onboarding' },
      { label: 'Hotel Sign-Up', path: '/hotel-signup' },
      { label: 'NDA Signing', path: '/nda-signing' },
      { label: 'Hotel Dashboard', path: '/hotel-dashboard' },
      { label: 'Hotel Demo Dashboard', path: '/hotel-demo' },
      { label: 'Hotel Inventory', path: '/hotel-inventory' },
    ],
  },
  {
    group: 'Retailer Partner',
    icon: Store,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    pages: [
      { label: 'Retailer Registration', path: '/retailer-registration' },
      { label: 'Retailer Portal (Login)', path: '/retailer-portal' },
      { label: 'Retailer Dashboard', path: '/retailer-dashboard' },
      { label: 'Retailer Settings', path: '/retailer-settings' },
      { label: 'Premium & Luxury Retailer Intelligence Platform', path: 'https://claude.ai/public/artifacts/190823bb-bf6c-4c9d-a823-46dab05f8e33', external: true },
      { label: 'Eligible Items Dashboard', path: 'https://claude.ai/public/artifacts/144cc323-b4f0-42e5-a915-0218d7ac4270', external: true },
    ],
  },
  {
    group: 'Government',
    icon: Shield,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    pages: [
      { label: 'Government Login', path: '/government-login' },
      { label: 'Government Dashboard', path: '/government-dashboard' },
      { label: 'Master Targeted Countries Dashboard', path: 'https://claude.ai/public/artifacts/5e1b7289-c7d8-4860-b574-22c63f3b4965', external: true },
    ],
  },
  {
    group: 'Admin',
    icon: LayoutDashboard,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    pages: [
      { label: 'Admin Dashboard', path: '/admin-dashboard' },
      { label: 'Admin Retailers', path: '/admin-retailers' },
    ],
  },
  {
    group: 'Courier / Logistics',
    icon: Truck,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    pages: [
      { label: 'Courier Login', path: '/courier-login' },
      { label: 'Courier Dashboard', path: '/courier-dashboard' },
    ],
  },
];

export default function Showcase() {
  const [selected, setSelected] = useState(SHOWCASE_PAGES[0].pages[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const handleSelect = (page) => {
    if (page.external) {
      window.open(page.path, '_blank', 'noopener,noreferrer');
      return;
    }
    setSelected(page);
    setSidebarOpen(false);
    setIframeKey(k => k + 1);
  };

  const iframeUrl = `${window.location.origin}${selected.path}`;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-card border-r border-border flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand header */}
        <div className="px-4 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-widest text-foreground leading-none">SEND<span className="text-accent">IT</span>HOME</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Platform Showcase</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {SHOWCASE_PAGES.map(group => {
            const GroupIcon = group.icon;
            return (
              <div key={group.group}>
                <div className="flex items-center gap-2 px-2 mb-1.5">
                  <div className={`w-6 h-6 rounded-lg ${group.bg} flex items-center justify-center`}>
                    <GroupIcon className={`w-3.5 h-3.5 ${group.color}`} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{group.group}</p>
                </div>
                <div className="space-y-0.5">
                  {group.pages.map(page => {
                    const isActive = selected.path === page.path;
                    return (
                      <button
                        key={page.path}
                        onClick={() => handleSelect(page)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-accent text-accent-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {page.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-3 py-2.5 border-t border-border">
          <p className="text-[9px] text-muted-foreground text-center">Proprietary and Confidential</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-3 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground p-1">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{selected.label}</p>
            <p className="text-[10px] text-muted-foreground truncate font-mono">{selected.path}</p>
          </div>
          <a
            href={selected.external ? selected.path : iframeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-muted hover:bg-accent hover:text-accent-foreground text-xs font-semibold text-foreground transition-colors shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open
          </a>
        </header>

        {/* Iframe / External Link Panel */}
        <div className="flex-1 bg-muted/30">
          {selected.external ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <ExternalLink className="w-12 h-12 text-accent" />
              <div>
                <p className="text-lg font-bold text-foreground mb-1">{selected.label}</p>
                <p className="text-sm text-muted-foreground max-w-md">
                  This is an external resource hosted on Claude. Click below to open it in a new tab.
                </p>
              </div>
              <a
                href={selected.path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 h-11 rounded-xl bg-accent text-accent-foreground font-bold text-sm hover:bg-accent/90 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Open External Link
              </a>
            </div>
          ) : (
            <iframe
              key={iframeKey}
              src={iframeUrl}
              title={selected.label}
              className="w-full h-full border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}