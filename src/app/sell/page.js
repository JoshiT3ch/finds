import { html, attrs, partial } from "../../../server/html.js";
import { redirect } from "../../../server/request.js";
import Header from "../../components/Header.js";
import Footer from "../../components/Footer.js";
import { createClient } from "../../../utils/supabase/server.js";
import { SellForm } from "./sell-form.js";
export default async function SellPage() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
        redirect("/login?next=/sell");
    }
    return (html `
<div class="min-h-screen bg-background">${partial(() => Header({}))}
<main class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
<div class="mb-10 max-w-2xl">
<h1 class="mb-2 text-3xl font-bold text-black">Sell your find</h1>
<p class="text-black">Give a pre-loved piece a new home. Add the details below to prepare your Finds listing.</p></div>${partial(() => SellForm({}))}</main>${partial(() => Footer({}))}</div>`);
}
