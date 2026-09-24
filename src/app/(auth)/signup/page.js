import { html, attrs, partial } from "../../../../server/html.js";
import { getSafeRedirectPath, getSearchParam, } from "../../../../utils/auth/redirects.js";
import { SignupForm } from "./signup-form.js";
export default async function SignupPage(props) {
    const searchParams = await props.searchParams;
    const next = getSafeRedirectPath(getSearchParam(searchParams.next));
    return (html `
<main class="flex min-h-screen items-center justify-center bg-sage-50 px-4 py-10 text-black sm:px-6 lg:px-8">${partial(() => SignupForm({ "next": next }))}</main>`);
}
