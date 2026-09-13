import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  CheckCircle2, 
  Clock, 
  Truck, 
  MapPin, 
  Phone, 
  ShoppingBag, 
  AlertCircle,
  Calendar
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';
import { sanitizeBdPhone, isValidBdPhone, handleNumericKeyDown } from '../utils/validation';

export const TrackOrderView: React.FC = () => {
  const { orders, showToast, setCurrentView, trackOrderApi } = useStore();
  const [orderNumber, setOrderNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      showToast('Please enter your order number.');
      return;
    }

    if (phoneNumber.trim() && !isValidBdPhone(phoneNumber)) {
      showToast('দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
      return;
    }

    const cleanOrderNo = orderNumber.trim().toUpperCase();
    const cleanPhone = sanitizeBdPhone(phoneNumber);
    setIsSearching(true);

    try {
      let found = orders.find(o => {
        const matchId = o.id.toUpperCase() === cleanOrderNo;
        if (!matchId) return false;
        if (cleanPhone) {
          return o.phone.replace(/[^0-9]/g, '').endsWith(cleanPhone) || cleanPhone.endsWith(o.phone.replace(/[^0-9]/g, ''));
        }
        return true;
      });

      if (!found) {
        const apiResults = await trackOrderApi(cleanOrderNo);
        if (apiResults && apiResults.length > 0) {
          found = apiResults[0];
        }
      }

      setHasSearched(true);
      if (found) {
        setSearchedOrder(found);
      } else {
        setSearchedOrder(null);
        showToast('Order not found. Check the order number and phone number.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleFillSample = () => {
    setOrderNumber('ZN-260520-ABCD');
    setPhoneNumber('01712345678');
    const found = orders.find(o => o.id === 'ZN-260520-ABCD');
    if (found) {
      setSearchedOrder(found);
      setHasSearched(true);
    }
  };

  // Status steps
  const statusSteps: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

  const getStepIndex = (st: OrderStatus) => {
    if (st === 'Cancelled') return -1;
    return statusSteps.indexOf(st);
  };

  const activeIndex = searchedOrder ? getStepIndex(searchedOrder.status) : -1;

  return (
    <div className="min-h-screen bg-[#FCFBF8] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
          <div className="w-12 h-12 rounded-2xl bg-[#8B2628]/10 flex items-center justify-center mx-auto mb-4 text-[#8B2628]">
            <Package className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A18] tracking-tight">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7369] mt-2">
            Enter your order number along with the phone number used at checkout to see real-time updates.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl border border-[#EDE9E1] p-6 sm:p-8 shadow-xs mb-8">
          <form onSubmit={handleTrack} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4A443D] mb-1.5">
                  Order Number *
                </label>
                <input
                  type="text"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. ZN-260520-ABCD"
                  className="w-full px-3.5 py-3 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm font-medium text-[#1C1A18] uppercase focus:outline-none focus:border-[#8B2628]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A443D] mb-1.5">
                  Phone Number (শুধুমাত্র ১১ ডিজিটের নম্বর)
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  value={phoneNumber}
                  onKeyDown={handleNumericKeyDown}
                  onChange={(e) => setPhoneNumber(sanitizeBdPhone(e.target.value))}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3.5 py-3 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm font-medium text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                />
              </div>
            </div>

            <button
              id="btn-track-submit"
              type="submit"
              className="w-full py-3.5 bg-[#8B2628] hover:bg-[#721E20] text-white rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Track Status</span>
            </button>
          </form>
        </div>

        {/* Search Results Display */}
        {hasSearched && !searchedOrder && (
          <div className="bg-white border border-[#EDE9E1] rounded-2xl p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-[#C59B27] mx-auto" />
            <h3 className="font-serif text-lg font-bold text-[#1C1A18]">
              Order Not Found
            </h3>
            <p className="text-xs text-[#7A7369] max-w-sm mx-auto">
              Please double check the order number or contact our WhatsApp support line if you need assistance.
            </p>
          </div>
        )}

        {searchedOrder && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Order Overview Header */}
            <div className="bg-white border border-[#EDE9E1] rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#F2ECE1] gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#1C1A18]">
                      #{searchedOrder.id}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      searchedOrder.status === 'Delivered'
                        ? 'bg-[#E8F5E9] text-[#2E7D32]'
                        : searchedOrder.status === 'Shipped'
                        ? 'bg-[#E3F2FD] text-[#1976D2]'
                        : 'bg-[#FFF3E0] text-[#E65100]'
                    }`}>
                      {searchedOrder.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-[#7A7369] mt-1 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Placed on {new Date(searchedOrder.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-[#7A7369] block">Total Amount</span>
                  <span className="font-serif text-2xl font-bold text-[#8B2628]">
                    Tk {searchedOrder.total}
                  </span>
                  <span className="text-[11px] text-[#2E7D32] font-semibold block">
                    {searchedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
                  </span>
                </div>
              </div>

              {/* Status Timeline Steps Bar */}
              <div className="py-8">
                <div className="grid grid-cols-5 gap-2 text-center relative">
                  {/* Connecting Bar */}
                  <div className="absolute top-4 left-[10%] right-[10%] h-1 bg-[#E8E1D5] -z-0">
                    <div 
                      className="h-full bg-[#8B2628] transition-all duration-500"
                      style={{ 
                        width: `${Math.max(0, (activeIndex / (statusSteps.length - 1)) * 100)}%` 
                      }}
                    />
                  </div>

                  {statusSteps.map((step, idx) => {
                    const isCompleted = idx <= activeIndex;
                    const isCurrent = idx === activeIndex;
                    return (
                      <div key={step} className="flex flex-col items-center relative z-10">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-[#8B2628] text-white ring-4 ring-[#8B2628]/20 shadow-md'
                            : isCompleted
                            ? 'bg-[#8B2628] text-white'
                            : 'bg-[#F2ECE1] text-[#9E978C]'
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                        </div>
                        <span className={`text-[11px] sm:text-xs mt-2 font-bold ${
                          isCompleted ? 'text-[#1C1A18]' : 'text-[#9E978C]'
                        }`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tracking Log Events */}
              <div className="pt-6 border-t border-[#F2ECE1]">
                <h4 className="text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-4">
                  Activity Timeline
                </h4>
                <div className="space-y-4">
                  {searchedOrder.trackingEvents.map((evt, eIdx) => (
                    <div key={eIdx} className="flex gap-3 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#8B2628] mt-1 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1C1A18]">{evt.status}</span>
                          <span className="text-[#8C8478]">• {evt.time}</span>
                        </div>
                        <p className="text-[#5A534A] mt-0.5">{evt.note}</p>
                        {evt.location && (
                          <span className="text-[11px] text-[#7A7369] italic">Location: {evt.location}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recipient & Ordered Items Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recipient Card */}
              <div className="bg-white border border-[#EDE9E1] rounded-2xl p-6 shadow-xs space-y-3">
                <h4 className="font-serif text-base font-bold text-[#1C1A18] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#8B2628]" />
                  <span>Delivery Address</span>
                </h4>
                <div className="text-xs text-[#4A443D] space-y-1">
                  <p className="font-bold text-sm text-[#1C1A18]">{searchedOrder.customerName}</p>
                  <p className="flex items-center gap-1.5 text-[#7A7369]">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{searchedOrder.phone}</span>
                  </p>
                  <p>{searchedOrder.address}</p>
                  <p className="font-medium text-[#8B2628]">{searchedOrder.area}, {searchedOrder.district}</p>
                  {searchedOrder.deliveryNote && (
                    <p className="text-[11px] text-[#8C8478] italic pt-1">
                      Note: "{searchedOrder.deliveryNote}"
                    </p>
                  )}
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-white border border-[#EDE9E1] rounded-2xl p-6 shadow-xs space-y-3">
                <h4 className="font-serif text-base font-bold text-[#1C1A18] flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#8B2628]" />
                  <span>Package Contents ({searchedOrder.items.length})</span>
                </h4>
                <div className="divide-y divide-[#F2ECE1] max-h-48 overflow-y-auto">
                  {searchedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={item.image} 
                          alt="" 
                          className="w-10 h-10 object-cover rounded-md border border-[#EDE9E1]"
                        />
                        <div>
                          <p className="font-semibold text-[#1C1A18] line-clamp-1">{item.title}</p>
                          <p className="text-[11px] text-[#7A7369]">
                            {item.selectedColor} • {item.selectedSize} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-[#1C1A18]">
                        Tk {item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
