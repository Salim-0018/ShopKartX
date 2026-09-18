import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Boxes,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  CreditCard,
  Gauge,
  Globe2,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Truck,
  Users,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Products from "./pages/Products";
import Inventory from "./pages/Inventory";

const revenueData = [
  { day: "Mon", revenue: 18200, profit: 6200 },
  { day: "Tue", revenue: 22400, profit: 7800 },
  { day: "Wed", revenue: 19800, profit: 6900 },
  { day: "Thu", revenue: 27600, profit: 9800 },
  { day: "Fri", revenue: 31800, profit: 11400 },
  { day: "Sat", revenue: 35400, profit: 13200 },
  { day: "Sun", revenue: 38900, profit: 14900 },
];

const forecastData = [
  { day: "Mon", forecast: null },
  { day: "Tue", forecast: null },
  { day: "Wed", forecast: null },
  { day: "Thu", forecast: 27600 },
  { day: "Fri", forecast: 33700 },
  { day: "Sat", forecast: 38200 },
  { day: "Sun", forecast: 42100 },
  { day: "Mon", forecast: 44800 },
  { day: "Tue", forecast: 47200 },
];

const orders = [
  {
    id: "#SKX-10482",
    customer: "Aarav Sharma",
    initials: "AS",
    product: "Smartphone Pro X",
    amount: "₹29,999",
    payment: "Paid",
    status: "Shipped",
    progress: 72,
    time: "4 min ago",
  },
  {
    id: "#SKX-10481",
    customer: "Priya Verma",
    initials: "PV",
    product: "UltraBook 14",
    amount: "₹64,999",
    payment: "Paid",
    status: "Processing",
    progress: 42,
    time: "8 min ago",
  },
  {
    id: "#SKX-10480",
    customer: "Rahul Mehta",
    initials: "RM",
    product: "Classic Cotton T-Shirt",
    amount: "₹1,598",
    payment: "Paid",
    status: "Delivered",
    progress: 100,
    time: "13 min ago",
  },
  {
    id: "#SKX-10479",
    customer: "Neha Kapoor",
    initials: "NK",
    product: "Air Fryer 5L",
    amount: "₹4,999",
    payment: "Pending",
    status: "Payment",
    progress: 15,
    time: "19 min ago",
  },
  {
    id: "#SKX-10478",
    customer: "Vikram Singh",
    initials: "VS",
    product: "Smartphone Pro X",
    amount: "₹29,999",
    payment: "Paid",
    status: "Shipped",
    progress: 84,
    time: "24 min ago",
  },
];

const navGroups = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutDashboard },
      { label: "AI Insights", icon: BrainCircuit, badge: "AI" },
    ],
  },
  {
    title: "Commerce",
    items: [
      { label: "Orders", icon: ClipboardList, badge: "24" },
      { label: "Products", icon: ShoppingBag },
      { label: "Inventory", icon: Boxes, badge: "7" },
      { label: "Customers", icon: Users },
      { label: "Fulfillment", icon: Truck },
    ],
  },
  {
    title: "Growth",
    items: [
      { label: "Analytics", icon: Activity },
      { label: "Marketing", icon: Zap },
      { label: "Payments", icon: WalletCards },
    ],
  },
  {
    title: "Platform",
    items: [
      { label: "DevOps Health", icon: Gauge },
      { label: "Settings", icon: Settings },
    ],
  },
];

function formatMoney(value) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function MiniSparkline({ positive = true }) {
  const points = positive
    ? "2,22 15,19 28,21 42,13 55,16 68,8 82,10 98,3"
    : "2,5 15,8 28,7 42,14 55,11 68,18 82,16 98,23";

  return (
    <svg viewBox="0 0 100 28" className="h-8 w-24">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={positive ? "text-emerald-400" : "text-rose-400"}
      />
    </svg>
  );
}

