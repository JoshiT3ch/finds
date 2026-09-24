import { html, attrs, partial } from "../../../../server/html.js";
import { notFound } from "../../../../server/request.js";
import Header from "../../../components/Header.js";
import Footer from "../../../components/Footer.js";
import ProductCard from "../../../components/ProductCard.js";
import ItemActions from "../../../components/ItemActions.js";
import ListingGallery from "../../../components/ListingGallery.js";
import { getListingBySlug, getRelatedListings, listings, } from "../../../data/listings.js";
import { mapPublicListing, } from "../../../../utils/listings/public-listing.js";
import { requireSupabasePublicConfig } from "../../../../utils/supabase/config.js";
import { createClient } from "../../../../utils/supabase/server.js";
const LISTING_FIELDS = "id, title, department, category, size, condition, price, location, description, flaws, status, image_url, image_urls, created_at, seller_id";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isUuid(value) {
    return UUID_PATTERN.test(value);
}
async function getDatabaseListing(id) {
    try {
        const { url: supabaseUrl } = requireSupabasePublicConfig();
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("listings")
            .select(LISTING_FIELDS)
            .eq("id", id)
            .eq("status", "available")
            .maybeSingle();
        if (error) {
            console.error("Item listing query failed.");
            return { status: "error" };
        }
        const row = data;
        const publicListing = row ? mapPublicListing(row, supabaseUrl) : null;
        const sellerId = row?.seller_id;
        const listing = publicListing && typeof sellerId === "string" && isUuid(sellerId)
            ? { ...publicListing, sellerId }
            : null;
        return listing ? { status: "success", listing } : { status: "missing" };
    }
    catch {
        console.error("Item listing could not be loaded.");
        return { status: "error" };
    }
}
export function generateStaticParams() {
    return listings.map((listing) => ({ slug: listing.slug }));
}
export async function generateMetadata(props) {
    const { slug } = await props.params;
    if (isUuid(slug)) {
        const result = await getDatabaseListing(slug);
        if (result.status === "success") {
            return {
                title: `${result.listing.name} - Finds Marketplace`,
                description: result.listing.description,
            };
        }
        if (result.status === "missing")
            notFound();
    }
    else {
        const listing = getListingBySlug(slug);
        if (listing) {
            return {
                title: `${listing.name} - Finds Marketplace`,
                description: listing.description,
            };
        }
    }
    return {
        title: "Item Details - Finds Marketplace",
        description: "View item details on Finds",
    };
}
function ListingImage({ listing }) {
    const listingImages = listing.images && listing.images.length > 0
        ? listing.images
        : listing.image?.startsWith("https://")
            ? [listing.image]
            : [];
    if (listingImages.length > 0) {
        return partial(() => ListingGallery({ "images": listingImages, "title": listing.name }));
    }
    return (html `
<div class="flex h-96 items-center justify-center overflow-hidden rounded-lg border border-sage-200 bg-white sm:h-[500px]">${listing.image ? (html `
<div class="text-9xl">${listing.image}</div>`) : (html `
<div class="px-6 text-center text-sm font-medium text-black">Image unavailable</div>`)}</div>`);
}
function ItemDetail({ listing, relatedListings = [], showActions = false, viewerId, }) {
    const formattedPrice = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(listing.price);
    const sellerInitial = listing.sellerName?.charAt(0).toUpperCase();
    return (html `
<div class="min-h-screen bg-white">${partial(() => Header({}))}
<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><a href="/browse" class="mb-8 inline-flex items-center gap-2 font-medium text-black transition hover:text-black"><span aria-hidden="true">←</span>Back to Browse</a>
<div class="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
<div class="lg:col-span-2">${partial(() => ListingImage({ "listing": listing }))}</div>
<div class="lg:col-span-1">
<div class="mb-4"><span class="inline-block rounded-full bg-sage-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black">${listing.department ? `${listing.department} · ` : ""}${listing.category}</span></div>
<h1 class="mb-2 text-2xl font-bold leading-tight text-black sm:text-3xl">${listing.name}</h1>${listing.brand ? (html `
<p class="mb-4 text-sm font-medium text-black">${listing.brand}</p>`) : null}
<div class="mb-6 border-b border-sage-200 pb-6">
<p class="text-3xl font-bold text-black sm:text-4xl">${formattedPrice}</p></div>
<div class="mb-6 grid grid-cols-2 gap-4 border-b border-sage-200 pb-6">
<div>
<p class="text-xs font-semibold uppercase tracking-wide text-black">Size</p>
<p class="mt-1 text-base font-medium text-black">${listing.size}</p></div>
<div>
<p class="text-xs font-semibold uppercase tracking-wide text-black">Condition</p>
<p class="mt-1 text-base font-medium text-black">${listing.condition}</p></div>
<div class="col-span-2">
<p class="text-xs font-semibold uppercase tracking-wide text-black">Location</p>
<p class="mt-1 text-base font-medium text-black">${listing.location}</p></div></div>
<div class="mb-6 border-b border-sage-200 pb-6">
<h2 class="mb-2 text-sm font-semibold uppercase tracking-wide text-black">Details</h2>
<p class="text-sm leading-relaxed text-black">${listing.description}</p></div>${listing.flaws ? (html `
<div class="mb-6 border-b border-sage-200 pb-6">
<h2 class="mb-2 text-sm font-semibold uppercase tracking-wide text-black">Flaws</h2>
<p class="text-sm leading-relaxed text-black">${listing.flaws}</p></div>`) : null}${showActions ? (html `${listing.sellerName ? (html `
<div class="mb-6 border-b border-sage-200 pb-6">
<h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-black">Seller</h2>
<div class="flex items-start gap-3">
<div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-sage-300"><span class="text-lg font-bold text-black">${sellerInitial}</span></div>
<div>
<p class="text-sm font-semibold text-black">${listing.sellerName}</p>
<p class="mt-0.5 text-xs text-black">${listing.location}</p></div></div></div>`) : null}${partial(() => ItemActions({ "listingId": listing.sellerId ? String(listing.id) : undefined, "isSignedIn": Boolean(viewerId), "isOwnListing": Boolean(viewerId) && viewerId === listing.sellerId }))}`) : null}</div></div>${relatedListings.length > 0 ? (html `
<section class="border-t border-sage-200 pt-16">
<h2 class="mb-8 text-2xl font-bold text-black">Related Finds</h2>
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">${relatedListings.map((relatedListing) => (partial(() => ProductCard({ "listing": relatedListing }))))}</div></section>`) : null}</main>${partial(() => Footer({}))}</div>`);
}
function ListingError() {
    return (html `
<div class="min-h-screen bg-white">${partial(() => Header({}))}
<main class="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
<h1 class="text-2xl font-bold text-black">We could not load this listing.</h1>
<p class="mt-3 text-black">Please try again in a moment or return to Browse.</p><a href="/browse" class="mt-8 inline-flex rounded-lg bg-sage-300 px-6 py-3 font-semibold text-black transition hover:bg-sage-400">Back to Browse</a></main>${partial(() => Footer({}))}</div>`);
}
export default async function ItemPage(props) {
    const { slug } = await props.params;
    if (!isUuid(slug)) {
        const listing = getListingBySlug(slug);
        if (!listing)
            notFound();
        return (partial(() => ItemDetail({ "listing": { ...listing, department: null }, "relatedListings": getRelatedListings(slug, 3), "showActions": true })));
    }
    const result = await getDatabaseListing(slug);
    if (result.status === "missing")
        notFound();
    if (result.status === "error")
        return partial(() => ListingError({}));
    let viewerId;
    try {
        const supabase = await createClient();
        const { data } = await supabase.auth.getClaims();
        const claimUserId = data?.claims?.sub;
        if (typeof claimUserId === "string" && isUuid(claimUserId)) {
            viewerId = claimUserId;
        }
    }
    catch {
        // Signed-out visitors can still view the listing and will log in before messaging.
    }
    return (partial(() => ItemDetail({ "listing": result.listing, "showActions": true, "viewerId": viewerId })));
}
