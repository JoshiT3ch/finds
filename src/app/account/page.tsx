import { redirect } from "next/navigation";
import { signOut } from "../auth/actions";
import { createClient } from "../../../utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login?next=/account");
  }

  const email =
    typeof data.claims.email === "string" ? data.claims.email : undefined;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 text-gray-950 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Account
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-950">
            You are signed in
          </h1>

          {email ? (
            <dl className="mt-6 border-t border-gray-200 pt-5">
              <dt className="text-sm font-medium text-gray-600">Email</dt>
              <dd className="mt-1 break-words text-base font-semibold text-gray-950">
                {email}
              </dd>
            </dl>
          ) : null}

          <form action={signOut} className="mt-8">
            <button
              type="submit"
              className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
            >
              Sign out
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
