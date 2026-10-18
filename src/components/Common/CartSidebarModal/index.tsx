"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { useStore } from "@/app/context/StoreContext";

export default function CartSidebarModal() {
  const { isCartModalOpen, closeCartModal } = useCartModalContext();
  const { basket, removeFromBasket } = useStore();

  useEffect(() => {
    if (!isCartModalOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && !target.closest(".modal-content")) {
        closeCartModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCartModalOpen, closeCartModal]);

  return (
    <div
      className={`fixed top-0 left-0 z-99999 overflow-y-auto no-scrollbar w-full h-screen bg-dark/70 duration-300 ${
        isCartModalOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-end">
        <div className="w-full max-w-[500px] min-h-screen shadow-1 bg-white px-4 sm:px-7.5 lg:px-11 relative modal-content">
          <div className="sticky top-0 z-10 bg-white flex items-center justify-between pb-7 pt-4 sm:pt-7.5 border-b border-gray-3 mb-7.5">
            <h2 className="font-medium text-dark text-lg sm:text-2xl">سبد خرید</h2>
            <button
              onClick={closeCartModal}
              aria-label="Close cart"
              className="flex items-center justify-center text-dark-5 hover:text-dark"
            >
              <span className="text-3xl leading-none">×</span>
            </button>
          </div>

          <div className="pb-36">
            {basket?.lines.length ? (
              <div className="flex flex-col gap-6">
                {basket.lines.map((line) => (
                  <div key={line.id} className="flex items-center justify-between gap-4">
                    <Link
                      href={`/products/${encodeURIComponent(line.slug)}`}
                      onClick={closeCartModal}
                      className="flex min-w-0 items-center gap-4"
                    >
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-2 overflow-hidden">
                        {line.image ? (
                          <Image
                            src={line.image}
                            alt={line.title}
                            width={80}
                            height={80}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-gray-4">بدون تصویر</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-medium text-dark">{line.title}</h3>
                        <p className="text-custom-sm text-gray-5">
                          {line.quantity} × {line.unit_price} {line.currency ?? basket.currency}
                        </p>
                      </div>
                    </Link>

                    <button
                      onClick={() => removeFromBasket(line.id)}
                      aria-label={`Remove ${line.title}`}
                      className="flex items-center justify-center rounded-full flex-shrink-0 w-9.5 h-9.5 bg-gray-2 border border-gray-3 text-dark ease-out duration-200 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        transform="rotate(0 0 0)"
                      >
                        <path
                          d="M9.5 2C9.08579 2 8.75 2.33579 8.75 2.75C8.75 3.16421 9.08579 3.5 9.5 3.5H14.5C14.9142 3.5 15.25 3.16421 15.25 2.75C15.25 2.33579 14.9142 2 14.5 2H9.5Z"
                          fill="currentColor"
                        ></path>
                        <path
                          d="M10 9.75C10.4142 9.75 10.75 10.0858 10.75 10.5V16.5C10.75 16.9142 10.4142 17.25 10 17.25C9.58579 17.25 9.25 16.9142 9.25 16.5V10.5C9.25 10.0858 9.58579 9.75 10 9.75Z"
                          fill="currentColor"
                        ></path>
                        <path
                          d="M14.75 10.5C14.75 10.0858 14.4142 9.75 14 9.75C13.5858 9.75 13.25 10.0858 13.25 10.5V16.5C13.25 16.9142 13.5858 17.25 14 17.25C14.4142 17.25 14.75 16.9142 14.75 16.5V10.5Z"
                          fill="currentColor"
                        ></path>
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M4 5C3.74924 5 3.51506 5.12533 3.37597 5.33397C3.23687 5.54262 3.21125 5.80699 3.3077 6.03846L4.44231 8.76154C4.4804 8.85294 4.5 8.95098 4.5 9.05V19.75C4.5 20.9926 5.50736 22 6.75 22H17.25C18.4926 22 19.5 20.9926 19.5 19.75V9.04978C19.5 8.95083 19.5196 8.85286 19.5576 8.76151L20.6914 6.03827C20.7878 5.8068 20.7621 5.54249 20.623 5.33389C20.4839 5.12529 20.2498 5 19.999 5H4ZM5.82693 8.18462L5.125 6.5H18.8744L18.1728 8.18498C18.0587 8.45902 18 8.75294 18 9.04978V19.75C18 20.1642 17.6642 20.5 17.25 20.5H6.75C6.33579 20.5 6 20.1642 6 19.75V9.05C6 8.75294 5.94118 8.45882 5.82693 8.18462Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-dark">سبد خرید شما خالی است.</p>
                <Link
                  href="/shop-with-sidebar"
                  onClick={closeCartModal}
                  className="mt-5 inline-flex rounded-md bg-blue px-6 py-3 font-medium text-white hover:bg-blue-dark"
                >
                  ادامه خرید
                </Link>
              </div>
            )}
          </div>

          <div className="border-t border-gray-3 bg-white pt-5 pb-4 sm:pb-7.5 lg:pb-11 fixed bottom-0 mt-auto w-full max-w-[400px]">
            <div className="flex items-center justify-between gap-5 mb-6">
              <p className="font-medium text-xl text-dark">جمع جزء:</p>
              <p className="font-medium text-xl text-dark">
                {basket?.total ?? "0.00"} {basket?.currency ?? ""}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                className="w-full flex justify-center font-medium text-white bg-blue py-[13px] px-6 rounded-full ease-out duration-200 hover:bg-blue-dark"
                href="/cart"
                onClick={closeCartModal}
              >
                مشاهده سبد خرید
              </Link>
              <Link
                href="/checkout"
                onClick={closeCartModal}
                className="w-full flex justify-center font-medium text-white bg-dark py-[13px] px-6 rounded-full ease-out duration-200 hover:bg-opacity-95"
              >
                تسویه‌حساب
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
