"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { initialMessagingActionState } from "./action-state";
import { sendMessage } from "./actions";

export function MessageForm({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [state, action, isPending] = useActionState(
    sendMessage,
    initialMessagingActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      router.refresh();
    }
  }, [router, state]);

  return (
    <form ref={formRef} action={action} className="border-t border-sage-200 pt-5">
      <input type="hidden" name="conversationId" value={conversationId} />
      <label
        htmlFor="message-body"
        className="mb-2 block text-sm font-semibold text-black"
      >
        Write a message
      </label>
      <textarea
        id="message-body"
        name="body"
        required
        maxLength={1000}
        rows={4}
        disabled={isPending}
        placeholder="Ask about availability, condition, or meetup details."
        className="w-full resize-y rounded-lg border border-sage-300 bg-surface px-4 py-3 text-sm text-black outline-none transition placeholder:text-black focus:border-transparent focus:ring-2 focus:ring-sage-900 disabled:bg-sage-100"
      />

      {state.message ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className="mt-3 text-sm text-black"
        >
          {state.message}
        </p>
      ) : null}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-sage-300 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-sage-400 disabled:cursor-not-allowed disabled:bg-sage-400"
        >
          {isPending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
