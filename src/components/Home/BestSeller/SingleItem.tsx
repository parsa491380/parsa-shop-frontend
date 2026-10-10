"use client";

import React from "react";
import ProductItem from "@/components/Common/ProductItem";
import { Product } from "@/types/product";

export default function SingleItem({ item }: { item: Product }) {
  return <ProductItem item={item} />;
}
