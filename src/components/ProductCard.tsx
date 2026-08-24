import React from 'react';
import Link from 'next/link';
import { Listing } from '@/data/listings';

interface ProductCardProps {
  listing: Listing;
}

export default function ProductCard({ listing }: ProductCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
      {/* Image */}
      <div className="bg-gray-100 h-64 flex items-center justify-center overflow-hidden">
        {listing.image.startsWith('http') ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.image}
            alt={listing.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl">{listing.image}</div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {listing.name}
        </h3>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold text-gray-900">₱{listing.price}</span>
        </div>

        <div className="space-y-1 text-sm text-gray-600">
          <p>Size: {listing.size}</p>
          <p>Condition: {listing.condition}</p>
        </div>

        <Link
          href={`/items/${listing.slug}`}
          className="w-full mt-4 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 font-medium transition text-sm block text-center"
        >
          View Item
        </Link>
      </div>
    </div>
  );
}
