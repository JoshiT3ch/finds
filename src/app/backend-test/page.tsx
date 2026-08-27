import { connection } from "next/server";
import { createClient } from "../../../utils/supabase/server";

const TEST_LISTING_TITLE = "Supabase Test Denim Jacket";

type ListingRow = {
  title: string | null;
  category: string | null;
  size: string | null;
  condition: string | null;
  price: number | string | null;
  location: string | null;
  description: string | null;
  flaws: string | string[] | Record<string, unknown> | null;
  status: string | null;
};

type QueryState =
  | { status: "success"; listing: ListingRow }
  | { status: "empty" }
  | { status: "error"; message: string };

const fields: Array<[string, keyof ListingRow]> = [
  ["Title", "title"],
  ["Category", "category"],
  ["Size", "size"],
  ["Condition", "condition"],
  ["Price", "price"],
  ["Location", "location"],
  ["Description", "description"],
  ["Flaws", "flaws"],
  ["Status", "status"],
];

function formatValue(value: ListingRow[keyof ListingRow]) {
  if (value === null || value === undefined || value === "") {
    return "Not set";
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "Not set";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

async function getTestListing(): Promise<QueryState> {
  await connection();

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return {
      status: "error",
      message:
        "Supabase environment variables are not configured for this local runtime.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "title, category, size, condition, price, location, description, flaws, status",
    )
    .eq("title", TEST_LISTING_TITLE)
    .maybeSingle();

  if (error) {
    return {
      status: "error",
      message:
        "The Supabase SELECT query failed. Check the public anon key, RLS SELECT policy, and local runtime configuration.",
    };
  }

  if (!data) {
    return { status: "empty" };
  }

  return { status: "success", listing: data as ListingRow };
}

export default async function BackendTestPage() {
  const result = await getTestListing();

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-gray-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Backend connection test
        </p>
        <h1 className="mb-6 text-3xl font-bold">Supabase listings read</h1>

        {result.status === "success" ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-6">
            <p className="mb-6 text-lg font-semibold text-green-800">
              Supabase connection successful
            </p>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.map(([label, key]) => (
                <div key={key} className="border-t border-green-200 pt-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-green-900">
                    {label}
                  </dt>
                  <dd className="mt-1 break-words text-sm text-gray-800">
                    {formatValue(result.listing[key])}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : result.status === "empty" ? (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
            <p className="font-semibold text-yellow-900">
              Supabase query completed, but the test listing was not found.
            </p>
            <p className="mt-2 text-sm text-yellow-800">
              Expected an available row titled exactly{" "}
              <code>{TEST_LISTING_TITLE}</code> in public.listings.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <p className="font-semibold text-red-900">
              Supabase connection test failed
            </p>
            <p className="mt-2 text-sm text-red-800">{result.message}</p>
          </div>
        )}
      </section>
    </main>
  );
}
