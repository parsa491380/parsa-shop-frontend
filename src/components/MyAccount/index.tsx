"use client";

import React, { FormEvent, useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Link from "next/link";
import Orders from "../Orders";
import {
  createAddress,
  deleteAddress,
  getAddresses,
  getCountries,
  type StoreAddress,
  type StoreCountry,
} from "@/lib/store-api";
import { useStore } from "@/app/context/StoreContext";

interface AddressForm {
  first_name: string;
  last_name: string;
  line1: string;
  line2: string;
  line4: string;
  state: string;
  postcode: string;
  country: string;
  phone_number: string;
  is_default_for_shipping: boolean;
  is_default_for_billing: boolean;
}

const emptyAddress: AddressForm = {
  first_name: "",
  last_name: "",
  line1: "",
  line2: "",
  line4: "",
  state: "",
  postcode: "",
  country: "",
  phone_number: "",
  is_default_for_shipping: false,
  is_default_for_billing: false,
};

export default function MyAccount() {
  const { user, loading, signOut } = useStore();

  const [tab, setTab] = useState("dashboard");
  const [addresses, setAddresses] = useState<StoreAddress[]>([]);
  const [countries, setCountries] = useState<StoreCountry[]>([]);
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddress);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (!user) return;

    Promise.all([getAddresses(), getCountries()])
      .then(([addressResult, countryResult]) => {
        setAddresses(addressResult);
        setCountries(countryResult);
      })
      .catch((error) => {
        setAddressError(error instanceof Error ? error.message : "Unable to load your addresses.");
      });
  }, [user]);

  async function handleAddressSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddressError(null);
    setSavingAddress(true);

    try {
      await createAddress(addressForm);
      setAddresses(await getAddresses());
      setAddressForm(emptyAddress);
    } catch (error) {
      setAddressError(error instanceof Error ? error.message : "Unable to save the address.");
    } finally {
      setSavingAddress(false);
    }
  }

  async function handleDeleteAddress(id: number) {
    try {
      await deleteAddress(id);
      setAddresses(await getAddresses());
    } catch (error) {
      setAddressError(error instanceof Error ? error.message : "Unable to delete the address.");
    }
  }

  async function handleLogout() {
    await signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <>
        <Breadcrumb title="My Account" pages={["My Account"]} />
        <section className="bg-gray-2 py-20">
          <div className="mx-auto max-w-[1170px] px-4 text-center">Loading account...</div>
        </section>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Breadcrumb title="My Account" pages={["My Account"]} />
        <section className="bg-gray-2 py-20">
          <div className="mx-auto max-w-[570px] rounded-xl bg-white p-8 text-center shadow-1">
            <h1 className="text-2xl font-semibold text-dark">You are not signed in</h1>
            <p className="mt-3 text-gray-5">
              Sign in to view orders, saved addresses, and account details.
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

  return (
    <>
      <Breadcrumb title="My Account" pages={["My Account"]} />

      <section className="bg-gray-2 py-20">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className="grid gap-7.5 lg:grid-cols-[280px_1fr]">
            <aside className="h-fit rounded-xl bg-white p-4 shadow-1">
              <div className="border-b border-gray-3 px-2 pb-5">
                <p className="font-medium text-dark">
                  {user.first_name} {user.last_name}
                </p>
                <p className="mt-1 text-sm text-gray-5">{user.email}</p>
              </div>

              <nav className="mt-4 flex flex-col gap-2">
                {[
                  ["dashboard", "Dashboard"],
                  ["orders", "Orders"],
                  ["addresses", "Addresses"],
                  ["account", "Account details"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTab(value)}
                    className={`rounded-md px-4 py-3 text-left text-sm font-medium ${
                      tab === value
                        ? "bg-blue text-white"
                        : "bg-gray-1 text-dark hover:bg-blue hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md bg-gray-1 px-4 py-3 text-left text-sm font-medium text-dark hover:bg-red hover:text-white"
                >
                  Sign out
                </button>
              </nav>
            </aside>

            <div className="rounded-xl bg-white shadow-1">
              {tab === "dashboard" && (
                <div className="p-7.5">
                  <h2 className="text-2xl font-semibold text-dark">
                    Welcome, {user.first_name || user.email}.
                  </h2>
                  <p className="mt-3 max-w-2xl text-gray-5">
                    From your account you can review your orders, manage addresses, and keep your
                    store details up to date.
                  </p>

                  <Link
                    href="/shop-with-sidebar"
                    className="mt-7 inline-flex rounded-md bg-blue px-6 py-3 font-medium text-white hover:bg-blue-dark"
                  >
                    Continue shopping
                  </Link>
                </div>
              )}

              {tab === "orders" && (
                <div>
                  <div className="border-b border-gray-3 p-7.5">
                    <h2 className="text-xl font-semibold text-dark">Your orders</h2>
                  </div>
                  <Orders />
                </div>
              )}

              {tab === "addresses" && (
                <div className="p-7.5">
                  <div>
                    <h2 className="text-xl font-semibold text-dark">Saved addresses</h2>
                    <p className="mt-1 text-sm text-gray-5">
                      Addresses are stored in Django/Oscar, not in browser storage.
                    </p>
                  </div>

                  {addressError && (
                    <p className="mt-5 rounded-md bg-red-light-6 px-4 py-3 text-sm text-red">
                      {addressError}
                    </p>
                  )}

                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    {addresses.map((address) => (
                      <div key={address.id} className="rounded-lg border border-gray-3 p-5">
                        <p className="font-medium text-dark">
                          {address.first_name} {address.last_name}
                        </p>
                        <p className="mt-2 text-sm text-gray-5">
                          {address.line1}
                          {address.line2 && <>, {address.line2}</>}
                          <br />
                          {address.line4}, {address.state} {address.postcode}
                          <br />
                          {address.country_name}
                        </p>

                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(address.id)}
                          className="mt-4 text-sm font-medium text-red hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddressSubmit} className="mt-8 border-t border-gray-3 pt-7">
                    <h3 className="text-lg font-medium text-dark">Add an address</h3>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      <AccountField
                        label="First name"
                        value={addressForm.first_name}
                        onChange={(value) =>
                          setAddressForm((current) => ({
                            ...current,
                            first_name: value,
                          }))
                        }
                        required
                      />

                      <AccountField
                        label="Last name"
                        value={addressForm.last_name}
                        onChange={(value) =>
                          setAddressForm((current) => ({
                            ...current,
                            last_name: value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="mt-5">
                      <AccountField
                        label="Address"
                        value={addressForm.line1}
                        onChange={(value) =>
                          setAddressForm((current) => ({
                            ...current,
                            line1: value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="mt-5">
                      <AccountField
                        label="Apartment / unit"
                        value={addressForm.line2}
                        onChange={(value) =>
                          setAddressForm((current) => ({
                            ...current,
                            line2: value,
                          }))
                        }
                      />
                    </div>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      <AccountField
                        label="City"
                        value={addressForm.line4}
                        onChange={(value) =>
                          setAddressForm((current) => ({
                            ...current,
                            line4: value,
                          }))
                        }
                        required
                      />

                      <AccountField
                        label="State / province"
                        value={addressForm.state}
                        onChange={(value) =>
                          setAddressForm((current) => ({
                            ...current,
                            state: value,
                          }))
                        }
                      />
                    </div>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      <AccountField
                        label="Postcode"
                        value={addressForm.postcode}
                        onChange={(value) =>
                          setAddressForm((current) => ({
                            ...current,
                            postcode: value,
                          }))
                        }
                        required
                      />

                      <label className="block">
                        <span className="mb-2.5 block">Country</span>
                        <select
                          required
                          value={addressForm.country}
                          onChange={(event) =>
                            setAddressForm((current) => ({
                              ...current,
                              country: event.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-gray-3 bg-gray-1 px-5 py-3 outline-none focus:ring-2 focus:ring-blue/20"
                        >
                          <option value="">Select country</option>
                          {countries.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="mt-5">
                      <AccountField
                        label="Phone"
                        value={addressForm.phone_number}
                        onChange={(value) =>
                          setAddressForm((current) => ({
                            ...current,
                            phone_number: value,
                          }))
                        }
                      />
                    </div>

                    <div className="mt-5 flex flex-wrap gap-5 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={addressForm.is_default_for_shipping}
                          onChange={(event) =>
                            setAddressForm((current) => ({
                              ...current,
                              is_default_for_shipping: event.target.checked,
                            }))
                          }
                        />
                        Default shipping address
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={addressForm.is_default_for_billing}
                          onChange={(event) =>
                            setAddressForm((current) => ({
                              ...current,
                              is_default_for_billing: event.target.checked,
                            }))
                          }
                        />
                        Default billing address
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="mt-6 rounded-md bg-blue px-7 py-3 font-medium text-white hover:bg-blue-dark disabled:bg-gray-4"
                    >
                      {savingAddress ? "Saving..." : "Save address"}
                    </button>
                  </form>
                </div>
              )}

              {tab === "account" && (
                <div className="p-7.5">
                  <h2 className="text-xl font-semibold text-dark">Account details</h2>

                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <div className="rounded-lg bg-gray-1 p-5">
                      <p className="text-sm text-gray-5">First name</p>
                      <p className="mt-1 font-medium text-dark">{user.first_name || "—"}</p>
                    </div>

                    <div className="rounded-lg bg-gray-1 p-5">
                      <p className="text-sm text-gray-5">Last name</p>
                      <p className="mt-1 font-medium text-dark">{user.last_name || "—"}</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-lg bg-gray-1 p-5">
                    <p className="text-sm text-gray-5">Email</p>
                    <p className="mt-1 font-medium text-dark">{user.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function AccountField({
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
