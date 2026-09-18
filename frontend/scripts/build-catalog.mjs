import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const parquetModule = require("parquetjs-lite");
const parquet = parquetModule.default ?? parquetModule;

const ROOT_DIR = process.cwd();
const SOURCE_DIR = path.join(ROOT_DIR, "catalog-sources");
const OUTPUT_DIR = path.join(ROOT_DIR, "src", "data", "catalog");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "catalog.json");

const MAX_PER_CATEGORY = 500;

const CATEGORIES = [
  {
    id: "mobiles",
    name: "Mobiles",
    keywords: ["smartphone", "mobile", "iphone", "android", "phone", "5g"],
  },
  {
    id: "laptops",
    name: "Laptops",
    keywords: ["laptop", "notebook", "macbook", "chromebook", "ultrabook"],
  },
  {
    id: "fashion",
    name: "Fashion",
    keywords: [
      "fashion",
      "shirt",
      "t-shirt",
      "tshirt",
      "jeans",
      "dress",
      "jacket",
      "coat",
      "hoodie",
      "sweater",
      "trousers",
      "pants",
      "skirt",
      "shorts",
      "blouse",
      "top",
      "shoes",
      "sneakers",
      "boots",
      "sandals",
      "garment",
      "clothing",
    ],
  },
  {
    id: "home",
    name: "Home",
    keywords: [
      "sofa",
      "chair",
      "table",
      "bed",
      "desk",
      "lamp",
      "furniture",
      "home decor",
    ],
  },
  {
    id: "beauty",
    name: "Beauty",
    keywords: [
      "beauty",
      "skincare",
      "cream",
      "moisturizer",
      "shampoo",
      "makeup",
      "cosmetic",
      "perfume",
      "fragrance",
      "serum",
    ],
  },
  {
    id: "gaming",
    name: "Gaming",
    keywords: [
      "gaming",
      "game",
      "playstation",
      "xbox",
      "nintendo",
      "controller",
      "gamepad",
    ],
  },
  {
    id: "audio",
    name: "Audio",
    keywords: [
      "headphone",
      "headphones",
      "earbuds",
      "earbud",
      "earphones",
      "speaker",
      "soundbar",
      "audio",
    ],
  },
  {
    id: "grocery",
    name: "Grocery",
    keywords: [
      "rice",
      "tea",
      "coffee",
      "biscuit",
      "pasta",
      "spice",
      "snack",
      "cereal",
      "flour",
      "sugar",
      "salt",
      "grocery",
      "food",
    ],
  },
];

const CATEGORY_MAP = new Map(
  CATEGORIES.map((category) => [category.id, category]),
);

