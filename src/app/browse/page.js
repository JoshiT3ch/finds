import { html, attrs, partial } from "../../../server/html.js";
import Footer from "../../components/Footer.js";
import Header from "../../components/Header.js";
import { getSearchParam } from "../../../utils/auth/redirects.js";
import { mapPublicListing, } from "../../../utils/listings/public-listing.js";
import { requireSupabasePublicConfig } from "../../../utils/supabase/config.js";
import { createClient } from "../../../utils/supabase/server.js";
import { BrowseClient } from "./browse-client.js";
import { isDepartment } from "../../../utils/listings/departments.js";
const LISTING_FIELDS = "id, title, department, category, size, condition, price, location, description, flaws, status, image_url, created_at";
const LISTING_LIMIT = 100;
async function getAvailableListings() {
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
        const rows = (data ?? []);
        const listings = rows
            .map((row) => mapPublicListing(row, supabaseUrl))
            .filter((listing) => listing !== null);
        if (listings.length !== rows.length) {
            console.warn("Browse omitted one or more listings with invalid display data.");
        }
        return { status: "success", listings };
    }
    catch {
        console.error("Browse listings could not be loaded.");
        return { status: "error", listings: [] };
    }
}
export default async function BrowsePage(props) {
    const [searchParams, listingsResult] = await Promise.all([
        props.searchParams,
        getAvailableListings(),
    ]);
    const showCreatedMessage = getSearchParam(searchParams.status) === "listing-created";
    const initialCategory = getSearchParam(searchParams.category) ?? "";
    const departmentParam = getSearchParam(searchParams.department);
    const initialDepartment = isDepartment(departmentParam) ? departmentParam : "";
    const initialSearchQuery = getSearchParam(searchParams.search) ?? "";
    return (html `
<div class="min-h-screen bg-background">${partial(() => Header({}))}${partial(() => BrowseClient({ "listings": listingsResult.listings, "loadError": listingsResult.status === "error", "showCreatedMessage": showCreatedMessage, "initialCategory": initialCategory, "initialDepartment": initialDepartment, "initialSearchQuery": initialSearchQuery }))}${partial(() => Footer({}))}</div>`);
}
