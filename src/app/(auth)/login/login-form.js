import { html, attrs, partial } from "../../../../server/html.js";
const initialState = {
    status: "idle",
    message: "",
};
export function LoginForm({ next, notice }) {
    const state = initialState;
    const action = "/actions/login";
    const isPending = false;
    const message = state.message || notice;
    const messageId = message ? "login-message" : undefined;
    const isError = state.status === "error";
    return (html `
<div class="w-full max-w-md rounded-lg border border-sage-200 bg-surface p-6 shadow-sm">
<div class="mb-6">
<p class="text-sm font-semibold uppercase tracking-wide text-black">Finds account</p>
<h1 class="mt-2 text-3xl font-bold text-black">Log in</h1></div>${message ? (html `
<p${attrs({ "id": messageId, "role": isError ? "alert" : "status", "className": `mb-5 rounded-md border px-4 py-3 text-sm ${isError
            ? "border-red-200 bg-red-50 text-black"
            : "border-green-200 bg-green-50 text-black"}` })}>${message}</p>`) : null}
<form class="space-y-5" method="post"${attrs({ "action": action, "aria-describedby": messageId })}>
<input type="hidden" name="next"${attrs({ "value": next })}>
<div>
<label for="login-email" class="block text-sm font-medium text-black">Email</label>
<input id="login-email" name="email" type="email" autocomplete="email" class="mt-2 block w-full rounded-md border border-sage-300 bg-surface px-3 py-2 text-black shadow-sm outline-none transition focus:border-sage-950 focus:ring-2 focus:ring-sage-950/10"${attrs({ "required": true, "aria-invalid": Boolean(state.fieldErrors?.email), "aria-describedby": state.fieldErrors?.email ? "login-email-error" : undefined })}>${state.fieldErrors?.email ? (html `
<p id="login-email-error" class="mt-2 text-sm text-black">${state.fieldErrors.email}</p>`) : null}</div>
<div>
<div class="flex items-center justify-between gap-4">
<label for="login-password" class="block text-sm font-medium text-black">Password</label><a href="/forgot-password" class="text-sm font-semibold text-black underline">Forgot password?</a></div>
<input id="login-password" name="password" type="password" autocomplete="current-password" class="mt-2 block w-full rounded-md border border-sage-300 bg-surface px-3 py-2 text-black shadow-sm outline-none transition focus:border-sage-950 focus:ring-2 focus:ring-sage-950/10"${attrs({ "minLength": 8, "required": true, "aria-invalid": Boolean(state.fieldErrors?.password), "aria-describedby": state.fieldErrors?.password ? "login-password-error" : undefined })}>${state.fieldErrors?.password ? (html `
<p id="login-password-error" class="mt-2 text-sm text-black">${state.fieldErrors.password}</p>`) : null}</div>
<button type="submit" class="w-full rounded-md bg-sage-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-sage-400"${attrs({ "disabled": isPending })}>${isPending ? "Logging in..." : "Log in"}</button></form>
<p class="mt-6 text-center text-sm text-black">No account yet?${" "}<a class="font-semibold text-black underline"${attrs({ "href": `/signup?next=${encodeURIComponent(next)}` })}>Sign up</a></p></div>`);
}
