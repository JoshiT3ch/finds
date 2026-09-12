import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { createClient } from "../../../utils/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CONVERSATION_FIELDS =
  "id, listing_id, listing_title, seller_id, buyer_id, created_at, updated_at";

export const dynamic = "force-dynamic";

type ConversationRow = {
  id: string;
  listing_id: string | null;
  listing_title: string;
  seller_id: string;
  buyer_id: string;
  created_at: string;
  updated_at: string;
};

function formatConversationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function MessagesPage() {
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

  const conversations = (data ?? []) as ConversationRow[];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Marketplace conversations
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-950">Messages</h1>
          <p className="mt-2 text-gray-600">
            Talk directly with buyers and sellers about a listing.
          </p>
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-900"
          >
            <h2 className="font-semibold">We could not load your messages.</h2>
            <p className="mt-2 text-sm text-red-800">
              Refresh the page and try again in a moment.
            </p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-gray-950">
              No conversations yet
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Open an available listing and choose Message Seller to get
              started.
            </p>
            <Link
              href="/browse"
              className="mt-6 inline-flex rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <ul className="divide-y divide-gray-200">
              {conversations.map((conversation) => {
                const isSeller = conversation.seller_id === userId;

                return (
                  <li key={conversation.id}>
                    <Link
                      href={`/messages/${conversation.id}`}
                      className="block p-5 transition hover:bg-gray-50 sm:p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="font-semibold text-gray-950">
                            {conversation.listing_title}
                          </h2>
                          <p className="mt-1 text-sm text-gray-600">
                            You are the {isSeller ? "seller" : "buyer"}.
                          </p>
                        </div>
                        <time
                          dateTime={conversation.updated_at}
                          className="flex-shrink-0 text-xs text-gray-500"
                        >
                          {formatConversationDate(conversation.updated_at)}
                        </time>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
