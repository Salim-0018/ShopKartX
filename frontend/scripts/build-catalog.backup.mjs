import fs from "node:fs/promises";
import path from "node:path";

const HF_ROWS_API = "https://datasets-server.huggingface.co/rows";

const TARGET_PER_CATEGORY = 500;

const SOURCES = {
  fashion: {
    dataset: "Qdrant/hm_ecommerce_products",
    split: "train",
    categories: ["Fashion"],
  },

  home: {
    dataset: "filnow/furniture-synthetic-dataset",
    split: "train",
    categories: ["Home"],
  },

  general: {
    dataset: "Shopify/product-catalogue",
    split: "train",
    categories: [
      "Mobiles",
      "Laptops",
      "Beauty",
      "Gaming",
      "Audio",
      "Grocery",
    ],
  },
};

const CATEGORY_RULES = {
  Mobiles: [
    "smartphone",
    "smart phone",
    "mobile phone",
    "cell phone",
    "iphone",
    "android",
    "5g phone",
    "galaxy phone",
    "pixel phone",
  ],

  Laptops: [
    "laptop",
    "notebook",
    "chromebook",
    "macbook",
    "ultrabook",
    "gaming laptop",
  ],

  Beauty: [
    "beauty",
    "cosmetic",
    "cosmetics",
    "makeup",
    "skin care",
    "skincare",
    "hair care",
    "haircare",
    "shampoo",
    "conditioner",
    "moisturizer",
    "lipstick",
    "mascara",
    "foundation",
    "perfume",
    "fragrance",
  ],

  Gaming: [
    "gaming",
    "video game",
    "video games",
    "game console",
    "game consoles",
    "playstation",
    "xbox",
    "nintendo",
    "gamepad",
    "controller",
    "gaming mouse",
    "gaming keyboard",
    "gaming headset",
  ],

  Audio: [
    "headphone",
    "headphones",
    "earbuds",
    "earbud",
    "earphone",
    "earphones",
    "speaker",
    "speakers",
    "soundbar",
    "sound system",
    "microphone",
    "bluetooth speaker",
    "wireless headphones",
  ],

  Grocery: [
    "grocery",
    "groceries",
    "food",
    "foods",
    "beverage",
    "beverages",
    "snack",
    "snacks",
    "coffee",
    "tea",
    "cereal",
    "pasta",
    "rice",
    "spice",
    "spices",
    "sauce",
    "sauces",
    "drink",
    "drinks",
  ],
};

const CATEGORY_EXCLUSIONS = {
  Mobiles: [
    "case",
    "cover",
    "charger",
    "charging cable",
    "usb cable",
    "screen protector",
    "tempered glass",
    "phone stand",
  ],

  Laptops: [
    "laptop bag",
    "laptop sleeve",
    "laptop case",
    "charger",
    "charging cable",
    "mouse",
    "keyboard",
    "mouse pad",
  ],

  Beauty: [
    "phone",
    "smartphone",
    "laptop",
    "furniture",
    "food",
    "grocery",
  ],

  Gaming: [
    "car",
    "cars",
    "vehicle",
    "motorcycle",
    "football",
    "baseball",
    "basketball",
    "cricket",
  ],

  Audio: [
    "charger",
    "charging cable",
    "usb cable",
    "phone case",
    "laptop",
    "television",
    "tv",
  ],

  Grocery: [
    "phone",
    "smartphone",
    "laptop",
    "furniture",
    "shoes",
    "clothing",
    "cosmetic",
    "lipstick",
    "perfume",
  ],
};

const OUTPUT_DIR = path.resolve("src/data/catalog");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "catalog.json");

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsTerm(text, term) {
  return text.includes(normalize(term));
}

function scoreCategory(category, text) {
  const rules = CATEGORY_RULES[category] || [];

  let score = 0;

  for (const rule of rules) {
    if (containsTerm(text, rule)) {
      score += rule.includes(" ") ? 3 : 1;
    }
  }

  const exclusions = CATEGORY_EXCLUSIONS[category] || [];

  for (const exclusion of exclusions) {
    if (containsTerm(text, exclusion)) {
      score -= 8;
    }
  }

  return score;
}

