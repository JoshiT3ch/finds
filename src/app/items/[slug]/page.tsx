import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ItemActions from "@/components/ItemActions";
import {
  getListingBySlug,
  getRelatedListings,
  listings,
  type Listing,
} from "@/data/listings";
import {
  mapPublicListing,
  type PublicListing,
  type PublicListingRow,
} from "../../../../utils/listings/public-listing";
import { requireSupabasePublicConfig } from "../../../../utils/supabase/config";
import { createClient } from "../../../../utils/supabase/server";

const LISTING_FIELDS =
  "id, title, category, size, condition, price, location, description, flaws, status, image_url, created_at";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const dynamic = "force-dynamic";

type DatabaseLookup =
  | { status: "success"; listing: PublicListing }
  | { status: "missing" }
  | { status: "error" };

function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

async function getDatabaseListing(id: string): Promise<DatabaseLookup> {
  try {
    const { url: supabaseUrl } = requireSupabasePublicConfig();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("listings")
      .select(LISTING_FIELDS)
      .eq("id", id)
      .eq("status", "available")
      .maybeSingle();

    if (error) {
      console.error("Item listing query failed.");
      return { status: "error" };
    }

    const listing = data
      ? mapPublicListing(data as PublicListingRow, supabaseUrl)
      : null;

    return listing ? { status: "success", listing } : { status: "missing" };
  } catch {
    console.error("Item listing could not be loaded.");
    return { status: "error" };
  }
}

export function generateStaticParams() {
  return listings.map((listing) => ({ slug: listing.slug }));
}

export async function generateMetadata(
  props: PageProps<"/items/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;

  if (isUuid(slug)) {
    const result = await getDatabaseListing(slug);
    if (result.status === "success") {
      return {
        title: `${result.listing.name} - Finds Marketplace`,
        description: result.listing.description,
      };
    }
    if (result.status === "missing") notFound();
  } else {
    const listing = getListingBySlug(slug);
    if (listing) {
      return {
        title: `${listing.name} - Finds Marketplace`,
        description: listing.description,
      };
    }
  }

  return {
    title: "Item Details - Finds Marketplace",
    description: "View item details on Finds",
  };
}

type DetailListing = Omit<PublicListing, "id" | "flaws"> & {
  id: string | number;
  flaws?: string;
  brand?: string;
  sellerName?: string;
};

function ListingImage({ listing }: { listing: DetailListing }) {
  return (
    <div className="flex h-96 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100 sm:h-[500px]">
      {listing.image?.startsWith("https://") ? (
        <Image
          src={listing.image}
          alt={listing.name}
          width={1200}
          height={1200}
          className="h-full w-full object-cover"
        />
      ) : listing.image ? (
        <div className="text-9xl">{listing.image}</div>
      ) : (
        <div className="px-6 text-center text-sm font-medium text-gray-500">
          Image unavailable
        </div>
      )}
    </div>
  );
}

function ItemDetail({
  listing,
  relatedListings = [],
  showActions = false,
}: {
  listing: DetailListing;
  relatedListings?: Listing[];
  showActions?: boolean;
}) {
  const formattedPrice = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(listing.price);
  const sellerInitial = listing.sellerName?.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/browse"
          className="mb-8 inline-flex items-center gap-2 font-medium text-gray-600 transition hover:text-gray-900"
        >
          <span aria-hidden="true">←</span>
          Back to Browse
        </Link>

        <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ListingImage listing={listing} />
          </div>

          <div className="lg:col-span-1">
            <div className="mb-4">
              <span className="inline-block rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                {listing.category}
              </span>
            </div>
            <h1 className="mb-2 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
              {listing.name}
            </h1>
            {listing.brand ? (
              <p className="mb-4 text-sm font-medium text-gray-500">
                {listing.brand}
              </p>
            ) : null}
            <div className="mb-6 border-b border-gray-200 pb-6">
              <p className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {formattedPrice}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 border-b border-gray-200 pb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Size
                </p>
                <p className="mt-1 text-base font-medium text-gray-900">
                  {listing.size}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Condition
                </p>
                <p className="mt-1 text-base font-medium text-gray-900">
                  {listing.condition}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Location
                </p>
                <p className="mt-1 text-base font-medium text-gray-900">
                  {listing.location}
                </p>
              </div>
            </div>

            <div className="mb-6 border-b border-gray-200 pb-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-700">
                Details
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                {listing.description}
              </p>
            </div>

            {listing.flaws ? (
              <div className="mb-6 border-b border-gray-200 pb-6">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-700">
                  Flaws
                </h2>
                <p className="text-sm leading-relaxed text-gray-600">
                  {listing.flaws}
                </p>
              </div>
            ) : null}

            {showActions && listing.sellerName ? (
              <>
                <div className="mb-6 border-b border-gray-200 pb-6">
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
                    Seller
                  </h2>
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-300">
                      <span className="text-lg font-bold text-gray-700">
                        {sellerInitial}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {listing.sellerName}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-600">
                        {listing.location}
                      </p>
                    </div>
                  </div>
                </div>
                <ItemActions />
              </>
            ) : null}
          </div>
        </div>

        {relatedListings.length > 0 ? (
          <section className="border-t border-gray-200 pt-16">
            <h2 className="mb-8 text-2xl font-bold text-gray-900">
              Related Finds
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedListings.map((relatedListing) => (
                <ProductCard key={relatedListing.id} listing={relatedListing} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

function ListingError() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">
          We could not load this listing.
        </h1>
        <p className="mt-3 text-gray-600">
          Please try again in a moment or return to Browse.
        </p>
        <Link
          href="/browse"
          className="mt-8 inline-flex rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
        >
          Back to Browse
        </Link>
      </main>
      <Footer />
    </div>
  );
}

export default async function ItemPage(props: PageProps<"/items/[slug]">) {
  const { slug } = await props.params;

  if (!isUuid(slug)) {
    const listing = getListingBySlug(slug);
    if (!listing) notFound();

    return (
      <ItemDetail
        listing={listing}
        relatedListings={getRelatedListings(slug, 3)}
        showActions
      />
    );
  }

  const result = await getDatabaseListing(slug);
  if (result.status === "missing") notFound();
  if (result.status === "error") return <ListingError />;

  return <ItemDetail listing={result.listing} />;
}
