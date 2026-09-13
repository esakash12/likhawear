import React from 'react';
import { X, Heart, Trash2, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const WishlistDrawer: React.FC = () => {
  const { 
    isWishlistOpen, 
    setIsWishlistOpen, 
    wishlist, 
    products, 
    toggleWishlist, 
    addToCart,
    viewProduct,
    setCurrentView 
  } = useStore();

  if (!isWishlistOpen) return null;

  const favoritedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-backdrop"
        onClick={() => setIsWishlistOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col z-10 animate-drawer-right">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#EDE9E1] flex items-center justify-between bg-[#FCFBF8]">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#8B2628] fill-[#8B2628]" />
              <h2 className="font-serif text-lg font-bold text-[#1C1A18]">
                Wishlist ({favoritedProducts.length})
              </h2>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-1.5 rounded-full text-[#7A7369] hover:text-[#1C1A18] hover:bg-[#F2ECE1] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-[#F2ECE1]">
            {favoritedProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF5EE] border border-[#E8E1D5] flex items-center justify-center text-[#8B2628]">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1C1A18]">
                  Your wishlist is empty
                </h3>
                <p className="text-xs text-[#7A7369] max-w-xs">
                  Save items you love so you can easily purchase them later.
                </p>
                <button
                  onClick={() => {
                    setIsWishlistOpen(false);
                    setCurrentView('shop');
                  }}
                  className="px-6 py-2.5 bg-[#8B2628] text-white rounded-lg text-xs font-bold hover:bg-[#721E20] transition-colors"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              favoritedProducts.map((product) => (
                <div key={product.id} className="py-4 flex gap-3 sm:gap-4 items-center">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    onClick={() => {
                      setIsWishlistOpen(false);
                      viewProduct(product.slug);
                    }}
                    className="w-18 h-20 sm:w-20 sm:h-22 object-cover rounded-lg border border-[#EDE9E1] shrink-0 cursor-pointer"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 
                      onClick={() => {
                        setIsWishlistOpen(false);
                        viewProduct(product.slug);
                      }}
                      className="text-xs sm:text-sm font-semibold text-[#1C1A18] truncate cursor-pointer hover:text-[#8B2628]"
                    >
                      {product.title}
                    </h4>
                    <p className="text-[11px] text-[#7A7369] mt-0.5">
                      {product.category} • {product.subcategory}
                    </p>
                    <div className="text-xs font-bold text-[#8B2628] mt-1">
                      Tk {product.price}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => addToCart(product)}
                        className="px-3 py-1.5 bg-[#8B2628] hover:bg-[#721E20] text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>

                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="p-1.5 text-[#9E978C] hover:text-[#8B2628] rounded border border-[#EDE9E1] transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
