import { html, attrs, partial } from "../../../server/html.js";
import { initialMessagingActionState } from "./action-state.js";
export function MessageForm({ conversationId }) {
    const state = initialMessagingActionState;
    const action = "/actions/sendMessage";
    const isPending = false;
    return (html `
<form class="border-t border-sage-200 pt-5" method="post"${attrs({ "action": action })}>
<input type="hidden" name="conversationId"${attrs({ "value": conversationId })}>
<label for="message-body" class="mb-2 block text-sm font-semibold text-black">Write a message</label><textarea id="message-body" name="body" placeholder="Ask about availability, condition, or meetup details." class="w-full resize-y rounded-lg border border-sage-300 bg-surface px-4 py-3 text-sm text-black outline-none transition placeholder:text-black focus:border-transparent focus:ring-2 focus:ring-sage-900 disabled:bg-sage-100"${attrs({ "required": true, "maxLength": 1000, "rows": 4, "disabled": isPending })}></textarea>${state.message ? (html `
<p class="mt-3 text-sm text-black"${attrs({ "role": state.status === "error" ? "alert" : "status" })}>${state.message}</p>`) : null}
<div class="mt-4 flex justify-end">
<button type="submit" class="rounded-lg bg-sage-300 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-sage-400 disabled:cursor-not-allowed disabled:bg-sage-400"${attrs({ "disabled": isPending })}>${isPending ? "Sending…" : "Send message"}</button></div></form>`);
}