function detectGeneralCategory(row) {
  const data = row?.row ?? row;

  const text = normalize(
    [
      data?.ground_truth_category,
      data?.groundTruthCategory,
      data?.category,
      data?.title,
      data?.product_name,
      data?.name,
      data?.description,
      data?.product_type,
      data?.product_type_name,
      data?.product_group_name,
    ]
      .filter(Boolean)
      .join(" "),
  );

  let bestCategory = null;
  let bestScore = 0;

  for (const category of SOURCES.general.categories) {
    const score = scoreCategory(category, text);

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

function getImage(row) {
  const data = row?.row ?? row;

  if (typeof data?.image_url === "string" && data.image_url) {
    return data.image_url;
  }

  if (typeof data?.image === "string" && data.image) {
    return data.image;
  }

  if (data?.image?.src) {
    return data.image.src;
  }

  if (data?.image?.url) {
    return data.image.url;
  }

  if (Array.isArray(data?.images) && data.images.length > 0) {
    const first = data.images[0];

    if (typeof first === "string") {
      return first;
    }

    if (first?.url) {
      return first.url;
    }

    if (first?.src) {
      return first.src;
    }
  }

  return null;
}

function getTitle(row) {
  const data = row?.row ?? row;

  return (
    data?.prod_name ||
    data?.product_name ||
    data?.title ||
    data?.name ||
    data?.product_type_name ||
    data?.type ||
    "ShopKartX Product"
  );
}

function getDescription(row) {
  const data = row?.row ?? row;

  return (
    data?.detail_desc ||
    data?.description ||
    data?.details ||
    data?.prompt ||
    `Premium ${getTitle(row)} available on ShopKartX.`
  );
}

function getBrand(row) {
  const data = row?.row ?? row;

  return (
    data?.brand ||
    data?.brand_name ||
    "ShopKartX"
  );
}

function getSourceId(row, index) {
  const data = row?.row ?? row;

  return String(
    data?.article_id ||
      data?.product_code ||
      data?.id ||
      data?.product_id ||
      `${Date.now()}-${index}`,
  );
}

function priceFor(category, index) {
  const ranges = {
    Mobiles: [6999, 129999],
    Laptops: [24999, 189999],
    Fashion: [299, 9999],
    Home: [799, 79999],
    Beauty: [199, 7999],
    Gaming: [799, 99999],
    Audio: [499, 49999],
    Grocery: [49, 4999],
  };

  const [min, max] = ranges[category];

  const spread = max - min;
  const value = min + ((index * 7919) % spread);

  return Math.round(value / 10) * 10;
}

function createProduct(row, category, index) {
  const image = getImage(row);

  if (!image) {
    return null;
  }

  const title = getTitle(row);
  const description = getDescription(row);
  const brand = getBrand(row);
  const sourceId = getSourceId(row, index);

  const price = priceFor(category, index);
  const discount = 5 + ((index * 7) % 46);
  const originalPrice = Math.round(
    price / (1 - discount / 100),
  );

  const rating =
    Math.round((3.6 + ((index * 13) % 14) / 10) * 10) / 10;

  return {
    id: `skx-${category.toLowerCase()}-${index + 1}`,

    sourceId,

    title: String(title).trim(),

    description: String(description).trim(),

    brand: String(brand).trim(),

    category,

    price,

    originalPrice,

    discountPercentage: discount,

    rating,

    stock: 10 + ((index * 17) % 190),

    thumbnail: image,

    images: [image],

    source: {
      provider: "Hugging Face dataset",
      dataset:
        row?.dataset ||
        row?._dataset ||
        "ecommerce-open-dataset",
    },
  };
}

async function fetchRows(dataset, split, offset, length = 100) {
  const url = new URL(HF_ROWS_API);

  url.searchParams.set("dataset", dataset);
  url.searchParams.set("config", "default");
  url.searchParams.set("split", split);
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("length", String(length));

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `HF request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

async function collectFashion(bucket, usedImages) {
  console.log("\n👗 Collecting Fashion...");

  const target = TARGET_PER_CATEGORY;
  let offset = 0;

  while (bucket.length < target) {
    const payload = await fetchRows(
      SOURCES.fashion.dataset,
      SOURCES.fashion.split,
      offset,
      100,
    );

    const rows = payload.rows || [];

    if (!rows.length) {
      break;
    }

    for (const item of rows) {
      const image = getImage(item);

      if (!image || usedImages.has(image)) {
        continue;
      }

      const product = createProduct(
        item,
        "Fashion",
        bucket.length,
      );

      if (!product) {
        continue;
      }

      usedImages.add(image);
      bucket.push(product);

      if (bucket.length >= target) {
        break;
      }
    }

    offset += rows.length;

    console.log(
      `Fashion: ${bucket.length}/${target} | scanned ${offset}`,
    );
  }
}

async function collectHome(bucket, usedImages) {
  console.log("\n🏠 Collecting Home...");

  const target = TARGET_PER_CATEGORY;
  let offset = 0;

  while (bucket.length < target) {
    const payload = await fetchRows(
      SOURCES.home.dataset,
      SOURCES.home.split,
      offset,
      100,
    );

    const rows = payload.rows || [];

    if (!rows.length) {
      break;
    }

    for (const item of rows) {
      const image = getImage(item);

      if (!image || usedImages.has(image)) {
        continue;
      }

      const product = createProduct(
        item,
        "Home",
        bucket.length,
      );

      if (!product) {
        continue;
      }

      usedImages.add(image);
      bucket.push(product);

      if (bucket.length >= target) {
        break;
      }
    }

    offset += rows.length;

    console.log(
      `Home: ${bucket.length}/${target} | scanned ${offset}`,
    );
  }
}

async function collectGeneral(buckets, usedImages) {
  console.log("\n🛒 Collecting remaining categories...");

  const targetCategories = SOURCES.general.categories;

  let offset = 0;

  while (
    targetCategories.some(
      (category) => buckets[category].length < TARGET_PER_CATEGORY,
    )
  ) {
    const payload = await fetchRows(
      SOURCES.general.dataset,
      SOURCES.general.split,
      offset,
      100,
    );

    const rows = payload.rows || [];

    if (!rows.length) {
      break;
    }

    for (const item of rows) {
      const category = detectGeneralCategory(item);

      if (!category) {
        continue;
      }

      if (buckets[category].length >= TARGET_PER_CATEGORY) {
        continue;
      }

      const image = getImage(item);

      if (!image || usedImages.has(image)) {
        continue;
      }

      const product = createProduct(
        item,
        category,
        buckets[category].length,
      );

      if (!product) {
        continue;
      }

      usedImages.add(image);
      buckets[category].push(product);
    }

    offset += rows.length;

    console.log(
      targetCategories
        .map(
          (category) =>
            `${category}: ${buckets[category].length}/${TARGET_PER_CATEGORY}`,
        )
        .join(" | "),
    );
  }
}

async function buildCatalog() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const buckets = {
    Mobiles: [],
    Laptops: [],
    Fashion: [],
    Home: [],
    Beauty: [],
    Gaming: [],
    Audio: [],
    Grocery: [],
  };

  const usedImages = new Set();

  await collectFashion(
    buckets.Fashion,
    usedImages,
  );

  await collectHome(
    buckets.Home,
    usedImages,
  );

  await collectGeneral(
    buckets,
    usedImages,
  );

  const products = Object.values(buckets).flat();

  const report = {
    generatedAt: new Date().toISOString(),
    total: products.length,
    targets: Object.fromEntries(
      Object.entries(buckets).map(
        ([category, items]) => [
          category,
          {
            target: TARGET_PER_CATEGORY,
            actual: items.length,
          },
        ],
      ),
    ),
    uniqueImages: new Set(
      products.map((product) => product.thumbnail),
    ).size,
  };

  await fs.writeFile(
    OUTPUT_FILE,
    JSON.stringify(
      {
        version: 1,
        generatedAt: report.generatedAt,
        products,
        report,
      },
      null,
      2,
    ),
  );

  console.log("\n========================================");
  console.log("       SHOPKARTX CATALOG REPORT");
  console.log("========================================");

  for (const [category, items] of Object.entries(buckets)) {
    console.log(
      `${category.padEnd(10)} ${String(items.length).padStart(4)}/${TARGET_PER_CATEGORY}`,
    );
  }

  console.log("----------------------------------------");
  console.log(`TOTAL       ${products.length}/4000`);
  console.log(`UNIQUE IMG  ${report.uniqueImages}`);
  console.log("----------------------------------------");
  console.log(`Saved: ${OUTPUT_FILE}`);

  const incomplete = Object.entries(buckets).filter(
    ([, items]) => items.length < TARGET_PER_CATEGORY,
  );

  if (incomplete.length) {
    console.log("\n⚠️ Some categories are below target.");

    for (const [category, items] of incomplete) {
      console.log(
        `${category}: ${items.length}/${TARGET_PER_CATEGORY}`,
      );
    }
  } else {
    console.log("\n✅ 4000/4000 catalog generated successfully.");
  }
}

buildCatalog().catch((error) => {
  console.error("\n❌ Catalog build failed:");
  console.error(error);
  process.exit(1);
});
