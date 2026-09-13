import React, { useState } from 'react';
import { X, ChevronRight, ChevronDown, Truck, SlidersHorizontal, Phone, MessageCircle, Heart, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    cms, 
    categories, 
    viewCategory, 
    setCurrentView, 
    setIsAuthModalOpen,
    viewPolicy 
  } = useStore();
  
  const [expandedCat, setExpandedCat] = useState<string | null>('men');

  if (!isOpen) return null;

  const toggleCat = (catId: string) => {
    setExpandedCat(prev => (prev === catId ? null : catId));
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-backdrop"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col z-10 overflow-hidden animate-drawer-left">
        {/* Drawer header */}
        <div className="p-4 bg-[#FCFBF8] border-b border-[#EDE9E1] flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-[220px]">
            {cms?.siteInfo?.logoUrl ? (
              <img 
                src={cms.siteInfo.logoUrl} 
                alt={cms?.siteInfo?.brandName || 'Store'} 
                className="h-7 max-w-[150px] object-contain"
              />
            ) : (
              <>
                <span className="w-2.5 h-2.5 rotate-45 bg-[#8B2628] shrink-0"></span>
                <span className="font-serif font-bold text-base sm:text-lg tracking-wider text-[#1C1A18] truncate">
                  {cms?.siteInfo?.brandName || 'ZINNIA'}
                </span>
              </>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-[#7A7369] hover:text-[#2C2926] rounded-full hover:bg-[#F2ECE1]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User sign-in quick prompt */}
        <div className="p-4 bg-[#FAF7F2] border-b border-[#EDE9E1]">
          <p className="text-xs text-[#7A7369] mb-1">Welcome to {cms?.siteInfo?.brandName || 'Zinnia'}</p>
          <button 
            onClick={() => {
              onClose();
              setIsAuthModalOpen(true);
            }}
            className="w-full py-2 bg-[#8B2628] text-white rounded-lg text-xs font-bold hover:bg-[#721E20] transition-colors"
          >
            Sign In / Register
          </button>
        </div>

        {/* Scrollable menu content */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#F4F0E8] py-2">
          {/* Shop categories accordion */}
          <div className="px-4 py-2">
            <div className="text-[11px] font-bold text-[#9E978C] uppercase tracking-wider mb-2">
              Shop Categories
            </div>
            <div className="space-y-1">
              {(categories || []).map(cat => {
                const isExpanded = expandedCat === cat.id;
                return (
                  <div key={cat.id} className="rounded-lg overflow-hidden border border-[#F2ECE1]">
                    <div 
                      onClick={() => toggleCat(cat.id)}
                      className="flex items-center justify-between p-3 bg-white hover:bg-[#FCFBF8] cursor-pointer text-sm font-semibold text-[#2C2926]"
                    >
                      <span>{cat.name}</span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-[#8B2628]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#A8A196]" />
                      )}
                    </div>
                    {isExpanded && (
                      <div className="bg-[#FDFCF9] px-4 py-2 border-t border-[#F2ECE1] space-y-2 text-xs text-[#5A534A] animate-accordion">
                        <div 
                          onClick={() => {
                            onClose();
                            viewCategory(cat.name);
                          }}
                          className="font-bold text-[#8B2628] py-1 cursor-pointer flex items-center justify-between"
                        >
                          <span>All {cat.name} Products</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                        {(cat.subcategories || []).map((sub, sIdx) => (
                          <div 
                            key={sIdx}
                            onClick={() => {
                              onClose();
                              viewCategory(cat.name, sub.name);
                            }}
                            className="py-1 cursor-pointer hover:text-[#8B2628] transition-colors flex items-center justify-between"
                          >
                            <span>{sub.name}</span>
                            <span className="text-[10px] text-[#A8A196]">{sub.group}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick links */}
          <div className="px-4 py-3 space-y-2 text-sm font-medium text-[#4A443D]">
            <button
              onClick={() => {
                onClose();
                setCurrentView('track');
              }}
              className="w-full flex items-center gap-3 py-2 text-left hover:text-[#8B2628] transition-colors"
            >
              <Truck className="w-4 h-4 text-[#8B2628]" />
              <span>Track Your Order</span>
            </button>
          </div>

          {/* Policy Links */}
          <div className="px-4 py-3 text-xs text-[#7A7369] space-y-2">
            <div className="font-bold text-[#9E978C] uppercase text-[10px] tracking-wider mb-2">
              Customer Information
            </div>
            <div 
              onClick={() => { onClose(); viewPolicy('aboutUs'); }}
              className="py-1 cursor-pointer hover:text-[#8B2628]"
            >
              About Zinnia
            </div>
            <div 
              onClick={() => { onClose(); viewPolicy('shippingPolicy'); }}
              className="py-1 cursor-pointer hover:text-[#8B2628]"
            >
              Delivery & Shipping
            </div>
            <div 
              onClick={() => { onClose(); viewPolicy('refundPolicy'); }}
              className="py-1 cursor-pointer hover:text-[#8B2628]"
            >
              Returns & Refunds
            </div>
            <div 
              onClick={() => { onClose(); viewPolicy('contactUs'); }}
              className="py-1 cursor-pointer hover:text-[#8B2628]"
            >
              Contact Support
            </div>
          </div>
        </div>

        {/* Drawer footer contact */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#EDE9E1] text-xs text-[#5A534A] space-y-2">
          {cms?.siteInfo?.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#8B2628]" />
              <span>Call: {cms.siteInfo.phone}</span>
            </div>
          )}
          {cms?.siteInfo?.whatsappNumber && (
            <a
              href={`https://wa.me/${(cms.siteInfo.whatsappNumber || '').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#2E7D32] font-semibold"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Support</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
