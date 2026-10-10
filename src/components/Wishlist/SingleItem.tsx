"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { useStore } from "@/app/context/StoreContext";
import Image from "next/image";
import type { Product } from "@/types/product";

export default function SingleItem({ item }: { item: Product }) {
  const dispatch = useDispatch<AppDispatch>();
  const { addToBasket } = useStore();
  const [message, setMessage] = useState<string | null>(null);

  const productHref = item.slug
    ? `/products/${encodeURIComponent(item.slug)}`
    : "/shop-with-sidebar";

  const canDirectlyAdd =
    item.hasVariants !== true &&
    item.available !== false &&
    (item.stock === null || item.stock === undefined || item.stock > 0);

  async function handleAddToCart() {
    if (!canDirectlyAdd) {
      setMessage("Choose the product options first.");
      return;
    }

    try {
      await addToBasket(item.id, 1);
      setMessage("Added to cart.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to add to cart.");
    }
  }

  return (
    <div className="flex flex-col gap-5 border-t border-gray-3 px-5 py-5 sm:flex-row sm:items-center sm:px-10">
      <button
        type="button"
        onClick={() => dispatch(removeItemFromWishlist(item.id))}
        aria-label="Remove product from wishlist"
        className="flex h-9.5 w-9.5 items-center justify-center rounded-lg border border-gray-3 bg-gray-2 text-dark hover:border-red hover:text-red"
      >
        ×
      </button>

      <div className="flex flex-1 items-center gap-5">
        <Link
          href={productHref}
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-gray-2"
        >
          {item.imgs?.thumbnails?.[0] && (
            <Image
              src={item.imgs.thumbnails[0]}
              alt={item.title}
              width={80}
              height={80}
              className="h-full w-full object-contain"
            />
          )}
        </Link>

        <div>
          <Link href={productHref} className="font-medium text-dark hover:text-blue">
            {item.title}
          </Link>

          <p className="mt-1 text-gray-5">
            {item.discountedPrice} {item.currency ?? ""}
          </p>

          {!canDirectlyAdd && (
            <p className="mt-1 text-sm text-gray-5">Select options on the product page.</p>
          )}

          {message && <p className="mt-1 text-sm text-blue">{message}</p>}
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!canDirectlyAdd}
        className="rounded-md border border-gray-3 bg-gray-1 px-6 py-2.5 text-sm font-medium text-dark hover:border-blue hover:bg-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Add to Cart
      </button>
    </div>
  );
}
