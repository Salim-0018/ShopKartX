// ShopKartX
// Local catalog architecture:
// External image APIs are intentionally disabled here.
// Product images will be supplied by the local catalog generator.

const SUPPORTED_CATEGORIES = [
  "Mobiles",
  "Laptops",
  "Fashion",
  "Home",
  "Beauty",
  "Gaming",
  "Audio",
  "Grocery",
];

const CATEGORY_SEARCH_TERMS = {
  Mobiles: [
    "smartphone",
    "mobile phone",
    "android phone",
    "iphone",
    "5g smartphone",
  ],

  Laptops: [
    "laptop",
    "notebook",
    "ultrabook",
    "gaming laptop",
    "business laptop",
  ],

  Fashion: [
    "t-shirt",
    "shirt",
    "jeans",
    "dress",
    "jacket",
    "shoes",
    "sneakers",
    "hoodie",
  ],

  Home: [
    "sofa",
    "chair",
    "table",
    "bed",
    "lamp",
    "desk",
    "furniture",
    "home decor",
  ],

  Beauty: [
    "skincare",
    "face cream",
    "moisturizer",
    "shampoo",
    "makeup",
    "lipstick",
    "perfume",
    "cosmetics",
  ],

  Gaming: [
    "gaming keyboard",
    "gaming mouse",
    "game controller",
    "gaming headset",
    "gaming monitor",
    "gaming console",
    "gamepad",
  ],

  Audio: [
    "headphones",
    "earbuds",
    "earphones",
    "bluetooth speaker",
    "soundbar",
    "wireless headphones",
  ],

  Grocery: [
    "rice",
    "tea",
    "coffee",
    "biscuits",
    "pasta",
    "spices",
    "snacks",
    "cereal",
  ],
};

export function isSupportedImageCategory(categoryName) {
  return SUPPORTED_CATEGORIES.includes(categoryName);
}

export function getImageSearchTerms(categoryName) {
  return CATEGORY_SEARCH_TERMS[categoryName] || [];
}

// Kept for compatibility with the existing catalog-loader.
// It deliberately returns an empty array because image ingestion
// will now happen through the local catalog-generation pipeline.
export async function getCategoryImages() {
  return [];
}

export async function getAllCategoryImages() {
  const result = {};

  for (const category of SUPPORTED_CATEGORIES) {
    result[category] = [];
  }

  return result;
}

export function clearImageSourceCache() {
  // No external image cache exists anymore.
}

export default {
  getCategoryImages,
  getAllCategoryImages,
  clearImageSourceCache,
  getImageSearchTerms,
  isSupportedImageCategory,
};
