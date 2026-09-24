import { html, attrs, partial } from "../../../../server/html.js";
import Footer from "../../../components/Footer.js";
import Header from "../../../components/Header.js";
export default function ItemNotFound() {
    return (html `
<div class="min-h-screen bg-white">${partial(() => Header({}))}
<main class="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
<p class="text-sm font-semibold uppercase tracking-wide text-black">Listing unavailable</p>
<h1 class="mt-3 text-3xl font-bold text-black">We couldn’t find that item.</h1>
<p class="mt-3 text-black">It may have been removed or is no longer available.</p><a href="/browse" class="mt-8 inline-flex rounded-lg bg-sage-300 px-6 py-3 font-semibold text-black transition hover:bg-sage-400">Back to Browse</a></main>${partial(() => Footer({}))}</div>`);
}
