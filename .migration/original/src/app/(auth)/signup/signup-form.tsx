"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup, type AuthFormState } from "../../auth/actions";

const initialState: AuthFormState = {
  status: "idle",
  message: "",
};

type SignupFormProps = {
  next: string;
};

export function SignupForm({ next }: SignupFormProps) {
  const [state, action, isPending] = useActionState(signup, initialState);
  const messageId = state.message ? "signup-message" : undefined;
  const isError = state.status === "error";

  return (
    <div className="w-full max-w-md rounded-lg border border-sage-200 bg-surface p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-black">
          Finds account
        </p>
        <h1 className="mt-2 text-3xl font-bold text-black">Sign up</h1>
      </div>

      {state.message ? (
        <p
          id={messageId}
          role={isError ? "alert" : "status"}
          className={`mb-5 rounded-md border px-4 py-3 text-sm ${
            isError
              ? "border-red-200 bg-red-50 text-black"
              : "border-green-200 bg-green-50 text-black"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <form action={action} aria-describedby={messageId} className="space-y-5">
        <input type="hidden" name="next" value={next} />

        <div>
          <label
            htmlFor="signup-display-name"
            className="block text-sm font-medium text-black"
          >
            Public display name
          </label>
          <input
            id="signup-display-name"
            name="displayName"
            type="text"
            autoComplete="name"
            minLength={2}
            maxLength={50}
            required
            aria-invalid={Boolean(state.fieldErrors?.displayName)}
            aria-describedby={
              state.fieldErrors?.displayName
                ? "signup-display-name-error"
                : "signup-display-name-help"
            }
            className="mt-2 block w-full rounded-md border border-sage-300 bg-surface px-3 py-2 text-black shadow-sm outline-none transition focus:border-sage-950 focus:ring-2 focus:ring-sage-950/10"
          />
          {state.fieldErrors?.displayName ? (
            <p
              id="signup-display-name-error"
              className="mt-2 text-sm text-black"
            >
              {state.fieldErrors.displayName}
            </p>
          ) : (
            <p id="signup-display-name-help" className="mt-2 text-xs text-black">
              This is the name other people can search for on Finds.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="block text-sm font-medium text-black"
          >
            Email
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(state.fieldErrors?.email)}
            aria-describedby={
              state.fieldErrors?.email ? "signup-email-error" : undefined
            }
            className="mt-2 block w-full rounded-md border border-sage-300 bg-surface px-3 py-2 text-black shadow-sm outline-none transition focus:border-sage-950 focus:ring-2 focus:ring-sage-950/10"
          />
          {state.fieldErrors?.email ? (
            <p id="signup-email-error" className="mt-2 text-sm text-black">
              {state.fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="signup-password"
            className="block text-sm font-medium text-black"
          >
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            aria-invalid={Boolean(state.fieldErrors?.password)}
            aria-describedby={
              state.fieldErrors?.password
                ? "signup-password-error"
                : undefined
            }
            className="mt-2 block w-full rounded-md border border-sage-300 bg-surface px-3 py-2 text-black shadow-sm outline-none transition focus:border-sage-950 focus:ring-2 focus:ring-sage-950/10"
          />
          {state.fieldErrors?.password ? (
            <p id="signup-password-error" className="mt-2 text-sm text-black">
              {state.fieldErrors.password}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="signup-confirm-password"
            className="block text-sm font-medium text-black"
          >
            Confirm password
          </label>
          <input
            id="signup-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
            aria-describedby={
              state.fieldErrors?.confirmPassword
                ? "signup-confirm-password-error"
                : undefined
            }
            className="mt-2 block w-full rounded-md border border-sage-300 bg-surface px-3 py-2 text-black shadow-sm outline-none transition focus:border-sage-950 focus:ring-2 focus:ring-sage-950/10"
          />
          {state.fieldErrors?.confirmPassword ? (
            <p
              id="signup-confirm-password-error"
              className="mt-2 text-sm text-black"
            >
              {state.fieldErrors.confirmPassword}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-sage-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-sage-400"
        >
          {isPending ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-black">
        Already have an account?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="font-semibold text-black underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
