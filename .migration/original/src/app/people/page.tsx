import { connection } from "next/server";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getSearchParam } from "../../../utils/auth/redirects";
import { createClient } from "../../../utils/supabase/server";

const PROFILE_FIELDS = "id, display_name, created_at";
const PEOPLE_LIMIT = 50;

type PublicProfile = {
  id: string;
  display_name: string;
  created_at: string;
};

type PeopleResult = {
  profiles: PublicProfile[];
  loadError: boolean;
};

function getSafeSearchPattern(search: string) {
  return search.replace(/[\\%_]/g, "").trim().slice(0, 50);
}

async function getPeople(search: string): Promise<PeopleResult> {
  await connection();

  try {
    const supabase = await createClient();
    let query = supabase
      .from("profiles")
      .select(PROFILE_FIELDS)
      .order("display_name", { ascending: true })
      .limit(PEOPLE_LIMIT);
    const searchPattern = getSafeSearchPattern(search);

    if (searchPattern) {
      query = query.ilike("display_name", `%${searchPattern}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("People search query failed.");
      return { profiles: [], loadError: true };
    }

    return { profiles: (data ?? []) as PublicProfile[], loadError: false };
  } catch {
    console.error("People search could not be loaded.");
    return { profiles: [], loadError: true };
  }
}

export const dynamic = "force-dynamic";

export default async function PeoplePage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const search = getSearchParam(searchParams.search)?.trim() ?? "";
  const { profiles, loadError } = await getPeople(search);

  return (
    <div className="min-h-screen bg-sage-50">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-black">
          Community
        </p>
        <h1 className="mt-2 text-3xl font-bold text-black">
          {search ? `People matching “${search}”` : "People on Finds"}
        </h1>
        <p className="mt-2 text-black">
          Search public display names from buyers and sellers.
        </p>

        {loadError ? (
          <div
            role="alert"
            className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6 text-black"
          >
            <h2 className="font-semibold">We could not search people.</h2>
            <p className="mt-2 text-sm text-black">
              Refresh the page and try again in a moment.
            </p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="mt-8 rounded-lg border border-sage-200 bg-surface p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-black">
              {search ? "No people found" : "No public profiles yet"}
            </h2>
            <p className="mt-2 text-sm text-black">
              {search
                ? "Try another display name in the search bar."
                : "New members will appear here after choosing a display name."}
            </p>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <li
                key={profile.id}
                className="flex items-center gap-4 rounded-lg border border-sage-200 bg-surface p-5 shadow-sm"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-sage-300 text-lg font-bold text-black">
                  {profile.display_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-black">
                    {profile.display_name}
                  </p>
                  <p className="mt-1 text-sm text-black">Finds member</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}
