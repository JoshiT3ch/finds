"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { initialMessagingActionState } from "@/app/messages/action-state";
import { startConversation } from "@/app/messages/actions";

type ItemActionsProps = {
  listingId?: string;
  isOwnListing?: boolean;
  isSignedIn?: boolean;
};

export default function ItemActions({
  listingId,
  isOwnListing = false,
  isSignedIn = false,
}: ItemActionsProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [messageState, messageAction, isMessagePending] = useActionState(
    startConversation,
    initialMessagingActionState,
  );

  return (
    <div className="space-y-3">
      {listingId && !isOwnListing && isSignedIn ? (
        <form action={messageAction}>
          <input type="hidden" name="listingId" value={listingId} />
          <button
            type="submit"
            disabled={isMessagePending}
            aria-label="Message the seller about this item"
            className="w-full rounded-lg bg-sage-300 px-6 py-3 text-base font-semibold text-black transition hover:bg-sage-400 disabled:cursor-not-allowed disabled:bg-sage-400"
          >
            {isMessagePending ? "Opening conversation…" : "Message Seller"}
          </button>
        </form>
      ) : listingId && !isOwnListing ? (
        <Link
          href={`/login?next=${encodeURIComponent(`/items/${listingId}`)}`}
          className="block w-full rounded-lg bg-sage-300 px-6 py-3 text-center text-base font-semibold text-black transition hover:bg-sage-400"
        >
          Log in to message seller
        </Link>
      ) : isOwnListing ? (
        <Link
          href="/account"
          className="block w-full rounded-lg bg-sage-300 px-6 py-3 text-center text-base font-semibold text-black transition hover:bg-sage-400"
        >
          Manage your listing
        </Link>
      ) : (
        <p className="rounded-lg border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-black">
          Messaging is available on current marketplace listings.
        </p>
      )}

      {messageState.status === "error" ? (
        <p className="text-sm text-black" role="alert">
          {messageState.message}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => setIsSaved(!isSaved)}
        aria-label={isSaved ? "Remove from saves" : "Save this item"}
        className={`w-full px-6 py-3 rounded-lg font-semibold transition text-base border-2 ${
          isSaved
            ? "bg-red-50 text-black border-red-200 hover:bg-red-100"
            : "bg-surface text-black border-sage-300 hover:border-sage-400 hover:bg-sage-50"
        }`}
      >
        {isSaved ? "♥ Saved" : "♡ Save Item"}
      </button>
      {isSaved && (
        <p className="text-sm text-black" role="status">
          Saved for this session only. Account-based saves will come later.
        </p>
      )}
    </div>
  );
}
