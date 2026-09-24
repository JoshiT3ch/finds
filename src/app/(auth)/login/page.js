import { html, attrs, partial } from "../../../../server/html.js";
import { redirect } from "../../../../server/request.js";
import { getSafeRedirectPath, getSearchParam, } from "../../../../utils/auth/redirects.js";
import { createClient } from "../../../../utils/supabase/server.js";
import { LoginForm } from "./login-form.js";
function getNotice(status) {
    if (status === "signed-out") {
        return "You have been signed out.";
    }
    if (status === "confirmation-error") {
        return "We could not confirm that link. Please try signing in.";
    }
    if (status === "password-updated") {
        return "Your password has been updated. Log in with your new password.";
    }
    return undefined;
}
export default async function LoginPage(props) {
    const searchParams = await props.searchParams;
    const next = getSafeRedirectPath(getSearchParam(searchParams.next));
    const notice = getNotice(getSearchParam(searchParams.status));
    let shouldRedirect = false;
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.getClaims();
        if (!error && data?.claims) {
            shouldRedirect = true;
        }
    }
    catch {
        // Keep the login form reachable so it can show a safe action-level error.
    }
    if (shouldRedirect) {
        redirect(next);
    }
    return (html `
<main class="flex min-h-screen items-center justify-center bg-sage-50 px-4 py-10 text-black sm:px-6 lg:px-8">${partial(() => LoginForm({ "next": next, "notice": notice }))}</main>`);
}
