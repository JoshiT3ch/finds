import { html, attrs, partial } from "../../../server/html.js";
import { redirect } from "../../../server/request.js";
import { signOut } from "../auth/actions.js";
import { MyListings } from "./my-listings.js";
import { mapPublicListing, } from "../../../utils/listings/public-listing.js";
import { requireSupabasePublicConfig } from "../../../utils/supabase/config.js";
import { createClient } from "../../../utils/supabase/server.js";
const ACCOUNT_LISTING_FIELDS = "id, title, category, size, condition, price, status, image_url, created_at";
function getCreatedAt(value) {
    if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
        return null;
    }
    return value;
}
function mapAccountListing(row, supabaseUrl) {
    if (row.status !== "available" && row.status !== "sold")
        return null;
    const listing = mapPublicListing(row, supabaseUrl);
    if (!listing)
        return null;
    return {
        id: listing.id,
        title: listing.name,
        price: listing.price,
        status: row.status,
        category: listing.category,
        size: listing.size,
        condition: listing.condition,
        image: listing.image,
        createdAt: getCreatedAt(row.created_at),
    };
}
async function getSellerListings(supabase, sellerId) {
    try {
        const { url: supabaseUrl } = requireSupabasePublicConfig();
        const { data, error } = await supabase
            .from("listings")
            .select(ACCOUNT_LISTING_FIELDS)
            .eq("seller_id", sellerId)
            .in("status", ["available", "sold"])
            .order("created_at", { ascending: false });
        if (error) {
            console.error("Account listings query failed.");
            return { listings: [], loadError: true };
        }
        const listings = (data ?? [])
            .map((row) => mapAccountListing(row, supabaseUrl))
            .filter((listing) => listing !== null);
        return { listings, loadError: false };
    }
    catch {
        console.error("Account listings could not be loaded.");
        return { listings: [], loadError: true };
    }
}
export default async function AccountPage() {
    let supabase;
    let claims;
    try {
        supabase = await createClient();
        const { data, error } = await supabase.auth.getClaims();
        if (error || !data?.claims) {
            redirect("/login?next=/account");
        }
        claims = data.claims;
    }
    catch {
        redirect("/login?next=/account");
    }
    const sellerId = claims?.sub;
    if (typeof sellerId !== "string") {
        redirect("/login?next=/account");
    }
    const email = typeof claims?.email === "string" ? claims.email : undefined;
    const { listings, loadError } = await getSellerListings(supabase, sellerId);
    return (html `
<main class="min-h-screen bg-sage-50 px-4 py-6 text-black sm:px-6 sm:py-10 lg:px-8">
<section class="mx-auto max-w-5xl">
<div class="mb-6 flex items-center justify-between gap-4"><a href="/" class="text-2xl font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4">Finds</a><a href="/browse" aria-label="Close account and return to Browse" title="Back to Browse" class="inline-flex min-h-11 items-center gap-2 rounded-full border border-sage-300 bg-surface px-3 text-sm font-medium text-black transition hover:border-sage-500 hover:bg-sage-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage-950 sm:px-4"><span class="hidden sm:inline">Back to Browse</span><svg width="20" height="20" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"></path></svg></a></div>
<div class="rounded-2xl border border-sage-200 bg-surface p-5 shadow-sm sm:p-8">
<div class="flex flex-wrap items-start justify-between gap-5">
<div>
<p class="text-xs font-semibold uppercase tracking-widest text-black">Your Finds</p>
<h1 class="mt-2 text-3xl font-bold tracking-tight text-black">My account</h1>
<p class="mt-2 text-sm text-black">Manage your listings and keep up with your conversations.</p></div><a href="/messages" class="inline-flex min-h-11 items-center rounded-lg border border-sage-300 px-4 text-sm font-semibold transition hover:bg-sage-50 focus-visible:outline-2 focus-visible:outline-offset-4">View messages</a></div>
<div class="mt-6 flex flex-wrap items-center justify-between gap-5 border-t border-sage-200 pt-5">${email ? (html `
<dl class="min-w-0">
<dt class="text-sm font-medium text-black">Signed in as</dt>
<dd class="mt-1 break-words text-base font-semibold text-black">${email}</dd></dl>`) : null}
<form method="post"${attrs({ "action": signOut })}>
<button type="submit" class="rounded-md border border-sage-300 bg-surface px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-sage-100 focus:outline-none focus:ring-2 focus:ring-sage-950 focus:ring-offset-2">Sign out</button></form></div></div>
<div class="mt-6 rounded-2xl border border-sage-200 bg-surface p-5 shadow-sm sm:p-8">${partial(() => MyListings({ "listings": listings, "loadError": loadError }))}</div></section></main>`);
}
