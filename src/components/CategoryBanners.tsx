import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CategoryBanners: React.FC = () => {
  const { categories, viewCategory, setCurrentView, cms } = useStore();

  return (
    <section className="py-12 sm:py-16 bg-[#FCFBF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C19] tracking-tight">
              {cms?.categoryHighlights?.title || 'Shop By Category'}
            </h2>
            <p className="text-sm text-[#7A7369] mt-1.5">
              {cms?.categoryHighlights?.subtitle || 'Explore our curated collections for everyone'}
            </p>
          </div>
          <button
            id="btn-shop-all-collections"
            onClick={() => {
              setCurrentView('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#8B2628] hover:text-[#721E20] border border-[#DDD5C7] hover:border-[#8B2628] px-4 py-2 rounded-lg bg-white transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <span>Shop All Collections</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {(categories || []).map((cat) => (
            <div
              key={cat.id}
              onClick={() => viewCategory(cat.name)}
              className="group relative rounded-2xl overflow-hidden aspect-4/5 sm:aspect-3/4 bg-[#EFECE6] border border-[#EDE9E1] shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
            >
              {/* Image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-center transform group-hover:scale-108 transition-transform duration-700 ease-out"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent group-hover:from-black/80 transition-colors duration-300" />

              {/* Bottom Card Content */}
              <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-center text-center">
                <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-widest text-white uppercase mb-3">
                  {cat.name}
                </h3>
                
                {/* Explore Pill */}
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/90 group-hover:bg-[#8B2628] text-[#1F1C19] group-hover:text-white text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow-md">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
