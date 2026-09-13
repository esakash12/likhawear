import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Check, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  FileText,
  Tag
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BANGLADESH_DISTRICTS } from '../data/initialData';
import { sanitizeBdPhone, isValidBdPhone, handleNumericKeyDown } from '../utils/validation';

export const CheckoutView: React.FC = () => {
  const { 
    cart, 
    cartSubtotal, 
    cms, 
    placeOrder, 
    setCurrentView, 
    setIsAuthModalOpen,
    appliedCoupon,
    couponDiscountAmount,
    applyCouponCode,
    removeCoupon,
    showToast,
    setIsCartOpen,
    products
  } = useStore();

  const getProductStockStatus = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod || !prod.inStock || (prod.stockCount !== undefined && prod.stockCount <= 0)) {
      return { isOut: true, available: 0 };
    }
    return { isOut: false, available: prod.stockCount };
  };

  const hasOutOfStockItems = cart.some(item => getProductStockStatus(item.productId).isOut);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [addressLabel, setAddressLabel] = useState<'Home' | 'Office'>('Home');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash'>('cod');
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [couponInput, setCouponInput] = useState('');
  const [addressTab, setAddressTab] = useState<'saved' | 'new'>('new');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delivery fee calculation
  const isDhaka = district.toLowerCase().includes('dhaka');
  const baseDeliveryFee = isDhaka ? cms.shipping.insideDhakaFee : cms.shipping.outsideDhakaFee;
  const isFreeShipping = cartSubtotal >= cms.shipping.freeShippingThreshold;
  const deliveryFee = isFreeShipping ? 0 : baseDeliveryFee;

  const total = Math.max(0, cartSubtotal + deliveryFee - couponDiscountAmount);

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#FAF5EE] border border-[#E8E1D5] flex items-center justify-center text-[#8B2628] mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#1C1A18] mb-2">
          Your cart is empty
        </h2>
        <p className="text-xs text-[#7A7369] max-w-sm mb-6">
          You need items in your cart before proceeding to checkout.
        </p>
        <button
          onClick={() => setCurrentView('shop')}
          className="px-8 py-3 bg-[#8B2628] text-white rounded-lg text-xs font-bold hover:bg-[#721E20] transition-colors"
        >
          Browse Products
        </button>
      </div>
    );
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCouponCode(couponInput);
    showToast(res.message);
    if (res.success) setCouponInput('');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showToast('Please enter your full name.');
      return;
    }
    if (!phone.trim() || !isValidBdPhone(phone)) {
      showToast('দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
      return;
    }
    if (!district) {
      showToast('Please select your delivery district.');
      return;
    }
    if (!address.trim()) {
      showToast('Please enter your street / building address.');
      return;
    }
    if (!termsAgreed) {
      showToast('Please accept the terms and conditions.');
      return;
    }

    if (hasOutOfStockItems) {
      showToast('Cannot place order: your cart contains out-of-stock items. Please remove them.');
      setIsCartOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await placeOrder({
        customerName: fullName,
        phone,
        email: email || undefined,
        district,
        area: area || district,
        address,
        addressLabel,
        deliveryNote: deliveryNote || undefined,
        paymentMethod,
        items: cart,
        subtotal: cartSubtotal,
        deliveryFee,
        discount: couponDiscountAmount,
        couponCode: appliedCoupon?.code,
        total
      });

      showToast(`Order #${order.id} placed successfully!`);
      setCurrentView('order-success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      showToast('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Announcement Prompt */}
        <div className="mb-8 p-4 bg-white rounded-xl border border-[#EDE9E1] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <p className="text-xs text-[#6B6357]">
            Have an account? Sign in for faster checkout and saved addresses.
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-1.5 border border-[#DDD5C7] hover:border-[#8B2628] rounded-lg text-xs font-semibold text-[#1C1A18] hover:text-[#8B2628] transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-1.5 bg-[#8B2628] text-white rounded-lg text-xs font-semibold hover:bg-[#721E20] transition-colors"
            >
              Register
            </button>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 7 Columns: Delivery & Payment Details */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Delivery Details Card */}
              <div className="bg-white border border-[#EDE9E1] rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-[#1C1A18] flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#8B2628]" />
                      <span>Delivery Details</span>
                    </h2>
                    <p className="text-xs text-[#7A7369] mt-0.5">Where should we deliver?</p>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center bg-[#FAF8F5] p-1 rounded-lg border border-[#EDE9E1] text-xs">
                    <button
                      type="button"
                      onClick={() => setAddressTab('saved')}
                      className={`px-3 py-1 rounded-md font-medium transition-colors ${
                        addressTab === 'saved' ? 'bg-white text-[#8B2628] shadow-xs' : 'text-[#7A7369]'
                      }`}
                    >
                      Saved Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddressTab('new')}
                      className={`px-3 py-1 rounded-md font-medium transition-colors ${
                        addressTab === 'new' ? 'bg-white text-[#8B2628] shadow-xs' : 'text-[#7A7369]'
                      }`}
                    >
                      Add New Address
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Name & Label */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                        Your full name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#9E978C] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Mohammad Tanvir"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                        Label (Home, Office)
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAddressLabel('Home')}
                          className={`flex-1 py-2.5 rounded-lg text-xs font-bold border transition-colors ${
                            addressLabel === 'Home'
                              ? 'border-[#8B2628] bg-[#FAF5EE] text-[#8B2628]'
                              : 'border-[#DDD5C7] bg-[#FAF8F5] text-[#7A7369]'
                          }`}
                        >
                          Home
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddressLabel('Office')}
                          className={`flex-1 py-2.5 rounded-lg text-xs font-bold border transition-colors ${
                            addressLabel === 'Office'
                              ? 'border-[#8B2628] bg-[#FAF5EE] text-[#8B2628]'
                              : 'border-[#DDD5C7] bg-[#FAF8F5] text-[#7A7369]'
                          }`}
                        >
                          Office
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Phone & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                        Phone Number *
                      </label>
                      <div className="relative flex">
                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[#DDD5C7] bg-[#F4F0E8] text-xs font-bold text-[#4A443D]">
                          +88
                        </span>
                        <input
                          type="tel"
                          required
                          inputMode="numeric"
                          maxLength={11}
                          value={phone}
                          onKeyDown={handleNumericKeyDown}
                          onChange={(e) => setPhone(sanitizeBdPhone(e.target.value))}
                          placeholder="017XXXXXXXX"
                          className="w-full pl-3 pr-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-r-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                        Email address (optional)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#9E978C] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tanvir@example.com"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* District & Area */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                        Select District *
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628] cursor-pointer"
                      >
                        {BANGLADESH_DISTRICTS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <span className="text-[10px] text-[#8C8478] mt-1 block">
                        {isDhaka 
                          ? `Inside Dhaka Delivery (Tk ${cms.shipping.insideDhakaFee})` 
                          : `Outside Dhaka Delivery (Tk ${cms.shipping.outsideDhakaFee})`}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                        Area / Thana *
                      </label>
                      <input
                        type="text"
                        required
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="e.g. Dhanmondi, Gulshan, or Sadar"
                        className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                      />
                    </div>
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                      House no. / building / street / area *
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. House 42, Road 9/A, Flat 3B"
                      className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                  </div>

                  {/* Delivery Note */}
                  <div>
                    <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                      Delivery Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      placeholder="Special instructions for rider (e.g. call before delivery)"
                      className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Card */}
              <div className="bg-white border border-[#EDE9E1] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
                <div className="pb-3 border-b border-[#F2ECE1]">
                  <h2 className="font-serif text-lg font-bold text-[#1C1A18] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#8B2628]" />
                    <span>Payment Method</span>
                  </h2>
                  <p className="text-xs text-[#7A7369] mt-0.5">Choose what feels easiest</p>
                </div>

                <div className="space-y-3">
                  {/* COD */}
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-[#8B2628] bg-[#FAF5EE] ring-1 ring-[#8B2628]'
                        : 'border-[#EDE9E1] hover:border-[#DDD4C7] bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="accent-[#8B2628]"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#1C1A18] block">
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[11px] text-[#7A7369]">
                          Pay with cash when your order is delivered
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-bold rounded-md">
                      Recommended
                    </span>
                  </label>

                  {/* bKash / Nagad */}
                  <label
                    onClick={() => setPaymentMethod('bkash')}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'bkash'
                        ? 'border-[#8B2628] bg-[#FAF5EE] ring-1 ring-[#8B2628]'
                        : 'border-[#EDE9E1] hover:border-[#DDD4C7] bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'bkash'}
                        onChange={() => setPaymentMethod('bkash')}
                        className="accent-[#8B2628]"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#1C1A18] block">
                          bKash / Nagad Mobile Banking
                        </span>
                        <span className="text-[11px] text-[#7A7369]">
                          Send payment to {cms?.siteInfo?.phone || ''} and share TrxID
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

            </div>

            {/* Right 5 Columns: Order Summary Sidebar */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-[#EDE9E1] rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
                  <h3 className="font-serif text-lg font-bold text-[#1C1A18]">
                    Order Summary
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className="text-xs font-bold text-[#8B2628] hover:underline cursor-pointer"
                  >
                    Edit Cart
                  </button>
                </div>

                {/* Items preview list */}
                <div className="max-h-64 overflow-y-auto divide-y divide-[#F2ECE1]">
                  {cart.map((item, idx) => {
                    const stockStatus = getProductStockStatus(item.productId);
                    return (
                      <div key={idx} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className={`w-12 h-14 object-cover rounded-md border border-[#EDE9E1] ${
                              stockStatus.isOut ? 'grayscale-[50%] opacity-80' : ''
                            }`}
                          />
                          <div>
                            <p className="text-xs font-bold text-[#1C1A18] line-clamp-1">{item.title}</p>
                            <p className="text-[11px] text-[#7A7369]">
                              {item.selectedColor} / {item.selectedSize} × {item.quantity}
                            </p>
                            {stockStatus.isOut && (
                              <span className="text-[10px] font-bold text-[#C62828] bg-[#FFEBEE] px-1.5 py-0.5 rounded border border-[#FFCDD2] inline-block mt-0.5">
                                Out of stock
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#1C1A18]">
                          Tk {item.price * item.quantity}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon Input */}
                <div className="pt-3 border-t border-[#F2ECE1]">
                  <p className="text-xs font-semibold text-[#4A443D] mb-1.5 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#8B2628]" />
                    <span>Have any coupon or gift voucher?</span>
                  </p>
                  
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-[#E8F5E9] border border-[#C8E6C9] p-2.5 rounded-lg text-xs">
                      <div>
                        <span className="font-bold text-[#2E7D32]">{appliedCoupon.code}</span>
                        <span className="text-[11px] text-[#388E3C] ml-2">applied (-Tk {couponDiscountAmount})</span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-xs font-bold text-[#D32F2F] hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder={`e.g. ${cms?.siteInfo?.brandName ? cms.siteInfo.brandName.replace(/\s+/g, '').toUpperCase() + '10' : 'SAVE10'} or DISCOUNT`}
                        className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] uppercase focus:outline-none focus:border-[#8B2628]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-[#4A3B32] hover:bg-[#382C25] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                {/* Cost Breakdown */}
                <div className="pt-3 border-t border-[#F2ECE1] space-y-2 text-xs">
                  <div className="flex justify-between text-[#7A7369]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#1C1A18]">Tk {cartSubtotal}</span>
                  </div>

                  <div className="flex justify-between text-[#7A7369]">
                    <span>Delivery cost ({district})</span>
                    <span className="font-semibold text-[#1C1A18]">
                      {deliveryFee === 0 ? (
                        <span className="text-[#2E7D32] font-bold">FREE</span>
                      ) : (
                        `Tk ${deliveryFee}`
                      )}
                    </span>
                  </div>

                  {couponDiscountAmount > 0 && (
                    <div className="flex justify-between text-[#2E7D32] font-semibold">
                      <span>Discount</span>
                      <span>-Tk {couponDiscountAmount}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#F2ECE1] flex justify-between items-baseline">
                    <span className="font-serif text-base font-bold text-[#1C1A18]">Total</span>
                    <span className="font-serif text-2xl font-extrabold text-[#8B2628]">
                      Tk {total}
                    </span>
                  </div>
                </div>

                {/* Secure info notice */}
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE9E1] text-[11px] text-[#7A7369] space-y-1">
                  <p className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#8B2628]" />
                    <span>Estimated delivery 2-4 business days</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#8B2628]" />
                    <span>Your payment and address details stay secure</span>
                  </p>
                </div>

                {/* Terms checkbox */}
                <label className="flex items-start gap-2.5 text-xs text-[#5A534A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-0.5 accent-[#8B2628] rounded-xs"
                  />
                  <span>
                    I agree to the Terms, Privacy & Cookie Policy and Refund Policy.
                  </span>
                </label>

                {/* PLACE ORDER BUTTON / OUT OF STOCK NOTICE */}
                {hasOutOfStockItems ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-[#FFF0F0] border border-[#FFD6D6] rounded-xl text-xs font-bold text-[#C62828] text-center">
                      ⚠️ Please remove out-of-stock items from your cart before placing an order.
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCartOpen(true)}
                      className="w-full py-3.5 bg-[#4A3B32] hover:bg-[#382C25] text-white rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Edit Cart & Remove Out of Stock Items</span>
                    </button>
                  </div>
                ) : (
                  <button
                    id="btn-place-order"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#8B2628] hover:bg-[#721E20] disabled:bg-[#B58A8B] text-white rounded-xl text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  >
                    <span>{isSubmitting ? 'PROCESSING ORDER...' : 'PLACE ORDER >'}</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
};
