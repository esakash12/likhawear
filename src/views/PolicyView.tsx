import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { sanitizeBdPhone, isValidBdPhone, handleNumericKeyDown } from '../utils/validation';

export const PolicyView: React.FC = () => {
  const { selectedPolicy, setSelectedPolicy, cms, showToast, setCurrentView } = useStore();
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const pagesMap: Record<string, { title: string; content: string }> = {
    aboutUs: { title: 'About Zinnia Bangladesh', content: cms.policies.aboutUs },
    termsAndConditions: { title: 'Terms & Conditions', content: cms.policies.termsAndConditions },
    privacyPolicy: { title: 'Privacy & Cookie Policy', content: cms.policies.privacyPolicy },
    shippingPolicy: { title: 'Shipping & Delivery Policy', content: cms.policies.shippingPolicy },
    refundPolicy: { title: 'Returns & Refund Policy', content: cms.policies.refundPolicy },
    contactUs: { title: 'Contact Us & Customer Support', content: cms.policies.contactUs },
  };

  const currentPage = pagesMap[selectedPolicy] || pagesMap.aboutUs;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone || !contactMessage) {
      showToast('Please fill all fields.');
      return;
    }
    if (!isValidBdPhone(contactPhone)) {
      showToast('দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
      return;
    }
    showToast('Thank you! Your message has been sent to our customer care team.');
    setContactName('');
    setContactPhone('');
    setContactMessage('');
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Tabs for Policies */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-[#EDE9E1] scrollbar-none">
          {Object.entries(pagesMap).map(([key, page]) => {
            const isActive = selectedPolicy === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedPolicy(key as keyof typeof cms.policies);
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#8B2628] text-white shadow-xs'
                    : 'bg-white border border-[#DDD5C7] text-[#4A443D] hover:border-[#8B2628]'
                }`}
              >
                {page.title}
              </button>
            );
          })}
        </div>

        {/* Card Content */}
        <div className="bg-white border border-[#EDE9E1] rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="border-b border-[#F2ECE1] pb-4">
            <span className="text-xs font-bold tracking-[0.2em] text-[#8B2628] uppercase">
              {cms?.siteInfo?.brandName || 'Zinnia'} POLICIES & INFO
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#1C1A18] mt-1">
              {currentPage.title}
            </h1>
          </div>

          <div className="text-sm text-[#4A443D] leading-relaxed whitespace-pre-line">
            {currentPage.content}
          </div>

          {/* If on Contact Us page, render direct communication cards and form */}
          {selectedPolicy === 'contactUs' && (
            <div className="pt-8 border-t border-[#F2ECE1] space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EDE9E1] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-[#DDD5C7] flex items-center justify-center text-[#8B2628]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#7A7369] font-medium">Hotline / WhatsApp</p>
                    <a href={`tel:${cms?.siteInfo?.phone || ''}`} className="text-xs font-bold text-[#1C1A18] hover:text-[#8B2628]">
                      {cms?.siteInfo?.phone || ''}
                    </a>
                  </div>
                </div>

                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EDE9E1] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-[#DDD5C7] flex items-center justify-center text-[#8B2628]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#7A7369] font-medium">Official Email</p>
                    <a href={`mailto:${cms?.siteInfo?.email || ''}`} className="text-xs font-bold text-[#1C1A18] hover:text-[#8B2628]">
                      {cms?.siteInfo?.email || ''}
                    </a>
                  </div>
                </div>

                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EDE9E1] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-[#DDD5C7] flex items-center justify-center text-[#8B2628]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#7A7369] font-medium">Store & Warehouse</p>
                    <p className="text-xs font-bold text-[#1C1A18]">{cms?.siteInfo?.address || ''}</p>
                  </div>
                </div>

                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EDE9E1] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-[#DDD5C7] flex items-center justify-center text-[#8B2628]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#7A7369] font-medium">Support Hours</p>
                    <p className="text-xs font-bold text-[#1C1A18]">{cms?.siteInfo?.workingHours || ''}</p>
                  </div>
                </div>
              </div>

              {/* Message form */}
              <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#EDE9E1]">
                <h3 className="font-serif text-lg font-bold text-[#1C1A18] mb-1">
                  Send a Direct Message
                </h3>
                <p className="text-xs text-[#7A7369] mb-4">
                  We reply within 1-2 hours during business times.
                </p>

                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#4A443D] mb-1">Name</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                        Phone Number (শুধুমাত্র ১১ ডিজিটের নম্বর)
                      </label>
                      <input
                        type="tel"
                        required
                        inputMode="numeric"
                        maxLength={11}
                        value={contactPhone}
                        onKeyDown={handleNumericKeyDown}
                        onChange={(e) => setContactPhone(sanitizeBdPhone(e.target.value))}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A443D] mb-1">Message</label>
                    <textarea
                      required
                      rows={3}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="How can we assist you?"
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#8B2628] hover:bg-[#721E20] text-white rounded-lg text-xs font-bold tracking-wider uppercase transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Inquiry</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Return button */}
          <div className="pt-6">
            <button
              onClick={() => setCurrentView('home')}
              className="text-xs font-bold text-[#8B2628] hover:underline"
            >
              ← Back to Home
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
