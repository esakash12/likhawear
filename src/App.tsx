import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { MobileDrawer } from './components/MobileDrawer';
import { AuthModal } from './components/AuthModal';
import { ImageZoomModal } from './components/ImageZoomModal';
import { MobileBottomNav } from './components/MobileBottomNav';

import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import { CheckoutView } from './views/CheckoutView';
import { TrackOrderView } from './views/TrackOrderView';
import { OrderSuccessView } from './views/OrderSuccessView';
import { PolicyView } from './views/PolicyView';
import { AdminView } from './views/AdminView';
import { CustomerDashboardView } from './views/CustomerDashboardView';
import { MessageCircle } from 'lucide-react';

export const SECRET_ADMIN_PATH = '/mg/shohag/admin';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView, toastMessage, cms } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Secret URL routing listener: only /mg/shohag/admin activates the admin view
  useEffect(() => {
    const checkSecretRoute = () => {
      const currentPath = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      if (currentPath === SECRET_ADMIN_PATH) {
        setCurrentView('admin');
      } else if (currentPath === '/admin' || currentPath === '/admin-login') {
        // Obfuscate /admin attempts by redirecting to home
        window.history.replaceState({}, '', '/');
        setCurrentView('home');
      }
    };

    checkSecretRoute();
    window.addEventListener('popstate', checkSecretRoute);
    return () => window.removeEventListener('popstate', checkSecretRoute);
  }, [setCurrentView]);

  // Keep URL in sync when navigating to/from admin view
  useEffect(() => {
    const currentPath = window.location.pathname.toLowerCase().replace(/\/+$/, '');
    if (currentView === 'admin') {
      if (currentPath !== SECRET_ADMIN_PATH) {
        window.history.pushState({}, '', SECRET_ADMIN_PATH);
      }
    } else {
      if (currentPath === SECRET_ADMIN_PATH) {
        window.history.pushState({}, '', '/');
      }
    }
  }, [currentView]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF8] text-[#2C2926] font-sans antialiased selection:bg-[#8B2628] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          id="toast-notification"
          className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-[#1C1A18] text-white px-5 py-3 rounded-xl shadow-2xl border border-white/10 text-xs font-semibold animate-toast"
        >
          <div className="w-2 h-2 rounded-full bg-[#8B2628] animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <WishlistDrawer />
      <MobileDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <AuthModal />
      <ImageZoomModal />

      {/* Main Site Header (only shown when not in admin view) */}
      {currentView !== 'admin' && (
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
      )}

      {/* View Router with Smooth View Transition */}
      <main key={currentView} className="flex-1 animate-page-enter">
        {currentView === 'home' && <HomeView />}
        {currentView === 'shop' && <ShopView />}
        {currentView === 'product' && <ProductDetailView />}
        {currentView === 'checkout' && <CheckoutView />}
        {currentView === 'track' && <TrackOrderView />}
        {currentView === 'order-success' && <OrderSuccessView />}
        {currentView === 'policy' && <PolicyView />}
        {currentView === 'customer-dashboard' && <CustomerDashboardView />}
        {currentView === 'admin' && <AdminView />}
      </main>

      {/* WhatsApp Quick Assistance Button (customer views) */}
      {currentView !== 'admin' && cms?.siteInfo?.whatsappNumber && (
        <a
          id="btn-whatsapp-floating"
          href={`https://wa.me/${(cms.siteInfo.whatsappNumber || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${cms?.siteInfo?.brandName || 'Store'}! I need assistance with an order or product.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-20 lg:bottom-6 right-5 z-40 bg-[#25D366] hover:bg-[#20ba59] text-white p-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center cursor-pointer"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      )}

      {/* Site Footer & Mobile Navigation */}
      {currentView !== 'admin' && (
        <>
          <Footer />
          <MobileBottomNav />
        </>
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
