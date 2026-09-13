import React from 'react';
import { HeroSlider } from '../components/HeroSlider';
import { FeatureBar } from '../components/FeatureBar';
import { CategoryBanners } from '../components/CategoryBanners';
import { ProductCard } from '../components/ProductCard';
import { LookbookSection } from '../components/LookbookSection';
import { ZinniaStandard } from '../components/ZinniaStandard';
import { FaqSection } from '../components/FaqSection';
import { useStore } from '../context/StoreContext';
import { ArrowRight } from 'lucide-react';

export const HomeView: React.FC = () => {
  const { products, setCurrentView, cms } = useStore();
  const brandName = cms?.siteInfo?.brandName || 'Brand';

  // Filter top selling or featured products
  const topSellingProducts = products.filter(p => p.isTopSelling || p.isFeatured).slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* 1. Hero Slider Banner */}
      <HeroSlider />

      {/* 2. Feature bar */}
      <FeatureBar />

      {/* 3. Shop by Category */}
      <CategoryBanners />

      {/* 4. Top Selling Products Section */}
      <section className="py-12 sm:py-16 bg-[#FCFBF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-xs font-bold tracking-[0.25em] text-[#8B2628] uppercase">
              FEATURED COLLECTION
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#1C1A18] tracking-tight mt-1">
              Top Selling Products
            </h2>
            <p className="text-sm text-[#7A7369] mt-1.5 max-w-md mx-auto">
              Handcrafted traditional and contemporary staples curated for your wardrobe.
            </p>
          </div>

          {/* Products Grid (2 on mobile, 3 on tablet, 4 on desktop) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {topSellingProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* View all button */}
          <div className="mt-10 sm:mt-12 text-center">
            <button
              id="btn-view-all-top-selling"
              onClick={() => {
                setCurrentView('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#8B2628] hover:bg-[#721E20] text-white text-xs font-bold tracking-wider rounded-lg shadow-md hover:shadow-lg transition-all uppercase cursor-pointer"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Zinnia Lookbook / Style Gallery */}
      <LookbookSection />

      {/* 6. The Zinnia Standard / Crafted with Love */}
      <ZinniaStandard />

      {/* 7. SEO Brand Story Section */}
      <section className="py-12 bg-[#FAF7F2] border-t border-[#EDE8E0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold tracking-[0.2em] text-[#8B2628] uppercase">
            {cms?.brandStory?.eyebrow?.replace(/Zinnia/gi, brandName) || `ABOUT ${brandName.toUpperCase()} BANGLADESH`}
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A18] mt-1 mb-4">
            {cms?.brandStory?.title?.replace(/Zinnia/gi, brandName) || "Bangladesh's Online Store for Traditional & Modern Fashion Online"}
          </h3>
          <p className="text-xs sm:text-sm text-[#6A6359] leading-relaxed mb-4">
            {cms?.brandStory?.description?.replace(/Zinnia/gi, brandName) || `${brandName} is a Bangladesh-based online clothing brand delivering high-quality sarees, salwar kameez, kurtis, panjabi, and accessories directly to clients all around the country. We celebrate authentic fabrics, comfortable cuts, and timeless styling crafted for modern lives.`}
          </p>
          <p className="text-xs text-[#8C8478] leading-relaxed">
            {cms?.brandStory?.highlight?.replace(/Zinnia/gi, brandName) || "Transparent pricing, cash on delivery, fast nationwide delivery, and a straightforward return policy make new collections launch each week on your computer or phone."}
          </p>
        </div>
      </section>

      {/* 8. FAQs Accordion */}
      <FaqSection />
    </div>
  );
};
