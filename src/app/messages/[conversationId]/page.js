import { html, attrs, partial } from "../../../../server/html.js";
import { notFound, redirect } from "../../../../server/request.js";
import Footer from "../../../components/Footer.js";
import Header from "../../../components/Header.js";
import { createClient } from "../../../../utils/supabase/server.js";
import { ConversationRefresh } from "../conversation-refresh.js";
import { MessageForm } from "../message-form.js";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CONVERSATION_FIELDS = "id, listing_id, listing_title, seller_id, buyer_id";
const MESSAGE_FIELDS = "id, sender_id, body, created_at";
function formatMessageDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return "Recently";
    return new Intl.DateTimeFormat("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}
function ConversationError() {
    return (html `
<div class="min-h-screen bg-sage-50">${partial(() => Header({}))}
<main class="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
<div role="alert" class="rounded-lg border border-red-200 bg-red-50 p-6 text-black">
<h1 class="text-xl font-semibold">We could not load this conversation.</h1>
<p class="mt-2 text-sm text-black">Refresh the page or return to your messages and try again.</p><a href="/messages" class="mt-5 inline-flex text-sm font-semibold underline">Back to messages</a></div></main>${partial(() => Footer({}))}</div>`);
}
export default async function ConversationPage(props) {
    const { conversationId } = await props.params;
    if (!UUID_PATTERN.test(conversationId))
        notFound();
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
        redirect(`/login?next=${encodeURIComponent(`/messages/${conversationId}`)}`);
    }
    if (!userId || !UUID_PATTERN.test(userId)) {
        redirect(`/login?next=${encodeURIComponent(`/messages/${conversationId}`)}`);
    }
    const { data: conversationData, error: conversationError } = await supabase
        .from("conversations")
        .select(CONVERSATION_FIELDS)
        .eq("id", conversationId)
        .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
        .maybeSingle();
    if (conversationError)
        return partial(() => ConversationError({}));
    if (!conversationData)
        notFound();
    const conversation = conversationData;
    const { data: messageData, error: messagesError } = await supabase
        .from("messages")
        .select(MESSAGE_FIELDS)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(200);
    if (messagesError)
        return partial(() => ConversationError({}));
    const messages = (messageData ?? []);
    const isSeller = conversation.seller_id === userId;
    return (html `
<div class="min-h-screen bg-sage-50">${partial(() => Header({}))}
<main class="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8"><a href="/messages" class="inline-flex items-center gap-2 text-sm font-semibold text-black transition hover:text-black"><span aria-hidden="true">←</span>Back to messages</a>
<section class="mt-6 rounded-lg border border-sage-200 bg-surface shadow-sm">
<header class="border-b border-sage-200 p-5 sm:p-6">
<div class="flex items-start justify-between gap-4">
<div>
<p class="text-xs font-semibold uppercase tracking-wide text-black">You are the ${isSeller ? "seller" : "buyer"}</p>
<h1 class="mt-2 text-2xl font-bold text-black">${conversation.listing_title}</h1></div>${partial(() => ConversationRefresh({}))}</div>${conversation.listing_id ? (html `<a class="mt-2 inline-flex text-sm font-semibold text-black underline transition hover:text-black"${attrs({ "href": `/items/${conversation.listing_id}` })}>View listing</a>`) : (html `
<p class="mt-2 text-sm text-black">This listing has been removed.</p>`)}</header>
<div class="p-5 sm:p-6">${messages.length === 0 ? (html `
<div class="py-10 text-center">
<h2 class="font-semibold text-black">Start the conversation</h2>
<p class="mt-2 text-sm text-black">Ask a clear question about this listing.</p></div>`) : (html `
<ol class="mb-6 space-y-4" aria-label="Conversation messages">${messages.map((message) => {
        const isOwnMessage = message.sender_id === userId;
        return (html `
<li${attrs({ "className": `flex ${isOwnMessage ? "justify-end" : "justify-start"}` })}>
<div${attrs({ "className": `max-w-[85%] rounded-lg px-4 py-3 sm:max-w-[75%] ${isOwnMessage
                ? "bg-sage-300 text-black"
                : "bg-sage-100 text-black"}` })}>
<p class="whitespace-pre-wrap break-words text-sm">${message.body}</p><time class="mt-2 block text-xs text-black"${attrs({ "dateTime": message.created_at })}>${formatMessageDate(message.created_at)}</time></div></li>`);
    })}</ol>`)}${partial(() => MessageForm({ "conversationId": conversation.id }))}</div></section></main>${partial(() => Footer({}))}</div>`);
}
