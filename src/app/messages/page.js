import { html, attrs, partial } from "../../../server/html.js";
import { redirect } from "../../../server/request.js";
import Footer from "../../components/Footer.js";
import Header from "../../components/Header.js";
import { createClient } from "../../../utils/supabase/server.js";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CONVERSATION_FIELDS = "id, listing_id, listing_title, seller_id, buyer_id, created_at, updated_at";
function formatConversationDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return "Recently";
    return new Intl.DateTimeFormat("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}
export default async function MessagesPage() {
    let supabase;
    let userId;
    try {
        supabase = await createClient();
        const { data, error } = await supabase.auth.getClaims();
        const claimUserId = data?.claims?.sub;
        if (!error && typeof claimUserId === "string") {
            userId = claimUserId;
        }
    }
    catch {
        redirect("/login?next=/messages");
    }
    if (!userId || !UUID_PATTERN.test(userId)) {
        redirect("/login?next=/messages");
    }
    const { data, error } = await supabase
        .from("conversations")
        .select(CONVERSATION_FIELDS)
        .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
        .order("updated_at", { ascending: false });
    const conversations = (data ?? []);
    return (html `
<div class="min-h-screen bg-sage-50">${partial(() => Header({}))}
<main class="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
<div class="mb-8">
<p class="text-sm font-semibold uppercase tracking-wide text-black">Marketplace conversations</p>
<h1 class="mt-2 text-3xl font-bold text-black">Messages</h1>
<p class="mt-2 text-black">Talk directly with buyers and sellers about a listing.</p></div>${error ? (html `
<div role="alert" class="rounded-lg border border-red-200 bg-red-50 p-6 text-black">
<h2 class="font-semibold">We could not load your messages.</h2>
<p class="mt-2 text-sm text-black">Refresh the page and try again in a moment.</p></div>`) : conversations.length === 0 ? (html `
<div class="rounded-lg border border-sage-200 bg-surface p-10 text-center shadow-sm">
<h2 class="text-lg font-semibold text-black">No conversations yet</h2>
<p class="mt-2 text-sm text-black">Open an available listing and choose Message Seller to get started.</p><a href="/browse" class="mt-6 inline-flex rounded-lg bg-sage-300 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-sage-400">Browse listings</a></div>`) : (html `
<div class="overflow-hidden rounded-lg border border-sage-200 bg-surface shadow-sm">
<ul class="divide-y divide-sage-200">${conversations.map((conversation) => {
        const isSeller = conversation.seller_id === userId;
        return (html `
<li><a class="block p-5 transition hover:bg-sage-50 sm:p-6"${attrs({ "href": `/messages/${conversation.id}` })}>
<div class="flex items-start justify-between gap-4">
<div>
<h2 class="font-semibold text-black">${conversation.listing_title}</h2>
<p class="mt-1 text-sm text-black">You are the ${isSeller ? "seller" : "buyer"}.</p></div><time class="flex-shrink-0 text-xs text-black"${attrs({ "dateTime": conversation.updated_at })}>${formatConversationDate(conversation.updated_at)}</time></div></a></li>`);
    })}</ul></div>`)}</main>${partial(() => Footer({}))}</div>`);
}
