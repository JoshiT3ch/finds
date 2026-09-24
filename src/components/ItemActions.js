import { html, attrs, partial } from "../../server/html.js";
import { initialMessagingActionState } from "../app/messages/action-state.js";
export default function ItemActions({ listingId, isOwnListing = false, isSignedIn = false, }) {
    const isSaved = false;
    const messageState = initialMessagingActionState;
    const messageAction = "/actions/startConversation";
    const isMessagePending = false;
    return (html `
<div class="space-y-3">${listingId && !isOwnListing && isSignedIn ? (html `
<form method="post"${attrs({ "action": messageAction })}>
<input type="hidden" name="listingId"${attrs({ "value": listingId })}>
<button type="submit" aria-label="Message the seller about this item" class="w-full rounded-lg bg-sage-300 px-6 py-3 text-base font-semibold text-black transition hover:bg-sage-400 disabled:cursor-not-allowed disabled:bg-sage-400"${attrs({ "disabled": isMessagePending })}>${isMessagePending ? "Opening conversation…" : "Message Seller"}</button></form>`) : listingId && !isOwnListing ? (html `<a class="block w-full rounded-lg bg-sage-300 px-6 py-3 text-center text-base font-semibold text-black transition hover:bg-sage-400"${attrs({ "href": `/login?next=${encodeURIComponent(`/items/${listingId}`)}` })}>Log in to message seller</a>`) : isOwnListing ? (html `<a href="/account" class="block w-full rounded-lg bg-sage-300 px-6 py-3 text-center text-base font-semibold text-black transition hover:bg-sage-400">Manage your listing</a>`) : (html `
<p class="rounded-lg border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-black">Messaging is available on current marketplace listings.</p>`)}${messageState.status === "error" ? (html `
<p class="text-sm text-black" role="alert">${messageState.message}</p>`) : null}
<button type="button"${attrs({ "aria-label": isSaved ? "Remove from saves" : "Save this item", "className": `w-full px-6 py-3 rounded-lg font-semibold transition text-base border-2 ${isSaved
            ? "bg-red-50 text-black border-red-200 hover:bg-red-100"
            : "bg-surface text-black border-sage-300 hover:border-sage-400 hover:bg-sage-50"}`, "data-save-item": listingId || "" })}>${isSaved ? "♥ Saved" : "♡ Save Item"}</button>${isSaved && (html `
<p class="text-sm text-black" role="status">Saved for this session only. Account-based saves will come later.</p>`)}</div>`);
}
