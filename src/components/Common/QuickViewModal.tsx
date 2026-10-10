"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { useAppSelector, AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { resetQuickView } from "@/redux/features/quickView-slice";
import { updateproductDetails } from "@/redux/features/product-details";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { useStore } from "@/app/context/StoreContext";

export default function QuickViewModal() {
  const { isModalOpen, closeModal } = useModalContext();
  const { openPreviewModal } = usePreviewSlider();
  const dispatch = useDispatch<AppDispatch>();
  const { addToBasket } = useStore();

  const product = useAppSelector((state) => state.quickViewReducer.value);
  const [quantity, setQuantity] = useState(1);
  const [activePreview, setActivePreview] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!isModalOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target;
      if (target instanceof Element && !target.closest(".modal-content")) {
        closeModal();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      setQuantity(1);
      setActivePreview(0);
      setMessage(null);
      setAdding(false);
    };
  }, [isModalOpen, closeModal]);

  if (!isModalOpen) return null;

  const images = product.imgs?.previews ?? [];
  const thumbnails = product.imgs?.thumbnails ?? [];
  const image = images[activePreview] ?? images[0] ?? thumbnails[0];

  const productHref = product.slug
    ? `/products/${encodeURIComponent(product.slug)}`
    : "/shop-with-sidebar";

  const canDirectlyAdd =
    product.hasVariants !== true &&
    product.available !== false &&
    (product.stock === null || product.stock === undefined || product.stock > 0);

  async function handleAddToBasket() {
    if (!canDirectlyAdd) {
      closeModal();
      return;
    }

    try {
      setAdding(true);
      setMessage(null);
      await addToBasket(product.id, quantity);
      setMessage("Added to cart.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to add the product to the cart.");
    } finally {
      setAdding(false);
    }
  }

  function handlePreviewSlider() {
    dispatch(updateproductDetails(product));
    openPreviewModal();
  }

  return (
    <div className="fixed inset-0 z-99999 overflow-y-auto bg-dark/70 px-4 py-5 sm:px-8 sm:py-20">
      <div className="flex min-h-full items-center justify-center">
        <div className="modal-content relative w-full max-w-[1050px] rounded-xl bg-white p-5 shadow-3 sm:p-8">
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close quick view"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gray-2 text-dark hover:text-blue sm:right-6 sm:top-6"
          >
            ×
          </button>

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <div className="flex min-h-[420px] items-center justify-center rounded-lg bg-gray-1 p-5">
                {image ? (
                  <button
                    type="button"
                    onClick={handlePreviewSlider}
                    className="block"
                    aria-label="Open larger product preview"
                  >
                    <Image
                      src={image}
                      alt={product.title}
                      width={520}
                      height={520}
                      className="max-h-[420px] w-full object-contain"
                    />
                  </button>
                ) : (
                  <span className="text-gray-5">No image</span>
                )}
              </div>

              {thumbnails.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {thumbnails.map((thumbnail, index) => (
                    <button
                      key={`${thumbnail}-${index}`}
                      type="button"
                      onClick={() => setActivePreview(index)}
                      className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border-2 bg-gray-1 ${
                        index === activePreview ? "border-blue" : "border-transparent"
                      }`}
                    >
                      <Image
                        src={thumbnail}
                        alt={`${product.title} thumbnail ${index + 1}`}
                        width={70}
                        height={70}
                        className="h-full w-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-sm text-gray-5">Quick view</p>

              <h2 className="mt-1 text-2xl font-semibold text-dark">{product.title}</h2>

              <div className="mt-5 text-2xl font-semibold text-dark">
                {product.discountedPrice} {product.currency ?? ""}
              </div>

              {product.price !== product.discountedPrice && (
                <div className="mt-1 text-gray-4 line-through">
                  {product.price} {product.currency ?? ""}
                </div>
              )}

              <div className="mt-5">
                {product.available === false ? (
                  <p className="text-red">Currently unavailable.</p>
                ) : product.stock !== null && product.stock !== undefined ? (
                  <p className="text-sm text-gray-5">{product.stock} available</p>
                ) : (
                  <p className="text-sm text-gray-5">Availability confirmed by store.</p>
                )}
              </div>

              {product.hasVariants ? (
                <Link
                  href={productHref}
                  onClick={closeModal}
                  className="mt-7 inline-flex w-fit rounded-md bg-blue px-7 py-3 font-medium text-white hover:bg-blue-dark"
                >
                  Choose options
                </Link>
              ) : (
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <div className="inline-flex overflow-hidden rounded-md border border-gray-3">
                    <button
                      type="button"
                      onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                      className="px-4 py-2"
                    >
                      −
                    </button>
                    <span className="min-w-12 px-4 py-2 text-center">{quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((value) => Math.min(product.stock ?? 99, value + 1))
                      }
                      className="px-4 py-2"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToBasket}
                    disabled={!canDirectlyAdd || adding}
                    className="rounded-md bg-blue px-7 py-3 font-medium text-white hover:bg-blue-dark disabled:cursor-not-allowed disabled:bg-gray-4"
                  >
                    {adding ? "Adding..." : "Add to cart"}
                  </button>
                </div>
              )}

              {message && <p className="mt-4 text-sm text-blue">{message}</p>}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              dispatch(resetQuickView());
              closeModal();
            }}
            className="mt-8 text-sm text-gray-5 hover:text-dark"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
