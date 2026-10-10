import { apiFetch } from "./api";
import type { Product } from "@/types/product";

export interface ProductPrice {
  available: boolean;
  availability_message: string | null;
  currency: string | null;
  price: string | null;
  price_excl_tax: string | null;
  tax: string | null;
  tax_included: boolean;
  stock: number | null;
  sku: string | null;
}

export interface ProductImage {
  url: string;
  caption: string;
  is_primary: boolean;
}

export interface ProductVariant {
  id: number;
  title: string;
  slug: string;
  attributes: Record<string, string>;
  images: ProductImage[];
  price: ProductPrice;
}

export interface StoreCategory {
  id: number;
  name: string;
  slug: string;
  product_count?: number;
  depth?: number;
  image?: string | null;
}

export interface StoreProduct {
  id: number;
  title: string;
  slug: string;
  description: string;
  rating: number;
  images: ProductImage[];
  attributes: Record<string, string>;
  categories: StoreCategory[];
  structure: string;
  price: ProductPrice;
  children: ProductVariant[];
}

export interface ProductListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StoreProduct[];
}

export interface StoreBasketLine {
  id: number;
  product_id: number;
  title: string;
  slug: string;
  quantity: number;
  unit_price: string;
  line_total: string;
  currency: string | null;
  sku: string | null;
  image: string | null;
  availability: {
    available: boolean;
    message: string;
  };
}

export interface StoreBasket {
  id: number | null;
  status: string;
  num_items: number;
  num_lines: number;
  is_empty: boolean;
  is_shipping_required: boolean;
  currency: string | null;
  total: string | null;
  total_excl_tax: string | null;
  lines: StoreBasketLine[];
}

export interface StoreUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
}

export interface StoreAddress {
  id: number;
  first_name: string;
  last_name: string;
  line1: string;
  line2: string;
  line3: string;
  line4: string;
  state: string;
  postcode: string;
  country: string;
  country_name: string;
  phone_number: string;
  is_default_for_shipping: boolean;
  is_default_for_billing: boolean;
}

export interface StoreCountry {
  code: string;
  name: string;
}

export interface StoreOrderLine {
  id: number;
  product_id: number | null;
  title: string;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface StoreOrder {
  id: number;
  number: string;
  status: string;
  date_placed: string;
  currency: string;
  total_incl_tax: string;
  total_excl_tax: string;
  shipping_charge: string;
  lines: StoreOrderLine[];
  shipping_address: {
    first_name: string;
    last_name: string;
    line1: string;
    line2: string;
    state: string;
    postcode: string;
    country: string;
    phone_number: string;
    notes: string;
  } | null;
}

function buildQuery(params?: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }

  return search.toString();
}

export function getProducts(params?: {
  search?: string;
  category?: string;
  page?: number;
  sort?: "latest" | "oldest" | "priority" | "price_asc" | "price_desc";
}) {
  const query = buildQuery(params);
  return apiFetch<ProductListResponse>(query ? `/api/products/?${query}` : "/api/products/");
}

export function getProduct(slug: string) {
  return apiFetch<StoreProduct>(`/api/products/${encodeURIComponent(slug)}/`);
}

export function getCategories() {
  return apiFetch<StoreCategory[]>("/api/categories/");
}

/**
 * Convert Oscar's product representation to the small legacy
 * NextMerce Product shape used by existing visual components.
 */
export function adaptOscarProduct(product: StoreProduct): Product {
  const imageUrls = product.images.map((image) => image.url);
  const currentPrice = Number(product.price.price ?? 0);

  return {
    title: product.title,
    reviews: 0,
    rating: product.rating,
    reviewCount: 0,
    price: currentPrice,
    discountedPrice: currentPrice,
    id: product.id,
    slug: product.slug,
    currency: product.price.currency ?? undefined,
    available: product.price.available,
    stock: product.price.stock,
    hasVariants: product.children.length > 0,
    imgs: {
      thumbnails: imageUrls,
      previews: imageUrls,
    },
  };
}

export function getCountries() {
  return apiFetch<StoreCountry[]>("/api/countries/");
}

export function getBasket() {
  return apiFetch<StoreBasket>("/api/basket/");
}

export function addBasketItem(productId: number, quantity = 1) {
  return apiFetch<{ basket: StoreBasket; line_id: number }>("/api/basket/items/", {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
      quantity,
    }),
  });
}

export function updateBasketLine(lineId: number, quantity: number) {
  return apiFetch<StoreBasket>(`/api/basket/items/${lineId}/`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
}

export function removeBasketLine(lineId: number) {
  return apiFetch<StoreBasket>(`/api/basket/items/${lineId}/`, { method: "DELETE" });
}

export function clearBasket() {
  return apiFetch<StoreBasket>("/api/basket/", {
    method: "DELETE",
  });
}

export function getCurrentUser() {
  return apiFetch<{ user: StoreUser }>("/api/auth/me/");
}

export function login(email: string, password: string) {
  return apiFetch<{ user: StoreUser }>("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(input: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}) {
  return apiFetch<{ user: StoreUser }>("/api/auth/register/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logout() {
  return apiFetch<{ detail: string }>("/api/auth/logout/", {
    method: "POST",
  });
}

export function getAddresses() {
  return apiFetch<StoreAddress[]>("/api/addresses/");
}

export function createAddress(input: {
  first_name: string;
  last_name: string;
  line1: string;
  line2?: string;
  line3?: string;
  line4?: string;
  state?: string;
  postcode: string;
  country: string;
  phone_number?: string;
  is_default_for_shipping?: boolean;
  is_default_for_billing?: boolean;
}) {
  return apiFetch<{ id: number; detail: string }>("/api/addresses/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteAddress(addressId: number) {
  return apiFetch<void>(`/api/addresses/${addressId}/`, {
    method: "DELETE",
  });
}

export function getOrders() {
  return apiFetch<StoreOrder[]>("/api/orders/");
}

export function getShippingMethods() {
  return apiFetch<
    Array<{
      code: string;
      name: string;
      description: string;
      price: string;
      currency: string;
    }>
  >("/api/shipping/methods/");
}

export function createOrder(input: {
  first_name: string;
  last_name: string;
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
  postcode: string;
  country: string;
  phone_number?: string;
  notes?: string;
}) {
  return apiFetch<{
    order: StoreOrder;
    payment: {
      status: string;
      required: boolean;
      message: string;
    };
  }>("/api/checkout/orders/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
