"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

const REFRESH_INTERVAL_MS = 10_000;

export function ConversationRefresh() {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();

  const refresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        startTransition(() => {
          router.refresh();
        });
      }
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [router]);

  return (
    <button
      type="button"
      onClick={refresh}
      disabled={isRefreshing}
      className="text-sm font-semibold text-gray-600 underline transition hover:text-gray-950 disabled:cursor-wait disabled:text-gray-400"
    >
      {isRefreshing ? "Refreshing…" : "Refresh messages"}
    </button>
  );
}
