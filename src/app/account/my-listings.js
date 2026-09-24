import { html, attrs, partial } from "../../../server/html.js";
const initialActionState = {
    status: "idle",
    message: "",
};
function formatPrice(price) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(price);
}
function formatCreatedAt(createdAt) {
    if (!createdAt)
        return "Date unavailable";
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime()))
        return "Date unavailable";
    return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" }).format(date);
}
function ActionNotice({ state }) {
    if (state.status === "idle")
        return null;
    const isError = state.status === "error";
    return (html `
<p class="mt-3 text-sm text-black"${attrs({ "role": isError ? "alert" : "status" })}>${state.message}</p>`);
}
function ListingControls({ listing }) {
    const nextStatus = listing.status === 'available' ? 'sold' : 'available';
    return html `
<div class="mt-5 border-t border-sage-200 pt-4 flex flex-wrap gap-3">
<form action="/actions/updateListingStatus" method="post" data-reload="true">
<input type="hidden" name="listingId"${attrs({ "value": listing.id })}>
<input type="hidden" name="status"${attrs({ "value": nextStatus })}>
<button class="rounded-md border border-sage-300 bg-surface px-3 py-2 text-sm font-semibold" type="submit">${listing.status === 'available' ? 'Mark as Sold' : 'Mark as Available'}</button></form>
<form action="/actions/deleteListing" method="post" data-reload="true" data-confirm="Delete this listing? This cannot be undone.">
<input type="hidden" name="listingId"${attrs({ "value": listing.id })}>
<input type="hidden" name="confirmation" value="delete">
<button class="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold" type="submit">Delete</button></form></div>`;
}
function ListingImage({ listing }) {
    return (html `
<div class="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-sage-100 sm:h-36 sm:w-36 sm:flex-none">${listing.image?.startsWith("https://") ? (html `<img class="object-cover" loading="lazy"${attrs({ "src": listing.image, "alt": listing.title, "fill": true })}>`) : (html `<span class="px-4 text-center text-sm font-medium text-black">Image unavailable</span>`)}</div>`);
}
function ListingRow({ listing }) {
    const isAvailable = listing.status === "available";
    return (html `<article class="rounded-lg border border-sage-200 bg-surface p-4 shadow-sm sm:p-5">
<div class="flex flex-col gap-4 sm:flex-row">${partial(() => ListingImage({ "listing": listing }))}
<div class="min-w-0 flex-1">
<div class="flex flex-wrap items-start justify-between gap-3">
<div>
<div class="flex flex-wrap items-center gap-2">
<h3 class="text-lg font-semibold text-black">${isAvailable ? (html `<a class="transition hover:underline"${attrs({ "href": `/items/${listing.id}` })}>${listing.title}</a>`) : (listing.title)}</h3><span${attrs({ "className": `rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${isAvailable
            ? "bg-green-100 text-black"
            : "bg-sage-200 text-black"}` })}>${isAvailable ? "Available" : "Sold"}</span></div>
<p class="mt-1 text-lg font-bold text-black">${formatPrice(listing.price)}</p></div>
<p class="text-sm text-black">Listed ${formatCreatedAt(listing.createdAt)}</p></div>
<dl class="mt-4 grid grid-cols-1 gap-3 text-sm text-black sm:grid-cols-3">
<div>
<dt class="text-xs font-semibold uppercase tracking-wide text-black">Category</dt>
<dd class="mt-1 font-medium text-black">${listing.category}</dd></div>
<div>
<dt class="text-xs font-semibold uppercase tracking-wide text-black">Size</dt>
<dd class="mt-1 font-medium text-black">${listing.size}</dd></div>
<div>
<dt class="text-xs font-semibold uppercase tracking-wide text-black">Condition</dt>
<dd class="mt-1 font-medium text-black">${listing.condition}</dd></div></dl>${isAvailable ? (html `<a class="mt-4 inline-flex text-sm font-semibold text-black underline transition hover:text-black"${attrs({ "href": `/items/${listing.id}` })}>View public listing</a>`) : null}${partial(() => ListingControls({ "listing": listing }))}</div></div></article>`);
}
export function MyListings({ listings, loadError, }) {
    return (html `
<section aria-labelledby="my-listings-heading">
<div class="flex flex-wrap items-baseline justify-between gap-3">
<div>
<p class="text-sm font-semibold uppercase tracking-wide text-black">Seller dashboard</p>
<h2 id="my-listings-heading" class="mt-2 text-2xl font-bold text-black">My Listings</h2>${!loadError ? (html `
<p class="mt-2 text-sm text-black">${listings.filter((listing) => listing.status === "available").length} available${" · "}${listings.filter((listing) => listing.status === "sold").length} sold</p>`) : null}</div><a href="/sell" class="rounded-md bg-sage-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-950 focus:ring-offset-2">List an Item</a></div>${loadError ? (html `
<div role="alert" class="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-black">
<h3 class="font-semibold">We could not load your listings.</h3>
<p class="mt-2 text-sm text-black">Please refresh the page and try again in a moment.</p></div>`) : listings.length > 0 ? (html `
<div class="mt-6 space-y-4">${listings.map((listing) => (partial(() => ListingRow({ "listing": listing }))))}</div>`) : (html `
<div class="mt-6 rounded-lg border border-sage-200 bg-sage-50 p-8 text-center">
<h3 class="font-semibold text-black">No listings yet.</h3>
<p class="mt-2 text-sm text-black">List your first pre-loved find to see it here.</p><a href="/sell" class="mt-5 inline-flex rounded-md bg-sage-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-950 focus:ring-offset-2">List an Item</a></div>`)}</section>`);
}
