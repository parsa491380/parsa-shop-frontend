/**
 * =========================================================
 * Store API
 * =========================================================
 *
 * This file contains the TypeScript representation of
 * the data coming from Django Oscar.
 *
 * The important idea is:
 *
 * Django/Oscar
 *      ↓
 * JSON
 *      ↓
 * TypeScript types
 *      ↓
 * React components
 *
 * This keeps our frontend code strongly typed.
 */

import { apiFetch } from "./api";

// =========================================================
// Product price
// =========================================================

export interface ProductPrice {
  /**
   * Whether Oscar says this product can currently be bought.
   */
  available: boolean;

  /**
   * Human-readable availability message.
   */
  availability_message: string | null;

  /**
   * Currency returned by Oscar.
   *
   * Example:
   *
   * EUR
   * USD
   */
  currency: string | null;

  /**
   * Final price displayed to the customer.
   */
  price: string | null;

  /**
   * Price before tax.
   */
  price_excl_tax: string | null;

  /**
   * Tax amount.
   */
  tax: string | null;

  /**
   * Whether the returned price already includes tax.
   */
  tax_included: boolean;

  /**
   * Current stock quantity.
   *
   * null means Oscar isn't exposing a stock value
   * for this particular product.
   */
  stock: number | null;

  /**
   * SKU used by our store.
   */
  sku: string | null;
}

// =========================================================
// Product image
// =========================================================

export interface ProductImage {
  url: string;

  caption: string;

  is_primary: boolean;
}

// =========================================================
// Product variant
// =========================================================

export interface ProductVariant {
  /**
   * Oscar's database ID.
   *
   * This ID will eventually be sent back to Django
   * when the customer adds the variant to the basket.
   */
  id: number;

  title: string;

  attributes: Record<string, string>;

  price: ProductPrice;
}

// =========================================================
// Product
// =========================================================

export interface StoreProduct {
  id: number;

  title: string;

  slug: string;

  description: string;

  rating: number;

  images: ProductImage[];

  attributes: Record<string, string>;

  categories: StoreCategory[];

  /**
   * Possible values:
   *
   * standalone
   * parent
   */
  structure: string;

  /**
   * Price information for the product.
   *
   * For a parent product this can represent the
   * currently available pricing calculated by Oscar.
   */
  price: ProductPrice;

  /**
   * Product variants.
   *
   * Example:
   *
   * [
   *   size 41,
   *   size 42,
   *   size 43
   * ]
   */
  children: ProductVariant[];
}

// =========================================================
// Paginated product response
// =========================================================

export interface ProductListResponse {
  count: number;

  next: string | null;

  previous: string | null;

  results: StoreProduct[];
}

// =========================================================
// Get products
// =========================================================

export async function getProducts(params?: {
  search?: string;
  category?: string;
  page?: number;
}): Promise<ProductListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.search) {
    searchParams.set("search", params.search);
  }

  if (params?.category) {
    searchParams.set("category", params.category);
  }

  if (params?.page) {
    searchParams.set("page", String(params.page));
  }

  const query = searchParams.toString();

  const url = query ? `/api/products/?${query}` : "/api/products/";

  /**
   * Django performs the actual database query.
   *
   * Next.js simply asks for the data.
   */
  return apiFetch<ProductListResponse>(url);
}

// =========================================================
// Get one product
// =========================================================

export async function getProduct(slug: string): Promise<StoreProduct> {
  return apiFetch<StoreProduct>(`/api/products/${encodeURIComponent(slug)}/`);
}

// =========================================================
// Get categories
// =========================================================

export interface StoreCategory {
  id: number;

  name: string;

  slug: string;
}

export async function getCategories(): Promise<StoreCategory[]> {
  return apiFetch<StoreCategory[]>("/api/categories/");
}

/**
 * =========================================================
 * Convert an Oscar product into the format expected by
 * the existing NextMerce Product components.
 * =========================================================
 *
 * NextMerce currently expects:
 *
 *     title
 *     reviews
 *     price
 *     discountedPrice
 *     id
 *     imgs
 *
 * Oscar gives us:
 *
 *     title
 *     images
 *     price
 *     rating
 *     ...
 *
 * Instead of rewriting every NextMerce component, we convert
 * Oscar's data into the shape those components already know.
 */

export function adaptOscarProduct(product: StoreProduct) {
  /**
   * Oscar can return several product images.
   *
   * NextMerce expects two image arrays:
   *
   *     thumbnails
   *     previews
   *
   * For now we use the same images in both arrays.
   *
   * Later we can create optimized thumbnail images on the
   * Django side.
   */

  const imageUrls = product.images.map((image) => image.url);

  /**
   * Oscar's current API gives us a price.
   *
   * We have not connected Oscar offers/discounts yet.
   *
   * Therefore:
   *
   *     price = current Oscar price
   *     discountedPrice = current Oscar price
   *
   * Later, when we expose original/discounted pricing from
   * Oscar, this adapter will handle it.
   */

  const currentPrice = Number(product.price.price ?? 0);

  return {
    title: product.title,

    /**
     * Our current Oscar API provides rating, not the total
     * number of reviews.
     *
     * Until we build the review API, use 0 here rather than
     * pretending that the rating is a review count.
     */
    reviews: 0,

    price: currentPrice,

    discountedPrice: currentPrice,

    id: product.id,

    imgs: {
      thumbnails: imageUrls,

      previews: imageUrls,
    },
  };
}
