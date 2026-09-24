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
    <div className="overflow-hidden rounded-2xl border border-sage-300 bg-surface shadow-sm shadow-sage-900/5 transition hover:border-sage-400 hover:shadow-lg hover:shadow-sage-900/10">
      <div className="relative flex h-64 items-center justify-center overflow-hidden bg-sage-100">
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
          <div className="px-6 text-center text-sm font-medium text-black">
            Image unavailable
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="mb-2 line-clamp-2 font-semibold text-black">
          {listing.name}
        </h3>

        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-xl font-bold text-black">
            {formattedPrice}
          </span>
        </div>

        <div className="space-y-1 text-sm text-black">
          <p>Size: {listing.size}</p>
          <p>Condition: {listing.condition}</p>
        </div>

        <Link
          href={`/items/${itemIdentifier}`}
          className="mt-4 block w-full rounded-lg bg-sage-300 py-2 text-center text-sm font-medium text-black transition hover:bg-sage-400"
        >
          View Item
        </Link>
      </div>
    </div>
  );
}
