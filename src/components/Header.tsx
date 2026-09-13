import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { createClient } from "../../utils/supabase/server";
import CategoryNav from "./CategoryNav";
import HeaderSearch from "./HeaderSearch";

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
    <header className="relative z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-2xl font-bold text-gray-900 hover:text-gray-700"
            >
              Finds
            </Link>
          </div>

          <div className="hidden min-w-[280px] max-w-2xl flex-1 md:block">
            <HeaderSearch />
          </div>

          <nav
            className="hidden items-center gap-5 lg:flex"
            aria-label="Main navigation"
          >
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
                href="/messages"
                className="text-sm font-medium text-gray-700 transition hover:text-gray-900"
              >
                Messages
              </Link>
            ) : null}
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
        <div className="mt-3 md:hidden">
          <HeaderSearch />
        </div>
      </div>
      <CategoryNav />
    </header>
  );
}
