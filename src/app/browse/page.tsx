'use client';

import React, { useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { listings } from '@/data/listings';

// Get unique categories and conditions from listings
const categories = Array.from(new Set(listings.map((l) => l.category))).sort();
const conditions = Array.from(new Set(listings.map((l) => l.condition))).sort();

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');

  // Filter listings based on search, category, and condition
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesSearch =
        listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === '' || listing.category === selectedCategory;

      const matchesCondition =
        selectedCondition === '' || listing.condition === selectedCondition;

      return matchesSearch && matchesCategory && matchesCondition;
    });
  }, [searchQuery, selectedCategory, selectedCondition]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCondition('');
  };

  const hasActiveFilters =
    searchQuery !== '' || selectedCategory !== '' || selectedCondition !== '';

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Finds</h1>
          <p className="text-gray-600">
            Discover {listings.length} unique second-hand, thrifted, and vintage
            clothing items.
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search Input */}
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Search
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search by item name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition Filter */}
            <div>
              <label
                htmlFor="condition"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Condition
              </label>
              <select
                id="condition"
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition bg-white"
              >
                <option value="">All Conditions</option>
                {conditions.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <div className="mt-4">
              <button
                onClick={resetFilters}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 underline transition"
                aria-label="Reset all filters"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {filteredListings.length} of {listings.length} items
            {hasActiveFilters && ' shown'}
          </p>
        </div>

        {/* Listings Grid or Empty State */}
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <ProductCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              No items found matching your filters.
            </p>
            <button
              onClick={resetFilters}
              className="text-gray-900 font-medium hover:underline transition"
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
