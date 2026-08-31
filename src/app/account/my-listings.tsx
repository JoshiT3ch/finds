"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import {
  deleteListing,
  updateListingStatus,
  type ListingActionState,
} from "./actions";

export type AccountListing = {
  id: string;
  title: string;
  price: number;
  status: "available" | "sold";
  category: string;
  size: string;
  condition: string;
  image: string | null;
  createdAt: string | null;
};

const initialActionState: ListingActionState = {
  status: "idle",
  message: "",
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

function formatCreatedAt(createdAt: string | null) {
  if (!createdAt) return "Date unavailable";

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" }).format(
    date,
  );
}

function ActionNotice({ state }: { state: ListingActionState }) {
  if (state.status === "idle") return null;

  const isError = state.status === "error";
  const isWarning = state.status === "warning";

  return (
    <p
      role={isError ? "alert" : "status"}
      className={`mt-3 text-sm ${
        isError
          ? "text-red-700"
          : isWarning
            ? "text-amber-700"
            : "text-green-700"
      }`}
    >
      {state.message}
    </p>
  );
}

function ListingControls({ listing }: { listing: AccountListing }) {
  const [statusState, statusAction, isStatusPending] = useActionState(
    updateListingStatus,
    initialActionState,
  );
  const [deleteState, deleteAction, isDeletePending] = useActionState(
    deleteListing,
    initialActionState,
  );
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const nextStatus = listing.status === "available" ? "sold" : "available";
  const isPending = isStatusPending || isDeletePending;

  return (
    <div className="mt-5 border-t border-gray-200 pt-4">
      <div className="flex flex-wrap gap-3">
        <form action={statusAction}>
          <input type="hidden" name="listingId" value={listing.id} />
          <input type="hidden" name="status" value={nextStatus} />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-gray-400"
          >
            {isStatusPending
              ? "Saving..."
              : listing.status === "available"
                ? "Mark as Sold"
                : "Mark as Available"}
          </button>
        </form>

        {isConfirmingDelete ? (
          <form action={deleteAction} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="listingId" value={listing.id} />
            <input type="hidden" name="confirmation" value="delete" />
            <span className="text-sm font-medium text-gray-700">
              Delete this listing?
            </span>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-red-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              {isDeletePending ? "Deleting..." : "Yes, delete"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setIsConfirmingDelete(false)}
              className="rounded-md px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() => setIsConfirmingDelete(true)}
            className="rounded-md px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-red-300"
          >
            Delete
          </button>
        )}
      </div>
      <ActionNotice state={statusState} />
      <ActionNotice state={deleteState} />
    </div>
  );
}

function ListingImage({ listing }: { listing: AccountListing }) {
  return (
    <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-gray-100 sm:h-36 sm:w-36 sm:flex-none">
      {listing.image?.startsWith("https://") ? (
        <Image
          src={listing.image}
          alt={listing.title}
          fill
          sizes="(max-width: 640px) 100vw, 144px"
          className="object-cover"
        />
      ) : (
        <span className="px-4 text-center text-sm font-medium text-gray-500">
          Image unavailable
        </span>
      )}
    </div>
  );
}

function ListingRow({ listing }: { listing: AccountListing }) {
  const isAvailable = listing.status === "available";

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <ListingImage listing={listing} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-950">
                  {isAvailable ? (
                    <Link
                      href={`/items/${listing.id}`}
                      className="transition hover:underline"
                    >
                      {listing.title}
                    </Link>
                  ) : (
                    listing.title
                  )}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                    isAvailable
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {isAvailable ? "Available" : "Sold"}
                </span>
              </div>
              <p className="mt-1 text-lg font-bold text-gray-950">
                {formatPrice(listing.price)}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Listed {formatCreatedAt(listing.createdAt)}
            </p>
          </div>

          <dl className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-700 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Category
              </dt>
              <dd className="mt-1 font-medium text-gray-900">
                {listing.category}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Size
              </dt>
              <dd className="mt-1 font-medium text-gray-900">{listing.size}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Condition
              </dt>
              <dd className="mt-1 font-medium text-gray-900">
                {listing.condition}
              </dd>
            </div>
          </dl>

          {isAvailable ? (
            <Link
              href={`/items/${listing.id}`}
              className="mt-4 inline-flex text-sm font-semibold text-gray-800 underline transition hover:text-gray-950"
            >
              View public listing
            </Link>
          ) : null}

          <ListingControls listing={listing} />
        </div>
      </div>
    </article>
  );
}

export function MyListings({
  listings,
  loadError,
}: {
  listings: AccountListing[];
  loadError: boolean;
}) {
  return (
    <section className="mt-8 border-t border-gray-200 pt-8" aria-labelledby="my-listings-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Seller dashboard
          </p>
          <h2 id="my-listings-heading" className="mt-2 text-2xl font-bold text-gray-950">
            My Listings
          </h2>
        </div>
        <Link
          href="/sell"
          className="rounded-md bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
        >
          List an Item
        </Link>
      </div>

      {loadError ? (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-red-900"
        >
          <h3 className="font-semibold">We could not load your listings.</h3>
          <p className="mt-2 text-sm text-red-800">
            Please refresh the page and try again in a moment.
          </p>
        </div>
      ) : listings.length > 0 ? (
        <div className="mt-6 space-y-4">
          {listings.map((listing) => (
            <ListingRow key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <h3 className="font-semibold text-gray-950">No listings yet.</h3>
          <p className="mt-2 text-sm text-gray-600">
            List your first pre-loved find to see it here.
          </p>
          <Link
            href="/sell"
            className="mt-5 inline-flex rounded-md bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
          >
            List an Item
          </Link>
        </div>
      )}
    </section>
  );
}
