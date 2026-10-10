"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { useStore } from "@/app/context/StoreContext";

const Signup = () => {
  const router = useRouter();
  const { signUp } = useStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await signUp({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });

      router.push("/my-account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create your account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Breadcrumb title="Create Account" pages={["Create Account"]} />

      <section className="overflow-hidden bg-gray-2 py-20">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className="mx-auto w-full max-w-[570px] rounded-xl bg-white p-4 shadow-1 sm:p-7.5 xl:p-11">
            <div className="mb-11 text-center">
              <h2 className="mb-1.5 text-xl font-semibold text-dark sm:text-2xl">
                Create an Account
              </h2>
              <p className="text-gray-5">
                Create your customer account to track orders and checkout faster.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="first_name" className="mb-2.5 block">
                    First name
                  </label>
                  <input
                    required
                    id="first_name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="w-full rounded-lg border border-gray-3 bg-gray-1 px-5 py-3 outline-none focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="mb-2.5 block">
                    Last name
                  </label>
                  <input
                    required
                    id="last_name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="w-full rounded-lg border border-gray-3 bg-gray-1 px-5 py-3 outline-none focus:ring-2 focus:ring-blue/20"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="email" className="mb-2.5 block">
                  Email address
                </label>
                <input
                  required
                  autoComplete="email"
                  type="email"
                  id="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-gray-3 bg-gray-1 px-5 py-3 outline-none focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div className="mt-5">
                <label htmlFor="password" className="mb-2.5 block">
                  Password
                </label>
                <input
                  required
                  minLength={9}
                  autoComplete="new-password"
                  type="password"
                  id="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-gray-3 bg-gray-1 px-5 py-3 outline-none focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div className="mt-5">
                <label htmlFor="confirm_password" className="mb-2.5 block">
                  Confirm password
                </label>
                <input
                  required
                  minLength={9}
                  autoComplete="new-password"
                  type="password"
                  id="confirm_password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-lg border border-gray-3 bg-gray-1 px-5 py-3 outline-none focus:ring-2 focus:ring-blue/20"
                />
              </div>

              {error && (
                <p className="mt-5 rounded-md bg-red-light-6 px-4 py-3 text-sm text-red">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-7.5 flex w-full justify-center rounded-lg bg-dark px-6 py-3 font-medium text-white duration-200 hover:bg-blue disabled:cursor-not-allowed disabled:bg-gray-4"
              >
                {submitting ? "Creating account..." : "Create account"}
              </button>

              <p className="mt-6 text-center">
                Already have an account?
                <Link href="/signin" className="pl-2 text-dark duration-200 hover:text-blue">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
