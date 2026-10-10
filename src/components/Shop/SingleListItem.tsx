"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import { useStore } from "@/app/context/StoreContext";

export default function SingleListItem({ item }: { item: Product }) {
  const router = useRouter();
  const { addToBasket } = useStore();
  const [adding, setAdding] = React.useState(false);

  const image = item.imgs?.previews?.[0];
  const href = item.slug ? `/products/${encodeURIComponent(item.slug)}` : "/shop-with-sidebar";

  const handleCart = async () => {
    if (item.hasVariants) {
      router.push(href);
      return;
    }

    if (item.available === false || item.stock === 0) return;

    try {
      setAdding(true);
      await addToBasket(item.id, 1);
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="group rounded-lg bg-white shadow-1">
      <div className="flex flex-col sm:flex-row">
        <Link
          href={href}
          className="flex min-h-[270px] max-w-full items-center justify-center overflow-hidden bg-gray-1 p-4 sm:max-w-[270px] sm:w-full"
        >
          {image ? (
            <Image
              src={image}
              alt={item.title}
              width={250}
              height={250}
              className="h-[240px] w-[240px] object-contain transition duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="text-sm text-gray-4">No image</span>
          )}
        </Link>

        <div className="flex flex-1 flex-col justify-center p-6 lg:p-10">
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

          <h3 className="mb-2 text-lg font-medium text-dark hover:text-blue">
            <Link href={href}>{item.title}</Link>
          </h3>

          <div className="mb-5 flex items-center gap-2 text-lg font-medium">
            <span>
              {item.discountedPrice} {item.currency ?? ""}
            </span>
            {item.price !== item.discountedPrice && (
              <span className="text-dark-4 line-through">
                {item.price} {item.currency ?? ""}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={href}
              className="rounded-md border border-gray-3 px-5 py-2.5 font-medium text-dark hover:bg-gray-1"
            >
              View product
            </Link>
            <button
              type="button"
              onClick={handleCart}
              disabled={
                !item.hasVariants && (item.available === false || item.stock === 0 || adding)
              }
              className="rounded-md bg-blue px-5 py-2.5 font-medium text-white hover:bg-blue-dark disabled:cursor-not-allowed disabled:bg-gray-4"
            >
              {adding ? "Adding…" : item.hasVariants ? "Choose options" : "Add to cart"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
