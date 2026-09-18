import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  Check,
  Package,
  MapPin,
  BadgeCheck,
} from "lucide-react";

export default function ProductDetails({
  product,
  onBack,
  onAddToCart,
}) {
  const images = useMemo(() => {
    const list = [
      product?.image,
      ...(Array.isArray(product?.images)
        ? product.images
        : []),
    ].filter(Boolean);

    return [...new Set(list)];
  }, [product]);

  const [activeImage, setActiveImage] = useState(
    images[0] || "",
  );

  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
            <Package
              size={36}
              className="text-slate-300"
            />
          </div>

          <h2 className="mt-5 text-2xl font-black text-slate-900">
            Product not found
          </h2>

          <button
            type="button"
            onClick={onBack}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-600"
          >
            <ArrowLeft size={18} />
            Back to products
          </button>
        </div>
      </div>
    );
  }

  const price = Number(product.price || 0);

  const priceAvailable =
    product.priceAvailable === true &&
    Number.isFinite(price) &&
    price > 0;

  const originalPrice = Number(
    product.originalPrice || 0,
  );

  const originalPriceAvailable =
    Number.isFinite(originalPrice) &&
    originalPrice > price &&
    priceAvailable;

  const discountFromProduct = Number(
    product.discountPercentage || 0,
  );

  const calculatedDiscount =
    originalPriceAvailable && originalPrice > 0
      ? Math.round(
          ((originalPrice - price) /
            originalPrice) *
            100,
        )
      : 0;

  const discount =
    discountFromProduct > 0
      ? discountFromProduct
      : calculatedDiscount;

  const rating = Number(product.rating || 0);

  const ratingCount = Number(
    product.ratingCount || 0,
  );

  const stockAvailable =
    product.stockAvailable === true;

  const stock = Number(product.stock || 0);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity);
    }

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  const increaseQuantity = () => {
    if (stockAvailable && stock > 0) {
      setQuantity((value) =>
        Math.min(value + 1, stock),
      );

      return;
    }

    setQuantity((value) => value + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((value) =>
      Math.max(1, value - 1),
    );
  };

  const totalPrice = priceAvailable
    ? price * quantity
    : 0;

  return (
    <main className="min-h-screen bg-[#f5f7fb] pb-16">
      <div className="mx-auto max-w-[1440px] px-4 pt-5 sm:px-6 lg:px-8">

        {/* Breadcrumb / Back */}
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to products
        </button>

        {/* Product */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1fr_0.95fr]">

            {/* =========================
                PRODUCT GALLERY
            ========================== */}
            <div className="border-b border-slate-200 p-4 sm:p-7 lg:border-b-0 lg:border-r lg:p-8">
              <div className="relative flex min-h-[430px] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-white to-slate-100 p-7 sm:min-h-[520px]">

                {discount > 0 && (
                  <span className="absolute left-5 top-5 z-10 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-black text-white shadow-sm">
                    {Math.round(discount)}% OFF
                  </span>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setLiked((value) => !value)
                  }
                  className={`absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border bg-white shadow-md transition hover:scale-105 ${
                    liked
                      ? "border-red-200 text-red-500"
                      : "border-slate-200 text-slate-500 hover:text-red-500"
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart
                    size={20}
                    fill={
                      liked
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>

                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={
                      product.title ||
                      "ShopKartX product"
                    }
                    className="max-h-[470px] w-full object-contain transition duration-500 hover:scale-105"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <Package
                      size={72}
                      strokeWidth={1.3}
                      className="text-slate-300"
                    />

                    <p className="mt-4 text-sm font-semibold text-slate-400">
                      No product image
                    </p>
                  </div>
                )}
              </div>

              {/* Thumbnail gallery */}
              {images.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                  {images.map((image, index) => (
                    <button
                      type="button"
                      key={`${image}-${index}`}
                      onClick={() =>
                        setActiveImage(image)
                      }
                      className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-50 p-1 transition ${
                        activeImage === image
                          ? "border-blue-600 shadow-sm"
                          : "border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.title || "Product"} image ${index + 1}`}
                        className="h-full w-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Product source information */}
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <BadgeCheck
                    size={19}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <div>
                    <p className="text-xs font-black text-slate-800">
                      ShopKartX Catalog Product
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      Product information is displayed from
                      the connected catalog.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =========================
                PRODUCT INFORMATION
            ========================== */}
            <div className="p-6 sm:p-8 lg:p-10">

              {/* Brand + category */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {product.brand && (
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                    {product.brand}
                  </span>
                )}

                {product.category && (
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                    {product.category}
                  </span>
                )}

                {product.subcategory && (
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
                    {product.subcategory}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl font-black leading-tight tracking-[-0.025em] text-slate-950 sm:text-4xl">
                {product.title}
              </h1>

              {/* Rating */}
              {rating > 0 ? (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-sm font-black text-white">
                    {rating.toFixed(1)}
                    <Star
                      size={14}
                      fill="currentColor"
                    />
                  </span>

                  {ratingCount > 0 && (
                    <span className="text-sm font-semibold text-slate-500">
                      {ratingCount.toLocaleString(
                        "en-IN",
                      )}{" "}
                      ratings
                    </span>
                  )}
                </div>
              ) : (
                <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500">
                  <Star size={14} />
                  New catalog product
                </div>
              )}

              <div className="my-7 h-px bg-slate-200" />

              {/* =========================
                  PRICE
              ========================== */}
              {priceAvailable ? (
                <div>
                  <div className="flex flex-wrap items-end gap-3">
                    <span className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                      ₹{price.toLocaleString("en-IN")}
                    </span>

                    {originalPriceAvailable && (
                      <span className="mb-1 text-base font-semibold text-slate-400 line-through">
                        ₹
                        {originalPrice.toLocaleString(
                          "en-IN",
                        )}
                      </span>
                    )}

                    {discount > 0 && (
                      <span className="mb-1 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-black text-emerald-700">
                        {Math.round(discount)}% OFF
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs font-semibold text-slate-400">
                    Price shown in Indian Rupees (INR)
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="font-black text-amber-800">
                    Price unavailable
                  </p>

                  <p className="mt-1 text-sm leading-5 text-amber-700">
                    Pricing information is not available
                    for this product yet.
                  </p>
                </div>
              )}

              {/* =========================
                  DESCRIPTION
              ========================== */}
              <div className="mt-8">
                <h2 className="text-lg font-black text-slate-950">
                  About this product
                </h2>

                <p className="mt-2 text-[15px] leading-7 text-slate-600">
                  {product.description ||
                    "Product information is currently unavailable."}
                </p>
              </div>

              {/* =========================
                  PRODUCT INFORMATION
              ========================== */}
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {product.colour && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Colour
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {product.colour}
                    </p>
                  </div>
                )}

                {product.department && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Department
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {product.department}
                    </p>
                  </div>
                )}
              </div>

              {/* =========================
                  DELIVERY FEATURES
              ========================== */}
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <Truck
                    size={20}
                    className="text-blue-600"
                  />

                  <p className="mt-2 text-sm font-black text-slate-800">
                    Fast Delivery
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Reliable delivery experience
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <ShieldCheck
                    size={20}
                    className="text-emerald-600"
                  />

                  <p className="mt-2 text-sm font-black text-slate-800">
                    Secure Purchase
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Protected checkout experience
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <RotateCcw
                    size={20}
                    className="text-orange-500"
                  />

                  <p className="mt-2 text-sm font-black text-slate-800">
                    Easy Returns
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Simple return workflow
                  </p>
                </div>
              </div>

              {/* =========================
                  DELIVERY LOCATION
              ========================== */}
              <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-black text-slate-800">
                      Delivery available across India
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      Enter your location during checkout
                      for delivery details.
                    </p>
                  </div>
                </div>
              </div>

              {/* =========================
                  QUANTITY + CART
              ========================== */}
              <div className="mt-8">
                <div className="flex flex-col gap-4 sm:flex-row">

                  {/* Quantity */}
                  <div className="flex h-13 w-fit items-center overflow-hidden rounded-xl border border-slate-300 bg-white">
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      className="flex h-full w-12 items-center justify-center text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={17} />
                    </button>

                    <span className="w-10 text-center text-sm font-black text-slate-900">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={increaseQuantity}
                      className="flex h-full w-12 items-center justify-center text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
                      aria-label="Increase quantity"
                    >
                      <Plus size={17} />
                    </button>
                  </div>

                  {/* Add to cart */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className={`flex min-h-13 flex-1 items-center justify-center gap-2 rounded-xl px-6 text-sm font-black text-white shadow-lg transition ${
                      added
                        ? "bg-emerald-600 shadow-emerald-100"
                        : "bg-slate-950 shadow-slate-200 hover:bg-blue-600"
                    }`}
                  >
                    {added ? (
                      <>
                        <Check size={19} />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={19} />
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>

                {/* Selected quantity total */}
                {priceAvailable && (
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <span className="text-xs font-semibold text-slate-500">
                      {quantity} item
                      {quantity !== 1 ? "s" : ""}
                    </span>

                    <span className="text-base font-black text-slate-950">
                      ₹
                      {totalPrice.toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Stock */}
              {stockAvailable && (
                <div className="mt-4">
                  {stock > 0 ? (
                    <p className="text-sm font-bold text-emerald-600">
                      ✓ {stock.toLocaleString("en-IN")}{" "}
                      items available
                    </p>
                  ) : (
                    <p className="text-sm font-bold text-red-600">
                      Out of stock
                    </p>
                  )}
                </div>
              )}

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
