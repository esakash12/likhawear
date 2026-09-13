import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CMSContent, Order, Coupon, CategoryItem, OrderItem, AppView, OrderStatus, TrackingEvent, StaffUser, StaffRole, CustomerUser, ProductVariant } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_CMS, INITIAL_ORDERS, INITIAL_COUPONS } from '../data/initialData';
import { initMetaPixel, pixelAddToCart, pixelPurchase, pixelViewContent } from '../utils/analytics';
import { getVariantStock, ensureProductVariants } from '../utils/variantStock';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface StoreContextType {
  products: Product[];
  categories: CategoryItem[];
  cms: CMSContent;
  orders: Order[];
  coupons: Coupon[];
  cart: OrderItem[];
  wishlist: string[];
  
  // Navigation & View states
  currentView: AppView;
  selectedProductSlug: string | null;
  selectedPolicy: keyof CMSContent['policies'];
  selectedCategoryFilter: string | null;
  selectedSubcategoryFilter: string | null;
  searchQuery: string;
  recentPlacedOrder: Order | null;
  
  // Modals & Drawers
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isAuthModalOpen: boolean;
  zoomedImageUrl: string | null;
  toastMessage: string | null;
  
  // Coupon
  appliedCoupon: Coupon | null;
  couponDiscountAmount: number;

  // Customer Auth State
  customerUser: CustomerUser | null;
  customerToken: string | null;
  isCustomerLoggedIn: boolean;
  loginCustomer: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  registerCustomer: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: (credential: string) => Promise<{ success: boolean; message?: string }>;
  logoutCustomer: () => void;
  updateCustomerProfile: (data: { name?: string; phone?: string; address?: string }) => Promise<{ success: boolean; message?: string }>;
  customerOrders: Order[];
  fetchCustomerOrders: () => Promise<void>;

  // Staff User Management (Admin only)
  staffUsers: StaffUser[];
  fetchStaffUsers: () => Promise<void>;
  createStaffUser: (user: { name: string; email: string; password: string; role: StaffRole }) => Promise<{ success: boolean; message?: string }>;
  updateStaffUser: (id: number, data: { name?: string; email?: string; role?: StaffRole; password?: string }) => Promise<{ success: boolean; message?: string }>;
  deleteStaffUser: (id: number) => Promise<{ success: boolean; message?: string }>;

  // Courier Dispatch
  dispatchOrderToCourier: (orderId: string) => Promise<{ success: boolean; message: string; consignmentId?: string; trackingCode?: string }>;

  // Admin Auth State
  adminToken: string | null;
  adminUser: AdminUser | null;
  isAdminLoggedIn: boolean;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logoutAdmin: () => Promise<void>;
  uploadImage: (file: File) => Promise<string | null>;
  trackOrderApi: (orderIdOrPhone: string) => Promise<Order[]>;

  // Actions
  setCurrentView: (view: AppView) => void;
  setSelectedProductSlug: (slug: string | null) => void;
  setSelectedPolicy: (policyKey: keyof CMSContent['policies']) => void;
  setSelectedCategoryFilter: (cat: string | null) => void;
  setSelectedSubcategoryFilter: (subcat: string | null) => void;
  setSearchQuery: (q: string) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsWishlistOpen: (open: boolean) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setZoomedImageUrl: (url: string | null) => void;
  showToast: (msg: string) => void;

  // Cart actions
  addToCart: (product: Product, selectedColor?: string, selectedSize?: string, quantity?: number) => boolean;
  updateCartQty: (productId: string, selectedColor: string, selectedSize: string, delta: number) => void;
  removeFromCart: (productId: string, selectedColor: string, selectedSize: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  getVariantStock: (product: Product, selectedColor?: string, selectedSize?: string) => number;

  // Wishlist actions
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Order actions
  placeOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'trackingEvents' | 'status'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string, location?: string) => Promise<void>;
  addOrderTrackingEvent: (orderId: string, status: OrderStatus, note: string, location?: string) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  refreshOrders: () => Promise<void>;

  // CMS actions
  updateCMS: (newCMS: Partial<CMSContent> | CMSContent) => Promise<void>;
  updateCms: (newCMS: Partial<CMSContent> | CMSContent) => Promise<void>;
  resetCMSToDefault: () => void;
  resetToDemoData: () => void;

  // Product CRUD
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;

  // Coupon actions
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  addCoupon: (coupon: Coupon) => Promise<void>;
  deleteCoupon: (code: string) => Promise<void>;

  // Category actions
  updateCategories: (cats: CategoryItem[]) => Promise<void>;

  // Navigation helpers
  viewProduct: (slug: string) => void;
  viewCategory: (categoryName: string, subcategoryName?: string) => void;
  viewPolicy: (policyKey: keyof CMSContent['policies']) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'zinnia_products_v1',
  CATEGORIES: 'zinnia_categories_v1',
  CMS: 'zinnia_cms_v1',
  ORDERS: 'zinnia_orders_v1',
  COUPONS: 'zinnia_coupons_v1',
  CART: 'zinnia_cart_v1',
  WISHLIST: 'zinnia_wishlist_v1',
  ADMIN_TOKEN: 'zinnia_admin_token',
  ADMIN_USER: 'zinnia_admin_user',
  CUSTOMER_TOKEN: 'zinnia_customer_token',
  CUSTOMER_USER: 'zinnia_customer_user',
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State Initialization with local storage fallback
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const list = saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
      return Array.isArray(list) ? list.map(ensureProductVariants) : [];
    } catch {
      return INITIAL_PRODUCTS.map(ensureProductVariants);
    }
  });

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [cms, setCms] = useState<CMSContent>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_CMS,
          ...parsed,
          siteInfo: {
            ...INITIAL_CMS.siteInfo,
            ...(parsed?.siteInfo || {})
          },
          policies: {
            ...INITIAL_CMS.policies,
            ...(parsed?.policies || {})
          },
          shipping: {
            ...INITIAL_CMS.shipping,
            ...(parsed?.shipping || {})
          },
          metaPixel: {
            ...INITIAL_CMS.metaPixel,
            ...(parsed?.metaPixel || {})
          }
        };
      }
      return INITIAL_CMS;
    } catch {
      return INITIAL_CMS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COUPONS);
      return saved ? JSON.parse(saved) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });

  const [cart, setCart] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Customer Auth State
  const [customerToken, setCustomerToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CUSTOMER_TOKEN);
    } catch {
      return null;
    }
  });

  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMER_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const isCustomerLoggedIn = !!customerToken && !!customerUser;

  // Staff Users (Admin only)
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);

  // Admin Auth State
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
    } catch {
      return null;
    }
  });

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isAdminLoggedIn = !!adminToken && !!adminUser;

  // Meta Pixel initialization
  useEffect(() => {
    if (cms?.metaPixel?.enabled && cms?.metaPixel?.pixelId) {
      initMetaPixel(cms.metaPixel.pixelId);
    }
  }, [cms?.metaPixel]);

  // Dynamically synchronize browser title and favicon with CMS Branding
  useEffect(() => {
    if (cms?.siteInfo?.brandName) {
      const subtitle = cms.siteInfo.brandSubtitle ? ` - ${cms.siteInfo.brandSubtitle}` : '';
      document.title = `${cms.siteInfo.brandName}${subtitle} | Fashion & Lifestyle`;
    }
    if (cms?.siteInfo?.faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = cms.siteInfo.faviconUrl;
    }
  }, [cms?.siteInfo?.brandName, cms?.siteInfo?.brandSubtitle, cms?.siteInfo?.faviconUrl]);

  // Navigation & View states
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<keyof CMSContent['policies']>('aboutUs');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentPlacedOrder, setRecentPlacedOrder] = useState<Order | null>(null);

  // Modals & UI States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  }, [wishlist]);

  // Load live data from Laravel API on mount
  useEffect(() => {
    // 1. Fetch Products
    fetch('/api/products')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data)) {
          const normalized = data.map(ensureProductVariants);
          setProducts(normalized);
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(normalized));
        }
      })
      .catch(() => {});

    // 2. Fetch Categories
    fetch('/api/categories')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data));
        }
      })
      .catch(() => {});

    // 3. Fetch CMS Settings
    fetch('/api/cms')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && typeof data === 'object') {
          setCms(prev => {
            const merged: CMSContent = {
              ...INITIAL_CMS,
              ...prev,
              ...data,
              siteInfo: {
                ...INITIAL_CMS.siteInfo,
                ...(prev?.siteInfo || {}),
                ...(data?.siteInfo || {})
              },
              policies: {
                ...INITIAL_CMS.policies,
                ...(prev?.policies || {}),
                ...(data?.policies || {})
              },
              shipping: {
                ...INITIAL_CMS.shipping,
                ...(prev?.shipping || {}),
                ...(data?.shipping || {})
              },
              metaPixel: {
                ...INITIAL_CMS.metaPixel,
                ...(prev?.metaPixel || {}),
                ...(data?.metaPixel || {})
              }
            };
            localStorage.setItem(STORAGE_KEYS.CMS, JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  // Fetch admin orders & coupons when admin is logged in
  const refreshOrders = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Accept': 'application/json',
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data));
      }
    } catch (e) {
      console.error('Failed to refresh orders from API', e);
    }
  };

  const refreshCoupons = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/coupons', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Accept': 'application/json',
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
        localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(data));
      }
    } catch (e) {
      console.error('Failed to refresh coupons from API', e);
    }
  };

  useEffect(() => {
    if (adminToken) {
      refreshOrders();
      refreshCoupons();
    }
  }, [adminToken]);

  // Load customer orders if logged in
  useEffect(() => {
    if (customerToken) {
      fetchCustomerOrders();
    }
  }, [customerToken]);

  // Admin Auth Actions
  const loginAdmin = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || 'Login failed. Please check credentials.' };
      }

      setAdminToken(data.token);
      setAdminUser(data.user);
      localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(data.user));
      showToast(`Welcome back, ${data.user.name}!`);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error connecting to backend.' };
    }
  };

  const logoutAdmin = async () => {
    if (adminToken) {
      try {
        await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Accept': 'application/json'
          }
        });
      } catch (e) {}
    }

    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
    showToast('Signed out of admin dashboard');
  };

  // Customer Auth Actions
  const loginCustomer = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Login failed.' };
      }
      setCustomerToken(data.token);
      setCustomerUser(data.user);
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_USER, JSON.stringify(data.user));
      showToast(`Welcome back, ${data.user.name}!`);
      setIsAuthModalOpen(false);
      fetchCustomerOrders(data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error.' };
    }
  };

  const registerCustomer = async (name: string, email: string, password: string, phone?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Registration failed.' };
      }
      setCustomerToken(data.token);
      setCustomerUser(data.user);
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_USER, JSON.stringify(data.user));
      showToast(`Welcome to Zinnia, ${data.user.name}!`);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error.' };
    }
  };

  const loginWithGoogle = async (credential: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Google sign-in failed.' };
      }
      setCustomerToken(data.token);
      setCustomerUser(data.user);
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_USER, JSON.stringify(data.user));
      showToast(`Signed in with Google as ${data.user.name}!`);
      setIsAuthModalOpen(false);
      fetchCustomerOrders(data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error connecting with Google.' };
    }
  };

  const logoutCustomer = () => {
    if (customerToken) {
      fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${customerToken}`,
          'Accept': 'application/json',
        },
      }).catch(() => {});
    }
    setCustomerToken(null);
    setCustomerUser(null);
    setCustomerOrders([]);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_USER);
    showToast('Signed out of customer account.');
    if (currentView === 'customer-dashboard') {
      setCurrentView('home');
    }
  };

  const updateCustomerProfile = async (data: { name?: string; phone?: string; address?: string }): Promise<{ success: boolean; message?: string }> => {
    if (!customerToken) return { success: false, message: 'Not logged in.' };
    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${customerToken}`,
        },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, message: resData.message || 'Failed to update profile.' };
      }
      setCustomerUser(resData.user);
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_USER, JSON.stringify(resData.user));
      showToast('Profile updated successfully!');
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error.' };
    }
  };

  const fetchCustomerOrders = async (tokenOverride?: string) => {
    const token = tokenOverride || customerToken;
    if (!token) return;
    try {
      const res = await fetch('/api/customer/orders', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCustomerOrders(data.orders || []);
      }
    } catch (e) {}
  };

  // Staff User Management (Super Admin only)
  const fetchStaffUsers = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/users', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setStaffUsers(data.users || []);
      }
    } catch (e) {}
  };

  const createStaffUser = async (user: { name: string; email: string; password: string; role: StaffRole }): Promise<{ success: boolean; message?: string }> => {
    if (adminUser?.role !== 'admin') {
      return { success: false, message: 'শুধুমাত্র সুপার এডমিন নতুন স্টাফ একাউন্ট তৈরি করতে পারবেন।' };
    }
    if (!adminToken) return { success: false, message: 'Admin login required.' };
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(user),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Failed to create user.' };
      }
      showToast(data.message || 'Staff user created successfully!');
      fetchStaffUsers();
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error.' };
    }
  };

  const updateStaffUser = async (id: number, data: { name?: string; email?: string; role?: StaffRole; password?: string }): Promise<{ success: boolean; message?: string }> => {
    if (adminUser?.role !== 'admin') {
      return { success: false, message: 'শুধুমাত্র সুপার এডমিন স্টাফ একাউন্ট এডিট করতে পারবেন।' };
    }
    if (!adminToken) return { success: false, message: 'Admin login required.' };
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, message: resData.message || 'Failed to update user.' };
      }
      showToast(resData.message || 'User updated!');
      fetchStaffUsers();
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error.' };
    }
  };

  const deleteStaffUser = async (id: number): Promise<{ success: boolean; message?: string }> => {
    if (adminUser?.role !== 'admin') {
      return { success: false, message: 'শুধুমাত্র সুপার এডমিন স্টাফ একাউন্ট ডিলিট করতে পারবেন।' };
    }
    if (!adminToken) return { success: false, message: 'Admin login required.' };
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Failed to delete user.' };
      }
      showToast(data.message || 'User deleted.');
      fetchStaffUsers();
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error.' };
    }
  };

  // Courier Dispatch
  const dispatchOrderToCourier = async (orderId: string): Promise<{ success: boolean; message: string; consignmentId?: string; trackingCode?: string }> => {
    if (adminUser?.role === 'viewer') {
      return { success: false, message: 'ভিউ-অনলি একাউন্ট: কুরিয়ারে পাঠানোর অনুমতি নেই।' };
    }
    if (!adminToken) return { success: false, message: 'Admin login required.' };
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/dispatch-courier`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Failed to dispatch courier.' };
      }

      showToast(data.message);
      if (data.order) {
        setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
      } else {
        refreshOrders();
      }
      return {
        success: true,
        message: data.message,
        consignmentId: data.consignment_id,
        trackingCode: data.tracking_code,
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error dispatching courier.' };
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (adminUser?.role === 'viewer') {
      showToast('ভিউ-অনলি একাউন্ট: ছবি আপলোড করার অনুমতি নেই।');
      return null;
    }
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Accept': 'application/json',
        },
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await res.json();
      showToast('Image uploaded successfully!');
      return data.url;
    } catch (err: any) {
      showToast(err.message || 'Failed to upload image.');
      return null;
    }
  };

  const trackOrderApi = async (orderIdOrPhone: string): Promise<Order[]> => {
    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(orderIdOrPhone.trim())}`);
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : [data];
      }
      return [];
    } catch {
      return [];
    }
  };

  // Cart calculations
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const couponDiscountAmount = appliedCoupon
    ? appliedCoupon.discountType === 'percentage'
      ? Math.round((cartSubtotal * appliedCoupon.discountValue) / 100)
      : Math.min(appliedCoupon.discountValue, cartSubtotal)
    : 0;

  const addToCart = (
    product: Product,
    selectedColor: string = product.colors?.[0]?.name || 'Standard',
    selectedSize: string = product.sizes?.[0] || 'Standard',
    quantity: number = 1
  ): boolean => {
    let unitPrice = product.price;
    const cleanColor = (selectedColor || 'Standard').trim();
    const cleanSize = (selectedSize || 'Standard').trim();
    const availableStock = getVariantStock(product, cleanColor, cleanSize);

    if (product.variants && product.variants.length > 0) {
      const matchVariant = product.variants.find(
        v => (!v.color || v.color.trim().toLowerCase() === cleanColor.toLowerCase()) &&
             (!v.size || v.size.trim().toLowerCase() === cleanSize.toLowerCase())
      );
      if (matchVariant && matchVariant.additionalPrice) {
        unitPrice += matchVariant.additionalPrice;
      }
    }

    if (availableStock <= 0) {
      showToast(`Sorry, "${product.title} (${cleanColor} - ${cleanSize})" is currently out of stock!`);
      return false;
    }

    let success = false;
    let toastMessage: string | null = null;
    let actualAdded = 0;

    setCart(prev => {
      const existingIdx = prev.findIndex(
        item =>
          String(item.productId) === String(product.id) &&
          item.selectedColor.trim().toLowerCase() === cleanColor.toLowerCase() &&
          item.selectedSize.trim().toLowerCase() === cleanSize.toLowerCase()
      );

      const currentQty = existingIdx > -1 ? prev[existingIdx].quantity : 0;

      if (currentQty >= availableStock) {
        toastMessage = `Stock limit reached! You already have all ${availableStock} available item(s) in your cart.`;
        return prev;
      }

      const maxCanAdd = availableStock - currentQty;
      const toAdd = Math.min(quantity, maxCanAdd);

      if (toAdd <= 0) {
        toastMessage = `Stock limit reached! Max available: ${availableStock}`;
        return prev;
      }

      success = true;
      actualAdded = toAdd;

      if (toAdd < quantity) {
        toastMessage = `Only ${maxCanAdd} more available. Added ${maxCanAdd} to cart.`;
      } else {
        toastMessage = `Added "${product.title}" (${cleanColor} - ${cleanSize}) to cart!`;
      }

      const chosenColorObj = product.colors?.find(c => c.name.trim().toLowerCase() === cleanColor.toLowerCase());
      const chosenImage = chosenColorObj?.image || product.images[0];

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          price: unitPrice,
          image: chosenImage,
          quantity: currentQty + toAdd
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            title: product.title,
            price: unitPrice,
            image: chosenImage,
            selectedColor: cleanColor,
            selectedSize: cleanSize,
            quantity: toAdd
          }
        ];
      }
    });

    if (toastMessage) {
      showToast(toastMessage);
    }
    if (success && actualAdded > 0) {
      pixelAddToCart(product, actualAdded);
    }
    return success;
  };

  const updateCartQty = (
    productId: string,
    selectedColor: string,
    selectedSize: string,
    delta: number
  ) => {
    const cleanColor = (selectedColor || '').trim().toLowerCase();
    const cleanSize = (selectedSize || '').trim().toLowerCase();
    const product = products.find(p => String(p.id) === String(productId));
    const availableStock = product ? getVariantStock(product, selectedColor, selectedSize) : 99;

    let toastMsg: string | null = null;

    setCart(prev => {
      return prev
        .map(item => {
          if (
            String(item.productId) === String(productId) &&
            item.selectedColor.trim().toLowerCase() === cleanColor &&
            item.selectedSize.trim().toLowerCase() === cleanSize
          ) {
            if (delta > 0 && item.quantity >= availableStock) {
              toastMsg = `Cannot add more. Only ${availableStock} item(s) available in stock!`;
              return item;
            }
            const newQty = item.quantity + delta;
            if (newQty > availableStock) {
              toastMsg = `Max available stock is ${availableStock}!`;
              return { ...item, quantity: availableStock };
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[];
    });

    if (toastMsg) {
      showToast(toastMsg);
    }
  };

  const removeFromCart = (productId: string, selectedColor: string, selectedSize: string) => {
    const cleanColor = (selectedColor || '').trim().toLowerCase();
    const cleanSize = (selectedSize || '').trim().toLowerCase();
    setCart(prev =>
      prev.filter(
        item =>
          !(
            String(item.productId) === String(productId) &&
            item.selectedColor.trim().toLowerCase() === cleanColor &&
            item.selectedSize.trim().toLowerCase() === cleanSize
          )
      )
    );
    showToast('Item removed from cart');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        showToast('Removed from wishlist');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Saved to wishlist');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Orders
  const placeOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'trackingEvents' | 'status'>): Promise<Order> => {
    for (const item of orderData.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        const availableStock = getVariantStock(prod, item.selectedColor, item.selectedSize);
        if (availableStock <= 0) {
          showToast(`Sorry, "${item.title} (${item.selectedColor || ''} - ${item.selectedSize || ''})" is out of stock!`);
          throw new Error(`Item ${item.title} is out of stock.`);
        }
        if (item.quantity > availableStock) {
          showToast(`Sorry, "${item.title} (${item.selectedColor || ''} - ${item.selectedSize || ''})" only has ${availableStock} left in stock.`);
          throw new Error(`Quantity exceeds stock for ${item.title}`);
        }
      }
    }

    const applyStockDecrementLocally = () => {
      setProducts(prevProducts =>
        prevProducts.map(p => {
          const matchingItems = orderData.items.filter(item => item.productId === p.id);
          if (matchingItems.length > 0) {
            let updatedVariants = p.variants ? p.variants.map(v => ({ ...v })) : [];
            matchingItems.forEach(item => {
              if (updatedVariants.length > 0) {
                updatedVariants = updatedVariants.map(v => {
                  const matchColor = !item.selectedColor || !v.color || v.color.toLowerCase() === item.selectedColor.toLowerCase();
                  const matchSize = !item.selectedSize || !v.size || v.size.toLowerCase() === item.selectedSize.toLowerCase();
                  if (matchColor && matchSize) {
                    return { ...v, stock: Math.max(0, v.stock - item.quantity) };
                  }
                  return v;
                });
              }
            });
            const totalQty = matchingItems.reduce((sum, it) => sum + it.quantity, 0);
            const newStock = updatedVariants.length > 0
              ? updatedVariants.reduce((sum, v) => sum + v.stock, 0)
              : Math.max(0, p.stockCount - totalQty);

            return {
              ...p,
              variants: updatedVariants,
              stockCount: newStock,
              inStock: newStock > 0
            };
          }
          return p;
        })
      );
    };

    try {
      const payload = {
        ...orderData,
        user_id: customerUser?.id,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || 'Failed to submit order to server.');
      }

      const newOrder: Order = await res.json();

      // Decrement stock in local state
      applyStockDecrementLocally();

      setOrders(prev => [newOrder, ...prev]);
      setRecentPlacedOrder(newOrder);
      pixelPurchase(newOrder);
      clearCart();
      setAppliedCoupon(null);
      return newOrder;
    } catch (err: any) {
      // If server returned a business/stock error (e.g. 422), do not place offline fallback order
      if (err.message && err.message.includes('stock')) {
        showToast(err.message);
        throw err;
      }

      // Fallback local creation if network offline
      applyStockDecrementLocally();
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      const localId = `ZN-${dateStr}-${randomSuffix}`;
      const localOrder: Order = {
        ...orderData,
        id: localId,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        trackingEvents: [
          {
            status: 'Pending',
            time: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
            note: `Order placed via ${orderData.paymentMethod === 'cod' ? 'COD' : 'bKash'}`,
            location: 'Central Processing Hub'
          }
        ]
      };
      setOrders(prev => [localOrder, ...prev]);
      setRecentPlacedOrder(localOrder);
      clearCart();
      setAppliedCoupon(null);
      return localOrder;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, note?: string, location?: string) => {
    if (adminUser?.role === 'viewer') {
      showToast('ভিউ-অনলি একাউন্ট: স্ট্যাটাস পরিবর্তনের অনুমতি নেই।');
      return;
    }

    if (adminToken) {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({ status, note, location })
        });

        if (res.ok) {
          const updated = await res.json();
          setOrders(prev => prev.map(ord => ord.id === orderId ? updated : ord));
          showToast(`Order #${orderId} updated to ${status}`);
          return;
        } else {
          const err = await res.json().catch(() => ({}));
          showToast(err.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।');
          return;
        }
      } catch (e) {
        console.error(e);
        showToast('নেটওয়ার্ক সমস্যার কারণে আপডেট করা সম্ভব হয়নি।');
        return;
      }
    }

    // Fallback in-memory
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const newEvent: TrackingEvent = {
            status,
            time: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
            note: note || `Order marked as ${status}`
          };
          return {
            ...ord,
            status,
            trackingEvents: [...ord.trackingEvents, newEvent]
          };
        }
        return ord;
      })
    );
    showToast(`Order #${orderId} updated to ${status}`);
  };

  const addOrderTrackingEvent = async (orderId: string, status: OrderStatus, note: string, location?: string) => {
    if (adminUser?.role === 'viewer') {
      showToast('ভিউ-অনলি একাউন্ট: ট্র্যাকিং ইভেন্ট যোগ করার অনুমতি নেই।');
      return;
    }

    if (adminToken) {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}/tracking`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({ status, note, location })
        });

        if (res.ok) {
          const updated = await res.json();
          setOrders(prev => prev.map(ord => ord.id === orderId ? updated : ord));
          showToast(`Tracking milestone added for #${orderId}`);
          return;
        } else {
          const err = await res.json().catch(() => ({}));
          showToast(err.message || 'ট্র্যাকিং আপডেট ব্যর্থ হয়েছে।');
          return;
        }
      } catch (e) {
        console.error(e);
        showToast('নেটওয়ার্ক সমস্যার কারণে ট্র্যাকিং যোগ করা সম্ভব হয়নি।');
        return;
      }
    }

    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const newEvent: TrackingEvent = {
            status,
            time: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
            note,
            location
          };
          return {
            ...ord,
            status,
            trackingEvents: [...ord.trackingEvents, newEvent]
          };
        }
        return ord;
      })
    );
    showToast(`Tracking milestone added for #${orderId}`);
  };

  const getOrderById = (orderId: string) => {
    const cleanId = orderId.trim().toUpperCase();
    return orders.find(o => o.id.toUpperCase() === cleanId);
  };

  // CMS
  const updateCMS = async (newCMS: Partial<CMSContent> | CMSContent) => {
    if (adminUser?.role === 'viewer') {
      showToast('ভিউ-অনলি একাউন্ট: CMS পরিবর্তন করার অনুমতি নেই।');
      return;
    }

    if (adminToken) {
      try {
        const res = await fetch('/api/admin/cms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify(newCMS)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          showToast(err.message || 'CMS সংরক্ষণ ব্যর্থ হয়েছে।');
          return;
        }
      } catch (e) {
        showToast('CMS সংরক্ষণে সমস্যা হয়েছে।');
        return;
      }
    }

    setCms(prev => {
      const merged = {
        ...prev,
        ...newCMS,
        siteInfo: newCMS.siteInfo ? { ...prev.siteInfo, ...newCMS.siteInfo } : prev.siteInfo,
        categoryHighlights: newCMS.categoryHighlights ? { ...prev.categoryHighlights, ...newCMS.categoryHighlights } : prev.categoryHighlights,
        lookbook: newCMS.lookbook ? { ...prev.lookbook, ...newCMS.lookbook } : prev.lookbook,
        zinniaStandard: newCMS.zinniaStandard ? { ...prev.zinniaStandard, ...newCMS.zinniaStandard } : prev.zinniaStandard,
        faqs: newCMS.faqs ? { ...prev.faqs, ...newCMS.faqs } : prev.faqs,
        policies: newCMS.policies ? { ...prev.policies, ...newCMS.policies } : prev.policies,
        shipping: newCMS.shipping ? { ...prev.shipping, ...newCMS.shipping } : prev.shipping,
      };
      localStorage.setItem(STORAGE_KEYS.CMS, JSON.stringify(merged));
      return merged;
    });

    showToast('CMS content updated successfully!');
  };

  const updateCms = updateCMS;

  const resetCMSToDefault = () => {
    if (adminUser?.role === 'viewer') {
      showToast('ভিউ-অনলি একাউন্ট: CMS রিসেট করার অনুমতি নেই।');
      return;
    }
    setCms(INITIAL_CMS);
    localStorage.setItem(STORAGE_KEYS.CMS, JSON.stringify(INITIAL_CMS));
    if (adminToken) {
      updateCMS(INITIAL_CMS);
    }
    showToast('CMS reset to initial defaults');
  };

  const resetToDemoData = () => {
    if (adminUser?.role !== 'admin') {
      showToast('শুধুমাত্র সুপার এডমিন ডাটাবেজ রিসেট করতে পারবেন।');
      return;
    }
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setCms(INITIAL_CMS);
    setOrders(INITIAL_ORDERS);
    setCoupons(INITIAL_COUPONS);
    try {
      localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
      localStorage.removeItem(STORAGE_KEYS.CMS);
      localStorage.removeItem(STORAGE_KEYS.ORDERS);
      localStorage.removeItem(STORAGE_KEYS.COUPONS);
    } catch (e) {
      console.error(e);
    }
    showToast('Reset all store data to demo defaults.');
  };

  // Products CRUD
  const addProduct = async (product: Product) => {
    if (adminUser?.role === 'viewer') {
      showToast('ভিউ-অনলি একাউন্ট: প্রোডাক্ট যোগ করার অনুমতি নেই।');
      return;
    }

    if (adminToken) {
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify(product)
        });

        if (res.ok) {
          const saved = await res.json();
          setProducts(prev => [saved, ...prev.filter(p => p.id !== saved.id)]);
          showToast(`Product "${saved.title}" created successfully!`);
          return;
        } else {
          const err = await res.json().catch(() => ({}));
          showToast(err.message || 'প্রোডাক্ট তৈরিতে ব্যর্থ হয়েছে।');
          return;
        }
      } catch (e) {
        showToast('প্রোডাক্ট সংরক্ষণে সমস্যা হয়েছে।');
        return;
      }
    }

    setProducts(prev => [product, ...prev]);
    showToast(`Product "${product.title}" created successfully!`);
  };

  const updateProduct = async (product: Product) => {
    if (adminUser?.role === 'viewer') {
      showToast('ভিউ-অনলি একাউন্ট: প্রোডাক্ট এডিট করার অনুমতি নেই।');
      return;
    }

    if (adminToken) {
      try {
        const res = await fetch(`/api/products/${product.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify(product)
        });

        if (res.ok) {
          const saved = await res.json();
          setProducts(prev => prev.map(p => (p.id === saved.id ? saved : p)));
          showToast(`Product "${saved.title}" updated successfully!`);
          return;
        } else {
          const err = await res.json().catch(() => ({}));
          showToast(err.message || 'প্রোডাক্ট আপডেট করতে ব্যর্থ।');
          return;
        }
      } catch (e) {
        showToast('প্রোডাক্ট আপডেটে সমস্যা হয়েছে।');
        return;
      }
    }

    setProducts(prev => prev.map(p => (p.id === product.id ? product : p)));
    showToast(`Product "${product.title}" updated successfully!`);
  };

  const deleteProduct = async (productId: string) => {
    if (adminUser?.role === 'viewer') {
      showToast('ভিউ-অনলি একাউন্ট: প্রোডাক্ট ডিলিট করার অনুমতি নেই।');
      return;
    }

    if (adminToken) {
      try {
        const res = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Accept': 'application/json'
          }
        });
        if (res.ok) {
          setProducts(prev => prev.filter(p => p.id !== productId));
          showToast('Product deleted');
          return;
        } else {
          const err = await res.json().catch(() => ({}));
          showToast(err.message || 'প্রোডাক্ট ডিলিট করতে ব্যর্থ।');
          return;
        }
      } catch (e) {
        showToast('প্রোডাক্ট ডিলিটে সমস্যা হয়েছে।');
        return;
      }
    }

    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast('Product deleted');
  };

  // Coupons
  const applyCouponCode = (code: string) => {
    const normalized = code.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === normalized && c.active);
    if (!found) {
      return { success: false, message: 'Invalid or inactive coupon code.' };
    }
    if (cartSubtotal < found.minOrder) {
      return {
        success: false,
        message: `Minimum order of Tk ${found.minOrder} required for this coupon.`
      };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Coupon "${found.code}" applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed');
  };

  const addCoupon = async (coupon: Coupon) => {
    if (adminUser?.role === 'viewer') {
      showToast('ভিউ-অনলি একাউন্ট: কুপন তৈরি করার অনুমতি নেই।');
      return;
    }

    if (adminToken) {
      try {
        const res = await fetch('/api/admin/coupons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify(coupon)
        });

        if (res.ok) {
          const saved = await res.json();
          setCoupons(prev => [saved, ...prev.filter(c => c.code !== saved.code)]);
          showToast(`Coupon ${coupon.code} created!`);
          return;
        } else {
          const err = await res.json().catch(() => ({}));
          showToast(err.message || 'কুপন তৈরি ব্যর্থ হয়েছে।');
          return;
        }
      } catch (e) {
        showToast('কুপন সংরক্ষণে সমস্যা হয়েছে।');
        return;
      }
    }

    setCoupons(prev => [...prev, coupon]);
    showToast(`Coupon ${coupon.code} created!`);
  };

  const deleteCoupon = async (code: string) => {
    if (adminUser?.role === 'viewer') {
      showToast('ভিউ-অনলি একাউন্ট: কুপন ডিলিট করার অনুমতি নেই।');
      return;
    }

    if (adminToken) {
      try {
        const res = await fetch(`/api/admin/coupons/${encodeURIComponent(code)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Accept': 'application/json'
          }
        });
        if (res.ok) {
          setCoupons(prev => prev.filter(c => c.code !== code));
          showToast(`Coupon ${code} deleted`);
          return;
        } else {
          const err = await res.json().catch(() => ({}));
          showToast(err.message || 'কুপন ডিলিট করতে ব্যর্থ।');
          return;
        }
      } catch (e) {
        showToast('কুপন ডিলিটে সমস্যা হয়েছে।');
        return;
      }
    }

    setCoupons(prev => prev.filter(c => c.code !== code));
    showToast(`Coupon ${code} deleted`);
  };

  const updateCategories = async (cats: CategoryItem[]) => {
    if (adminUser?.role === 'viewer') {
      showToast('ভিউ-অনলি একাউন্ট: ক্যাটাগরি পরিবর্তন করার অনুমতি নেই।');
      return;
    }

    if (adminToken) {
      try {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({ categories: cats })
        });

        if (res.ok) {
          const saved = await res.json();
          setCategories(saved);
          showToast('Categories updated successfully!');
          return;
        } else {
          const err = await res.json().catch(() => ({}));
          showToast(err.message || 'ক্যাটাগরি আপডেট ব্যর্থ হয়েছে।');
          return;
        }
      } catch (e) {
        showToast('ক্যাটাগরি সংরক্ষণে সমস্যা হয়েছে।');
        return;
      }
    }

    setCategories(cats);
    showToast('Categories updated successfully!');
  };

  // Helpers
  const viewProduct = (slug: string) => {
    setSelectedProductSlug(slug);
    setCurrentView('product');
    const prod = products.find(p => p.slug === slug);
    if (prod) pixelViewContent(prod);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewCategory = (categoryName: string, subcategoryName?: string) => {
    setSelectedCategoryFilter(categoryName);
    setSelectedSubcategoryFilter(subcategoryName || null);
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewPolicy = (policyKey: keyof CMSContent['policies']) => {
    setSelectedPolicy(policyKey);
    setCurrentView('policy');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        cms,
        orders,
        coupons,
        cart,
        wishlist,
        currentView,
        selectedProductSlug,
        selectedPolicy,
        selectedCategoryFilter,
        selectedSubcategoryFilter,
        searchQuery,
        recentPlacedOrder,
        isCartOpen,
        isWishlistOpen,
        isAuthModalOpen,
        zoomedImageUrl,
        toastMessage,
        appliedCoupon,
        couponDiscountAmount,
        adminToken,
        adminUser,
        isAdminLoggedIn,
        loginAdmin,
        logoutAdmin,
        uploadImage,
        trackOrderApi,
        customerUser,
        customerToken,
        isCustomerLoggedIn,
        loginCustomer,
        registerCustomer,
        loginWithGoogle,
        logoutCustomer,
        updateCustomerProfile,
        customerOrders,
        fetchCustomerOrders,
        staffUsers,
        fetchStaffUsers,
        createStaffUser,
        updateStaffUser,
        deleteStaffUser,
        dispatchOrderToCourier,
        setCurrentView,
        setSelectedProductSlug,
        setSelectedPolicy,
        setSelectedCategoryFilter,
        setSelectedSubcategoryFilter,
        setSearchQuery,
        setIsCartOpen,
        setIsWishlistOpen,
        setIsAuthModalOpen,
        setZoomedImageUrl,
        showToast,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        getVariantStock,
        toggleWishlist,
        isInWishlist,
        placeOrder,
        updateOrderStatus,
        addOrderTrackingEvent,
        getOrderById,
        refreshOrders,
        updateCMS,
        updateCms,
        resetCMSToDefault,
        resetToDemoData,
        addProduct,
        updateProduct,
        deleteProduct,
        applyCouponCode,
        removeCoupon,
        addCoupon,
        deleteCoupon,
        updateCategories,
        viewProduct,
        viewCategory,
        viewPolicy
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
