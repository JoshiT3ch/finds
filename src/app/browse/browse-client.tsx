"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { categories, conditions, listings } from "@/data/listings";

type BrowseClientProps = {
  showCreatedMessage: boolean;
};

export function BrowseClient({ showCreatedMessage }: BrowseClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCondition, setSelectedCondition] = useState<string>("");

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesSearch =
        listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "" || listing.category === selectedCategory;

      const matchesCondition =
        selectedCondition === "" || listing.condition === selectedCondition;

      return matchesSearch && matchesCategory && matchesCondition;
    });
  }, [searchQuery, selectedCategory, selectedCondition]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedCondition("");
  };

  const hasActiveFilters =
    searchQuery !== "" || selectedCategory !== "" || selectedCondition !== "";

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Browse Finds
          </h1>
          <p className="text-gray-600">
            Discover {listings.length} unique second-hand, thrifted, and vintage
            clothing items.
          </p>
        </div>

        {showCreatedMessage ? (
          <div
            role="status"
            className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800"
          >
            Your listing was published successfully.
          </div>
        ) : null}

        <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label
                htmlFor="search"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Search
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search by item name..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-gray-900"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="condition"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Condition
              </label>
              <select
                id="condition"
                value={selectedCondition}
                onChange={(event) => setSelectedCondition(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-gray-900"
              >
                <option value="">All Conditions</option>
                {conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters ? (
            <div className="mt-4">
              <button
                onClick={resetFilters}
                className="text-sm font-medium text-gray-600 underline transition hover:text-gray-900"
                aria-label="Reset all filters"
              >
                Clear all filters
              </button>
            </div>
          ) : null}
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {filteredListings.length} of {listings.length} items
            {hasActiveFilters && " shown"}
          </p>
        </div>

        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((listing) => (
              <ProductCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="mb-4 text-gray-600">
              No items found matching your filters.
            </p>
            <button
              onClick={resetFilters}
              className="font-medium text-gray-900 transition hover:underline"
              aria-label="Reset filters and try again"
            >
              Clear filters and try again
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
