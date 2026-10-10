import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shoes & Clothing Store",
  description: "Shop shoes and clothing online.",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
