"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Breadcrumb from "../Common/Breadcrumb";
import {
  createAddress,
  createOrder,
  getAddresses,
  getCountries,
  getShippingMethods,
  type StoreAddress,
  type StoreCountry,
  type StoreOrder,
} from "@/lib/store-api";
import { useStore } from "@/app/context/StoreContext";

interface FormState {
  first_name: string;
  last_name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone_number: string;
  notes: string;
  save_address: boolean;
}

const initialForm: FormState = {
  first_name: "",
  last_name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postcode: "",
  country: "",
  phone_number: "",
  notes: "",
  save_address: false,
};

export default function Checkout() {
  const { basket, user, loading: storeLoading } = useStore();

  const [countries, setCountries] = useState<StoreCountry[]>([]);
  const [addresses, setAddresses] = useState<StoreAddress[]>([]);
  const [shippingPrice, setShippingPrice] = useState("0.00");
  const [shippingCurrency, setShippingCurrency] = useState("");
  const [form, setForm] = useState<FormState>(initialForm);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<StoreOrder | null>(null);

  useEffect(() => {
    if (!user) {
      setLoadingData(false);
      return;
    }

    let active = true;

    (async () => {
      try {
        const [countryResult, addressResult, shippingResult] = await Promise.all([
          getCountries(),
          getAddresses(),
          getShippingMethods(),
        ]);

        if (!active) return;

        setCountries(countryResult);
        setAddresses(addressResult);

        if (shippingResult[0]) {
          setShippingPrice(shippingResult[0].price);
          setShippingCurrency(shippingResult[0].currency);
        }

        const preferred =
          addressResult.find((item) => item.is_default_for_shipping) ?? addressResult[0];

        if (preferred) {
          setForm({
            first_name: preferred.first_name,
            last_name: preferred.last_name,
            line1: preferred.line1,
            line2: preferred.line2,
            city: preferred.line4,
            state: preferred.state,
            postcode: preferred.postcode,
            country: preferred.country,
            phone_number: preferred.phone_number,
            notes: "",
            save_address: false,
          });
        } else if (countryResult.length === 1) {
          setForm((current) => ({
            ...current,
            country: countryResult[0].code,
          }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to prepare checkout.");
      } finally {
        if (active) setLoadingData(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user]);

  const subtotal = basket?.total ?? "0.00";
  const total = useMemo(() => {
    const subtotalNumber = Number(subtotal);
    const shippingNumber = Number(shippingPrice);
    return Number.isFinite(subtotalNumber + shippingNumber)
      ? (subtotalNumber + shippingNumber).toFixed(2)
      : subtotal;
  }, [subtotal, shippingPrice]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      setError("Please sign in before placing an order.");
      return;
    }

    if (!basket || basket.is_empty) {
      setError("Your basket is empty.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      if (form.save_address) {
        await createAddress({
          first_name: form.first_name,
          last_name: form.last_name,
          line1: form.line1,
          line2: form.line2,
          line4: form.city,
          state: form.state,
          postcode: form.postcode,
          country: form.country,
          phone_number: form.phone_number,
          is_default_for_shipping: true,
        });
      }

      /**
       * The backend creates a pending order only while the development
       * flag CHECKOUT_ALLOW_PENDING_ORDERS is enabled.
       *
       * A real production payment provider must be connected before
       * treating this flow as a paid checkout.
       */
      const result = await createOrder({
        first_name: form.first_name,
        last_name: form.last_name,
        line1: form.line1,
        line2: form.line2,
        city: form.city,
        state: form.state,
        postcode: form.postcode,
        country: form.country,
        phone_number: form.phone_number,
        notes: form.notes,
      });

      setOrder(result.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create the order.");
    } finally {
      setSubmitting(false);
    }
  }

  if (storeLoading || loadingData) {
    return (
      <>
        <Breadcrumb title="Checkout" pages={["Checkout"]} />
        <section className="bg-gray-2 py-20">
          <div className="mx-auto max-w-[1170px] px-4 text-center">Loading checkout...</div>
        </section>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Breadcrumb title="Checkout" pages={["Checkout"]} />
        <section className="bg-gray-2 py-20">
          <div className="mx-auto max-w-[570px] rounded-xl bg-white p-8 text-center shadow-1">
            <h1 className="text-2xl font-semibold text-dark">Sign in to checkout</h1>
            <p className="mt-3 text-gray-5">
              Your basket can be created before login, but checkout requires a customer account.
            </p>
            <Link
              href="/signin"
              className="mt-6 inline-flex rounded-md bg-blue px-7 py-3 font-medium text-white hover:bg-blue-dark"
            >
              Sign in
            </Link>
          </div>
        </section>
      </>
    );
  }

  if (order) {
    return (
      <>
        <Breadcrumb title="Order Received" pages={["Checkout", "/", "Complete"]} />
        <section className="bg-gray-2 py-20">
          <div className="mx-auto max-w-[700px] rounded-xl bg-white p-8 shadow-1">
            <p className="text-sm font-medium text-blue">Order created</p>
            <h1 className="mt-2 text-3xl font-semibold text-dark">Order #{order.number}</h1>
            <p className="mt-4 text-gray-5">
              Your order is currently <strong>{order.status}</strong>. No payment has been confirmed
              yet.
            </p>

            <div className="mt-8 border-y border-gray-3 py-5">
              {order.lines.map((line) => (
                <div
                  key={line.id}
                  className="flex items-center justify-between gap-4 border-b border-gray-3 py-3 last:border-b-0"
                >
                  <span>
                    {line.title} × {line.quantity}
                  </span>
                  <span>
                    {line.line_total} {order.currency}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                href="/my-account"
                className="rounded-md bg-blue px-6 py-3 font-medium text-white hover:bg-blue-dark"
              >
                View account
              </Link>
              <Link
                href="/shop-with-sidebar"
                className="rounded-md border border-gray-3 px-6 py-3 font-medium text-dark hover:bg-gray-1"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Checkout" pages={["Checkout"]} />

      <section className="bg-gray-2 py-20">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-7.5 lg:grid-cols-[1fr_420px]">
              <div className="rounded-xl bg-white p-5 shadow-1 sm:p-8">
                <div>
                  <h2 className="text-xl font-semibold text-dark">Shipping information</h2>
                  <p className="mt-1 text-sm text-gray-5">
                    The address below will be saved to your order.
                  </p>
                </div>

                {error && (
                  <div className="mt-6 rounded-md bg-red-light-6 px-4 py-3 text-sm text-red">
                    {error}
                  </div>
                )}

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <Field
                    label="First name"
                    value={form.first_name}
                    onChange={(value) => updateField("first_name", value)}
                    required
                  />
                  <Field
                    label="Last name"
                    value={form.last_name}
                    onChange={(value) => updateField("last_name", value)}
                    required
                  />
                </div>

                <div className="mt-5">
                  <Field
                    label="Address"
                    value={form.line1}
                    onChange={(value) => updateField("line1", value)}
                    required
                  />
                </div>

                <div className="mt-5">
                  <Field
                    label="Apartment / unit (optional)"
                    value={form.line2}
                    onChange={(value) => updateField("line2", value)}
                  />
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <Field
                    label="City"
                    value={form.city}
                    onChange={(value) => updateField("city", value)}
                    required
                  />
                  <Field
                    label="State / province"
                    value={form.state}
                    onChange={(value) => updateField("state", value)}
                  />
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Postcode"
                    value={form.postcode}
                    onChange={(value) => updateField("postcode", value)}
                    required
                  />

                  <label className="block">
                    <span className="mb-2.5 block">Country</span>
                    <select
                      required
                      value={form.country}
                      onChange={(event) => updateField("country", event.target.value)}
                      className="w-full rounded-lg border border-gray-3 bg-gray-1 px-5 py-3 outline-none focus:ring-2 focus:ring-blue/20"
                    >
                      <option value="">Select a country</option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-5">
                  <Field
                    label="Phone (optional)"
                    value={form.phone_number}
                    onChange={(value) => updateField("phone_number", value)}
                  />
                </div>

                <div className="mt-5">
                  <label className="block">
                    <span className="mb-2.5 block">Notes (optional)</span>
                    <textarea
                      value={form.notes}
                      onChange={(event) => updateField("notes", event.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-gray-3 bg-gray-1 px-5 py-3 outline-none focus:ring-2 focus:ring-blue/20"
                    />
                  </label>
                </div>

                {addresses.length > 0 && (
                  <div className="mt-6 rounded-lg bg-gray-1 p-4">
                    <p className="font-medium text-dark">Saved addresses</p>
                    <p className="mt-1 text-sm text-gray-5">
                      Your default address was loaded automatically. You can edit the fields above
                      before placing the order.
                    </p>
                  </div>
                )}

                <label className="mt-6 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.save_address}
                    onChange={(event) => updateField("save_address", event.target.checked)}
                  />
                  <span className="text-sm text-gray-5">Save this address to my account.</span>
                </label>
              </div>

              <div className="h-fit rounded-xl bg-white p-5 shadow-1 sm:p-8">
                <h2 className="text-xl font-semibold text-dark">Your order</h2>

                <div className="mt-5 border-y border-gray-3">
                  {basket?.lines.map((line) => (
                    <div
                      key={line.id}
                      className="flex justify-between gap-4 border-b border-gray-3 py-4 last:border-b-0"
                    >
                      <div className="text-sm">
                        <p className="font-medium text-dark">{line.title}</p>
                        <p className="mt-1 text-gray-5">Qty: {line.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-dark">
                        {line.line_total} {line.currency ?? basket.currency ?? ""}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 space-y-3">
                  <SummaryRow
                    label="Subtotal"
                    value={`${subtotal} ${basket?.currency ?? shippingCurrency}`}
                  />
                  <SummaryRow
                    label="Shipping"
                    value={`${shippingPrice} ${shippingCurrency || basket?.currency || ""}`}
                  />
                  <div className="flex justify-between border-t border-gray-3 pt-4 font-semibold text-dark">
                    <span>Total</span>
                    <span>
                      {total} {basket?.currency ?? shippingCurrency}
                    </span>
                  </div>
                </div>

                <div className="mt-6 rounded-lg bg-yellow-light-4 p-4 text-sm text-dark">
                  Payment provider integration is the remaining production step. In local
                  development you may create a pending order; production checkout should remain
                  disabled until payment verification is connected.
                </div>

                <button
                  type="submit"
                  disabled={submitting || !basket || basket.is_empty}
                  className="mt-6 w-full rounded-md bg-blue px-6 py-3 font-medium text-white hover:bg-blue-dark disabled:cursor-not-allowed disabled:bg-gray-4"
                >
                  {submitting ? "Creating order..." : "Place pending order"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 block">
        {label}
        {required && <span className="pl-1 text-red">*</span>}
      </span>
      <input
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-3 bg-gray-1 px-5 py-3 outline-none focus:ring-2 focus:ring-blue/20"
      />
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-gray-5">{label}</span>
      <span className="font-medium text-dark">{value}</span>
    </div>
  );
}
