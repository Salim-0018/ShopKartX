import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  History,
  Package,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import api from "../services/api";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

function StockBadge({ status }) {
  const styles = {
    IN_STOCK:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    LOW_STOCK:
      "bg-amber-500/10 text-amber-400 border-amber-500/20",
    OUT_OF_STOCK:
      "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const labels = {
    IN_STOCK: "In Stock",
    LOW_STOCK: "Low Stock",
    OUT_OF_STOCK: "Out of Stock",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        styles[status] ||
        "border-slate-700 bg-slate-800 text-slate-300"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

function MovementBadge({ type }) {
  const positive = ["IN", "RETURN", "RELEASED"].includes(type);
  const negative = ["OUT", "DAMAGE", "RESERVED"].includes(type);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        positive
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          : negative
          ? "border-red-500/20 bg-red-500/10 text-red-400"
          : "border-slate-700 bg-slate-800 text-slate-300"
      }`}
    >
      {type}
    </span>
  );
}

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({
    total_products: 0,
    in_stock_products: 0,
    low_stock_products: 0,
    out_of_stock_products: 0,
    total_units: 0,
  });

  const [movements, setMovements] = useState([]);

  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [stockModal, setStockModal] = useState(null);
  const [historyModal, setHistoryModal] = useState(null);

  const [stockForm, setStockForm] = useState({
    quantity: 1,
    movement_type: "IN",
    reason: "",
    notes: "",
  });

  const [savingStock, setSavingStock] = useState(false);

  const loadInventory = useCallback(async () => {
    try {
      setError("");

      const [inventoryResponse, statsResponse, movementResponse] =
        await Promise.all([
          api.getInventory({
            search,
            stock_status: stockFilter,
            limit: 500,
          }),
          api.getInventoryStats(),
          api.getInventoryMovements(),
        ]);

      setInventory(inventoryResponse?.data || []);
      setStats(
        inventoryResponse?.data?.stats ||
          statsResponse?.data || {
            total_products: 0,
            in_stock_products: 0,
            low_stock_products: 0,
            out_of_stock_products: 0,
            total_units: 0,
          }
      );

      setMovements(movementResponse?.data || []);
    } catch (err) {
      setError(
        err.message || "Failed to load inventory"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, stockFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadInventory();
    }, 250);

    return () => clearTimeout(timer);
  }, [loadInventory]);

  const filteredMovements = useMemo(() => {
    if (!historyModal) return [];

    return movements.filter(
      (movement) =>
        Number(movement.product_id) ===
        Number(historyModal.id)
    );
  }, [historyModal, movements]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInventory();
  };

  const openStockModal = (product, movementType) => {
    setStockForm({
      quantity: 1,
      movement_type: movementType,
      reason:
        movementType === "IN"
          ? "Stock replenishment"
          : "Inventory adjustment",
      notes: "",
    });

    setStockModal(product);
  };

  const handleStockUpdate = async (event) => {
    event.preventDefault();

    if (!stockModal) return;

    const quantity = Number(stockForm.quantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("Quantity must be a positive whole number.");
      return;
    }

    try {
      setSavingStock(true);
      setError("");

      await api.updateStock(stockModal.id, {
        quantity,
        movement_type: stockForm.movement_type,
        reason: stockForm.reason || null,
        notes: stockForm.notes || null,
        reference_type: "ADMIN",
        reference_id: null,
      });

      setStockModal(null);

      await loadInventory();
    } catch (err) {
      setError(
        err.message || "Failed to update stock"
      );
    } finally {
      setSavingStock(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStockFilter("");
  };

  const hasFilters = search || stockFilter;

  return (
    <div className="min-h-screen bg-[#080e1c] text-slate-100">
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-2">
                <Boxes
                  size={20}
                  className="text-indigo-400"
                />
              </div>

              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
                Inventory Control
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white md:text-3xl">
              Inventory Management
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Monitor stock levels and manage inventory movements in real time.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="font-semibold">
                Inventory Error
              </p>

              <p className="mt-1 text-red-300/80">
                {error}
              </p>
            </div>

            <button
              onClick={() => setError("")}
              className="text-red-300 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            icon={Package}
            title="Products"
            value={stats.total_products}
            description="Active products"
          />

          <StatCard
            icon={Boxes}
            title="Total Units"
            value={stats.total_units}
            description="Current inventory"
          />

          <StatCard
            icon={ArrowUpFromLine}
            title="In Stock"
            value={stats.in_stock_products}
            description="Healthy stock"
            iconClass="text-emerald-400"
            bgClass="bg-emerald-500/10"
          />

          <StatCard
            icon={AlertTriangle}
            title="Low Stock"
            value={stats.low_stock_products}
            description="10 units or less"
            iconClass="text-amber-400"
            bgClass="bg-amber-500/10"
          />

          <StatCard
            icon={ArrowDownToLine}
            title="Out of Stock"
            value={stats.out_of_stock_products}
            description="Needs replenishment"
            iconClass="text-red-400"
            bgClass="bg-red-500/10"
          />
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl shadow-black/10">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search product, brand or SKU..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
              />
            </div>

            <select
              value={stockFilter}
              onChange={(event) =>
                setStockFilter(event.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500"
            >
              <option value="">
                All Stock
              </option>

              <option value="IN_STOCK">
                In Stock
              </option>

              <option value="LOW_STOCK">
                Low Stock
              </option>

              <option value="OUT_OF_STOCK">
                Out of Stock
              </option>
            </select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <div>
              <h2 className="font-semibold text-white">
                Stock Overview
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {inventory.length} products shown
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <RefreshCw
                size={26}
                className="animate-spin text-indigo-400"
              />
            </div>
          ) : inventory.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <Boxes
                size={40}
                className="text-slate-700"
              />

              <h3 className="mt-4 font-semibold text-slate-300">
                No inventory found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or stock filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1050px] w-full">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-4">
                      Product
                    </th>

                    <th className="px-5 py-4">
                      Price
                    </th>

                    <th className="px-5 py-4">
                      Current Stock
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4">
                      Last Movement
                    </th>

                    <th className="px-5 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {inventory.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-slate-800/70 transition hover:bg-slate-800/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package
                                  size={20}
                                  className="text-slate-600"
                                />
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-100">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              ID #{product.id}
                              {product.brand
                                ? ` • ${product.brand}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-200">
                        {formatCurrency(
                          product.price
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`text-lg font-bold ${
                            product.stock === 0
                              ? "text-red-400"
                              : product.stock <= 10
                              ? "text-amber-400"
                              : "text-white"
                          }`}
                        >
                          {product.stock}
                        </span>

                        <span className="ml-1 text-xs text-slate-500">
                          units
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <StockBadge
                          status={
                            product.stock_status
                          }
                        />
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-400">
                        {formatDate(
                          product.last_movement_at
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              openStockModal(
                                product,
                                "IN"
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
                          >
                            <ArrowUpFromLine
                              size={14}
                            />
                            Add
                          </button>

                          <button
                            onClick={() =>
                              openStockModal(
                                product,
                                "OUT"
                              )
                            }
                            disabled={
                              Number(
                                product.stock
                              ) <= 0
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ArrowDownToLine
                              size={14}
                            />
                            Remove
                          </button>

                          <button
                            onClick={() =>
                              setHistoryModal(
                                product
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
                          >
                            <History
                              size={14}
                            />
                            History
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Stock Modal */}
      {stockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div>
                <h3 className="font-semibold text-white">
                  Update Stock
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {stockModal.name}
                </p>
              </div>

              <button
                onClick={() =>
                  setStockModal(null)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleStockUpdate}
              className="space-y-5 p-5"
            >
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Current Stock
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {stockModal.stock} units
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Movement
                </label>

                <select
                  value={
                    stockForm.movement_type
                  }
                  onChange={(event) =>
                    setStockForm((current) => ({
                      ...current,
                      movement_type:
                        event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                >
                  <option value="IN">
                    Add Stock
                  </option>

                  <option value="OUT">
                    Remove Stock
                  </option>

                  <option value="RETURN">
                    Customer Return
                  </option>

                  <option value="DAMAGE">
                    Damaged Stock
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={
                    stockForm.quantity
                  }
                  onChange={(event) =>
                    setStockForm((current) => ({
                      ...current,
                      quantity:
                        event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Reason
                </label>

                <input
                  type="text"
                  value={
                    stockForm.reason
                  }
                  onChange={(event) =>
                    setStockForm((current) => ({
                      ...current,
                      reason:
                        event.target.value,
                    }))
                  }
                  placeholder="e.g. New supplier shipment"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Notes
                </label>

                <textarea
                  rows="3"
                  value={
                    stockForm.notes
                  }
                  onChange={(event) =>
                    setStockForm((current) => ({
                      ...current,
                      notes:
                        event.target.value,
                    }))
                  }
                  placeholder="Optional notes..."
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setStockModal(null)
                  }
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingStock}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingStock && (
                    <RefreshCw
                      size={15}
                      className="animate-spin"
                    />
                  )}

                  {savingStock
                    ? "Updating..."
                    : "Update Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div>
                <h3 className="font-semibold text-white">
                  Inventory History
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {historyModal.name}
                </p>
              </div>

              <button
                onClick={() =>
                  setHistoryModal(null)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-auto">
              {filteredMovements.length === 0 ? (
                <div className="flex min-h-40 items-center justify-center text-sm text-slate-500">
                  No inventory movements found.
                </div>
              ) : (
                <table className="min-w-[800px] w-full">
                  <thead className="sticky top-0 bg-slate-950">
                    <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4">
                        Date
                      </th>

                      <th className="px-5 py-4">
                        Type
                      </th>

                      <th className="px-5 py-4">
                        Quantity
                      </th>

                      <th className="px-5 py-4">
                        Stock
                      </th>

                      <th className="px-5 py-4">
                        Reason
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMovements.map(
                      (movement) => (
                        <tr
                          key={movement.id}
                          className="border-b border-slate-800/70"
                        >
                          <td className="px-5 py-4 text-sm text-slate-400">
                            {formatDate(
                              movement.created_at
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <MovementBadge
                              type={
                                movement.movement_type
                              }
                            />
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-white">
                            {movement.quantity}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-300">
                            {movement.previous_stock}
                            {" → "}
                            {movement.new_stock}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-400">
                            {movement.reason ||
                              "—"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  description,
  iconClass = "text-indigo-400",
  bgClass = "bg-indigo-500/10",
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`rounded-xl p-3 ${bgClass}`}
        >
          <Icon
            size={20}
            className={iconClass}
          />
        </div>
      </div>
    </div>
  );
}
