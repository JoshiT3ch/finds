"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updatePassword, type AuthFormState } from "../../auth/actions";

const initialState: AuthFormState = {
  status: "idle",
  message: "",
};

export function UpdatePasswordForm() {
  const [state, action, isPending] = useActionState(
    updatePassword,
    initialState,
  );
  const messageId = state.message ? "update-password-message" : undefined;
  const isError = state.status === "error";

  return (
    <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Finds account
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-950">
          Choose a new password
        </h1>
      </div>

      {state.message ? (
        <p
          id={messageId}
          role={isError ? "alert" : "status"}
          className={`mb-5 rounded-md border px-4 py-3 text-sm ${
            isError
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-green-200 bg-green-50 text-green-800"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <form action={action} aria-describedby={messageId} className="space-y-5">
        <div>
          <label
            htmlFor="update-password-password"
            className="block text-sm font-medium text-gray-800"
          >
            New password
          </label>
          <input
            id="update-password-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            aria-invalid={Boolean(state.fieldErrors?.password)}
            aria-describedby={
              state.fieldErrors?.password
                ? "update-password-password-error"
                : undefined
            }
            className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-950 shadow-sm outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
          />
          {state.fieldErrors?.password ? (
            <p
              id="update-password-password-error"
              className="mt-2 text-sm text-red-700"
            >
              {state.fieldErrors.password}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="update-password-confirm-password"
            className="block text-sm font-medium text-gray-800"
          >
            Confirm new password
          </label>
          <input
            id="update-password-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
            aria-describedby={
              state.fieldErrors?.confirmPassword
                ? "update-password-confirm-password-error"
                : undefined
            }
            className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-950 shadow-sm outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
          />
          {state.fieldErrors?.confirmPassword ? (
            <p
              id="update-password-confirm-password-error"
              className="mt-2 text-sm text-red-700"
            >
              {state.fieldErrors.confirmPassword}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isPending ? "Updating password..." : "Update password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Need a new link?{" "}
        <Link
          href="/forgot-password"
          className="font-semibold text-gray-950 underline"
        >
          Request another reset email
        </Link>
      </p>
    </div>
  );
}
