import { redirect } from "next/navigation";
import {
  getSafeRedirectPath,
  getSearchParam,
} from "../../../../utils/auth/redirects";
import { createClient } from "../../../../utils/supabase/server";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

function getNotice(status: string | undefined) {
  if (status === "signed-out") {
    return "You have been signed out.";
  }

  if (status === "confirmation-error") {
    return "We could not confirm that link. Please try signing in.";
  }

  if (status === "password-updated") {
    return "Your password has been updated. Log in with your new password.";
  }

  return undefined;
}

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const next = getSafeRedirectPath(getSearchParam(searchParams.next));
  const notice = getNotice(getSearchParam(searchParams.status));
  let shouldRedirect = false;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (!error && data?.claims) {
      shouldRedirect = true;
    }
  } catch {
    // Keep the login form reachable so it can show a safe action-level error.
  }

  if (shouldRedirect) {
    redirect(next);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 text-gray-950 sm:px-6 lg:px-8">
      <LoginForm next={next} notice={notice} />
    </main>
  );
}
