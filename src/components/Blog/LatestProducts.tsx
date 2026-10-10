"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { adaptOscarProduct, getProducts } from "@/lib/store-api";
import type { Product } from "@/types/product";

export default function LatestProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts({ sort: "latest", page: 1 })
      .then((response) => setProducts(response.results.slice(0, 3).map(adaptOscarProduct)))
      .catch(() => setProducts([]));
  }, []);

  return (
    <div className="mt-7.5 rounded-xl bg-white shadow-1">
      <div className="border-b border-gray-3 px-4 py-4.5 sm:px-6">
        <h2 className="text-lg font-medium text-dark">Latest Products</h2>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-6">
          {products.map((product) => {
            const href = product.slug
              ? `/products/${encodeURIComponent(product.slug)}`
              : "/shop-with-sidebar";

            return (
              <div className="flex items-center gap-6" key={product.id}>
                <Link
                  href={href}
                  className="flex h-22.5 w-full max-w-[90px] items-center justify-center rounded-[10px] bg-gray-3"
                >
                  {product.imgs?.thumbnails?.[0] && (
                    <Image
                      src={product.imgs.thumbnails[0]}
                      alt={product.title}
                      width={74}
                      height={74}
                      className="h-full w-full object-contain"
                    />
                  )}
                </Link>

                <div>
                  <h3 className="mb-1 font-medium text-dark hover:text-blue">
                    <Link href={href}>{product.title}</Link>
                  </h3>

                  <p className="text-custom-sm">
                    Price: {product.discountedPrice} {product.currency ?? ""}
                  </p>
                </div>
              </div>
            );
          })}

          {products.length === 0 && <p className="text-sm text-gray-5">No products available.</p>}
        </div>
      </div>
    </div>
  );
}
