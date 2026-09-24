import { html, attrs, partial } from "../../../../server/html.js";
import { redirect } from "../../../../server/request.js";
import { createClient } from "../../../../utils/supabase/server.js";
import { UpdatePasswordForm } from "./update-password-form.js";
export default async function UpdatePasswordPage() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
        redirect("/forgot-password");
    }
    return (html `
<main class="flex min-h-screen items-center justify-center bg-sage-50 px-4 py-10 text-black sm:px-6 lg:px-8">${partial(() => UpdatePasswordForm({}))}</main>`);
}
