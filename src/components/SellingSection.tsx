import React from 'react';
import Link from 'next/link';

export default function SellingSection() {
  return (
    <section className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Have clothes you no longer wear?
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Turn your closet into cash. List your items on Finds and connect with buyers looking for great second-hand finds.
        </p>
        <Link
          href="/sell"
          className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 font-semibold transition"
        >
          Start Selling
        </Link>
      </div>
    </section>
  );
}
