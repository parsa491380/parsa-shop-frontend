import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "فروشگاه کفش و پوشاک",
  description: "خرید آنلاین کفش و پوشاک",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
