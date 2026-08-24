import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold mb-4">Finds</h3>
          </div>

          {/* Browse */}
          <div>
            <h4 className="font-semibold mb-4">Browse</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/browse"
                  className="text-gray-400 hover:text-white transition"
                >
                  All Items
                </Link>
              </li>
              <li>
                <Link
                  href="/browse"
                  className="text-gray-400 hover:text-white transition"
                >
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h4 className="font-semibold mb-4">Sell</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/sell"
                  className="text-gray-400 hover:text-white transition"
                >
                  List an Item
                </Link>
              </li>
              <li>
                <span
                  className="text-gray-500"
                  aria-label="How it works is coming soon"
                >
                  How it Works
                </span>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-semibold mb-4">About</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-500" aria-label="About Finds is coming soon">
                  About Finds
                </span>
              </li>
              <li>
                <span className="text-gray-500" aria-label="Contact is coming soon">
                  Contact
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800"></div>

        {/* Copyright */}
        <div className="pt-8 text-gray-400 text-sm">
          <p>&copy; 2026 Finds. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
