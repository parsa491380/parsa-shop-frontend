"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SingleItem from "./SingleItem";
import { adaptOscarProduct, getProducts } from "@/lib/store-api";
import type { Product } from "@/types/product";

export default function BestSeller() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts({ sort: "priority", page: 1 })
      .then((response) => setProducts(response.results.slice(0, 6).map(adaptOscarProduct)))
      .catch(() => setProducts([]));
  }, []);

  return (
    <section className="overflow-hidden">
      <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="mb-1.5 flex items-center gap-2.5 font-medium text-dark">
              <Image src="/images/icons/icon-07.svg" alt="icon" width={17} height={17} />
              ویژه
            </span>
            <h2 className="font-semibold text-xl text-dark xl:text-heading-5">پرفروش‌ترین‌ها</h2>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((item) => (
              <SingleItem item={item} key={item.id} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-gray-1 p-10 text-center text-gray-5">
            برای نمایش محصولات ویژه، محصولات را در پیشخوان Oscar منتشر و اولویت‌بندی کنید.
          </div>
        )}

        <div className="mt-12.5 text-center">
          <Link
            href="/shop-without-sidebar"
            className="inline-flex rounded-md border border-gray-3 bg-gray-1 px-12.5 py-3 text-custom-sm font-medium text-dark hover:bg-dark hover:text-white"
          >
            مشاهده همه
          </Link>
        </div>
      </div>
    </section>
  );
}
