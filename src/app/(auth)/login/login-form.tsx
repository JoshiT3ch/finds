"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type AuthFormState } from "../../auth/actions";

const initialState: AuthFormState = {
  status: "idle",
  message: "",
};

type LoginFormProps = {
  next: string;
  notice?: string;
};

export function LoginForm({ next, notice }: LoginFormProps) {
  const [state, action, isPending] = useActionState(login, initialState);
  const message = state.message || notice;
  const messageId = message ? "login-message" : undefined;
  const isError = state.status === "error";

  return (
    <div className="w-full max-w-md rounded-lg border border-sage-200 bg-surface p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-black">
          Finds account
        </p>
        <h1 className="mt-2 text-3xl font-bold text-black">Log in</h1>
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
        <input type="hidden" name="next" value={next} />

        <div>
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-black"
          >
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(state.fieldErrors?.email)}
            aria-describedby={
              state.fieldErrors?.email ? "login-email-error" : undefined
            }
            className="mt-2 block w-full rounded-md border border-sage-300 bg-surface px-3 py-2 text-black shadow-sm outline-none transition focus:border-sage-950 focus:ring-2 focus:ring-sage-950/10"
          />
          {state.fieldErrors?.email ? (
            <p id="login-email-error" className="mt-2 text-sm text-black">
              {state.fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div>
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-black"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-black underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            minLength={8}
            required
            aria-invalid={Boolean(state.fieldErrors?.password)}
            aria-describedby={
              state.fieldErrors?.password ? "login-password-error" : undefined
            }
            className="mt-2 block w-full rounded-md border border-sage-300 bg-surface px-3 py-2 text-black shadow-sm outline-none transition focus:border-sage-950 focus:ring-2 focus:ring-sage-950/10"
          />
          {state.fieldErrors?.password ? (
            <p id="login-password-error" className="mt-2 text-sm text-black">
              {state.fieldErrors.password}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-sage-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-sage-400"
        >
          {isPending ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-black">
        No account yet?{" "}
        <Link
          href={`/signup?next=${encodeURIComponent(next)}`}
          className="font-semibold text-black underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
