"use client";

import Link from "next/link";

export default function ItemError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-black">
        Something went wrong while loading this item.
      </h1>
      <p className="mt-3 text-black">Please try again or return to Browse.</p>
      <div className="mt-8 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg border border-sage-300 px-6 py-3 font-semibold text-black transition hover:bg-sage-50"
        >
          Try again
        </button>
        <Link
          href="/browse"
          className="rounded-lg bg-sage-300 px-6 py-3 font-semibold text-black transition hover:bg-sage-400"
        >
          Back to Browse
        </Link>
      </div>
    </main>
  );
}
