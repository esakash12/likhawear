import React from 'react';
import { Home, Grid, Heart, ShoppingBag, SlidersHorizontal, Package } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const MobileBottomNav: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    cartCount, 
    wishlist, 
    setIsCartOpen, 
    setIsWishlistOpen 
  } = useStore();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EDE9E1] px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          id="m-nav-home"
          onClick={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            currentView === 'home' ? 'text-[#8B2628]' : 'text-[#7A7369] hover:text-[#2C2926]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Home</span>
        </button>

        {/* Shop */}
        <button
          id="m-nav-shop"
          onClick={() => {
            setCurrentView('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            currentView === 'shop' ? 'text-[#8B2628]' : 'text-[#7A7369] hover:text-[#2C2926]'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Shop</span>
        </button>

        {/* Wishlist */}
        <button
          id="m-nav-wishlist"
          onClick={() => setIsWishlistOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[#7A7369] hover:text-[#8B2628] transition-colors"
        >
          <Heart className="w-5 h-5" />
          {wishlist.length > 0 && (
            <span className="absolute top-0 right-2 bg-[#8B2628] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {wishlist.length}
            </span>
          )}
          <span className="text-[10px] font-semibold mt-0.5">Wishlist</span>
        </button>

        {/* Cart */}
        <button
          id="m-nav-cart"
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[#7A7369] hover:text-[#8B2628] transition-colors"
        >
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-2 bg-[#8B2628] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
          <span className="text-[10px] font-semibold mt-0.5">Cart</span>
        </button>

        {/* Track Order */}
        <button
          id="m-nav-track"
          onClick={() => setCurrentView('track')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            currentView === 'track' ? 'text-[#8B2628]' : 'text-[#7A7369] hover:text-[#2C2926]'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Track</span>
        </button>
      </div>
    </div>
  );
};
