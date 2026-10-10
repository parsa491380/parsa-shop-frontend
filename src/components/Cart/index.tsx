"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "../Common/Breadcrumb";
import { useStore } from "@/app/context/StoreContext";

export default function Cart() {
  const { basket, refreshingBasket, updateBasketQuantity, removeFromBasket, emptyBasket } =
    useStore();

  const currency = basket?.currency ?? "";

  return (
    <>
      <Breadcrumb title="Cart" pages={["Cart"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {!basket?.lines.length ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-1">
              <h2 className="text-2xl font-medium text-dark">Your cart is empty</h2>
              <p className="mt-3 text-gray-5">Add a product to your basket to continue.</p>
              <Link
                href="/shop-with-sidebar"
                className="mt-7 inline-flex rounded-md bg-dark px-8 py-3 font-medium text-white hover:bg-blue"
              >
                Continue shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7.5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-medium text-dark">Your Cart</h2>
                  {refreshingBasket && <p className="mt-1 text-sm text-gray-5">Updating…</p>}
                </div>
                <button onClick={emptyBasket} className="text-blue hover:text-blue-dark">
                  Clear cart
                </button>
              </div>

              <div className="overflow-hidden rounded-[10px] bg-white shadow-1">
                <div className="overflow-x-auto">
                  <div className="min-w-[900px]">
                    <div className="grid grid-cols-[3fr_1fr_1.4fr_1.2fr_50px] gap-5 border-b border-gray-3 px-7.5 py-5">
                      <span className="text-dark">Product</span>
                      <span className="text-dark">Price</span>
                      <span className="text-dark">Quantity</span>
                      <span className="text-dark">Subtotal</span>
                      <span />
                    </div>

                    {basket.lines.map((line) => (
                      <div
                        key={line.id}
                        className="grid grid-cols-[3fr_1fr_1.4fr_1.2fr_50px] items-center gap-5 border-b border-gray-3 px-7.5 py-6"
                      >
                        <Link
                          href={`/products/${encodeURIComponent(line.slug)}`}
                          className="flex items-center gap-5 min-w-0"
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
                              <span className="text-xs text-gray-4">No image</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate font-medium text-dark hover:text-blue">
                              {line.title}
                            </h3>
                            <p className="mt-1 text-sm text-gray-5">SKU: {line.sku ?? "—"}</p>
                          </div>
                        </Link>

                        <span className="font-medium text-dark">
                          {line.unit_price} {line.currency ?? currency}
                        </span>

                        <div className="inline-flex w-fit items-center overflow-hidden rounded-md border border-gray-3">
                          <button
                            onClick={() =>
                              updateBasketQuantity(line.id, Math.max(1, line.quantity - 1))
                            }
                            className="px-3 py-2 text-lg hover:bg-gray-1"
                            aria-label={`Decrease ${line.title} quantity`}
                          >
                            −
                          </button>
                          <span className="min-w-10 px-3 py-2 text-center text-sm">
                            {line.quantity}
                          </span>
                          <button
                            onClick={() => updateBasketQuantity(line.id, line.quantity + 1)}
                            className="px-3 py-2 text-lg hover:bg-gray-1"
                            aria-label={`Increase ${line.title} quantity`}
                          >
                            +
                          </button>
                        </div>

                        <span className="font-medium text-dark">
                          {line.line_total} {line.currency ?? currency}
                        </span>

                        <button
                          onClick={() => removeFromBasket(line.id)}
                          className="text-xl text-gray-5 hover:text-red"
                          aria-label={`Remove ${line.title}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <div className="w-full max-w-[420px] rounded-xl bg-white p-7.5 shadow-1">
                  <div className="flex items-center justify-between border-b border-gray-3 pb-5">
                    <span className="text-dark">Items</span>
                    <span className="font-medium text-dark">{basket.num_items}</span>
                  </div>
                  <div className="flex items-center justify-between py-5">
                    <span className="text-lg font-medium text-dark">Total</span>
                    <span className="text-lg font-semibold text-dark">
                      {basket.total} {currency}
                    </span>
                  </div>
                  <Link
                    href="/checkout"
                    className="flex w-full justify-center rounded-md bg-blue py-3.5 font-medium text-white hover:bg-blue-dark"
                  >
                    Continue to checkout
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
