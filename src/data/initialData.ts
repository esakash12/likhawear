import { Product, CMSContent, Order, Coupon, CategoryItem } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: "Men's Casual Button Down Shirt",
    slug: 'mens-casual-button-down-shirt',
    category: 'MEN',
    subcategory: 'Casual Shirts',
    price: 550,
    compareAtPrice: 600,
    discountPercent: 8,
    isFeatured: true,
    isTopSelling: true,
    rating: 4.8,
    reviewsCount: 38,
    inStock: true,
    stockCount: 16,
    sku: 'SHIRT-BTN-RED-L',
    colors: [
      {
        name: 'Red',
        hex: '#7A2222',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Olive',
        hex: '#556B2F',
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80'
      }
    ],
    sizes: ['M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=1000&q=80'
    ],
    descriptionEn: "Stylish men's maroon casual button-down shirt, perfect for everyday wear, office casual, outings, and smart casual styling. The shirt features a classic collar, front button closure, single chest pocket, and long sleeves with a clean rolled-up look. Its deep maroon color gives a premium and elegant appearance that pairs well with jeans, chinos, or formal pants.",
    descriptionBn: "পুরুষদের জন্য প্রিমিয়াম সুতি মারুন ক্যাজুয়াল বাটন-ডাউন শার্ট। দৈনন্দিন ব্যবহার, অফিস ক্যাজুয়াল, আউটিং বা স্মার্ট ক্যাজুয়াল লুকের জন্য উপযুক্ত। ক্লাসিক কলার, সামনের বাটন ক্লোজার এবং একটি বুক পকেটের সাথে নিখুঁত ফিনিশিং।",
    tags: ["men's maroon shirt", "casual button down shirt", "men casual shirt", "long sleeve shirt", "gents shirt", "maroon casual shirt", "Zinnia men's fashion"],
    specifications: {
      "Product Type": "Casual Shirt",
      "Gender": "Men",
      "Color": "Maroon, Olive",
      "Sleeve Type": "Long Sleeve",
      "Collar Type": "Classic Collar",
      "Fabric": "100% Breathable Combed Cotton",
      "Fit": "Regular Comfort Fit",
      "Care Instructions": "Machine wash cold with like colors, do not bleach"
    },
    productInfo: {
      "Product Type": "Variable",
      "Category": "MEN",
      "SKU": "Shirt Olive L",
      "Stock Status": "In Stock (16 available)"
    }
  },
  {
    id: 'prod-2',
    title: "Premium Cotton Crew Neck T-Shirt for Men",
    slug: 'premium-cotton-crew-neck-t-shirt-for-men',
    category: 'MEN',
    subcategory: 'Polo T-Shirts',
    price: 450,
    compareAtPrice: 500,
    discountPercent: 10,
    isFeatured: true,
    isTopSelling: true,
    rating: 4.9,
    reviewsCount: 52,
    inStock: true,
    stockCount: 24,
    sku: 'TSHIRT-CREW-NVY',
    colors: [
      {
        name: 'Navy Blue',
        hex: '#1E293B',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Burgundy',
        hex: '#6A1A24',
        image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80'
      }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80'
    ],
    descriptionEn: "Experience supreme comfort with our heavy-gauge 100% organic cotton crew neck t-shirt. Specially pre-shrunk and bio-washed for lasting softness and zero color bleeding.",
    descriptionBn: "১০০% প্রিমিয়াম অর্গানিক সুতি গোলগলা টি-শার্ট। নরম ও দীর্ঘস্থায়ী ফেব্রিকে নিখুঁত সেলাই।",
    tags: ["cotton t-shirt", "men crew neck", "navy t-shirt", "summer casual"],
    specifications: {
      "Product Type": "Crew Neck T-Shirt",
      "Fabric": "100% Bio-washed Cotton (190 GSM)",
      "Fit": "Regular Fit",
      "Neck": "Ribbed Crew Neck"
    },
    productInfo: {
      "Product Type": "Simple",
      "Category": "MEN",
      "SKU": "TSHIRT-CREW-NVY-L",
      "Stock Status": "In Stock"
    }
  },
  {
    id: 'prod-3',
    title: "Premium Elegant Perfume - Golden Amber",
    slug: 'premium-elegant-perfume-golden-amber',
    category: 'ACCESSORIES',
    subcategory: 'Perfumes',
    price: 500,
    compareAtPrice: 600,
    discountPercent: 17,
    isFeatured: true,
    isTopSelling: true,
    rating: 4.9,
    reviewsCount: 44,
    inStock: true,
    stockCount: 18,
    sku: 'PERF-GLD-AMBER-50',
    colors: [
      {
        name: 'Golden Amber',
        hex: '#D99B26',
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80'
      }
    ],
    sizes: ['50ml', '100ml'],
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=80'
    ],
    descriptionEn: "An alluring oriental and woody fragrance capturing warm amber, subtle vanilla notes, and cedarwood undertones. Long-lasting luxury projection designed for evening sophistication.",
    descriptionBn: "দীর্ঘস্থায়ী সুবাসের প্রিমিয়াম পারফিউম। উষ্ণ অ্যাম্বার ও চন্দন কাঠের মনোমুগ্ধকর সুগন্ধ।",
    tags: ["perfume", "fragrance", "golden amber", "accessories", "luxury"],
    specifications: {
      "Product Type": "Eau De Parfum (EDP)",
      "Longevity": "8 to 12 Hours",
      "Notes": "Amber, Vanilla, Citrus, Cedarwood",
      "Volume": "50ml Flacon"
    },
    productInfo: {
      "Product Type": "Simple",
      "Category": "ACCESSORIES",
      "SKU": "PERF-GLD-AMBER",
      "Stock Status": "In Stock"
    }
  },
  {
    id: 'prod-4',
    title: "Classic Leather Strap Analog Watch",
    slug: 'classic-leather-strap-analog-watch',
    category: 'ACCESSORIES',
    subcategory: 'Watches',
    price: 2100,
    compareAtPrice: 2198,
    discountPercent: 4,
    isFeatured: true,
    isTopSelling: true,
    rating: 4.7,
    reviewsCount: 19,
    inStock: true,
    stockCount: 9,
    sku: 'WATCH-LTHR-BRN',
    colors: [
      {
        name: 'Dark Tan Leather',
        hex: '#8B4513',
        image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80'
      }
    ],
    sizes: ['Standard Dial 40mm'],
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80'
    ],
    descriptionEn: "Timeless analog wrist watch featuring genuine textured leather strap, mineral glass dial, water-resistant casing, and precision Japanese quartz movement.",
    descriptionBn: "জেনুইন লেদার স্ট্র্যাপ ও প্রিসিশন কোয়ার্টজ মুভমেন্টের ক্লাসিক অ্যানালগ ঘড়ি।",
    tags: ["watch", "leather watch", "analog watch", "accessories"],
    specifications: {
      "Dial Diameter": "40 mm",
      "Strap Material": "Genuine Calfskin Leather",
      "Movement": "Japanese Quartz",
      "Water Resistance": "3 ATM / 30m splash-proof"
    },
    productInfo: {
      "Product Type": "Simple",
      "Category": "ACCESSORIES",
      "SKU": "WATCH-LTHR-BRN-01",
      "Stock Status": "In Stock"
    }
  },
  {
    id: 'prod-5',
    title: "Ladies Premium Top Handle Handbag",
    slug: 'ladies-premium-top-handle-handbag',
    category: 'ACCESSORIES',
    subcategory: 'Bags',
    price: 800,
    compareAtPrice: 900,
    discountPercent: 11,
    isFeatured: true,
    isTopSelling: true,
    rating: 4.9,
    reviewsCount: 31,
    inStock: true,
    stockCount: 12,
    sku: 'BAG-HND-BEIGE',
    colors: [
      {
        name: 'Beige Cream',
        hex: '#D2B48C',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Tan Caramel',
        hex: '#966F33',
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80'
      }
    ],
    sizes: ['Medium 28cm x 20cm'],
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80'
    ],
    descriptionEn: "Chic structured top-handle handbag made with premium textured vegan leather, elegant gold-plated hardware, multiple interior organizers, and detachable shoulder strap.",
    descriptionBn: "প্রিমিয়াম টেক্সচার্ড লেদারের মহিলাদের হ্যান্ডব্যাগ। আরামদায়ক হাতল ও গর্জিয়াস লুক।",
    tags: ["handbag", "women bag", "tote", "fashion accessories"],
    specifications: {
      "Material": "Structured PU Leather",
      "Closure": "Metallic Lock Clasp",
      "Compartments": "2 main, 1 zippered inner pocket"
    },
    productInfo: {
      "Product Type": "Variable",
      "Category": "ACCESSORIES",
      "SKU": "BAG-HND-BEIGE",
      "Stock Status": "In Stock"
    }
  },
  {
    id: 'prod-6',
    title: "Men's Classic Chino Pant",
    slug: 'mens-classic-chino-pant',
    category: 'MEN',
    subcategory: 'Jeans & Pants',
    price: 700,
    compareAtPrice: 800,
    discountPercent: 13,
    isFeatured: true,
    isTopSelling: true,
    rating: 4.8,
    reviewsCount: 27,
    inStock: true,
    stockCount: 14,
    sku: 'CHINO-MEN-KHK',
    colors: [
      {
        name: 'Khaki Beige',
        hex: '#C3B091',
        image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Olive Gray',
        hex: '#708238',
        image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80'
      }
    ],
    sizes: ['30', '32', '34', '36'],
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80'
    ],
    descriptionEn: "Tailored slim-straight fit stretch chinos designed for everyday versatility. Crafted from soft cotton twill with 2% elastane for maximum flexibility and breathability.",
    descriptionBn: "স্ট্রেচ কটন টুইল কাপড়ের ক্লাসিক চিনো প্যান্ট। অফিস ও ক্যাজুয়াল ব্যবহারের উপযোগী।",
    tags: ["chino pant", "men trousers", "khaki pants", "formal casual"],
    specifications: {
      "Fabric": "98% Cotton, 2% Spandex Twill",
      "Fit": "Slim Straight Fit",
      "Pockets": "4 Pocket Design"
    },
    productInfo: {
      "Product Type": "Variable",
      "Category": "MEN",
      "SKU": "CHINO-MEN-KHK-32",
      "Stock Status": "In Stock"
    }
  },
  {
    id: 'prod-7',
    title: "Women's Embroidered Cotton Kurti - Mustard & Mint Green",
    slug: 'womens-embroidered-cotton-kurti-mustard-mint-green',
    category: 'WOMEN',
    subcategory: 'Tops',
    price: 1100,
    compareAtPrice: 1200,
    discountPercent: 8,
    isFeatured: true,
    isTopSelling: true,
    rating: 4.9,
    reviewsCount: 65,
    inStock: true,
    stockCount: 11,
    sku: 'KURTI-EMB-MST',
    colors: [
      {
        name: 'Mustard Yellow',
        hex: '#E1AD01',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Mint Green',
        hex: '#98FF98',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'
      }
    ],
    sizes: ['36', '38', '40', '42'],
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'
    ],
    descriptionEn: "Graceful handcrafted kurti with delicate Kashmiri-inspired neckline threadwork and border detailing. Made from breathable handloom cotton ideal for the Bangladeshi climate.",
    descriptionBn: "হাতে কাজ করা গলার এমব্রয়ডারি সহ প্রিমিয়াম সুতি কুর্তি। মার্জিত ও আরামদায়ক।",
    tags: ["kurti", "women cotton kurti", "embroidered kurti", "ethnic wear"],
    specifications: {
      "Fabric": "100% Handloom Cotton",
      "Work": "Fine Resham Thread Embroidery",
      "Length": "Knee Length 42 inches"
    },
    productInfo: {
      "Product Type": "Variable",
      "Category": "WOMEN",
      "SKU": "KURTI-EMB-MST-38",
      "Stock Status": "In Stock"
    }
  },
  {
    id: 'prod-8',
    title: "Women's Embroidered Three Piece Set - Dusty Blue & Dusty Pink",
    slug: 'womens-embroidered-three-piece-set-dusty-blue-dusty-pink',
    category: 'WOMEN',
    subcategory: 'Dresses',
    price: 1600,
    compareAtPrice: 2000,
    discountPercent: 20,
    isFeatured: true,
    isTopSelling: true,
    rating: 5.0,
    reviewsCount: 48,
    inStock: true,
    stockCount: 8,
    sku: '3PCS-EMB-DBL',
    colors: [
      {
        name: 'Dusty Blue',
        hex: '#6B8E23',
        image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Dusty Pink',
        hex: '#DDA0DD',
        image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80'
      }
    ],
    sizes: ['M (38)', 'L (40)', 'XL (42)'],
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80'
    ],
    descriptionEn: "Complete 3-piece luxury ensemble comprising heavily embroidered kamiz, straight cut cigarette pants, and a semi-sheer tissue organza dupatta with intricate lace borders.",
    descriptionBn: "খুব সুন্দর সূচিকর্মের কামিজ, প্যান্ট ও অর্গানজা ওড়না সহ সম্পূর্ণ থ্রি-পিস সেট।",
    tags: ["three piece", "salwar kameez", "embroidered dress", "eid collection"],
    specifications: {
      "Kamiz Fabric": "Pure Slub Cotton with Zari Embroidery",
      "Dupatta": "Silk Organza with Cutwork Lace",
      "Pant": "Stretch Cotton Trouser"
    },
    productInfo: {
      "Product Type": "Variable",
      "Category": "WOMEN",
      "SKU": "3PCS-EMB-DBL-40",
      "Stock Status": "In Stock"
    }
  },
  {
    id: 'prod-9',
    title: "Classic Leather Style Wallet - Tan & Dark Brown",
    slug: 'classic-leather-style-wallet-tan-dark-brown',
    category: 'ACCESSORIES',
    subcategory: 'Wallets',
    price: 600,
    compareAtPrice: 700,
    discountPercent: 14,
    isFeatured: true,
    isTopSelling: true,
    rating: 4.8,
    reviewsCount: 22,
    inStock: true,
    stockCount: 25,
    sku: 'WLT-LTHR-BRN',
    colors: [
      {
        name: 'Tan Brown',
        hex: '#A0522D',
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80'
      }
    ],
    sizes: ['Bi-Fold Standard'],
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80'
    ],
    descriptionEn: "Refined bi-fold men's wallet with RFID blocking technology, 8 card slots, 2 full cash compartments, and a transparent photo ID window.",
    descriptionBn: "জেনুইন লেদারের আরএফআইডি প্রটেক্টেড আধুনিক মানিব্যাগ।",
    tags: ["wallet", "leather wallet", "men accessories"],
    specifications: {
      "Material": "Full Grain Leather",
      "Slots": "8 Cards, 2 Currency, 1 ID",
      "Feature": "RFID Blocking Protection"
    },
    productInfo: {
      "Product Type": "Simple",
      "Category": "ACCESSORIES",
      "SKU": "WLT-LTHR-BRN-01",
      "Stock Status": "In Stock"
    }
  },
  {
    id: 'prod-10',
    title: "Classic Wayfarer Sunglasses - Tortoise Brown & Black",
    slug: 'classic-wayfarer-sunglasses-tortoise-brown-black',
    category: 'ACCESSORIES',
    subcategory: 'Sunglasses',
    price: 600,
    compareAtPrice: 700,
    discountPercent: 14,
    isFeatured: true,
    isTopSelling: true,
    rating: 4.6,
    reviewsCount: 17,
    inStock: true,
    stockCount: 15,
    sku: 'SUN-WAYF-BRN',
    colors: [
      {
        name: 'Tortoise Brown',
        hex: '#5C3317',
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80'
      }
    ],
    sizes: ['Medium Unisex Frame'],
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80'
    ],
    descriptionEn: "Timeless wayfarer sunglasses with UV400 polarized protective lenses and durable lightweight acetate frame. Includes protective case and micro-fiber cloth.",
    descriptionBn: "ইউভি ৪০০ প্রোটেকশন পোলারাইজড লেন্সের স্টাইলিশ সানগ্লাস।",
    tags: ["sunglasses", "wayfarer", "shades", "accessories"],
    specifications: {
      "Lens": "Polarized UV400 Protection",
      "Frame Material": "Handcrafted Acetate",
      "Gender": "Unisex"
    },
    productInfo: {
      "Product Type": "Simple",
      "Category": "ACCESSORIES",
      "SKU": "SUN-WAYF-BRN",
      "Stock Status": "In Stock"
    }
  },
  {
    id: 'prod-11',
    title: "Women's Embroidered Party Wear Saree - Maroon & Royal Blue",
    slug: 'womens-embroidered-party-wear-saree-maroon-royal-blue',
    category: 'WOMEN',
    subcategory: 'Sarees',
    price: 2500,
    compareAtPrice: 3000,
    discountPercent: 17,
    isFeatured: true,
    isTopSelling: true,
    rating: 5.0,
    reviewsCount: 42,
    inStock: true,
    stockCount: 7,
    sku: 'SAREE-PTY-MRN',
    colors: [
      {
        name: 'Royal Maroon',
        hex: '#800000',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Royal Blue',
        hex: '#002366',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80'
      }
    ],
    sizes: ['Full 12 Haath Saree + Unstitched Blouse Piece'],
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80'
    ],
    descriptionEn: "Regal party wear silk saree with grand golden Zari woven anchal and delicate embroidered all-over buti work. Includes matching unstitched blouse fabric.",
    descriptionBn: "বিয়ে ও উৎসবের জন্য ঐতিহ্যবাহী গর্জিয়াস সিল্ক শাড়ি। জমকালো জরি আঁচল।",
    tags: ["saree", "party wear saree", "silk saree", "bangladeshi saree"],
    specifications: {
      "Fabric": "Art Semi Silk with Rich Zari Weave",
      "Length": "6.3 Meters (Including Blouse)",
      "Occasion": "Festive, Wedding, Reception"
    },
    productInfo: {
      "Product Type": "Variable",
      "Category": "WOMEN",
      "SKU": "SAREE-PTY-MRN",
      "Stock Status": "In Stock"
    }
  },
  {
    id: 'prod-12',
    title: "Men's Premium Traditional Panjabi - Ivory White",
    slug: 'mens-premium-traditional-panjabi-ivory-white',
    category: 'MEN',
    subcategory: 'Polo T-Shirts',
    price: 1850,
    compareAtPrice: 2200,
    discountPercent: 16,
    isFeatured: true,
    isTopSelling: true,
    rating: 4.9,
    reviewsCount: 39,
    inStock: true,
    stockCount: 13,
    sku: 'PANJ-PREM-IVR',
    colors: [
      {
        name: 'Ivory White',
        hex: '#FFFFF0',
        image: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Jet Black',
        hex: '#111111',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80'
      }
    ],
    sizes: ['40', '42', '44', '46'],
    images: [
      'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80'
    ],
    descriptionEn: "Exclusive festive cotton silk panjabi adorned with minimal collar and placket thread embroidery, paired with metallic vintage buttons.",
    descriptionBn: "উৎসবের জন্য আরামদায়ক কটন সিল্কের এক্সক্লুসিভ কাজ করা পাঞ্জাবি।",
    tags: ["panjabi", "men traditional", "eid panjabi", "ivory white"],
    specifications: {
      "Fabric": "Cotton Silk Blend",
      "Cut": "Tailored Semi-Fitting Regular",
      "Embroidery": "Hand Thread Embroidered Collar & Placket"
    },
    productInfo: {
      "Product Type": "Variable",
      "Category": "MEN",
      "SKU": "PANJ-PREM-IVR-42",
      "Stock Status": "In Stock"
    }
  }
];

