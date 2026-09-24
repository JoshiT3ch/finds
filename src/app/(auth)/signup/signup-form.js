import { html, attrs, partial } from "../../../../server/html.js";
const initialState = {
    status: "idle",
    message: "",
};
export function SignupForm({ next }) {
    const state = initialState;
    const action = "/actions/signup";
    const isPending = false;
    const messageId = state.message ? "signup-message" : undefined;
    const isError = state.status === "error";
    return (html `
<div class="w-full max-w-md rounded-lg border border-sage-200 bg-surface p-6 shadow-sm">
<div class="mb-6">
<p class="text-sm font-semibold uppercase tracking-wide text-black">Finds account</p>
<h1 class="mt-2 text-3xl font-bold text-black">Sign up</h1></div>${state.message ? (html `
<p${attrs({ "id": messageId, "role": isError ? "alert" : "status", "className": `mb-5 rounded-md border px-4 py-3 text-sm ${isError
            ? "border-red-200 bg-red-50 text-black"
            : "border-green-200 bg-green-50 text-black"}` })}>${state.message}</p>`) : null}
<form class="space-y-5" method="post"${attrs({ "action": action, "aria-describedby": messageId })}>
<input type="hidden" name="next"${attrs({ "value": next })}>
<div>
<label for="signup-display-name" class="block text-sm font-medium text-black">Public display name</label>
<input id="signup-display-name" name="displayName" type="text" autocomplete="name" class="mt-2 block w-full rounded-md border border-sage-300 bg-surface px-3 py-2 text-black shadow-sm outline-none transition focus:border-sage-950 focus:ring-2 focus:ring-sage-950/10"${attrs({ "minLength": 2, "maxLength": 50, "required": true, "aria-invalid": Boolean(state.fieldErrors?.displayName), "aria-describedby": state.fieldErrors?.displayName
            ? "signup-display-name-error"
            : "signup-display-name-help" })}>${state.fieldErrors?.displayName ? (html `
<p id="signup-display-name-error" class="mt-2 text-sm text-black">${state.fieldErrors.displayName}</p>`) : (html `
<p id="signup-display-name-help" class="mt-2 text-xs text-black">This is the name other people can search for on Finds.</p>`)}</div>
<div>
<label for="signup-email" class="block text-sm font-medium text-black">Email</label>
<input id="signup-email" name="email" type="email" autocomplete="email" class="mt-2 block w-full rounded-md border border-sage-300 bg-surface px-3 py-2 text-black shadow-sm outline-none transition focus:border-sage-950 focus:ring-2 focus:ring-sage-950/10"${attrs({ "required": true, "aria-invalid": Boolean(state.fieldErrors?.email), "aria-describedby": state.fieldErrors?.email ? "signup-email-error" : undefined })}>${state.fieldErrors?.email ? (html `
<p id="signup-email-error" class="mt-2 text-sm text-black">${state.fieldErrors.email}</p>`) : null}</div>
<div>
<label for="signup-password" class="block text-sm font-medium text-black">Password</label>
<input id="signup-password" name="password" type="password" autocomplete="new-password" class="mt-2 block w-full rounded-md border border-sage-300 bg-surface px-3 py-2 text-black shadow-sm outline-none transition focus:border-sage-950 focus:ring-2 focus:ring-sage-950/10"${attrs({ "minLength": 8, "required": true, "aria-invalid": Boolean(state.fieldErrors?.password), "aria-describedby": state.fieldErrors?.password
            ? "signup-password-error"
            : undefined })}>${state.fieldErrors?.password ? (html `
<p id="signup-password-error" class="mt-2 text-sm text-black">${state.fieldErrors.password}</p>`) : null}</div>
<div>
<label for="signup-confirm-password" class="block text-sm font-medium text-black">Confirm password</label>
<input id="signup-confirm-password" name="confirmPassword" type="password" autocomplete="new-password" class="mt-2 block w-full rounded-md border border-sage-300 bg-surface px-3 py-2 text-black shadow-sm outline-none transition focus:border-sage-950 focus:ring-2 focus:ring-sage-950/10"${attrs({ "minLength": 8, "required": true, "aria-invalid": Boolean(state.fieldErrors?.confirmPassword), "aria-describedby": state.fieldErrors?.confirmPassword
            ? "signup-confirm-password-error"
            : undefined })}>${state.fieldErrors?.confirmPassword ? (html `
<p id="signup-confirm-password-error" class="mt-2 text-sm text-black">${state.fieldErrors.confirmPassword}</p>`) : null}</div>
<button type="submit" class="w-full rounded-md bg-sage-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-sage-400"${attrs({ "disabled": isPending })}>${isPending ? "Creating account..." : "Create account"}</button></form>
<p class="mt-6 text-center text-sm text-black">Already have an account?${" "}<a class="font-semibold text-black underline"${attrs({ "href": `/login?next=${encodeURIComponent(next)}` })}>Log in</a></p></div>`);
}
