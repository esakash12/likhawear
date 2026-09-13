/**
 * Facebook Meta Pixel & Event Tracking Utility for Zinnia Bangladesh
 */

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

let initializedPixelId: string | null = null;

export const initMetaPixel = (pixelId: string) => {
  if (!pixelId || typeof window === 'undefined' || initializedPixelId === pixelId) return;

  try {
    /* eslint-disable */
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */

    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
    initializedPixelId = pixelId;
    console.log(`[Meta Pixel] Initialized with ID: ${pixelId}`);
  } catch (err) {
    console.warn('[Meta Pixel] Failed to initialize:', err);
  }
};

export const trackPixelEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
  }
};

export const pixelViewContent = (product: { id: string; title: string; price: number; category?: string }) => {
  trackPixelEvent('ViewContent', {
    content_name: product.title,
    content_category: product.category || 'Fashion',
    content_ids: [product.id],
    content_type: 'product',
    value: product.price,
    currency: 'BDT',
  });
};

export const pixelAddToCart = (product: { id: string; title: string; price: number }, quantity: number = 1) => {
  trackPixelEvent('AddToCart', {
    content_name: product.title,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price * quantity,
    currency: 'BDT',
  });
};

export const pixelInitiateCheckout = (total: number, itemsCount: number) => {
  trackPixelEvent('InitiateCheckout', {
    num_items: itemsCount,
    value: total,
    currency: 'BDT',
  });
};

export const pixelPurchase = (order: { id: string; total: number; items?: any[] }) => {
  trackPixelEvent('Purchase', {
    content_ids: (order.items || []).map(i => i.productId),
    content_type: 'product',
    value: order.total,
    currency: 'BDT',
    order_id: order.id,
  });
};
