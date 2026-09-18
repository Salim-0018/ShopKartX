const { pool } = require("../config/database");

async function getInventory(filters = {}) {
  const {
    search = "",
    stockStatus = "",
    limit = 100,
    offset = 0,
  } = filters;

  const conditions = ["p.is_active = 1"];
  const params = [];

  if (search) {
    conditions.push(`
      (
        p.name LIKE ?
        OR p.brand LIKE ?
        OR p.slug LIKE ?
      )
    `);

    const searchValue = `%${search}%`;

    params.push(
      searchValue,
      searchValue,
      searchValue
    );
  }

  if (stockStatus === "LOW_STOCK") {
    conditions.push("p.stock > 0 AND p.stock <= 10");
  }

  if (stockStatus === "OUT_OF_STOCK") {
    conditions.push("p.stock = 0");
  }

  if (stockStatus === "IN_STOCK") {
    conditions.push("p.stock > 10");
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const safeLimit = Math.min(
    Math.max(Number(limit) || 100, 1),
    500
  );

  const safeOffset = Math.max(
    Number(offset) || 0,
    0
  );

  const [products] = await pool.query(
    `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.brand,
        p.image_url,
        p.price,
        p.stock,
        p.is_active,

        CASE
          WHEN p.stock = 0 THEN 'OUT_OF_STOCK'
          WHEN p.stock <= 10 THEN 'LOW_STOCK'
          ELSE 'IN_STOCK'
        END AS stock_status,

        (
          SELECT MAX(im.created_at)
          FROM inventory_movements im
          WHERE im.product_id = p.id
        ) AS last_movement_at

      FROM products p
      ${whereClause}

      ORDER BY
        CASE
          WHEN p.stock = 0 THEN 1
          WHEN p.stock <= 10 THEN 2
          ELSE 3
        END,
        p.name ASC

      LIMIT ${safeLimit}
      OFFSET ${safeOffset}
    `,
    params
  );

  return products;
}

async function getInventoryStats() {
  const [rows] = await pool.query(`
    SELECT
      COUNT(*) AS total_products,

      COALESCE(
        SUM(
          CASE
            WHEN stock > 10 THEN 1
            ELSE 0
          END
        ),
        0
      ) AS in_stock_products,

      COALESCE(
        SUM(
          CASE
            WHEN stock > 0 AND stock <= 10 THEN 1
            ELSE 0
          END
        ),
        0
      ) AS low_stock_products,

      COALESCE(
        SUM(
          CASE
            WHEN stock = 0 THEN 1
            ELSE 0
          END
        ),
        0
      ) AS out_of_stock_products,

      COALESCE(
        SUM(stock),
        0
      ) AS total_units

    FROM products
    WHERE is_active = 1
  `);

  return rows[0];
}

async function getInventoryProduct(productId) {
  const [rows] = await pool.query(
    `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.brand,
        p.image_url,
        p.price,
        p.stock,
        p.is_active,

        CASE
          WHEN p.stock = 0 THEN 'OUT_OF_STOCK'
          WHEN p.stock <= 10 THEN 'LOW_STOCK'
          ELSE 'IN_STOCK'
        END AS stock_status

      FROM products p
      WHERE p.id = ?
      LIMIT 1
    `,
    [productId]
  );

  return rows[0] || null;
}

async function getInventoryMovements(productId = null) {
  let query = `
    SELECT
      im.id,
      im.product_id,
      p.name AS product_name,
      p.image_url,

      im.movement_type,
      im.quantity,
      im.previous_stock,
      im.new_stock,

      im.reference_type,
      im.reference_id,
      im.reason,
      im.notes,
      im.created_at

    FROM inventory_movements im

    INNER JOIN products p
      ON p.id = im.product_id
  `;

  const params = [];

  if (productId) {
    query += `
      WHERE im.product_id = ?
    `;

    params.push(productId);
  }

  query += `
    ORDER BY im.created_at DESC
    LIMIT 500
  `;

  const [rows] = await pool.query(query, params);

  return rows;
}

async function updateStock(
  productId,
  quantity,
  movementType,
  reason = null,
  notes = null,
  referenceType = null,
  referenceId = null
) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [products] = await connection.query(
      `
        SELECT
          id,
          name,
          stock
        FROM products
        WHERE id = ?
        FOR UPDATE
      `,
      [productId]
    );

    if (!products.length) {
      throw new Error("Product not found");
    }

    const product = products[0];

    const currentStock = Number(product.stock);
    const requestedQuantity = Number(quantity);

    if (
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity <= 0
    ) {
      throw new Error(
        "Quantity must be a positive integer"
      );
    }

    let newStock;

    if (
      movementType === "IN" ||
      movementType === "RETURN" ||
      movementType === "RELEASED"
    ) {
      newStock =
        currentStock + requestedQuantity;
    } else if (
      movementType === "OUT" ||
      movementType === "DAMAGE" ||
      movementType === "RESERVED"
    ) {
      newStock =
        currentStock - requestedQuantity;

      if (newStock < 0) {
        throw new Error(
          `Insufficient stock. Available stock: ${currentStock}`
        );
      }
    } else {
      throw new Error(
        "Invalid inventory movement type"
      );
    }

    await connection.query(
      `
        UPDATE products
        SET
          stock = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [
        newStock,
        productId,
      ]
    );

    await connection.query(
      `
        INSERT INTO inventory_movements (
          product_id,
          movement_type,
          quantity,
          previous_stock,
          new_stock,
          reference_type,
          reference_id,
          reason,
          notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        productId,
        movementType,
        requestedQuantity,
        currentStock,
        newStock,
        referenceType,
        referenceId,
        reason,
        notes,
      ]
    );

    await connection.commit();

    return {
      product_id: productId,
      product_name: product.name,
      previous_stock: currentStock,
      quantity: requestedQuantity,
      movement_type: movementType,
      new_stock: newStock,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getInventory,
  getInventoryStats,
  getInventoryProduct,
  getInventoryMovements,
  updateStock,
};
