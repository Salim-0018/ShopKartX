import { getCatalog } from "./catalog-loader.js";
import { CATALOG_CATEGORIES } from "./catalog-config.js";

export async function runCatalogDiagnostic() {
  console.log("");
  console.log("========================================");
  console.log("        SHOPKARTX CATALOG REPORT");
  console.log("========================================");

  const catalog = await getCatalog();

  console.log(`Total products: ${catalog.length}`);

  const totalImages = catalog.filter(
    (product) => product.thumbnail,
  ).length;

  const uniqueImages = new Set(
    catalog
      .map((product) => product.thumbnail)
      .filter(Boolean),
  );

  console.log(`Products with images: ${totalImages}`);
  console.log(`Unique primary images: ${uniqueImages.size}`);

  console.log("");
  console.log("CATEGORY BREAKDOWN");
  console.log("----------------------------------------");

  for (const category of CATALOG_CATEGORIES) {
    const products = catalog.filter(
      (product) =>
        product.category === category.name,
    );

    const images = new Set(
      products
        .map((product) => product.thumbnail)
        .filter(Boolean),
    );

    console.log(
      `${category.name.padEnd(10)} | ` +
        `Products: ${String(products.length).padStart(4)} | ` +
        `Images: ${String(images.size).padStart(4)} | ` +
        `Target: ${category.target}`,
    );
  }

  console.log("");
  console.log("SAMPLE PRODUCTS");
  console.log("----------------------------------------");

  for (const category of CATALOG_CATEGORIES) {
    const products = catalog.filter(
      (product) =>
        product.category === category.name,
    );

    console.log(`\n[${category.name}]`);

    products.slice(0, 3).forEach((product) => {
      console.log({
        id: product.id,
        title: product.title,
        brand: product.brand,
        price: product.price,
        image: product.thumbnail,
        imageSource: product.imageSource,
      });
    });
  }

  console.log("");
  console.log("========================================");
  console.log("             REPORT COMPLETE");
  console.log("========================================");

  return {
    totalProducts: catalog.length,
    productsWithImages: totalImages,
    uniqueImages: uniqueImages.size,
  };
}

export default runCatalogDiagnostic;
