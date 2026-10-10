"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import { useStore } from "@/app/context/StoreContext";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import toast from "react-hot-toast";

export default function ProductItem({ item }: { item: Product }) {
  const router = useRouter();
  const { addToBasket } = useStore();
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();

  const [adding, setAdding] = React.useState(false);
  const image = item.imgs?.previews?.[0];
  const href = item.slug ? `/products/${encodeURIComponent(item.slug)}` : "/shop-with-sidebar";

  const addToCart = async () => {
    if (item.hasVariants) {
      router.push(href);
      return;
    }

    if (item.available === false || item.stock === 0) return;

    try {
      setAdding(true);
      await addToBasket(item.id, 1);
    } catch (error) {
      // Keep the error visible to the user without exposing backend details.
      console.error("Unable to add product to basket:", error);
      toast.error(
        error instanceof Error ? error.message : "The product could not be added to your basket.",
      );
    } finally {
      setAdding(false);
    }
  };

  const wishlist = () => {
    dispatch(
      addItemToWishlist({
        ...item,
        status: "available",
        quantity: 1,
      }),
    );
  };

  return (
    <article className="group">
      <div className="relative mb-4 flex min-h-[270px] items-center justify-center overflow-hidden rounded-lg bg-white shadow-1">
        {image ? (
          <Link href={href} className="flex h-full w-full items-center justify-center">
            <Image
              src={image}
              alt={item.title}
              width={300}
              height={300}
              className="h-[250px] w-[250px] object-contain transition duration-300 group-hover:scale-105"
            />
          </Link>
        ) : (
          <Link
            href={href}
            className="flex min-h-[270px] w-full items-center justify-center text-sm text-gray-4"
          >
            No image
          </Link>
        )}

        <div className="absolute bottom-0 left-0 flex w-full translate-y-full items-center justify-center gap-2.5 pb-5 duration-200 group-hover:translate-y-0">
          <button
            onClick={() => {
              dispatch(updateQuickView({ ...item }));
              openModal();
            }}
            aria-label="Quick view"
            className="flex h-9 w-9 items-center justify-center rounded-[5px] bg-white text-dark shadow-1 hover:text-blue"
          >
            <span className="text-sm">↗</span>
          </button>

          <button
            type="button"
            onClick={addToCart}
            disabled={!item.hasVariants && (item.available === false || item.stock === 0 || adding)}
            className="rounded-[5px] bg-blue px-5 py-[7px] text-custom-sm font-medium text-white hover:bg-blue-dark disabled:cursor-not-allowed disabled:bg-gray-4"
          >
            {adding ? "Adding…" : item.hasVariants ? "Choose options" : "Add to cart"}
          </button>

          <button
            onClick={wishlist}
            aria-label="Add to wishlist"
            className="flex h-9 w-9 items-center justify-center rounded-[5px] bg-white text-dark shadow-1 hover:text-blue"
          >
            ♡
          </button>
        </div>
      </div>

      <div className="mb-2 flex items-center gap-2.5">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Image
              key={star}
              src="/images/icons/icon-star.svg"
              alt="star"
              width={15}
              height={15}
              className={!item.rating || star > Math.round(item.rating) ? "opacity-25" : ""}
            />
          ))}
        </div>
        <span className="text-custom-sm">
          {typeof item.rating === "number" && item.rating > 0
            ? item.rating.toFixed(1)
            : "No reviews"}
          {item.reviewCount ? ` (${item.reviewCount})` : ""}
        </span>
      </div>

      <h3 className="mb-1.5 font-medium text-dark hover:text-blue">
        <Link href={href}>{item.title}</Link>
      </h3>

      <div className="flex items-center gap-2 font-medium text-lg">
        <span className="text-dark">
          {item.discountedPrice} {item.currency ?? ""}
        </span>
        {item.price !== item.discountedPrice && (
          <span className="text-dark-4 line-through">
            {item.price} {item.currency ?? ""}
          </span>
        )}
      </div>
    </article>
  );
}