export const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-men',
    name: 'MEN',
    slug: 'men',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
    subcategories: [
      { name: 'Polo T-Shirts', group: 'Topwear' },
      { name: 'Casual Shirts', group: 'Topwear' },
      { name: 'Jeans & Pants', group: 'Bottomwear' },
      { name: 'Watches', group: 'Watches' }
    ]
  },
  {
    id: 'cat-women',
    name: 'WOMEN',
    slug: 'women',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    subcategories: [
      { name: 'Dresses', group: 'Clothing' },
      { name: 'Tops', group: 'Clothing' },
      { name: 'Sarees', group: 'Clothing' },
      { name: 'Heels & Sandals', group: 'Footwear' },
      { name: 'Bags', group: 'Bags' }
    ]
  },
  {
    id: 'cat-accessories',
    name: 'ACCESSORIES',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    subcategories: [
      { name: 'Wallets', group: 'Fashion Accessories' },
      { name: 'Belts', group: 'Fashion Accessories' },
      { name: 'Sunglasses', group: 'Fashion Accessories' },
      { name: 'Perfumes', group: 'Beauty' },
      { name: 'Body Mists', group: 'Beauty' }
    ]
  }
];

export const INITIAL_CMS: CMSContent = {
  siteInfo: {
    brandName: "ZINNIA",
    brandSubtitle: "BANGLADESH",
    description: "Online fashion for shoppers across Bangladesh, with sarees, salwar kameez, kurtis, panjabi, and everyday clothing selected for simple shopping and reliable support.",
    email: "zinniabangladesh@gmail.com",
    phone: "01705568795",
    whatsappNumber: "+8801705568795",
    address: "Cumilla, Bangladesh",
    workingHours: "Saturday - Thursday, 10 AM to 08 PM",
    announcementTicker: [
      "EASY RETURN",
      "QUALITY CHECKED",
      "FAST DELIVERY",
      "MADE IN BANGLADESH",
      "SECURE CHECKOUT",
      "CASH ON DELIVERY"
    ],
    logoUrl: "",
    faviconUrl: "",
    whatsappTemplate: "Hello {brand_name}! I would like to {action}:\nProduct: {product_title}\nColor: {color}\nSize: {size}\nQuantity: {quantity}\nPrice: Tk {price}\nURL: {product_url}"
  },
  heroSlides: [
    {
      id: 'slide-1',
      eyebrow: "DISCOVER. SHOP. SHINE.",
      title: "FAMILY COLLECTION",
      subtitle: "Style for Everyone",
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=85",
      ctaText: "SHOP NOW",
      ctaLink: "/shop",
      badges: ["QUALITY CHECKED", "CASH ON DELIVERY", "EASY RETURNS"]
    },
    {
      id: 'slide-2',
      eyebrow: "DISCOVER. SHOP. SHINE.",
      title: "WOMEN'S COLLECTION",
      subtitle: "Style at Your Fingertips",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=85",
      ctaText: "EXPLORE NOW",
      ctaLink: "/shop?category=WOMEN",
      badges: ["NEW ARRIVALS", "CASH ON DELIVERY", "PREMIUM FABRIC"]
    },
    {
      id: 'slide-3',
      eyebrow: "DISCOVER. SHOP. SHINE.",
      title: "MEN'S COLLECTION",
      subtitle: "Effortless Elegance",
      image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1920&q=85",
      ctaText: "SHOP MEN",
      ctaLink: "/shop?category=MEN",
      badges: ["BEST PRICES", "PURE COTTON", "EXPRESS SHIPPING"]
    }
  ],
  categoryHighlights: {
    title: "Shop by Category",
    subtitle: "Discover our main collections and find exactly what you're looking for."
  },
  lookbook: {
    eyebrow: "STYLE GALLERY",
    title: "Zinnia Lookbook",
    subtitle: "Style inspiration from our latest collections",
    items: [
      {
        id: 'look-1',
        title: "Timeless Elegance",
        subtitle: "Traditional aesthetics crafted with modern silhouettes",
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
        link: "/shop?category=WOMEN",
        buttonText: "Explore Collection"
      },
      {
        id: 'look-2',
        title: "Everyday Chic",
        subtitle: "Effortless casuals for modern women on the go",
        image: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=800&q=80",
        link: "/shop?category=WOMEN",
        buttonText: "Explore Collection"
      },
      {
        id: 'look-3',
        title: "Effortless Style",
        subtitle: "Crisp shirts, chinos, and refined panjabis for men",
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
        link: "/shop?category=MEN",
        buttonText: "Shop Men"
      }
    ]
  },
  zinniaStandard: {
    eyebrow: "THE ZINNIA STANDARD",
    title: "Crafted with Love & Tradition",
    description: "We blend authentic materials with modern elegance, ensuring every piece reflects our rich heritage of Bangladeshi craftsmanship.",
    features: [
      {
        id: 'feat-1',
        title: "Quality Checked",
        desc: "Every piece is meticulously inspected before dispatch to ensure fabric, stitching, finishing, and packaging exceed expectations.",
        iconName: "ShieldCheck"
      },
      {
        id: 'feat-2',
        title: "Cash on Delivery",
        desc: "Shop with confidence and ease. Pay securely only when your beautiful garments arrive safely at your doorstep.",
        iconName: "Banknote"
      },
      {
        id: 'feat-3',
        title: "Effortless Returns",
        desc: "Your satisfaction is our priority. If an item isn't quite right, our return and exchange process is delightfully simple.",
        iconName: "RotateCcw"
      },
      {
        id: 'feat-4',
        title: "Dedicated Support",
        desc: "Questions about sizing or delivery? Our dedicated styling and support team is always here to assist you promptly.",
        iconName: "Headphones"
      }
    ]
  },
  brandStory: {
    eyebrow: "ABOUT OUR BRAND",
    title: "Bangladesh's Online Store for Traditional & Modern Fashion Online",
    description: "A Bangladesh-based online clothing brand delivering high-quality sarees, salwar kameez, kurtis, panjabi, and accessories directly to clients all around the country. We celebrate authentic fabrics, comfortable cuts, and timeless styling crafted for modern lives.",
    highlight: "Transparent pricing, cash on delivery, fast nationwide delivery, and a straightforward return policy make new collections launch each week on your computer or phone."
  },
  faqs: {
    eyebrow: "FREQUENTLY ASKED QUESTIONS",
    title: "Shopping with Zinnia",
    items: [
      {
        id: 'faq-1',
        question: "Does Zinnia deliver across Bangladesh?",
        answer: "Yes! We proudly deliver to all 64 districts across Bangladesh via trusted courier partners (Steadfast, Pathao, RedX, and eCourier). Standard delivery takes 2-3 business days inside Dhaka and 3-5 business days outside Dhaka."
      },
      {
        id: 'faq-2',
        question: "Is cash on delivery available on Zinnia?",
        answer: "Yes, Cash on Delivery (COD) is available nationwide for all our customers without any advance fee required for standard retail orders."
      },
      {
        id: 'faq-3',
        question: "What is Zinnia's return and exchange policy?",
        answer: "We offer a 7-day hassle-free return and exchange guarantee. If an item has size mismatch or manufacturing defect, simply contact our support line or message us on WhatsApp with your Order ID."
      },
      {
        id: 'faq-4',
        question: "How can I track my order?",
        answer: "Click on 'Track your order' in our top menu or bottom bar, enter your Order Number (e.g. ZN-260520-ABCD) along with the phone number used at checkout to see real-time updates."
      }
    ]
  },
  policies: {
    aboutUs: `### Welcome to Zinnia Bangladesh

Zinnia is Bangladesh's premier destination for thoughtfully curated modern and traditional apparel. Founded with the mission to bring authentic craftsmanship directly to conscious shoppers, we celebrate our rich heritage with contemporary sensibilities.

From handloom kurtis and majestic festive sarees to sharp casual button-downs and tailored chinos, each creation is crafted using carefully sourced materials, rigorous stitching inspections, and sustainable packaging.

We operate our main hub in **Cumilla, Bangladesh**, serving discerning customers nationwide from Sylhet to Chattogram, Dhaka to Rajshahi.`,
    termsAndConditions: `### Terms & Conditions

1. **Ordering & Acceptance**: Placing an order constitutes an offer to purchase. We reserve the right to verify order details via telephone or SMS before dispatch.
2. **Pricing & Availability**: All prices are listed in Bangladeshi Taka (BDT / Tk) inclusive of applicable taxes.
3. **Cash on Delivery**: Please ensure you or an authorized representative is present with the exact cash amount upon delivery.
4. **Cancellations**: Orders can be canceled free of charge before they enter the 'Shipped' status.`,
    privacyPolicy: `### Privacy & Cookie Policy

Your personal information (name, phone number, delivery address) is strictly collected solely for order fulfillment, courier delivery notification, and customer support. We do not sell, rent, or lease customer data to any third-party advertisers.`,
    shippingPolicy: `### Delivery & Shipping Policy

- **Inside Dhaka**: Tk 60 delivery fee (Delivered within 24-48 hours)
- **Outside Dhaka**: Tk 130 delivery fee (Delivered within 2-4 business days across all 64 districts)
- **Free Shipping**: Available for orders over Tk 3,000!
- **Real-time Tracking**: Every customer receives an SMS and can track live status directly through our website.`,
    refundPolicy: `### Refund & Exchange Policy

If you receive an item with a manufacturing defect, damaged packaging, or incorrect size:
1. Notify us within 48 hours of receipt via WhatsApp at +8801705568795.
2. Keep tags attached and garments unworn.
3. We will arrange a doorstep exchange or process your refund via bKash / bank transfer within 3-5 business days.`,
    contactUs: `### Contact Zinnia Customer Care

We are always delighted to assist you with styling advice, sizing inquiries, or order status.

- **Helpline Phone**: 01705568795
- **WhatsApp Support**: +8801705568795
- **Email**: zinniabangladesh@gmail.com
- **Store Location**: Cumilla, Bangladesh
- **Customer Support Hours**: Saturday - Thursday, 10:00 AM to 08:00 PM (Friday Closed)`
  },
  shipping: {
    insideDhakaFee: 60,
    outsideDhakaFee: 130,
    freeShippingThreshold: 3000,
    estimatedDeliveryDays: "2-5 business days"
  }
};

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: "ZINNIA10",
    discountType: "percentage",
    discountValue: 10,
    minOrder: 800,
    active: true
  },
  {
    code: "SAVE50",
    discountType: "fixed",
    discountValue: 50,
    minOrder: 500,
    active: true
  },
  {
    code: "EIDSPECIAL",
    discountType: "percentage",
    discountValue: 15,
    minOrder: 2000,
    active: true
  }
];

export const BANGLADESH_DISTRICTS = [
  "Dhaka",
  "Chattogram",
  "Cumilla",
  "Sylhet",
  "Gazipur",
  "Narayanganj",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Bogra",
  "Brahmanbaria",
  "Cox's Bazar",
  "Dinajpur",
  "Faridpur",
  "Feni",
  "Habiganj",
  "Jamalpur",
  "Jashore",
  "Kishoreganj",
  "Kushtia",
  "Manikganj",
  "Munshiganj",
  "Narsingdi",
  "Noakhali",
  "Pabna",
  "Sirajganj",
  "Tangail"
];
