import { html, attrs, partial } from "../../../server/html.js";
import Footer from "../../components/Footer.js";
import Header from "../../components/Header.js";
import { getSearchParam } from "../../../utils/auth/redirects.js";
import { createClient } from "../../../utils/supabase/server.js";
const PROFILE_FIELDS = "id, display_name, created_at";
const PEOPLE_LIMIT = 50;
function getSafeSearchPattern(search) {
    return search.replace(/[\\%_]/g, "").trim().slice(0, 50);
}
async function getPeople(search) {
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
        return { profiles: (data ?? []), loadError: false };
    }
    catch {
        console.error("People search could not be loaded.");
        return { profiles: [], loadError: true };
    }
}
export default async function PeoplePage(props) {
    const searchParams = await props.searchParams;
    const search = getSearchParam(searchParams.search)?.trim() ?? "";
    const { profiles, loadError } = await getPeople(search);
    return (html `
<div class="min-h-screen bg-sage-50">${partial(() => Header({}))}
<main class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
<p class="text-sm font-semibold uppercase tracking-wide text-black">Community</p>
<h1 class="mt-2 text-3xl font-bold text-black">${search ? `People matching “${search}”` : "People on Finds"}</h1>
<p class="mt-2 text-black">Search public display names from buyers and sellers.</p>${loadError ? (html `
<div role="alert" class="mt-8 rounded-lg border border-red-200 bg-red-50 p-6 text-black">
<h2 class="font-semibold">We could not search people.</h2>
<p class="mt-2 text-sm text-black">Refresh the page and try again in a moment.</p></div>`) : profiles.length === 0 ? (html `
<div class="mt-8 rounded-lg border border-sage-200 bg-surface p-10 text-center shadow-sm">
<h2 class="text-lg font-semibold text-black">${search ? "No people found" : "No public profiles yet"}</h2>
<p class="mt-2 text-sm text-black">${search
        ? "Try another display name in the search bar."
        : "New members will appear here after choosing a display name."}</p></div>`) : (html `
<ul class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">${profiles.map((profile) => (html `
<li class="flex items-center gap-4 rounded-lg border border-sage-200 bg-surface p-5 shadow-sm">
<div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-sage-300 text-lg font-bold text-black">${profile.display_name.charAt(0).toUpperCase()}</div>
<div class="min-w-0">
<p class="truncate font-semibold text-black">${profile.display_name}</p>
<p class="mt-1 text-sm text-black">Finds member</p></div></li>`))}</ul>`)}</main>${partial(() => Footer({}))}</div>`);
}
