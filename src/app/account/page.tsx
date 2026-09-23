import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "../auth/actions";
import { MyListings, type AccountListing } from "./my-listings";
import {
  mapPublicListing,
  type PublicListingRow,
} from "../../../utils/listings/public-listing";
import { requireSupabasePublicConfig } from "../../../utils/supabase/config";
import { createClient } from "../../../utils/supabase/server";

const ACCOUNT_LISTING_FIELDS =
  "id, title, category, size, condition, price, status, image_url, created_at";

type SellerListingsResult = {
  listings: AccountListing[];
  loadError: boolean;
};

function getCreatedAt(value: unknown) {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    return null;
  }

  return value;
}

function mapAccountListing(row: PublicListingRow, supabaseUrl: string) {
  if (row.status !== "available" && row.status !== "sold") return null;

  const listing = mapPublicListing(row, supabaseUrl);
  if (!listing) return null;

  return {
    id: listing.id,
    title: listing.name,
    price: listing.price,
    status: row.status,
    category: listing.category,
    size: listing.size,
    condition: listing.condition,
    image: listing.image,
    createdAt: getCreatedAt(row.created_at),
  } satisfies AccountListing;
}

async function getSellerListings(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sellerId: string,
): Promise<SellerListingsResult> {
  try {
    const { url: supabaseUrl } = requireSupabasePublicConfig();
    const { data, error } = await supabase
      .from("listings")
      .select(ACCOUNT_LISTING_FIELDS)
      .eq("seller_id", sellerId)
      .in("status", ["available", "sold"])
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Account listings query failed.");
      return { listings: [], loadError: true };
    }

    const listings = (data ?? [])
      .map((row) => mapAccountListing(row as PublicListingRow, supabaseUrl))
      .filter((listing): listing is AccountListing => listing !== null);

    return { listings, loadError: false };
  } catch {
    console.error("Account listings could not be loaded.");
    return { listings: [], loadError: true };
  }
}

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  let supabase: Awaited<ReturnType<typeof createClient>>;
  let claims: Record<string, unknown> | undefined;

  try {
    supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
      redirect("/login?next=/account");
    }

    claims = data.claims;
  } catch {
    redirect("/login?next=/account");
  }

  const sellerId = claims?.sub;
  if (typeof sellerId !== "string") {
    redirect("/login?next=/account");
  }

  const email = typeof claims?.email === "string" ? claims.email : undefined;
  const { listings, loadError } = await getSellerListings(supabase, sellerId);

  return (
    <main className="min-h-screen bg-sage-50 px-4 py-6 text-black sm:px-6 sm:py-10 lg:px-8">
      <section className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4">
            Finds
          </Link>
          <Link
            href="/browse"
            aria-label="Close account and return to Browse"
            title="Back to Browse"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-sage-300 bg-surface px-3 text-sm font-medium text-black transition hover:border-sage-500 hover:bg-sage-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage-950 sm:px-4"
          >
            <span className="hidden sm:inline">Back to Browse</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </Link>
        </div>

        <div className="rounded-2xl border border-sage-200 bg-surface p-5 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-black">
                Your Finds
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-black">
                My account
              </h1>
              <p className="mt-2 text-sm text-black">
                Manage your listings and keep up with your conversations.
              </p>
            </div>
            <Link href="/messages" className="inline-flex min-h-11 items-center rounded-lg border border-sage-300 px-4 text-sm font-semibold transition hover:bg-sage-50 focus-visible:outline-2 focus-visible:outline-offset-4">
              View messages
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-5 border-t border-sage-200 pt-5">
            {email ? (
              <dl className="min-w-0">
                <dt className="text-sm font-medium text-black">Signed in as</dt>
                <dd className="mt-1 break-words text-base font-semibold text-black">
                  {email}
                </dd>
              </dl>
            ) : null}

            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md border border-sage-300 bg-surface px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-sage-100 focus:outline-none focus:ring-2 focus:ring-sage-950 focus:ring-offset-2"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-sage-200 bg-surface p-5 shadow-sm sm:p-8">
          <MyListings listings={listings} loadError={loadError} />
        </div>
      </section>
    </main>
  );
}
