"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPassword, type AuthFormState } from "../../auth/actions";

const initialState: AuthFormState = {
  status: "idle",
  message: "",
};

type ForgotPasswordFormProps = {
  notice?: string;
  noticeIsError?: boolean;
};

export function ForgotPasswordForm({
  notice,
  noticeIsError = false,
}: ForgotPasswordFormProps) {
  const [state, action, isPending] = useActionState(
    forgotPassword,
    initialState,
  );
  const message = state.message || notice;
  const messageId = message ? "forgot-password-message" : undefined;
  const isError = state.status === "error" || (!state.message && noticeIsError);

  return (
    <div className="w-full max-w-md rounded-lg border border-sage-200 bg-surface p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-black">
          Finds account
        </p>
        <h1 className="mt-2 text-3xl font-bold text-black">
          Reset password
        </h1>
      </div>

      {message ? (
        <p
          id={messageId}
          role={isError ? "alert" : "status"}
          className={`mb-5 rounded-md border px-4 py-3 text-sm ${
            isError
              ? "border-red-200 bg-red-50 text-black"
              : "border-green-200 bg-green-50 text-black"
          }`}
        >
          {message}
        </p>
      ) : null}

      <form action={action} aria-describedby={messageId} className="space-y-5">
        <div>
          <label
            htmlFor="forgot-password-email"
            className="block text-sm font-medium text-black"
          >
            Email
          </label>
          <input
            id="forgot-password-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(state.fieldErrors?.email)}
            aria-describedby={
              state.fieldErrors?.email
                ? "forgot-password-email-error"
                : undefined
            }
            className="mt-2 block w-full rounded-md border border-sage-300 bg-surface px-3 py-2 text-black shadow-sm outline-none transition focus:border-sage-950 focus:ring-2 focus:ring-sage-950/10"
          />
          {state.fieldErrors?.email ? (
            <p
              id="forgot-password-email-error"
              className="mt-2 text-sm text-black"
            >
              {state.fieldErrors.email}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-sage-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-sage-400"
        >
          {isPending ? "Sending reset link..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-black">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-black underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
