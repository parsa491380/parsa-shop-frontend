import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/store-api";
import ProductDetails from "@/components/ProductDetails";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await getProduct(slug);

    return {
      title: `${product.title} | My Shop`,
      description: product.description?.slice(0, 160) || `${product.title} available in our store.`,
    };
  } catch {
    return {
      title: "Product | My Shop",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  try {
    const product = await getProduct(slug);
    return <ProductDetails product={product} />;
  } catch {
    notFound();
  }
}
