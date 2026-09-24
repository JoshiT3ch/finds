"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

type SearchMode = "listings" | "people";

export default function HeaderSearch() {
  const router = useRouter();
  const [mode, setMode] = useState<SearchMode>("listings");
  const [query, setQuery] = useState("");

  const placeholder =
    mode === "listings"
      ? "What are you looking for?"
      : "Who are you looking for?";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedQuery = query.trim();
    const destination = mode === "listings" ? "/browse" : "/people";

    router.push(
      normalizedQuery
        ? `${destination}?search=${encodeURIComponent(normalizedQuery)}`
        : destination,
    );
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex h-11 w-full items-center rounded-full border border-gray-300 bg-white transition hover:border-gray-400 focus-within:border-black focus-within:ring-2 focus-within:ring-black/10"
    >
      <label htmlFor="header-search-mode" className="sr-only">
        Search type
      </label>

      <select
        id="header-search-mode"
        value={mode}
        onChange={(event) => setMode(event.target.value as SearchMode)}
        className="ml-3 max-w-[104px] cursor-pointer border-0 bg-transparent py-2 pl-1 pr-2 text-sm font-medium text-black outline-none"
      >
        <option value="listings">Listings</option>
        <option value="people">People</option>
      </select>

      <span
        className="h-6 w-px flex-shrink-0 bg-gray-200"
        aria-hidden="true"
      />

      <label htmlFor="header-search-query" className="sr-only">
        {placeholder}
      </label>

      <input
        id="header-search-query"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-0 bg-transparent px-4 py-2 text-sm text-black outline-none placeholder:text-gray-500"
      />

      <button
        type="submit"
        aria-label={`Search ${mode}`}
        className="mr-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-black transition hover:bg-gray-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-black/20"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0"
          />
        </svg>
      </button>
    </form>
  );
}