import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, Search, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

export const ShopView: React.FC = () => {
  const { 
    products, 
    selectedCategoryFilter, 
    setSelectedCategoryFilter,
    selectedSubcategoryFilter,
    setSelectedSubcategoryFilter,
    searchQuery,
    setSearchQuery 
  } = useStore();

  const [priceRange, setPriceRange] = useState<number>(3500);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'low-high' | 'high-low' | 'discount'>('recommended');
  const [showMobileFilter, setShowMobileFilter] = useState<boolean>(false);

  // Filter logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedCategoryFilter && selectedCategoryFilter !== 'ALL') {
        if (p.category !== selectedCategoryFilter) return false;
      }

      // Subcategory filter
      if (selectedSubcategoryFilter) {
        if (p.subcategory !== selectedSubcategoryFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Price
      if (p.price > priceRange) return false;

      // Stock
      if (inStockOnly && !p.inStock) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'low-high') return a.price - b.price;
      if (sortBy === 'high-low') return b.price - a.price;
      if (sortBy === 'discount') return b.discountPercent - a.discountPercent;
      return 0; // recommended / default
    });
  }, [products, selectedCategoryFilter, selectedSubcategoryFilter, searchQuery, priceRange, inStockOnly, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategoryFilter(null);
    setSelectedSubcategoryFilter(null);
    setSearchQuery('');
    setPriceRange(3500);
    setInStockOnly(false);
    setSortBy('recommended');
  };

  const categoriesList = ['MEN', 'WOMEN', 'ACCESSORIES'];

  return (
    <div className="min-h-screen bg-[#FCFBF8] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Title */}
        <div className="mb-6 sm:mb-8">
          <div className="text-xs text-[#8C8478] mb-1">
            <span className="hover:text-[#8B2628] cursor-pointer" onClick={handleResetFilters}>Home</span>
            <span className="mx-2">/</span>
            <span className="text-[#2C2926] font-medium">Shop</span>
            {selectedCategoryFilter && (
              <>
                <span className="mx-2">/</span>
                <span className="text-[#8B2628] font-bold">{selectedCategoryFilter}</span>
              </>
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A18]">
            {selectedCategoryFilter ? `${selectedCategoryFilter}'S COLLECTION` : 'ALL COLLECTIONS'}
          </h1>
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden flex items-center justify-between mb-4 pb-3 border-b border-[#EDE9E1]">
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#DED7CB] rounded-lg text-xs font-bold text-[#2C2926]"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#8B2628]" />
            <span>Filter Products</span>
          </button>
          <span className="text-xs text-[#7A7369]">
            {filteredProducts.length} items found
          </span>
        </div>

        {/* Layout: Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Filters Sidebar */}
          <aside className={`lg:block ${showMobileFilter ? 'block' : 'hidden'} bg-white border border-[#EDE9E1] rounded-2xl p-5 sm:p-6 shadow-xs space-y-6`}>
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
              <h3 className="font-serif text-base font-bold text-[#1C1A18] flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#8B2628]" />
                <span>FILTERS</span>
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-[#8B2628] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Price Range Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#4A443D] mb-2">
                <span>Price Range</span>
                <span className="text-[#8B2628]">Up to Tk {priceRange}</span>
              </div>
              <input
                type="range"
                min="400"
                max="3500"
                step="50"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#8B2628] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#9E978C] mt-1 font-medium">
                <span>Tk 400</span>
                <span>Tk 3,500</span>
              </div>
              <p className="text-[10px] text-[#8C8478] mt-1.5">
                Filter products up to your selected budget.
              </p>
            </div>

            {/* Categories Selection */}
            <div>
              <h4 className="text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-2.5">
                Categories
              </h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 text-xs text-[#4A443D] cursor-pointer hover:text-[#8B2628]">
                  <input
                    type="radio"
                    name="category"
                    checked={!selectedCategoryFilter || selectedCategoryFilter === 'ALL'}
                    onChange={() => {
                      setSelectedCategoryFilter(null);
                      setSelectedSubcategoryFilter(null);
                    }}
                    className="accent-[#8B2628]"
                  />
                  <span>All Categories</span>
                </label>
                {categoriesList.map(cat => (
                  <label key={cat} className="flex items-center gap-2.5 text-xs text-[#4A443D] cursor-pointer hover:text-[#8B2628]">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategoryFilter === cat}
                      onChange={() => {
                        setSelectedCategoryFilter(cat);
                        setSelectedSubcategoryFilter(null);
                      }}
                      className="accent-[#8B2628]"
                    />
                    <span className="font-medium">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* In Stock Availability */}
            <div className="pt-2 border-t border-[#F2ECE1]">
              <h4 className="text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-2.5">
                Availability
              </h4>
              <label className="flex items-center gap-2.5 text-xs text-[#4A443D] cursor-pointer hover:text-[#8B2628]">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="accent-[#8B2628] rounded-xs"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* Right Product Grid Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Top Toolbar */}
            <div className="bg-white border border-[#EDE9E1] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              
              {/* Search input in shop toolbar */}
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#2C2926] placeholder-[#9E978C] focus:outline-none focus:border-[#8B2628]"
                />
                <Search className="w-4 h-4 text-[#9E978C] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                {/* Count */}
                <span className="text-xs text-[#7A7369] shrink-0">
                  Showing <span className="font-bold text-[#1C1A18]">{filteredProducts.length}</span> of {products.length} products
                </span>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-semibold text-[#2C2926] rounded-lg px-3 py-2 focus:outline-none focus:border-[#8B2628] cursor-pointer"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="low-high">Price: Low to High</option>
                    <option value="high-low">Price: High to Low</option>
                    <option value="discount">Biggest Discount</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-[#EDE9E1] rounded-2xl p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF5EE] border border-[#E8E1D5] flex items-center justify-center text-[#8B2628] mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1C1A18]">
                  No products matched your criteria
                </h3>
                <p className="text-xs text-[#7A7369] max-w-sm mx-auto">
                  Try clearing your search query or increasing your budget slider.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-[#8B2628] text-white rounded-lg text-xs font-bold hover:bg-[#721E20] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