function clean(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function firstValue(row, fields) {
  for (const field of fields) {
    const value = row?.[field];

    if (value !== undefined && value !== null && clean(value)) {
      return value;
    }
  }

  return "";
}

function normalizeText(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTitle(row) {
  return clean(
    firstValue(row, [
      "prod_name",
      "product_name",
      "productName",
      "title",
      "name",
    ]),
  );
}

function getDescription(row) {
  return clean(
    firstValue(row, [
      "detail_desc",
      "description",
      "product_description",
      "desc",
    ]),
  );
}

function getImage(row) {
  let value = clean(
    firstValue(row, [
      "image_url",
      "imageUrl",
      "image",
      "img_url",
      "imgUrl",
      "thumbnail",
      "thumbnail_url",
    ]),
  );

  if (value.startsWith("//")) {
    value = `https:${value}`;
  }

  if (!/^https?:\/\//i.test(value)) {
    return "";
  }

  return value;
}

function getSourceId(row) {
  return clean(
    firstValue(row, [
      "article_id",
      "articleId",
      "product_id",
      "productId",
      "product_code",
      "productCode",
      "sku",
      "id",
    ]),
  );
}

function getBrand(row) {
  return clean(
    firstValue(row, [
      "brand",
      "brand_name",
      "brandName",
    ]),
  );
}

function getProductType(row) {
  return clean(
    firstValue(row, [
      "product_type_name",
      "product_type",
      "subcategory",
      "sub_category",
    ]),
  );
}

function getColor(row) {
  return clean(
    firstValue(row, [
      "colour_group_name",
      "color",
      "colour",
      "color_name",
      "colour_name",
    ]),
  );
}

function getCategoryText(row) {
  return [
    "prod_name",
    "product_name",
    "product_type_name",
    "product_type",
    "product_group_name",
    "product_group",
    "department_name",
    "department",
    "section_name",
    "section",
    "garment_group_name",
    "garment_group",
    "index_name",
    "index_group_name",
    "colour_group_name",
    "color",
    "colour",
    "detail_desc",
    "description",
    "category",
    "subcategory",
  ]
    .map((field) => clean(row?.[field]))
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function classify(row, sourceFile) {
  const lowerFileName = sourceFile.toLowerCase();

  /*
   * The downloaded Qdrant H&M dataset is a fashion catalogue.
   * This prevents its fashion products from being incorrectly
   * classified into electronics, grocery, gaming, etc.
   */
  if (lowerFileName.includes("hm_ecommerce_products")) {
    return CATEGORY_MAP.get("fashion");
  }

  const text = normalizeText(getCategoryText(row));

  if (!text) {
    return null;
  }

  let bestCategory = null;
  let bestScore = 0;

  for (const category of CATEGORIES) {
    let score = 0;

    for (const keyword of category.keywords) {
      if (text.includes(normalizeText(keyword))) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

function getPrice(row) {
  const raw = firstValue(row, [
    "price",
    "current_price",
    "currentPrice",
    "sale_price",
    "salePrice",
  ]);

  if (!raw) {
    return 0;
  }

  const number = Number(
    clean(raw).replace(/[^0-9.-]/g, ""),
  );

  if (!Number.isFinite(number) || number <= 0) {
    return 0;
  }

  /*
   * H&M dataset price fields can be normalized/source-specific.
   * We only preserve a numeric source value.
   * No exchange-rate conversion or fake INR pricing is performed.
   */
  return Math.round(number * 100) / 100;
}

function normalizeProduct(row, index, sourceFile) {
  const category = classify(row, sourceFile);

  if (!category) {
    return null;
  }

  const title = getTitle(row);
  const image = getImage(row);

  if (!title || !image) {
    return null;
  }

  const sourceId = getSourceId(row);

  const safeId =
    sourceId ||
    `${category.id}-${index}-${normalizeText(title)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`;

  const description = getDescription(row);
  const brand = getBrand(row);
  const productType = getProductType(row);
  const color = getColor(row);
  const price = getPrice(row);

  return {
    id: `catalog-${safeId}`,
    source: "Qdrant H&M Ecommerce Products",
    sourceId: sourceId || null,

    title,

    description:
      description ||
      `${title}${productType ? ` - ${productType}` : ""}`,

    category: category.name,
    categoryId: category.id,

    brand: brand || "H&M",
    productType: productType || null,
    color: color || null,

    image,
    imageUrl: image,

    price,
    originalPrice: price > 0
      ? Math.round(price * 1.18 * 100) / 100
      : 0,

    currency: "INR",

    rating: 0,
    reviews: 0,
    inStock: true,
  };
}

async function listSourceFiles() {
  const entries = await fs.readdir(SOURCE_DIR, {
    withFileTypes: true,
  });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => {
      const lower = name.toLowerCase();

      return (
        lower.endsWith(".parquet") ||
        lower.endsWith(".json") ||
        lower.endsWith(".jsonl") ||
        lower.endsWith(".csv")
      );
    })
    .sort();
}

async function readJson(filePath) {
  const content = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(content);

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (Array.isArray(parsed.products)) {
    return parsed.products;
  }

  if (Array.isArray(parsed.data)) {
    return parsed.data;
  }

  if (Array.isArray(parsed.items)) {
    return parsed.items;
  }

  return [];
}

async function readJsonl(filePath) {
  const content = await fs.readFile(filePath, "utf8");
  const rows = [];

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    try {
      rows.push(JSON.parse(trimmed));
    } catch {
      // Ignore malformed rows.
    }
  }

  return rows;
}

async function readCsv(filePath) {
  const content = await fs.readFile(filePath, "utf8");
  const lines = content.split(/\r?\n/).filter(Boolean);

  if (!lines.length) {
    return [];
  }

  const headers = lines[0]
    .split(",")
    .map((header) => header.trim().replace(/^"|"$/g, ""));

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return row;
  });
}

async function readParquet(filePath) {
  console.log(
    `[ShopKartX] Opening Parquet: ${path.basename(filePath)}`,
  );

  const reader = await parquet.ParquetReader.openFile(filePath);
  const cursor = reader.getCursor();

  const rows = [];

  try {
    while (true) {
      const row = await cursor.next();

      if (!row) {
        break;
      }

      rows.push(row);

      if (rows.length % 10000 === 0) {
        console.log(
          `[ShopKartX] Read ${rows.length.toLocaleString()} Parquet rows...`,
        );
      }
    }
  } finally {
    await reader.close();
  }

  return rows;
}

async function readFile(filePath) {
  const lower = filePath.toLowerCase();

  if (lower.endsWith(".parquet")) {
    return readParquet(filePath);
  }

  if (lower.endsWith(".jsonl")) {
    return readJsonl(filePath);
  }

  if (lower.endsWith(".json")) {
    return readJson(filePath);
  }

  if (lower.endsWith(".csv")) {
    return readCsv(filePath);
  }

  return [];
}

function deduplicate(products) {
  const ids = new Set();
  const images = new Set();
  const titles = new Set();

  const result = [];

  for (const product of products) {
    const titleKey = normalizeText(product.title);

    if (ids.has(product.id)) {
      continue;
    }

    if (images.has(product.imageUrl)) {
      continue;
    }

    if (titles.has(titleKey)) {
      continue;
    }

    ids.add(product.id);
    images.add(product.imageUrl);
    titles.add(titleKey);

    result.push(product);
  }

  return result;
}

function groupProducts(products) {
  const grouped = new Map();

  for (const category of CATEGORIES) {
    grouped.set(category.id, []);
  }

  for (const product of products) {
    const bucket = grouped.get(product.categoryId);

    if (!bucket) {
      continue;
    }

    if (bucket.length < MAX_PER_CATEGORY) {
      bucket.push(product);
    }
  }

  return grouped;
}

async function main() {
  console.log("[ShopKartX] Starting real local catalog build...");
  console.log(`[ShopKartX] Source directory: ${SOURCE_DIR}`);

  const sourceFiles = await listSourceFiles();

  console.log(
    `[ShopKartX] Found ${sourceFiles.length} source file(s).`,
  );

  if (!sourceFiles.length) {
    console.error(
      "[ShopKartX] ERROR: No source files found.",
    );
    process.exitCode = 1;
    return;
  }

  const products = [];

  for (const sourceFile of sourceFiles) {
    const filePath = path.join(SOURCE_DIR, sourceFile);

    console.log(`[ShopKartX] Reading ${sourceFile}...`);

    try {
      const rows = await readFile(filePath);

      console.log(
        `[ShopKartX] ${sourceFile}: ${rows.length.toLocaleString()} rows`,
      );

      if (rows.length > 0) {
        console.log(
          `[ShopKartX] Sample fields: ${Object.keys(rows[0])
            .slice(0, 25)
            .join(", ")}`,
        );
      }

      for (let index = 0; index < rows.length; index += 1) {
        const product = normalizeProduct(
          rows[index],
          index,
          sourceFile,
        );

        if (product) {
          products.push(product);
        }
      }
    } catch (error) {
      console.error(
        `[ShopKartX] ERROR reading ${sourceFile}:`,
        error?.stack || error?.message || error,
      );
    }
  }

  console.log(
    `[ShopKartX] Valid normalized products: ${products.length.toLocaleString()}`,
  );

  const uniqueProducts = deduplicate(products);

  console.log(
    `[ShopKartX] After duplicate removal: ${uniqueProducts.length.toLocaleString()}`,
  );

  const grouped = groupProducts(uniqueProducts);

  console.log("");
  console.log("========== ShopKartX Catalog ==========");

  let total = 0;

  for (const category of CATEGORIES) {
    const count = grouped.get(category.id)?.length ?? 0;

    total += count;

    console.log(
      `${category.name.padEnd(10)}: ${String(count).padStart(4)} / ${MAX_PER_CATEGORY}`,
    );
  }

  console.log("---------------------------------------");
  console.log(`Total       : ${total}`);
  console.log("=======================================");
  console.log("");

  if (total === 0) {
    console.error(
      "[ShopKartX] ERROR: No valid products could be selected.",
    );

    process.exitCode = 1;
    return;
  }

  const finalProducts = [];

  for (const category of CATEGORIES) {
    finalProducts.push(
      ...(grouped.get(category.id) || []),
    );
  }

  await fs.mkdir(OUTPUT_DIR, {
    recursive: true,
  });

  const catalog = {
    version: 1,
    generatedAt: new Date().toISOString(),
    source: "Qdrant H&M Ecommerce Products",
    totalProducts: finalProducts.length,

    categories: CATEGORIES.map((category) => ({
      id: category.id,
      name: category.name,
      count: grouped.get(category.id)?.length ?? 0,
    })),

    products: finalProducts,
  };

  await fs.writeFile(
    OUTPUT_FILE,
    JSON.stringify(catalog, null, 2),
    "utf8",
  );

  console.log(
    `[ShopKartX] Catalog written successfully: ${OUTPUT_FILE}`,
  );

  console.log(
    `[ShopKartX] Final products: ${finalProducts.length.toLocaleString()}`,
  );

  console.log("");
  console.log("[ShopKartX] Catalog build complete.");
}

main().catch((error) => {
  console.error(
    "[ShopKartX] FATAL ERROR:",
    error?.stack || error?.message || error,
  );

  process.exitCode = 1;
});
