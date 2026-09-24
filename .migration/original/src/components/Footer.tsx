import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-sage-900 px-4 py-10 font-sans text-black sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-2xl bg-sage-200 px-6 py-8 sm:p-10 lg:p-12">
        <div className="mb-10 grid grid-cols-2 gap-x-6 gap-y-10 text-lg leading-8 md:grid-cols-4 md:gap-10">
          {/* Brand */}
          <div>
            <h3 className="mb-5 text-3xl font-bold tracking-tight sm:text-4xl">Finds</h3>
          </div>

          {/* Browse */}
          <div>
            <h4 className="mb-5 text-xl font-semibold tracking-tight">Browse</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/browse"
                  className="text-black underline-offset-4 hover:underline"
                >
                  All Items
                </Link>
              </li>
              <li>
                <Link
                  href="/browse"
                  className="text-black underline-offset-4 hover:underline"
                >
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h4 className="mb-5 text-xl font-semibold tracking-tight">Sell</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/sell"
                  className="text-black underline-offset-4 hover:underline"
                >
                  List an Item
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-black underline-offset-4 hover:underline"
                >
                  How it Works
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="mb-5 text-xl font-semibold tracking-tight">About</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-black underline-offset-4 hover:underline"
                >
                  About Finds
                </Link>
              </li>

              <li>
                <span className="text-black" aria-label="Contact is coming soon">
                  Contact
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-sage-500/40"></div>

        {/* Copyright */}
        <div className="pt-6 text-base leading-7 text-black">
          <p>&copy; 2026 Finds. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
