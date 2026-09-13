import React from 'react';
import { ShoppingBag, Heart, Check } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { 
    viewProduct, 
    addToCart, 
    toggleWishlist, 
    isInWishlist 
  } = useStore();

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = !product.inStock || (product.stockCount !== undefined && product.stockCount <= 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => viewProduct(product.slug)}
      className={`card-lift group bg-white rounded-xl sm:rounded-2xl border border-[#EDE8E0] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#DDD4C7] transition-all duration-300 flex flex-col justify-between cursor-pointer ${
        isOutOfStock ? 'opacity-90' : ''
      }`}
    >
      {/* Product Image Area */}
      <div className="relative aspect-square sm:aspect-4/5 overflow-hidden bg-[#F7F5F0]">
        <img
          src={product.images[0]}
          alt={product.title}
          className={`w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out ${
            isOutOfStock ? 'grayscale-[30%]' : ''
          }`}
          loading="lazy"
        />

        {/* Discount badge */}
        {product.discountPercent > 0 && !isOutOfStock && (
          <span className="absolute top-2.5 left-2.5 bg-[#FFF0F0] text-[#8B2628] border border-[#FFD6D6] text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md tracking-wider">
            SAVE {product.discountPercent}%
          </span>
        )}

        {/* Out of Stock Overlay Banner */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none">
            <span className="bg-[#B71C1C] text-white text-[11px] font-extrabold px-3 py-1 rounded shadow-md tracking-wider uppercase">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Wishlist toggle */}
        <button
          onClick={handleToggleWishlist}
          aria-label="Add to wishlist"
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isFavorited
              ? 'bg-[#8B2628] text-white shadow-md'
              : 'bg-white/80 hover:bg-white text-[#5A534A] hover:text-[#8B2628] shadow-xs'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-white' : ''}`} />
        </button>

        {/* Stock status indicator if low */}
        {!isOutOfStock && product.stockCount <= 5 && product.inStock && (
          <span className="absolute bottom-2 left-2 bg-[#FAF7F2]/90 backdrop-blur-xs text-[#8B2628] text-[10px] font-bold px-2 py-0.5 rounded-sm">
            Only {product.stockCount} left!
          </span>
        )}
      </div>

      {/* Details & Pricing */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category */}
          <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-[#9E978C] uppercase">
            {product.category}
          </span>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-[#1C1A18] line-clamp-2 mt-0.5 group-hover:text-[#8B2628] transition-colors leading-snug">
            {product.title}
          </h3>

          {/* Price line */}
          <div className="flex items-baseline gap-2 mt-2 flex-wrap">
            <span className="text-sm sm:text-base font-bold text-[#1C1A18]">
              Tk {product.price}
            </span>
            {product.compareAtPrice > product.price && (
              <>
                <span className="text-xs text-[#9E978C] line-through">
                  Tk {product.compareAtPrice}
                </span>
                <span className="text-[10px] font-bold text-[#2E7D32]">
                  {product.discountPercent}% OFF
                </span>
              </>
            )}
          </div>
        </div>

        {/* Quick Add to Cart Button */}
        {isOutOfStock ? (
          <button
            disabled
            className="w-full py-2 px-3 rounded-lg border border-[#E2DDD5] bg-[#F5F2EC] text-[#9E978C] text-xs font-bold cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <span>Out of Stock</span>
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className="btn-press w-full py-2 px-3 rounded-lg border border-[#DDD5C7] group-hover:border-[#8B2628] bg-[#FDFCF9] group-hover:bg-[#8B2628] text-[#3D372F] group-hover:text-white text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add To Cart</span>
          </button>
        )}
      </div>
    </div>
  );
};
