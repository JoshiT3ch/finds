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
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-lg">
      <div className="relative flex h-64 items-center justify-center overflow-hidden bg-gray-100">
        {listing.image?.startsWith("https://") ? (
          <Image
            src={listing.image}
            alt={listing.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : listing.image ? (
          <div className="text-6xl">{listing.image}</div>
        ) : (
          <div className="px-6 text-center text-sm font-medium text-gray-500">
            Image unavailable
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900">
          {listing.name}
        </h3>

        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-xl font-bold text-gray-900">
            {formattedPrice}
          </span>
        </div>

        <div className="space-y-1 text-sm text-gray-600">
          <p>Size: {listing.size}</p>
          <p>Condition: {listing.condition}</p>
        </div>

        <Link
          href={`/items/${itemIdentifier}`}
          className="mt-4 block w-full rounded-lg bg-gray-900 py-2 text-center text-sm font-medium text-white transition hover:bg-gray-800"
        >
          View Item
        </Link>
      </div>
    </div>
  );
}
