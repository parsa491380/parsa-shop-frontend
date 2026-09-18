"use client";

/**
 * =========================================================
 * Temporary Oscar Catalogue Test
 * =========================================================
 *
 * This page is still only an integration test.
 *
 * Later we will remove it and connect the same data to the
 * actual NextMerce product-card component.
 */

import { useEffect, useState } from "react";

import { getProducts, type StoreProduct } from "@/lib/store-api";

export default function ApiTestPage() {
  const [products, setProducts] = useState<StoreProduct[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await getProducts();

        setProducts(response.results);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unable to load products.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-2xl font-semibold">Loading products...</h1>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-2xl font-semibold">API Error</h1>

        <p className="mt-3 text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Django Products</h1>

        <p className="mt-2 text-sm text-gray-500">Products loaded from Django Oscar.</p>
      </div>

      <div
        className="
        grid
        grid-cols-1
        gap-6
        sm:grid-cols-2
        md:grid-cols-3
        lg:grid-cols-4
      "
      >
        {products.map((product) => {
          const primaryImage =
            product.images.find((image) => image.is_primary) ?? product.images[0];

          const brand = product.attributes.brand;

          const price = product.price.price;

          return (
            <article
              key={product.id}
              className="
                group
                overflow-hidden
                rounded-xl
                border
                border-gray-200
                bg-white
              "
            >
              {/* -------------------------------------------
                  Product image
                  ------------------------------------------- */}

              <div
                className="
                relative
                aspect-square
                overflow-hidden
                bg-gray-100
              "
              >
                {primaryImage ? (
                  <img
                    src={primaryImage.url}
                    alt={primaryImage.caption || product.title}
                    className="
                      h-full
                      w-full
                      object-cover
                      transition-transform
                      duration-300
                      group-hover:scale-105
                    "
                  />
                ) : (
                  <div
                    className="
                    flex
                    h-full
                    items-center
                    justify-center
                    text-sm
                    text-gray-400
                  "
                  >
                    No image
                  </div>
                )}
              </div>

              {/* -------------------------------------------
                  Product information
                  ------------------------------------------- */}

              <div className="p-4">
                {brand && (
                  <p
                    className="
                    text-sm
                    text-gray-500
                  "
                  >
                    {brand}
                  </p>
                )}

                <h2
                  className="
                  mt-1
                  text-lg
                  font-semibold
                  text-gray-900
                "
                >
                  {product.title}
                </h2>

                {price && (
                  <p
                    className="
                    mt-3
                    text-base
                    font-semibold
                    text-gray-900
                  "
                  >
                    {price} {product.price.currency}
                  </p>
                )}

                {product.children.length > 0 && (
                  <p
                    className="
                    mt-2
                    text-sm
                    text-gray-500
                  "
                  >
                    {product.children.length}{" "}
                    {product.children.length === 1 ? "variant" : "variants"}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {products.length === 0 && (
        <div
          className="
          rounded-lg
          border
          border-dashed
          p-12
          text-center
        "
        >
          <p className="text-gray-500">No public products found.</p>
        </div>
      )}
    </main>
  );
}
