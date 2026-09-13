export interface ProductColor {
  name: string;
  hex: string;
  image?: string;
}

export interface ProductVariant {
  id: string;
  color: string;
  size: string;
  stock: number;
  sku?: string;
  price?: number;
  additionalPrice?: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  subcategory: string;
  price: number;
  compareAtPrice: number;
  discountPercent: number;
  isFeatured?: boolean;
  isTopSelling?: boolean;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockCount: number;
  sku: string;
  colors: ProductColor[];
  sizes: string[];
  images: string[];
  descriptionEn: string;
  descriptionBn: string;
  tags: string[];
  specifications: Record<string, string>;
  productInfo: Record<string, string>;
  variants?: ProductVariant[];
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  subcategories: {
    name: string;
    group: string;
  }[];
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface TrackingEvent {
  status: OrderStatus;
  time: string;
  note: string;
  location?: string;
}

export interface Order {
  id: string;
  userId?: number;
  customerName: string;
  phone: string;
  email?: string;
  district: string;
  area: string;
  address: string;
  addressLabel: 'Home' | 'Office';
  deliveryNote?: string;
  paymentMethod: 'cod' | 'bkash';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  trackingEvents: TrackingEvent[];
  courierName?: string;
  consignmentId?: string;
  courierTrackingCode?: string;
  courierStatus?: string;
}

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  badges: string[];
}

export interface LookbookItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  buttonText: string;
}

export interface ZinniaFeature {
  id: string;
  title: string;
  desc: string;
  iconName: 'ShieldCheck' | 'Banknote' | 'RotateCcw' | 'Headphones' | 'Truck';
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
  active: boolean;
}

export interface CMSContent {
  siteInfo: {
    brandName: string;
    brandSubtitle: string;
    description: string;
    email: string;
    phone: string;
    whatsappNumber: string;
    address: string;
    workingHours: string;
    topBarNotice?: string;
    announcementTicker: string[];
    logoUrl?: string;
    faviconUrl?: string;
    whatsappTemplate?: string;
  };
  heroSlides: HeroSlide[];
  categoryHighlights: {
    title: string;
    subtitle: string;
  };
  lookbook: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: LookbookItem[];
  };
  zinniaStandard: {
    eyebrow: string;
    title: string;
    description: string;
    features: ZinniaFeature[];
  };
  faqs: {
    eyebrow: string;
    title: string;
    items: FAQItem[];
  };
  policies: {
    aboutUs: string;
    termsAndConditions: string;
    privacyPolicy: string;
    shippingPolicy: string;
    refundPolicy: string;
    contactUs: string;
  };
  shipping: {
    insideDhakaFee: number;
    outsideDhakaFee: number;
    freeShippingThreshold: number;
    estimatedDeliveryDays: string;
  };
  metaPixel?: {
    pixelId: string;
    enabled: boolean;
  };
  courierSettings?: {
    steadfast?: {
      apiKey: string;
      secretKey: string;
      testMode?: boolean;
    };
  };
  googleAuth?: {
    clientId: string;
    enabled: boolean;
  };
}

export type StaffRole = 'admin' | 'moderator' | 'viewer';

export interface StaffUser {
  id: number;
  name: string;
  email: string;
  role: StaffRole;
  createdAt?: string;
}

export interface CustomerUser {
  id: number;
  name: string;
  email: string;
  role: 'customer' | string;
  phone?: string;
  address?: string;
  avatar?: string;
}

export type AppView = 
  | 'home' 
  | 'shop' 
  | 'product' 
  | 'checkout' 
  | 'track' 
  | 'policy' 
  | 'order-success'
  | 'customer-dashboard'
  | 'admin';
