import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import api from "../services/api";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  original_price: "",
  stock: "",
  rating: "4.5",
  reviews_count: "0",
  image_url: "",
  category_id: "",
};

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getStockStatus(stock) {
  const quantity = Number(stock || 0);

  if (quantity === 0) {
    return {
      label: "Out of Stock",
      className: "bg-red-500/10 text-red-400 border-red-500/20",
    };
  }

  if (quantity <= 10) {
    return {
      label: "Low Stock",
      className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
  }

  return {
    label: "In Stock",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
}

function ProductModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState(
    product
      ? {
          name: product.name || "",
          description: product.description || "",
          price: product.price ?? "",
          original_price: product.original_price ?? "",
          stock: product.stock ?? "",
          rating: product.rating ?? "4.5",
          reviews_count: product.reviews_count ?? "0",
          image_url: product.image_url || "",
          category_id: product.category_id ?? "",
        }
      : emptyForm
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.price || Number(form.price) < 0) {
      setError("Please enter a valid product price.");
      return;
    }

    if (form.stock === "" || Number(form.stock) < 0) {
      setError("Please enter a valid stock quantity.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      original_price:
        form.original_price === ""
          ? Number(form.price)
          : Number(form.original_price),
      stock: Number(form.stock),
      rating: Number(form.rating || 0),
      reviews_count: Number(form.reviews_count || 0),
      image_url: form.image_url.trim(),
      category_id:
        form.category_id === "" ? null : Number(form.category_id),
    };

    try {
      setSaving(true);

      if (product?.id) {
        await api.updateProduct(product.id, payload);
      } else {
        await api.createProduct(payload);
      }

      await onSaved();
      onClose();
    } catch (err) {
      setError(err.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#101827] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#101827] px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {product ? "Edit Product" : "Add Product"}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {product
                ? "Update product information"
                : "Create a new store product"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Product Name
            </label>

            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="e.g. Smartphone Pro X"
              className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              rows={4}
              placeholder="Describe the product..."
              className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Selling Price
              </label>

              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(event) => updateField("price", event.target.value)}
                placeholder="29999"
                className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Original Price
              </label>

              <input
                type="number"
                min="0"
                value={form.original_price}
                onChange={(event) =>
                  updateField("original_price", event.target.value)
                }
                placeholder="34999"
                className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Stock
              </label>

              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(event) => updateField("stock", event.target.value)}
                placeholder="50"
                className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Rating
              </label>

              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(event) => updateField("rating", event.target.value)}
                placeholder="4.5"
                className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Reviews
              </label>

              <input
                type="number"
                min="0"
                value={form.reviews_count}
                onChange={(event) =>
                  updateField("reviews_count", event.target.value)
                }
                placeholder="120"
                className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Category ID
              </label>

              <input
                type="number"
                min="1"
                value={form.category_id}
                onChange={(event) =>
                  updateField("category_id", event.target.value)
                }
                placeholder="1"
                className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Image URL
            </label>

            <input
              value={form.image_url}
              onChange={(event) =>
                updateField("image_url", event.target.value)
              }
              placeholder="https://..."
              className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
            />
          </div>

          {form.image_url && (
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b1220]">
              <img
                src={form.image_url}
                alt="Product preview"
                className="h-48 w-full object-contain p-4"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  {product ? "Update Product" : "Create Product"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [modalProduct, setModalProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  async function loadProducts(showRefresh = false) {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.getProducts();

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.products)
          ? response.products
          : Array.isArray(response?.data)
            ? response.data
            : [];

      setProducts(list);
    } catch (err) {
      setError(err.message || "Unable to load products.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        String(product.name || "")
          .toLowerCase()
          .includes(query) ||
        String(product.description || "")
          .toLowerCase()
          .includes(query);

      const stock = Number(product.stock || 0);

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in-stock" && stock > 10) ||
        (stockFilter === "low-stock" && stock > 0 && stock <= 10) ||
        (stockFilter === "out-of-stock" && stock === 0);

      return matchesSearch && matchesStock;
    });
  }, [products, search, stockFilter]);

  const stats = useMemo(() => {
    const totalValue = products.reduce(
      (sum, product) =>
        sum + Number(product.price || 0) * Number(product.stock || 0),
      0
    );

    return {
      total: products.length,
      inStock: products.filter((product) => Number(product.stock || 0) > 10)
        .length,
      lowStock: products.filter(
        (product) =>
          Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 10
      ).length,
      outOfStock: products.filter(
        (product) => Number(product.stock || 0) === 0
      ).length,
      inventoryValue: totalValue,
    };
  }, [products]);

  function toggleSelect(id) {
    setSelectedProducts((current) =>
      current.includes(id)
        ? current.filter((productId) => productId !== id)
        : [...current, id]
    );
  }

  function toggleSelectAll() {
    if (
      selectedProducts.length === filteredProducts.length &&
      filteredProducts.length > 0
    ) {
      setSelectedProducts([]);
      return;
    }

    setSelectedProducts(filteredProducts.map((product) => product.id));
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteId(id);
      await api.deleteProduct(id);

      setProducts((current) =>
        current.filter((product) => product.id !== id)
      );

      setSelectedProducts((current) =>
        current.filter((productId) => productId !== id)
      );
    } catch (err) {
      window.alert(err.message || "Unable to delete product.");
    } finally {
      setDeleteId(null);
    }
  }

  function openAddModal() {
    setModalProduct(null);
    setModalOpen(true);
  }

  function openEditModal(product) {
    setModalProduct(product);
    setModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
              <Package size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                Product Management
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Manage your real ShopKartX product catalog.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => loadProducts(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            <Plus size={17} />
            Add Product
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Total Products"
          value={stats.total}
          icon={<Package size={19} />}
        />

        <Stat
          label="In Stock"
          value={stats.inStock}
          icon={<CheckCircle2 size={19} />}
        />

        <Stat
          label="Low Stock"
          value={stats.lowStock}
          icon={<AlertCircle size={19} />}
        />

        <Stat
          label="Inventory Value"
          value={formatPrice(stats.inventoryValue)}
          icon={<Package size={19} />}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative min-w-0 flex-1 xl:max-w-xl">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-white/10 bg-[#0b1220] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ["all", "All"],
              ["in-stock", "In Stock"],
              ["low-stock", "Low Stock"],
              ["out-of-stock", "Out of Stock"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setStockFilter(value)}
                className={`rounded-xl border px-4 py-2.5 text-sm transition ${
                  stockFilter === value
                    ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
                    : "border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedProducts.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3">
          <span className="text-sm text-indigo-200">
            {selectedProducts.length} product
            {selectedProducts.length === 1 ? "" : "s"} selected
          </span>

          <button
            onClick={() => setSelectedProducts([])}
            className="text-sm font-medium text-indigo-300 hover:text-white"
          >
            Clear selection
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />

          <div>
            <p className="font-medium">Unable to load products</p>
            <p className="mt-1 text-sm text-red-300/80">{error}</p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-left">
                <th className="w-12 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={
                      filteredProducts.length > 0 &&
                      selectedProducts.length === filteredProducts.length
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 accent-indigo-500"
                  />
                </th>

                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Product
                </th>

                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Price
                </th>

                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Stock
                </th>

                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Rating
                </th>

                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <RefreshCw
                      size={26}
                      className="mx-auto animate-spin text-indigo-400"
                    />

                    <p className="mt-3 text-sm text-slate-400">
                      Loading products...
                    </p>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <Package
                      size={34}
                      className="mx-auto text-slate-600"
                    />

                    <p className="mt-3 font-medium text-slate-300">
                      No products found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Try changing your search or stock filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const status = getStockStatus(product.stock);

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-white/5 transition hover:bg-white/[0.025]"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleSelect(product.id)}
                          className="h-4 w-4 accent-indigo-500"
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0b1220]">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-full w-full object-contain p-1"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-600">
                                <Package size={22} />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[300px] truncate font-medium text-white">
                              {product.name}
                            </p>

                            <p className="mt-1 max-w-[300px] truncate text-xs text-slate-500">
                              {product.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-semibold text-white">
                          {formatPrice(product.price)}
                        </p>

                        {Number(product.original_price) >
                          Number(product.price) && (
                          <p className="mt-1 text-xs text-slate-500 line-through">
                            {formatPrice(product.original_price)}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-medium text-slate-200">
                          {Number(product.stock || 0)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400">★</span>
                          <span className="font-medium text-white">
                            {Number(product.rating || 0).toFixed(1)}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({Number(product.reviews_count || 0)})
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:bg-indigo-500/10 hover:text-indigo-400"
                            title="Edit product"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deleteId === product.id}
                            className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                            title="Delete product"
                          >
                            {deleteId === product.id ? (
                              <RefreshCw
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing{" "}
            <span className="font-medium text-slate-300">
              {filteredProducts.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-300">
              {products.length}
            </span>{" "}
            products
          </span>

          <span>
            Out of stock:{" "}
            <span className="font-medium text-red-400">
              {stats.outOfStock}
            </span>
          </span>
        </div>
      </div>

      {modalOpen && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalOpen(false)}
          onSaved={() => loadProducts()}
        />
      )}
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">{label}</p>

      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
