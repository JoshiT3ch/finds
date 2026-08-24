import React from 'react';

interface ProductCardProps {
  image: string;
  name: string;
  price: number;
  size: string;
  condition: string;
}

export default function ProductCard({
  image,
  name,
  price,
  size,
  condition,
}: ProductCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
      {/* Image */}
      <div className="bg-gray-100 h-64 flex items-center justify-center overflow-hidden">
        {image.startsWith('http') ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl">{image}</div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {name}
        </h3>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold text-gray-900">₱{price}</span>
        </div>

        <div className="space-y-1 text-sm text-gray-600">
          <p>Size: {size}</p>
          <p>Condition: {condition}</p>
        </div>

        <button className="w-full mt-4 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 font-medium transition text-sm">
          View Item
        </button>
      </div>
    </div>
  );
}
