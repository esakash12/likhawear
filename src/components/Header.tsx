import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Heart, 
  ShoppingBag, 
  Truck, 
  Menu, 
  X, 
  ChevronDown, 
  ShieldAlert, 
  Phone, 
  UserCheck, 
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { 
    cms, 
    cartCount, 
    wishlist, 
    setIsCartOpen, 
    setIsWishlistOpen, 
    setIsAuthModalOpen, 
    setCurrentView,
    viewCategory,
    viewProduct,
    categories,
    products,
    currentView,
    customerUser,
    isCustomerLoggedIn
  } = useStore();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState<typeof products>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (menu: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  // Live search filter
  useEffect(() => {
    if (query.trim().length > 1) {
      const q = query.toLowerCase();
      const results = products.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      ).slice(0, 5);
      setFilteredResults(results);
    } else {
      setFilteredResults([]);
    }
  }, [query, products]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setCurrentView('shop');
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FCFBF8]/95 backdrop-blur-md border-b border-[#EDE9E1] transition-all duration-200">
      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile hamburger */}
          <button
            id="btn-mobile-menu"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-[#2C2926] hover:bg-[#F2ECE1] transition-colors focus:outline-none shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Brand Logo - Fixed Sizing & Anti-Blowup Layout */}
          <div 
            onClick={() => setCurrentView('home')} 
            className="cursor-pointer flex flex-col items-center justify-center select-none group text-center max-w-[160px] sm:max-w-[210px] md:max-w-[240px] px-1 shrink-0"
          >
            {cms?.siteInfo?.logoUrl ? (
              <img 
                src={cms.siteInfo.logoUrl} 
                alt={cms?.siteInfo?.brandName || 'Logo'} 
                className="h-8 sm:h-10 md:h-11 max-w-[140px] sm:max-w-[190px] md:max-w-[220px] object-contain group-hover:opacity-90 transition-opacity"
              />
            ) : (
              <>
                <div className="flex items-center justify-center gap-1.5 w-full">
                  <span className="w-2 h-2 rotate-45 bg-[#8B2628] shrink-0 group-hover:scale-110 transition-transform hidden sm:inline-block"></span>
                  <h1 
                    className={`font-serif font-bold text-[#1C1A18] group-hover:text-[#8B2628] transition-colors uppercase truncate max-w-full leading-tight ${
                      (cms?.siteInfo?.brandName || '').length > 9 
                        ? 'text-base sm:text-lg md:text-xl tracking-wider' 
                        : 'text-lg sm:text-2xl tracking-[0.15em]'
                    }`}
                    title={cms?.siteInfo?.brandName}
                  >
                    {cms?.siteInfo?.brandName || 'ZINNIA'}
                  </h1>
                  <span className="w-2 h-2 rotate-45 bg-[#8B2628] shrink-0 group-hover:scale-110 transition-transform hidden sm:inline-block"></span>
                </div>
                {cms?.siteInfo?.brandSubtitle && (
                  <span className="text-[8px] sm:text-[9px] tracking-[0.25em] text-[#7A7369] font-semibold uppercase truncate max-w-full -mt-0.5">
                    {cms.siteInfo.brandSubtitle}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-6 relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search products, saree, kurti, shirt, perfume..."
                className="w-full pl-4 pr-11 py-2.5 bg-white border border-[#DDD7CD] rounded-full text-sm text-[#2C2926] placeholder-[#9E978C] focus:outline-none focus:border-[#8B2628] focus:ring-1 focus:ring-[#8B2628] shadow-sm transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#8B2628] text-white flex items-center justify-center hover:bg-[#721E20] transition-colors"
                aria-label="Submit search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Live Search Popup */}
            {searchOpen && filteredResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-[#EDE9E1] overflow-hidden z-50 animate-dropdown">
                <div className="p-2 border-b border-[#F4F0E8] text-xs font-semibold text-[#8C8478] uppercase tracking-wider px-3">
                  Products ({filteredResults.length})
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-[#F6F3ED]">
                  {filteredResults.map(prod => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        viewProduct(prod.slug);
                        setSearchOpen(false);
                        setQuery('');
                      }}
                      className="p-3 flex items-center gap-3 hover:bg-[#FDFBF7] cursor-pointer transition-colors"
                    >
                      <img 
                        src={prod.images[0]} 
                        alt={prod.title} 
                        className="w-12 h-12 object-cover rounded-md border border-[#EDE9E1]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#2C2926] truncate">{prod.title}</p>
                        <p className="text-xs text-[#8C8478]">{prod.category} • {prod.subcategory}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-[#8B2628]">Tk {prod.price}</span>
                        {prod.compareAtPrice > prod.price && (
                          <span className="text-xs text-[#9E978C] line-through block">Tk {prod.compareAtPrice}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div 
                  onClick={() => {
                    setCurrentView('shop');
                    setSearchOpen(false);
                  }}
                  className="p-2.5 bg-[#FAF7F2] hover:bg-[#F2ECE1] text-center text-xs font-semibold text-[#8B2628] cursor-pointer border-t border-[#EDE9E1]"
                >
                  View All Products →
                </div>
              </div>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Track Order Button */}
            <button
              id="btn-track-order-header"
              onClick={() => setCurrentView('track')}
              className={`hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold transition-colors ${
                currentView === 'track'
                  ? 'bg-[#8B2628] text-white border-[#8B2628]'
                  : 'border-[#DED8CE] bg-white/80 hover:bg-[#F7F4EE] text-[#4A443D]'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track your order</span>
            </button>

            {/* Sign In / Customer Account */}
            {isCustomerLoggedIn && customerUser ? (
              <button
                id="btn-customer-account"
                onClick={() => setCurrentView('customer-dashboard')}
                className="btn-press flex items-center gap-2 text-xs font-bold text-[#1C1A18] hover:text-[#8B2628] px-3 py-1.5 rounded-full border border-[#DDD5C7] bg-white/90 hover:bg-[#FAF8F5] transition-all cursor-pointer shadow-xs"
                title="View My Account & Orders"
              >
                {customerUser.avatar ? (
                  <img src={customerUser.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#8B2628] text-white flex items-center justify-center text-[10px] font-bold">
                    {customerUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline truncate max-w-[110px]">
                  {customerUser.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                id="btn-auth-header"
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-press flex items-center gap-1.5 text-xs font-semibold text-[#4A443D] hover:text-[#8B2628] p-2 transition-colors cursor-pointer"
              >
                <UserCheck className="w-5 h-5" />
                <span className="hidden xl:inline">Sign In</span>
              </button>
            )}

            {/* Wishlist */}
            <button
              id="btn-wishlist-header"
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2 text-[#4A443D] hover:text-[#8B2628] transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#8B2628] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="btn-cart-header"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#4A443D] hover:text-[#8B2628] transition-colors flex items-center gap-2"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#8B2628] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search input row */}
        <div className="mt-2.5 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-3 pr-10 py-2 bg-white border border-[#DDD7CD] rounded-lg text-xs text-[#2C2926] placeholder-[#9E978C] focus:outline-none focus:border-[#8B2628]"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8B2628]"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* 3. Secondary Navigation Bar (Desktop Mega Menu) */}
      <nav className="hidden lg:block bg-white border-t border-[#EDE9E1] text-[#2C2926]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-11 text-xs font-semibold tracking-wider">
            <div className="flex items-center space-x-8">
              {/* All Categories Button */}
              <div 
                className="relative py-2.5 cursor-pointer flex items-center gap-1.5 text-[#8B2628] font-bold"
                onClick={() => {
                  setCurrentView('shop');
                  viewCategory('ALL');
                }}
              >
                <Menu className="w-4 h-4" />
                <span>ALL CATEGORIES</span>
              </div>

              {/* MEN Mega Menu */}
              <div 
                className="relative py-2.5 cursor-pointer"
                onMouseEnter={() => handleMouseEnter('men')}
                onMouseLeave={handleMouseLeave}
              >
                <div 
                  onClick={() => viewCategory('MEN')}
                  className="flex items-center gap-1 hover:text-[#8B2628] transition-colors uppercase"
                >
                  <span>MEN</span>
                  <ChevronDown className="w-3 h-3 text-[#9E978C]" />
                </div>

                {/* Dropdown panel */}
                {activeDropdown === 'men' && (
                  <div className="absolute top-full left-0 w-80 bg-white border border-[#EDE9E1] shadow-2xl rounded-b-xl p-5 z-50 animate-dropdown">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-[11px] font-bold text-[#8B2628] uppercase tracking-wider mb-2">Topwear</h4>
                        <ul className="space-y-2 text-[#5A534A] text-xs">
                          <li 
                            onClick={() => viewCategory('MEN', 'Polo T-Shirts')} 
                            className="hover:text-[#8B2628] transition-colors"
                          >
                            Polo T-Shirts
                          </li>
                          <li 
                            onClick={() => viewCategory('MEN', 'Casual Shirts')} 
                            className="hover:text-[#8B2628] transition-colors"
                          >
                            Casual Shirts
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold text-[#8B2628] uppercase tracking-wider mb-2">Bottomwear</h4>
                        <ul className="space-y-2 text-[#5A534A] text-xs">
                          <li 
                            onClick={() => viewCategory('MEN', 'Jeans & Pants')} 
                            className="hover:text-[#8B2628] transition-colors"
                          >
                            Jeans & Pants
                          </li>
                          <li 
                            onClick={() => viewCategory('ACCESSORIES', 'Watches')} 
                            className="hover:text-[#8B2628] transition-colors"
                          >
                            Watches
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div 
                      onClick={() => viewCategory('MEN')}
                      className="mt-4 pt-3 border-t border-[#F2ECE1] text-[11px] font-bold text-[#8B2628] flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      <span>Explore all Men's Collection</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </div>

              {/* WOMEN Mega Menu */}
              <div 
                className="relative py-2.5 cursor-pointer"
                onMouseEnter={() => handleMouseEnter('women')}
                onMouseLeave={handleMouseLeave}
              >
                <div 
                  onClick={() => viewCategory('WOMEN')}
                  className="flex items-center gap-1 hover:text-[#8B2628] transition-colors uppercase"
                >
                  <span>WOMEN</span>
                  <ChevronDown className="w-3 h-3 text-[#9E978C]" />
                </div>

                {/* Dropdown panel */}
                {activeDropdown === 'women' && (
                  <div className="absolute top-full left-0 w-96 bg-white border border-[#EDE9E1] shadow-2xl rounded-b-xl p-5 z-50 animate-dropdown">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-[11px] font-bold text-[#8B2628] uppercase tracking-wider mb-2">Clothing</h4>
                        <ul className="space-y-2 text-[#5A534A] text-xs">
                          <li 
                            onClick={() => viewCategory('WOMEN', 'Dresses')} 
                            className="hover:text-[#8B2628] transition-colors"
                          >
                            Dresses
                          </li>
                          <li 
                            onClick={() => viewCategory('WOMEN', 'Tops')} 
                            className="hover:text-[#8B2628] transition-colors"
                          >
                            Tops
                          </li>
                          <li 
                            onClick={() => viewCategory('WOMEN', 'Sarees')} 
                            className="hover:text-[#8B2628] transition-colors"
                          >
                            Sarees
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold text-[#8B2628] uppercase tracking-wider mb-2">Footwear</h4>
                        <ul className="space-y-2 text-[#5A534A] text-xs">
                          <li 
                            onClick={() => viewCategory('WOMEN', 'Heels & Sandals')} 
                            className="hover:text-[#8B2628] transition-colors"
                          >
                            Heels & Sandals
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold text-[#8B2628] uppercase tracking-wider mb-2">Bags</h4>
                        <ul className="space-y-2 text-[#5A534A] text-xs">
                          <li 
                            onClick={() => viewCategory('ACCESSORIES', 'Bags')} 
                            className="hover:text-[#8B2628] transition-colors"
                          >
                            Handbags
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div 
                      onClick={() => viewCategory('WOMEN')}
                      className="mt-4 pt-3 border-t border-[#F2ECE1] text-[11px] font-bold text-[#8B2628] flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      <span>Explore all Women's Collection</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </div>

              {/* ACCESSORIES Mega Menu */}
              <div 
                className="relative py-2.5 cursor-pointer"
                onMouseEnter={() => handleMouseEnter('accessories')}
                onMouseLeave={handleMouseLeave}
              >
                <div 
                  onClick={() => viewCategory('ACCESSORIES')}
                  className="flex items-center gap-1 hover:text-[#8B2628] transition-colors uppercase"
                >
                  <span>ACCESSORIES</span>
                  <ChevronDown className="w-3 h-3 text-[#9E978C]" />
                </div>

                {/* Dropdown panel */}
                {activeDropdown === 'accessories' && (
                  <div className="absolute top-full left-0 w-80 bg-white border border-[#EDE9E1] shadow-2xl rounded-b-xl p-5 z-50 animate-dropdown">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-[11px] font-bold text-[#8B2628] uppercase tracking-wider mb-2">Fashion Accessories</h4>
                        <ul className="space-y-2 text-[#5A534A] text-xs">
                          <li 
                            onClick={() => viewCategory('ACCESSORIES', 'Wallets')} 
                            className="hover:text-[#8B2628] transition-colors"
                          >
                            Wallets
                          </li>
                          <li 
                            onClick={() => viewCategory('ACCESSORIES', 'Belts')} 
                            className="hover:text-[#8B2628] transition-colors"
                          >
                            Belts
                          </li>
                          <li 
                            onClick={() => viewCategory('ACCESSORIES', 'Sunglasses')} 
                            className="hover:text-[#8B2628] transition-colors"
                          >
                            Sunglasses
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold text-[#8B2628] uppercase tracking-wider mb-2">Beauty</h4>
                        <ul className="space-y-2 text-[#5A534A] text-xs">
                          <li 
                            onClick={() => viewCategory('ACCESSORIES', 'Perfumes')} 
                            className="hover:text-[#8B2628] transition-colors"
                          >
                            Perfumes
                          </li>
                          <li 
                            onClick={() => viewCategory('ACCESSORIES', 'Body Mists')} 
                            className="hover:text-[#8B2628] transition-colors"
                          >
                            Body Mists
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div 
                      onClick={() => viewCategory('ACCESSORIES')}
                      className="mt-4 pt-3 border-t border-[#F2ECE1] text-[11px] font-bold text-[#8B2628] flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      <span>Explore all Accessories</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick contact / Support hours */}
            <div className="flex items-center gap-4 text-[#7A7369] font-normal">
              <span className="flex items-center gap-1.5 text-xs">
                <Phone className="w-3 h-3 text-[#8B2628]" />
                <span className="font-semibold text-[#2C2926]">{cms?.siteInfo?.phone || ''}</span>
              </span>
              <span className="text-[11px] text-[#8C8478]">
                Sat - Thu, 10 AM - 8 PM
              </span>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
