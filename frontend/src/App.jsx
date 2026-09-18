import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingCart,
  User,
  MapPin,
  Heart,
  Menu,
  X,
  ChevronDown,
  Star,
  Plus,
  Minus,
  Trash2,
  Package,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Smartphone,
  Laptop,
  Shirt,
  Sofa,
  Sparkles,
  Gamepad2,
  Headphones,
  ShoppingBasket,
  ChevronRight,
  SlidersHorizontal,
  ArrowRight,
  Flame,
  BadgeCheck,
  SearchX,
  Grid2X2,
  CheckCircle2,
  WalletCards,
  Loader2,
  LockKeyhole,
} from "lucide-react";

import {
  fetchProducts,
  getCategories,
} from "./data/products";

import ProductDetails from "./ProductDetails";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5001/api/v1";

const CATEGORY_ICONS = {
  Mobiles: Smartphone,
  Laptops: Laptop,
  Fashion: Shirt,
  Home: Sofa,
  Beauty: Sparkles,
  Gaming: Gamepad2,
  Audio: Headphones,
  Grocery: ShoppingBasket,
};

const CATEGORY_DESCRIPTIONS = {
  Mobiles: "Smartphones & accessories",
  Laptops: "Work & entertainment",
  Fashion: "Style for every day",
  Home: "Make your space better",
  Beauty: "Beauty & personal care",
  Gaming: "Gaming essentials",
  Audio: "Sound & accessories",
  Grocery: "Daily essentials",
};

const PAGE_SIZE = 24;

const money = (value) =>
  Number(value || 0).toLocaleString("en-IN");

function ProductImage({
  product,
  className = "",
}) {
  const image =
    product?.thumbnail ||
    product?.images?.[0] ||
    product?.image ||
    "";

  return image ? (
    <img
      src={image}
      alt={product?.title || "Product"}
      className={className}
      loading="lazy"
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  ) : (
    <Package
      size={62}
      strokeWidth={1.5}
      className="text-slate-300"
    />
  );
}

function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onOpenProduct,
}) {
  const priceAvailable =
    product?.priceAvailable !== false &&
    Number(product?.price || 0) > 0;

  const price = Number(product?.price || 0);

  const originalPrice = Number(
    product?.originalPrice || 0,
  );

  const rating = Number(product?.rating || 0);

  const ratingCount = Number(
    product?.ratingCount || 0,
  );

  const discount = Number(
    product?.discountPercentage || 0,
  );

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">
      <div className="relative">
        <button
          type="button"
          onClick={() => onToggleWishlist(product)}
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 shadow-sm backdrop-blur transition hover:scale-110"
        >
          <Heart
            size={17}
            className={
              isWishlisted
                ? "fill-red-500 text-red-500"
                : "text-slate-500"
            }
          />
        </button>

        {discount > 0 && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white shadow-sm">
            {Math.round(discount)}% OFF
          </span>
        )}

        <button
          type="button"
          onClick={() => onOpenProduct(product)}
          className="block w-full text-left"
        >
          <div className="flex h-56 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 p-5">
            <ProductImage
              product={product}
              className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
            />
          </div>

          <div className="p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="truncate text-[10px] font-extrabold uppercase tracking-[0.12em] text-blue-600">
                {product?.category || "Product"}
              </span>

              {product?.stockAvailable === true && (
                <span className="shrink-0 text-[10px] font-semibold text-emerald-600">
                  {product?.stock || 0} left
                </span>
              )}
            </div>

            <h3 className="line-clamp-2 min-h-[42px] text-sm font-bold leading-5 text-slate-800 transition group-hover:text-blue-600">
              {product?.title || "ShopKartX Product"}
            </h3>

            <p className="mt-1 truncate text-xs font-medium text-slate-400">
              {product?.brand || "ShopKartX"}
            </p>

            <div className="mt-3 flex min-h-[22px] items-center gap-2">
              {rating > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white">
                  {rating.toFixed(1)}
                  <Star size={10} fill="currentColor" />
                </span>
              ) : (
                <span className="text-[11px] font-medium text-slate-400">
                  New product
                </span>
              )}

              {ratingCount > 0 && (
                <span className="text-[11px] text-slate-400">
                  ({ratingCount.toLocaleString("en-IN")})
                </span>
              )}
            </div>

            <div className="mt-3 flex min-h-[34px] items-center gap-2">
              {priceAvailable ? (
                <>
                  <span className="text-xl font-black tracking-tight text-slate-950">
                    {product?.currency === "USD" ? "$" : "₹"}
                    {money(price)}
                  </span>

                  {originalPrice > price && (
                    <span className="text-xs font-medium text-slate-400 line-through">
                      ₹{money(originalPrice)}
                    </span>
                  )}
                </>
              ) : (
                <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-500">
                  Price unavailable
                </span>
              )}
            </div>
          </div>
        </button>
      </div>

      <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={() => onAddToCart(product)}
          className="flex items-center justify-center gap-2 rounded-xl border border-blue-600 px-2 py-2.5 text-xs font-extrabold text-blue-600 transition hover:bg-blue-600 hover:text-white"
        >
          <ShoppingCart size={15} />
          Add to Cart
        </button>

        <button
          type="button"
          onClick={() => onOpenProduct(product)}
          className="flex items-center justify-center rounded-xl bg-slate-950 px-3 py-2.5 text-xs font-extrabold text-white transition hover:bg-blue-600"
        >
          View
        </button>
      </div>
    </article>
  );
}

