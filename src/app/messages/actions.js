import { redirect } from "../../../server/request.js";
import { createClient } from "../../../utils/supabase/server.js";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_MESSAGE_LENGTH = 1000;
function getFormText(formData, key) {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
}
function getSafeDatabaseError(error) {
    if (!error || typeof error !== "object")
        return {};
    const databaseError = error;
    return {
        code: typeof databaseError.code === "string" ? databaseError.code : undefined,
        details: typeof databaseError.details === "string"
            ? databaseError.details
            : undefined,
        hint: typeof databaseError.hint === "string" ? databaseError.hint : undefined,
    };
}
async function getAuthenticatedUser() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.getClaims();
        const userId = data?.claims?.sub;
        if (error || typeof userId !== "string" || !UUID_PATTERN.test(userId)) {
            return null;
        }
        return { supabase, userId };
    }
    catch {
        return null;
    }
}
export async function startConversation(_previousState, formData) {
    const listingId = getFormText(formData, "listingId");
    if (!UUID_PATTERN.test(listingId)) {
        return {
            status: "error",
            message: "This listing cannot be messaged.",
        };
    }
    const authenticatedUser = await getAuthenticatedUser();
    if (!authenticatedUser) {
        redirect(`/login?next=${encodeURIComponent(`/items/${listingId}`)}`);
    }
    const { data, error } = await authenticatedUser.supabase.rpc("start_listing_conversation", { p_listing_id: listingId });
    if (error || typeof data !== "string" || !UUID_PATTERN.test(data)) {
        console.error("Supabase conversation creation failed.", getSafeDatabaseError(error));
        return {
            status: "error",
            message: "We could not start this conversation. The listing may no longer be available.",
        };
    }
    redirect(`/messages/${data}`);
}
export async function sendMessage(_previousState, formData) {
    const conversationId = getFormText(formData, "conversationId");
    const body = getFormText(formData, "body");
    if (!UUID_PATTERN.test(conversationId)) {
        return {
            status: "error",
            message: "This conversation is not valid.",
        };
    }
    if (!body || body.length > MAX_MESSAGE_LENGTH) {
        return {
            status: "error",
            message: `Enter a message between 1 and ${MAX_MESSAGE_LENGTH} characters.`,
        };
    }
    const authenticatedUser = await getAuthenticatedUser();
    if (!authenticatedUser) {
        redirect(`/login?next=${encodeURIComponent(`/messages/${conversationId}`)}`);
    }
    const { data: conversation, error: conversationError } = await authenticatedUser.supabase
        .from("conversations")
        .select("id")
        .eq("id", conversationId)
        .or(`seller_id.eq.${authenticatedUser.userId},buyer_id.eq.${authenticatedUser.userId}`)
        .maybeSingle();
    if (conversationError || !conversation) {
        console.error("Supabase conversation authorization failed.", getSafeDatabaseError(conversationError));
        return {
            status: "error",
            message: "We could not send a message to this conversation.",
        };
    }
    const { error: messageError } = await authenticatedUser.supabase
        .from("messages")
        .insert({
        conversation_id: conversationId,
        sender_id: authenticatedUser.userId,
        body,
    });
    if (messageError) {
        console.error("Supabase message insert failed.", getSafeDatabaseError(messageError));
        return {
            status: "error",
            message: "We could not send your message. Please try again.",
        };
    }
    return {
        status: "success",
        message: "Message sent.",
    };
}
