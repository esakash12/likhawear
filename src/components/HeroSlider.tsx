import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Banknote, RotateCcw } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const HeroSlider: React.FC = () => {
  const { cms, setCurrentView, viewCategory } = useStore();
  const slides = cms?.heroSlides || [];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  if (!slides || slides.length === 0) return null;

  const prevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const current = slides[currentSlide];

  return (
    <div 
      className="relative bg-[#EAE2D7] overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-[#D8CAB8] via-[#E4D7C7] to-[#DECFC0] border border-[#D5C4B0] shadow-sm min-h-[460px] sm:min-h-[500px] flex items-center">
          
          {/* Subtle pattern / decorative overlay */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#8B2628_1px,transparent_1px)] [background-size:16px_16px]"></div>

          {/* Slide Layout */}
          <div key={currentSlide} className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full p-6 sm:p-10 lg:p-14 animate-crossfade">
            
            {/* Visual imagery / Presentation (Left on desktop) */}
            <div className="lg:col-span-6 flex justify-center items-center order-2 lg:order-1">
              <div className="relative w-full max-w-lg aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/80 group">
                <img 
                  src={current.image} 
                  alt={current.title}
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                
                {/* Embedded badge in photo corner */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md text-xs font-bold text-[#8B2628] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8B2628] animate-ping"></span>
                  <span>{current.subtitle}</span>
                </div>
              </div>
            </div>

            {/* Typography & CTA (Right on desktop) */}
            <div className="lg:col-span-6 text-center lg:text-left order-1 lg:order-2 space-y-4 sm:space-y-6">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8B2628]/10 text-[#8B2628] text-xs font-bold tracking-[0.25em] uppercase">
                <span>•</span>
                <span>{current.eyebrow || 'DISCOVER. SHOP. SHINE.'}</span>
                <span>•</span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1F1C19] tracking-tight leading-tight">
                {current.title}
              </h2>

              {/* Subtitle */}
              <p className="font-serif italic text-xl sm:text-2xl text-[#6B2022] font-medium">
                {current.subtitle}
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 pt-2">
                {(current.badges || ['QUALITY CHECKED', 'CASH ON DELIVERY', 'EASY RETURNS']).map((badge, bIdx) => (
                  <div 
                    key={bIdx}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-xs border border-[#DDD3C4] rounded-md text-[11px] font-semibold text-[#4A443D] shadow-xs"
                  >
                    {bIdx === 0 && <ShieldCheck className="w-3.5 h-3.5 text-[#8B2628]" />}
                    {bIdx === 1 && <Banknote className="w-3.5 h-3.5 text-[#8B2628]" />}
                    {bIdx === 2 && <RotateCcw className="w-3.5 h-3.5 text-[#8B2628]" />}
                    <span>{badge}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-4 flex justify-center lg:justify-start">
                <button
                  id="btn-hero-cta"
                  onClick={() => {
                    setCurrentView('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn-press px-8 py-3.5 bg-[#8B2628] hover:bg-[#721E20] text-white text-sm font-bold tracking-wider rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 uppercase group cursor-pointer"
                >
                  <span>{current.ctaText || 'SHOP NOW'}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

          </div>

          {/* Slider Prev / Next Arrows */}
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="btn-press absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#2C2926] shadow-md flex items-center justify-center transition-all z-20 focus:outline-none cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="btn-press absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#2C2926] shadow-md flex items-center justify-center transition-all z-20 focus:outline-none cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-20">
            {slides.map((_, sIdx) => (
              <button
                key={sIdx}
                onClick={() => setCurrentSlide(sIdx)}
                aria-label={`Go to slide ${sIdx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  currentSlide === sIdx 
                    ? 'w-7 h-2 bg-[#8B2628]' 
                    : 'w-2 h-2 bg-[#C2B5A5] hover:bg-[#8B2628]/50'
                }`}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};
