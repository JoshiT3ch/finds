import React from 'react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="border-b border-sage-300/60 bg-linear-to-br from-sage-200 via-sage-100 to-sage-300/60 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <h2 className="mx-auto mb-4 max-w-3xl text-4xl font-bold tracking-tight text-black md:text-5xl">
          Good clothes deserve another find.
        </h2>

        {/* Subheading */}
        <p className="text-lg text-black mb-8 max-w-2xl mx-auto">
          Discover pre-loved, thrifted, vintage, and second-hand clothing. Give your favorites a new home.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/browse"
            className="inline-block rounded-full bg-sage-300 px-8 py-3 font-semibold text-black shadow-sm transition hover:bg-sage-400"
          >
            Browse Finds
          </Link>
          <Link
            href="/sell"
            className="inline-block rounded-full border-2 border-sage-900 bg-surface/50 px-8 py-3 font-semibold text-black transition hover:bg-surface"
          >
            Sell Something
          </Link>
        </div>
      </div>
    </section>
  );
}
