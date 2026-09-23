import Link from "next/link";
import { connection } from "next/server";
import {
  mapPublicListing,
  type PublicListing,
  type PublicListingRow,
} from "../../utils/listings/public-listing";
import { requireSupabasePublicConfig } from "../../utils/supabase/config";
import { createClient } from "../../utils/supabase/server";
import ProductCard from "./ProductCard";

const FEATURED_LISTING_FIELDS =
  "id, title, category, size, condition, price, location, status, image_url, created_at";
const FEATURED_LISTING_LIMIT = 4;

type FeaturedListingsResult =
  | { status: "success"; listings: PublicListing[] }
  | { status: "error"; listings: [] };

async function getFeaturedListings(): Promise<FeaturedListingsResult> {
  await connection();

  try {
    const { url: supabaseUrl } = requireSupabasePublicConfig();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("listings")
      .select(FEATURED_LISTING_FIELDS)
      .eq("status", "available")
      .order("created_at", { ascending: false })
      .limit(FEATURED_LISTING_LIMIT);

    if (error) {
      console.error("Featured listings query failed.");
      return { status: "error", listings: [] };
    }

    const rows = (data ?? []) as PublicListingRow[];
    const listings = rows
      .map((row) => mapPublicListing(row, supabaseUrl))
      .filter((listing): listing is PublicListing => listing !== null);

    if (listings.length !== rows.length) {
      console.warn(
        "Featured listings omitted one or more rows with invalid display data.",
      );
    }

    return { status: "success", listings };
  } catch {
    console.error("Featured listings could not be loaded.");
    return { status: "error", listings: [] };
  }
}

export default async function FeaturedFinds() {
  const result = await getFeaturedListings();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-baseline justify-between gap-4">
        <h2 className="text-2xl font-bold text-black">Featured Finds</h2>
        <Link
          href="/browse"
          className="text-sm font-medium text-black underline transition hover:text-black"
        >
          View all
        </Link>
      </div>

      {result.status === "error" ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-6 text-black"
        >
          <h3 className="font-semibold">We could not load featured finds.</h3>
          <p className="mt-2 text-sm text-black">
            Please refresh the page or browse all available listings.
          </p>
          <Link
            href="/browse"
            className="mt-4 inline-flex text-sm font-semibold underline"
          >
            Browse listings
          </Link>
        </div>
      ) : result.listings.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {result.listings.map((listing) => (
            <ProductCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-sage-200 bg-sage-50 p-8 text-center">
          <h3 className="font-semibold text-black">
            No featured finds yet.
          </h3>
          <p className="mt-2 text-sm text-black">
            Check back soon, or be the first to list an item.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              href="/browse"
              className="rounded-lg border border-sage-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-surface"
            >
              Browse listings
            </Link>
            <Link
              href="/sell"
              className="rounded-lg bg-sage-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-sage-400"
            >
              List an Item
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
