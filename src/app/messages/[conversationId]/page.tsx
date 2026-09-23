import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { createClient } from "../../../../utils/supabase/server";
import { ConversationRefresh } from "../conversation-refresh";
import { MessageForm } from "../message-form";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CONVERSATION_FIELDS =
  "id, listing_id, listing_title, seller_id, buyer_id";
const MESSAGE_FIELDS = "id, sender_id, body, created_at";

export const dynamic = "force-dynamic";

type ConversationRow = {
  id: string;
  listing_id: string | null;
  listing_title: string;
  seller_id: string;
  buyer_id: string;
};

type MessageRow = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

function formatMessageDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function ConversationError() {
  return (
    <div className="min-h-screen bg-sage-50">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-6 text-black"
        >
          <h1 className="text-xl font-semibold">
            We could not load this conversation.
          </h1>
          <p className="mt-2 text-sm text-black">
            Refresh the page or return to your messages and try again.
          </p>
          <Link
            href="/messages"
            className="mt-5 inline-flex text-sm font-semibold underline"
          >
            Back to messages
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default async function ConversationPage(
  props: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await props.params;
  if (!UUID_PATTERN.test(conversationId)) notFound();

  let supabase: Awaited<ReturnType<typeof createClient>>;
  let userId: string | undefined;

  try {
    supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    const claimUserId = data?.claims?.sub;

    if (!error && typeof claimUserId === "string") {
      userId = claimUserId;
    }
  } catch {
    redirect(
      `/login?next=${encodeURIComponent(`/messages/${conversationId}`)}`,
    );
  }

  if (!userId || !UUID_PATTERN.test(userId)) {
    redirect(
      `/login?next=${encodeURIComponent(`/messages/${conversationId}`)}`,
    );
  }

  const { data: conversationData, error: conversationError } = await supabase
    .from("conversations")
    .select(CONVERSATION_FIELDS)
    .eq("id", conversationId)
    .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
    .maybeSingle();

  if (conversationError) return <ConversationError />;
  if (!conversationData) notFound();

  const conversation = conversationData as ConversationRow;
  const { data: messageData, error: messagesError } = await supabase
    .from("messages")
    .select(MESSAGE_FIELDS)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (messagesError) return <ConversationError />;

  const messages = (messageData ?? []) as MessageRow[];
  const isSeller = conversation.seller_id === userId;

  return (
    <div className="min-h-screen bg-sage-50">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/messages"
          className="inline-flex items-center gap-2 text-sm font-semibold text-black transition hover:text-black"
        >
          <span aria-hidden="true">←</span>
          Back to messages
        </Link>

        <section className="mt-6 rounded-lg border border-sage-200 bg-surface shadow-sm">
          <header className="border-b border-sage-200 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-black">
                  You are the {isSeller ? "seller" : "buyer"}
                </p>
                <h1 className="mt-2 text-2xl font-bold text-black">
                  {conversation.listing_title}
                </h1>
              </div>
              <ConversationRefresh />
            </div>
            {conversation.listing_id ? (
              <Link
                href={`/items/${conversation.listing_id}`}
                className="mt-2 inline-flex text-sm font-semibold text-black underline transition hover:text-black"
              >
                View listing
              </Link>
            ) : (
              <p className="mt-2 text-sm text-black">
                This listing has been removed.
              </p>
            )}
          </header>

          <div className="p-5 sm:p-6">
            {messages.length === 0 ? (
              <div className="py-10 text-center">
                <h2 className="font-semibold text-black">
                  Start the conversation
                </h2>
                <p className="mt-2 text-sm text-black">
                  Ask a clear question about this listing.
                </p>
              </div>
            ) : (
              <ol className="mb-6 space-y-4" aria-label="Conversation messages">
                {messages.map((message) => {
                  const isOwnMessage = message.sender_id === userId;

                  return (
                    <li
                      key={message.id}
                      className={`flex ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-4 py-3 sm:max-w-[75%] ${
                          isOwnMessage
                            ? "bg-sage-300 text-black"
                            : "bg-sage-100 text-black"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words text-sm">
                          {message.body}
                        </p>
                        <time
                          dateTime={message.created_at}
                          className="mt-2 block text-xs text-black"
                        >
                          {formatMessageDate(message.created_at)}
                        </time>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            <MessageForm conversationId={conversation.id} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
