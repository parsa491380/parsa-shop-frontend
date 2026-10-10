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
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Breadcrumb title="Sign In" pages={["Sign In"]} />

      <section className="overflow-hidden bg-gray-2 py-20">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className="mx-auto w-full max-w-[570px] rounded-xl bg-white p-4 shadow-1 sm:p-7.5 xl:p-11">
            <div className="mb-11 text-center">
              <h2 className="mb-1.5 text-xl font-semibold text-dark sm:text-2xl">
                Sign In to Your Account
              </h2>
              <p className="text-gray-5">Use your store account email and password.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="email" className="mb-2.5 block">
                  Email
                </label>
                <input
                  required
                  autoComplete="email"
                  type="email"
                  id="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-gray-3 bg-gray-1 px-5 py-3 outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="password" className="mb-2.5 block">
                  Password
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
                  className="w-full rounded-lg border border-gray-3 bg-gray-1 px-5 py-3 outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-blue/20"
                />
              </div>

              {error && (
                <p className="mb-5 rounded-md bg-red-light-6 px-4 py-3 text-sm text-red">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex w-full justify-center rounded-lg bg-dark px-6 py-3 font-medium text-white duration-200 hover:bg-blue disabled:cursor-not-allowed disabled:bg-gray-4"
              >
                {submitting ? "Signing in..." : "Sign in"}
              </button>

              <p className="mt-6 text-center">
                Don&apos;t have an account?
                <Link href="/signup" className="pl-2 text-dark duration-200 hover:text-blue">
                  Create one
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
