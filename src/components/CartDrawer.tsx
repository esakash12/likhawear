import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    updateCartQty, 
    removeFromCart, 
    cartSubtotal, 
    cartCount,
    setCurrentView,
    products,
    getVariantStock
  } = useStore();

  const getItemStockStatus = (productId: string, selectedColor: string, selectedSize: string) => {
    const prod = products.find(p => String(p.id) === String(productId));
    if (!prod || !prod.inStock) {
      return { isOut: true, available: 0 };
    }
    const available = getVariantStock(prod, selectedColor, selectedSize);
    return {
      isOut: available <= 0,
      available
    };
  };

  const hasOutOfStockItems = cart.some(item => {
    const status = getItemStockStatus(item.productId, item.selectedColor, item.selectedSize);
    return status.isOut || item.quantity > status.available;
  });

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-backdrop"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col z-10 animate-drawer-right">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#EDE9E1] flex items-center justify-between bg-[#FCFBF8]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#8B2628]" />
              <h2 className="font-serif text-lg font-bold text-[#1C1A18]">
                Shopping Cart ({cartCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full text-[#7A7369] hover:text-[#1C1A18] hover:bg-[#F2ECE1] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-[#EDE9E1]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF5EE] border border-[#E8E1D5] flex items-center justify-center text-[#8B2628]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1C1A18]">
                  Your cart is empty
                </h3>
                <p className="text-xs text-[#7A7369] max-w-xs">
                  Discover our stylish collections and add your favorite items.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setCurrentView('shop');
                  }}
                  className="px-6 py-2.5 bg-[#8B2628] text-white rounded-lg text-xs font-bold hover:bg-[#721E20] transition-colors"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              cart.map((item, idx) => {
                const stockStatus = getItemStockStatus(item.productId, item.selectedColor, item.selectedSize);
                const isAtMaxStock = item.quantity >= stockStatus.available;
                return (
                  <div key={`${item.productId}-${item.selectedColor}-${item.selectedSize}-${idx}`} className="py-4 flex gap-3 sm:gap-4 items-center">
                    <img
                      src={item.image}
                      alt={item.title}
                      className={`w-18 h-20 sm:w-20 sm:h-22 object-cover rounded-lg border border-[#EDE9E1] shrink-0 ${
                        stockStatus.isOut ? 'grayscale-[50%] opacity-80' : ''
                      }`}
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-[#1C1A18] truncate">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-[#7A7369] mt-0.5">
                        Color: <span className="font-medium text-[#2C2926]">{item.selectedColor}</span> • Size: <span className="font-medium text-[#2C2926]">{item.selectedSize}</span>
                      </p>
                      <div className="text-xs font-bold text-[#8B2628] mt-1 flex items-center gap-2">
                        <span>Tk {item.price}</span>
                        {item.quantity > 1 && (
                          <span className="text-[11px] text-[#7A7369] font-normal">
                            (Total: Tk {item.price * item.quantity})
                          </span>
                        )}
                      </div>

                      {/* Out of Stock Warning Tag */}
                      {stockStatus.isOut ? (
                        <div className="mt-1 text-[11px] font-bold text-[#C62828] bg-[#FFEBEE] px-2 py-0.5 rounded border border-[#FFCDD2] inline-block">
                          ⚠️ Out of stock! Please remove.
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-[#7A7369]">
                            Available: <span className="font-semibold text-[#2C2926]">{stockStatus.available}</span>
                          </span>
                          {isAtMaxStock && (
                            <span className="text-[10px] text-[#A66800] bg-[#FFF8E1] px-1.5 py-0.2 rounded border border-[#FFE082] font-semibold">
                              Max available
                            </span>
                          )}
                        </div>
                      )}

                      {/* Quantity controls */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-[#DED7CB] rounded-md bg-[#FAF8F5]">
                          <button
                            onClick={() => updateCartQty(item.productId, item.selectedColor, item.selectedSize, -1)}
                            className="p-1 hover:bg-[#F0ECE3] text-[#4A443D] transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-[#1C1A18]">
                            {item.quantity}
                          </span>
                          <button
                            disabled={stockStatus.isOut || isAtMaxStock}
                            onClick={() => updateCartQty(item.productId, item.selectedColor, item.selectedSize, 1)}
                            className={`p-1 hover:bg-[#F0ECE3] text-[#4A443D] transition-colors ${
                              (stockStatus.isOut || isAtMaxStock) ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            title={isAtMaxStock ? `Max available stock reached (${stockStatus.available})` : 'Add 1 more'}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.productId, item.selectedColor, item.selectedSize)}
                          className="text-[#9E978C] hover:text-[#8B2628] p-1 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 bg-[#FCFBF8] border-t border-[#EDE9E1] space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#7A7369] font-medium">Subtotal</span>
                <span className="font-serif font-bold text-lg text-[#1C1A18]">
                  Tk {cartSubtotal}
                </span>
              </div>
              <p className="text-[11px] text-[#8C8478]">
                Shipping, discounts, and district courier fees are calculated at checkout.
              </p>

              {hasOutOfStockItems ? (
                <div className="space-y-2">
                  <div className="p-2.5 bg-[#FFF0F0] border border-[#FFD6D6] rounded-lg text-xs font-bold text-[#C62828] text-center">
                    Please remove out-of-stock items before checking out.
                  </div>
                  <button
                    disabled
                    className="w-full py-3.5 bg-[#E8E4DC] text-[#8C8478] rounded-lg text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <span>CANNOT CHECKOUT (OUT OF STOCK ITEMS)</span>
                  </button>
                </div>
              ) : (
                <button
                  id="btn-drawer-checkout"
                  onClick={() => {
                    setIsCartOpen(false);
                    setCurrentView('checkout');
                  }}
                  className="w-full py-3.5 bg-[#8B2628] hover:bg-[#721E20] text-white rounded-lg text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => setIsCartOpen(false)}
                className="w-full py-2 text-center text-xs font-semibold text-[#7A7369] hover:text-[#2C2926]"
              >
                Continue Shopping
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
