import React from 'react';
import { CheckCircle, ArrowRight, Package, ShoppingBag, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const OrderSuccessView: React.FC = () => {
  const { recentPlacedOrder, setCurrentView } = useStore();

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 bg-[#FCFBF8]">
      <div className="max-w-xl w-full bg-white border border-[#EDE9E1] rounded-3xl p-8 sm:p-10 text-center shadow-lg space-y-6">
        
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-[#E8F5E9] border-4 border-[#C8E6C9] flex items-center justify-center text-[#2E7D32] mx-auto animate-in zoom-in-75 duration-300">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold tracking-[0.25em] text-[#8B2628] uppercase">
            ORDER CONFIRMED
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#1C1A18] tracking-tight mt-1">
            Thank you for your order!
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7369] mt-2 max-w-sm mx-auto">
            We have received your order and our team has started preparing it for delivery.
          </p>
        </div>

        {/* Order Details Card */}
        {recentPlacedOrder && (
          <div className="bg-[#FAF8F5] border border-[#EDE9E1] rounded-2xl p-5 text-left text-xs space-y-2.5">
            <div className="flex justify-between items-center pb-2 border-b border-[#E8E1D5]">
              <span className="text-[#7A7369]">Order ID:</span>
              <span className="font-mono font-bold text-[#8B2628] text-sm">{recentPlacedOrder.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#7A7369]">Customer:</span>
              <span className="font-semibold text-[#1C1A18]">{recentPlacedOrder.customerName} ({recentPlacedOrder.phone})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#7A7369]">Delivery Destination:</span>
              <span className="font-semibold text-[#1C1A18]">{recentPlacedOrder.area}, {recentPlacedOrder.district}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#7A7369]">Payment Mode:</span>
              <span className="font-semibold text-[#2E7D32]">
                {recentPlacedOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Mobile Banking'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[#E8E1D5]">
              <span className="font-bold text-[#1C1A18]">Total Payable:</span>
              <span className="font-serif font-bold text-[#8B2628] text-base">Tk {recentPlacedOrder.total}</span>
            </div>
          </div>
        )}

        <div className="p-3 bg-[#FFF9F2] border border-[#FFE7CF] rounded-xl text-xs text-[#8C6327] flex items-center justify-center gap-2">
          <Truck className="w-4 h-4 shrink-0 text-[#C59B27]" />
          <span>Our representative will call you before delivery.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => {
              setCurrentView('track');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex-1 py-3.5 bg-[#8B2628] hover:bg-[#721E20] text-white rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Package className="w-4 h-4" />
            <span>Track This Order</span>
          </button>

          <button
            onClick={() => {
              setCurrentView('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex-1 py-3.5 border border-[#DDD5C7] hover:bg-[#FAF8F5] text-[#2C2926] rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
        </div>

      </div>
    </div>
  );
};
