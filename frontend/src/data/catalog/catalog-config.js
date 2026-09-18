export const CATALOG_CATEGORIES = [
  {
    id: "mobiles",
    name: "Mobiles",
    slug: "mobiles",
    icon: "Smartphone",
    target: 500,
    searchTerms: [
      "smartphone",
      "mobile phone",
      "iphone",
      "android phone",
      "5g phone",
    ],
  },

  {
    id: "laptops",
    name: "Laptops",
    slug: "laptops",
    icon: "Laptop",
    target: 500,
    searchTerms: [
      "laptop",
      "notebook",
      "macbook",
      "gaming laptop",
      "ultrabook",
    ],
  },

  {
    id: "fashion",
    name: "Fashion",
    slug: "fashion",
    icon: "Shirt",
    target: 500,
    searchTerms: [
      "t-shirt",
      "shirt",
      "jeans",
      "shoes",
      "dress",
      "jacket",
    ],
  },

  {
    id: "home",
    name: "Home",
    slug: "home",
    icon: "Sofa",
    target: 500,
    searchTerms: [
      "sofa",
      "chair",
      "table",
      "bed",
      "lamp",
      "furniture",
    ],
  },

  {
    id: "beauty",
    name: "Beauty",
    slug: "beauty",
    icon: "Sparkles",
    target: 500,
    searchTerms: [
      "shampoo",
      "face cream",
      "moisturizer",
      "perfume",
      "makeup",
      "skincare",
    ],
  },

  {
    id: "gaming",
    name: "Gaming",
    slug: "gaming",
    icon: "Gamepad2",
    target: 500,
    searchTerms: [
      "gaming keyboard",
      "gaming mouse",
      "game controller",
      "gaming headset",
      "gaming monitor",
      "gaming console",
    ],
  },

  {
    id: "audio",
    name: "Audio",
    slug: "audio",
    icon: "Headphones",
    target: 500,
    searchTerms: [
      "headphones",
      "earbuds",
      "earphones",
      "bluetooth speaker",
      "soundbar",
      "wireless headphones",
    ],
  },

  {
    id: "grocery",
    name: "Grocery",
    slug: "grocery",
    icon: "ShoppingBasket",
    target: 500,
    searchTerms: [
      "rice",
      "tea",
      "coffee",
      "biscuits",
      "pasta",
      "spices",
      "snacks",
    ],
  },
];

export const TOTAL_TARGET_PRODUCTS =
  CATALOG_CATEGORIES.reduce(
    (total, category) =>
      total + category.target,
    0,
  );

export function getCatalogCategory(
  categoryId,
) {
  return CATALOG_CATEGORIES.find(
    (category) =>
      category.id === categoryId,
  );
}

export function getCatalogCategoryByName(
  categoryName,
) {
  return CATALOG_CATEGORIES.find(
    (category) =>
      category.name === categoryName,
  );
}
