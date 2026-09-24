import { html, attrs, partial } from "../../server/html.js";
import { mapPublicListing, } from "../../utils/listings/public-listing.js";
import { requireSupabasePublicConfig } from "../../utils/supabase/config.js";
import { createClient } from "../../utils/supabase/server.js";
import ProductCard from "./ProductCard.js";
const FEATURED_LISTING_FIELDS = "id, title, category, size, condition, price, location, status, image_url, created_at";
const FEATURED_LISTING_LIMIT = 4;
async function getFeaturedListings() {
    try {
        const { url: supabaseUrl } = requireSupabasePublicConfig();
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("listings")
            .select(FEATURED_LISTING_FIELDS)
            .eq("status", "available")
            .order("created_at", { ascending: false })
            .limit(FEATURED_LISTING_LIMIT);
        if (error) {
            console.error("Featured listings query failed.");
            return { status: "error", listings: [] };
        }
        const rows = (data ?? []);
        const listings = rows
            .map((row) => mapPublicListing(row, supabaseUrl))
            .filter((listing) => listing !== null);
        if (listings.length !== rows.length) {
            console.warn("Featured listings omitted one or more rows with invalid display data.");
        }
        return { status: "success", listings };
    }
    catch {
        console.error("Featured listings could not be loaded.");
        return { status: "error", listings: [] };
    }
}
export default async function FeaturedFinds() {
    const result = await getFeaturedListings();
    return (html `
<section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
<div class="mb-8 flex items-baseline justify-between gap-4">
<h2 class="text-2xl font-bold text-black">Featured Finds</h2><a href="/browse" class="text-sm font-medium text-black underline transition hover:text-black">View all</a></div>${result.status === "error" ? (html `
<div role="alert" class="rounded-lg border border-red-200 bg-red-50 p-6 text-black">
<h3 class="font-semibold">We could not load featured finds.</h3>
<p class="mt-2 text-sm text-black">Please refresh the page or browse all available listings.</p><a href="/browse" class="mt-4 inline-flex text-sm font-semibold underline">Browse listings</a></div>`) : result.listings.length > 0 ? (html `
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">${result.listings.map((listing) => (partial(() => ProductCard({ "listing": listing }))))}</div>`) : (html `
<div class="rounded-lg border border-sage-200 bg-sage-50 p-8 text-center">
<h3 class="font-semibold text-black">No featured finds yet.</h3>
<p class="mt-2 text-sm text-black">Check back soon, or be the first to list an item.</p>
<div class="mt-5 flex justify-center gap-3"><a href="/browse" class="rounded-lg border border-sage-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-surface">Browse listings</a><a href="/sell" class="rounded-lg bg-sage-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-sage-400">List an Item</a></div></div>`)}</section>`);
}
