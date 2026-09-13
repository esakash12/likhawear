import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const LookbookSection: React.FC = () => {
  const { cms, setCurrentView, viewCategory } = useStore();
  const lookbook = cms?.lookbook;

  if (!lookbook) return null;

  return (
    <section className="py-14 sm:py-20 bg-[#F6F2EC] border-t border-[#E8E1D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow & Title */}
        <span className="text-xs font-bold tracking-[0.25em] text-[#8B2628] uppercase">
          {lookbook.eyebrow || 'STYLE GALLERY'}
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#1C1A18] tracking-tight mt-1 mb-2">
          {lookbook.title || 'Zinnia Lookbook'}
        </h2>
        <p className="text-sm text-[#7A7369] max-w-md mx-auto mb-10 sm:mb-12">
          {lookbook.subtitle || 'Style inspiration from our latest collections'}
        </p>

        {/* 3 Lookbook Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-10">
          {(lookbook.items || []).map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.link.includes('category=')) {
                  const cat = item.link.split('category=')[1];
                  viewCategory(cat);
                } else {
                  setCurrentView('shop');
                }
              }}
              className="group relative rounded-2xl overflow-hidden aspect-3/4 bg-[#E0D8CB] shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                loading="lazy"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent group-hover:from-black/85 transition-colors duration-300" />

              {/* Text & Button in Card */}
              <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-center text-center">
                <h3 className="font-serif text-2xl font-bold text-white mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-[#DDD7CD] mb-4 line-clamp-1 max-w-xs">
                  {item.subtitle}
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-white border-b border-white/60 pb-1 group-hover:border-white transition-all">
                  <span>{item.buttonText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div>
          <button
            onClick={() => {
              setCurrentView('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-[#C5BBAE] hover:border-[#8B2628] bg-white text-[#2C2926] hover:text-[#8B2628] text-xs font-bold tracking-wider uppercase shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <span>View All Collections</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
