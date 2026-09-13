import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Truck, 
  ShieldCheck, 
  MessageCircle, 
  ZoomIn, 
  ChevronRight,
  Share2,
  Check
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ProductDetailView: React.FC = () => {
  const { 
    products, 
    selectedProductSlug, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    setCurrentView, 
    setZoomedImageUrl, 
    cms, 
    showToast,
    getVariantStock,
    cart
  } = useStore();

  const product = products.find(p => p.slug === selectedProductSlug) || products[0];

  const [selectedColor, setSelectedColor] = useState<string>(
    product?.colors[0]?.name || 'Standard'
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product?.sizes[0] || 'Standard'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);

  if (!product) {
    return (
      <div className="min-h-screen py-20 text-center">
        <p className="text-sm text-[#7A7369]">Product not found.</p>
        <button 
          onClick={() => setCurrentView('shop')}
          className="mt-4 px-6 py-2 bg-[#8B2628] text-white rounded-lg text-xs font-bold"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);

  // Variant Matrix stock & price resolution
  const availableStock = getVariantStock(product, selectedColor, selectedSize);
  const currentVariant = product.variants?.find(
    v => (!v.color || v.color.trim().toLowerCase() === selectedColor.trim().toLowerCase()) &&
         (!v.size || v.size.trim().toLowerCase() === selectedSize.trim().toLowerCase())
  );
  const isOutOfStock = !product.inStock || availableStock <= 0;
  const currentUnitPrice = product.price + (currentVariant?.additionalPrice || 0);

  const getStockForVariant = (color: string, size: string) => {
    return getVariantStock(product, color, size);
  };

  const itemInCart = cart.find(
    item =>
      String(item.productId) === String(product.id) &&
      item.selectedColor.trim().toLowerCase() === selectedColor.trim().toLowerCase() &&
      item.selectedSize.trim().toLowerCase() === selectedSize.trim().toLowerCase()
  );
  const qtyInCart = itemInCart ? itemInCart.quantity : 0;
  const remainingCanAdd = Math.max(0, availableStock - qtyInCart);
  const isCartLimitReached = availableStock > 0 && remainingCanAdd <= 0;

  // Automatically clamp quantity if variant stock changes or user selects variant with less stock
  useEffect(() => {
    if (remainingCanAdd > 0 && quantity > remainingCanAdd) {
      setQuantity(remainingCanAdd);
    } else if (remainingCanAdd <= 0) {
      setQuantity(1);
    }
  }, [availableStock, remainingCanAdd, selectedColor, selectedSize]);

  // When color changes, if the color has a dedicated image, set it
  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    const colorObj = product.colors.find(c => c.name === colorName);
    if (colorObj?.image) {
      const idx = product.images.indexOf(colorObj.image);
      if (idx !== -1) setActiveImageIdx(idx);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (isCartLimitReached) {
      showToast(`Cannot add more. You already have all ${availableStock} available item(s) in your cart.`);
      return;
    }
    addToCart(product, selectedColor, selectedSize, quantity);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    if (isCartLimitReached) {
      showToast(`Cannot add more. You already have all ${availableStock} available item(s) in your cart.`);
      return;
    }
    const added = addToCart(product, selectedColor, selectedSize, quantity);
    if (added) {
      setCurrentView('checkout');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOrderOnWhatsApp = () => {
    const rawTemplate = cms?.siteInfo?.whatsappTemplate || 
      "Hello {brand_name}! I would like to {action}:\nProduct: {product_title}\nColor: {color}\nSize: {size}\nQuantity: {quantity}\nPrice: Tk {price}\nURL: {product_url}";

    const brandName = cms?.siteInfo?.brandName || 'Zinnia';
    const action = isOutOfStock ? 'inquire about restock of' : 'order';
    const productUrl = `${window.location.origin}/#product/${product.slug}`;
    const totalPrice = `${currentUnitPrice * quantity}`;

    const formattedMessage = rawTemplate
      .replace(/\{brand_name\}/g, brandName)
      .replace(/\{product_title\}/g, product.title)
      .replace(/\{color\}/g, selectedColor || 'Standard')
      .replace(/\{size\}/g, selectedSize || 'Regular')
      .replace(/\{quantity\}/g, String(quantity))
      .replace(/\{price\}/g, totalPrice)
      .replace(/\{product_url\}/g, productUrl)
      .replace(/\{action\}/g, action);

    const text = encodeURIComponent(formattedMessage);
    const waNum = (cms?.siteInfo?.whatsappNumber || '').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${waNum}?text=${text}`, '_blank');
  };

  const currentImage = product.images[activeImageIdx] || product.images[0];

  return (
    <div className="min-h-screen bg-[#FCFBF8] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-[#8C8478] mb-8">
          <span 
            onClick={() => setCurrentView('home')} 
            className="hover:text-[#8B2628] cursor-pointer"
          >
            Home
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span 
            onClick={() => setCurrentView('shop')} 
            className="hover:text-[#8B2628] cursor-pointer"
          >
            Shop
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#8B2628] font-semibold">{product.category}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#2C2926] font-medium truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Product Hero Grid: Gallery (Left) & Buy Box (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          
          {/* Left Column: Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-white border border-[#EDE9E1] shadow-xs group aspect-square max-h-[580px] flex items-center justify-center">
              <img
                key={currentImage}
                src={currentImage}
                alt={product.title}
                className="w-full h-full object-contain p-2 sm:p-4 animate-crossfade"
              />

              {/* Discount badge */}
              {product.discountPercent > 0 && (
                <span className="absolute top-4 left-4 bg-[#FFF0F0] text-[#8B2628] border border-[#FFD6D6] text-xs font-bold px-2.5 py-1 rounded-md tracking-wider shadow-xs">
                  SAVE {product.discountPercent}%
                </span>
              )}

              {/* Zoom trigger icon */}
              <button
                onClick={() => setZoomedImageUrl(currentImage)}
                className="absolute bottom-4 right-4 p-2.5 rounded-full bg-white/90 hover:bg-white text-[#2C2926] hover:text-[#8B2628] shadow-md transition-all cursor-pointer"
                title="Zoom image"
              >
                <ZoomIn className="w-5 h-5" />
              </button>

              {/* Image counter indicator */}
              <div className="absolute bottom-4 left-4 bg-black/60 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-xs">
                {activeImageIdx + 1} / {(product.images || []).length || 1}
              </div>
            </div>

            {/* Thumbnails Row */}
            {(product.images || []).length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {(product.images || []).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 bg-white shrink-0 transition-all ${
                      activeImageIdx === i 
                        ? 'border-[#8B2628] shadow-md ring-2 ring-[#8B2628]/20' 
                        : 'border-[#EDE9E1] hover:border-[#DDD4C7] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Purchasing Controls */}
          <div className="lg:col-span-5 bg-white border border-[#EDE9E1] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            
            {/* Category, SKU & Stock Status Badge */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-[#FAF5EE] text-[#8B2628] text-xs font-bold rounded-full tracking-wider uppercase">
                  {product.category}
                </span>
                <span className="text-xs text-[#7A7369]">SKU: {product.sku}</span>
                {isOutOfStock ? (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] uppercase tracking-wider">
                    Out of Stock
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] uppercase tracking-wider">
                    In Stock ({availableStock} left)
                  </span>
                )}
              </div>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2 rounded-full border transition-all ${
                  isFavorited
                    ? 'bg-[#8B2628] text-white border-[#8B2628]'
                    : 'border-[#DDD5C7] text-[#7A7369] hover:text-[#8B2628] hover:bg-[#FAF8F5]'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* Title */}
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A18] leading-tight">
              {product.title}
            </h1>

            {/* Price Line */}
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1C1A18]">
                Tk {currentUnitPrice}
              </span>
              {product.compareAtPrice > currentUnitPrice && (
                <span className="text-base text-[#8C8478] line-through">
                  Tk {product.compareAtPrice}
                </span>
              )}
              {product.compareAtPrice > currentUnitPrice && (
                <span className="text-xs font-bold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded-sm">
                  Save Tk {product.compareAtPrice - currentUnitPrice}
                </span>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-xs sm:text-sm text-[#5C5549] leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* Choose Color */}
            {(product.colors || []).length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#4A443D] uppercase tracking-wider">
                  Choose color
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {(product.colors || []).map(col => {
                    const isSelected = selectedColor === col.name;
                    return (
                      <button
                        key={col.name}
                        onClick={() => handleColorSelect(col.name)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                          isSelected
                            ? 'border-[#8B2628] bg-[#FAF5EE] text-[#8B2628] shadow-xs'
                            : 'border-[#DDD5C7] bg-white text-[#4A443D] hover:border-[#8B2628]'
                        }`}
                      >
                        <span 
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" 
                          style={{ backgroundColor: col.hex }}
                        />
                        <span>{col.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Choose Size */}
            {(product.sizes || []).length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#4A443D] uppercase tracking-wider">
                    Choose size
                  </span>
                  {product.variants && product.variants.length > 0 && (
                    <span className="text-[11px] text-[#8C8478]">
                      Selected variant stock: {availableStock}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {(product.sizes || []).map(size => {
                    const isSelected = selectedSize === size;
                    const sizeStock = getStockForVariant(selectedColor, size);
                    const isZeroStock = sizeStock <= 0;

                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-10 px-3.5 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer relative ${
                          isSelected
                            ? 'border-[#8B2628] bg-[#8B2628] text-white shadow-xs'
                            : isZeroStock
                              ? 'border-[#E5DFD5] bg-[#F7F5F0] text-[#A39B8F] hover:border-[#DDD5C7]'
                              : 'border-[#DDD5C7] bg-white text-[#4A443D] hover:border-[#8B2628]'
                        }`}
                      >
                        <span>{size}</span>
                        {isZeroStock && (
                          <span className="block text-[9px] font-normal leading-tight text-[#C62828]">
                            Sold out
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Calculation */}
            <div className="space-y-2 pt-2 border-t border-[#F2ECE1]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A443D] uppercase tracking-wider">
                  Quantity
                </span>
                {isOutOfStock ? (
                  <span className="text-xs font-bold text-[#C62828]">
                    Currently Unavailable
                  </span>
                ) : isCartLimitReached ? (
                  <span className="text-xs font-bold text-[#C62828] bg-[#FFEBEE] px-2 py-0.5 rounded border border-[#FFCDD2]">
                    Limit Reached (All {availableStock} in your cart)
                  </span>
                ) : (
                  <div className="text-right">
                    <span className="text-xs font-semibold text-[#2E7D32]">
                      {availableStock} available
                    </span>
                    {qtyInCart > 0 && (
                      <span className="text-[11px] text-[#A66800] block font-medium">
                        ({qtyInCart} in cart, {remainingCanAdd} more can be added)
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className={`flex items-center border border-[#DDD5C7] rounded-lg bg-[#FAF8F5] ${(isOutOfStock || isCartLimitReached) ? 'opacity-40 pointer-events-none' : ''}`}>
                  <button
                    disabled={isOutOfStock || isCartLimitReached}
                    onClick={() => setQuantity(prev => (prev > 1 ? prev - 1 : 1))}
                    className="p-2.5 hover:bg-[#F0ECE3] text-[#4A443D] transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 font-bold text-sm text-[#1C1A18]">
                    {quantity}
                  </span>
                  <button
                    disabled={isOutOfStock || isCartLimitReached || quantity >= remainingCanAdd}
                    onClick={() => setQuantity(prev => (prev < remainingCanAdd ? prev + 1 : prev))}
                    className={`p-2.5 hover:bg-[#F0ECE3] text-[#4A443D] transition-colors ${
                      (isOutOfStock || isCartLimitReached || quantity >= remainingCanAdd) ? 'opacity-30 cursor-not-allowed' : ''
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Subtotal Calculation */}
                <div className="text-right">
                  <span className="text-xs text-[#8C8478] block">
                    Tk {currentUnitPrice} × {quantity}
                  </span>
                  <span className="font-serif text-lg font-bold text-[#8B2628]">
                    Tk {currentUnitPrice * quantity}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Add to Cart, Order on WhatsApp, Buy Now */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                {/* Add to cart / Out of stock */}
                {isOutOfStock ? (
                  <button
                    disabled
                    className="w-full py-3 px-3 bg-[#E8E4DC] text-[#8C8478] border border-[#DDD5C7] rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <span>Out of Stock</span>
                  </button>
                ) : isCartLimitReached ? (
                  <button
                    disabled
                    className="w-full py-3 px-3 bg-[#E8E4DC] text-[#C62828] border border-[#FFCDD2] rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <span>Limit Reached In Cart</span>
                  </button>
                ) : (
                  <button
                    id="btn-add-to-cart"
                    onClick={handleAddToCart}
                    className="btn-press w-full py-3 px-3 bg-[#4A3B32] hover:bg-[#382C25] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add To Cart</span>
                  </button>
                )}

                {/* Order on WhatsApp */}
                <button
                  id="btn-order-whatsapp"
                  onClick={handleOrderOnWhatsApp}
                  className="btn-press w-full py-3 px-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Inquire on WhatsApp' : 'Order on WhatsApp'}</span>
                </button>
              </div>

              {/* Buy Now Primary CTA */}
              {isOutOfStock ? (
                <div className="w-full py-3 bg-[#FFF3F3] border border-[#FFCDD2] text-[#C62828] rounded-lg text-xs font-bold text-center uppercase tracking-wider">
                  ⚠️ This product is currently sold out
                </div>
              ) : (
                <button
                  id="btn-buy-now"
                  onClick={handleBuyNow}
                  className="btn-press w-full py-3.5 bg-[#8B2628] hover:bg-[#721E20] text-white rounded-lg text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <span>⚡ Buy Now</span>
                </button>
              )}
            </div>

            {/* Delivery Estimates */}
            <div className="pt-4 border-t border-[#F2ECE1] space-y-2 text-xs text-[#6B6357]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#8B2628] shrink-0" />
                <span>Delivery estimated in {cms.shipping.estimatedDeliveryDays}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8B2628] shrink-0" />
                <span>Cash on delivery and secure payment options</span>
              </div>
            </div>

          </div>

        </div>

        {/* Product Details Tabs & Specifications (Bottom section as shown in video 00:48-00:51) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-white border border-[#EDE9E1] rounded-2xl p-6 sm:p-10 shadow-xs">
          
          {/* Left: Description & Tags */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#1C1A18] mb-3 pb-2 border-b border-[#F2ECE1]">
                Description
              </h3>
              <p className="text-sm text-[#4A443D] leading-relaxed mb-4">
                {product.descriptionEn}
              </p>
              {product.descriptionBn && (
                <p className="text-sm text-[#5C554B] leading-relaxed bg-[#FAF8F5] p-4 rounded-xl border border-[#EDE9E1]">
                  {product.descriptionBn}
                </p>
              )}
            </div>

            {/* Tags Pills */}
            {Array.isArray(product.tags) && product.tags.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-[#8C8478] uppercase tracking-wider mb-2">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, tIdx) => (
                    <span 
                      key={tIdx}
                      className="px-2.5 py-1 bg-[#F2ECE1] text-[#4A443D] text-[11px] font-medium rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Specifications & Product Info Tables */}
          <div className="lg:col-span-5 space-y-6">
            {/* Specification Table */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1C1A18] mb-3 pb-2 border-b border-[#F2ECE1]">
                  Specification
                </h3>
                <div className="divide-y divide-[#F2ECE1] text-xs">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="py-2.5 flex justify-between gap-4">
                      <span className="font-semibold text-[#6E675D]">{key}</span>
                      <span className="font-bold text-[#1C1A18] text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Information Table */}
            {product.productInfo && Object.keys(product.productInfo).length > 0 && (
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1C1A18] mb-3 pb-2 border-b border-[#F2ECE1]">
                  Product Information
                </h3>
                <div className="divide-y divide-[#F2ECE1] text-xs">
                  {Object.entries(product.productInfo).map(([key, value]) => (
                    <div key={key} className="py-2 flex justify-between gap-4">
                      <span className="font-semibold text-[#6E675D]">{key}</span>
                      <span className="font-bold text-[#1C1A18] text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
