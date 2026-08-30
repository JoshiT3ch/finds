import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Link from "next/link";

export default function ItemNotFound() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Listing unavailable
        </p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">
          We couldn’t find that item.
        </h1>
        <p className="mt-3 text-gray-600">
          It may have been removed or is no longer available.
        </p>
        <Link
          href="/browse"
          className="mt-8 inline-flex rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
        >
          Back to Browse
        </Link>
      </main>
      <Footer />
    </div>
  );
}
