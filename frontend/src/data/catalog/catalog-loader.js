import catalogData from "./catalog.json";

const CATALOG_URL = "/src/data/catalog/catalog.json";

let catalogCache = null;

function cleanText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function normalizeImageUrl(value) {
  const image = cleanText(value);

  if (!image) {
    return "";
  }

  // Local ShopKartX catalog images.
  if (image.startsWith("/catalog/")) {
    return image;
  }

  // Protocol-relative URLs.
  if (image.startsWith("//")) {
    return `https:${image}`;
  }

  // Absolute remote URLs.
  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return "";
}

function normalizeProduct(product, index = 0) {
  if (!product || typeof product !== "object") {
    return null;
  }

  const image =
    normalizeImageUrl(product.image) ||
    normalizeImageUrl(product.images?.[0]) ||
    normalizeImageUrl(product.thumbnail);

  const images = Array.isArray(product.images)
    ? product.images
        .map(normalizeImageUrl)
        .filter(Boolean)
    : [];

  if (image && !images.includes(image)) {
    images.unshift(image);
  }

  const title =
    cleanText(product.title) ||
    cleanText(product.name) ||
    `Product ${index + 1}`;

  const category =
    cleanText(product.category) || "Fashion";

  const priceNumber =
    typeof product.price === "number"
      ? product.price
      : Number(product.price);

  const hasPrice =
    Number.isFinite(priceNumber) &&
    priceNumber > 0 &&
    product.priceAvailable !== false;

  return {
    ...product,

    id:
      cleanText(product.id) ||
      `product-${index + 1}`,

    title,

    name: title,

    description:
      cleanText(product.description) ||
      `${title} from ${
        cleanText(product.brand) || "ShopKartX"
      }`,

    brand:
      cleanText(product.brand) || "H&M",

    category,

    categorySlug:
      cleanText(product.categorySlug) ||
      category
        .toLowerCase()
        .replace(/\s+/g, "-"),

    subcategory:
      cleanText(product.subcategory) ||
      "Fashion",

    image,

    thumbnail: image,

    images,

    price:
      hasPrice
        ? priceNumber
        : null,

    priceAvailable: hasPrice,

    currency:
      cleanText(product.currency) || "INR",

    rating:
      Number.isFinite(Number(product.rating))
        ? Number(product.rating)
        : 0,

    ratingCount:
      Number.isFinite(
        Number(product.ratingCount),
      )
        ? Number(product.ratingCount)
        : 0,

    stock:
      Number.isFinite(Number(product.stock))
        ? Number(product.stock)
        : 0,

    stockAvailable:
      product.stockAvailable === true,

    searchText:
      cleanText(product.searchText) ||
      [
        title,
        product.description,
        product.brand,
        category,
        product.subcategory,
        product.colour,
      ]
        .filter(Boolean)
        .join(" "),
  };
}

function normalizeCatalogPayload(payload) {
  if (!payload) {
    return [];
  }

  const rawProducts = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.products)
      ? payload.products
      : [];

  return rawProducts
    .map((product, index) =>
      normalizeProduct(product, index),
    )
    .filter(Boolean);
}

function loadLocalCatalog() {
  if (catalogCache) {
    return catalogCache;
  }

  const products =
    normalizeCatalogPayload(catalogData);

  catalogCache = products;

  console.info(
    `[ShopKartX] Loaded local catalog: ${products.length} real products`,
  );

  if (products.length > 0) {
    const first = products[0];

    console.info(
      "[ShopKartX] First product:",
      {
        id: first.id,
        title: first.title,
        brand: first.brand,
        category: first.category,
        image: first.image,
        thumbnail: first.thumbnail,
        price: first.price,
        priceAvailable:
          first.priceAvailable,
      },
    );
  }

  return catalogCache;
}

export async function getCatalog() {
  return loadLocalCatalog();
}

export async function fetchProducts() {
  return getCatalog();
}

export async function getCatalogProductById(id) {
  const products = loadLocalCatalog();

  return (
    products.find(
      (product) =>
        String(product.id) === String(id),
    ) || null
  );
}

export async function getProductById(id) {
  return getCatalogProductById(id);
}

export async function getCatalogByCategory(
  categoryName,
) {
  const products = loadLocalCatalog();

  const requestedCategory =
    cleanText(categoryName).toLowerCase();

  if (
    !requestedCategory ||
    requestedCategory === "all"
  ) {
    return products;
  }

  return products.filter((product) => {
    const category =
      cleanText(product.category).toLowerCase();

    const slug =
      cleanText(product.categorySlug).toLowerCase();

    const subcategory =
      cleanText(product.subcategory).toLowerCase();

    return (
      category === requestedCategory ||
      slug === requestedCategory ||
      subcategory === requestedCategory
    );
  });
}

export async function getProductsByCategory(
  categoryName,
) {
  return getCatalogByCategory(categoryName);
}

export async function searchCatalog(query) {
  const products = loadLocalCatalog();

  const search =
    cleanText(query).toLowerCase();

  if (!search) {
    return products;
  }

  const terms = search
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);

  return products.filter((product) => {
    const searchableText = [
      product.title,
      product.name,
      product.description,
      product.brand,
      product.category,
      product.categorySlug,
      product.subcategory,
      product.department,
      product.section,
      product.colour,
      product.searchText,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return terms.every((term) =>
      searchableText.includes(term),
    );
  });
}

export async function searchProducts(query) {
  return searchCatalog(query);
}

export function clearCatalogCache() {
  catalogCache = null;
}

export function getCatalogStats() {
  const products = loadLocalCatalog();

  const categoryCounts = {};

  for (const product of products) {
    const category =
      product.category || "Unknown";

    categoryCounts[category] =
      (categoryCounts[category] || 0) + 1;
  }

  return {
    totalProducts: products.length,

    categoryCounts,

    productsWithImages:
      products.filter(
        (product) =>
          Boolean(product.image),
      ).length,

    productsWithPrices:
      products.filter(
        (product) =>
          product.priceAvailable,
      ).length,
  };
}

export async function loadCatalogFromNetwork() {
  try {
    const response = await fetch(
      CATALOG_URL,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(
        `Catalog request failed: ${response.status}`,
      );
    }

    const payload =
      await response.json();

    const products =
      normalizeCatalogPayload(payload);

    if (products.length > 0) {
      catalogCache = products;
    }

    return products;
  } catch (error) {
    console.warn(
      "[ShopKartX] Network catalog unavailable. Using imported local catalog.",
      error,
    );

    return loadLocalCatalog();
  }
}

export default fetchProducts;