function StatCard({
  title,
  value,
  change,
  positive = true,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/10 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.06]">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={20} />
        </div>

        <button className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <p className="mt-5 text-sm text-slate-400">{title}</p>

      <div className="mt-1 flex items-end justify-between gap-3">
        <h3 className="text-2xl font-bold tracking-tight text-white">
          {value}
        </h3>
        <MiniSparkline positive={positive} />
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs">
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-1 font-semibold ${
            positive
              ? "bg-emerald-400/10 text-emerald-400"
              : "bg-rose-400/10 text-rose-400"
          }`}
        >
          {positive ? (
            <ArrowUpRight size={13} />
          ) : (
            <ArrowDownRight size={13} />
          )}
          {change}
        </span>

        <span className="text-slate-500">vs last 7 days</span>
      </div>
    </div>
  );
}

function Sidebar({ collapsed, setCollapsed, active, setActive }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 hidden border-r border-white/10 bg-[#090f1f]/95 backdrop-blur-2xl transition-all duration-300 lg:block ${
        collapsed ? "w-[78px]" : "w-[250px]"
      }`}
    >
      <div className="flex h-full flex-col">
        <div
          className={`flex h-20 items-center border-b border-white/10 ${
            collapsed ? "justify-center" : "justify-between px-5"
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
              <ShoppingCart size={20} className="text-white" />
            </div>

            {!collapsed && (
              <div>
                <div className="whitespace-nowrap text-base font-bold text-white">
                  ShopKart<span className="text-indigo-400">X</span>
                </div>

                <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  Admin Console
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"
            >
              <PanelLeftClose size={17} />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto mt-4 rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        <div className="flex-1 overflow-y-auto px-3 py-5">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-6">
              {!collapsed && (
                <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
                  {group.title}
                </div>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.label;

                  return (
                    <button
                      key={item.label}
                      onClick={() => setActive(item.label)}
                      title={collapsed ? item.label : undefined}
                      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                        isActive
                          ? "bg-indigo-500/15 text-indigo-300"
                          : "text-slate-400 hover:bg-white/[0.045] hover:text-white"
                      } ${collapsed ? "justify-center" : ""}`}
                    >
                      {isActive && (
                        <span className="absolute left-0 h-5 w-0.5 rounded-full bg-indigo-400" />
                      )}

                      <Icon size={18} className="shrink-0" />

                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">
                            {item.label}
                          </span>

                          {item.badge && (
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                                item.badge === "AI"
                                  ? "bg-violet-400/10 text-violet-300"
                                  : "bg-white/5 text-slate-500"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {!collapsed && (
          <div className="border-t border-white/10 p-3">
            <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.04] p-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>

                <span className="text-xs font-semibold text-emerald-300">
                  All systems operational
                </span>
              </div>

              <p className="mt-2 text-[10px] leading-4 text-slate-500">
                Platform monitoring is connected.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function MobileSidebar({ open, setOpen, active, setActive }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        className="absolute inset-0 bg-black/70"
        onClick={() => setOpen(false)}
        aria-label="Close menu"
      />

      <aside className="relative h-full w-[280px] border-r border-white/10 bg-[#090f1f] shadow-2xl">
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
              <ShoppingCart size={20} />
            </div>

            <div>
              <div className="font-bold text-white">
                ShopKart<span className="text-indigo-400">X</span>
              </div>

              <div className="text-[10px] uppercase tracking-widest text-slate-500">
                Admin
              </div>
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-3">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-5">
              <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                {group.title}
              </div>

              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      setActive(item.label);
                      setOpen(false);
                    }}
                    className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                      active === item.label
                        ? "bg-indigo-500/15 text-indigo-300"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />

                    <span className="flex-1 text-left">
                      {item.label}
                    </span>

                    {item.badge && (
                      <span className="text-[10px] text-slate-500">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function Topbar({ setMobileOpen, onAddProduct }) {
  const [storeOpen, setStoreOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#080e1c]/80 backdrop-blur-2xl">
      <div className="flex h-20 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-xl p-2.5 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
        >
          <Menu size={21} />
        </button>

        <div className="relative hidden max-w-xl flex-1 md:block">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-32 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500/50 focus:bg-white/[0.06]"
            placeholder="Ask AI to analyze sales, orders, inventory..."
          />

          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-lg border border-white/5 bg-white/[0.04] px-2 py-1 text-[10px] text-slate-500">
            <Sparkles size={11} className="text-violet-400" />
            AI
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setStoreOpen((value) => !value)}
              className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-slate-300 hover:bg-white/[0.07] sm:flex"
            >
              <Store size={16} className="text-indigo-400" />
              ShopKartX Store
              <ChevronDown size={15} className="text-slate-500" />
            </button>

            {storeOpen && (
              <div className="absolute right-0 top-14 w-56 rounded-xl border border-white/10 bg-[#11182a] p-2 shadow-2xl">
                <button className="w-full rounded-lg bg-indigo-500/10 px-3 py-2 text-left text-sm text-indigo-300">
                  ShopKartX Store
                </button>

                <button className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-400 hover:bg-white/5 hover:text-white">
                  Add another store
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onAddProduct}
            className="hidden items-center gap-2 rounded-xl bg-indigo-500 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 sm:flex"
          >
            <Plus size={17} />
            Add Product
          </button>

          <div className="relative">
            <button
              onClick={() =>
                setNotificationOpen((value) => !value)
              }
              className="relative rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-slate-400 hover:bg-white/[0.07] hover:text-white"
            >
              <Bell size={18} />

              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-400 ring-2 ring-[#080e1c]" />
            </button>

            {notificationOpen && (
              <div className="absolute right-0 top-14 w-80 rounded-2xl border border-white/10 bg-[#11182a] p-3 shadow-2xl">
                <div className="flex items-center justify-between px-2 pb-2">
                  <span className="font-semibold text-white">
                    Notifications
                  </span>

                  <span className="text-xs text-indigo-300">
                    3 new
                  </span>
                </div>

                {[
                  ["Low stock", "Smartphone Pro X has 8 units left."],
                  ["New order", "#SKX-10482 was just placed."],
                  ["Payment", "Payment verification required."],
                ].map(([title, text]) => (
                  <div
                    key={title}
                    className="mt-1 rounded-xl p-3 hover:bg-white/5"
                  >
                    <div className="text-sm font-medium text-white">
                      {title}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white">
            SK
          </button>
        </div>
      </div>
    </header>
  );
}

function AIInsightPanel() {
  return (
    <section className="rounded-2xl border border-indigo-400/10 bg-gradient-to-br from-indigo-500/[0.09] via-white/[0.035] to-emerald-400/[0.04] p-5 shadow-2xl shadow-indigo-950/20">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
            <BrainCircuit size={20} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">
                AI Business Insights
              </h3>

              <span className="rounded-full bg-violet-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-300">
                AI
              </span>
            </div>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
              Based on current sales velocity, inventory and customer
              behavior.
            </p>
          </div>
        </div>

        <button className="flex items-center gap-1.5 self-start text-xs font-medium text-indigo-300 hover:text-indigo-200">
          View all insights
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/5 bg-black/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Top selling product
            </span>

            <ArrowUpRight size={15} className="text-emerald-400" />
          </div>

          <div className="mt-2 text-sm font-semibold text-white">
            Smartphone Pro X
          </div>

          <div className="mt-1 text-xs text-emerald-400">
            +28.4% sales velocity this week
          </div>
        </div>

        <div className="rounded-xl border border-amber-400/10 bg-amber-400/[0.03] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Inventory warning
            </span>

            <AlertTriangle size={15} className="text-amber-400" />
          </div>

          <div className="mt-2 text-sm font-semibold text-white">
            7 products need restocking
          </div>

          <div className="mt-1 text-xs text-amber-400">
            Estimated stockout within 5 days
          </div>
        </div>
      </div>
    </section>
  );
}

function RevenueChart() {
  const [range, setRange] = useState("7D");

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-semibold text-white">
            Revenue performance
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Revenue, profit and AI forecast
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/10 p-1">
          {["7D", "30D", "90D"].map((item) => (
            <button
              key={item}
              onClick={() => setRange(item)}
              className={`rounded-md px-3 py-1.5 text-[11px] font-semibold ${
                range === item
                  ? "bg-indigo-500 text-white"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient
                id="revenueFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#6366f1"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="#6366f1"
                  stopOpacity={0}
                />
              </linearGradient>

              <linearGradient
                id="profitFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#10b981"
                  stopOpacity={0.2}
                />
                <stop
                  offset="100%"
                  stopColor="#10b981"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#ffffff0a"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />

            <Tooltip
              contentStyle={{
                background: "#11182a",
                border: "1px solid rgba(255,255,255,.1)",
                borderRadius: 12,
                color: "#fff",
              }}
              formatter={(value) => formatMoney(value)}
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#revenueFill)"
              name="Revenue"
            />

            <Area
              type="monotone"
              dataKey="profit"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#profitFill)"
              name="Profit"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-5 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-400" />
          Revenue
        </span>

        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Profit
        </span>

        <span className="flex items-center gap-2">
          <span className="h-px w-5 border-t border-dashed border-violet-400" />
          AI forecast
        </span>
      </div>

      <div className="mt-5 border-t border-white/5 pt-4">
        <div className="h-[90px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastData}>
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#a78bfa"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="AI Forecast"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function OrdersTable() {
  const [statusFilter, setStatusFilter] = useState("All");

  const statuses = [
    "All",
    "Payment",
    "Processing",
    "Shipped",
    "Delivered",
  ];

  const filteredOrders = useMemo(() => {
    if (statusFilter === "All") return orders;

    return orders.filter(
      (order) => order.status === statusFilter
    );
  }, [statusFilter]);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/10">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-white">
              Live orders
            </h2>

            <span className="flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              LIVE
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Recent customer orders and fulfillment status
          </p>
        </div>

        <div className="flex gap-1 overflow-x-auto rounded-lg border border-white/10 bg-black/10 p-1">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-[10px] font-semibold ${
                statusFilter === status
                  ? "bg-white/10 text-white"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-slate-600">
              <th className="pb-3 font-semibold">Order</th>
              <th className="pb-3 font-semibold">Customer</th>
              <th className="pb-3 font-semibold">Amount</th>
              <th className="pb-3 font-semibold">Payment</th>
              <th className="pb-3 font-semibold">Fulfillment</th>
              <th className="pb-3 font-semibold">Updated</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-white/5 last:border-0"
              >
                <td className="py-4">
                  <div className="text-xs font-semibold text-white">
                    {order.id}
                  </div>

                  <div className="mt-1 text-[10px] text-slate-600">
                    {order.product}
                  </div>
                </td>

                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 text-[10px] font-bold text-indigo-200">
                      {order.initials}
                    </div>

                    <span className="text-xs text-slate-300">
                      {order.customer}
                    </span>
                  </div>
                </td>

                <td className="py-4 text-xs font-semibold text-white">
                  {order.amount}
                </td>

                <td className="py-4">
                  <span
                    className={`rounded-full px-2 py-1 text-[9px] font-semibold ${
                      order.payment === "Paid"
                        ? "bg-emerald-400/10 text-emerald-400"
                        : "bg-amber-400/10 text-amber-400"
                    }`}
                  >
                    {order.payment}
                  </span>
                </td>

                <td className="py-4">
                  <div className="w-32">
                    <div className="mb-1 flex justify-between text-[9px]">
                      <span className="text-slate-500">
                        {order.status}
                      </span>

                      <span className="text-slate-600">
                        {order.progress}%
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`h-full rounded-full ${
                          order.status === "Delivered"
                            ? "bg-emerald-400"
                            : order.status === "Payment"
                              ? "bg-amber-400"
                              : "bg-indigo-400"
                        }`}
                        style={{
                          width: `${order.progress}%`,
                        }}
                      />
                    </div>
                  </div>
                </td>

                <td className="py-4 text-[10px] text-slate-600">
                  {order.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/5 py-2.5 text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white">
        View all orders
        <ChevronRight size={14} />
      </button>
    </section>
  );
}

function SalesMap() {
  const regions = [
    { name: "Delhi NCR", sales: "₹8.42L", width: 88 },
    { name: "Mumbai", sales: "₹6.17L", width: 74 },
    { name: "Bengaluru", sales: "₹5.43L", width: 65 },
    { name: "Hyderabad", sales: "₹3.87L", width: 49 },
    { name: "Pune", sales: "₹3.21L", width: 40 },
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/10">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-semibold text-white">
            Geographic sales
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Top performing regions
          </p>
        </div>

        <Globe2 size={19} className="text-indigo-400" />
      </div>

      <div className="relative mt-6 flex h-36 items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-indigo-500/[0.06] to-emerald-500/[0.03]">
        <div className="absolute h-28 w-28 rounded-full border border-indigo-400/10" />
        <div className="absolute h-20 w-20 rounded-full border border-indigo-400/10" />
        <div className="absolute h-12 w-12 rounded-full bg-indigo-500/10 shadow-[0_0_60px_rgba(99,102,241,.2)]" />
        <Globe2
          size={68}
          strokeWidth={0.7}
          className="text-indigo-400/40"
        />
      </div>

      <div className="mt-5 space-y-3">
        {regions.map((region, index) => (
          <div key={region.name}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {region.name}
              </span>

              <span className="font-semibold text-white">
                {region.sales}
              </span>
            </div>

            <div className="h-1.5 rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400"
                style={{
                  width: `${region.width}%`,
                  opacity: 1 - index * 0.1,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlatformHealth() {
  const metrics = [
    {
      label: "API",
      value: "Healthy",
      detail: "42 req/s",
      icon: Activity,
      color: "text-emerald-400",
    },
    {
      label: "Database",
      value: "Healthy",
      detail: "18 ms latency",
      icon: Boxes,
      color: "text-emerald-400",
    },
    {
      label: "Redis",
      value: "Healthy",
      detail: "3 ms latency",
      icon: Zap,
      color: "text-emerald-400",
    },
    {
      label: "Payments",
      value: "Operational",
      detail: "99.8% success",
      icon: CreditCard,
      color: "text-indigo-400",
    },
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/10">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-semibold text-white">
            Platform health
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Service availability overview
          </p>
        </div>

        <button className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="mt-5 space-y-2">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/10 p-3"
            >
              <div
                className={`rounded-lg bg-white/5 p-2 ${metric.color}`}
              >
                <Icon size={16} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-white">
                  {metric.label}
                </div>

                <div className="mt-0.5 text-[10px] text-slate-600">
                  {metric.detail}
                </div>
              </div>

              <div
                className={`flex items-center gap-1 text-[10px] ${metric.color}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {metric.value}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function QuickSummary() {
  const cards = [
    {
      title: "Products",
      value: "4",
      subtitle: "3 active categories",
      icon: Package,
      color: "text-indigo-400",
    },
    {
      title: "Customers",
      value: "1,284",
      subtitle: "+12.8% this month",
      icon: Users,
      color: "text-violet-400",
    },
    {
      title: "Payments",
      value: "₹4.82L",
      subtitle: "98.4% success rate",
      icon: CircleDollarSign,
      color: "text-emerald-400",
    },
    {
      title: "Avg. order value",
      value: "₹3,842",
      subtitle: "+8.2% vs last week",
      icon: ShoppingBag,
      color: "text-cyan-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
          >
            <div className="flex items-center justify-between">
              <Icon size={18} className={card.color} />
              <MoreHorizontal
                size={15}
                className="text-slate-600"
              />
            </div>

            <div className="mt-4 text-xs text-slate-500">
              {card.title}
            </div>

            <div className="mt-1 text-lg font-bold text-white">
              {card.value}
            </div>

            <div className="mt-1 text-[10px] text-slate-600">
              {card.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Dashboard() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="₹2,34,600"
          change="+18.6%"
          icon={CircleDollarSign}
          iconClass="bg-indigo-500/10 text-indigo-400"
        />

        <StatCard
          title="Net Profit"
          value="₹91,420"
          change="+14.2%"
          icon={ArrowUpRight}
          iconClass="bg-emerald-500/10 text-emerald-400"
        />

        <StatCard
          title="Active Orders"
          value="284"
          change="+8.4%"
          icon={ShoppingBag}
          iconClass="bg-violet-500/10 text-violet-400"
        />

        <StatCard
          title="Return Rate"
          value="2.84%"
          change="-0.8%"
          positive={true}
          icon={RefreshCw}
          iconClass="bg-cyan-500/10 text-cyan-400"
        />
      </div>

      <AIInsightPanel />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
        <RevenueChart />
        <SalesMap />
      </div>

      <OrdersTable />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <QuickSummary />
        <PlatformHealth />
      </div>
    </>
  );
}

function EmptyPage({ title, icon: Icon }) {
  return (
    <div className="flex min-h-[600px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035]">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
          <Icon size={28} />
        </div>

        <h2 className="mt-5 text-xl font-bold text-white">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          This module is ready for the next integration phase. The UI
          shell, navigation and dashboard architecture are already
          prepared for real ShopKartX API data.
        </p>

        <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400">
          <Plus size={16} />
          Create new
        </button>
      </div>
    </div>
  );
}

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");

  const navigateTo = (page) => {
    setActive(page);
    setMobileOpen(false);
  };

  const pageIcon =
    navGroups
      .flatMap((group) => group.items)
      .find((item) => item.label === active)?.icon ||
    LayoutDashboard;

  const handleAddProduct = () => {
    navigateTo("Products");
  };

  const renderPage = () => {
    if (active === "Dashboard") {
      return <Dashboard />;
    }

    if (active === "Products") {
      return <Products />;
    }

    /*
     * REAL INVENTORY PAGE
     * Inventory.jsx is now connected here.
     */
    if (active === "Inventory") {
      return <Inventory />;
    }

    if (active === "AI Insights") {
      return (
        <EmptyPage
          title="AI Insights"
          icon={BrainCircuit}
        />
      );
    }

    if (active === "Orders") {
      return (
        <EmptyPage
          title="Orders Management"
          icon={ClipboardList}
        />
      );
    }

    if (active === "Customers") {
      return (
        <EmptyPage
          title="Customer Management"
          icon={Users}
        />
      );
    }

    if (active === "Fulfillment") {
      return (
        <EmptyPage
          title="Fulfillment & Logistics"
          icon={Truck}
        />
      );
    }

    if (active === "Analytics") {
      return (
        <EmptyPage
          title="Analytics Center"
          icon={Activity}
        />
      );
    }

    if (active === "Marketing") {
      return (
        <EmptyPage
          title="Marketing Center"
          icon={Zap}
        />
      );
    }

    if (active === "Payments") {
      return (
        <EmptyPage
          title="Payment Management"
          icon={WalletCards}
        />
      );
    }

    if (active === "DevOps Health") {
      return (
        <EmptyPage
          title="DevOps & Platform Health"
          icon={Gauge}
        />
      );
    }

    if (active === "Settings") {
      return (
        <EmptyPage
          title="Store Settings"
          icon={Settings}
        />
      );
    }

    return <Dashboard />;
  };

  return (
    <div className="min-h-screen bg-[#080e1c] text-slate-200">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        active={active}
        setActive={navigateTo}
      />

      <MobileSidebar
        open={mobileOpen}
        setOpen={setMobileOpen}
        active={active}
        setActive={navigateTo}
      />

      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed
            ? "lg:pl-[78px]"
            : "lg:pl-[250px]"
        }`}
      >
        <Topbar
          setMobileOpen={setMobileOpen}
          onAddProduct={handleAddProduct}
        />

        <main className="mx-auto max-w-[1800px] p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-600">
                <span>ShopKartX</span>
                <ChevronRight size={11} />
                <span className="text-slate-500">
                  {active}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-indigo-400 sm:block">
                  {(() => {
                    const Icon = pageIcon;
                    return <Icon size={19} />;
                  })()}
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {active === "Dashboard"
                      ? "Good morning, Admin"
                      : active}
                  </h1>

                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    {active === "Dashboard"
                      ? "Here is what's happening with your store today."
                      : `Manage your ShopKartX ${active.toLowerCase()} operations.`}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-slate-500 md:flex">
                <Clock3 size={14} />
                Last updated just now
              </div>

              <button
                onClick={() => window.location.reload()}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-slate-400 hover:bg-white/[0.07] hover:text-white"
                title="Refresh"
              >
                <RefreshCw size={17} />
              </button>

              <button
                onClick={handleAddProduct}
                className="rounded-xl bg-indigo-500 px-3 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 sm:hidden"
                title="Add Product"
              >
                <Plus size={17} />
              </button>
            </div>
          </div>

          {renderPage()}
        </main>

        <footer className="border-t border-white/5 px-6 py-5 text-center text-[10px] text-slate-700 lg:px-8">
          ShopKartX Admin Console • E-commerce Operations Platform
        </footer>
      </div>
    </div>
  );
}

export default App;
