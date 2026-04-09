"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { Product } from "../types/product";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { useWishlist } from "@modules/wishlist/hooks/use-wishlist";
import { addDemoItem } from "@lib/util/cart-demo";
import { WishlistItem } from "@lib/util/wishlist";

type HomeQuickViewModalProps = {
  item: Product;
  isOpen: boolean;
  onClose: () => void;
};

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function HomeQuickViewModal({
  item,
  isOpen,
  onClose,
}: HomeQuickViewModalProps) {
  const { toggleItem, isInWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [isWishlisting, setIsWishlisting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isSaved = isInWishlist(`${item.id}:${item.variantId}`);

  const images = item.imgs?.previews?.length
    ? item.imgs.previews
    : item.imgs?.thumbnails?.length
    ? item.imgs.thumbnails
    : ["/images/placeholder.png"];

  useEffect(() => {
    setSelectedSize(null);
    setActiveImg(0);
    setAdded(false);
  }, [item.id]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Body lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAdding) return;
    setIsAdding(true);

    addDemoItem({
      id: item.id.toString(),
      variantId: item.variantId,
      title: item.title,
      handle: item.handle,
      thumbnail: item.imgs?.thumbnails[0] || null,
      price: item.discountedPrice || item.price,
    });

    setTimeout(() => {
      setIsAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }, 800);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisting(true);
    const wishlistItem: WishlistItem = {
      id: `${item.id}:${item.variantId}`,
      productId: item.id.toString(),
      variantId: item.variantId,
      handle: item.handle,
      title: item.title,
      thumbnail: item.imgs?.thumbnails[0] || null,
      price: `₹${item.discountedPrice}`,
      createdAt: new Date().toISOString(),
    };
    toggleItem(wishlistItem);
    setTimeout(() => setIsWishlisting(false), 600);
  };

  if (!isOpen || !mounted) return null;

  const discountPct =
    item.price > item.discountedPrice
      ? Math.round(((item.price - item.discountedPrice) / item.price) * 100)
      : 0;

  return createPortal(
    (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label={`Quick view: ${item.title}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div
        className="relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_32px_80px_-24px_rgba(28,39,76,0.45)] md:flex-row animate-qv-in"
        style={{ maxHeight: "90vh" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-dark shadow-sm transition-all hover:bg-dark hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 1L13 13M13 1L1 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* ── Left: Images ── */}
        <div className="flex flex-col bg-gray-50 md:w-[52%]">
          <div className="relative flex h-[300px] items-center justify-center overflow-hidden md:h-[440px]">
            <Image
              key={images[activeImg]}
              src={images[activeImg]}
              alt={item.title}
              fill
              className="object-contain p-8 transition-opacity duration-300"
            />

            {/* Prev/Next */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImg((i) => (i - 1 + images.length) % images.length)
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white"
                  aria-label="Previous image"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    setActiveImg((i) => (i + 1) % images.length)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white"
                  aria-label="Next image"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-4 pb-4 pt-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(idx)}
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    activeImg === idx
                      ? "border-blue shadow-sm"
                      : "border-transparent hover:border-gray-200"
                  }`}
                >
                  <Image
                    src={img}
                    alt=""
                    width={56}
                    height={56}
                    className="h-full w-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Details ── */}
        <div className="flex flex-col gap-5 overflow-y-auto p-6 md:w-[48%] md:p-8">
          {/* Ratings */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-xs text-gray-400">({item.reviews} reviews)</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold leading-tight text-dark">
            {item.title}
          </h2>

          {/* Pricing */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-blue">
              ₹{item.discountedPrice.toLocaleString()}
            </span>
            {item.price > item.discountedPrice && (
              <>
                <span className="text-base font-medium text-gray-400 line-through">
                  ₹{item.price.toLocaleString()}
                </span>
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-500">
                  {discountPct}% OFF
                </span>
              </>
            )}
          </div>

          {/* Size Selector */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-dark">Size</span>
              {selectedSize && (
                <span className="text-sm text-gray-400">· {selectedSize}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[48px] rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-150 focus:outline-none ${
                    selectedSize === size
                      ? "border-blue bg-blue text-white shadow-[0_4px_12px_rgba(60,80,224,0.3)]"
                      : "border-gray-200 bg-white text-dark hover:border-blue hover:text-blue"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart + Wishlist */}
          <div className="mt-auto flex items-center gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200 ${
                added
                  ? "bg-green-500 text-white"
                  : "bg-blue text-white hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-70"
              }`}
            >
              {isAdding ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Adding...
                </span>
              ) : added ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Added to Cart!
                </span>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-9H5.4M7 13L5.4 5M7 13l-2 9m0 0h14m-14 0a1 1 0 100 2 1 1 0 000-2zm14 0a1 1 0 100 2 1 1 0 000-2z" />
                  </svg>
                  Add to Cart
                </>
              )}
            </button>

            <button
              onClick={handleWishlist}
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-all ${
                isSaved
                  ? "border-red-200 bg-red-50 text-red-500"
                  : "border-gray-200 bg-white text-dark hover:border-blue hover:text-blue"
              }`}
              aria-label="Add to wishlist"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={isSaved ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isWishlisting ? "animate-ping" : ""}
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>
          </div>

          {/* View Full Details */}
          <LocalizedClientLink
            href={`/products/${item.handle}`}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-500 transition-all hover:border-blue hover:text-blue"
            onClick={onClose}
          >
            View Full Details
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M3 7h8M7 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </LocalizedClientLink>
        </div>
      </div>

      <style>{`
        @keyframes qv-in {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-qv-in {
          animation: qv-in 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
    </div>
    ),
    document.body
  );
}
