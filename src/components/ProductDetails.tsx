"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Breadcrumb from "./Common/Breadcrumb";
import { useStore } from "@/app/context/StoreContext";
import type { ProductVariant, StoreProduct } from "@/lib/store-api";

function formatAttributeName(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function ProductDetails({ product }: { product: StoreProduct }) {
  const { addToBasket } = useStore();
  const initialVariant =
    product.children.find((child) => child.price.available) ?? product.children[0] ?? null;

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    initialVariant?.id ?? null,
  );
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(
    initialVariant?.attributes ?? {},
  );
  const [selectedImage, setSelectedImage] = useState(
    initialVariant?.images[0]?.url ?? product.images[0]?.url ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedVariant = useMemo<ProductVariant | null>(() => {
    if (!selectedVariantId) return null;
    return product.children.find((child) => child.id === selectedVariantId) ?? null;
  }, [product.children, selectedVariantId]);

  const effectivePrice = selectedVariant?.price ?? product.price;
  const effectiveImages = selectedVariant?.images.length ? selectedVariant.images : product.images;
  const effectiveImage = selectedImage ?? effectiveImages[0]?.url ?? null;

  const attributeOptions = useMemo(() => {
    const keys = new Set<string>();
    for (const variant of product.children) {
      for (const key of Object.keys(variant.attributes)) keys.add(key);
    }

    return [...keys].map((key) => ({
      key,
      values: [
        ...new Set(product.children.map((variant) => variant.attributes[key]).filter(Boolean)),
      ],
    }));
  }, [product.children]);

  const chooseVariantByAttribute = (key: string, value: string) => {
    const nextAttributes = {
      ...selectedAttributes,
      [key]: value,
    };

    // Prefer a variant matching every currently selected attribute.
    let variant = product.children.find((child) =>
      Object.entries(nextAttributes).every(
        ([attributeKey, attributeValue]) => child.attributes[attributeKey] === attributeValue,
      ),
    );

    // If the exact combination does not exist, fall back to the first
    // variant containing the newly selected value and synchronize the UI
    // with that valid combination.
    if (!variant) {
      variant = product.children.find((child) => child.attributes[key] === value);
    }

    if (variant) {
      setSelectedVariantId(variant.id);
      setSelectedAttributes(variant.attributes);
      setSelectedImage(variant.images[0]?.url ?? product.images[0]?.url ?? null);
      setQuantity((current) => {
        const stock = variant?.price.stock;
        if (stock === null || stock === undefined) return Math.max(1, current);
        if (stock < 1) return 1;
        return Math.min(Math.max(1, current), stock);
      });
      setMessage(null);
    }
  };

  const handleAddToBasket = async () => {
    const productId = selectedVariant?.id ?? product.id;

    if (product.structure === "parent" && !selectedVariant) {
      setMessage("لطفاً ابتدا گزینه‌های محصول را انتخاب کنید.");
      return;
    }

    if (!effectivePrice.available) {
      setMessage(effectivePrice.availability_message || "این محصول در حال حاضر موجود نیست.");
      return;
    }

    try {
      setAdding(true);
      setMessage(null);
      await addToBasket(productId, quantity);
      setMessage("محصول به سبد خرید اضافه شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "افزودن محصول به سبد خرید ممکن نیست.");
    } finally {
      setAdding(false);
    }
  };

  const maxQuantity = effectivePrice.stock ?? 99;

  return (
    <>
      <Breadcrumb title={product.title} pages={["shop", "/", product.title]} />

      <section className="overflow-hidden bg-gray-2 py-12 lg:py-20">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className="grid gap-10 rounded-xl bg-white p-5 shadow-1 lg:grid-cols-2 lg:p-10">
            <div>
              <div className="flex min-h-[450px] items-center justify-center rounded-xl bg-gray-1 p-6">
                {effectiveImage ? (
                  <Image
                    src={effectiveImage}
                    alt={product.title}
                    width={650}
                    height={650}
                    className="max-h-[500px] w-full object-contain"
                    priority
                  />
                ) : (
                  <span className="text-gray-4">تصویری برای محصول وجود ندارد</span>
                )}
              </div>

              {effectiveImages.length > 1 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {effectiveImages.map((image) => (
                    <button
                      key={image.url}
                      onClick={() => setSelectedImage(image.url)}
                      className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border ${
                        effectiveImage === image.url ? "border-blue" : "border-gray-3"
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={image.caption || product.title}
                        width={80}
                        height={80}
                        className="h-full w-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center">
              <div className="mb-2 text-sm text-gray-5">
                {product.attributes.brand || product.categories[0]?.name || "محصول"}
              </div>

              <h1 className="text-2xl font-semibold text-dark sm:text-3xl">{product.title}</h1>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Image
                      key={star}
                      src="/images/icons/icon-star.svg"
                      alt="star"
                      width={16}
                      height={16}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-5">{product.rating.toFixed(1)} امتیاز</span>
              </div>

              <div className="mt-6 text-2xl font-semibold text-dark">
                {effectivePrice.price ?? "—"} {effectivePrice.currency ?? ""}
              </div>

              <div className="mt-4 rounded-lg bg-gray-1 p-4">
                <p className="text-sm text-gray-5">
                  {effectivePrice.availability_message ||
                    (effectivePrice.available ? "موجود" : "ناموجود")}
                </p>
                {effectivePrice.stock !== null && effectivePrice.stock !== undefined && (
                  <p className="mt-1 text-sm text-gray-5">موجودی : {effectivePrice.stock}</p>
                )}
              </div>

              {attributeOptions.map((attribute) => (
                <div key={attribute.key} className="mt-6">
                  <div className="mb-3 font-medium text-dark">
                    {formatAttributeName(attribute.key)}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attribute.values.map((value) => {
                      const active = selectedAttributes[attribute.key] === value;
                      return (
                        <button
                          key={value}
                          onClick={() => chooseVariantByAttribute(attribute.key, value)}
                          className={`rounded-md border px-4 py-2 text-sm ${
                            active
                              ? "border-blue bg-blue text-white"
                              : "border-gray-3 bg-white text-dark hover:border-blue"
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <div className="inline-flex overflow-hidden rounded-md border border-gray-3">
                  <button
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    className="px-4 py-2 text-lg hover:bg-gray-1"
                  >
                    −
                  </button>
                  <span className="min-w-12 px-4 py-2 text-center">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity((value) =>
                        maxQuantity < 1 ? 1 : Math.min(maxQuantity, value + 1),
                      )
                    }
                    disabled={maxQuantity < 1}
                    className="px-4 py-2 text-lg hover:bg-gray-1 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToBasket}
                  disabled={adding || !effectivePrice.available || maxQuantity < 1}
                  className="rounded-md bg-blue px-8 py-3 font-medium text-white hover:bg-blue-dark disabled:cursor-not-allowed disabled:bg-gray-4"
                >
                  {adding ? "در حال افزودن…" : "افزودن به سبد خرید"}
                </button>

                <Link
                  href="/cart"
                  className="rounded-md border border-gray-3 bg-white px-8 py-3 font-medium text-dark hover:bg-gray-1"
                >
                  مشاهده سبد خرید
                </Link>
              </div>

              {message && <p className="mt-4 text-sm text-blue">{message}</p>}

              <div className="mt-8 border-t border-gray-3 pt-7">
                <h2 className="font-medium text-dark">توضیحات</h2>
                <div
                  className="prose prose-sm mt-3 max-w-none text-gray-5"
                  dangerouslySetInnerHTML={{
                    __html: product.description || "توضیحی برای این محصول ثبت نشده است.",
                  }}
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-2 text-sm">
                {Object.entries(product.attributes).map(([key, value]) => (
                  <span key={key} className="rounded-full bg-gray-1 px-3 py-1">
                    {formatAttributeName(key)}: {value}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
