const { pool } = require("../config/database");

async function getOrders(filters = {}) {
  const {
    status,
    payment_status: paymentStatus,
    search,
    limit = 100,
    offset = 0,
  } = filters;

  const conditions = [];
  const params = [];

  if (status) {
    conditions.push("o.order_status = ?");
    params.push(status);
  }

  if (paymentStatus) {
    conditions.push("o.payment_status = ?");
    params.push(paymentStatus);
  }

  if (search) {
    conditions.push(`
      (
        o.order_number LIKE ?
        OR o.customer_name LIKE ?
        OR o.customer_email LIKE ?
      )
    `);

    const searchValue = `%${search}%`;

    params.push(searchValue, searchValue, searchValue);
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const safeLimit = Math.min(
    Math.max(Number(limit) || 100, 1),
    500
  );

  const safeOffset = Math.max(
    Number(offset) || 0,
    0
  );

  const [orders] = await pool.query(
    `
      SELECT
        o.*,
        COUNT(oi.id) AS item_count,
        COALESCE(SUM(oi.quantity), 0) AS total_items
      FROM orders o
      LEFT JOIN order_items oi
        ON oi.order_id = o.id
      ${whereClause}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `,
    params
  );

  return orders;
}

async function getOrderById(id) {
  const [orders] = await pool.query(
    `
      SELECT *
      FROM orders
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  if (!orders.length) {
    return null;
  }

  const order = orders[0];

  const [items] = await pool.query(
    `
      SELECT
        oi.*,
        p.stock,
        p.rating,
        p.review_count
      FROM order_items oi
      LEFT JOIN products p
        ON p.id = oi.product_id
      WHERE oi.order_id = ?
      ORDER BY oi.id ASC
    `,
    [id]
  );

  return {
    ...order,
    items,
  };
}

async function getOrderStats() {
  const [rows] = await pool.query(`
    SELECT
      COUNT(*) AS total_orders,

      COALESCE(
        SUM(
          CASE
            WHEN order_status = 'PENDING'
            THEN 1
            ELSE 0
          END
        ),
        0
      ) AS pending_orders,

      COALESCE(
        SUM(
          CASE
            WHEN order_status = 'PROCESSING'
            THEN 1
            ELSE 0
          END
        ),
        0
      ) AS processing_orders,

      COALESCE(
        SUM(
          CASE
            WHEN order_status = 'SHIPPED'
            THEN 1
            ELSE 0
          END
        ),
        0
      ) AS shipped_orders,

      COALESCE(
        SUM(
          CASE
            WHEN order_status = 'DELIVERED'
            THEN 1
            ELSE 0
          END
        ),
        0
      ) AS delivered_orders,

      COALESCE(
        SUM(
          CASE
            WHEN order_status = 'CANCELLED'
            THEN 1
            ELSE 0
          END
        ),
        0
      ) AS cancelled_orders,

      COALESCE(
        SUM(
          CASE
            WHEN payment_status = 'PAID'
            THEN total_amount
            ELSE 0
          END
        ),
        0
      ) AS paid_revenue,

      COALESCE(
        SUM(
          CASE
            WHEN payment_status = 'REFUNDED'
            THEN total_amount
            ELSE 0
          END
        ),
        0
      ) AS refunded_amount

    FROM orders
  `);

  return rows[0];
}

async function createOrder(orderData) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      order_number,
      customer_name,
      customer_email,
      customer_phone,
      subtotal,
      shipping_fee = 0,
      discount = 0,
      total_amount,
      payment_method = "COD",
      payment_status = "PENDING",
      order_status = "PENDING",
      shipping_address,
      city,
      state,
      postal_code,
      country = "India",
      tracking_number,
      courier_name,
      notes,
      items = [],
    } = orderData;

    const [orderResult] = await connection.query(
      `
        INSERT INTO orders (
          order_number,
          customer_name,
          customer_email,
          customer_phone,
          subtotal,
          shipping_fee,
          discount,
          total_amount,
          payment_method,
          payment_status,
          order_status,
          shipping_address,
          city,
          state,
          postal_code,
          country,
          tracking_number,
          courier_name,
          notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        order_number,
        customer_name,
        customer_email,
        customer_phone || null,
        subtotal || 0,
        shipping_fee || 0,
        discount || 0,
        total_amount || 0,
        payment_method,
        payment_status,
        order_status,
        shipping_address,
        city || null,
        state || null,
        postal_code || null,
        country,
        tracking_number || null,
        courier_name || null,
        notes || null,
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      await connection.query(
        `
          INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            product_image,
            quantity,
            unit_price,
            total_price
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          orderId,
          item.product_id || null,
          item.product_name,
          item.product_image || null,
          item.quantity || 1,
          item.unit_price || 0,
          item.total_price || 0,
        ]
      );
    }

    await connection.commit();

    return getOrderById(orderId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateOrderStatus(id, orderStatus) {
  const [result] = await pool.query(
    `
      UPDATE orders
      SET order_status = ?
      WHERE id = ?
    `,
    [orderStatus, id]
  );

  if (!result.affectedRows) {
    return null;
  }

  return getOrderById(id);
}

async function updatePaymentStatus(id, paymentStatus) {
  const [result] = await pool.query(
    `
      UPDATE orders
      SET payment_status = ?
      WHERE id = ?
    `,
    [paymentStatus, id]
  );

  if (!result.affectedRows) {
    return null;
  }

  return getOrderById(id);
}

module.exports = {
  getOrders,
  getOrderById,
  getOrderStats,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
};
