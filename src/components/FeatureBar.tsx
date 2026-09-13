import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Banknote, HeartHandshake, Lock } from 'lucide-react';

export const FeatureBar: React.FC = () => {
  const features = [
    { icon: Banknote, label: 'CASH ON DELIVERY', desc: 'Pay at your doorstep' },
    { icon: RotateCcw, label: 'EASY RETURN', desc: 'Hassle-free 7 days return' },
    { icon: ShieldCheck, label: 'QUALITY CHECKED', desc: '100% verified fabric' },
    { icon: Truck, label: 'FAST DELIVERY', desc: 'All 64 districts covered' },
    { icon: HeartHandshake, label: 'MADE IN BANGLADESH', desc: 'Authentic craftsmanship' },
    { icon: Lock, label: 'SECURE CHECKOUT', desc: 'Safe & reliable order' },
  ];

  // Duplicate array for a mathematically exact seamless infinite loop (-50% translation)
  const marqueeItems = [...features, ...features];

  return (
    <div className="bg-[#FAF7F2] border-y border-[#EDE9E1] py-3.5 overflow-hidden select-none relative">
      {/* Subtle fade edges for premium boutique feel */}
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#FAF7F2] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#FAF7F2] to-transparent z-10 pointer-events-none" />

      <div className="animate-marquee-smooth items-center">
        {marqueeItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx}
              className="flex items-center gap-3 px-6 sm:px-8 shrink-0 group transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-white border border-[#E2DBD0] group-hover:border-[#8B2628] flex items-center justify-center text-[#8B2628] shadow-2xs group-hover:scale-105 transition-all">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider text-[#1C1A18] group-hover:text-[#8B2628] uppercase transition-colors whitespace-nowrap">
                  {item.label}
                </span>
                <span className="text-[10px] text-[#7A7369] tracking-wide whitespace-nowrap hidden sm:inline">
                  {item.desc}
                </span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4CBBF] ml-5 sm:ml-7 shrink-0"></span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

