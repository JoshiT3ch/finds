import { html, attrs, partial } from "../../../../server/html.js";
const initialState = {
    status: "idle",
    message: "",
};
export function UpdatePasswordForm() {
    const state = initialState;
    const action = "/actions/updatePassword";
    const isPending = false;
    const messageId = state.message ? "update-password-message" : undefined;
    const isError = state.status === "error";
    return (html `
<div class="w-full max-w-md rounded-lg border border-sage-200 bg-surface p-6 shadow-sm">
<div class="mb-6">
<p class="text-sm font-semibold uppercase tracking-wide text-black">Finds account</p>
<h1 class="mt-2 text-3xl font-bold text-black">Choose a new password</h1></div>${state.message ? (html `
<p${attrs({ "id": messageId, "role": isError ? "alert" : "status", "className": `mb-5 rounded-md border px-4 py-3 text-sm ${isError
            ? "border-red-200 bg-red-50 text-black"
            : "border-green-200 bg-green-50 text-black"}` })}>${state.message}</p>`) : null}
<form class="space-y-5" method="post"${attrs({ "action": action, "aria-describedby": messageId })}>
<div>
<label for="update-password-password" class="block text-sm font-medium text-black">New password</label>
<input id="update-password-password" name="password" type="password" autocomplete="new-password" class="mt-2 block w-full rounded-md border border-sage-300 bg-surface px-3 py-2 text-black shadow-sm outline-none transition focus:border-sage-950 focus:ring-2 focus:ring-sage-950/10"${attrs({ "minLength": 8, "required": true, "aria-invalid": Boolean(state.fieldErrors?.password), "aria-describedby": state.fieldErrors?.password
            ? "update-password-password-error"
            : undefined })}>${state.fieldErrors?.password ? (html `
<p id="update-password-password-error" class="mt-2 text-sm text-black">${state.fieldErrors.password}</p>`) : null}</div>
<div>
<label for="update-password-confirm-password" class="block text-sm font-medium text-black">Confirm new password</label>
<input id="update-password-confirm-password" name="confirmPassword" type="password" autocomplete="new-password" class="mt-2 block w-full rounded-md border border-sage-300 bg-surface px-3 py-2 text-black shadow-sm outline-none transition focus:border-sage-950 focus:ring-2 focus:ring-sage-950/10"${attrs({ "minLength": 8, "required": true, "aria-invalid": Boolean(state.fieldErrors?.confirmPassword), "aria-describedby": state.fieldErrors?.confirmPassword
            ? "update-password-confirm-password-error"
            : undefined })}>${state.fieldErrors?.confirmPassword ? (html `
<p id="update-password-confirm-password-error" class="mt-2 text-sm text-black">${state.fieldErrors.confirmPassword}</p>`) : null}</div>
<button type="submit" class="w-full rounded-md bg-sage-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-sage-400"${attrs({ "disabled": isPending })}>${isPending ? "Updating password..." : "Update password"}</button></form>
<p class="mt-6 text-center text-sm text-black">Need a new link?${" "}<a href="/forgot-password" class="font-semibold text-black underline">Request another reset email</a></p></div>`);
}
