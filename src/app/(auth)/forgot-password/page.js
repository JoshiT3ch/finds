import { html, attrs, partial } from "../../../../server/html.js";
import { getSearchParam } from "../../../../utils/auth/redirects.js";
import { ForgotPasswordForm } from "./forgot-password-form.js";
function getNotice(status) {
    if (status === "recovery-error") {
        return "We could not confirm that reset link. Request a new password-reset email.";
    }
    return undefined;
}
export default async function ForgotPasswordPage(props) {
    const searchParams = await props.searchParams;
    const status = getSearchParam(searchParams.status);
    return (html `
<main class="flex min-h-screen items-center justify-center bg-sage-50 px-4 py-10 text-black sm:px-6 lg:px-8">${partial(() => ForgotPasswordForm({ "notice": getNotice(status), "noticeIsError": status === "recovery-error" }))}</main>`);
}
