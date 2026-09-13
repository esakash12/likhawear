import React from 'react';
import { ShieldCheck, Banknote, RotateCcw, Headphones, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ZinniaStandard: React.FC = () => {
  const { cms } = useStore();
  const standard = cms?.zinniaStandard;

  if (!standard) return null;

  const iconMap: Record<string, React.ElementType> = {
    ShieldCheck,
    Banknote,
    RotateCcw,
    Headphones,
    Truck
  };

  return (
    <section className="py-16 sm:py-24 bg-[#FCFBF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Header */}
        <span className="text-xs font-bold tracking-[0.25em] text-[#8B2628] uppercase">
          {standard.eyebrow || 'OUR PROMISE'}
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#1C1A18] tracking-tight mt-1 mb-3">
          {standard.title || 'The Zinnia Standard'}
        </h2>
        <p className="text-sm sm:text-base text-[#7A7369] max-w-2xl mx-auto mb-14 leading-relaxed">
          {standard.description || ''}
        </p>

        {/* 4 Feature Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {(standard.features || []).map((item) => {
            const IconComponent = iconMap[item.iconName] || ShieldCheck;
            return (
              <div
                key={item.id}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-[#EDE9E1] shadow-xs hover:shadow-md hover:border-[#DDD4C7] transition-all duration-300"
              >
                {/* Circular Icon Container */}
                <div className="w-16 h-16 rounded-full bg-[#FAF5EE] border-2 border-[#E7DEC8] flex items-center justify-center text-[#8B2628] mb-5 shadow-xs">
                  <IconComponent className="w-7 h-7" />
                </div>

                {/* Title */}
                <h3 className="font-serif text-lg font-bold text-[#1C1A18] mb-2 uppercase tracking-wide">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-[#7A7369] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
