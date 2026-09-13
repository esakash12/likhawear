import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Mail, 
  LogOut, 
  Truck, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Edit3, 
  Heart, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';
import { sanitizeBdPhone, isValidBdPhone, handleNumericKeyDown } from '../utils/validation';

export const CustomerDashboardView: React.FC = () => {
  const { 
    customerUser, 
    customerOrders, 
    fetchCustomerOrders, 
    logoutCustomer, 
    updateCustomerProfile, 
    setCurrentView, 
    wishlist, 
    products, 
    addToCart,
    viewProduct,
    showToast 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'wishlist'>('orders');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(customerUser?.name || '');
  const [editPhone, setEditPhone] = useState(customerUser?.phone || '');
  const [editAddress, setEditAddress] = useState(customerUser?.address || '');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetchCustomerOrders();
  }, []);

  useEffect(() => {
    if (customerUser) {
      setEditName(customerUser.name || '');
      setEditPhone(customerUser.phone || '');
      setEditAddress(customerUser.address || '');
    }
  }, [customerUser]);

  if (!customerUser) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] py-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-2xl border border-[#EDE9E1] shadow-sm space-y-4">
          <div className="w-16 h-16 bg-[#FAF7F2] border border-[#E8E1D5] rounded-full flex items-center justify-center mx-auto text-[#8B2628]">
            <User className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1C1A18]">Sign in to your account</h2>
          <p className="text-xs text-[#7A7369]">
            Access your orders, saved delivery addresses, and personalized styling recommendations.
          </p>
          <button
            onClick={() => setCurrentView('home')}
            className="w-full py-3 bg-[#8B2628] hover:bg-[#721E20] text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editPhone.trim() && !isValidBdPhone(editPhone)) {
      showToast('দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
      return;
    }
    setSavingProfile(true);
    await updateCustomerProfile({
      name: editName,
      phone: editPhone,
      address: editAddress,
    });
    setSavingProfile(false);
    setIsEditingProfile(false);
  };

  const favoritedProducts = products.filter(p => wishlist.includes(p.id));

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'shipped': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'confirmed': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] py-8 sm:py-12 animate-page-enter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Header */}
        <div className="bg-white border border-[#EDE9E1] rounded-2xl p-6 sm:p-8 shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {customerUser.avatar ? (
              <img 
                src={customerUser.avatar} 
                alt={customerUser.name} 
                className="w-16 h-16 rounded-full border-2 border-[#8B2628] object-cover shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#8B2628] text-white flex items-center justify-center font-serif text-2xl font-bold uppercase shadow-sm">
                {customerUser.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A18]">
                  {customerUser.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF5EE] text-[#8B2628] border border-[#E8DFC8] uppercase tracking-wider">
                  Verified Member
                </span>
              </div>
              <p className="text-xs text-[#7A7369] mt-1 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#8B2628]" />
                  {customerUser.email}
                </span>
                {customerUser.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#8B2628]" />
                    {customerUser.phone}
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={logoutCustomer}
            className="btn-press inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#DDD5C7] text-xs font-semibold text-[#5A534A] hover:text-[#8B2628] hover:border-[#8B2628] bg-[#FAF8F5] transition-colors self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#EDE9E1] mb-8 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-[#8B2628] text-[#8B2628]'
                : 'border-transparent text-[#7A7369] hover:text-[#1C1A18]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>My Orders ({customerOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-[#8B2628] text-[#8B2628]'
                : 'border-transparent text-[#7A7369] hover:text-[#1C1A18]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Addresses</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 flex items-center gap-2 ${
              activeTab === 'wishlist'
                ? 'border-[#8B2628] text-[#8B2628]'
                : 'border-transparent text-[#7A7369] hover:text-[#1C1A18]'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Wishlist ({favoritedProducts.length})</span>
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {customerOrders.length === 0 ? (
              <div className="bg-white border border-[#EDE9E1] rounded-2xl p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF5EE] border border-[#E8E1D5] flex items-center justify-center text-[#8B2628] mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1C1A18]">
                  No orders placed yet
                </h3>
                <p className="text-xs text-[#7A7369] max-w-sm mx-auto">
                  Browse our handcrafted collection of traditional and modern clothing to make your first purchase.
                </p>
                <button
                  onClick={() => setCurrentView('shop')}
                  className="btn-press px-6 py-2.5 bg-[#8B2628] text-white rounded-lg text-xs font-bold hover:bg-[#721E20] transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              customerOrders.map(order => (
                <div 
                  key={order.id} 
                  className="bg-white border border-[#EDE9E1] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 hover:border-[#DDD4C7] transition-all"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F2ECE1] gap-2">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-serif font-bold text-base sm:text-lg text-[#1C1A18]">
                          Order #{order.id}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#8C8478] mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-[#4A443D] uppercase">
                          Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'bKash'}
                        </span>
                      </p>
                    </div>

                    {/* Live Track CTA */}
                    <button
                      onClick={() => setCurrentView('track')}
                      className="btn-press inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FAF5EE] text-[#8B2628] border border-[#E8DFC8] text-xs font-bold hover:bg-[#8B2628] hover:text-white transition-all self-start sm:self-auto cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Live Track Order</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-[#F7F4EE]">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-3 flex items-center gap-4">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-14 h-14 object-cover rounded-lg border border-[#EDE9E1]"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-[#1C1A18] truncate">
                            {item.title}
                          </h4>
                          <p className="text-xs text-[#7A7369]">
                            {item.selectedColor} • Size: {item.selectedSize} • Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-[#8B2628]">
                            Tk {item.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer & Total */}
                  <div className="pt-3 border-t border-[#F2ECE1] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#7A7369] gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#8B2628] shrink-0" />
                      <span>Delivery to: {order.address}, {order.district}</span>
                    </div>
                    <div className="text-right self-end sm:self-auto">
                      <span className="text-xs text-[#7A7369]">Grand Total: </span>
                      <span className="font-serif text-base font-bold text-[#1C1A18]">
                        Tk {order.total}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Profile & Saved Address */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Account Details Card */}
            <div className="bg-white border border-[#EDE9E1] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-4">
                <h3 className="font-serif text-lg font-bold text-[#1C1A18] flex items-center gap-2">
                  <User className="w-5 h-5 text-[#8B2628]" />
                  <span>Personal Details</span>
                </h3>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="btn-press text-xs font-bold text-[#8B2628] hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4A443D] mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A443D] mb-1">
                      Phone Number (শুধুমাত্র ১১ ডিজিটের নম্বর)
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={11}
                      value={editPhone}
                      onKeyDown={handleNumericKeyDown}
                      onChange={(e) => setEditPhone(sanitizeBdPhone(e.target.value))}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3.5 py-2 border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A443D] mb-1">Default Delivery Address</label>
                    <textarea
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      rows={3}
                      placeholder="House, Road, Area, District"
                      className="w-full px-3.5 py-2 border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="btn-press px-5 py-2 bg-[#8B2628] text-white text-xs font-bold rounded-lg hover:bg-[#721E20] transition-colors"
                    >
                      {savingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="btn-press px-4 py-2 border border-[#DDD5C7] text-xs font-semibold text-[#5A534A] rounded-lg hover:bg-[#FAF8F5]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[#8C8478] block">Full Name</span>
                    <span className="font-semibold text-sm text-[#1C1A18]">{customerUser.name}</span>
                  </div>

                  <div>
                    <span className="text-[#8C8478] block">Email Address</span>
                    <span className="font-semibold text-sm text-[#1C1A18]">{customerUser.email}</span>
                  </div>

                  <div>
                    <span className="text-[#8C8478] block">Phone Number</span>
                    <span className="font-semibold text-sm text-[#1C1A18]">{customerUser.phone || 'Not provided'}</span>
                  </div>

                  <div>
                    <span className="text-[#8C8478] block">Default Delivery Address</span>
                    <span className="font-semibold text-sm text-[#1C1A18]">{customerUser.address || 'No address saved yet'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Benefits & Security Card */}
            <div className="bg-[#FAF7F2] border border-[#EDE8E0] rounded-2xl p-6 sm:p-8 space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="font-serif text-lg font-bold text-[#1C1A18] mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#8B2628]" />
                  <span>{cms?.siteInfo?.brandName || 'VIP'} Member Benefits</span>
                </h4>
                <ul className="space-y-3 text-xs text-[#5A534A]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Instant 1-click checkout with pre-filled address & contact info</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Real-time delivery progress updates directly from Steadfast Courier</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Exclusive VIP coupon discounts and early access to Eid & seasonal drops</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-[#E8DFC8] text-[11px] text-[#7A7369]">
                Need immediate help with your account or order? Call customer support at <span className="font-bold text-[#1C1A18]">+880 1886-246642</span>.
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Wishlist */}
        {activeTab === 'wishlist' && (
          <div>
            {favoritedProducts.length === 0 ? (
              <div className="bg-white border border-[#EDE9E1] rounded-2xl p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF5EE] border border-[#E8E1D5] flex items-center justify-center text-[#8B2628] mx-auto">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1C1A18]">
                  Your wishlist is empty
                </h3>
                <p className="text-xs text-[#7A7369] max-w-sm mx-auto">
                  Click the heart icon on any product to save items you love for later.
                </p>
                <button
                  onClick={() => setCurrentView('shop')}
                  className="btn-press px-6 py-2.5 bg-[#8B2628] text-white rounded-lg text-xs font-bold hover:bg-[#721E20] transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {favoritedProducts.map(product => (
                  <div 
                    key={product.id}
                    onClick={() => viewProduct(product.slug)}
                    className="card-lift bg-white rounded-2xl border border-[#EDE9E1] overflow-hidden shadow-xs cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative aspect-square overflow-hidden bg-[#F7F5F0]">
                      <img 
                        src={product.images[0]} 
                        alt={product.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="text-[10px] font-bold text-[#9E978C] uppercase">{product.category}</p>
                      <h4 className="text-xs sm:text-sm font-semibold text-[#1C1A18] line-clamp-1">{product.title}</h4>
                      <span className="text-sm font-bold text-[#8B2628] block">Tk {product.price}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="btn-press w-full py-2 bg-[#8B2628] text-white rounded-lg text-xs font-bold hover:bg-[#721E20] transition-colors"
                      >
                        Add To Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
