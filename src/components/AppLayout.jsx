import { Outlet, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { initCurrencyRates } from '../utils/currencyConversion';
import { Package, Home, ClipboardList, User } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/my-orders', icon: ClipboardList, label: 'My Orders' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function AppLayout() {
  const location = useLocation();

  useEffect(() => {
    initCurrencyRates();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-accent-foreground" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-sm tracking-wide">SEND<span className="text-accent">IT</span>HOME</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <div id="google_translate_element" style={{display:'none'}} />
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Bottom navigation (mobile-first) */}
      <nav className="sticky bottom-0 z-50 bg-card border-t border-border md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className="flex flex-col items-center gap-1 relative px-4 py-1"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNav"
                    className="absolute -top-px left-2 right-2 h-0.5 bg-accent rounded-full"
                  />
                )}
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-accent' : 'text-muted-foreground'}`} />
                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}