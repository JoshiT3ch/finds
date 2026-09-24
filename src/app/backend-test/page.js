import { html, attrs, partial } from "../../../server/html.js";
import { createClient } from "../../../utils/supabase/server.js";
const TEST_LISTING_TITLE = "Supabase Test Denim Jacket";
const LISTING_IMAGES_PATH = "/storage/v1/object/public/listing-images/";
const fields = [
    ["Title", "title"],
    ["Category", "category"],
    ["Size", "size"],
    ["Condition", "condition"],
    ["Price", "price"],
    ["Location", "location"],
    ["Description", "description"],
    ["Flaws", "flaws"],
    ["Status", "status"],
];
function formatValue(value) {
    if (value === null || value === undefined || value === "") {
        return "Not set";
    }
    if (Array.isArray(value)) {
        return value.length > 0 ? value.join(", ") : "Not set";
    }
    if (typeof value === "object") {
        return JSON.stringify(value);
    }
    return String(value);
}
function getValidListingImageUrl(imageUrl) {
    if (!imageUrl) {
        return null;
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
        return null;
    }
    try {
        const parsedImageUrl = new URL(imageUrl);
        const parsedSupabaseUrl = new URL(supabaseUrl);
        if (parsedImageUrl.protocol !== "https:" ||
            parsedImageUrl.hostname !== parsedSupabaseUrl.hostname ||
            !parsedImageUrl.pathname.startsWith(LISTING_IMAGES_PATH) ||
            parsedImageUrl.search !== "") {
            return null;
        }
        return parsedImageUrl.toString();
    }
    catch {
        return null;
    }
}
async function getTestListing() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
        return {
            status: "error",
            message: "Supabase environment variables are not configured for this local runtime.",
        };
    }
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("listings")
        .select("title, category, size, condition, price, image_url, location, description, flaws, status")
        .eq("title", TEST_LISTING_TITLE)
        .maybeSingle();
    if (error) {
        return {
            status: "error",
            message: "The Supabase SELECT query failed. Check the public anon key, RLS SELECT policy, and local runtime configuration.",
        };
    }
    if (!data) {
        return { status: "empty" };
    }
    return { status: "success", listing: data };
}
export default async function BackendTestPage() {
    const result = await getTestListing();
    const imageUrl = result.status === "success"
        ? getValidListingImageUrl(result.listing.image_url)
        : null;
    return (html `
<main class="min-h-screen bg-background px-4 py-10 text-black sm:px-6 lg:px-8">
<section class="mx-auto max-w-3xl">
<p class="mb-3 text-sm font-semibold uppercase tracking-wide text-black">Backend connection test</p>
<h1 class="mb-6 text-3xl font-bold">Supabase listings read</h1>${result.status === "success" ? (html `
<div class="rounded-lg border border-green-200 bg-green-50 p-6">
<p class="mb-6 text-lg font-semibold text-black">Supabase connection successful</p>${imageUrl ? (html `
<div class="relative mb-6 aspect-[4/3] overflow-hidden rounded-lg border border-green-200 bg-surface"><img class="object-cover" loading="lazy"${attrs({ "src": imageUrl, "alt": `${result.listing.title ?? TEST_LISTING_TITLE} listing image`, "fill": true })}></div>`) : (html `
<div class="mb-6 flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-green-300 bg-surface px-6 text-center text-sm font-medium text-black">Listing image is missing or is not a valid public Supabase Storage URL.</div>`)}
<dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">${fields.map(([label, key]) => (html `
<div class="border-t border-green-200 pt-3">
<dt class="text-xs font-semibold uppercase tracking-wide text-black">${label}</dt>
<dd class="mt-1 break-words text-sm text-black">${formatValue(result.listing[key])}</dd></div>`))}</dl></div>`) : result.status === "empty" ? (html `
<div class="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
<p class="font-semibold text-black">Supabase query completed, but the test listing was not found.</p>
<p class="mt-2 text-sm text-black">Expected an available row titled exactly${" "}<code>${TEST_LISTING_TITLE}</code> in public.listings.</p></div>`) : (html `
<div class="rounded-lg border border-red-200 bg-red-50 p-6">
<p class="font-semibold text-black">Supabase connection test failed</p>
<p class="mt-2 text-sm text-black">${result.message}</p></div>`)}</section></main>`);
}
