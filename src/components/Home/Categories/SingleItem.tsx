import Link from "next/link";
import Image from "next/image";
import type { StoreCategory } from "@/lib/store-api";

export default function SingleItem({ item }: { item: StoreCategory }) {
  return (
    <Link
      href={`/shop-with-sidebar?category=${encodeURIComponent(item.slug)}`}
      className="group flex flex-col items-center"
    >
      <div className="max-w-[130px] w-full bg-[#F2F3F8] h-32.5 rounded-full flex items-center justify-center mb-4 overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            width={110}
            height={110}
            className="h-[110px] w-[110px] object-contain"
          />
        ) : (
          <span className="text-3xl font-semibold text-blue">
            {item.name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>

      <div className="text-center">
        <h3 className="font-medium text-dark group-hover:text-blue">{item.name}</h3>
        <p className="mt-1 text-xs text-gray-5">{item.product_count ?? 0} products</p>
      </div>
    </Link>
  );
}
