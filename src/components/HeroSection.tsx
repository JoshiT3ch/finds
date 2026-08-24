import React from 'react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Good clothes deserve another find.
        </h2>

        {/* Subheading */}
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover pre-loved, thrifted, vintage, and second-hand clothing. Give your favorites a new home.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/browse"
            className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 font-semibold transition inline-block"
          >
            Browse Finds
          </Link>
          <Link
            href="/sell"
            className="border-2 border-gray-900 text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-50 font-semibold transition inline-block"
          >
            Sell Something
          </Link>
        </div>
      </div>
    </section>
  );
}
