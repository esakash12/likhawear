import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  FileEdit, 
  Truck, 
  Tag, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search, 
  ArrowLeft,
  RotateCcw,
  Eye,
  Sliders,
  Layers,
  FolderTree,
  Copy,
  ExternalLink,
  Users,
  Send,
  Shield,
  Key,
  Radio,
  Lock,
  MessageCircle,
  Upload,
  Save
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, OrderStatus, HeroSlide, FAQItem, CategoryItem, StaffRole, StaffUser, ProductVariant, CMSContent } from '../types';
import { sanitizeDigitsOnly, sanitizePositiveInteger, sanitizePositiveDecimal } from '../utils/validation';
import { ensureProductVariants } from '../utils/variantStock';

export const AdminView: React.FC = () => {
  const { 
    products, 
    orders, 
    categories,
    updateCategories,
    cms, 
    updateCms, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    updateOrderStatus, 
    addOrderTrackingEvent,
    resetToDemoData,
    setCurrentView,
    showToast,
    isAdminLoggedIn,
    adminUser,
    loginAdmin,
    logoutAdmin,
    refreshOrders,
    uploadImage,
    staffUsers,
    fetchStaffUsers,
    createStaffUser,
    updateStaffUser,
    deleteStaffUser,
    dispatchOrderToCourier
  } = useStore();

  // CMS & Shipping Draft State (prevents continuous server requests on every keystroke)
  const [cmsDraft, setCmsDraft] = useState<CMSContent>(cms);
  const [isCmsSaving, setIsCmsSaving] = useState(false);
  const [hasCmsChanges, setHasCmsChanges] = useState(false);

  // Synchronize draft when cms is loaded or updated externally, if no unsaved changes exist
  useEffect(() => {
    if (!hasCmsChanges) {
      setCmsDraft(cms);
    }
  }, [cms, hasCmsChanges]);

  // Update local draft without firing API calls
  const updateCmsDraft = (partial: Partial<CMSContent>) => {
    setCmsDraft(prev => ({
      ...prev,
      ...partial,
      siteInfo: partial.siteInfo ? { ...prev.siteInfo, ...partial.siteInfo } : prev.siteInfo,
      shipping: partial.shipping ? { ...prev.shipping, ...partial.shipping } : prev.shipping,
      policies: partial.policies ? { ...prev.policies, ...partial.policies } : prev.policies,
      faqs: partial.faqs ? { ...prev.faqs, ...partial.faqs } : prev.faqs,
      categoryHighlights: partial.categoryHighlights ? { ...prev.categoryHighlights, ...partial.categoryHighlights } : prev.categoryHighlights,
      lookbook: partial.lookbook ? { ...prev.lookbook, ...partial.lookbook } : prev.lookbook,
      zinniaStandard: partial.zinniaStandard ? { ...prev.zinniaStandard, ...partial.zinniaStandard } : prev.zinniaStandard,
      metaPixel: partial.metaPixel ? { ...prev.metaPixel, ...partial.metaPixel } : prev.metaPixel,
      courierSettings: partial.courierSettings ? { ...prev.courierSettings, ...partial.courierSettings } : prev.courierSettings,
      googleAuth: partial.googleAuth ? { ...prev.googleAuth, ...partial.googleAuth } : prev.googleAuth,
    }));
    setHasCmsChanges(true);
  };

  // Explicit save action triggered only by the user
  const handleSaveCmsChanges = async () => {
    if (adminUser?.role === 'viewer') {
      showToast('View-only account: You do not have permission to make changes.');
      return;
    }
    setIsCmsSaving(true);
    try {
      await updateCms(cmsDraft);
      setHasCmsChanges(false);
      showToast('✅ Page settings saved successfully to database!');
    } catch (e) {
      showToast('❌ Failed to save settings.');
    } finally {
      setIsCmsSaving(false);
    }
  };

  // Discard pending changes and revert to saved settings
  const handleDiscardCmsChanges = () => {
    setCmsDraft(cms);
    setHasCmsChanges(false);
    showToast('All pending changes discarded.');
  };

  // Admin Login States
  const [loginEmail, setLoginEmail] = useState('admin@zinniabd.com');
  const [loginPassword, setLoginPassword] = useState('admin123456');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    const res = await loginAdmin(loginEmail, loginPassword);
    setLoginLoading(false);
    if (!res.success) {
      setLoginError(res.message || 'Invalid email or password.');
    }
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'orders' | 'cms' | 'shipping' | 'coupons' | 'users'>('overview');
  const [cmsSubTab, setCmsSubTab] = useState<'siteInfo' | 'hero' | 'categories' | 'lookbook' | 'standard' | 'brandStory' | 'faqs' | 'policies' | 'integrations'>('siteInfo');

  // Staff role checks
  const isViewer = adminUser?.role === 'viewer';
  const isSuperAdmin = adminUser?.role === 'admin';

  // Courier Dispatch State
  const [dispatchingOrderId, setDispatchingOrderId] = useState<string | null>(null);

  // Staff Management State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<StaffRole>('moderator');
  const [userFormLoading, setUserFormLoading] = useState(false);

  // Refresh staff when tab is active
  React.useEffect(() => {
    if (isAdminLoggedIn && isSuperAdmin && (activeTab === 'users' || activeTab === 'overview')) {
      fetchStaffUsers();
    }
  }, [isAdminLoggedIn, isSuperAdmin, activeTab]);

  const handleDispatchOrder = async (orderId: string) => {
    if (isViewer) {
      showToast('Viewer accounts cannot dispatch orders (Read-only mode).');
      return;
    }
    setDispatchingOrderId(orderId);
    const res = await dispatchOrderToCourier(orderId);
    setDispatchingOrderId(null);
    if (!res.success) {
      showToast(res.message || 'Failed to dispatch to Steadfast.');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) {
      showToast('Viewers cannot create staff users.');
      return;
    }
    if (!newStaffName.trim() || !newStaffEmail.trim() || !newStaffPassword.trim()) {
      showToast('Please fill all staff user fields.');
      return;
    }
    setUserFormLoading(true);
    const res = await createStaffUser({
      name: newStaffName.trim(),
      email: newStaffEmail.trim(),
      password: newStaffPassword.trim(),
      role: newStaffRole,
    });
    setUserFormLoading(false);
    if (res.success) {
      setIsUserModalOpen(false);
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffPassword('');
      setNewStaffRole('moderator');
    }
  };

  const handleDeleteStaff = async (id: number, name: string) => {
    if (isViewer) {
      showToast('Viewers cannot delete staff users.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete staff account "${name}"?`)) {
      await deleteStaffUser(id);
    }
  };

  // Product editing modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');

  // Variant manager local states
  const [variantNewColorName, setVariantNewColorName] = useState('');
  const [variantNewColorHex, setVariantNewColorHex] = useState('#8B2628');
  const [variantNewSizeName, setVariantNewSizeName] = useState('');

  // Category management modal state
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newSubcatName, setNewSubcatName] = useState('');
  const [newSubcatGroup, setNewSubcatGroup] = useState('Clothing');

  // New Tracking Event modal state
  const [trackingOrderModalId, setTrackingOrderModalId] = useState<string | null>(null);
  const [newTrackingStatus, setNewTrackingStatus] = useState<OrderStatus>('Processing');
  const [newTrackingNote, setNewTrackingNote] = useState('');
  const [newTrackingLocation, setNewTrackingLocation] = useState('');

  // Overview stats calculation
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;

  // Handler for saving edited or new product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) {
      showToast('View-only account: You do not have permission to save changes.');
      return;
    }
    if (!editingProduct) return;

    if (!editingProduct.title || !editingProduct.price) {
      showToast('Product title and price are required.');
      return;
    }

    const prodToSave = ensureProductVariants(editingProduct);

    const existingIndex = products.findIndex(p => p.id === prodToSave.id);
    if (existingIndex >= 0) {
      updateProduct(prodToSave);
      showToast(`Updated "${prodToSave.title}"`);
    } else {
      addProduct(prodToSave);
      showToast(`Added product "${prodToSave.title}"`);
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleOpenAddProduct = () => {
    if (isViewer) {
      showToast('View-only account: You do not have permission to add new products.');
      return;
    }
    const defaultCat = categories[0]?.name || 'MEN';
    const defaultSub = categories[0]?.subcategories[0]?.name || 'Casual Shirt';
    const newProd: Product = {
      id: `zn-${Date.now()}`,
      title: '',
      slug: `product-${Date.now()}`,
      category: defaultCat,
      subcategory: defaultSub,
      price: 1200,
      compareAtPrice: 1400,
      discountPercent: 14,
      rating: 5.0,
      reviewsCount: 1,
      inStock: true,
      stockCount: 20,
      sku: `ZN-${Date.now().toString().slice(-4)}`,
      images: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80'
      ],
      colors: [
        { name: 'Navy', hex: '#1B263B' },
        { name: 'White', hex: '#FFFFFF' }
      ],
      sizes: ['M', 'L', 'XL'],
      descriptionEn: 'Premium quality handcrafted wear.',
      descriptionBn: 'প্রিমিয়াম কোয়ালিটির আরামদায়ক পোশাক।',
      specifications: {
        'Product Type': 'Standard',
        'Fabric': '100% Cotton',
        'Origin': 'Bangladesh'
      },
      productInfo: {
        'Stock status': 'In stock',
        'SKU': `ZN-${Date.now().toString().slice(-4)}`
      },
      tags: ['new-arrival', 'cotton'],
      isFeatured: true,
      isTopSelling: false
    };
    setEditingProduct(ensureProductVariants(newProd));
    setIsProductModalOpen(true);
  };

  // Category management handlers
  const handleOpenAddCategory = () => {
    if (isViewer) {
      showToast('View-only account: You do not have permission to add categories.');
      return;
    }
    setEditingCategory({
      id: `cat-${Date.now()}`,
      name: '',
      slug: '',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
      subcategories: []
    });
    setNewSubcatName('');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: CategoryItem) => {
    setEditingCategory({
      ...cat,
      subcategories: Array.isArray(cat.subcategories) ? [...cat.subcategories] : []
    });
    setNewSubcatName('');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) {
      showToast('View-only account: You do not have permission to modify categories.');
      return;
    }
    if (!editingCategory || !editingCategory.name.trim()) {
      showToast('Category name is required.');
      return;
    }

    const trimmedName = editingCategory.name.trim();
    const formattedSlug = editingCategory.slug.trim() || trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const catToSave: CategoryItem = {
      ...editingCategory,
      name: trimmedName,
      slug: formattedSlug,
      image: editingCategory.image.trim() || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
      subcategories: editingCategory.subcategories || []
    };

    const existingIndex = categories.findIndex(c => c.id === catToSave.id);
    let updatedCats: CategoryItem[];
    if (existingIndex >= 0) {
      updatedCats = [...categories];
      updatedCats[existingIndex] = catToSave;
      showToast(`Updated category "${trimmedName}"`);
    } else {
      updatedCats = [...categories, catToSave];
      showToast(`Created category "${trimmedName}"`);
    }

    updateCategories(updatedCats);
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (catId: string, catName: string) => {
    if (isViewer) {
      showToast('View-only account: You do not have permission to delete categories.');
      return;
    }
    const linkedProducts = products.filter(p => p.category.toLowerCase() === catName.toLowerCase());
    if (linkedProducts.length > 0) {
      if (!window.confirm(`Category "${catName}" has ${linkedProducts.length} linked products. Deleting it may affect their display. Do you want to proceed?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) {
        return;
      }
    }
    const updated = categories.filter(c => c.id !== catId);
    updateCategories(updated);
    showToast(`Category "${catName}" deleted.`);
  };

  const handleAddSubcategoryToEditingCategory = () => {
    if (isViewer) return;
    if (!newSubcatName.trim() || !editingCategory) return;
    const name = newSubcatName.trim();
    if ((editingCategory.subcategories || []).some(s => s.name.toLowerCase() === name.toLowerCase())) {
      showToast('This subcategory already exists in this category.');
      return;
    }
    const updatedSubcats = [
      ...(editingCategory.subcategories || []),
      { name, group: newSubcatGroup || 'Clothing' }
    ];
    setEditingCategory({
      ...editingCategory,
      subcategories: updatedSubcats
    });
    setNewSubcatName('');
    showToast(`Added "${name}"`);
  };

  const handleRemoveSubcategoryFromEditingCategory = (subName: string) => {
    if (isViewer) return;
    if (!editingCategory) return;
    setEditingCategory({
      ...editingCategory,
      subcategories: (editingCategory.subcategories || []).filter(s => s.name !== subName)
    });
  };

  // Secure Admin Login Gate
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#141211] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#8B2628]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#C59B27]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-[#1C1A18] border border-[#2E2B27] rounded-3xl p-8 shadow-2xl relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            {cms?.siteInfo?.logoUrl ? (
              <div className="flex justify-center mb-4">
                <img 
                  src={cms.siteInfo.logoUrl} 
                  alt={cms?.siteInfo?.brandName || 'Brand'} 
                  className="h-14 max-w-[200px] object-contain"
                />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#8B2628]/15 border border-[#8B2628]/30 text-[#8B2628] mb-4">
                <span className="w-4 h-4 rotate-45 bg-[#8B2628]"></span>
              </div>
            )}
            <h1 className="font-serif text-2xl font-bold tracking-wide uppercase text-white">
              {cms?.siteInfo?.brandName || 'Zinnia'} Portal
            </h1>
            <p className="text-xs text-[#9E978C] mt-1 font-medium">
              Secure Staff & Admin Authentication
            </p>
          </div>

          {/* Error message */}
          {loginError && (
            <div className="mb-6 p-3.5 bg-red-900/30 border border-red-500/40 rounded-xl text-red-300 text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#DDD5C7] mb-1.5">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@zinniabd.com"
                className="w-full px-4 py-3 bg-[#141211] border border-[#3C3834] rounded-xl text-xs text-white placeholder-[#6E6860] focus:outline-none focus:border-[#8B2628] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#DDD5C7] mb-1.5">
                Security Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#141211] border border-[#3C3834] rounded-xl text-xs text-white placeholder-[#6E6860] focus:outline-none focus:border-[#8B2628] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 bg-[#8B2628] hover:bg-[#A32D30] disabled:bg-[#5C1E20] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-[#8B2628]/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loginLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Authenticate & Access Dashboard</span>
              )}
            </button>
          </form>

          {/* Quick autofill helper */}
          <div className="mt-6 pt-6 border-t border-[#2E2B27] text-center">
            <button
              type="button"
              onClick={() => {
                setLoginEmail('admin@zinniabd.com');
                setLoginPassword('admin123456');
                showToast('Pre-filled seeded admin credentials!');
              }}
              className="text-[11px] text-[#C59B27] hover:text-[#e0b43c] font-mono transition-colors"
            >
              🔑 Autofill Admin: admin@zinniabd.com / admin123456
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                window.history.pushState({}, '', '/');
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs text-[#9E978C] hover:text-white transition-colors cursor-pointer"
            >
              ← Return to Customer Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EE] pb-24">
      {/* Admin Top Header */}
      <div className="bg-[#1C1A18] text-white border-b border-[#2E2B27] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {cms?.siteInfo?.logoUrl ? (
              <img 
                src={cms.siteInfo.logoUrl} 
                alt={cms?.siteInfo?.brandName || 'Brand'} 
                className="h-8 max-w-[130px] object-contain mr-1 bg-white/10 p-1 rounded-md"
              />
            ) : (
              <span className="w-2.5 h-2.5 rotate-45 bg-[#8B2628]"></span>
            )}
            <div>
              <span className="font-serif font-bold text-lg tracking-wider">
                {cms?.siteInfo?.brandName || 'Zinnia'} Control Center
              </span>
              <span className="ml-2 text-[10px] bg-[#8B2628] text-white font-mono px-2 py-0.5 rounded-full">
                ADMIN CMS
              </span>
              {adminUser && (
                <span className="hidden sm:inline-flex items-center gap-2 ml-3 text-[11px] text-[#9E978C]">
                  <span>Logged in: <strong className="text-white">{adminUser.name}</strong></span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    adminUser.role === 'admin' 
                      ? 'bg-[#8B2628] text-white' 
                      : adminUser.role === 'moderator'
                      ? 'bg-[#1976D2] text-white'
                      : 'bg-[#616161] text-white'
                  }`}>
                    {adminUser.role || 'admin'}
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => refreshOrders()}
              className="p-1.5 text-[#9E978C] hover:text-white rounded-lg hover:bg-[#2C2926] transition-colors"
              title="Sync Orders & Database"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                window.history.pushState({}, '', '/');
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2C2926] hover:bg-[#3C3834] text-xs font-semibold rounded-lg border border-[#443F3A] transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#C59B27]" />
              <span className="hidden sm:inline">Storefront</span>
            </button>

            <button
              onClick={async () => {
                await logoutAdmin();
                window.history.pushState({}, '', '/');
                setCurrentView('home');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8B2628] hover:bg-[#A32D30] text-xs font-semibold rounded-lg text-white transition-colors cursor-pointer"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto space-x-1 sm:space-x-4 border-t border-[#2A2724] scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-[#8B2628] text-white'
                : 'border-transparent text-[#9E978C] hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'border-[#8B2628] text-white'
                : 'border-transparent text-[#9E978C] hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'categories'
                ? 'border-[#8B2628] text-white'
                : 'border-transparent text-[#9E978C] hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-[#8B2628] text-white'
                : 'border-transparent text-[#9E978C] hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cms')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'cms'
                ? 'border-[#8B2628] text-white'
                : 'border-transparent text-[#9E978C] hover:text-white'
            }`}
          >
            <FileEdit className="w-4 h-4" />
            <span>All Pages CMS</span>
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'shipping'
                ? 'border-[#8B2628] text-white'
                : 'border-transparent text-[#9E978C] hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Shipping Rates</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('users')}
              className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'border-[#8B2628] text-white'
                  : 'border-transparent text-[#9E978C] hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Staff & Roles ({staffUsers.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Viewer Read-Only Notice Banner */}
      {isViewer && (
        <div className="bg-[#FFF8E1] border-b border-[#FFE082] px-4 py-2.5 text-xs text-[#8D6E63] shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <span className="font-bold text-[#E65100]">⚠️ Read-Only Mode:</span>
            <span>You have Viewer role privileges. Editing, adding, or deleting products, orders, and CMS settings is disabled.</span>
          </div>
        </div>
      )}

      {/* Main Tab Views */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ================= 1. OVERVIEW TAB ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-5 rounded-2xl border border-[#EDE9E1] shadow-xs">
                <span className="text-xs text-[#7A7369] font-medium block">Total Revenue</span>
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1C1A18] mt-1 block">
                  Tk {totalRevenue.toLocaleString()}
                </span>
                <span className="text-[11px] text-[#2E7D32] mt-1 block font-medium">
                  From {orders.length} orders
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EDE9E1] shadow-xs">
                <span className="text-xs text-[#7A7369] font-medium block">Active Products</span>
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1C1A18] mt-1 block">
                  {products.length}
                </span>
                <span className="text-[11px] text-[#8B2628] mt-1 block font-medium">
                  {products.filter(p => p.inStock).length} In Stock
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EDE9E1] shadow-xs">
                <span className="text-xs text-[#7A7369] font-medium block">Pending Orders</span>
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#E65100] mt-1 block">
                  {pendingOrders}
                </span>
                <span className="text-[11px] text-[#7A7369] mt-1 block">
                  Awaiting courier dispatch
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EDE9E1] shadow-xs">
                <span className="text-xs text-[#7A7369] font-medium block">Store CMS Status</span>
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2E7D32] mt-1 block">
                  100%
                </span>
                <span className="text-[11px] text-[#7A7369] mt-1 block">
                  All pages dynamic & active
                </span>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white rounded-2xl border border-[#EDE9E1] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
                <h3 className="font-serif text-lg font-bold text-[#1C1A18]">
                  Recent Customer Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-[#8B2628] hover:underline"
                >
                  Manage All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[#8C8478] border-b border-[#F2ECE1]">
                      <th className="pb-3 font-semibold">Order ID</th>
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold">Destination</th>
                      <th className="pb-3 font-semibold">Items</th>
                      <th className="pb-3 font-semibold">Total</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2ECE1]">
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-3 font-mono font-bold text-[#8B2628]">{o.id}</td>
                        <td className="py-3">
                          <p className="font-semibold text-[#1C1A18]">{o.customerName}</p>
                          <p className="text-[11px] text-[#7A7369]">{o.phone}</p>
                        </td>
                        <td className="py-3">{o.district}</td>
                        <td className="py-3">{o.items.length} item(s)</td>
                        <td className="py-3 font-bold text-[#1C1A18]">Tk {o.total}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            o.status === 'Delivered'
                              ? 'bg-[#E8F5E9] text-[#2E7D32]'
                              : o.status === 'Shipped'
                              ? 'bg-[#E3F2FD] text-[#1976D2]'
                              : 'bg-[#FFF3E0] text-[#E65100]'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => {
                              setActiveTab('orders');
                            }}
                            className="px-2.5 py-1 border border-[#DDD5C7] rounded text-[11px] font-semibold hover:border-[#8B2628]"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. PRODUCTS MANAGER TAB ================= */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1C1A18]">
                  Products Catalog ({products.length})
                </h2>
                <p className="text-xs text-[#7A7369] mt-0.5">
                  Manage inventory, pricing, descriptions, images, categories, and variations.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setActiveTab('categories')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-[#F2ECE1] border border-[#DDD5C7] text-[#4A443D] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-[#8B2628]" />
                  <span>Manage Categories ({categories.length})</span>
                </button>

                {!isViewer && (
                  <button
                    id="btn-add-product"
                    onClick={handleOpenAddProduct}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#8B2628] hover:bg-[#721E20] text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Product Selector & Search/Filter Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-[#EDE9E1] shadow-xs space-y-3">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                {/* 1. Quick Dropdown to Select Product to Edit */}
                <div className="lg:col-span-6">
                  <label className="block text-[11px] font-bold text-[#4A443D] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Copy className="w-3 h-3 text-[#8B2628]" />
                    <span>Quick Select Product to Edit:</span>
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const selected = products.find(p => p.id === e.target.value);
                      if (selected) {
                        setEditingProduct(ensureProductVariants({ ...selected }));
                        setIsProductModalOpen(true);
                      }
                    }}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs font-semibold text-[#1C1A18] focus:outline-none focus:border-[#8B2628] cursor-pointer"
                  >
                    <option value="">-- Choose a product to open in editor ({products.length} available) --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        [{p.category}] {p.title} — Tk {p.price} ({p.inStock && p.stockCount > 0 ? `Stock: ${p.stockCount}` : 'Out of Stock'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Search by Title or SKU */}
                <div className="lg:col-span-3">
                  <label className="block text-[11px] font-bold text-[#4A443D] uppercase tracking-wider mb-1">
                    Search Catalog:
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9E978C]" />
                    <input
                      type="text"
                      placeholder="Title or SKU..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                  </div>
                </div>

                {/* 3. Filter by Category */}
                <div className="lg:col-span-3">
                  <label className="block text-[11px] font-bold text-[#4A443D] uppercase tracking-wider mb-1">
                    Filter by Category:
                  </label>
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                  >
                    <option value="ALL">All Categories ({products.length})</option>
                    {categories.map(c => {
                      const count = products.filter(p => p.category.toLowerCase() === c.name.toLowerCase()).length;
                      return (
                        <option key={c.id} value={c.name}>
                          {c.name} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-[#EDE9E1] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-[#8C8478] border-b border-[#EDE9E1]">
                    <tr>
                      <th className="p-4 font-semibold">Image</th>
                      <th className="p-4 font-semibold">Title & SKU</th>
                      <th className="p-4 font-semibold">Category</th>
                      <th className="p-4 font-semibold">Price</th>
                      <th className="p-4 font-semibold">Stock</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2ECE1]">
                    {products
                      .filter(p => {
                        const matchesSearch = !productSearchTerm.trim() ||
                          p.title.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                          (p.sku && p.sku.toLowerCase().includes(productSearchTerm.toLowerCase())) ||
                          p.category.toLowerCase().includes(productSearchTerm.toLowerCase());
                        const matchesCat = productCategoryFilter === 'ALL' ||
                          p.category.toLowerCase() === productCategoryFilter.toLowerCase();
                        return matchesSearch && matchesCat;
                      })
                      .map(p => (
                      <tr key={p.id} className="hover:bg-[#FCFBF8] transition-colors">
                        <td className="p-4">
                          <img
                            src={p.images[0]}
                            alt=""
                            className="w-12 h-14 object-cover rounded-md border border-[#EDE9E1]"
                          />
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-[#1C1A18] line-clamp-1 max-w-xs">{p.title}</p>
                          <p className="text-[11px] text-[#7A7369]">SKU: {p.productInfo['SKU'] || p.sku || p.id}</p>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-[#FAF5EE] text-[#8B2628] rounded font-semibold text-[10px]">
                            {p.category}
                          </span>
                          <span className="text-[11px] text-[#7A7369] block mt-0.5">{p.subcategory}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-[#1C1A18]">Tk {p.price}</span>
                          {p.compareAtPrice > p.price && (
                            <span className="text-[11px] text-[#9E978C] line-through block">
                              Tk {p.compareAtPrice}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`font-semibold ${p.inStock && p.stockCount > 0 ? 'text-[#2E7D32]' : 'text-[#D32F2F]'}`}>
                            {p.inStock && p.stockCount > 0 ? `${p.stockCount} in stock` : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            disabled={isViewer}
                            onClick={() => {
                              if (isViewer) {
                                showToast('View-only account: You do not have permission to change stock.');
                                return;
                              }
                              const newStock = !p.inStock;
                              updateProduct({
                                ...p,
                                inStock: newStock,
                                stockCount: newStock ? (p.stockCount > 0 ? p.stockCount : 20) : 0
                              });
                              showToast(`${p.title} is now ${newStock ? 'In Stock' : 'Out of Stock'}`);
                            }}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                              isViewer ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            } ${
                              p.inStock && p.stockCount > 0
                                ? 'bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9]'
                                : 'bg-[#FFEBEE] text-[#C62828] hover:bg-[#FFCDD2]'
                            }`}
                          >
                            {p.inStock && p.stockCount > 0 ? 'ACTIVE' : 'OUT OF STOCK'}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(ensureProductVariants({ ...p }));
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 text-[#4A443D] hover:text-[#8B2628] hover:bg-[#FAF5EE] rounded-lg transition-colors cursor-pointer"
                              title={isViewer ? "View product details" : "Edit product"}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              disabled={isViewer}
                              onClick={() => {
                                if (isViewer) {
                                  showToast('View-only account: You do not have permission to delete products.');
                                  return;
                                }
                                if (confirm(`Delete product "${p.title}"?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isViewer 
                                  ? 'opacity-30 cursor-not-allowed text-[#9E978C]' 
                                  : 'text-[#9E978C] hover:text-[#D32F2F] hover:bg-[#FFEBEE] cursor-pointer'
                              }`}
                              title={isViewer ? "View only: Deletion disabled" : "Delete product"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. DEDICATED CATEGORIES MANAGEMENT TAB ================= */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1C1A18] flex items-center gap-2">
                  <Layers className="w-6 h-6 text-[#8B2628]" />
                  <span>Category & Taxonomy Manager</span>
                </h2>
                <p className="text-xs text-[#7A7369] mt-0.5">
                  Create, edit, and organize product categories, banner cards, and subcategories for the entire store.
                </p>
              </div>

              {!isViewer && (
                <button
                  onClick={handleOpenAddCategory}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#8B2628] hover:bg-[#721E20] text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Category</span>
                </button>
              )}
            </div>

            {/* Category Summary Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#EDE9E1] shadow-xs">
                <span className="text-[11px] text-[#7A7369] font-medium block">Total Active Categories</span>
                <span className="font-serif text-2xl font-bold text-[#1C1A18] mt-0.5 block">{categories.length}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#EDE9E1] shadow-xs">
                <span className="text-[11px] text-[#7A7369] font-medium block">Total Defined Subcategories</span>
                <span className="font-serif text-2xl font-bold text-[#8B2628] mt-0.5 block">
                  {categories.reduce((sum, c) => sum + (c.subcategories?.length || 0), 0)}
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#EDE9E1] shadow-xs">
                <span className="text-[11px] text-[#7A7369] font-medium block">Catalog Coverage</span>
                <span className="font-serif text-2xl font-bold text-[#2E7D32] mt-0.5 block">
                  {products.length} Products Assigned
                </span>
              </div>
            </div>

            {/* Categories Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => {
                const assignedProducts = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase());
                const subcats = cat.subcategories || [];

                return (
                  <div 
                    key={cat.id} 
                    className="bg-white rounded-2xl border border-[#EDE9E1] overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
                  >
                    {/* Category Cover Banner */}
                    <div className="relative h-40 bg-[#EDE9E1] overflow-hidden group">
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif text-xl font-bold tracking-wide text-white drop-shadow-sm">
                            {cat.name}
                          </h3>
                          <span className="px-2 py-0.5 bg-white/20 backdrop-blur-xs text-[10px] font-mono rounded text-white border border-white/30">
                            /{cat.slug}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Category Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-[#7A7369] pb-2 border-b border-[#F2ECE1]">
                          <span className="flex items-center gap-1.5 font-semibold text-[#1C1A18]">
                            <span className="w-2 h-2 rounded-full bg-[#2E7D32]"></span>
                            {assignedProducts.length} Products
                          </span>
                          <span>{subcats.length} Subcategories</span>
                        </div>

                        {/* Subcategories List */}
                        <div>
                          <label className="block text-[10px] font-bold text-[#8C8478] uppercase tracking-wider mb-1.5">
                            Subcategories:
                          </label>
                          {subcats.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {subcats.map((s, sIdx) => (
                                <span 
                                  key={sIdx} 
                                  className="px-2 py-1 bg-[#FAF8F5] border border-[#DDD5C7] rounded-md text-[11px] font-medium text-[#4A443D]"
                                >
                                  {s.name} <span className="text-[9px] text-[#9E978C]">({s.group})</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-[#9E978C] italic">
                              No subcategories added yet.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-3 border-t border-[#F2ECE1] flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenEditCategory(cat)}
                          className="flex-1 py-2 px-3 bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#DDD5C7] rounded-lg text-xs font-bold text-[#1C1A18] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#8B2628]" />
                          <span>Edit Category</span>
                        </button>

                        <button
                          disabled={isViewer}
                          onClick={() => {
                            if (isViewer) {
                              showToast('View-only account: You do not have permission to delete categories.');
                              return;
                            }
                            handleDeleteCategory(cat.id, cat.name);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            isViewer 
                              ? 'opacity-30 cursor-not-allowed text-[#9E978C]' 
                              : 'text-[#9E978C] hover:text-[#D32F2F] hover:bg-[#FFEBEE] cursor-pointer'
                          }`}
                          title={isViewer ? 'View only: Deletion disabled' : 'Delete Category'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= 4. ORDERS MANAGER TAB ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1C1A18]">
                  Customer Orders ({orders.length})
                </h2>
                <p className="text-xs text-[#7A7369] mt-0.5">
                  Update statuses, dispatch orders, and log customer tracking milestones.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#EDE9E1] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-[#8C8478] border-b border-[#EDE9E1]">
                    <tr>
                      <th className="p-4 font-semibold">Order ID</th>
                      <th className="p-4 font-semibold">Customer Details</th>
                      <th className="p-4 font-semibold">Address & District</th>
                      <th className="p-4 font-semibold">Total / Mode</th>
                      <th className="p-4 font-semibold">Courier (Steadfast)</th>
                      <th className="p-4 font-semibold">Current Status</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2ECE1]">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-[#FCFBF8] transition-colors">
                        <td className="p-4 font-mono font-bold text-[#8B2628]">
                          {order.id}
                          <span className="text-[10px] text-[#8C8478] block font-sans">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-[#1C1A18]">{order.customerName}</p>
                          <p className="text-[11px] text-[#7A7369]">{order.phone}</p>
                          {order.email && <p className="text-[10px] text-[#9E978C]">{order.email}</p>}
                        </td>
                        <td className="p-4">
                          <p className="text-[#4A443D] max-w-xs truncate">{order.address}</p>
                          <p className="text-[11px] font-bold text-[#8B2628]">{order.area}, {order.district}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-[#1C1A18] text-sm">Tk {order.total}</p>
                          <span className="text-[10px] text-[#2E7D32] font-semibold">
                            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Mobile Banking'}
                          </span>
                        </td>
                        <td className="p-4">
                          {order.consignmentId || order.courierTrackingCode ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                                <Truck className="w-3 h-3" /> Steadfast Dispatched
                              </span>
                              <p className="font-mono text-[10px] text-[#4A443D] font-bold">
                                CID: {order.consignmentId || order.courierTrackingCode}
                              </p>
                              {order.courierStatus && (
                                <span className="text-[9px] text-[#7A7369] block">
                                  Status: <strong className="text-[#8B2628]">{order.courierStatus}</strong>
                                </span>
                              )}
                            </div>
                          ) : (
                            <button
                              disabled={isViewer || dispatchingOrderId === order.id}
                              onClick={() => handleDispatchOrder(order.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                                isViewer 
                                  ? 'bg-[#E5DFD5] text-[#A39B8F] cursor-not-allowed'
                                  : 'bg-[#1C1A18] hover:bg-[#8B2628] text-white cursor-pointer active:scale-95'
                              }`}
                              title="Send order consignment to Steadfast Courier API"
                            >
                              <Send className="w-3.5 h-3.5 text-[#C59B27]" />
                              <span>
                                {dispatchingOrderId === order.id ? 'Dispatching...' : '⚡ Steadfast Dispatch'}
                              </span>
                            </button>
                          )}
                        </td>
                        <td className="p-4">
                          <select
                            disabled={isViewer}
                            value={order.status}
                            onChange={(e) => {
                              if (isViewer) return;
                              const newStatus = e.target.value as OrderStatus;
                              updateOrderStatus(order.id, newStatus);
                              showToast(`Order #${order.id} status updated to ${newStatus}`);
                            }}
                            className={`bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#1C1A18] focus:outline-none focus:border-[#8B2628] ${
                              isViewer ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            disabled={isViewer}
                            onClick={() => {
                              if (isViewer) {
                                showToast('Viewer accounts cannot edit tracking (Read-only mode).');
                                return;
                              }
                              setTrackingOrderModalId(order.id);
                              setNewTrackingStatus(order.status);
                              setNewTrackingNote('');
                              setNewTrackingLocation('');
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              isViewer 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-[#FAF5EE] hover:bg-[#F0E6D8] border border-[#E0D3C1] text-[#8B2628] cursor-pointer'
                            }`}
                          >
                            + Log Tracking Note
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= 4. ALL PAGES CMS TAB ================= */}
        {activeTab === 'cms' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-[#EDE9E1] shadow-xs">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1C1A18]">
                  Site Content & Pages CMS
                </h2>
                <p className="text-xs text-[#7A7369] mt-0.5">
                  Customize storefront copy, announcements, hero sliders, FAQs, and policies. Click "Save Changes" to apply.
                </p>
              </div>

              {/* Action Buttons: Save & Discard */}
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                {hasCmsChanges ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl text-xs font-bold animate-pulse">
                    ⚠️ Unsaved Changes
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Settings up to date
                  </span>
                )}

                {hasCmsChanges && (
                  <button
                    type="button"
                    onClick={handleDiscardCmsChanges}
                    disabled={isCmsSaving}
                    className="px-3.5 py-2 border border-[#DDD5C7] hover:bg-[#F2ECE1] text-[#4A443D] rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Discard
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSaveCmsChanges}
                  disabled={isCmsSaving || isViewer || !hasCmsChanges}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    hasCmsChanges && !isViewer
                      ? 'bg-[#8B2628] hover:bg-[#721E20] text-white active:scale-95 ring-2 ring-[#8B2628]/20'
                      : 'bg-[#E5E0D8] text-[#8C8478] cursor-not-allowed opacity-75'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>{isCmsSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>

            {/* Sub-nav for CMS */}
            <div className="flex overflow-x-auto gap-2 border-b border-[#EDE9E1] pb-3 scrollbar-none">
              {[
                { id: 'siteInfo', label: 'Store Info & Branding' },
                { id: 'hero', label: 'Hero Slider Banners' },
                { id: 'categories', label: 'Category Banners' },
                { id: 'lookbook', label: 'Style Lookbook' },
                { id: 'standard', label: `${cmsDraft?.siteInfo?.brandName || 'Brand'} Standard & Values` },
                { id: 'brandStory', label: 'Homepage Brand Story' },
                { id: 'faqs', label: 'FAQs Accordion' },
                { id: 'policies', label: 'Policy Pages (About, Terms, Returns)' },
                { id: 'integrations', label: '🔌 API Integrations & Tracking' },
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setCmsSubTab(sub.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    cmsSubTab === sub.id
                      ? 'bg-[#8B2628] text-white shadow-xs'
                      : 'bg-white border border-[#DDD5C7] text-[#4A443D] hover:border-[#8B2628]'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* CMS Section: Store Info & Contacts */}
            {cmsSubTab === 'siteInfo' && (
              <div className="bg-white rounded-2xl border border-[#EDE9E1] p-6 sm:p-8 shadow-xs space-y-5">
                <h3 className="font-serif text-lg font-bold text-[#1C1A18] pb-2 border-b border-[#F2ECE1]">
                  Top Announcement Bar & Store Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                      Top Announcement Bar Text
                    </label>
                    <input
                      type="text"
                      disabled={isViewer}
                      value={cmsDraft.siteInfo.announcementText}
                      onChange={(e) => updateCmsDraft({
                        siteInfo: { ...cmsDraft.siteInfo, announcementText: e.target.value }
                      })}
                      className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[#4A443D]">
                        Brand Name
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const newBrand = cmsDraft.siteInfo.brandName?.trim() || 'Brand';
                          updateCmsDraft({
                            siteInfo: { ...cmsDraft.siteInfo, brandName: newBrand },
                            zinniaStandard: {
                              ...cmsDraft.zinniaStandard,
                              eyebrow: `THE ${newBrand.toUpperCase()} STANDARD`,
                              title: cmsDraft.zinniaStandard?.title?.includes('Zinnia')
                                ? `The ${newBrand} Standard`
                                : (cmsDraft.zinniaStandard?.title || 'Crafted with Love & Tradition'),
                            },
                            faqs: {
                              ...cmsDraft.faqs,
                              eyebrow: cmsDraft.faqs?.eyebrow || 'FREQUENTLY ASKED QUESTIONS',
                              title: `Shopping with ${newBrand}`,
                              items: (cmsDraft.faqs?.items || []).map(item => ({
                                ...item,
                                question: item.question.replace(/Zinnia/gi, newBrand),
                                answer: item.answer.replace(/Zinnia/gi, newBrand),
                              }))
                            },
                            lookbook: {
                              ...cmsDraft.lookbook,
                              title: `${newBrand} Lookbook`,
                            },
                            brandStory: {
                              eyebrow: `ABOUT ${newBrand.toUpperCase()} BANGLADESH`,
                              title: "Bangladesh's Online Store for Traditional & Modern Fashion Online",
                              description: `${newBrand} is a Bangladesh-based online clothing brand delivering high-quality sarees, salwar kameez, kurtis, panjabi, and accessories directly to clients all around the country. We celebrate authentic fabrics, comfortable cuts, and timeless styling crafted for modern lives.`,
                              highlight: "Transparent pricing, cash on delivery, fast nationwide delivery, and a straightforward return policy make new collections launch each week on your computer or phone."
                            }
                          });
                          showToast(`Applied "${newBrand}" across Standard, FAQs, Lookbook & Story! Click Save Changes.`);
                        }}
                        className="text-[11px] text-[#8B2628] font-bold hover:underline cursor-pointer"
                        title="Click to automatically update Standard, FAQs, and Story with this brand name"
                      >
                        ⚡ Auto-Apply to All Sections
                      </button>
                    </div>
                    <input
                      type="text"
                      disabled={isViewer}
                      value={cmsDraft.siteInfo.brandName}
                      onChange={(e) => updateCmsDraft({
                        siteInfo: { ...cmsDraft.siteInfo, brandName: e.target.value }
                      })}
                      className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                      Brand Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      disabled={isViewer}
                      placeholder="e.g. BANGLADESH or LUXURY WEAR"
                      value={cmsDraft.siteInfo.brandSubtitle || ''}
                      onChange={(e) => updateCmsDraft({
                        siteInfo: { ...cmsDraft.siteInfo, brandSubtitle: e.target.value }
                      })}
                      className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                      Phone Number / Support Hotline (Digits only)
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      disabled={isViewer}
                      value={cmsDraft.siteInfo.phone}
                      onChange={(e) => updateCmsDraft({
                        siteInfo: { ...cmsDraft.siteInfo, phone: sanitizeDigitsOnly(e.target.value, 15) }
                      })}
                      className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                      WhatsApp Number (for direct chat & orders - Digits only)
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      disabled={isViewer}
                      value={cmsDraft.siteInfo.whatsappNumber}
                      onChange={(e) => updateCmsDraft({
                        siteInfo: { ...cmsDraft.siteInfo, whatsappNumber: sanitizeDigitsOnly(e.target.value, 15) }
                      })}
                      className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                      Support Email
                    </label>
                    <input
                      type="email"
                      disabled={isViewer}
                      value={cmsDraft.siteInfo.email}
                      onChange={(e) => updateCmsDraft({
                        siteInfo: { ...cmsDraft.siteInfo, email: e.target.value }
                      })}
                      className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                      Physical Store Address
                    </label>
                    <input
                      type="text"
                      disabled={isViewer}
                      value={cmsDraft.siteInfo.address}
                      onChange={(e) => updateCmsDraft({
                        siteInfo: { ...cmsDraft.siteInfo, address: e.target.value }
                      })}
                      className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                  </div>

                  {/* Brand Logo Upload & URL */}
                  <div className="sm:col-span-2 bg-[#FAF8F5] p-4 rounded-xl border border-[#EDE9E1] space-y-3">
                    <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider">
                      Brand Logo (Displayed on header, footer, and admin)
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {cmsDraft.siteInfo.logoUrl ? (
                        <div className="relative w-32 h-16 bg-white p-2 border border-[#DDD5C7] rounded-lg flex items-center justify-center">
                          <img src={cmsDraft.siteInfo.logoUrl} alt="Store Logo" className="max-h-full max-w-full object-contain" />
                          {!isViewer && (
                            <button
                              type="button"
                              onClick={() => updateCmsDraft({ siteInfo: { ...cmsDraft.siteInfo, logoUrl: '' } })}
                              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 cursor-pointer"
                              title="Remove logo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="w-32 h-16 bg-white border border-dashed border-[#DDD5C7] rounded-lg flex items-center justify-center text-[10px] text-[#9E978C] font-semibold text-center px-2">
                          No logo uploaded (Text name used)
                        </div>
                      )}
                      <div className="flex-1 w-full space-y-2">
                        <input
                          type="text"
                          disabled={isViewer}
                          placeholder="Paste Logo Image URL..."
                          value={cmsDraft.siteInfo.logoUrl || ''}
                          onChange={(e) => updateCmsDraft({
                            siteInfo: { ...cmsDraft.siteInfo, logoUrl: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18]"
                        />
                        {!isViewer && (
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F2ECE1] border border-[#DDD5C7] rounded-lg text-xs font-semibold text-[#4A443D] cursor-pointer shadow-xs">
                            <Upload className="w-3.5 h-3.5 text-[#8B2628]" />
                            <span>{isUploadingImage ? 'Uploading...' : 'Upload Logo Image'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isUploadingImage}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setIsUploadingImage(true);
                                  const url = await uploadImage(file);
                                  setIsUploadingImage(false);
                                  if (url) {
                                    updateCmsDraft({ siteInfo: { ...cmsDraft.siteInfo, logoUrl: url } });
                                  }
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Browser Favicon Upload & URL */}
                  <div className="sm:col-span-2 bg-[#FAF8F5] p-4 rounded-xl border border-[#EDE9E1] space-y-3">
                    <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider">
                      Browser Favicon (Displayed on browser tabs)
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {cmsDraft.siteInfo.faviconUrl ? (
                        <div className="relative w-14 h-14 bg-white p-2 border border-[#DDD5C7] rounded-lg flex items-center justify-center">
                          <img src={cmsDraft.siteInfo.faviconUrl} alt="Favicon" className="w-8 h-8 object-contain" />
                          {!isViewer && (
                            <button
                              type="button"
                              onClick={() => updateCmsDraft({ siteInfo: { ...cmsDraft.siteInfo, faviconUrl: '' } })}
                              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 cursor-pointer"
                              title="Remove favicon"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="w-14 h-14 bg-white border border-dashed border-[#DDD5C7] rounded-lg flex items-center justify-center text-[10px] text-[#9E978C] font-semibold text-center">
                          Default
                        </div>
                      )}
                      <div className="flex-1 w-full space-y-2">
                        <input
                          type="text"
                          disabled={isViewer}
                          placeholder="Paste Favicon URL (PNG, ICO, SVG)..."
                          value={cmsDraft.siteInfo.faviconUrl || ''}
                          onChange={(e) => updateCmsDraft({
                            siteInfo: { ...cmsDraft.siteInfo, faviconUrl: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18]"
                        />
                        {!isViewer && (
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F2ECE1] border border-[#DDD5C7] rounded-lg text-xs font-semibold text-[#4A443D] cursor-pointer shadow-xs">
                            <Upload className="w-3.5 h-3.5 text-[#8B2628]" />
                            <span>{isUploadingImage ? 'Uploading...' : 'Upload Favicon'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isUploadingImage}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setIsUploadingImage(true);
                                  const url = await uploadImage(file);
                                  setIsUploadingImage(false);
                                  if (url) {
                                    updateCmsDraft({ siteInfo: { ...cmsDraft.siteInfo, faviconUrl: url } });
                                  }
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Order Message Template */}
                  <div className="sm:col-span-2 bg-[#F0FDF4] p-5 rounded-xl border border-[#BBF7D0] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="block text-xs font-bold text-[#166534] uppercase tracking-wider flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 text-[#16A34A]" />
                        <span>WhatsApp Order Message Template</span>
                      </label>
                      <span className="text-[10px] text-[#15803D] font-semibold">
                        Message template used when customers click "Order on WhatsApp" on product pages
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      disabled={isViewer}
                      value={cmsDraft.siteInfo.whatsappTemplate || 'Hello {brand_name}! I would like to {action}:\nProduct: {product_title}\nColor: {color}\nSize: {size}\nQuantity: {quantity}\nPrice: Tk {price}\nURL: {product_url}'}
                      onChange={(e) => updateCmsDraft({
                        siteInfo: { ...cmsDraft.siteInfo, whatsappTemplate: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#86EFAC] rounded-lg text-xs font-mono text-[#1C1A18] focus:outline-none focus:border-[#16A34A] leading-relaxed"
                    />
                    <div className="bg-white/90 p-3 rounded-lg border border-[#DCFCE7] text-[11px] text-[#166534] space-y-1">
                      <p className="font-bold">Available Dynamic Placeholders:</p>
                      <div className="flex flex-wrap gap-1.5 pt-1 font-mono text-[10px]">
                        <span className="px-1.5 py-0.5 bg-[#DCFCE7] rounded font-bold text-[#15803D]">{'{brand_name}'}</span>
                        <span className="px-1.5 py-0.5 bg-[#DCFCE7] rounded font-bold text-[#15803D]">{'{product_title}'}</span>
                        <span className="px-1.5 py-0.5 bg-[#DCFCE7] rounded font-bold text-[#15803D]">{'{color}'}</span>
                        <span className="px-1.5 py-0.5 bg-[#DCFCE7] rounded font-bold text-[#15803D]">{'{size}'}</span>
                        <span className="px-1.5 py-0.5 bg-[#DCFCE7] rounded font-bold text-[#15803D]">{'{quantity}'}</span>
                        <span className="px-1.5 py-0.5 bg-[#DCFCE7] rounded font-bold text-[#15803D]">{'{price}'}</span>
                        <span className="px-1.5 py-0.5 bg-[#DCFCE7] rounded font-bold text-[#15803D]">{'{product_url}'}</span>
                        <span className="px-1.5 py-0.5 bg-[#DCFCE7] rounded font-bold text-[#15803D]">{'{action}'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                      Store Description (shown in footer and about sections)
                    </label>
                    <textarea
                      rows={2}
                      disabled={isViewer}
                      value={cmsDraft.siteInfo.description}
                      onChange={(e) => updateCmsDraft({
                        siteInfo: { ...cmsDraft.siteInfo, description: e.target.value }
                      })}
                      className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                  </div>
                </div>

                {/* Bottom Save bar */}
                <div className="pt-4 flex items-center justify-between border-t border-[#F2ECE1]">
                  <span className="text-xs text-[#7A7369]">
                    {hasCmsChanges ? '⚠️ You have unsaved changes. Click save to apply.' : 'All settings are up to date.'}
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveCmsChanges}
                    disabled={isCmsSaving || isViewer || !hasCmsChanges}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      hasCmsChanges && !isViewer
                        ? 'bg-[#8B2628] hover:bg-[#721E20] text-white active:scale-95'
                        : 'bg-[#E5E0D8] text-[#8C8478] cursor-not-allowed opacity-75'
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isCmsSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* CMS Section: Hero Slider Banners */}
            {cmsSubTab === 'hero' && (
              <div className="bg-white rounded-2xl border border-[#EDE9E1] p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#1C1A18]">
                      Homepage Hero Slider Slides ({(cmsDraft.heroSlides || []).length})
                    </h3>
                    <p className="text-xs text-[#7A7369]">Customize headings, subtitles, images, and CTA buttons.</p>
                  </div>
                  <button
                    onClick={() => {
                      const newSlide: HeroSlide = {
                        id: `hero-${Date.now()}`,
                        eyebrow: 'EXCLUSIVE EDITION',
                        title: 'Modern Traditional Elegance',
                        subtitle: 'Designed with supreme craftsmanship and authentic Bangladeshi textures.',
                        ctaText: 'DISCOVER COLLECTION',
                        ctaLink: '/shop?category=MEN',
                        image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=1600&auto=format&fit=crop&q=80',
                        badges: ['New Season', '100% Cotton']
                      };
                      updateCmsDraft({ heroSlides: [...(cmsDraft.heroSlides || []), newSlide] });
                    }}
                    className="px-3 py-2 bg-[#8B2628] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Slide</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {(cmsDraft.heroSlides || []).map((slide, sIdx) => (
                    <div key={slide.id} className="p-4 rounded-xl border border-[#EDE9E1] bg-[#FAF8F5] space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#8B2628]">Slide #{sIdx + 1}</span>
                        {(cmsDraft.heroSlides || []).length > 1 && (
                          <button
                            onClick={() => {
                              updateCmsDraft({
                                heroSlides: (cmsDraft.heroSlides || []).filter(s => s.id !== slide.id)
                              });
                            }}
                            className="text-xs text-[#D32F2F] hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-semibold text-[#4A443D] mb-1">Eyebrow</label>
                          <input
                            type="text"
                            value={slide.eyebrow}
                            onChange={(e) => {
                              const updated = [...(cmsDraft.heroSlides || [])];
                              updated[sIdx].eyebrow = e.target.value;
                              updateCmsDraft({ heroSlides: updated });
                            }}
                            className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-[#4A443D] mb-1">Slide Title</label>
                          <input
                            type="text"
                            value={slide.title}
                            onChange={(e) => {
                              const updated = [...(cmsDraft.heroSlides || [])];
                              updated[sIdx].title = e.target.value;
                              updateCmsDraft({ heroSlides: updated });
                            }}
                            className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-lg text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-[#4A443D] mb-1">Subtitle</label>
                          <input
                            type="text"
                            value={slide.subtitle}
                            onChange={(e) => {
                              const updated = [...(cmsDraft.heroSlides || [])];
                              updated[sIdx].subtitle = e.target.value;
                              updateCmsDraft({ heroSlides: updated });
                            }}
                            className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-[#4A443D] mb-1">CTA Button Text</label>
                          <input
                            type="text"
                            value={slide.ctaText}
                            onChange={(e) => {
                              const updated = [...(cmsDraft.heroSlides || [])];
                              updated[sIdx].ctaText = e.target.value;
                              updateCmsDraft({ heroSlides: updated });
                            }}
                            className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-[#4A443D] mb-1">Image URL</label>
                          <input
                            type="text"
                            value={slide.image}
                            onChange={(e) => {
                              const updated = [...(cmsDraft.heroSlides || [])];
                              updated[sIdx].image = e.target.value;
                              updateCmsDraft({ heroSlides: updated });
                            }}
                            className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Save bar */}
                <div className="pt-4 flex items-center justify-between border-t border-[#F2ECE1]">
                  <span className="text-xs text-[#7A7369]">
                    {hasCmsChanges ? '⚠️ You have unsaved changes. Click save to apply.' : 'All settings are up to date.'}
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveCmsChanges}
                    disabled={isCmsSaving || isViewer || !hasCmsChanges}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      hasCmsChanges && !isViewer
                        ? 'bg-[#8B2628] hover:bg-[#721E20] text-white active:scale-95'
                        : 'bg-[#E5E0D8] text-[#8C8478] cursor-not-allowed opacity-75'
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isCmsSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* CMS Section: Policy Pages */}
            {cmsSubTab === 'policies' && (
              <div className="bg-white rounded-2xl border border-[#EDE9E1] p-6 sm:p-8 shadow-xs space-y-6">
                <h3 className="font-serif text-lg font-bold text-[#1C1A18] pb-2 border-b border-[#F2ECE1]">
                  Policy Pages Text Content
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-[#1C1A18] mb-1">About Us Content</label>
                    <textarea
                      rows={4}
                      value={cmsDraft.policies.aboutUs}
                      onChange={(e) => updateCmsDraft({
                        policies: { ...cmsDraft.policies, aboutUs: e.target.value }
                      })}
                      className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1C1A18] mb-1">Terms & Conditions</label>
                    <textarea
                      rows={4}
                      value={cmsDraft.policies.termsAndConditions}
                      onChange={(e) => updateCmsDraft({
                        policies: { ...cmsDraft.policies, termsAndConditions: e.target.value }
                      })}
                      className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1C1A18] mb-1">Returns & Refund Policy</label>
                    <textarea
                      rows={4}
                      value={cmsDraft.policies.refundPolicy}
                      onChange={(e) => updateCmsDraft({
                        policies: { ...cmsDraft.policies, refundPolicy: e.target.value }
                      })}
                      className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1C1A18] mb-1">Shipping & Delivery Policy</label>
                    <textarea
                      rows={4}
                      value={cmsDraft.policies.shippingPolicy}
                      onChange={(e) => updateCmsDraft({
                        policies: { ...cmsDraft.policies, shippingPolicy: e.target.value }
                      })}
                      className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                  </div>
                </div>

                {/* Bottom Save bar */}
                <div className="pt-4 flex items-center justify-between border-t border-[#F2ECE1]">
                  <span className="text-xs text-[#7A7369]">
                    {hasCmsChanges ? '⚠️ You have unsaved changes. Click save to apply.' : 'All settings are up to date.'}
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveCmsChanges}
                    disabled={isCmsSaving || isViewer || !hasCmsChanges}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      hasCmsChanges && !isViewer
                        ? 'bg-[#8B2628] hover:bg-[#721E20] text-white active:scale-95'
                        : 'bg-[#E5E0D8] text-[#8C8478] cursor-not-allowed opacity-75'
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isCmsSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* CMS Section: FAQs */}
            {cmsSubTab === 'faqs' && (
              <div className="bg-white rounded-2xl border border-[#EDE9E1] p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#1C1A18]">
                      FAQs Manager ({(cmsDraft.faqs?.items || []).length})
                    </h3>
                    <p className="text-xs text-[#7A7369]">Add and edit frequently asked customer questions.</p>
                  </div>
                  <button
                    onClick={() => {
                      const newFaq: FAQItem = {
                        id: `faq-${Date.now()}`,
                        question: 'What payment options are available?',
                        answer: 'We support Cash on Delivery across all 64 districts of Bangladesh and bKash/Nagad.'
                      };
                      updateCmsDraft({
                        faqs: { ...cmsDraft.faqs, items: [...(cmsDraft.faqs?.items || []), newFaq] }
                      });
                    }}
                    className="px-3 py-2 bg-[#8B2628] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add FAQ</span>
                  </button>
                </div>

                {/* Section Header Controls */}
                <div className="p-4 rounded-xl border border-[#EDE9E1] bg-[#FAF8F5] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-[#4A443D] mb-1">Section Eyebrow</label>
                    <input
                      type="text"
                      value={cmsDraft.faqs?.eyebrow || ''}
                      placeholder="e.g. FREQUENTLY ASKED QUESTIONS"
                      onChange={(e) => updateCmsDraft({
                        faqs: { ...cmsDraft.faqs, eyebrow: e.target.value }
                      })}
                      className="w-full p-2 bg-white border border-[#DDD5C7] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#4A443D] mb-1">Section Title (Heading)</label>
                    <input
                      type="text"
                      value={cmsDraft.faqs?.title || ''}
                      placeholder={`e.g. Shopping with ${cmsDraft.siteInfo.brandName}`}
                      onChange={(e) => updateCmsDraft({
                        faqs: { ...cmsDraft.faqs, title: e.target.value }
                      })}
                      className="w-full p-2 bg-white border border-[#DDD5C7] rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {(cmsDraft.faqs?.items || []).map((faq, fIdx) => (
                    <div key={faq.id} className="p-4 rounded-xl border border-[#EDE9E1] bg-[#FAF8F5] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#8B2628]">Question #{fIdx + 1}</span>
                        <button
                          onClick={() => {
                            updateCmsDraft({
                              faqs: {
                                ...cmsDraft.faqs,
                                items: (cmsDraft.faqs?.items || []).filter(item => item.id !== faq.id)
                              }
                            });
                          }}
                          className="text-xs text-[#D32F2F] hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => {
                          const updated = [...(cmsDraft.faqs?.items || [])];
                          updated[fIdx] = { ...updated[fIdx], question: e.target.value };
                          updateCmsDraft({ faqs: { ...cmsDraft.faqs, items: updated } });
                        }}
                        className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-lg text-xs font-semibold text-[#1C1A18]"
                      />

                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => {
                          const updated = [...(cmsDraft.faqs?.items || [])];
                          updated[fIdx] = { ...updated[fIdx], answer: e.target.value };
                          updateCmsDraft({ faqs: { ...cmsDraft.faqs, items: updated } });
                        }}
                        className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-lg text-xs text-[#4A443D]"
                      />
                    </div>
                  ))}
                </div>

                {/* Bottom Save bar */}
                <div className="pt-4 flex items-center justify-between border-t border-[#F2ECE1]">
                  <span className="text-xs text-[#7A7369]">
                    {hasCmsChanges ? '⚠️ You have unsaved changes. Click save to apply.' : 'All settings are up to date.'}
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveCmsChanges}
                    disabled={isCmsSaving || isViewer || !hasCmsChanges}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      hasCmsChanges && !isViewer
                        ? 'bg-[#8B2628] hover:bg-[#721E20] text-white active:scale-95'
                        : 'bg-[#E5E0D8] text-[#8C8478] cursor-not-allowed opacity-75'
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isCmsSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* CMS Section: Category Banners & Lookbook & Standard */}
            {(cmsSubTab === 'categories' || cmsSubTab === 'lookbook' || cmsSubTab === 'standard') && (
              <div className="bg-white rounded-2xl border border-[#EDE9E1] p-6 sm:p-8 shadow-xs space-y-5">
                <h3 className="font-serif text-lg font-bold text-[#1C1A18] pb-2 border-b border-[#F2ECE1]">
                  Visual Sections CMS
                </h3>

                {cmsSubTab === 'categories' && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl border border-[#EDE9E1] bg-[#FAF8F5] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-[#4A443D] mb-1">Section Title</label>
                        <input
                          type="text"
                          value={cmsDraft.categoryHighlights?.title || ''}
                          onChange={(e) => updateCmsDraft({
                            categoryHighlights: { ...cmsDraft.categoryHighlights, title: e.target.value }
                          })}
                          className="w-full p-2 bg-white border border-[#DDD5C7] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#4A443D] mb-1">Section Subtitle</label>
                        <input
                          type="text"
                          value={cmsDraft.categoryHighlights?.subtitle || ''}
                          onChange={(e) => updateCmsDraft({
                            categoryHighlights: { ...cmsDraft.categoryHighlights, subtitle: e.target.value }
                          })}
                          className="w-full p-2 bg-white border border-[#DDD5C7] rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#1C1A18] uppercase tracking-wider">
                          Categories & Banner Cards ({(categories || []).length})
                        </h4>
                        <button
                          type="button"
                          onClick={() => setActiveTab('categories')}
                          className="text-xs text-[#8B2628] font-bold hover:underline cursor-pointer"
                        >
                          Manage Full Categories & Subcategories →
                        </button>
                      </div>
                      {(categories || []).map((c, cIdx) => (
                        <div key={c.id} className="p-4 rounded-xl border border-[#EDE9E1] bg-[#FAF8F5] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="block font-semibold text-[#4A443D] mb-1">Category Name</label>
                            <input
                              type="text"
                              disabled={true}
                              value={c.name}
                              className="w-full p-2 bg-stone-100 border border-[#DDD5C7] rounded-lg text-stone-700 cursor-not-allowed"
                              title="Edit in Categories Tab"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-[#4A443D] mb-1">Slug / Identifier</label>
                            <input
                              type="text"
                              disabled={true}
                              value={c.slug}
                              className="w-full p-2 bg-stone-100 border border-[#DDD5C7] rounded-lg text-stone-700 cursor-not-allowed"
                              title="Edit in Categories Tab"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-[#4A443D] mb-1">Banner Image URL</label>
                            <input
                              type="text"
                              disabled={true}
                              value={c.image}
                              className="w-full p-2 bg-stone-100 border border-[#DDD5C7] rounded-lg text-stone-700 cursor-not-allowed"
                              title="Edit in Categories Tab"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {cmsSubTab === 'lookbook' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold mb-1">Lookbook Eyebrow</label>
                        <input
                          type="text"
                          value={cmsDraft.lookbook.eyebrow}
                          onChange={(e) => updateCmsDraft({ lookbook: { ...cmsDraft.lookbook, eyebrow: e.target.value } })}
                          className="w-full p-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Lookbook Title</label>
                        <input
                          type="text"
                          value={cmsDraft.lookbook.title}
                          onChange={(e) => updateCmsDraft({ lookbook: { ...cmsDraft.lookbook, title: e.target.value } })}
                          className="w-full p-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {cmsSubTab === 'standard' && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl border border-[#EDE9E1] bg-[#FAF8F5] space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-[#4A443D] mb-1">Section Eyebrow Badge</label>
                          <input
                            type="text"
                            value={cmsDraft.zinniaStandard?.eyebrow || ''}
                            placeholder={`e.g. THE ${(cmsDraft.siteInfo.brandName || 'BRAND').toUpperCase()} STANDARD`}
                            onChange={(e) => updateCmsDraft({
                              zinniaStandard: { ...cmsDraft.zinniaStandard, eyebrow: e.target.value }
                            })}
                            className="w-full p-2 bg-white border border-[#DDD5C7] rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-[#4A443D] mb-1">Section Title</label>
                          <input
                            type="text"
                            value={cmsDraft.zinniaStandard?.title || ''}
                            placeholder="e.g. Crafted with Love & Tradition"
                            onChange={(e) => updateCmsDraft({
                              zinniaStandard: { ...cmsDraft.zinniaStandard, title: e.target.value }
                            })}
                            className="w-full p-2 bg-white border border-[#DDD5C7] rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-semibold text-[#4A443D] mb-1">Section Description / Subtitle</label>
                        <textarea
                          rows={2}
                          value={cmsDraft.zinniaStandard?.description || ''}
                          placeholder="Short paragraph describing your brand promise..."
                          onChange={(e) => updateCmsDraft({
                            zinniaStandard: { ...cmsDraft.zinniaStandard, description: e.target.value }
                          })}
                          className="w-full p-2 bg-white border border-[#DDD5C7] rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    {/* 4 Feature Cards */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-[#1C1A18] uppercase tracking-wider">
                        Core Value Feature Cards ({(cmsDraft.zinniaStandard?.features || []).length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        {(cmsDraft.zinniaStandard?.features || []).map((feat, fIdx) => (
                          <div key={feat.id || fIdx} className="p-4 rounded-xl border border-[#EDE9E1] bg-[#FAF8F5] space-y-2">
                            <span className="font-bold text-[#8B2628] text-[11px]">Card #{fIdx + 1} ({feat.iconName})</span>
                            <div>
                              <label className="block text-[11px] font-semibold text-[#4A443D] mb-1">Card Title</label>
                              <input
                                type="text"
                                value={feat.title}
                                onChange={(e) => {
                                  const updated = [...(cmsDraft.zinniaStandard?.features || [])];
                                  updated[fIdx] = { ...updated[fIdx], title: e.target.value };
                                  updateCmsDraft({
                                    zinniaStandard: { ...cmsDraft.zinniaStandard, features: updated }
                                  });
                                }}
                                className="w-full p-2 bg-white border border-[#DDD5C7] rounded-lg text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-[#4A443D] mb-1">Card Description</label>
                              <textarea
                                rows={2}
                                value={feat.desc}
                                onChange={(e) => {
                                  const updated = [...(cmsDraft.zinniaStandard?.features || [])];
                                  updated[fIdx] = { ...updated[fIdx], desc: e.target.value };
                                  updateCmsDraft({
                                    zinniaStandard: { ...cmsDraft.zinniaStandard, features: updated }
                                  });
                                }}
                                className="w-full p-2 bg-white border border-[#DDD5C7] rounded-lg text-xs"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {cmsSubTab === 'brandStory' && (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-xl border border-[#EDE9E1] bg-[#FAF8F5] space-y-3">
                      <div>
                        <label className="block font-semibold text-[#4A443D] mb-1">Eyebrow Badge</label>
                        <input
                          type="text"
                          value={cmsDraft.brandStory?.eyebrow || ''}
                          placeholder={`e.g. ABOUT ${(cmsDraft.siteInfo.brandName || 'BRAND').toUpperCase()} BANGLADESH`}
                          onChange={(e) => updateCmsDraft({
                            brandStory: {
                              eyebrow: e.target.value,
                              title: cmsDraft.brandStory?.title || "Bangladesh's Online Store for Traditional & Modern Fashion Online",
                              description: cmsDraft.brandStory?.description || "",
                              highlight: cmsDraft.brandStory?.highlight || ""
                            }
                          })}
                          className="w-full p-2 bg-white border border-[#DDD5C7] rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#4A443D] mb-1">Section Title</label>
                        <input
                          type="text"
                          value={cmsDraft.brandStory?.title || ''}
                          placeholder="e.g. Bangladesh's Online Store for Traditional & Modern Fashion Online"
                          onChange={(e) => updateCmsDraft({
                            brandStory: {
                              eyebrow: cmsDraft.brandStory?.eyebrow || `ABOUT ${(cmsDraft.siteInfo.brandName || 'BRAND').toUpperCase()} BANGLADESH`,
                              title: e.target.value,
                              description: cmsDraft.brandStory?.description || "",
                              highlight: cmsDraft.brandStory?.highlight || ""
                            }
                          })}
                          className="w-full p-2 bg-white border border-[#DDD5C7] rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#4A443D] mb-1">Story Paragraph</label>
                        <textarea
                          rows={3}
                          value={cmsDraft.brandStory?.description || ''}
                          placeholder="Describe your brand story, craftsmanship, fabrics..."
                          onChange={(e) => updateCmsDraft({
                            brandStory: {
                              eyebrow: cmsDraft.brandStory?.eyebrow || `ABOUT ${(cmsDraft.siteInfo.brandName || 'BRAND').toUpperCase()} BANGLADESH`,
                              title: cmsDraft.brandStory?.title || "",
                              description: e.target.value,
                              highlight: cmsDraft.brandStory?.highlight || ""
                            }
                          })}
                          className="w-full p-2 bg-white border border-[#DDD5C7] rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#4A443D] mb-1">Highlight Note (Footer text)</label>
                        <textarea
                          rows={2}
                          value={cmsDraft.brandStory?.highlight || ''}
                          placeholder="e.g. Transparent pricing, cash on delivery, fast nationwide delivery..."
                          onChange={(e) => updateCmsDraft({
                            brandStory: {
                              eyebrow: cmsDraft.brandStory?.eyebrow || `ABOUT ${(cmsDraft.siteInfo.brandName || 'BRAND').toUpperCase()} BANGLADESH`,
                              title: cmsDraft.brandStory?.title || "",
                              description: cmsDraft.brandStory?.description || "",
                              highlight: e.target.value
                            }
                          })}
                          className="w-full p-2 bg-white border border-[#DDD5C7] rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Save bar */}
                <div className="pt-4 flex items-center justify-between border-t border-[#F2ECE1]">
                  <span className="text-xs text-[#7A7369]">
                    {hasCmsChanges ? '⚠️ You have unsaved changes. Click save to apply.' : 'All settings are up to date.'}
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveCmsChanges}
                    disabled={isCmsSaving || isViewer || !hasCmsChanges}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      hasCmsChanges && !isViewer
                        ? 'bg-[#8B2628] hover:bg-[#721E20] text-white active:scale-95'
                        : 'bg-[#E5E0D8] text-[#8C8478] cursor-not-allowed opacity-75'
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isCmsSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* CMS Section: Integrations & Tracking */}
            {cmsSubTab === 'integrations' && (
              <div className="bg-white rounded-2xl border border-[#EDE9E1] p-6 sm:p-8 shadow-xs space-y-6">
                <div className="pb-3 border-b border-[#F2ECE1]">
                  <h3 className="font-serif text-lg font-bold text-[#1C1A18]">
                    🔌 External API Integrations & Tracking
                  </h3>
                  <p className="text-xs text-[#7A7369] mt-0.5">
                    Configure Facebook Meta Pixel, Steadfast Courier API, and Google OAuth credentials.
                  </p>
                </div>

                {/* 1. Meta Pixel & Conversions API */}
                <div className="p-5 rounded-2xl border border-[#E0D3C1] bg-[#FAF8F5] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#1877F2] text-white flex items-center justify-center font-bold text-sm">
                        f
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#1C1A18]">Facebook Meta Pixel Tracking</h4>
                        <p className="text-[11px] text-[#7A7369]">
                          Automatically tracks PageView, ViewContent, AddToCart, InitiateCheckout &amp; Purchase events.
                        </p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#4A443D]">
                      <input
                        disabled={isViewer}
                        type="checkbox"
                        checked={cmsDraft.metaPixel?.enabled ?? true}
                        onChange={(e) => updateCmsDraft({
                          metaPixel: {
                            pixelId: cmsDraft.metaPixel?.pixelId || '',
                            enabled: e.target.checked
                          }
                        })}
                        className="accent-[#8B2628]"
                      />
                      <span>Active</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                      Meta Pixel ID
                    </label>
                    <input
                      disabled={isViewer}
                      type="text"
                      placeholder="e.g. 1234567890123456"
                      value={cmsDraft.metaPixel?.pixelId || ''}
                      onChange={(e) => updateCmsDraft({
                        metaPixel: {
                          enabled: cmsDraft.metaPixel?.enabled ?? true,
                          pixelId: e.target.value.trim()
                        }
                      })}
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-lg text-xs font-mono font-bold text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                    <span className="text-[10px] text-[#7A7369] mt-1 block">
                      Saved to backend MySQL database &amp; live fired on all storefront visitor interactions.
                    </span>
                  </div>
                </div>

                {/* 2. Steadfast Courier API */}
                <div className="p-5 rounded-2xl border border-[#E0D3C1] bg-[#FAF8F5] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#8B2628] text-white flex items-center justify-center font-bold text-xs">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#1C1A18]">Steadfast Courier API (1-Click Delivery)</h4>
                        <p className="text-[11px] text-[#7A7369]">
                          Connect Steadfast portal to dispatch parcels and generate auto-tracking with 1 click.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                        Steadfast API Key
                      </label>
                      <input
                        disabled={isViewer}
                        type="text"
                        placeholder="Steadfast API Key"
                        value={cmsDraft.courierSettings?.steadfast?.apiKey || ''}
                        onChange={(e) => updateCmsDraft({
                          courierSettings: {
                            ...cmsDraft.courierSettings,
                            steadfast: {
                              secretKey: cmsDraft.courierSettings?.steadfast?.secretKey || '',
                              apiKey: e.target.value.trim()
                            }
                          }
                        })}
                        className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-lg text-xs font-mono text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                        Steadfast Secret Key
                      </label>
                      <input
                        disabled={isViewer}
                        type="password"
                        placeholder="Steadfast Secret Key"
                        value={cmsDraft.courierSettings?.steadfast?.secretKey || ''}
                        onChange={(e) => updateCmsDraft({
                          courierSettings: {
                            ...cmsDraft.courierSettings,
                            steadfast: {
                              apiKey: cmsDraft.courierSettings?.steadfast?.apiKey || '',
                              secretKey: e.target.value.trim()
                            }
                          }
                        })}
                        className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-lg text-xs font-mono text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-[#7A7369]">
                    If left blank, orders use automated smart consignment generation so testing always succeeds smoothly.
                  </p>
                </div>

                {/* 3. Google Identity Services / OAuth */}
                <div className="p-5 rounded-2xl border border-[#E0D3C1] bg-[#FAF8F5] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white border border-[#DDD5C7] flex items-center justify-center font-bold text-xs shadow-xs">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#1C1A18]">Login with Google OAuth</h4>
                        <p className="text-[11px] text-[#7A7369]">
                          Allow customers to sign up and log in using their Google account in 1 click.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        cmsDraft.googleAuth?.enabled 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-stone-200 text-stone-600'
                      }`}>
                        {cmsDraft.googleAuth?.enabled ? 'Active' : 'Disabled'}
                      </span>
                      <button
                        type="button"
                        disabled={isViewer}
                        onClick={() => updateCmsDraft({
                          googleAuth: {
                            clientId: cmsDraft.googleAuth?.clientId || '',
                            enabled: !cmsDraft.googleAuth?.enabled
                          }
                        })}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          cmsDraft.googleAuth?.enabled ? 'bg-[#8B2628]' : 'bg-gray-300'
                        } ${isViewer ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            cmsDraft.googleAuth?.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                      Google OAuth Client ID
                    </label>
                    <input
                      disabled={isViewer}
                      type="text"
                      placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
                      value={cmsDraft.googleAuth?.clientId || ''}
                      onChange={(e) => updateCmsDraft({
                        googleAuth: {
                          enabled: cmsDraft.googleAuth?.enabled ?? true,
                          clientId: e.target.value.trim()
                        }
                      })}
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-lg text-xs font-mono text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                    <span className="text-[10px] text-[#7A7369] mt-1 block">
                      Google OAuth Web Client ID from Google Cloud Console.
                    </span>
                  </div>
                </div>

                {/* Bottom Save bar */}
                <div className="pt-4 flex items-center justify-between border-t border-[#F2ECE1]">
                  <span className="text-xs text-[#7A7369]">
                    {hasCmsChanges ? '⚠️ You have unsaved changes. Click save to apply.' : 'All settings are up to date.'}
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveCmsChanges}
                    disabled={isCmsSaving || isViewer || !hasCmsChanges}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      hasCmsChanges && !isViewer
                        ? 'bg-[#8B2628] hover:bg-[#721E20] text-white active:scale-95'
                        : 'bg-[#E5E0D8] text-[#8C8478] cursor-not-allowed opacity-75'
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isCmsSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= 5. SHIPPING RATES TAB ================= */}
        {activeTab === 'shipping' && (
          <div className="bg-white rounded-2xl border border-[#EDE9E1] p-6 sm:p-8 shadow-xs max-w-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#F2ECE1]">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1C1A18]">
                  Courier & Delivery Rates
                </h2>
                <p className="text-xs text-[#7A7369] mt-0.5">
                  Configure delivery rates and thresholds. Click "Save Rates" to apply.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {hasCmsChanges && (
                  <button
                    type="button"
                    onClick={handleDiscardCmsChanges}
                    disabled={isCmsSaving}
                    className="px-3.5 py-2 border border-[#DDD5C7] hover:bg-[#F2ECE1] text-[#4A443D] rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Discard
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveCmsChanges}
                  disabled={isCmsSaving || isViewer || !hasCmsChanges}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    hasCmsChanges && !isViewer
                      ? 'bg-[#8B2628] hover:bg-[#721E20] text-white active:scale-95 ring-2 ring-[#8B2628]/20'
                      : 'bg-[#E5E0D8] text-[#8C8478] cursor-not-allowed opacity-75'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>{isCmsSaving ? 'Saving...' : 'Save Rates'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                  Inside Dhaka Delivery Fee (Tk)
                </label>
                <input
                  type="number"
                  min="0"
                  disabled={isViewer}
                  value={cmsDraft.shipping.insideDhakaFee}
                  onChange={(e) => updateCmsDraft({
                    shipping: { ...cmsDraft.shipping, insideDhakaFee: sanitizePositiveDecimal(e.target.value, 0) }
                  })}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs font-bold text-[#1C1A18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                  Outside Dhaka Delivery Fee (Tk)
                </label>
                <input
                  type="number"
                  min="0"
                  disabled={isViewer}
                  value={cmsDraft.shipping.outsideDhakaFee}
                  onChange={(e) => updateCmsDraft({
                    shipping: { ...cmsDraft.shipping, outsideDhakaFee: sanitizePositiveDecimal(e.target.value, 0) }
                  })}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs font-bold text-[#1C1A18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                  Free Shipping Order Threshold (Tk)
                </label>
                <input
                  type="number"
                  min="0"
                  disabled={isViewer}
                  value={cmsDraft.shipping.freeShippingThreshold}
                  onChange={(e) => updateCmsDraft({
                    shipping: { ...cmsDraft.shipping, freeShippingThreshold: sanitizePositiveDecimal(e.target.value, 0) }
                  })}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs font-bold text-[#1C1A18]"
                />
                <span className="text-[11px] text-[#7A7369] mt-1 block">
                  Orders above this value receive automated 100% Free Shipping.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A443D] mb-1">
                  Estimated Delivery Timeline Note
                </label>
                <input
                  type="text"
                  disabled={isViewer}
                  value={cmsDraft.shipping.estimatedDeliveryDays}
                  onChange={(e) => updateCmsDraft({
                    shipping: { ...cmsDraft.shipping, estimatedDeliveryDays: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18]"
                />
              </div>
            </div>

            {/* Bottom Save bar */}
            <div className="pt-4 flex items-center justify-between border-t border-[#F2ECE1]">
              <span className="text-xs text-[#7A7369]">
                {hasCmsChanges ? '⚠️ You have unsaved changes. Click save to apply.' : 'All delivery rules are up to date.'}
              </span>
              <button
                type="button"
                onClick={handleSaveCmsChanges}
                disabled={isCmsSaving || isViewer || !hasCmsChanges}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  hasCmsChanges && !isViewer
                    ? 'bg-[#8B2628] hover:bg-[#721E20] text-white active:scale-95'
                    : 'bg-[#E5E0D8] text-[#8C8478] cursor-not-allowed opacity-75'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isCmsSaving ? 'Saving...' : 'Save Rates'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= 6. STAFF & ROLES MANAGER TAB ================= */}
        {activeTab === 'users' && isSuperAdmin && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1C1A18]">
                  Team & Role Management
                </h2>
                <p className="text-xs text-[#7A7369] mt-0.5">
                  Manage staff roles: <strong>Admin</strong> (Full access), <strong>Moderator</strong> (Orders & Products), and <strong>Viewer</strong> (Read-only view).
                </p>
              </div>

              <button
                disabled={isViewer}
                onClick={() => {
                  setNewStaffName('');
                  setNewStaffEmail('');
                  setNewStaffPassword('');
                  setNewStaffRole('moderator');
                  setIsUserModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#8B2628] hover:bg-[#721E20] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Staff User</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#EDE9E1] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-[#8C8478] border-b border-[#EDE9E1]">
                    <tr>
                      <th className="p-4 font-semibold">User Name</th>
                      <th className="p-4 font-semibold">Email</th>
                      <th className="p-4 font-semibold">Assigned Role</th>
                      <th className="p-4 font-semibold">Permissions Level</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2ECE1]">
                    {staffUsers.map(user => {
                      const isCurrent = user.email === adminUser?.email;
                      return (
                        <tr key={user.id} className="hover:bg-[#FCFBF8] transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#FAF5EE] border border-[#DDD5C7] text-[#8B2628] font-bold flex items-center justify-center text-xs">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-[#1C1A18] flex items-center gap-1.5">
                                  {user.name}
                                  {isCurrent && (
                                    <span className="text-[9px] bg-[#FAF5EE] text-[#8B2628] px-1.5 py-0.5 rounded-sm border border-[#E0D3C1]">
                                      You
                                    </span>
                                  )}
                                </p>
                                <span className="text-[10px] text-[#8C8478]">ID: #{user.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-[#4A443D]">{user.email}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                              user.role === 'admin'
                                ? 'bg-[#FFEBEE] text-[#8B2628] border border-[#FFCDD2]'
                                : user.role === 'moderator'
                                ? 'bg-[#E3F2FD] text-[#1976D2] border border-[#BBDEFB]'
                                : 'bg-[#F5F5F5] text-[#616161] border border-[#E0E0E0]'
                            }`}>
                              {user.role === 'admin' && <Shield className="w-3 h-3" />}
                              {user.role === 'moderator' && <Lock className="w-3 h-3" />}
                              {user.role === 'viewer' && <Eye className="w-3 h-3" />}
                              <span>{user.role}</span>
                            </span>
                          </td>
                          <td className="p-4 text-[11px] text-[#7A7369]">
                            {user.role === 'admin' && 'Full Store Admin + User Creation & Permissions'}
                            {user.role === 'moderator' && 'Manage Products, Categories, Orders & Shipping'}
                            {user.role === 'viewer' && 'View-Only Access (All Edits & Deletions Blocked)'}
                          </td>
                          <td className="p-4 text-right">
                            {!isCurrent ? (
                              <button
                                disabled={isViewer}
                                onClick={() => handleDeleteStaff(user.id, user.name)}
                                className="p-2 text-[#9E978C] hover:text-[#D32F2F] hover:bg-[#FFEBEE] rounded-lg transition-colors cursor-pointer"
                                title="Delete staff account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-[#9E978C] italic">Active Session</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ================= EDIT / ADD PRODUCT MODAL ================= */}
      {isProductModalOpen && editingProduct && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsProductModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#EDE9E1] overflow-hidden text-left flex flex-col h-[90vh] max-h-[750px] animate-in zoom-in-95 duration-200 my-auto">
            
            <div className="p-5 bg-[#FCFBF8] border-b border-[#EDE9E1] flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1C1A18]">
                  {products.some(p => p.id === editingProduct.id) ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-[11px] text-[#7A7369]">Configure product details, images, stock, and variations.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-full text-[#7A7369] hover:text-[#1C1A18] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="product-modal-form" onSubmit={handleSaveProduct} className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-[#4A443D]">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.title}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-[#4A443D]">Category *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProductModalOpen(false);
                        setActiveTab('categories');
                      }}
                      className="text-[10px] text-[#8B2628] hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> Manage Categories
                    </button>
                  </div>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => {
                      const newCatName = e.target.value;
                      const matchedCat = categories.find(c => c.name.toLowerCase() === newCatName.toLowerCase());
                      const defaultSubcat = matchedCat?.subcategories?.[0]?.name || '';
                      setEditingProduct({
                        ...editingProduct,
                        category: newCatName as any,
                        subcategory: defaultSubcat
                      });
                    }}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs font-semibold text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#4A443D]">Price (Tk) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingProduct.price}
                    onChange={(e) => {
                      const p = sanitizePositiveDecimal(e.target.value, 0);
                      const cmp = editingProduct.compareAtPrice || p;
                      const disc = cmp > p ? Math.round(((cmp - p) / cmp) * 100) : 0;
                      setEditingProduct({ ...editingProduct, price: p, discountPercent: disc });
                    }}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#4A443D]">Compare At Price (Tk)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.compareAtPrice}
                    onChange={(e) => {
                      const cmp = sanitizePositiveDecimal(e.target.value, 0);
                      const p = editingProduct.price;
                      const disc = cmp > p ? Math.round(((cmp - p) / cmp) * 100) : 0;
                      setEditingProduct({ ...editingProduct, compareAtPrice: cmp, discountPercent: disc });
                    }}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#4A443D]">Subcategory</label>
                  {(() => {
                    const currentCatObj = categories.find(
                      c => c.name.toLowerCase() === (editingProduct.category || '').toLowerCase()
                    );
                    const subcatOptions = currentCatObj?.subcategories || [];

                    if (subcatOptions.length > 0) {
                      return (
                        <div className="space-y-1.5">
                          <select
                            value={editingProduct.subcategory}
                            onChange={(e) => setEditingProduct({ ...editingProduct, subcategory: e.target.value })}
                            className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                          >
                            <option value="">-- Choose Subcategory --</option>
                            {subcatOptions.map((sub, sIdx) => (
                              <option key={sIdx} value={sub.name}>
                                {sub.name} ({sub.group})
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={editingProduct.subcategory}
                            onChange={(e) => setEditingProduct({ ...editingProduct, subcategory: e.target.value })}
                            placeholder="Or type custom subcategory..."
                            className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-[11px] text-[#7A7369]"
                          />
                        </div>
                      );
                    }

                    return (
                      <input
                        type="text"
                        value={editingProduct.subcategory}
                        onChange={(e) => setEditingProduct({ ...editingProduct, subcategory: e.target.value })}
                        placeholder="e.g. Panjabi, Saree, Casual Shirt"
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs"
                      />
                    );
                  })()}
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#4A443D]">Stock Count</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.stockCount}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockCount: sanitizePositiveInteger(e.target.value, 0) })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Main Image URL & Direct Server Upload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-[#4A443D]">Primary Image URL *</label>
                  <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF5EE] hover:bg-[#F2ECE1] text-[#8B2628] rounded text-[11px] font-bold border border-[#E8DFC8] transition-colors">
                    <span>{isUploadingImage ? 'Uploading image...' : '📁 Upload Photo from Device'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingImage}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploadingImage(true);
                        const url = await uploadImage(file);
                        setIsUploadingImage(false);
                        if (url) {
                          const newImages = [url, ...(editingProduct.images || [])];
                          setEditingProduct({ ...editingProduct, images: newImages });
                        }
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  required
                  value={editingProduct.images[0] || ''}
                  onChange={(e) => {
                    const newImages = [...editingProduct.images];
                    newImages[0] = e.target.value;
                    setEditingProduct({ ...editingProduct, images: newImages });
                  }}
                  placeholder="https://... or upload above"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs"
                />
              </div>

              {/* Secondary Image URL */}
              <div>
                <label className="block font-semibold mb-1 text-[#4A443D]">Secondary Image URL (optional)</label>
                <input
                  type="text"
                  value={editingProduct.images[1] || ''}
                  onChange={(e) => {
                    const newImages = [...editingProduct.images];
                    newImages[1] = e.target.value;
                    setEditingProduct({ ...editingProduct, images: newImages.filter(Boolean) });
                  }}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs"
                />
              </div>

              {/* Descriptions */}
              <div>
                <label className="block font-semibold mb-1 text-[#4A443D]">English Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.descriptionEn}
                  onChange={(e) => setEditingProduct({ ...editingProduct, descriptionEn: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#4A443D]">Bengali Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.descriptionBn}
                  onChange={(e) => setEditingProduct({ ...editingProduct, descriptionBn: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs"
                />
              </div>

              {/* ================= VARIANT STOCK & MATRIX (COLOR & SIZE) ================= */}
              <div className="pt-3 border-t border-[#EDE9E1] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#1C1A18] flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-[#8B2628]" />
                      <span>Variant Stock Breakdown</span>
                    </h4>
                    <p className="text-[11px] text-[#7A7369]">
                      Set specific stock for each color and size variant. Variants with 0 stock will display as "Sold out" on the storefront.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#FAF5EE] text-[#8B2628] border border-[#E8DFC8]">
                      Total Stock: {editingProduct.stockCount}
                    </span>
                  </div>
                </div>

                {/* 1. Manage Colors */}
                <div className="bg-[#FCFBF8] p-3 rounded-xl border border-[#EDE9E1] space-y-2.5">
                  <span className="block font-bold text-[#4A443D] text-[11px] uppercase tracking-wider">
                    Available Colors:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {(editingProduct.colors || []).map((col, cIdx) => (
                      <div
                        key={cIdx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#DDD5C7] rounded-lg text-xs font-semibold text-[#1C1A18]"
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span>{col.name}</span>
                        {(editingProduct.colors || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updatedCols = (editingProduct.colors || []).filter((_, idx) => idx !== cIdx);
                              const updatedVars = (editingProduct.variants || []).filter(v => v.color.toLowerCase() !== col.name.toLowerCase());
                              const sumStock = updatedVars.reduce((sum, v) => sum + v.stock, 0);
                              setEditingProduct({
                                ...editingProduct,
                                colors: updatedCols,
                                variants: updatedVars,
                                stockCount: sumStock,
                                inStock: sumStock > 0
                              });
                            }}
                            className="text-[#9E978C] hover:text-[#C62828] ml-1 p-0.5 cursor-pointer"
                            title="Remove color"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add New Color Row */}
                  <div className="flex items-center gap-2 pt-1.5">
                    <input
                      type="text"
                      placeholder="New color name (e.g. Olive, Maroon)..."
                      value={variantNewColorName}
                      onChange={(e) => setVariantNewColorName(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-[#DDD5C7] rounded-lg text-xs w-48 text-[#1C1A18]"
                    />
                    <input
                      type="color"
                      value={variantNewColorHex}
                      onChange={(e) => setVariantNewColorHex(e.target.value)}
                      className="w-8 h-8 rounded border border-[#DDD5C7] p-0.5 cursor-pointer bg-white"
                      title="Pick hex color"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const name = variantNewColorName.trim();
                        if (!name) return;
                        if ((editingProduct.colors || []).some(c => c.name.toLowerCase() === name.toLowerCase())) {
                          showToast('Color already exists!');
                          return;
                        }
                        const newCols = [...(editingProduct.colors || []), { name, hex: variantNewColorHex }];
                        const currentSizes = editingProduct.sizes && editingProduct.sizes.length > 0 ? editingProduct.sizes : ['Standard'];
                        const newVars = [...(editingProduct.variants || [])];
                        currentSizes.forEach(sz => {
                          newVars.push({
                            id: `${editingProduct.id}-${name}-${sz}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                            color: name,
                            size: sz,
                            stock: 5,
                            sku: `${editingProduct.sku || 'ZN'}-${name.slice(0, 2).toUpperCase()}-${sz}`
                          });
                        });
                        const sumStock = newVars.reduce((sum, v) => sum + v.stock, 0);
                        setEditingProduct({
                          ...editingProduct,
                          colors: newCols,
                          variants: newVars,
                          stockCount: sumStock,
                          inStock: sumStock > 0
                        });
                        setVariantNewColorName('');
                      }}
                      className="px-3 py-1.5 bg-[#4A3B32] hover:bg-[#382C25] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      + Add Color
                    </button>
                  </div>
                </div>

                {/* 2. Manage Sizes */}
                <div className="bg-[#FCFBF8] p-3 rounded-xl border border-[#EDE9E1] space-y-2.5">
                  <span className="block font-bold text-[#4A443D] text-[11px] uppercase tracking-wider">
                    Available Sizes:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {(editingProduct.sizes || []).map((sz, sIdx) => (
                      <div
                        key={sIdx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#DDD5C7] rounded-lg text-xs font-semibold text-[#1C1A18]"
                      >
                        <span>{sz}</span>
                        {(editingProduct.sizes || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updatedSizes = (editingProduct.sizes || []).filter((_, idx) => idx !== sIdx);
                              const updatedVars = (editingProduct.variants || []).filter(v => v.size !== sz);
                              const sumStock = updatedVars.reduce((sum, v) => sum + v.stock, 0);
                              setEditingProduct({
                                ...editingProduct,
                                sizes: updatedSizes,
                                variants: updatedVars,
                                stockCount: sumStock,
                                inStock: sumStock > 0
                              });
                            }}
                            className="text-[#9E978C] hover:text-[#C62828] ml-1 p-0.5 cursor-pointer"
                            title="Remove size"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add New Size Row */}
                  <div className="flex items-center gap-2 pt-1.5">
                    <input
                      type="text"
                      placeholder="New size (e.g. S, M, L, XL, XXL, 42)..."
                      value={variantNewSizeName}
                      onChange={(e) => setVariantNewSizeName(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-[#DDD5C7] rounded-lg text-xs w-48 text-[#1C1A18]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const sz = variantNewSizeName.trim().toUpperCase();
                        if (!sz) return;
                        if ((editingProduct.sizes || []).includes(sz)) {
                          showToast('Size already exists!');
                          return;
                        }
                        const newSizes = [...(editingProduct.sizes || []), sz];
                        const currentColors = editingProduct.colors && editingProduct.colors.length > 0 ? editingProduct.colors : [{ name: 'Standard', hex: '#000000' }];
                        const newVars = [...(editingProduct.variants || [])];
                        currentColors.forEach(col => {
                          newVars.push({
                            id: `${editingProduct.id}-${col.name}-${sz}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                            color: col.name,
                            size: sz,
                            stock: 5,
                            sku: `${editingProduct.sku || 'ZN'}-${col.name.slice(0, 2).toUpperCase()}-${sz}`
                          });
                        });
                        const sumStock = newVars.reduce((sum, v) => sum + v.stock, 0);
                        setEditingProduct({
                          ...editingProduct,
                          sizes: newSizes,
                          variants: newVars,
                          stockCount: sumStock,
                          inStock: sumStock > 0
                        });
                        setVariantNewSizeName('');
                      }}
                      className="px-3 py-1.5 bg-[#4A3B32] hover:bg-[#382C25] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      + Add Size
                    </button>
                  </div>
                </div>

                {/* 3. Variants Stock Table */}
                {editingProduct.variants && editingProduct.variants.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#4A443D] uppercase tracking-wider text-[11px]">
                        Variant Stock Matrix ({editingProduct.variants.length} combinations):
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[#7A7369]">Quick set:</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editingProduct.variants!.map(v => ({ ...v, stock: 10 }));
                            const sum = updated.reduce((s, v) => s + v.stock, 0);
                            setEditingProduct({ ...editingProduct, variants: updated, stockCount: sum, inStock: sum > 0 });
                          }}
                          className="px-2 py-0.5 bg-[#FAF5EE] hover:bg-[#F2ECE1] border border-[#E8DFC8] rounded text-[10px] font-bold text-[#8B2628] cursor-pointer"
                        >
                          All 10
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editingProduct.variants!.map(v => ({ ...v, stock: 5 }));
                            const sum = updated.reduce((s, v) => s + v.stock, 0);
                            setEditingProduct({ ...editingProduct, variants: updated, stockCount: sum, inStock: sum > 0 });
                          }}
                          className="px-2 py-0.5 bg-[#FAF5EE] hover:bg-[#F2ECE1] border border-[#E8DFC8] rounded text-[10px] font-bold text-[#8B2628] cursor-pointer"
                        >
                          All 5
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editingProduct.variants!.map(v => ({ ...v, stock: 0 }));
                            setEditingProduct({ ...editingProduct, variants: updated, stockCount: 0, inStock: false });
                          }}
                          className="px-2 py-0.5 bg-[#FFEBEE] hover:bg-[#FFCDD2] border border-[#FFCDD2] rounded text-[10px] font-bold text-[#C62828] cursor-pointer"
                        >
                          All Out (0)
                        </button>
                      </div>
                    </div>

                    <div className="border border-[#EDE9E1] rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-[#FAF8F5] border-b border-[#EDE9E1] text-[#7A7369] uppercase font-bold sticky top-0">
                          <tr>
                            <th className="py-2 px-3">Color</th>
                            <th className="py-2 px-3">Size</th>
                            <th className="py-2 px-3">Stock Count</th>
                            <th className="py-2 px-3">Extra Price (Tk)</th>
                            <th className="py-2 px-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EDE9E1]">
                          {editingProduct.variants.map((variant, vIdx) => {
                            const colorObj = editingProduct.colors?.find(c => c.name.toLowerCase() === variant.color.toLowerCase());
                            return (
                              <tr key={variant.id || vIdx} className="hover:bg-[#FAF8F5] transition-colors">
                                <td className="py-2 px-3 font-semibold text-[#1C1A18]">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                                      style={{ backgroundColor: colorObj?.hex || '#666' }}
                                    />
                                    <span>{variant.color}</span>
                                  </div>
                                </td>
                                <td className="py-2 px-3 font-bold text-[#4A443D]">
                                  {variant.size}
                                </td>
                                <td className="py-1.5 px-3">
                                  <input
                                    type="number"
                                    min="0"
                                    value={variant.stock}
                                    onChange={(e) => {
                                      const val = sanitizePositiveInteger(e.target.value, 0);
                                      const updatedVars = [...editingProduct.variants!];
                                      updatedVars[vIdx] = { ...updatedVars[vIdx], stock: val };
                                      const total = updatedVars.reduce((sum, v) => sum + v.stock, 0);
                                      setEditingProduct({
                                        ...editingProduct,
                                        variants: updatedVars,
                                        stockCount: total,
                                        inStock: total > 0
                                      });
                                    }}
                                    className="w-20 px-2 py-1 bg-white border border-[#DDD5C7] rounded text-xs font-bold text-[#1C1A18] focus:border-[#8B2628]"
                                  />
                                </td>
                                <td className="py-1.5 px-3">
                                  <input
                                    type="number"
                                    min="0"
                                    value={variant.additionalPrice || 0}
                                    onChange={(e) => {
                                      const val = sanitizePositiveInteger(e.target.value, 0);
                                      const updatedVars = [...editingProduct.variants!];
                                      updatedVars[vIdx] = { ...updatedVars[vIdx], additionalPrice: val };
                                      setEditingProduct({
                                        ...editingProduct,
                                        variants: updatedVars
                                      });
                                    }}
                                    placeholder="+0"
                                    className="w-20 px-2 py-1 bg-white border border-[#DDD5C7] rounded text-xs text-[#7A7369] focus:border-[#8B2628]"
                                  />
                                </td>
                                <td className="py-2 px-3 text-right">
                                  {variant.stock > 0 ? (
                                    <span className="px-2 py-0.5 bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] rounded text-[10px] font-bold">
                                      {variant.stock} in stock
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] rounded text-[10px] font-bold">
                                      Sold Out
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={editingProduct.inStock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                    className="accent-[#8B2628]"
                  />
                  <span>In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={editingProduct.isTopSelling}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isTopSelling: e.target.checked })}
                    className="accent-[#8B2628]"
                  />
                  <span>Top Selling Feature</span>
                </label>
              </div>
            </form>

            {/* Modal Actions Sticky Footer */}
            <div className="p-4 sm:p-5 bg-[#FCFBF8] border-t border-[#EDE9E1] flex items-center justify-between shrink-0">
              {isViewer ? (
                <span className="text-[11px] text-[#E65100] font-semibold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> View-Only Mode: You do not have permission to make changes
                </span>
              ) : (
                <span className="text-[11px] text-[#7A7369]">
                  💡 Fields marked with * are required
                </span>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-[#DDD5C7] hover:bg-[#FAF8F5] rounded-xl text-xs font-semibold text-[#4A443D] cursor-pointer"
                >
                  {isViewer ? 'Close' : 'Cancel'}
                </button>
                {!isViewer && (
                  <button
                    type="submit"
                    form="product-modal-form"
                    className="px-6 py-2 bg-[#8B2628] hover:bg-[#721E20] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Save Product
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ================= LOG TRACKING EVENT MODAL ================= */}
      {trackingOrderModalId && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-hidden">
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity" 
            onClick={() => setTrackingOrderModalId(null)}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#EDE9E1] p-6 space-y-4 text-left max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 my-auto">
              <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE1]">
                <h3 className="font-serif text-base font-bold text-[#1C1A18]">
                  Log Tracking Milestone (#{trackingOrderModalId})
                </h3>
                <button
                  onClick={() => setTrackingOrderModalId(null)}
                  className="p-1 text-[#7A7369] hover:text-[#1C1A18]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-[#4A443D]">Milestone Status</label>
                  <select
                    value={newTrackingStatus}
                    onChange={(e) => setNewTrackingStatus(e.target.value as OrderStatus)}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg font-semibold"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing / Packed</option>
                    <option value="Shipped">Shipped / In Transit</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#4A443D]">Tracking Note / Message</label>
                  <input
                    type="text"
                    value={newTrackingNote}
                    onChange={(e) => setNewTrackingNote(e.target.value)}
                    placeholder="e.g. Handed over to RedX Courier for delivery"
                    className="w-full p-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#4A443D]">Location (optional)</label>
                  <input
                    type="text"
                    value={newTrackingLocation}
                    onChange={(e) => setNewTrackingLocation(e.target.value)}
                    placeholder="e.g. Dhaka Central Hub, Banani"
                    className="w-full p-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setTrackingOrderModalId(null)}
                    className="px-3 py-1.5 border border-[#DDD5C7] rounded-lg text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      addOrderTrackingEvent(
                        trackingOrderModalId,
                        newTrackingStatus,
                        newTrackingNote || `Order marked as ${newTrackingStatus}`,
                        newTrackingLocation || undefined
                      );
                      showToast('Milestone added to order timeline.');
                      setTrackingOrderModalId(null);
                    }}
                    className="px-4 py-1.5 bg-[#8B2628] hover:bg-[#721E20] text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Save Milestone
                  </button>
                </div>
              </div>
            </div>
        </div>,
        document.body
      )}

      {/* ================= EDIT / ADD CATEGORY MODAL ================= */}
      {isCategoryModalOpen && editingCategory && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity" 
            onClick={() => {
              setIsCategoryModalOpen(false);
              setEditingCategory(null);
            }}
          />
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#EDE9E1] overflow-hidden text-left flex flex-col h-[90vh] max-h-[700px] animate-in zoom-in-95 duration-200 my-auto">
            {/* Modal Header */}
              <div className="p-5 bg-[#FCFBF8] border-b border-[#EDE9E1] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#8B2628]" />
                  <h3 className="font-serif text-lg font-bold text-[#1C1A18]">
                    {categories.some(c => c.id === editingCategory.id) ? 'Edit Category' : 'Create New Category'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryModalOpen(false);
                    setEditingCategory(null);
                  }}
                  className="p-1.5 rounded-full text-[#7A7369] hover:text-[#1C1A18] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form id="category-modal-form" onSubmit={handleSaveCategory} className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 text-[#4A443D]">
                      Category Name * (e.g. MEN, WOMEN, KIDS)
                    </label>
                    <input
                      type="text"
                      required
                      value={editingCategory.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingCategory({
                          ...editingCategory,
                          name: val,
                          // auto-suggest slug if adding fresh category
                          slug: (!editingCategory.slug || editingCategory.slug === editingCategory.name.toLowerCase().trim())
                            ? val.toLowerCase().trim().replace(/\s+/g, '-')
                            : editingCategory.slug
                        });
                      }}
                      placeholder="e.g. MEN, WOMEN, ACCESSORIES"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs font-bold text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#4A443D]">
                      URL Slug * (lowercase)
                    </label>
                    <input
                      type="text"
                      required
                      value={editingCategory.slug}
                      onChange={(e) => setEditingCategory({
                        ...editingCategory,
                        slug: e.target.value.toLowerCase().trim().replace(/\s+/g, '-')
                      })}
                      placeholder="e.g. men, women, kids"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs font-mono text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                  </div>
                </div>

                {/* Cover Banner Image */}
                <div>
                  <label className="block font-semibold mb-1 text-[#4A443D]">
                    Category Banner Image URL *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      required
                      value={editingCategory.image}
                      onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                    />
                  </div>

                  {editingCategory.image && (
                    <div className="mt-2 relative h-28 w-full rounded-xl overflow-hidden border border-[#EDE9E1] bg-[#EDE9E1]">
                      <img
                        src={editingCategory.image}
                        alt="Category Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <span className="text-white font-serif font-bold text-sm tracking-wider drop-shadow-sm">
                          {editingCategory.name || 'Preview Banner'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subcategories Management */}
                <div className="pt-3 border-t border-[#F2ECE1] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-[#1C1A18]">
                        Subcategories
                      </h4>
                      <p className="text-[11px] text-[#7A7369]">
                        Add items like Panjabi, Polo Shirt, Sharee, Pajama under this category.
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-[#FAF5EE] text-[#8B2628] rounded font-bold text-[11px]">
                      {editingCategory.subcategories?.length || 0} Defined
                    </span>
                  </div>

                  {/* Existing Subcategories Badges */}
                  <div className="min-h-[50px] p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE9E1] flex flex-wrap gap-2 items-center">
                    {(!editingCategory.subcategories || editingCategory.subcategories.length === 0) ? (
                      <p className="text-[#9E978C] text-xs italic">
                        No subcategories added yet. Use the fields below to add one.
                      </p>
                    ) : (
                      editingCategory.subcategories.map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#DDD5C7] rounded-lg text-xs font-semibold text-[#1C1A18] shadow-2xs"
                        >
                          <span>{sub.name}</span>
                          <span className="text-[9px] uppercase px-1 py-0.2 bg-[#FAF5EE] text-[#8B2628] rounded">
                            {sub.group}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategory({
                                ...editingCategory,
                                subcategories: editingCategory.subcategories.filter((_, idx) => idx !== sIdx)
                              });
                            }}
                            className="text-[#9E978C] hover:text-[#D32F2F] ml-0.5 cursor-pointer"
                            title="Remove subcategory"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Add Subcategory Sub-form */}
                  <div className="p-3 bg-[#FAF5EE]/70 rounded-xl border border-[#EDE9E1] space-y-2">
                    <span className="text-[11px] font-bold text-[#8B2628] uppercase tracking-wider block">
                      + Add New Subcategory:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-6">
                        <input
                          type="text"
                          value={newSubcatName}
                          onChange={(e) => setNewSubcatName(e.target.value)}
                          placeholder="Subcategory Name (e.g. Panjabi)"
                          className="w-full px-3 py-1.5 bg-white border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <select
                          value={newSubcatGroup}
                          onChange={(e) => setNewSubcatGroup(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                        >
                          <option value="TOPWEAR">TOPWEAR</option>
                          <option value="BOTTOMWEAR">BOTTOMWEAR</option>
                          <option value="TRADITIONAL">TRADITIONAL</option>
                          <option value="WESTERN">WESTERN</option>
                          <option value="ACCESSORIES">ACCESSORIES</option>
                          <option value="FOOTWEAR">FOOTWEAR</option>
                          <option value="GENERAL">GENERAL</option>
                        </select>
                      </div>
                      {!isViewer && (
                        <div className="sm:col-span-2">
                          <button
                            type="button"
                            onClick={handleAddSubcategoryToEditingCategory}
                            className="w-full py-1.5 px-3 bg-[#8B2628] hover:bg-[#721E20] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer text-center"
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </form>

              {/* Modal Actions Sticky Footer */}
              <div className="p-4 sm:p-5 bg-[#FCFBF8] border-t border-[#F2ECE1] flex items-center justify-between shrink-0">
                {isViewer ? (
                  <span className="text-[11px] text-[#E65100] font-semibold flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> View-Only Mode: Editing is disabled
                  </span>
                ) : (
                  <span className="text-[11px] text-[#7A7369]">
                    💡 Manage subcategories and banner images
                  </span>
                )}
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCategoryModalOpen(false);
                      setEditingCategory(null);
                    }}
                    className="px-4 py-2 border border-[#DDD5C7] hover:bg-[#FAF8F5] rounded-xl text-xs font-semibold text-[#4A443D] transition-colors cursor-pointer"
                  >
                    {isViewer ? 'Close' : 'Cancel'}
                  </button>
                  {!isViewer && (
                    <button
                      type="submit"
                      form="category-modal-form"
                      className="px-6 py-2 bg-[#8B2628] hover:bg-[#721E20] text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-colors shadow-xs cursor-pointer"
                    >
                      Save Category
                    </button>
                  )}
                </div>
              </div>
            </div>
        </div>,
        document.body
      )}

      {/* ================= ADD NEW STAFF USER MODAL ================= */}
      {isUserModalOpen && isSuperAdmin && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-hidden">
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsUserModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EDE9E1] overflow-hidden text-left max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 my-auto">
              <div className="p-5 bg-[#FCFBF8] border-b border-[#EDE9E1] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FAF5EE] text-[#8B2628] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#1C1A18]">
                      Add New Staff Member
                    </h3>
                    <p className="text-[11px] text-[#7A7369]">
                      Create admin, moderator, or view-only staff accounts.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsUserModalOpen(false)}
                  className="p-1.5 text-[#7A7369] hover:text-[#1C1A18] rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateStaff} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-[#4A443D]">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanvir Hasan"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs font-semibold text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#4A443D]">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="staff@example.com"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#4A443D]">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#4A443D]">Access Role *</label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as StaffRole)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs font-bold text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                  >
                    <option value="admin">Admin — Full access & staff control</option>
                    <option value="moderator">Moderator — Products & order processing access</option>
                    <option value="viewer">Viewer — View-only access (Cannot edit or delete)</option>
                  </select>
                  <div className="mt-2 p-3 bg-[#FAF5EE] rounded-xl border border-[#EDE9E1] text-[11px] text-[#4A443D]">
                    {newStaffRole === 'admin' && '👑 Super Admin: Can manage all store data, edit CMS, change prices, and add or remove other staff members.'}
                    {newStaffRole === 'moderator' && '🛠️ Moderator: Can manage products, update order tracking status, and dispatch couriers, but cannot create or delete staff users.'}
                    {newStaffRole === 'viewer' && '👁️ Read-Only Viewer: Can inspect orders, products, and analytics, but cannot modify, add, or delete any data.'}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F2ECE1] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUserModalOpen(false)}
                    className="px-4 py-2 border border-[#DDD5C7] hover:bg-[#FAF8F5] rounded-xl text-xs font-semibold text-[#4A443D] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={userFormLoading}
                    className="px-6 py-2 bg-[#8B2628] hover:bg-[#721E20] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    {userFormLoading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
        </div>,
        document.body
      )}

    </div>
  );
};
