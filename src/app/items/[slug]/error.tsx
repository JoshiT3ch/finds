"use client";

import Link from "next/link";

export default function ItemError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">
        Something went wrong while loading this item.
      </h1>
      <p className="mt-3 text-gray-600">Please try again or return to Browse.</p>
      <div className="mt-8 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Try again
        </button>
        <Link
          href="/browse"
          className="rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
        >
          Back to Browse
        </Link>
      </div>
    </main>
  );
}
