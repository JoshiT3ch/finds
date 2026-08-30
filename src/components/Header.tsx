import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { createClient } from "../../utils/supabase/server";

async function getHeaderAuthState() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    return !error && Boolean(data?.claims);
  } catch {
    return false;
  }
}

export default async function Header() {
  const isSignedIn = await getHeaderAuthState();
  const listItemHref = isSignedIn ? "/sell" : "/login?next=/sell";

  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-2xl font-bold text-gray-900 hover:text-gray-700"
            >
              Finds
            </Link>
          </div>

          <nav className="flex items-center gap-3 sm:gap-8" aria-label="Main navigation">
            <Link
              href="/browse"
              className="text-sm font-medium text-gray-700 transition hover:text-gray-900"
            >
              Browse
            </Link>
            <Link
              href="/sell"
              className="text-sm font-medium text-gray-700 transition hover:text-gray-900"
            >
              Sell
            </Link>
            {isSignedIn ? (
              <Link
                href="/account"
                className="text-sm font-medium text-gray-700 transition hover:text-gray-900 sm:hidden"
              >
                Account
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 transition hover:text-gray-900 sm:hidden"
              >
                Log in
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/browse"
              aria-label="Search listings"
              className="hidden text-gray-700 hover:text-gray-900 sm:block"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </Link>

            {isSignedIn ? (
              <>
                <Link
                  href="/account"
                  className="hidden text-sm font-medium text-gray-700 transition hover:text-gray-900 sm:block"
                >
                  Account
                </Link>
                <form action={signOut} className="hidden sm:block">
                  <button
                    type="submit"
                    className="text-sm font-medium text-gray-700 transition hover:text-gray-900"
                  >
                    Sign out
                  </button>
                </form>
                <form action={signOut} className="sm:hidden">
                  <button
                    type="submit"
                    className="text-xs font-medium text-gray-700 transition hover:text-gray-900"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="hidden text-sm font-medium text-gray-700 transition hover:text-gray-900 sm:block"
              >
                Log in
              </Link>
            )}

            <Link
              href={listItemHref}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              List an Item
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
