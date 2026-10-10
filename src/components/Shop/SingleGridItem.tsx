"use client";

import React from "react";
import ProductItem from "../Common/ProductItem";
import { Product } from "@/types/product";

export default function SingleGridItem({ item }: { item: Product }) {
  return <ProductItem item={item} />;
}
