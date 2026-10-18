"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProducts, adaptOscarProduct } from "@/lib/store-api";
import type { Product } from "@/types/product";
import HeroFeature from "./HeroFeature";

/**
 * Homepage hero backed by the real Oscar catalogue.
 *
 * We deliberately do not invent discounts here. The card shows the current
 * backend price and links directly to the real product detail page.
 */
const Hero = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts({ sort: "priority", page: 1 })
      .then((response) => {
        setProducts(response.results.slice(0, 3).map(adaptOscarProduct));
      })
      .catch(() => setProducts([]));
  }, []);

  const featured = products[0];
  const secondary = products.slice(1, 3);

  return (
    <section className="overflow-hidden pb-10 lg:pb-12.5 xl:pb-15 pt-57.5 sm:pt-45 lg:pt-30 xl:pt-51.5 bg-[#E5EAF4]">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap gap-5">
          <div className="xl:max-w-[757px] w-full">
            <div className="relative z-1 rounded-[10px] bg-white overflow-hidden min-h-[420px]">
              {featured ? (
                <div className="flex h-full min-h-[420px] items-center justify-between gap-8 p-6 sm:p-10 lg:p-12">
                  <div className="max-w-[400px]">
                    <span className="mb-3 block font-medium text-custom-1 text-blue">
                      محصول ویژه
                    </span>
                    <h1 className="font-semibold text-dark text-2xl sm:text-4xl mb-4">
                      {featured.title}
                    </h1>
                    <p className="text-dark-4 line-clamp-4">
                      Discover this product and choose from the available variants on the product
                      page.
                    </p>
                    <div className="mt-7 flex items-center gap-4">
                      <span className="font-semibold text-heading-5 text-dark">
                        {featured.discountedPrice} {featured.currency ?? ""}
                      </span>
                      <Link
                        href={
                          featured.slug
                            ? `/products/${encodeURIComponent(featured.slug)}`
                            : "/shop-with-sidebar"
                        }
                        className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 hover:bg-blue"
                      >
                        مشاهده محصول
                      </Link>
                    </div>
                  </div>

                  <Link
                    href={
                      featured.slug
                        ? `/products/${encodeURIComponent(featured.slug)}`
                        : "/shop-with-sidebar"
                    }
                    className="hidden sm:flex h-[320px] w-[320px] items-center justify-center"
                  >
                    {featured.imgs?.previews?.[0] ? (
                      <Image
                        src={featured.imgs.previews[0]}
                        alt={featured.title}
                        width={320}
                        height={320}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-gray-4">بدون تصویر</span>
                    )}
                  </Link>
                </div>
              ) : (
                <div className="flex min-h-[420px] items-center justify-center p-8 text-center">
                  <div>
                    <h1 className="font-semibold text-dark text-3xl mb-3">خرید کفش و پوشاک</h1>
                    <p className="text-dark-4">
                      پس از انتشار محصولات در Oscar، فهرست محصولات اینجا نمایش داده می‌شود.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="xl:max-w-[393px] w-full">
            <div className="flex flex-col gap-5">
              {secondary.map((product) => (
                <Link
                  key={product.id}
                  href={
                    product.slug
                      ? `/products/${encodeURIComponent(product.slug)}`
                      : "/shop-with-sidebar"
                  }
                  className="w-full relative rounded-[10px] bg-white p-5 sm:p-7.5 flex items-center justify-between gap-6 min-h-[197px]"
                >
                  <div className="max-w-[200px]">
                    <span className="block text-sm text-dark-4 mb-1.5">ویژه</span>
                    <h2 className="font-semibold text-dark text-lg sm:text-xl">{product.title}</h2>
                    <span className="mt-4 inline-flex font-medium text-dark">
                      {product.discountedPrice} {product.currency ?? ""}
                    </span>
                  </div>

                  {product.imgs?.previews?.[0] ? (
                    <Image
                      src={product.imgs.previews[0]}
                      alt={product.title}
                      width={135}
                      height={135}
                      className="h-[135px] w-[135px] object-contain"
                    />
                  ) : (
                    <span className="text-sm text-gray-4">بدون تصویر</span>
                  )}
                </Link>
              ))}

              {secondary.length === 0 && (
                <div className="rounded-[10px] bg-white p-7.5 text-dark-4 min-h-[197px] flex items-center">
                  برای تکمیل این بخش، محصولات بیشتری را در پیشخوان Oscar منتشر کنید.
                </div>
              )}
            </div>
          </div>
        </div>

        <HeroFeature />
      </div>
    </section>
  );
};

export default Hero;
