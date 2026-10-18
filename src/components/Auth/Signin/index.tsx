"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/app/context/StoreContext";

export default function Signin() {
  const router = useRouter();
  const { signIn } = useStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signIn(email, password);
      router.push("/my-account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ورود انجام نشد.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Breadcrumb title="ورود" pages={["ورود"]} />

      <section className="overflow-hidden bg-gray-2 py-20">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className="mx-auto w-full max-w-[570px] rounded-xl bg-white p-4 shadow-1 sm:p-7.5 xl:p-11">
            <div className="mb-11 text-center">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                وارد حساب کاربری خود شوید
              </h2>
              <p className="text-gray-5">با ایمیل و رمز عبور حساب فروشگاه خود وارد شوید.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="email" className="mb-2.5 block">
                  ایمیل
                </label>
                <input
                  required
                  autoComplete="email"
                  type="email"
                  id="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="example@gmail.com"
                  className="rounded-full border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="password" className="mb-2.5 block">
                  رمز عبور
                </label>
                <input
                  required
                  minLength={9}
                  autoComplete="current-password"
                  type="password"
                  id="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="rounded-full border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              {error && (
                <p className="mb-5 rounded-md bg-red-light-6 px-4 py-3 text-sm text-red">{error}</p>
              )}

              <a
                className="block text-center text-dark-4 mt-6 ease-out duration-200 hover:text-dark"
                href="/forgot-password"
              >
                رمز عبور را فراموش کرده‌اید?
              </a>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-full ease-out duration-200 hover:bg-blue mt-7.5 items-center gap-2"
              >
                {submitting ? "در حال ورود ..." : "ورود"}
              </button>

              <p className="mt-6 text-center">
                حساب کاربری ندارید؟
                <Link
                  href="/signup"
                  className="text-dark ease-out duration-200 hover:text-blue pl-1"
                >
                  ایجاد حساب
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
