import { html, attrs, partial } from "../../server/html.js";
export default function ProductCard({ listing }) {
    const itemIdentifier = listing.slug ?? String(listing.id);
    const formattedPrice = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(listing.price);
    return (html `
<div class="overflow-hidden rounded-2xl border border-sage-300 bg-surface shadow-sm shadow-sage-900/5 transition hover:border-sage-400 hover:shadow-lg hover:shadow-sage-900/10">
<div class="relative flex h-64 items-center justify-center overflow-hidden bg-sage-100">${listing.image?.startsWith("https://") ? (html `<img class="object-cover" loading="lazy"${attrs({ "src": listing.image, "alt": listing.name, "fill": true })}>`) : listing.image ? (html `
<div class="text-6xl">${listing.image}</div>`) : (html `
<div class="px-6 text-center text-sm font-medium text-black">Image unavailable</div>`)}</div>
<div class="p-4">
<h3 class="mb-2 line-clamp-2 font-semibold text-black">${listing.name}</h3>
<div class="mb-3 flex items-baseline gap-2"><span class="text-xl font-bold text-black">${formattedPrice}</span></div>
<div class="space-y-1 text-sm text-black">
<p>Size: ${listing.size}</p>
<p>Condition: ${listing.condition}</p></div><a class="mt-4 block w-full rounded-lg bg-sage-300 py-2 text-center text-sm font-medium text-black transition hover:bg-sage-400"${attrs({ "href": `/items/${itemIdentifier}` })}>View Item</a></div></div>`);
}
