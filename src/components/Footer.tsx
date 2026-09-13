import React from 'react';
import { Mail, Phone, MapPin, Clock, Facebook, Instagram, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { cms, setCurrentView, viewCategory, viewPolicy } = useStore();

  return (
    <footer className="bg-[#1C1A18] text-[#D8D2C7] pt-14 pb-10 border-t border-[#2C2926]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-[#2E2B27]">
          {/* Brand & Address Column (2 cols wide on large) */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              onClick={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="cursor-pointer inline-flex items-center gap-2 group max-w-full"
            >
              {cms?.siteInfo?.logoUrl ? (
                <img 
                  src={cms.siteInfo.logoUrl} 
                  alt={cms?.siteInfo?.brandName || 'Store'} 
                  className="h-8 max-w-[170px] object-contain"
                />
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rotate-45 bg-[#8B2628] group-hover:scale-110 transition-transform shrink-0"></span>
                  <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-white uppercase truncate">
                    {cms?.siteInfo?.brandName || 'ZINNIA'}
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-[#9E978C] leading-relaxed max-w-sm">
              {cms?.siteInfo?.description || ''}
            </p>

            <div className="space-y-2 pt-2 text-xs text-[#B5AFA4]">
              {cms?.siteInfo?.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                  <a href={`mailto:${cms.siteInfo.email}`} className="hover:text-white transition-colors">
                    {cms.siteInfo.email}
                  </a>
                </div>
              )}
              {cms?.siteInfo?.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                  <a href={`tel:${cms.siteInfo.phone}`} className="hover:text-white transition-colors">
                    {cms.siteInfo.phone}
                  </a>
                </div>
              )}
              {cms?.siteInfo?.address && (
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                  <span>{cms.siteInfo.address}</span>
                </div>
              )}
              {cms?.siteInfo?.workingHours && (
                <div className="flex items-center gap-2.5">
                  <Clock className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                  <span>{cms.siteInfo.workingHours}</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] text-white uppercase mb-4">
              CUSTOMER CARE
            </h4>
            <ul className="space-y-2.5 text-xs text-[#9E978C]">
              <li>
                <button onClick={() => viewPolicy('contactUs')} className="hover:text-white transition-colors">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('track')} className="hover:text-white transition-colors font-semibold text-[#C59B27]">
                  Track Order
                </button>
              </li>
              <li>
                <button onClick={() => viewPolicy('shippingPolicy')} className="hover:text-white transition-colors">
                  Delivery & Shipping
                </button>
              </li>
              <li>
                <button onClick={() => viewPolicy('refundPolicy')} className="hover:text-white transition-colors">
                  Returns & Exchanges
                </button>
              </li>
              <li>
                <button onClick={() => viewPolicy('refundPolicy')} className="hover:text-white transition-colors">
                  Refund Policy
                </button>
              </li>
              <li>
                <button onClick={() => viewPolicy('aboutUs')} className="hover:text-white transition-colors">
                  Size Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] text-white uppercase mb-4">
              POLICIES
            </h4>
            <ul className="space-y-2.5 text-xs text-[#9E978C]">
              <li>
                <button onClick={() => viewPolicy('aboutUs')} className="hover:text-white transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => viewPolicy('termsAndConditions')} className="hover:text-white transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => viewPolicy('privacyPolicy')} className="hover:text-white transition-colors">
                  Privacy & Cookie Policy
                </button>
              </li>
              <li>
                <button onClick={() => viewPolicy('shippingPolicy')} className="hover:text-white transition-colors">
                  Payment Methods
                </button>
              </li>
              <li>
                <button onClick={() => viewPolicy('contactUs')} className="hover:text-white transition-colors">
                  Complaint Resolution
                </button>
              </li>
              <li>
                <button onClick={() => viewPolicy('aboutUs')} className="hover:text-white transition-colors">
                  Business Information
                </button>
              </li>
            </ul>
          </div>

          {/* Shop & Connect */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] text-white uppercase mb-4">
              SHOP & CONNECT
            </h4>
            <ul className="space-y-2.5 text-xs text-[#9E978C] mb-6">
              <li>
                <button onClick={() => viewCategory('MEN')} className="hover:text-white transition-colors uppercase">
                  MEN
                </button>
              </li>
              <li>
                <button onClick={() => viewCategory('WOMEN')} className="hover:text-white transition-colors uppercase">
                  WOMEN
                </button>
              </li>
              <li>
                <button onClick={() => viewCategory('ACCESSORIES')} className="hover:text-white transition-colors uppercase">
                  ACCESSORIES
                </button>
              </li>
            </ul>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#2C2926] hover:bg-[#8B2628] text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#2C2926] hover:bg-[#8B2628] text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${(cms?.siteInfo?.whatsappNumber || '').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#2C2926] hover:bg-[#2E7D32] text-white flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright & payment disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A7369]">
          <p>© 2026 {cms?.siteInfo?.brandName || 'Zinnia'}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]"></span>
              <span>Cash on Delivery available for eligible orders.</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
