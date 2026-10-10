"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Breadcrumb from "../Common/Breadcrumb";
import ProductItem from "../Common/ProductItem";
import { adaptOscarProduct, getProducts } from "@/lib/store-api";
import type { Product } from "@/types/product";

export default function ShopWithoutSidebar() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearch(params.get("search") ?? "");
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getProducts({ search, sort: "latest" });
        if (active) setProducts(response.results.map(adaptOscarProduct));
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load products.");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [search]);

  return (
    <>
      <Breadcrumb title="Shop" pages={["shop"]} />
      <section className="overflow-hidden bg-gray-2 py-12 lg:py-20">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-dark">All Products</h2>
              <p className="mt-1 text-sm text-gray-5">Browse the current Oscar catalogue.</p>
            </div>
            <Link
              href="/shop-with-sidebar"
              className="rounded-md border border-gray-3 bg-white px-5 py-2.5 font-medium text-dark hover:bg-gray-1"
            >
              Open filters
            </Link>
          </div>

          {error && (
            <div className="rounded-xl bg-white p-10 text-center text-red shadow-1">{error}</div>
          )}
          {!error && loading && (
            <div className="rounded-xl bg-white p-10 text-center text-gray-5 shadow-1">
              Loading products…
            </div>
          )}
          {!error && !loading && products.length === 0 && (
            <div className="rounded-xl bg-white p-10 text-center shadow-1">
              <p className="text-dark">No products found.</p>
              <Link href="/shop-with-sidebar" className="mt-4 inline-block text-blue">
                Open the catalogue
              </Link>
            </div>
          )}
          {!error && !loading && products.length > 0 && (
            <div className="grid grid-cols-1 gap-x-7.5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductItem item={product} key={product.id} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
