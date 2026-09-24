import { html, attrs, partial } from "../../../../server/html.js";
const initialState = {
    status: "idle",
    message: "",
};
export function ForgotPasswordForm({ notice, noticeIsError = false, }) {
    const state = initialState;
    const action = "/actions/forgotPassword";
    const isPending = false;
    const message = state.message || notice;
    const messageId = message ? "forgot-password-message" : undefined;
    const isError = state.status === "error" || (!state.message && noticeIsError);
    return (html `
<div class="w-full max-w-md rounded-lg border border-sage-200 bg-surface p-6 shadow-sm">
<div class="mb-6">
<p class="text-sm font-semibold uppercase tracking-wide text-black">Finds account</p>
<h1 class="mt-2 text-3xl font-bold text-black">Reset password</h1></div>${message ? (html `
<p${attrs({ "id": messageId, "role": isError ? "alert" : "status", "className": `mb-5 rounded-md border px-4 py-3 text-sm ${isError
            ? "border-red-200 bg-red-50 text-black"
            : "border-green-200 bg-green-50 text-black"}` })}>${message}</p>`) : null}
<form class="space-y-5" method="post"${attrs({ "action": action, "aria-describedby": messageId })}>
<div>
<label for="forgot-password-email" class="block text-sm font-medium text-black">Email</label>
<input id="forgot-password-email" name="email" type="email" autocomplete="email" class="mt-2 block w-full rounded-md border border-sage-300 bg-surface px-3 py-2 text-black shadow-sm outline-none transition focus:border-sage-950 focus:ring-2 focus:ring-sage-950/10"${attrs({ "required": true, "aria-invalid": Boolean(state.fieldErrors?.email), "aria-describedby": state.fieldErrors?.email
            ? "forgot-password-email-error"
            : undefined })}>${state.fieldErrors?.email ? (html `
<p id="forgot-password-email-error" class="mt-2 text-sm text-black">${state.fieldErrors.email}</p>`) : null}</div>
<button type="submit" class="w-full rounded-md bg-sage-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-sage-400"${attrs({ "disabled": isPending })}>${isPending ? "Sending reset link..." : "Send reset link"}</button></form>
<p class="mt-6 text-center text-sm text-black">Remembered it?${" "}<a href="/login" class="font-semibold text-black underline">Log in</a></p></div>`);
}
