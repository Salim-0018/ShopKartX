const { pool } = require("../config/database");

async function getProducts(filters = {}) {
  const {
    search = "",
    category = "",
    minPrice,
    maxPrice,
    sort = "newest",
    page = 1,
    limit = 20,
  } = filters;

  const conditions = ["p.is_active = TRUE"];
  const params = [];

  if (search) {
    conditions.push("(p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)");
    const searchValue = `%${search}%`;
    params.push(searchValue, searchValue, searchValue);
  }

  if (category) {
    conditions.push("c.slug = ?");
    params.push(category);
  }

  if (minPrice !== undefined && minPrice !== "") {
    conditions.push("p.price >= ?");
    params.push(Number(minPrice));
  }

  if (maxPrice !== undefined && maxPrice !== "") {
    conditions.push("p.price <= ?");
    params.push(Number(maxPrice));
  }

  const sortMap = {
    newest: "p.created_at DESC",
    oldest: "p.created_at ASC",
    price_low: "p.price ASC",
    price_high: "p.price DESC",
    rating: "p.rating DESC",
    name: "p.name ASC",
  };

  const orderBy = sortMap[sort] || sortMap.newest;

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const offset = (safePage - 1) * safeLimit;

  const whereClause = conditions.join(" AND ");

  const [countRows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM products p
    INNER JOIN categories c ON c.id = p.category_id
    WHERE ${whereClause}
    `,
    params
  );

  const [products] = await pool.query(
    `
    SELECT
      p.id,
      p.name,
      p.slug,
      p.description,
      p.price,
      p.original_price,
      p.stock,
      p.brand,
      p.image_url,
      p.rating,
      p.review_count,
      c.id AS category_id,
      c.name AS category_name,
      c.slug AS category_slug,
      p.created_at,
      p.updated_at
    FROM products p
    INNER JOIN categories c ON c.id = p.category_id
    WHERE ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
    `,
    [...params, safeLimit, offset]
  );

  const total = Number(countRows[0].total);

  return {
    products,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
}

async function getProductById(id) {
  const [rows] = await pool.query(
    `
    SELECT
      p.id,
      p.name,
      p.slug,
      p.description,
      p.price,
      p.original_price,
      p.stock,
      p.brand,
      p.image_url,
      p.rating,
      p.review_count,
      c.id AS category_id,
      c.name AS category_name,
      c.slug AS category_slug,
      p.created_at,
      p.updated_at
    FROM products p
    INNER JOIN categories c ON c.id = p.category_id
    WHERE p.id = ? AND p.is_active = TRUE
    `,
    [id]
  );

  return rows[0] || null;
}

async function createProduct(product) {
  const {
    category_id,
    name,
    slug,
    description,
    price,
    original_price,
    stock,
    brand,
    image_url,
    rating = 0,
    review_count = 0,
  } = product;

  const [result] = await pool.query(
    `
    INSERT INTO products
    (
      category_id,
      name,
      slug,
      description,
      price,
      original_price,
      stock,
      brand,
      image_url,
      rating,
      review_count
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      category_id,
      name,
      slug,
      description || null,
      price,
      original_price || null,
      stock || 0,
      brand || null,
      image_url || null,
      rating,
      review_count,
    ]
  );

  return getProductById(result.insertId);
}

async function updateProduct(id, product) {
  const allowedFields = [
    "category_id",
    "name",
    "slug",
    "description",
    "price",
    "original_price",
    "stock",
    "brand",
    "image_url",
    "rating",
    "review_count",
  ];

  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (product[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(product[field]);
    }
  }

  if (updates.length === 0) {
    return getProductById(id);
  }

  values.push(id);

  await pool.query(
    `
    UPDATE products
    SET ${updates.join(", ")}
    WHERE id = ? AND is_active = TRUE
    `,
    values
  );

  return getProductById(id);
}

async function deleteProduct(id) {
  const [result] = await pool.query(
    `
    UPDATE products
    SET is_active = FALSE
    WHERE id = ? AND is_active = TRUE
    `,
    [id]
  );

  return result.affectedRows > 0;
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
