import Image from "next/image";
import Link from "next/link";

interface ProductCardListing {
  id: string | number;
  name: string;
  price: number;
  size: string;
  condition: string;
  image: string | null;
  slug?: string;
}

interface ProductCardProps {
  listing: ProductCardListing;
}

export default function ProductCard({ listing }: ProductCardProps) {
  const itemIdentifier = listing.slug ?? String(listing.id);

  const formattedPrice = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(listing.price);

  return (
    <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg">
      {/* Product Image */}
      <div className="relative flex h-72 items-center justify-center overflow-hidden bg-gray-100">
        {listing.image?.startsWith("https://") ? (
          <Image
            src={listing.image}
            alt={listing.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : listing.image ? (
          <div className="text-6xl">{listing.image}</div>
        ) : (
          <div className="px-6 text-center text-sm font-medium text-gray-500">
            Image unavailable
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-5">
        <h3 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900">
          {listing.name}
        </h3>

        <div className="mb-3">
          <span className="text-xl font-bold text-black">
            {formattedPrice}
          </span>
        </div>

        <div className="space-y-1 text-sm text-gray-500">
          <p>Size: {listing.size}</p>
          <p>Condition: {listing.condition}</p>
        </div>

        {/* View Item Button */}
        <Link
          href={`/items/${itemIdentifier}`}
          className="mt-5 block w-full rounded-lg bg-black py-2.5 text-center text-sm font-medium text-white transition hover:bg-gray-800"
        >
          View Item
        </Link>
      </div>
    </div>
  );
}