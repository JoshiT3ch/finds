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
    <main className="min-h-screen bg-gray-50 px-4 py-10 text-gray-950 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Account
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-950">
            You are signed in
          </h1>

          {email ? (
            <dl className="mt-6 border-t border-gray-200 pt-5">
              <dt className="text-sm font-medium text-gray-600">Email</dt>
              <dd className="mt-1 break-words text-base font-semibold text-gray-950">
                {email}
              </dd>
            </dl>
          ) : null}

          <form action={signOut} className="mt-8">
            <button
              type="submit"
              className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
            >
              Sign out
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <MyListings listings={listings} loadError={loadError} />
        </div>
      </section>
    </main>
  );
}
