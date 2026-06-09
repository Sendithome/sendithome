import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import AppLayout from './components/AppLayout';
import { Navigate } from 'react-router-dom';
import QRLanding from './pages/QRLanding';
import Register from './pages/Register';
import NewOrder from './pages/NewOrder';
import ReceiptUpload from './pages/ReceiptUpload';
import Payment from './pages/Payment';
import MyOrders from './pages/MyOrders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import TrackingPage from './pages/TrackingPage';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import DevDocs from './pages/DevDocs';
import HotelDashboard from './pages/HotelDashboard';
import HotelPartnerLanding from './pages/HotelPartnerLanding';
import HotelSignup from './pages/HotelSignup';
import NdaSigning from './pages/NdaSigning';
import BrandDirectory from './pages/BrandDirectory';
import OxfordOverview from './pages/OxfordOverview';
import RetailerRegistration from './pages/RetailerRegistration';
import RetailerPortal from './pages/RetailerPortal';
import RetailerDashboard from './pages/RetailerDashboard';
import RetailerSettings from './pages/RetailerSettings';
import GovernmentLogin from './pages/GovernmentLogin';
import GovernmentDashboard from './pages/GovernmentDashboard';
import AdminRetailers from './pages/AdminRetailers';
import AdminDashboard from './pages/AdminDashboard';
import CourierLogin from './pages/CourierLogin';
import CourierDashboard from './pages/CourierDashboard';
import HotelInventory from './pages/HotelInventory';
import HotelDemoDashboard from './pages/HotelDemoDashboard';
import DeclarationPreview from './pages/DeclarationPreview';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/guest-onboarding/69c10e96d7e89842ae433412" replace />} />
        <Route path="/guest-onboarding/:hotelId" element={<QRLanding />} />
        <Route path="/register" element={<Register />} />
        <Route path="/new-order" element={<NewOrder />} />
        <Route path="/order/:id/receipts" element={<ReceiptUpload />} />
        <Route path="/order/:id/payment" element={<Payment />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/order/:id" element={<OrderDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/track" element={<TrackingPage />} />
        <Route path="/docs" element={<DevDocs />} />
        <Route path="/hotel-dashboard" element={<HotelDashboard />} />
      </Route>
      <Route path="/hotel-onboarding" element={<HotelPartnerLanding />} />
      <Route path="/hotel-signup" element={<HotelSignup />} />
      <Route path="/nda-signing" element={<NdaSigning />} />
      <Route path="/retailer-registration" element={<RetailerRegistration />} />
      <Route path="/retailer-portal" element={<RetailerPortal />} />
      <Route path="/retailer-dashboard" element={<RetailerDashboard />} />
      <Route path="/retailer-settings" element={<RetailerSettings />} />
      <Route path="/brand-directory" element={<BrandDirectory />} />
      <Route path="/oxford-overview" element={<OxfordOverview />} />
      <Route path="/government-login" element={<GovernmentLogin />} />
      <Route path="/government-dashboard" element={<GovernmentDashboard />} />
      <Route path="/admin-retailers" element={<AdminRetailers />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/courier-login" element={<CourierLogin />} />
      <Route path="/courier-dashboard" element={<CourierDashboard />} />
      <Route path="/hotel-inventory" element={<HotelInventory />} />
      <Route path="/hotel-demo" element={<HotelDemoDashboard />} />
      <Route path="/declaration-preview" element={<DeclarationPreview />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App