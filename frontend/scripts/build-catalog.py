from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

import pyarrow.parquet as pq


ROOT = Path(__file__).resolve().parents[1]

SOURCE_FILE = ROOT / "catalog-sources" / "hm_ecommerce_products_enriched.parquet"
OUTPUT_FILE = ROOT / "src" / "data" / "catalog" / "catalog.json"

MAX_PRODUCTS = 500


def clean_text(value: Any) -> str:
    if value is None:
        return ""

    text = str(value).strip()

    if text.lower() in {"none", "null", "nan"}:
        return ""

    return re.sub(r"\s+", " ", text)


def clean_url(value: Any) -> str:
    url = clean_text(value)

    if not url:
        return ""

    if url.startswith("//"):
        url = "https:" + url

    if not re.match(r"^https?://", url, re.IGNORECASE):
        return ""

    return url


def make_slug(value: str) -> str:
    value = clean_text(value).lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def make_price(product_index: int) -> float:
    """
    H&M source does not provide a reliable INR retail price in this file.

    We deliberately do NOT invent a price.

    A deterministic placeholder price is not acceptable for a real catalog,
    so the frontend can treat this as price unavailable until a licensed
    source with actual pricing is connected.
    """
    return 0.0


def normalize_product(row: dict[str, Any], index: int) -> dict[str, Any] | None:
    article_id = clean_text(row.get("article_id"))
    product_code = clean_text(row.get("product_code"))
    title = clean_text(row.get("prod_name"))
    description = clean_text(row.get("detail_desc"))
    image_url = clean_url(row.get("image_url"))

    if not article_id:
        article_id = product_code

    if not article_id or not title or not image_url:
        return None

    product_type = clean_text(row.get("product_type_name"))
    product_group = clean_text(row.get("product_group_name"))
    department = clean_text(row.get("department_name"))
    section = clean_text(row.get("section_name"))
    colour = clean_text(row.get("colour_group_name"))

    searchable = " ".join(
        [
            title,
            description,
            product_type,
            product_group,
            department,
            section,
            colour,
        ]
    ).strip()

    return {
        "id": f"hm-{article_id}",
        "sourceId": article_id,
        "source": "H&M / Qdrant hm_ecommerce_products",
        "license": "CC BY 4.0",
        "title": title,
        "name": title,
        "description": description,
        "brand": "H&M",
        "category": "Fashion",
        "categorySlug": "fashion",
        "subcategory": product_type or product_group or "Fashion",
        "department": department,
        "section": section,
        "colour": colour,
        "price": make_price(index),
        "currency": "INR",
        "priceAvailable": False,
        "rating": 0,
        "ratingCount": 0,
        "stock": 0,
        "stockAvailable": False,
        "image": image_url,
        "images": [image_url],
        "searchText": searchable,
        "metadata": {
            "articleId": article_id,
            "productCode": product_code,
            "productType": product_type,
            "productGroup": product_group,
            "department": department,
            "section": section,
            "colour": colour,
        },
    }


def main() -> None:
    print()
    print("=" * 70)
    print("ShopKartX — Real Catalog Builder")
    print("=" * 70)
    print()

    if not SOURCE_FILE.exists():
        print(f"[ERROR] Source file not found:")
        print(SOURCE_FILE)
        raise SystemExit(1)

    print(f"[ShopKartX] Source:")
    print(f"  {SOURCE_FILE}")
    print()

    print("[ShopKartX] Opening Parquet with PyArrow...")
    parquet_file = pq.ParquetFile(SOURCE_FILE)

    print(f"[ShopKartX] Rows available: {parquet_file.metadata.num_rows:,}")
    print()

    required_columns = [
        "article_id",
        "product_code",
        "prod_name",
        "product_type_name",
        "product_group_name",
        "department_name",
        "section_name",
        "colour_group_name",
        "detail_desc",
        "image_url",
    ]

    print("[ShopKartX] Reading required columns...")

    table = parquet_file.read(columns=required_columns)

    print(f"[ShopKartX] Rows loaded: {table.num_rows:,}")
    print()

    rows = table.to_pylist()

    products: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    seen_images: set[str] = set()

    skipped = 0
    duplicate_count = 0

    print("[ShopKartX] Normalizing products...")

    for index, row in enumerate(rows, start=1):
        product = normalize_product(row, index)

        if product is None:
            skipped += 1
            continue

        source_id = product["sourceId"]
        image_url = product["image"]

        if source_id in seen_ids:
            duplicate_count += 1
            continue

        if image_url in seen_images:
            duplicate_count += 1
            continue

        seen_ids.add(source_id)
        seen_images.add(image_url)

        products.append(product)

    print(f"[ShopKartX] Valid products: {len(products):,}")
    print(f"[ShopKartX] Skipped invalid products: {skipped:,}")
    print(f"[ShopKartX] Removed duplicates: {duplicate_count:,}")
    print()

    if not products:
        print("[ERROR] No valid products found.")
        raise SystemExit(1)

    products = products[:MAX_PRODUCTS]

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    catalog = {
        "version": 1,
        "generatedAt": "local-build",
        "source": {
            "name": "Qdrant H&M E-Commerce Products",
            "file": SOURCE_FILE.name,
            "license": "CC BY 4.0",
            "productCountInSource": parquet_file.metadata.num_rows,
        },
        "categories": [
            {
                "id": "fashion",
                "name": "Fashion",
                "slug": "fashion",
                "productCount": len(products),
            }
        ],
        "products": products,
        "stats": {
            "totalProducts": len(products),
            "fashionProducts": len(products),
            "realImages": len(products),
            "priceAvailable": 0,
        },
    }

    print(f"[ShopKartX] Writing catalog:")
    print(f"  {OUTPUT_FILE}")

    with OUTPUT_FILE.open("w", encoding="utf-8") as file:
        json.dump(
            catalog,
            file,
            ensure_ascii=False,
            indent=2,
        )

    file_size_mb = OUTPUT_FILE.stat().st_size / (1024 * 1024)

    print()
    print("=" * 70)
    print("CATALOG BUILD COMPLETE")
    print("=" * 70)
    print()
    print(f"Fashion products : {len(products):,}")
    print(f"Real image URLs  : {len(products):,}")
    print(f"Price available  : 0")
    print(f"Output size      : {file_size_mb:.2f} MB")
    print()
    print(f"Output:")
    print(f"  {OUTPUT_FILE}")
    print()
    print("IMPORTANT:")
    print("- Product data comes from the local H&M dataset.")
    print("- Product images use the dataset's image_url values.")
    print("- No random/Picsum/LoremFlickr images were generated.")
    print("- No fake INR prices were generated.")
    print()

if __name__ == "__main__":
    main()
