import {
  getCatalog,
  getCatalogProductById,
  getCatalogByCategory,
  searchCatalog,
} from "./catalog/catalog-loader";

import {
  CATALOG_CATEGORIES,
  TOTAL_TARGET_PRODUCTS,
} from "./catalog/catalog-config";

export const categories = CATALOG_CATEGORIES.map(
  (category) => category.name,
);

export const TOTAL_PRODUCTS = TOTAL_TARGET_PRODUCTS;

export const categoryProductCounts = Object.fromEntries(
  CATALOG_CATEGORIES.map((category) => [
    category.name,
    category.target,
  ]),
);

/**
 * Normalize product pricing for ShopKartX.
 *
 * Important:
 * We do NOT invent prices when the catalog does not contain
 * real pricing data. Once the backend/catalog provides a price,
 * it is always displayed as Indian Rupees (INR).
 */
function normalizeProduct(product) {
  if (!product || typeof product !== "object") {
    return product;
  }

  const rawPrice = Number(product.price);

  const hasValidPrice =
    Number.isFinite(rawPrice) && rawPrice > 0;

  const rawOriginalPrice = Number(
    product.originalPrice,
  );

  const hasValidOriginalPrice =
    Number.isFinite(rawOriginalPrice) &&
    rawOriginalPrice > 0;

  const rawDiscount = Number(
    product.discountPercentage,
  );

  const hasValidDiscount =
    Number.isFinite(rawDiscount) &&
    rawDiscount > 0;

  return {
    ...product,

    // Always use INR for ShopKartX.
    currency: "INR",

    // Preserve only genuine catalog/backend pricing.
    price: hasValidPrice ? rawPrice : null,

    priceAvailable: hasValidPrice,

    originalPrice: hasValidOriginalPrice
      ? rawOriginalPrice
      : null,

    discountPercentage: hasValidDiscount
      ? rawDiscount
      : 0,
  };
}

export async function fetchProducts() {
  const products = await getCatalog();

  if (!Array.isArray(products)) {
    return [];
  }

  return products.map(normalizeProduct);
}

export async function getProductById(id) {
  const product = await getCatalogProductById(id);

  return normalizeProduct(product);
}

export async function getProductsByCategory(
  categoryName,
) {
  const products =
    await getCatalogByCategory(categoryName);

  if (!Array.isArray(products)) {
    return [];
  }

  return products.map(normalizeProduct);
}

export async function searchProducts(query) {
  const products = await searchCatalog(query);

  if (!Array.isArray(products)) {
    return [];
  }

  return products.map(normalizeProduct);
}

export function getCategories() {
  return categories;
}

export function getCategoryCounts(products = []) {
  const counts = Object.fromEntries(
    CATALOG_CATEGORIES.map((category) => [
      category.name,
      0,
    ]),
  );

  for (const product of products) {
    if (
      product &&
      counts[product.category] !== undefined
    ) {
      counts[product.category] += 1;
    }
  }

  return counts;
}

export function getCategoryConfig(categoryName) {
  return CATALOG_CATEGORIES.find(
    (category) => category.name === categoryName,
  );
}

export function getTotalCatalogTarget() {
  return TOTAL_TARGET_PRODUCTS;
}

export default fetchProducts;
