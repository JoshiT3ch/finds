import { connection } from "next/server";
import { getSearchParam } from "../../../utils/auth/redirects";
import { requireSupabasePublicConfig } from "../../../utils/supabase/config";
import { createClient } from "../../../utils/supabase/server";
import { BrowseClient } from "./browse-client";
import type { BrowseListing } from "./browse-client";

const LISTING_FIELDS =
  "id, title, category, size, condition, price, location, description, flaws, status, image_url, created_at";
const LISTING_IMAGES_PATH = "/storage/v1/object/public/listing-images/";
const LISTING_LIMIT = 100;

type ListingRow = {
  id: string | number | null;
  title: string | null;
  category: string | null;
  size: string | null;
  condition: string | null;
  price: number | string | null;
  location: string | null;
  description: string | null;
  flaws: string | string[] | Record<string, unknown> | null;
  status: string | null;
  image_url: string | null;
  created_at: string | null;
};

type ListingsResult =
  | { status: "success"; listings: BrowseListing[] }
  | { status: "error"; listings: [] };

function getText(value: unknown, fallback: string) {
  const trimmedValue = typeof value === "string" ? value.trim() : "";
  return trimmedValue || fallback;
}

function getFlaws(value: ListingRow["flaws"]) {
  if (Array.isArray(value)) {
    return value.filter((flaw) => typeof flaw === "string").join(" ");
  }

  return getText(value, "");
}

function getPrice(value: ListingRow["price"]) {
  if (typeof value !== "number" && typeof value !== "string") {
    return null;
  }

  const price = typeof value === "string" ? Number(value.trim()) : value;

  return Number.isFinite(price) && price > 0 ? price : null;
}

function getValidListingImageUrl(
  imageUrl: string | null,
  supabaseUrl: string,
) {
  if (!imageUrl) {
    return null;
  }

  try {
    const parsedImageUrl = new URL(imageUrl);
    const parsedSupabaseUrl = new URL(supabaseUrl);

    if (
      parsedImageUrl.protocol !== "https:" ||
      parsedImageUrl.origin !== parsedSupabaseUrl.origin ||
      !parsedImageUrl.pathname.startsWith(LISTING_IMAGES_PATH) ||
      parsedImageUrl.search !== "" ||
      parsedImageUrl.hash !== "" ||
      parsedImageUrl.username !== "" ||
      parsedImageUrl.password !== ""
    ) {
      return null;
    }

    return parsedImageUrl.toString();
  } catch {
    return null;
  }
}

function mapListingRow(row: ListingRow, supabaseUrl: string) {
  const id = row.id === null ? "" : String(row.id).trim();
  const price = getPrice(row.price);

  if (!id || price === null) {
    return null;
  }

  return {
    id,
    name: getText(row.title, "Untitled listing"),
    price,
    size: getText(row.size, "Not specified"),
    condition: getText(row.condition, "Not specified"),
    category: getText(row.category, "Uncategorized"),
    description: getText(row.description, "No description provided."),
    flaws: getFlaws(row.flaws),
    location: getText(row.location, "Location not specified"),
    image: getValidListingImageUrl(row.image_url, supabaseUrl),
  } satisfies BrowseListing;
}

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

    const rows = (data ?? []) as ListingRow[];
    const listings = rows
      .map((row) => mapListingRow(row, supabaseUrl))
      .filter((listing): listing is BrowseListing => listing !== null);

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
