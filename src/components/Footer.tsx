import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#111111] px-4 py-10 text-white sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Main Footer */}
        <div className="grid grid-cols-1 gap-12 pb-12 md:grid-cols-[2fr_1fr_1fr_1fr] md:gap-10">

          {/* Brand / Editorial Message */}
          <div className="max-w-xl">
            <h2
              className="text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
              }}
            >
              Good clothes deserve
              <br />
              <span className="italic">another chapter.</span>
            </h2>

            <p className="mt-6 max-w-lg text-base leading-7 text-gray-300 sm:text-lg">
              Discover pre-loved pieces, give your wardrobe a fresh
              perspective, and pass great style forward.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.15em] text-white">
              Browse
            </h3>

            <ul className="space-y-3 text-sm text-gray-300 sm:text-base">
              <li>
                <Link
                  href="/browse"
                  className="transition hover:text-white hover:underline"
                >
                  All Items
                </Link>
              </li>

              <li>
                <Link
                  href="/browse"
                  className="transition hover:text-white hover:underline"
                >
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.15em] text-white">
              Sell
            </h3>

            <ul className="space-y-3 text-sm text-gray-300 sm:text-base">
              <li>
                <Link
                  href="/sell"
                  className="transition hover:text-white hover:underline"
                >
                  List an Item
                </Link>
              </li>

              <li>
                <Link
                  href="/how-it-works"
                  className="transition hover:text-white hover:underline"
                >
                  How it Works
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.15em] text-white">
              About
            </h3>

            <ul className="space-y-3 text-sm text-gray-300 sm:text-base">
              <li>
                <Link
                  href="/about"
                  className="transition hover:text-white hover:underline"
                >
                  About Finds
                </Link>
              </li>

              <li>
                <span className="text-gray-300">Contact</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700" />

        {/* Bottom Footer */}
        <div className="flex flex-col gap-4 pt-6 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 Finds. All rights reserved.</p>

          <div className="flex gap-5">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}