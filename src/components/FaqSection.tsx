import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const FaqSection: React.FC = () => {
  const { cms } = useStore();
  const faqs = cms?.faqs;
  const [openId, setOpenId] = useState<string | null>(faqs?.items?.[0]?.id || null);

  if (!faqs) return null;

  const toggleFaq = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <section className="py-16 sm:py-20 bg-[#FBF9F5] border-t border-[#EDE8E0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <span className="text-xs font-bold tracking-[0.25em] text-[#8B2628] uppercase">
            {faqs.eyebrow || 'FAQS'}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#1C1A18] tracking-tight mt-1">
            {faqs.title || 'Frequently Asked Questions'}
          </h2>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {(faqs.items || []).map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-[#EDE9E1] bg-white overflow-hidden shadow-xs transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(item.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-[#FDFCF9] transition-colors cursor-pointer"
                >
                  <span className="font-serif text-base sm:text-lg font-bold text-[#1C1A18]">
                    {item.question}
                  </span>
                  <span className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E8E1D5] flex items-center justify-center text-[#8B2628] shrink-0">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-[#615A51] leading-relaxed border-t border-[#F7F4EE] animate-accordion">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
