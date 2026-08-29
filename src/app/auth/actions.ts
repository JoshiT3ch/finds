"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSafeRedirectPath } from "../../../utils/auth/redirects";
import { createClient } from "../../../utils/supabase/server";

const MIN_PASSWORD_LENGTH = 8;
const LOCAL_SITE_ORIGIN = "http://localhost:3000";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RESET_SENT_MESSAGE =
  "If an account exists for that email, a password-reset link has been sent.";

export type AuthFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: {
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
};

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function errorState(
  message: string,
  fieldErrors?: AuthFormState["fieldErrors"],
): AuthFormState {
  return {
    status: "error",
    message,
    fieldErrors,
  };
}

function validateEmailAndPassword(email: string, password: string) {
  const fieldErrors: AuthFormState["fieldErrors"] = {};

  if (!email) {
    fieldErrors.email = "Enter your email address.";
  } else if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (!password) {
    fieldErrors.password = "Enter your password.";
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    fieldErrors.password = "Password must be at least 8 characters.";
  }

  return fieldErrors;
}

function validateEmailOnly(email: string) {
  const fieldErrors: AuthFormState["fieldErrors"] = {};

  if (!email) {
    fieldErrors.email = "Enter your email address.";
  } else if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  return fieldErrors;
}

function validatePasswordUpdate(password: string, confirmPassword: string) {
  const fieldErrors: AuthFormState["fieldErrors"] = {};

  if (!password) {
    fieldErrors.password = "Enter a new password.";
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    fieldErrors.password = "Password must be at least 8 characters.";
  }

  if (!confirmPassword) {
    fieldErrors.confirmPassword = "Confirm your new password.";
  } else if (confirmPassword.length < MIN_PASSWORD_LENGTH) {
    fieldErrors.confirmPassword = "Password must be at least 8 characters.";
  } else if (password !== confirmPassword) {
    fieldErrors.confirmPassword = "Passwords do not match.";
  }

  return fieldErrors;
}

function hasFieldErrors(fieldErrors: AuthFormState["fieldErrors"]) {
  return Boolean(
    fieldErrors?.email ||
      fieldErrors?.password ||
      fieldErrors?.confirmPassword,
  );
}

function getValidOrigin(origin: string | null) {
  if (!origin) {
    return LOCAL_SITE_ORIGIN;
  }

  try {
    const parsed = new URL(origin);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return LOCAL_SITE_ORIGIN;
    }

    return parsed.origin;
  } catch {
    return LOCAL_SITE_ORIGIN;
  }
}

async function getRequestOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");

  if (origin) {
    return getValidOrigin(origin);
  }

  const host = headerStore.get("host");

  if (!host) {
    return LOCAL_SITE_ORIGIN;
  }

  const forwardedProto = headerStore.get("x-forwarded-proto");
  const protocol = forwardedProto === "https" ? "https" : "http";

  return getValidOrigin(`${protocol}://${host}`);
}

export async function signup(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = getFormValue(formData, "email").trim().toLowerCase();
  const password = getFormValue(formData, "password");
  const confirmPassword = getFormValue(formData, "confirmPassword");
  const next = getSafeRedirectPath(getFormValue(formData, "next"));
  const fieldErrors = validateEmailAndPassword(email, password);

  if (!confirmPassword) {
    fieldErrors.confirmPassword = "Confirm your password.";
  } else if (confirmPassword.length < MIN_PASSWORD_LENGTH) {
    fieldErrors.confirmPassword = "Password must be at least 8 characters.";
  } else if (password !== confirmPassword) {
    fieldErrors.confirmPassword = "Passwords do not match.";
  }

  if (hasFieldErrors(fieldErrors)) {
    return errorState("Check the highlighted fields.", fieldErrors);
  }

  let shouldRedirect = false;

  try {
    const origin = await getRequestOrigin();
    const redirectTo = new URL("/auth/confirm", origin);
    redirectTo.searchParams.set("next", next);

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo.toString(),
      },
    });

    if (error) {
      return errorState(
        "We could not create that account. Check your details and try again.",
      );
    }

    if (data.session) {
      shouldRedirect = true;
    } else {
      return {
        status: "success",
        message: "Check your email to confirm your account before signing in.",
      };
    }
  } catch {
    return errorState("Authentication is unavailable right now.");
  }

  if (shouldRedirect) {
    redirect(next);
  }

  return errorState("Authentication is unavailable right now.");
}

export async function login(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = getFormValue(formData, "email").trim().toLowerCase();
  const password = getFormValue(formData, "password");
  const next = getSafeRedirectPath(getFormValue(formData, "next"));
  const fieldErrors = validateEmailAndPassword(email, password);

  if (hasFieldErrors(fieldErrors)) {
    return errorState("Check the highlighted fields.", fieldErrors);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return errorState("Invalid email or password.");
    }
  } catch {
    return errorState("Authentication is unavailable right now.");
  }

  redirect(next);
}

export async function forgotPassword(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = getFormValue(formData, "email").trim().toLowerCase();
  const fieldErrors = validateEmailOnly(email);

  if (hasFieldErrors(fieldErrors)) {
    return errorState("Check the highlighted fields.", fieldErrors);
  }

  try {
    const origin = await getRequestOrigin();
    const redirectTo = new URL("/auth/confirm", origin);
    redirectTo.searchParams.set("next", "/update-password");

    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo.toString(),
    });
  } catch {
    // Keep the response neutral so password recovery cannot enumerate accounts.
  }

  return {
    status: "success",
    message: PASSWORD_RESET_SENT_MESSAGE,
  };
}

export async function updatePassword(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const password = getFormValue(formData, "password");
  const confirmPassword = getFormValue(formData, "confirmPassword");
  const fieldErrors = validatePasswordUpdate(password, confirmPassword);

  if (hasFieldErrors(fieldErrors)) {
    return errorState("Check the highlighted fields.", fieldErrors);
  }

  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return errorState(
        "This password reset link has expired. Request a new password-reset link.",
      );
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      return errorState(
        "We could not update your password. Request a new password-reset link and try again.",
      );
    }

    await supabase.auth.signOut({ scope: "local" });
  } catch {
    return errorState("Password update is unavailable right now.");
  }

  revalidatePath("/account");
  revalidatePath("/update-password");
  redirect("/login?status=password-updated");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  revalidatePath("/account");
  redirect("/login?status=signed-out");
}
