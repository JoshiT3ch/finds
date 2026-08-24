import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ItemActions from '@/components/ItemActions';
import { getListingBySlug, getRelatedListings, listings } from '@/data/listings';

export const metadata = {
  title: 'Item Details - Finds Marketplace',
  description: 'View item details on Finds',
};

export function generateStaticParams() {
  return listings.map((listing) => ({
    slug: listing.slug,
  }));
}

interface ItemPageProps {
  params: {
    slug: string;
  };
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { slug } = await params;
  const listing = getListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  const relatedListings = getRelatedListings(slug, 3);

  // Get seller initial for avatar
  const sellerInitial = listing.sellerName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-medium transition"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Browse
        </Link>

        {/* Item Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Image Column */}
          <div className="lg:col-span-2">
            <div className="bg-gray-100 rounded-lg h-96 sm:h-[500px] flex items-center justify-center overflow-hidden border border-gray-200">
              {listing.image.startsWith('http') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.image}
                  alt={listing.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-9xl">{listing.image}</div>
              )}
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-1">
            {/* Category Badge */}
            <div className="mb-4">
              <span className="inline-block bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                {listing.category}
              </span>
            </div>

            {/* Title and Price */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">
              {listing.name}
            </h1>

            {listing.brand && (
              <p className="text-sm text-gray-500 font-medium mb-4">
                {listing.brand}
              </p>
            )}

            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                ₱{listing.price.toLocaleString()}
              </p>
            </div>

            {/* Item Details */}
            <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Size
                  </p>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {listing.size}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Condition
                  </p>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {listing.condition}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Details
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                {listing.description}
              </p>
            </div>

            {/* Seller Card */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Seller
              </h2>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-gray-700">
                    {sellerInitial}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">
                    {listing.sellerName}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {listing.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <ItemActions />
          </div>
        </div>

        {/* Related Finds Section */}
        {relatedListings.length > 0 && (
          <section className="border-t border-gray-200 pt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Related Finds
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedListings.map((relatedListing) => (
                <ProductCard
                  key={relatedListing.id}
                  listing={relatedListing}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
