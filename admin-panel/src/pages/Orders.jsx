import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  Eye,
  Loader2,
  Package,
  RefreshCw,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { api } from "../services/api";

const ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURN_REQUESTED",
  "RETURNED",
  "REFUND_PENDING",
  "REFUNDED",
];

const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusClass(status) {
  const classes = {
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    PROCESSING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    SHIPPED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    DELIVERED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
    RETURN_REQUESTED: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    RETURNED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    REFUND_PENDING: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    REFUNDED: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  };

  return (
    classes[status] ||
    "bg-slate-500/10 text-slate-400 border-slate-500/20"
  );
}

function getPaymentClass(status) {
  const classes = {
    PAID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
    REFUNDED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    classes[status] ||
    "bg-slate-500/10 text-slate-400 border-slate-500/20"
  );
}

function StatusIcon({ status }) {
  if (status === "DELIVERED") {
    return <CheckCircle2 size={13} />;
  }

  if (status === "SHIPPED") {
    return <Truck size={13} />;
  }

  if (status === "CANCELLED") {
    return <XCircle size={13} />;
  }

  if (status === "PROCESSING") {
    return <Package size={13} />;
  }

  return <Clock3 size={13} />;
}

function StatCard({ title, value, icon: Icon, description }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-2.5 text-indigo-400">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.getOrders();

      setOrders(response?.data || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);

      const response = await api.getOrderStats();

      setStats(response?.data || null);
    } catch (err) {
      console.error("Failed to load order stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadData = async () => {
    await Promise.all([loadOrders(), loadStats()]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.order_number?.toLowerCase().includes(query) ||
        order.customer_name?.toLowerCase().includes(query) ||
        order.customer_email?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        order.order_status === statusFilter;

      const matchesPayment =
        paymentFilter === "ALL" ||
        order.payment_status === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, search, statusFilter, paymentFilter]);

  const openOrder = async (id) => {
    try {
      setSelectedOrder(null);
      setDetailError("");
      setDetailLoading(true);

      const response = await api.getOrder(id);

      setSelectedOrder(response?.data || null);
    } catch (err) {
      console.error("Failed to load order:", err);
      setDetailError(err.message || "Failed to load order details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingStatus(true);

      const response = await api.updateOrderStatus(id, newStatus);

      if (selectedOrder?.id === id) {
        setSelectedOrder(response?.data || null);
      }

      await Promise.all([loadOrders(), loadStats()]);
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert(err.message || "Failed to update order status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePaymentChange = async (id, newStatus) => {
    try {
      setUpdatingPayment(true);

      const response = await api.updatePaymentStatus(id, newStatus);

      if (selectedOrder?.id === id) {
        setSelectedOrder(response?.data || null);
      }

      await Promise.all([loadOrders(), loadStats()]);
    } catch (err) {
      console.error("Failed to update payment status:", err);
      alert(err.message || "Failed to update payment status.");
    } finally {
      setUpdatingPayment(false);
    }
  };

  const totalOrders = Number(stats?.total_orders || orders.length);
  const pendingOrders = Number(stats?.pending_orders || 0);
  const processingOrders = Number(stats?.processing_orders || 0);
  const deliveredOrders = Number(stats?.delivered_orders || 0);
  const paidRevenue = Number(stats?.paid_revenue || 0);

  return (
    <div className="min-h-full bg-[#080e1c] text-slate-200">
      <div className="mx-auto max-w-[1800px] space-y-6 p-4 md:p-6">

        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Admin</span>
              <span>/</span>
              <span className="text-slate-400">Orders</span>
            </div>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
              Orders Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage orders, payments, fulfillment and customer purchases.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading || statsLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-indigo-500/50 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading || statsLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />

            <div>
              <p className="font-medium">Unable to load orders</p>
              <p className="mt-1 text-sm text-red-300/70">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total Orders"
            value={statsLoading ? "..." : totalOrders}
            icon={Package}
            description="All orders"
          />

          <StatCard
            title="Pending"
            value={statsLoading ? "..." : pendingOrders}
            icon={Clock3}
            description="Awaiting action"
          />

          <StatCard
            title="Processing"
            value={statsLoading ? "..." : processingOrders}
            icon={RefreshCw}
            description="Being prepared"
          />

          <StatCard
            title="Delivered"
            value={statsLoading ? "..." : deliveredOrders}
            icon={CheckCircle2}
            description="Successfully delivered"
          />

          <StatCard
            title="Paid Revenue"
            value={statsLoading ? "..." : formatCurrency(paidRevenue)}
            icon={CreditCard}
            description="From paid orders"
          />
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-black/10">
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order number, customer or email..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-4 pr-10 text-sm text-slate-300 outline-none focus:border-indigo-500 xl:w-52"
              >
                <option value="ALL">All Order Status</option>

                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>

            <div className="relative">
              <select
                value={paymentFilter}
                onChange={(event) => setPaymentFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-4 pr-10 text-sm text-slate-300 outline-none focus:border-indigo-500 xl:w-52"
              >
                <option value="ALL">All Payments</option>

                {PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {filteredOrders.length} of {orders.length} orders
            </span>

            {(search || statusFilter !== "ALL" || paymentFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  setPaymentFilter("ALL");
                }}
                className="text-indigo-400 hover:text-indigo-300"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Orders table */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg shadow-black/10">
          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="font-semibold text-white">
              Recent Orders
            </h2>
          </div>

          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Loader2 size={20} className="animate-spin text-indigo-400" />
                Loading orders...
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <Package size={38} className="text-slate-700" />

              <h3 className="mt-4 font-semibold text-white">
                No orders found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-4 font-medium">Order</th>
                    <th className="px-5 py-4 font-medium">Customer</th>
                    <th className="px-5 py-4 font-medium">Items</th>
                    <th className="px-5 py-4 font-medium">Amount</th>
                    <th className="px-5 py-4 font-medium">Payment</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Date</th>
                    <th className="px-5 py-4 text-right font-medium">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/80">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="transition hover:bg-slate-800/30"
                    >
                      <td className="px-5 py-4">
                        <button
                          onClick={() => openOrder(order.id)}
                          className="font-semibold text-indigo-400 hover:text-indigo-300"
                        >
                          #{order.order_number}
                        </button>

                        <p className="mt-1 text-xs text-slate-600">
                          ID: {order.id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-200">
                          {order.customer_name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {order.customer_email}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-300">
                          {order.total_items || 0} item
                          {Number(order.total_items || 0) === 1 ? "" : "s"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">
                          {formatCurrency(order.total_amount)}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {order.payment_method}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getPaymentClass(
                            order.payment_status
                          )}`}
                        >
                          {order.payment_status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                            order.order_status
                          )}`}
                        >
                          <StatusIcon status={order.order_status} />
                          {order.order_status.replaceAll("_", " ")}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                        {formatDate(order.created_at)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => openOrder(order.id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-indigo-500/40 hover:text-white"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order detail modal */}
      {(detailLoading || selectedOrder || detailError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-700 bg-[#0b1220] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    setDetailError("");
                  }}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
                >
                  <ArrowLeft size={18} />
                </button>

                <div>
                  <h2 className="font-semibold text-white">
                    {selectedOrder
                      ? `Order #${selectedOrder.order_number}`
                      : "Order Details"}
                  </h2>

                  <p className="text-xs text-slate-500">
                    ShopKartX order management
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setDetailError("");
                }}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
              >
                <XCircle size={19} />
              </button>
            </div>

            <div className="max-h-[calc(92vh-76px)] overflow-y-auto p-5">
              {detailLoading ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Loader2
                      size={20}
                      className="animate-spin text-indigo-400"
                    />
                    Loading order details...
                  </div>
                </div>
              ) : detailError ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
                  <div className="flex items-center gap-2 font-medium">
                    <AlertCircle size={18} />
                    Failed to load order
                  </div>

                  <p className="mt-2 text-sm text-red-300/70">
                    {detailError}
                  </p>
                </div>
              ) : selectedOrder ? (
                <div className="space-y-5">

                  {/* Order summary */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Customer
                      </p>

                      <p className="mt-2 font-semibold text-white">
                        {selectedOrder.customer_name}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {selectedOrder.customer_email}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {selectedOrder.customer_phone || "No phone"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Payment
                      </p>

                      <p className="mt-2 text-xl font-bold text-white">
                        {formatCurrency(selectedOrder.total_amount)}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {selectedOrder.payment_method}
                      </p>

                      <span
                        className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getPaymentClass(
                          selectedOrder.payment_status
                        )}`}
                      >
                        {selectedOrder.payment_status}
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Order Status
                      </p>

                      <span
                        className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                          selectedOrder.order_status
                        )}`}
                      >
                        <StatusIcon status={selectedOrder.order_status} />
                        {selectedOrder.order_status.replaceAll("_", " ")}
                      </span>

                      <p className="mt-3 text-xs text-slate-600">
                        Created {formatDate(selectedOrder.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Status controls */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                        Update Order Status
                      </label>

                      <select
                        value={selectedOrder.order_status}
                        disabled={updatingStatus}
                        onChange={(event) =>
                          handleStatusChange(
                            selectedOrder.id,
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 disabled:opacity-50"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>

                      {updatingStatus && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-indigo-400">
                          <Loader2 size={13} className="animate-spin" />
                          Updating status...
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                        Update Payment Status
                      </label>

                      <select
                        value={selectedOrder.payment_status}
                        disabled={updatingPayment}
                        onChange={(event) =>
                          handlePaymentChange(
                            selectedOrder.id,
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 disabled:opacity-50"
                      >
                        {PAYMENT_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      {updatingPayment && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-indigo-400">
                          <Loader2 size={13} className="animate-spin" />
                          Updating payment...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                    <div className="flex items-center gap-2">
                      <Truck size={17} className="text-cyan-400" />
                      <h3 className="font-semibold text-white">
                        Shipping Information
                      </h3>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-500">
                          Address
                        </p>

                        <p className="mt-1 text-sm text-slate-300">
                          {selectedOrder.shipping_address || "-"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {[
                            selectedOrder.city,
                            selectedOrder.state,
                            selectedOrder.postal_code,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Tracking
                        </p>

                        <p className="mt-1 text-sm text-slate-300">
                          {selectedOrder.tracking_number || "Not assigned"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {selectedOrder.courier_name || "Courier not assigned"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">
                    <div className="border-b border-slate-800 px-4 py-3">
                      <h3 className="font-semibold text-white">
                        Order Items
                      </h3>
                    </div>

                    <div className="divide-y divide-slate-800">
                      {(selectedOrder.items || []).map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-3">
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="h-14 w-14 rounded-xl border border-slate-700 object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-slate-600">
                                <Package size={20} />
                              </div>
                            )}

                            <div>
                              <p className="font-medium text-slate-200">
                                {item.product_name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Qty: {item.quantity} ×{" "}
                                {formatCurrency(item.unit_price)}
                              </p>

                              <p className="mt-1 text-xs text-slate-600">
                                Stock: {item.stock ?? "-"} · Rating:{" "}
                                {item.rating ?? "-"} · Reviews:{" "}
                                {item.review_count ?? 0}
                              </p>
                            </div>
                          </div>

                          <p className="font-semibold text-white">
                            {formatCurrency(item.total_price)}
                          </p>
                        </div>
                      ))}

                      {(!selectedOrder.items ||
                        selectedOrder.items.length === 0) && (
                        <div className="p-6 text-center text-sm text-slate-500">
                          No order items found.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                    <h3 className="font-semibold text-white">
                      Price Summary
                    </h3>

                    <div className="mt-4 ml-auto max-w-sm space-y-3 text-sm">
                      <div className="flex justify-between text-slate-500">
                        <span>Subtotal</span>
                        <span className="text-slate-300">
                          {formatCurrency(selectedOrder.subtotal)}
                        </span>
                      </div>

                      <div className="flex justify-between text-slate-500">
                        <span>Shipping</span>
                        <span className="text-slate-300">
                          {formatCurrency(selectedOrder.shipping_fee)}
                        </span>
                      </div>

                      <div className="flex justify-between text-slate-500">
                        <span>Discount</span>
                        <span className="text-emerald-400">
                          -{formatCurrency(selectedOrder.discount)}
                        </span>
                      </div>

                      <div className="border-t border-slate-800 pt-3">
                        <div className="flex justify-between text-base font-bold">
                          <span className="text-white">Total</span>
                          <span className="text-white">
                            {formatCurrency(selectedOrder.total_amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Order Notes
                      </p>

                      <p className="mt-2 text-sm text-slate-300">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
