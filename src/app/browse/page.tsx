import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { listings } from '@/data/listings';

export const metadata = {
  title: 'Browse Finds - Finds Marketplace',
  description: 'Browse all second-hand and thrifted clothing on Finds',
};

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Finds</h1>
          <p className="text-gray-600">
            Discover {listings.length} unique second-hand, thrifted, and vintage clothing items.
          </p>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ProductCard key={listing.id} listing={listing} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
