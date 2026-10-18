"use client";

import React, { useEffect, useState } from "react";
import { getOrders, type StoreOrder } from "@/lib/store-api";
import { useStore } from "@/app/context/StoreContext";

export default function Orders() {
  const { user } = useStore();
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let active = true;

    (async () => {
      try {
        const result = await getOrders();
        if (active) setOrders(result);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unable to load orders.");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user]);

  if (loading) {
    return <p className="p-7.5 text-gray-5">Loading orders...</p>;
  }

  if (error) {
    return <p className="p-7.5 text-red">{error}</p>;
  }

  if (!orders.length) {
    return (
      <div className="p-7.5">
        <p className="text-dark">You don&apos;t have any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto p-5 sm:p-7.5">
      <table className="w-full min-w-[650px] text-left">
        <thead>
          <tr className="border-b border-gray-3 text-sm text-gray-5">
            <th className="pb-4 pr-5 font-medium">Order</th>
            <th className="pb-4 pr-5 font-medium">Date</th>
            <th className="pb-4 pr-5 font-medium">Status</th>
            <th className="pb-4 pr-5 font-medium">Items</th>
            <th className="pb-4 font-medium">مجموع</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-gray-3 last:border-b-0">
              <td className="py-4 pr-5 font-medium text-dark">#{order.number}</td>
              <td className="py-4 pr-5 text-sm text-gray-5">
                {new Date(order.date_placed).toLocaleDateString()}
              </td>
              <td className="py-4 pr-5 text-sm text-gray-5">{order.status}</td>
              <td className="py-4 pr-5 text-sm text-gray-5">
                {order.lines.reduce((total, line) => total + line.quantity, 0)}
              </td>
              <td className="py-4 font-medium text-dark">
                {order.total_incl_tax} {order.currency}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
