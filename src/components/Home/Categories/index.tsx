"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { useCallback, useEffect, useRef, useState } from "react";
import "swiper/css/navigation";
import "swiper/css";
import { getCategories } from "@/lib/store-api";
import type { StoreCategory } from "@/lib/store-api";
import SingleItem from "./SingleItem";

export default function Categories() {
  const sliderRef = useRef<any>(null);
  const [categories, setCategories] = useState<StoreCategory[]>([]);

  useEffect(() => {
    let active = true;

    getCategories()
      .then((response) => {
        if (!active) return;

        // The home page shows top-level merchandising groups.
        setCategories(response.filter((category) => (category.depth ?? 1) === 1));
      })
      .catch(() => {
        if (active) setCategories([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const handlePrev = useCallback(() => {
    sliderRef.current?.swiper?.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    sliderRef.current?.swiper?.slideNext();
  }, []);

  return (
    <section className="overflow-hidden pt-17.5">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-15 border-b border-gray-3">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              دسته‌بندی‌ها
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">مرور دسته‌بندی‌ها</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              aria-label="Previous categories"
              className="swiper-button-prev"
            >
              <span>‹</span>
            </button>
            <button
              onClick={handleNext}
              aria-label="Next categories"
              className="swiper-button-next"
            >
              <span>›</span>
            </button>
          </div>
        </div>

        {categories.length > 0 ? (
          <Swiper
            ref={sliderRef}
            slidesPerView={6}
            spaceBetween={18}
            breakpoints={{
              0: { slidesPerView: 2 },
              640: { slidesPerView: 3 },
              1000: { slidesPerView: 4 },
              1200: { slidesPerView: 6 },
            }}
          >
            {categories.map((category) => (
              <SwiperSlide key={category.id}>
                <SingleItem item={category} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="rounded-xl bg-gray-1 p-8 text-center text-dark-4">
            برای نمایش دسته‌بندی‌ها، آن‌ها را در پیشخوان داشبورد منتشر کنید.
          </div>
        )}
      </div>
    </section>
  );
}
