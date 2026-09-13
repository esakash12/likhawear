import { Product, ProductVariant } from '../types';

/**
 * Ensures a product has a complete variant matrix for all colors and sizes.
 */
export const ensureProductVariants = (product: Product): Product => {
  if (product.variants && product.variants.length > 0) {
    return product;
  }

  const colors = product.colors && product.colors.length > 0 
    ? product.colors.map(c => c.name) 
    : ['Standard'];
  const sizes = product.sizes && product.sizes.length > 0 
    ? product.sizes 
    : ['Standard'];

  const variants: ProductVariant[] = [];
  const totalCombos = colors.length * sizes.length;
  const totalStock = product.stockCount !== undefined ? product.stockCount : 12;
  const baseStock = Math.max(1, Math.floor(totalStock / totalCombos));

  let assignedStock = 0;
  colors.forEach((color, cIdx) => {
    sizes.forEach((size, sIdx) => {
      const idx = cIdx * sizes.length + sIdx;
      // create natural variation in stock per variant
      let variantStock = (idx % 3 === 0) ? baseStock + 2 : (idx % 2 === 0 ? Math.max(1, baseStock - 1) : baseStock);
      if (idx === totalCombos - 1) {
        // assign remaining to match total exactly
        variantStock = Math.max(0, totalStock - assignedStock);
      } else {
        assignedStock += variantStock;
      }

      variants.push({
        id: `${product.id}-var-${color.toLowerCase().replace(/\s+/g, '-')}-${size.toLowerCase().replace(/[^a-z0-9]/gi, '-')}`,
        color,
        size,
        stock: Math.max(0, variantStock),
        sku: `${product.sku || 'ZN'}-${color.substring(0, 3).toUpperCase()}-${size.replace(/[^a-zA-Z0-9]/g, '')}`,
        additionalPrice: 0,
      });
    });
  });

  return {
    ...product,
    variants,
    stockCount: variants.reduce((sum, v) => sum + v.stock, 0)
  };
};

/**
 * Returns the exact available stock for a product's specific color and size.
 */
export const getVariantStock = (
  product: Product,
  selectedColor?: string,
  selectedSize?: string
): number => {
  if (!product) return 0;
  if (!product.inStock) return 0;

  const color = selectedColor || product.colors?.[0]?.name || 'Standard';
  const size = selectedSize || product.sizes?.[0] || 'Standard';

  const variants = (product.variants && product.variants.length > 0)
    ? product.variants 
    : (ensureProductVariants(product).variants || []);

  const match = variants.find(
    v => (!v.color || v.color.toLowerCase() === color.toLowerCase()) &&
         (!v.size || v.size.toLowerCase() === size.toLowerCase())
  );

  if (match !== undefined) {
    return Math.max(0, match.stock);
  }

  return Math.max(0, product.stockCount !== undefined ? product.stockCount : (product.inStock ? 99 : 0));
};
