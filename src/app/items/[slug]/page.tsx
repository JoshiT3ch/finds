import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getListingBySlug, listings } from '@/data/listings';

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
  params: Promise<{
    slug: string;
  }>;
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { slug } = await params;
  const listing = getListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-medium"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
            {listing.image.startsWith('http') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.image}
                alt={listing.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-9xl">{listing.image}</div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="mb-4">
              <span className="inline-block bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                {listing.category}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {listing.name}
            </h1>

            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-4xl font-bold text-gray-900">₱{listing.price}</p>
            </div>

            {/* Item Specs */}
            <div className="mb-6 pb-6 border-b border-gray-200 space-y-3">
              <div>
                <p className="text-sm text-gray-600 font-medium">Size</p>
                <p className="text-lg text-gray-900">{listing.size}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Condition</p>
                <p className="text-lg text-gray-900">{listing.condition}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Description
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Seller Info */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                About the Seller
              </h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Seller</p>
                  <p className="text-gray-900">{listing.sellerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Location</p>
                  <p className="text-gray-900">{listing.location}</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 font-semibold transition text-lg">
              Message Seller
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
