"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import ProductItem from "@/components/Common/ProductItem";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { adaptOscarProduct, getProducts } from "@/lib/store-api";
import type { Product } from "@/types/product";

export default function RecentlyViewdItems() {
  const sliderRef = useRef<any>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts({ sort: "latest", page: 1 })
      .then((response) => setProducts(response.results.slice(0, 8).map(adaptOscarProduct)))
      .catch(() => setProducts([]));
  }, []);

  const handlePrev = useCallback(() => sliderRef.current?.swiper?.slidePrev(), []);
  const handleNext = useCallback(() => sliderRef.current?.swiper?.slideNext(), []);

  return (
    <section className="overflow-hidden pt-17.5">
      <div className="mx-auto w-full max-w-[1170px] border-b border-gray-3 px-4 pb-15 sm:px-8 xl:px-0">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="mb-1.5 flex items-center gap-2.5 font-medium text-dark">
              <Image src="/images/icons/icon-05.svg" width={17} height={17} alt="icon" />
              Store catalogue
            </span>
            <h2 className="font-semibold text-xl text-dark xl:text-heading-5">More Products</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="swiper-button-prev"
              aria-label="Previous products"
            >
              ‹
            </button>
            <button onClick={handleNext} className="swiper-button-next" aria-label="Next products">
              ›
            </button>
          </div>
        </div>

        <Swiper
          ref={sliderRef}
          slidesPerView={1.2}
          spaceBetween={20}
          breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}
        >
          {products.map((item) => (
            <SwiperSlide key={item.id}>
              <ProductItem item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