function CategoryRail({
  categories,
  products,
  selectedCategory,
  onSelectCategory,
}) {
  const categoryList = [
    "All",
    ...categories,
  ];

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-[1440px] px-4 py-4 lg:px-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          {categoryList.map((category) => {
            const Icon =
              category === "All"
                ? Grid2X2
                : CATEGORY_ICONS[category] || Package;

            const active =
              selectedCategory === category;

            const count =
              category === "All"
                ? products.length
                : products.filter(
                    (product) =>
                      String(product?.category || "")
                        .toLowerCase() ===
                      String(category).toLowerCase(),
                  ).length;

            return (
              <button
                type="button"
                key={category}
                onClick={() =>
                  onSelectCategory(category)
                }
                className={`group flex min-w-[108px] shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-left transition ${
                  active
                    ? "border-slate-950 bg-slate-950 text-white shadow-lg"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <Icon size={19} />

                <span className="min-w-0">
                  <span className="block text-xs font-extrabold">
                    {category}
                  </span>

                  <span
                    className={`block text-[9px] ${
                      active
                        ? "text-slate-300"
                        : "text-slate-400"
                    }`}
                  >
                    {count} products
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HeroSection({
  products,
  categories,
  onShop,
}) {
  const heroProducts = products
    .filter(
      (product) =>
        product?.thumbnail ||
        product?.images?.[0] ||
        product?.image,
    )
    .slice(0, 3);

  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/30 blur-3xl" />
      <div className="absolute -bottom-40 right-0 h-[30rem] w-[30rem] rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-[1440px] gap-10 px-5 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-16">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-blue-200 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            SHOPKARTX • SMART SHOPPING
          </div>

          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl lg:text-7xl">
            Shopping made
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
              simple & modern.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Explore the ShopKartX catalog with a clean,
            fast and modern shopping experience built for
            everyday products.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onShop}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-slate-950 shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Explore Products
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              onClick={onShop}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
            >
              <Grid2X2 size={17} />
              Browse Categories
            </button>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-2xl font-black text-white">
                {products.length.toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Real products
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-2xl font-black text-white">
                {categories.length}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Categories
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-2xl font-black text-white">
                {products.filter(
                  (product) =>
                    product?.thumbnail ||
                    product?.images?.[0] ||
                    product?.image,
                ).length}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                With images
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-2xl font-black text-emerald-300">
                Live
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Catalog
              </p>
            </div>
          </div>
        </div>

        <div className="relative hidden min-h-[430px] items-center justify-center lg:flex">
          <div className="absolute h-[330px] w-[330px] rounded-full border border-white/10 bg-white/[0.03]" />
          <div className="absolute h-[260px] w-[260px] rounded-full border border-white/10 bg-white/[0.03]" />

          {heroProducts.length > 0 ? (
            <>
              <div className="absolute left-4 top-8 z-20 w-48 rotate-[-8deg] rounded-3xl border border-white/10 bg-white p-4 shadow-2xl">
                <div className="flex h-44 items-center justify-center rounded-2xl bg-slate-100">
                  <ProductImage
                    product={heroProducts[0]}
                    className="h-full w-full object-contain"
                  />
                </div>

                <p className="mt-3 truncate text-xs font-black text-slate-800">
                  {heroProducts[0]?.title}
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  {heroProducts[0]?.category}
                </p>
              </div>

              <div className="relative z-30 w-56 rounded-[2rem] border border-white/10 bg-white p-4 shadow-2xl">
                <div className="flex h-56 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-slate-100">
                  <ProductImage
                    product={
                      heroProducts[1] ||
                      heroProducts[0]
                    }
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-900">
                      Featured
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      ShopKartX collection
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-7 right-3 z-20 w-48 rotate-[7deg] rounded-3xl border border-white/10 bg-white p-4 shadow-2xl">
                <div className="flex h-44 items-center justify-center rounded-2xl bg-slate-100">
                  <ProductImage
                    product={
                      heroProducts[2] ||
                      heroProducts[0]
                    }
                    className="h-full w-full object-contain"
                  />
                </div>

                <p className="mt-3 truncate text-xs font-black text-slate-800">
                  {(
                    heroProducts[2] ||
                    heroProducts[0]
                  )?.title}
                </p>
              </div>
            </>
          ) : (
            <div className="relative z-20 rounded-[2rem] border border-white/10 bg-white/5 p-14 text-center backdrop-blur">
              <Package
                size={90}
                strokeWidth={1}
                className="mx-auto text-slate-500"
              />

              <p className="mt-5 text-lg font-black text-white">
                ShopKartX Catalog
              </p>
            </div>
          )}

          <div className="absolute right-0 top-12 z-40 flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 shadow-xl backdrop-blur">
            <Flame
              size={18}
              className="text-orange-400"
            />
            <span className="text-xs font-bold text-white">
              Fresh catalog
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Secure Shopping",
      text: "Protected shopping experience",
    },
    {
      icon: CreditCard,
      title: "Payment Ready",
      text: "Checkout integration ready",
    },
    {
      icon: Truck,
      title: "Order Experience",
      text: "Built for smooth delivery flow",
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      text: "Return workflow ready",
    },
  ];

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 last:border-0 sm:px-6 lg:border-b-0 lg:border-r lg:last:border-r-0"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon size={21} />
              </div>

              <div>
                <p className="text-xs font-black text-slate-800 sm:text-sm">
                  {item.title}
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400 sm:text-xs">
                  {item.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CategoryShowcase({
  categories,
  products,
  onSelectCategory,
}) {
  if (!categories.length) {
    return null;
  }

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-8 lg:px-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-600">
            Explore
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Shop by category
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Browse the catalog your way.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSelectCategory("All")}
          className="hidden items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 sm:flex"
        >
          View all
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {categories.map((category) => {
          const Icon =
            CATEGORY_ICONS[category] || Package;

          const count = products.filter(
            (product) =>
              String(product?.category || "")
                .toLowerCase() ===
              String(category).toLowerCase(),
          ).length;

          return (
            <button
              type="button"
              key={category}
              onClick={() =>
                onSelectCategory(category)
              }
              className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-blue-600 group-hover:text-white">
                <Icon size={22} />
              </div>

              <p className="mt-4 truncate text-sm font-black text-slate-800">
                {category}
              </p>

              <p className="mt-1 truncate text-[10px] leading-4 text-slate-400">
                {CATEGORY_DESCRIPTIONS[category] ||
                  "Explore products"}
              </p>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">
                  {count} items
                </span>

                <ChevronRight
                  size={14}
                  className="text-slate-300 transition group-hover:text-blue-600"
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CartDrawer({
  cart,
  onClose,
  onIncrease,
  onDecrease,
  onRemove,
  onCheckout,
}) {
  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.product?.price || 0) *
        Number(item.quantity || 0),
    0,
  );

  const hasUnavailablePrice = cart.some(
    (item) =>
      Number(item.product?.price || 0) <= 0,
  );

  const cartCount = cart.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0,
  );

  return (
    <div
      className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <aside
        className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingCart
                size={20}
                className="text-blue-600"
              />

              <h2 className="text-xl font-black text-slate-950">
                Your Cart
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-400">
              {cartCount} item
              {cartCount !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          >
            <X size={19} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-8 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm">
                <ShoppingCart
                  size={42}
                  className="text-slate-300"
                />
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900">
                Your cart is empty
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Add products from the catalog and they
                will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => {
                const product = item.product;

                const price = Number(
                  product?.price || 0,
                );

                return (
                  <div
                    key={product.id}
                    className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <div className="flex gap-3">
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-slate-50 p-2">
                        <ProductImage
                          product={product}
                          className="h-full w-full object-contain"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-bold leading-5 text-slate-800">
                          {product.title}
                        </p>

                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-blue-600">
                          {product.category ||
                            "Product"}
                        </p>

                        {price > 0 ? (
                          <p className="mt-1 text-sm font-black text-slate-950">
                            {product.currency ===
                            "USD"
                              ? "$"
                              : "₹"}
                            {money(price)}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs font-semibold text-slate-400">
                            Price unavailable
                          </p>
                        )}

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onDecrease(
                                product.id,
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                          >
                            <Minus size={13} />
                          </button>

                          <span className="min-w-5 text-center text-xs font-black">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              onIncrease(
                                product.id,
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                          >
                            <Plus size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onRemove(
                                product.id,
                              )
                            }
                            className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-slate-200 bg-white p-5">
            {hasUnavailablePrice && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                Some products do not have valid pricing. Please
                remove them before checkout.
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">
                Subtotal
              </span>

              <span className="text-2xl font-black text-slate-950">
                {subtotal > 0
                  ? `₹${money(subtotal)}`
                  : "—"}
              </span>
            </div>

            <button
              type="button"
              disabled={
                hasUnavailablePrice ||
                subtotal <= 0
              }
              onClick={onCheckout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Proceed to Checkout
              <ArrowRight size={17} />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

function CheckoutPage({
  cart,
  onBack,
  onOrderSuccess,
}) {
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: "",
    city: "",
    state: "",
    postal_code: "",
  });

  const [paymentMethod, setPaymentMethod] =
    useState("COD");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [orderResult, setOrderResult] =
    useState(null);

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.product?.price || 0) *
        Number(item.quantity || 0),
    0,
  );

  const shippingFee = 0;
  const discount = 0;
  const total = subtotal + shippingFee - discount;

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function createOrderNumber() {
    const timestamp = Date.now()
      .toString()
      .slice(-8);

    const random = Math.floor(
      100 + Math.random() * 900,
    );

    return `SKX-${timestamp}-${random}`;
  }

  async function submitOrder(event) {
    event.preventDefault();

    setError("");

    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }

    if (paymentMethod === "RAZORPAY") {
      setError(
        "Razorpay Test Mode is not configured yet. Please select Cash on Delivery for now.",
      );
      return;
    }

    if (
      !form.customer_name.trim() ||
      !form.customer_email.trim() ||
      !form.customer_phone.trim() ||
      !form.shipping_address.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.postal_code.trim()
    ) {
      setError(
        "Please fill all required customer and delivery details.",
      );
      return;
    }

    if (subtotal <= 0) {
      setError(
        "Cart total must be greater than zero.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const orderNumber =
        createOrderNumber();

      const payload = {
        order_number: orderNumber,
        customer_name:
          form.customer_name.trim(),
        customer_email:
          form.customer_email.trim(),
        customer_phone:
          form.customer_phone.trim(),
        subtotal: Number(subtotal.toFixed(2)),
        shipping_fee: shippingFee,
        discount,
        total_amount: Number(total.toFixed(2)),
        payment_method: paymentMethod,
        payment_status: "PENDING",
        order_status: "PENDING",
        shipping_address:
          form.shipping_address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        postal_code:
          form.postal_code.trim(),
        country: "India",
        notes:
          "Order created from ShopKartX frontend checkout.",
        items: cart.map((item) => ({
          product_id: item.product?.id || null,
          product_name:
            item.product?.title ||
            "ShopKartX Product",
          quantity: Number(item.quantity || 1),
          unit_price: Number(
            item.product?.price || 0,
          ),
          total_price: Number(
            (
              Number(item.product?.price || 0) *
              Number(item.quantity || 0)
            ).toFixed(2),
          ),
        })),
      };

      const response = await fetch(
        `${API_BASE_URL}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            "Order create nahi ho paaya.",
        );
      }

      setOrderResult(data.data);

      if (onOrderSuccess) {
        onOrderSuccess(data.data);
      }
    } catch (submitError) {
      console.error(
        "Checkout error:",
        submitError,
      );

      setError(
        submitError?.message ||
          "Order create karte waqt problem aa gayi.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (orderResult) {
    return (
      <div className="min-h-screen bg-[#f5f7fb]">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-12">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2
                size={46}
                className="text-emerald-600"
              />
            </div>

            <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-600">
              Order Confirmed
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Thank you for your order!
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Your ShopKartX order has been successfully
              created. We have recorded your delivery and
              payment details.
            </p>

            <div className="mx-auto mt-8 max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-slate-400">
                  Order Number
                </span>

                <span className="text-sm font-black text-slate-950">
                  {orderResult.order_number}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-slate-400">
                  Payment
                </span>

                <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black text-amber-700">
                  Cash on Delivery
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-slate-400">
                  Total
                </span>

                <span className="text-lg font-black text-slate-950">
                  ₹{money(orderResult.total_amount)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onBack}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-black text-white transition hover:bg-blue-600"
            >
              <ShoppingCart size={17} />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 lg:px-6">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 transition hover:bg-white/10"
          >
            <ChevronRight
              size={20}
              className="rotate-180"
            />
          </button>

          <div>
            <div className="text-xl font-black">
              ShopKart
              <span className="text-blue-400">
                X
              </span>
            </div>

            <p className="text-[9px] font-medium text-slate-400">
              Secure Checkout
            </p>
          </div>

          <div className="ml-auto hidden items-center gap-2 text-xs font-bold text-slate-400 sm:flex">
            <LockKeyhole size={14} />
            Secure checkout
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 py-8 lg:px-6 lg:py-12">
        <div className="mb-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-600">
            Checkout
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Complete your order
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Enter your delivery details and choose a
            payment method.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <X
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={submitOrder}
          className="grid gap-6 lg:grid-cols-[1fr_390px]"
        >
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <User size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    Customer Details
                  </h2>

                  <p className="text-xs text-slate-400">
                    Enter your contact information
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-extrabold text-slate-700">
                    Full Name *
                  </span>

                  <input
                    name="customer_name"
                    value={form.customer_name}
                    onChange={updateField}
                    placeholder="Enter full name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-extrabold text-slate-700">
                    Email *
                  </span>

                  <input
                    type="email"
                    name="customer_email"
                    value={form.customer_email}
                    onChange={updateField}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-xs font-extrabold text-slate-700">
                    Phone *
                  </span>

                  <input
                    type="tel"
                    name="customer_phone"
                    value={form.customer_phone}
                    onChange={updateField}
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <MapPin size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    Delivery Address
                  </h2>

                  <p className="text-xs text-slate-400">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-extrabold text-slate-700">
                    Full Address *
                  </span>

                  <textarea
                    name="shipping_address"
                    value={form.shipping_address}
                    onChange={updateField}
                    rows={4}
                    placeholder="House / Flat / Street / Locality"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block">
                    <span className="mb-2 block text-xs font-extrabold text-slate-700">
                      City *
                    </span>

                    <input
                      name="city"
                      value={form.city}
                      onChange={updateField}
                      placeholder="City"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-extrabold text-slate-700">
                      State *
                    </span>

                    <input
                      name="state"
                      value={form.state}
                      onChange={updateField}
                      placeholder="State"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-extrabold text-slate-700">
                      PIN Code *
                    </span>

                    <input
                      name="postal_code"
                      value={form.postal_code}
                      onChange={updateField}
                      placeholder="121001"
                      inputMode="numeric"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white"
                    />
                  </label>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <WalletCards size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    Payment Method
                  </h2>

                  <p className="text-xs text-slate-400">
                    Select how you want to pay
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod("COD")
                  }
                  className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    paymentMethod === "COD"
                      ? "border-slate-950 bg-slate-950 text-white shadow-lg"
                      : "border-slate-200 bg-white text-slate-800 hover:border-blue-300"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      paymentMethod === "COD"
                        ? "bg-white/10"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    <CreditCard size={21} />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-black">
                      Cash on Delivery
                    </p>

                    <p
                      className={`mt-1 text-xs ${
                        paymentMethod === "COD"
                          ? "text-slate-400"
                          : "text-slate-400"
                      }`}
                    >
                      Pay when your order arrives
                    </p>
                  </div>

                  {paymentMethod === "COD" && (
                    <CheckCircle2
                      size={20}
                      className="text-blue-400"
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod("RAZORPAY")
                  }
                  className={`relative flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    paymentMethod === "RAZORPAY"
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-blue-300"
                  }`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Smartphone size={21} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-900">
                        Razorpay
                      </p>

                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-amber-700">
                        Setup pending
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      UPI, cards & online payment
                    </p>
                  </div>

                  {paymentMethod === "RAZORPAY" && (
                    <CheckCircle2
                      size={20}
                      className="text-blue-600"
                    />
                  )}
                </button>
              </div>

              {paymentMethod === "RAZORPAY" && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex gap-3">
                    <LockKeyhole
                      size={18}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />

                    <p className="text-xs leading-5 text-amber-700">
                      Razorpay Test API credentials are not
                      configured yet. Add valid Test Mode keys
                      later to enable online payment.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="h-fit lg:sticky lg:top-24">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-950">
                  Order Summary
                </h2>

                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-600">
                  {cart.length} product
                  {cart.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="mt-5 max-h-72 space-y-3 overflow-y-auto pr-1">
                {cart.map((item) => {
                  const product = item.product;

                  const itemTotal =
                    Number(product?.price || 0) *
                    Number(item.quantity || 0);

                  return (
                    <div
                      key={product.id}
                      className="flex gap-3"
                    >
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-50 p-2">
                        <ProductImage
                          product={product}
                          className="h-full w-full object-contain"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-xs font-bold leading-4 text-slate-800">
                          {product?.title}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="shrink-0 text-xs font-black text-slate-900">
                        ₹{money(itemTotal)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="my-5 border-t border-dashed border-slate-200" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-bold text-slate-800">
                    ₹{money(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Shipping
                  </span>

                  <span className="font-bold text-emerald-600">
                    FREE
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Discount
                  </span>

                  <span className="font-bold text-slate-800">
                    ₹{money(discount)}
                  </span>
                </div>
              </div>

              <div className="my-5 border-t border-slate-200" />

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Total Amount
                  </p>

                  <p className="mt-1 text-2xl font-black text-slate-950">
                    ₹{money(total)}
                  </p>
                </div>

                <BadgeCheck
                  size={25}
                  className="text-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={
                  submitting ||
                  paymentMethod === "RAZORPAY"
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Creating Order...
                  </>
                ) : (
                  <>
                    Place Order
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-400">
                <ShieldCheck size={14} />
                Your checkout data is protected
              </div>
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
}

function EmptyCatalog({
  selectedCategory,
  search,
  onReset,
}) {
  const categoryMode =
    selectedCategory !== "All" &&
    !search;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
        {categoryMode ? (
          <Package
            size={38}
            className="text-slate-300"
          />
        ) : (
          <SearchX
            size={38}
            className="text-slate-300"
          />
        )}
      </div>

      <h3 className="mt-5 text-xl font-black text-slate-900">
        {categoryMode
          ? `${selectedCategory} catalog is coming soon`
          : "No products found"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {categoryMode
          ? "This category is available in the ShopKartX interface, but products have not been connected to the catalog yet."
          : "Try another search term or reset the filters to explore the available catalog."}
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-600"
      >
        Explore Available Products
      </button>
    </div>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");
  const [sort, setSort] = useState("relevance");
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] =
    useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [
          productData,
          categoryData,
        ] = await Promise.all([
          fetchProducts(),
          Promise.resolve(getCategories()),
        ]);

        if (!mounted) {
          return;
        }

        setProducts(
          Array.isArray(productData)
            ? productData
            : [],
        );

        setCategories(
          Array.isArray(categoryData)
            ? categoryData
            : [],
        );
      } catch (loadError) {
        console.error(loadError);

        if (mounted) {
          setError(
            "Products load nahi ho pa rahe hain.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = products.filter((product) => {
      const category =
        String(product?.category || "").toLowerCase();

      const matchesCategory =
        selectedCategory === "All" ||
        category ===
          selectedCategory.toLowerCase();

      if (!matchesCategory) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchable = [
        product?.title,
        product?.name,
        product?.description,
        product?.brand,
        product?.category,
        product?.subcategory,
        product?.colour,
        product?.searchText,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });

    result = [...result];

    if (sort === "price-low") {
      result.sort(
        (a, b) =>
          Number(a?.price || 0) -
          Number(b?.price || 0),
      );
    }

    if (sort === "price-high") {
      result.sort(
        (a, b) =>
          Number(b?.price || 0) -
          Number(a?.price || 0),
      );
    }

    if (sort === "rating") {
      result.sort(
        (a, b) =>
          Number(b?.rating || 0) -
          Number(a?.rating || 0),
      );
    }

    if (sort === "discount") {
      result.sort(
        (a, b) =>
          Number(
            b?.discountPercentage || 0,
          ) -
          Number(
            a?.discountPercentage || 0,
          ),
      );
    }

    return result;
  }, [
    products,
    search,
    selectedCategory,
    sort,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length / PAGE_SIZE,
    ),
  );

  const visibleProducts =
    filteredProducts.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE,
    );

  useEffect(() => {
    setPage(1);
  }, [
    search,
    selectedCategory,
    sort,
  ]);

  function addToCart(product, quantity = 1) {
    if (!product?.id) {
      return;
    }

    const amount = Math.max(
      1,
      Number(quantity) || 1,
    );

    setCart((current) => {
      const existing = current.find(
        (item) =>
          String(item.product.id) ===
          String(product.id),
      );

      if (existing) {
        return current.map((item) =>
          String(item.product.id) ===
          String(product.id)
            ? {
                ...item,
                quantity:
                  item.quantity + amount,
              }
            : item,
        );
      }

      return [
        ...current,
        {
          product,
          quantity: amount,
        },
      ];
    });

    setCartOpen(true);
  }

  function increaseQuantity(id) {
    setCart((current) =>
      current.map((item) =>
        String(item.product.id) === String(id)
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  }

  function decreaseQuantity(id) {
    setCart((current) =>
      current
        .map((item) =>
          String(item.product.id) === String(id)
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeFromCart(id) {
    setCart((current) =>
      current.filter(
        (item) =>
          String(item.product.id) !==
          String(id),
      ),
    );
  }

  function toggleWishlist(product) {
    if (!product?.id) {
      return;
    }

    setWishlist((current) =>
      current.includes(product.id)
        ? current.filter(
            (id) => id !== product.id,
          )
        : [...current, product.id],
    );
  }

  const cartCount = cart.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0,
  );

  function selectCategory(category) {
    setSelectedCategory(category);
    setMobileMenuOpen(false);
    setSelectedProduct(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function openProduct(product) {
    setSelectedProduct(product);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeProduct() {
    setSelectedProduct(null);
  }

  function shopNow() {
    document
      .getElementById("products")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }

  function resetFilters() {
    setSearch("");
    setSelectedCategory("All");
    setSort("relevance");
  }

  function openCheckout() {
    if (!cart.length) {
      return;
    }

    setCartOpen(false);
    setCheckoutOpen(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeCheckout() {
    setCheckoutOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleOrderSuccess() {
    setCart([]);
  }

  if (checkoutOpen) {
    return (
      <CheckoutPage
        cart={cart}
        onBack={closeCheckout}
        onOrderSuccess={handleOrderSuccess}
      />
    );
  }

  if (selectedProduct) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950 text-white">
          <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 lg:px-6">
            <button
              type="button"
              onClick={closeProduct}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 transition hover:bg-white/10"
            >
              <ChevronRight
                size={20}
                className="rotate-180"
              />
            </button>

            <button
              type="button"
              onClick={() => {
                closeProduct();
                selectCategory("All");
              }}
              className="text-left"
            >
              <div className="text-xl font-black tracking-tight">
                ShopKart
                <span className="text-blue-400">
                  X
                </span>
              </div>

              <div className="hidden text-[9px] font-medium text-slate-400 sm:block">
                Smart shopping experience
              </div>
            </button>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setCartOpen(true)
                }
                className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 transition hover:bg-white/10"
              >
                <ShoppingCart size={20} />

                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-black">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        <ProductDetails
          product={selectedProduct}
          onBack={closeProduct}
          onAddToCart={addToCart}
        />

        {cartOpen && (
          <CartDrawer
            cart={cart}
            onClose={() => setCartOpen(false)}
            onIncrease={increaseQuantity}
            onDecrease={decreaseQuantity}
            onRemove={removeFromCart}
            onCheckout={openCheckout}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <header className="sticky top-0 z-50">
        <div className="border-b border-white/10 bg-slate-950 text-white">
          <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 lg:px-6">
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(
                  (value) => !value,
                )
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 transition hover:bg-white/10 md:hidden"
            >
              {mobileMenuOpen ? (
                <X size={21} />
              ) : (
                <Menu size={21} />
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                selectCategory("All")
              }
              className="shrink-0 text-left"
            >
              <div className="text-xl font-black tracking-tight sm:text-2xl">
                ShopKart
                <span className="text-blue-400">
                  X
                </span>
              </div>

              <div className="hidden text-[9px] font-medium text-slate-400 sm:block">
                Smart shopping experience
              </div>
            </button>

            <div className="hidden items-center gap-2 text-xs text-slate-400 lg:flex">
              <MapPin size={15} />
              <span>Deliver across India</span>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                shopNow();
              }}
              className="flex min-w-0 flex-1"
            >
              <div className="flex w-full overflow-hidden rounded-xl border border-white/10 bg-white shadow-lg focus-within:border-blue-400">
                <div className="hidden items-center pl-3 text-slate-400 sm:flex">
                  <Search size={17} />
                </div>

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search products, brands & categories..."
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />

                <button
                  type="submit"
                  className="flex w-12 shrink-0 items-center justify-center bg-blue-600 text-white transition hover:bg-blue-500"
                >
                  <Search size={19} />
                </button>
              </div>
            </form>

            <button
              type="button"
              className="hidden items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-white/10 sm:flex"
            >
              <User size={20} />

              <div className="text-left">
                <p className="text-[9px] text-slate-400">
                  Hello, Sign in
                </p>

                <p className="text-xs font-black">
                  Account
                </p>
              </div>

              <ChevronDown size={13} />
            </button>

            <button
              type="button"
              onClick={() =>
                setCartOpen(true)
              }
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 transition hover:bg-white/10"
              aria-label="Open cart"
            >
              <ShoppingCart size={21} />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-black">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <nav className="hidden border-b border-slate-200 bg-white md:block">
          <div className="mx-auto flex max-w-[1440px] items-center gap-7 overflow-x-auto px-4 py-3 lg:px-6">
            <button
              type="button"
              onClick={() =>
                selectCategory("All")
              }
              className={`whitespace-nowrap text-xs font-extrabold ${
                selectedCategory === "All"
                  ? "text-blue-600"
                  : "text-slate-600 hover:text-blue-600"
              }`}
            >
              All Products
            </button>

            {categories.map((category) => (
              <button
                type="button"
                key={category}
                onClick={() =>
                  selectCategory(category)
                }
                className={`whitespace-nowrap text-xs font-extrabold ${
                  selectedCategory === category
                    ? "text-blue-600"
                    : "text-slate-600 hover:text-blue-600"
                }`}
              >
                {category}
              </button>
            ))}

            <div className="ml-auto hidden shrink-0 items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700 lg:flex">
              <BadgeCheck size={13} />
              ShopKartX catalog
            </div>
          </div>
        </nav>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 md:hidden">
          <div className="p-5">
            <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
              Browse ShopKartX
            </p>

            <button
              type="button"
              onClick={() =>
                selectCategory("All")
              }
              className="mb-2 flex w-full items-center gap-3 rounded-xl bg-slate-950 px-4 py-3.5 text-left text-sm font-bold text-white"
            >
              <Grid2X2 size={18} />
              All Products
            </button>

            {categories.map((category) => {
              const Icon =
                CATEGORY_ICONS[category] ||
                Package;

              return (
                <button
                  type="button"
                  key={category}
                  onClick={() =>
                    selectCategory(category)
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  <Icon size={18} />
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <main>
        <HeroSection
          products={products}
          categories={categories}
          onShop={shopNow}
        />

        <CategoryRail
          categories={categories}
          products={products}
          selectedCategory={selectedCategory}
          onSelectCategory={selectCategory}
        />

        <TrustStrip />

        <CategoryShowcase
          categories={categories}
          products={products}
          onSelectCategory={selectCategory}
        />

        <section
          id="products"
          className="mx-auto max-w-[1440px] px-4 pb-12 pt-4 lg:px-6"
        >
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-600" />

                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-600">
                  {selectedCategory === "All"
                    ? "Shop everything"
                    : selectedCategory}
                </p>
              </div>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                {search
                  ? `Results for "${search}"`
                  : selectedCategory === "All"
                    ? "Featured Products"
                    : `${selectedCategory} Products`}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {filteredProducts.length.toLocaleString(
                  "en-IN",
                )}{" "}
                products in this view
              </p>
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal
                size={17}
                className="text-slate-400"
              />

              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value)
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="relevance">
                  Sort: Relevance
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

                <option value="rating">
                  Rating
                </option>

                <option value="discount">
                  Discount
                </option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
              {Array.from({ length: 12 }).map(
                (_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                  >
                    <div className="h-56 animate-pulse bg-slate-200" />

                    <div className="space-y-3 p-4">
                      <div className="h-2.5 w-1/3 animate-pulse rounded bg-slate-200" />

                      <div className="h-9 animate-pulse rounded bg-slate-200" />

                      <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />

                      <div className="h-6 w-1/2 animate-pulse rounded bg-slate-200" />
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <X className="text-red-600" />
              </div>

              <p className="mt-4 font-black text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="mt-5 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white"
              >
                Retry
              </button>
            </div>
          ) : visibleProducts.length === 0 ? (
            <EmptyCatalog
              selectedCategory={selectedCategory}
              search={search}
              onReset={resetFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    onToggleWishlist={
                      toggleWishlist
                    }
                    isWishlisted={wishlist.includes(
                      product.id,
                    )}
                    onOpenProduct={openProduct}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(
                          1,
                          current - 1,
                        ),
                      )
                    }
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white">
                    {page} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={
                      page >= totalPages
                    }
                    onClick={() =>
                      setPage((current) =>
                        Math.min(
                          totalPages,
                          current + 1,
                        ),
                      )
                    }
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
          <div>
            <div className="text-2xl font-black">
              ShopKart
              <span className="text-blue-400">
                X
              </span>
            </div>

            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
              A modern ecommerce experience built
              around a clean product catalog,
              smooth navigation and scalable
              architecture.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-bold text-slate-300">
              <BadgeCheck
                size={13}
                className="text-emerald-400"
              />
              Production-ready UI
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black">
              Shop
            </h3>

            <div className="mt-4 space-y-3 text-xs text-slate-400">
              {categories
                .slice(0, 6)
                .map((category) => (
                  <button
                    type="button"
                    key={category}
                    onClick={() =>
                      selectCategory(category)
                    }
                    className="block transition hover:text-white"
                  >
                    {category}
                  </button>
                ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black">
              Customer Experience
            </h3>

            <div className="mt-4 space-y-3 text-xs text-slate-400">
              <p>Help Center</p>
              <p>Track Order</p>
              <p>Returns</p>
              <p>Shipping Information</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black">
              ShopKartX
            </h3>

            <div className="mt-4 space-y-3 text-xs text-slate-400">
              <p>About Us</p>
              <p>Careers</p>
              <p>Privacy Policy</p>
              <p>Terms & Conditions</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-4 py-5 text-center text-[10px] text-slate-500">
          © {new Date().getFullYear()} ShopKartX.
          Built for a modern ecommerce experience.
        </div>
      </footer>

      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onIncrease={increaseQuantity}
          onDecrease={decreaseQuantity}
          onRemove={removeFromCart}
          onCheckout={openCheckout}
        />
      )}
    </div>
  );
}

export default App;
