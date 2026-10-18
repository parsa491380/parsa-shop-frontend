"use client";

import React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Breadcrumb from "../Common/Breadcrumb";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";
import { adaptOscarProduct, getCategories, getProducts, type StoreCategory } from "@/lib/store-api";
import type { Product } from "@/types/product";

const PAGE_SIZE = 24;

export default function ShopWithSidebar() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<"latest" | "oldest" | "price_asc" | "price_desc">("latest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get("search") ?? "";
    const initialCategory = params.get("category") ?? "";
    setSearch(initialSearch);
    setCategory(initialCategory);
  }, []);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let active = true;

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getProducts({
          search,
          category: category || undefined,
          sort,
          page,
        });

        if (!active) return;

        setProducts(response.results.map(adaptOscarProduct));
        setTotal(response.count);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "بارگذاری محصولات ممکن نیست.");
      } finally {
        if (active) setLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [search, category, sort, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setSort("latest");
    setPage(1);
  };

  return (
    <>
      <Breadcrumb title="فروشگاه" pages={["shop"]} />

      <section className="overflow-hidden bg-gray-2 py-12 lg:py-20">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className="mb-7 flex items-center justify-between gap-4 xl:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md bg-dark px-5 py-2.5 font-medium text-white"
            >
              فیلترها
            </button>
            <Link
              href="/cart"
              className="rounded-md border border-gray-3 bg-white px-5 py-2.5 font-medium text-dark"
            >
              سبد خرید
            </Link>
          </div>

          <div className="flex gap-7.5">
            <aside
              className={`fixed left-0 top-0 z-[10000] h-screen w-[300px] max-w-[85vw] overflow-y-auto bg-white p-6 shadow-xl transition-transform xl:static xl:z-auto xl:h-auto xl:w-[270px] xl:max-w-none xl:translate-x-0 xl:bg-transparent xl:p-0 xl:shadow-none ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="mb-6 flex items-center justify-between xl:hidden">
                <h2 className="font-medium text-dark">فیلترها</h2>
                <button onClick={() => setSidebarOpen(false)} className="text-2xl">
                  ×
                </button>
              </div>

              <div className="flex flex-col gap-5">
                <div className="rounded-lg bg-white p-5 shadow-1">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-medium text-dark">دسته‌بندی‌ها</h3>
                    <button onClick={clearFilters} className="text-sm text-blue">
                      پاک کردن
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setCategory("");
                      setPage(1);
                    }}
                    className={`mb-2 block w-full rounded px-3 py-2 text-left text-sm ${!category ? "bg-blue text-white" : "hover:bg-gray-1"}`}
                  >
                    همه دسته‌بندی‌ها
                  </button>

                  {categories.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCategory(item.slug);
                        setPage(1);
                        setSidebarOpen(false);
                      }}
                      className={`mb-1 flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm ${category === item.slug ? "bg-blue text-white" : "hover:bg-gray-1"}`}
                    >
                      <span
                        className="flex-1"
                        style={{
                          paddingLeft: `${Math.max(0, (item.depth ?? 1) - 1) * 14}px`,
                        }}
                      >
                        {item.name}
                      </span>
                      <span>{item.product_count ?? 0}</span>
                    </button>
                  ))}
                </div>

                <div className="rounded-lg bg-white p-5 shadow-1">
                  <h3 className="mb-4 font-medium text-dark">دنبال چه چیزی هستید؟</h3>
                  <form onSubmit={submitSearch}>
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="جستجوی محصولات…"
                      className="w-full rounded-md border border-gray-3 bg-gray-1 px-4 py-3 outline-none focus:border-blue"
                    />
                  </form>
                </div>
              </div>
            </aside>

            {sidebarOpen && (
              <button
                aria-label="بستن فیلترها"
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 z-[9999] bg-dark/40 xl:hidden"
              />
            )}

            <div className="w-full xl:max-w-[870px]">
              <div className="mb-6 rounded-lg bg-white p-3 shadow-1">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <select
                      value={sort}
                      onChange={(event) => {
                        setSort(event.target.value as typeof sort);
                        setPage(1);
                      }}
                      className="rounded-md border border-gray-3 bg-gray-1 px-4 py-2.5 text-sm outline-none"
                    >
                      <option value="latest">جدیدترین محصولات</option>
                      <option value="oldest">قدیمی‌ترین محصولات</option>
                      <option value="price_asc">قیمت: کم به زیاد</option>
                      <option value="price_desc">قیمت: زیاد به کم</option>
                    </select>

                    <span className="text-sm text-gray-5">
                      {loading ? "در حال بارگذاری…" : `${total} product${total === 1 ? "" : "s"}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setView("grid")}
                      className={`rounded-md border px-3 py-2 ${view === "grid" ? "border-blue bg-blue text-white" : "border-gray-3 bg-gray-1 text-dark"}`}
                    >
                      شبکه‌ای
                    </button>
                    <button
                      onClick={() => setView("list")}
                      className={`rounded-md border px-3 py-2 ${view === "list" ? "border-blue bg-blue text-white" : "border-gray-3 bg-gray-1 text-dark"}`}
                    >
                      فهرستی
                    </button>
                  </div>
                </div>

                {(search || category) && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    {search && (
                      <span className="rounded-full bg-gray-1 px-3 py-1">Search: {search}</span>
                    )}
                    {category && (
                      <span className="rounded-full bg-gray-1 px-3 py-1">
                        Category:{" "}
                        {categories.find((item) => item.slug === category)?.name ?? category}
                      </span>
                    )}
                    <button onClick={clearFilters} className="text-blue">
                      پاک کردن فیلترها
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-lg bg-white p-8 text-center shadow-1">
                  <p className="text-red">{error}</p>
                </div>
              )}

              {!error && loading && (
                <div className="rounded-lg bg-white p-12 text-center shadow-1">
                  <p className="text-gray-5">در حال بارگذاری محصولات…</p>
                </div>
              )}

              {!error && !loading && products.length === 0 && (
                <div className="rounded-lg bg-white p-12 text-center shadow-1">
                  <p className="text-lg font-medium text-dark">محصولی پیدا نشد.</p>
                  <button onClick={clearFilters} className="mt-5 text-blue">
                    پاک کردن فیلترها
                  </button>
                </div>
              )}

              {!error && !loading && products.length > 0 && (
                <div
                  className={
                    view === "grid"
                      ? "grid grid-cols-1 gap-x-7.5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3"
                      : "flex flex-col gap-7.5"
                  }
                >
                  {products.map((product) =>
                    view === "grid" ? (
                      <SingleGridItem item={product} key={product.id} />
                    ) : (
                      <SingleListItem item={product} key={product.id} />
                    ),
                  )}
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    className="rounded-md border border-gray-3 bg-white px-4 py-2 disabled:opacity-40"
                  >
                    قبلی
                  </button>
                  <span className="px-3 text-sm text-gray-5">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    className="rounded-md border border-gray-3 bg-white px-4 py-2 disabled:opacity-40"
                  >
                    بعدی
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
