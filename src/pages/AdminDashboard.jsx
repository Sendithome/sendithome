import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Store, Hotel, ShoppingBag, Package,
  CheckCircle2, Clock, AlertTriangle, TrendingUp, DollarSign,
  FileText, RefreshCw, Loader2, Activity, Globe, Star, Truck, Box
} from 'lucide-react';
import AdminOverviewTab from '@/components/admin/AdminOverviewTab';
import AdminOrdersTab from '@/components/admin/AdminOrdersTab';
import AdminRetailersTab from '@/components/admin/AdminRetailersTab';
import AdminHotelsTab from '@/components/admin/AdminHotelsTab';
import AdminShipmentsTab from '@/components/admin/AdminShipmentsTab';
import AdminExecutiveTab from '@/components/admin/AdminExecutiveTab';
import AdminHotelAnalyticsTab from '@/components/admin/AdminHotelAnalyticsTab';
import AdminTouristAnalyticsTab from '@/components/admin/AdminTouristAnalyticsTab';
import AdminShipmentAnalyticsTab from '@/components/admin/AdminShipmentAnalyticsTab';
import AdminRetailerAnalyticsTab from '@/components/admin/AdminRetailerAnalyticsTab';
import AdminFinancialTab from '@/components/admin/AdminFinancialTab';
import AdminOperationalTab from '@/components/admin/AdminOperationalTab';
import AdminCourierTab from '@/components/admin/AdminCourierTab';
import AdminInventoryTab from '@/components/admin/AdminInventoryTab';

const TABS = [
  { id: 'executive', label: 'Executive', icon: Star },
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'shipments', label: 'Verifications', icon: Package },
  { id: 'retailers', label: 'Retailers', icon: Store },
  { id: 'hotels', label: 'Hotels', icon: Hotel },
  { id: 'hotel-analytics', label: 'Hotel Analytics', icon: Hotel },
  { id: 'tourist-analytics', label: 'Tourist Analytics', icon: Users },
  { id: 'shipment-analytics', label: 'Shipment Analytics', icon: Globe },
  { id: 'retailer-analytics', label: 'Retailer Analytics', icon: TrendingUp },
  { id: 'financial', label: 'Financial', icon: DollarSign },
  { id: 'operational', label: 'Operational', icon: Activity },
  { id: 'courier', label: 'Courier Partners', icon: Truck },
  { id: 'inventory', label: 'Box Inventory', icon: Package },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('executive');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    orders: [], verifications: [], retailers: [], hotels: [], users: [], onboardings: []
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const [orders, verifications, retailers, hotels, onboardings] = await Promise.all([
      base44.entities.Order.list('-created_date', 200),
      base44.entities.RetailerVerification.list('-created_date', 200),
      base44.entities.Retailer.list('-created_date', 200),
      base44.entities.Hotel.list('-created_date', 100),
      base44.entities.HotelOnboardingStatus.list('-stage_updated_at', 200),
    ]);
    setData({ orders, verifications, retailers, hotels, onboardings });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const TabIcon = TABS.find(t => t.id === tab)?.icon || LayoutDashboard;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <p className="text-sm font-black tracking-widest text-foreground">SEND<span className="text-accent">IT</span>HOME</p>
          <span className="text-muted-foreground text-xs">|</span>
          <p className="text-sm font-bold text-primary">Central Admin Dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadAll} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <a href="/admin-retailers" className="text-xs text-accent hover:underline px-2 py-1">
            Retailer Approvals →
          </a>
          <a href="/hotel-dashboard" className="text-xs text-accent hover:underline px-2 py-1">
            Hotel Admin →
          </a>
          <a href="/government-dashboard" className="text-xs text-accent hover:underline px-2 py-1">
            Gov Portal →
          </a>
          <a href="/courier-login" className="text-xs text-accent hover:underline px-2 py-1">
            Courier Portal →
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tab Nav */}
        <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  tab === t.id ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                {t.id === 'shipments' && data.verifications.filter(v => v.status === 'pending').length > 0 && (
                  <span className="bg-yellow-100 text-yellow-700 border border-yellow-200 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {data.verifications.filter(v => v.status === 'pending').length}
                  </span>
                )}
                {t.id === 'retailers' && data.retailers.filter(r => r.status === 'pending').length > 0 && (
                  <span className="bg-accent/10 text-accent text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {data.retailers.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {tab === 'executive' && <AdminExecutiveTab data={data} />}
        {tab === 'overview' && <AdminOverviewTab data={data} />}
        {tab === 'orders' && <AdminOrdersTab orders={data.orders} />}
        {tab === 'shipments' && <AdminShipmentsTab verifications={data.verifications} retailers={data.retailers} onRefresh={loadAll} />}
        {tab === 'retailers' && <AdminRetailersTab retailers={data.retailers} onRefresh={loadAll} />}
        {tab === 'hotels' && <AdminHotelsTab hotels={data.hotels} />}
        {tab === 'hotel-analytics' && <AdminHotelAnalyticsTab data={data} />}
        {tab === 'tourist-analytics' && <AdminTouristAnalyticsTab data={data} />}
        {tab === 'shipment-analytics' && <AdminShipmentAnalyticsTab data={data} />}
        {tab === 'retailer-analytics' && <AdminRetailerAnalyticsTab data={data} />}
        {tab === 'financial' && <AdminFinancialTab data={data} />}
        {tab === 'operational' && <AdminOperationalTab data={data} />}
        {tab === 'courier' && <AdminCourierTab onboardings={data.onboardings} hotels={data.hotels} onRefresh={loadAll} />}
        {tab === 'inventory' && <AdminInventoryTab hotels={data.hotels} onRefresh={loadAll} />}
      </div>

      {/* Confidentiality Footer */}
      <footer className="border-t border-border bg-card mt-8 py-3 px-4 text-center">
        <p className="text-[10px] text-muted-foreground font-semibold tracking-widest uppercase">
          © {new Date().getFullYear()} SendItHome · Proprietary and Confidential · Internal Use Only · Unauthorised use is strictly prohibited
        </p>
      </footer>
    </div>
  );
}