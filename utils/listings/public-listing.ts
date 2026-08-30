const LISTING_IMAGES_PATH = "/storage/v1/object/public/listing-images/";

export type PublicListingRow = {
  id: string | number | null;
  title: string | null;
  category: string | null;
  size: string | null;
  condition: string | null;
  price: number | string | null;
  location?: string | null;
  description?: string | null;
  flaws?: string | string[] | Record<string, unknown> | null;
  status?: string | null;
  image_url: string | null;
  created_at?: string | null;
};

export type PublicListing = {
  id: string;
  name: string;
  price: number;
  size: string;
  condition: string;
  category: string;
  description: string;
  flaws: string;
  location: string;
  image: string | null;
};

function getText(value: unknown, fallback: string) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || fallback;
}

function getFlaws(value: PublicListingRow["flaws"]) {
  if (Array.isArray(value)) {
    return value.filter((flaw) => typeof flaw === "string").join(" ").trim();
  }

  return getText(value, "");
}

function getPrice(value: PublicListingRow["price"]) {
  if (typeof value !== "number" && typeof value !== "string") {
    return null;
  }

  const price = typeof value === "string" ? Number(value.trim()) : value;

  return Number.isFinite(price) && price > 0 ? price : null;
}

export function getValidListingImageUrl(
  imageUrl: string | null,
  supabaseUrl: string,
) {
  if (!imageUrl) return null;

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

export function mapPublicListing(
  row: PublicListingRow,
  supabaseUrl: string,
): PublicListing | null {
  const id = row.id === null ? "" : String(row.id).trim();
  const price = getPrice(row.price);

  if (!id || price === null) return null;

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
  };
}
