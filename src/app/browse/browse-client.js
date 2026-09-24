import { queryParam } from "../../../server/request.js";
import { html, attrs, partial } from "../../../server/html.js";
import ProductCard from "../../components/ProductCard.js";
import { departments } from "../../../utils/listings/departments.js";
function getOptions(listings, key) {
    return Array.from(new Set(listings
        .map((listing) => listing[key])
        .filter((value) => typeof value === "string"))).sort((first, second) => first.localeCompare(second));
}
export function BrowseClient({ listings, loadError, showCreatedMessage, initialCategory = "", initialDepartment = "", initialSearchQuery = "", }) {
    const searchQuery = initialSearchQuery;
    const selectedCategory = initialCategory;
    const selectedDepartment = initialDepartment;
    const selectedSize = queryParam("size");
    const selectedCondition = queryParam("condition");
    const sortOrder = queryParam("sort") || "newest";
    const categories = (() => getOptions(listings, "category"))();
    const sizes = (() => getOptions(listings, "size"))();
    const conditions = (() => getOptions(listings, "condition"))();
    const filteredListings = (() => {
        const normalizedSearchQuery = searchQuery.trim().toLowerCase();
        const matches = listings.filter((listing) => {
            const matchesSearch = normalizedSearchQuery === "" ||
                [
                    listing.name,
                    listing.description,
                    listing.category,
                    listing.location,
                    listing.flaws,
                ].some((value) => value.toLowerCase().includes(normalizedSearchQuery));
            const matchesCategory = selectedCategory === "" || listing.category === selectedCategory;
            const matchesSize = selectedSize === "" || listing.size === selectedSize;
            const matchesCondition = selectedCondition === "" || listing.condition === selectedCondition;
            return (matchesSearch && matchesCategory && matchesSize && matchesCondition &&
                (selectedDepartment === "" || listing.department === selectedDepartment));
        });
        if (sortOrder === "price-ascending") {
            return [...matches].sort((first, second) => first.price - second.price);
        }
        if (sortOrder === "price-descending") {
            return [...matches].sort((first, second) => second.price - first.price);
        }
        return matches;
    })();
    const hasActiveFilters = searchQuery !== "" ||
        selectedCategory !== "" ||
        selectedDepartment !== "" ||
        selectedSize !== "" ||
        selectedCondition !== "" ||
        sortOrder !== "newest";
    return (html `
<main class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
<div class="mb-8">
<h1 class="mb-2 text-3xl font-bold text-black">Browse Finds</h1>
<p class="text-black">${loadError
        ? "Discover unique second-hand, thrifted, and vintage clothing."
        : `Discover ${listings.length} unique second-hand, thrifted, and vintage clothing items.`}</p></div>${showCreatedMessage ? (html `
<div role="status" class="mb-8 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-black">Your listing was published successfully.</div>`) : null}${loadError ? (html `
<div role="alert" class="rounded-lg border border-red-200 bg-red-50 p-6 text-black">
<h2 class="font-semibold">We could not load the listings.</h2>
<p class="mt-2 text-sm text-black">Please refresh the page and try again in a moment.</p></div>`) : (html `
<form action="/browse" method="get" data-browse-filters="true" class="mb-8 rounded-2xl border border-sage-300 bg-sage-100 p-6 text-black scheme-light">
<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
<div>
<label for="department" class="mb-2 block text-sm font-medium text-black">Who is it for?</label>
<select id="department" name="department" class="w-full rounded-lg border border-sage-300 bg-surface px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-sage-900"${attrs({ "data-value": selectedDepartment })}>
<option value="">Everyone</option>${departments.map((department) => (html `
<option${attrs({ "value": department })}>${department}</option>`))}</select></div>
<div>
<label for="search" class="mb-2 block text-sm font-medium text-black">Search</label>
<input id="search" name="search" type="text" placeholder="Search by item name..." class="w-full rounded-lg border border-sage-300 bg-surface px-4 py-2 outline-none transition placeholder:text-black focus:border-transparent focus:ring-2 focus:ring-sage-900"${attrs({ "value": searchQuery })}></div>
<div>
<label for="category" class="mb-2 block text-sm font-medium text-black">Category</label>
<select id="category" name="category" class="w-full rounded-lg border border-sage-300 bg-surface px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-sage-900"${attrs({ "data-value": selectedCategory })}>
<option value="">All Categories</option>${categories.map((category) => (html `
<option${attrs({ "value": category })}>${category}</option>`))}</select></div>
<div>
<label for="size" class="mb-2 block text-sm font-medium text-black">Size</label>
<select id="size" name="size" class="w-full rounded-lg border border-sage-300 bg-surface px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-sage-900"${attrs({ "data-value": selectedSize })}>
<option value="">All Sizes</option>${sizes.map((size) => (html `
<option${attrs({ "value": size })}>${size}</option>`))}</select></div>
<div>
<label for="condition" class="mb-2 block text-sm font-medium text-black">Condition</label>
<select id="condition" name="condition" class="w-full rounded-lg border border-sage-300 bg-surface px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-sage-900"${attrs({ "data-value": selectedCondition })}>
<option value="">All Conditions</option>${conditions.map((condition) => (html `
<option${attrs({ "value": condition })}>${condition}</option>`))}</select></div>
<div>
<label for="sort" class="mb-2 block text-sm font-medium text-black">Sort</label>
<select id="sort" name="sort" class="w-full rounded-lg border border-sage-300 bg-surface px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-sage-900"${attrs({ "data-value": sortOrder })}>
<option value="newest">Newest first</option>
<option value="price-ascending">Price: Low to high</option>
<option value="price-descending">Price: High to low</option></select></div></div>${hasActiveFilters ? (html `
<div class="mt-4">
<button data-clear-filters="true" type="button" class="text-sm font-medium text-black underline transition hover:text-black" aria-label="Reset all filters">Clear all filters</button></div>`) : null}
<button type="submit" class="mt-4 rounded-lg bg-sage-300 px-4 py-2 font-semibold">Apply filters</button></form>
<div class="mb-6">
<p class="text-sm text-black">${filteredListings.length} of ${listings.length} items${hasActiveFilters && " shown"}</p></div>${filteredListings.length > 0 ? (html `
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">${filteredListings.map((listing) => (partial(() => ProductCard({ "listing": listing }))))}</div>`) : hasActiveFilters ? (html `
<div class="py-12 text-center">
<p class="mb-4 text-black">No items found matching your filters.</p>
<button data-clear-filters="true" type="button" class="font-medium text-black transition hover:underline" aria-label="Reset filters and try again">Clear filters and try again</button></div>`) : (html `
<div class="py-12 text-center">
<h2 class="font-semibold text-black">No available listings yet.</h2>
<p class="mt-2 text-black">Check back soon for newly published finds.</p></div>`)}`)}</main>`);
}
