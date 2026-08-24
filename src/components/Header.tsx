import React from 'react';

export default function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900">Finds</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#"
              className="text-gray-700 hover:text-gray-900 font-medium text-sm"
            >
              Browse
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-gray-900 font-medium text-sm"
            >
              Sell
            </a>
          </nav>

          {/* Search and CTA */}
          <div className="flex items-center gap-4">
            <button className="hidden sm:block text-gray-700 hover:text-gray-900">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            <a
              href="#"
              className="hidden sm:block text-gray-700 hover:text-gray-900 font-medium text-sm"
            >
              Sign In
            </a>

            <button className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 font-medium text-sm transition">
              List an Item
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
