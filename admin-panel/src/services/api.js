const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001/api/v1";

async function request(endpoint, options = {}) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    }
  );

  const contentType =
    response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data?.message
        ? data.message
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
}

export const api = {
  // =========================================================
  // PRODUCTS
  // =========================================================

  getProducts() {
    return request("/products");
  },

  getProduct(id) {
    return request(`/products/${id}`);
  },

  createProduct(product) {
    return request("/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
  },

  updateProduct(id, product) {
    return request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    });
  },

  deleteProduct(id) {
    return request(`/products/${id}`, {
      method: "DELETE",
    });
  },

  // =========================================================
  // ORDERS
  // =========================================================

  getOrders(params = {}) {
    const searchParams = new URLSearchParams();

    if (params.status) {
      searchParams.set(
        "status",
        params.status
      );
    }

    if (params.payment_status) {
      searchParams.set(
        "payment_status",
        params.payment_status
      );
    }

    if (params.search) {
      searchParams.set(
        "search",
        params.search
      );
    }

    if (params.limit !== undefined) {
      searchParams.set(
        "limit",
        params.limit
      );
    }

    if (params.offset !== undefined) {
      searchParams.set(
        "offset",
        params.offset
      );
    }

    const queryString =
      searchParams.toString();

    return request(
      `/orders${
        queryString
          ? `?${queryString}`
          : ""
      }`
    );
  },

  getOrder(id) {
    return request(`/orders/${id}`);
  },

  getOrderStats() {
    return request("/orders/stats");
  },

  createOrder(order) {
    return request("/orders", {
      method: "POST",
      body: JSON.stringify(order),
    });
  },

  updateOrderStatus(
    id,
    orderStatus
  ) {
    return request(
      `/orders/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          order_status:
            orderStatus,
        }),
      }
    );
  },

  updatePaymentStatus(
    id,
    paymentStatus
  ) {
    return request(
      `/orders/${id}/payment`,
      {
        method: "PATCH",
        body: JSON.stringify({
          payment_status:
            paymentStatus,
        }),
      }
    );
  },

  // =========================================================
  // INVENTORY
  // =========================================================

  getInventory(params = {}) {
    const searchParams =
      new URLSearchParams();

    if (params.search) {
      searchParams.set(
        "search",
        params.search
      );
    }

    if (params.stock_status) {
      searchParams.set(
        "stock_status",
        params.stock_status
      );
    }

    if (params.limit !== undefined) {
      searchParams.set(
        "limit",
        params.limit
      );
    }

    if (params.offset !== undefined) {
      searchParams.set(
        "offset",
        params.offset
      );
    }

    const queryString =
      searchParams.toString();

    return request(
      `/inventory${
        queryString
          ? `?${queryString}`
          : ""
      }`
    );
  },

  getInventoryStats() {
    return request(
      "/inventory/stats"
    );
  },

  getInventoryProduct(id) {
    return request(
      `/inventory/${id}`
    );
  },

  getInventoryMovements(
    productId = null
  ) {
    const query =
      productId
        ? `?product_id=${encodeURIComponent(
            productId
          )}`
        : "";

    return request(
      `/inventory/movements${query}`
    );
  },

  updateStock(
    id,
    {
      quantity,
      movement_type,
      reason = null,
      notes = null,
      reference_type = null,
      reference_id = null,
    }
  ) {
    return request(
      `/inventory/${id}/stock`,
      {
        method: "PATCH",
        body: JSON.stringify({
          quantity,
          movement_type,
          reason,
          notes,
          reference_type,
          reference_id,
        }),
      }
    );
  },

  // =========================================================
  // HEALTH
  // =========================================================

  health() {
    return fetch(
      "http://localhost:5001/health"
    ).then(async (response) => {
      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Backend health check failed"
        );
      }

      return data;
    });
  },
};

export default api;
