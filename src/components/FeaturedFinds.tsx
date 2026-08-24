import React from 'react';
import ProductCard from './ProductCard';
import { listings } from '@/data/listings';

export default function FeaturedFinds() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Finds</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.slice(0, 6).map((listing) => (
          <ProductCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
