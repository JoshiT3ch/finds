import { connection } from "next/server";
import { getSearchParam } from "../../../utils/auth/redirects";
import {
  mapPublicListing,
  type PublicListing,
  type PublicListingRow,
} from "../../../utils/listings/public-listing";
import { requireSupabasePublicConfig } from "../../../utils/supabase/config";
import { createClient } from "../../../utils/supabase/server";
import { BrowseClient } from "./browse-client";

const LISTING_FIELDS =
  "id, title, category, size, condition, price, location, description, flaws, status, image_url, created_at";
const LISTING_LIMIT = 100;

type ListingsResult =
  | { status: "success"; listings: PublicListing[] }
  | { status: "error"; listings: [] };

async function getAvailableListings(): Promise<ListingsResult> {
  await connection();

  try {
    const { url: supabaseUrl } = requireSupabasePublicConfig();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("listings")
      .select(LISTING_FIELDS)
      .eq("status", "available")
      .order("created_at", { ascending: false })
      .limit(LISTING_LIMIT);

    if (error) {
      console.error("Browse listings query failed.");
      return { status: "error", listings: [] };
    }

    const rows = (data ?? []) as PublicListingRow[];
    const listings = rows
      .map((row) => mapPublicListing(row, supabaseUrl))
      .filter((listing): listing is PublicListing => listing !== null);

    if (listings.length !== rows.length) {
      console.warn(
        "Browse omitted one or more listings with invalid display data.",
      );
    }

    return { status: "success", listings };
  } catch {
    console.error("Browse listings could not be loaded.");
    return { status: "error", listings: [] };
  }
}

export default async function BrowsePage(props: PageProps<"/browse">) {
  const [searchParams, listingsResult] = await Promise.all([
    props.searchParams,
    getAvailableListings(),
  ]);
  const showCreatedMessage =
    getSearchParam(searchParams.status) === "listing-created";

  return (
    <BrowseClient
      listings={listingsResult.listings}
      loadError={listingsResult.status === "error"}
      showCreatedMessage={showCreatedMessage}
    />
  );
}
