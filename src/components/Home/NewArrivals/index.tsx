"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ProductItem from "@/components/Common/ProductItem";
import { adaptOscarProduct, getProducts } from "@/lib/store-api";
import type { Product } from "@/types/product";

export default function NewArrival() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts({ sort: "latest", page: 1 })
      .then((response) => setProducts(response.results.slice(0, 8).map(adaptOscarProduct)))
      .catch(() => setProducts([]));
  }, []);

  return (
    <section className="overflow-hidden pt-15">
      <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="mb-1.5 flex items-center gap-2.5 font-medium text-dark">
              <span className="text-blue">✦</span>
              Latest from the store
            </span>
            <h2 className="font-semibold text-xl text-dark xl:text-heading-5">New Arrivals</h2>
          </div>
          <Link
            href="/shop-with-sidebar"
            className="inline-flex rounded-md border border-gray-3 bg-gray-1 px-7 py-2.5 text-custom-sm font-medium text-dark hover:bg-dark hover:text-white"
          >
            View All
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-7.5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((item) => (
              <ProductItem item={item} key={item.id} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-gray-1 p-10 text-center text-gray-5">
            No products are currently available.
          </div>
        )}
      </div>
    </section>
  );
}
