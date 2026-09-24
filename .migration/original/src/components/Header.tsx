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
    <header className="relative z-40 border-b border-sage-300 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-2xl font-bold text-black hover:text-black"
            >
              Finds
            </Link>
          </div>

          <div className="hidden min-w-[280px] max-w-2xl flex-1 md:block">
            <HeaderSearch />
          </div>

          <nav
            className="hidden shrink-0 items-center gap-5 lg:flex"
            aria-label="Main navigation"
          >
            <Link
              href="/browse"
              className="text-sm font-medium text-black transition hover:text-black"
            >
              Browse
            </Link>
            <Link
              href="/sell"
              className="text-sm font-medium text-black transition hover:text-black"
            >
              Sell
            </Link>
            <Link
              href="/how-it-works"
              className="whitespace-nowrap text-sm font-medium text-black underline-offset-4 hover:underline"
            >
              How it Works
            </Link>
            {isSignedIn ? (
              <Link
                href="/messages"
                className="text-sm font-medium text-black transition hover:text-black"
              >
                Messages
              </Link>
            ) : null}
            {isSignedIn ? (
              <Link
                href="/account"
                className="text-sm font-medium text-black transition hover:text-black sm:hidden"
              >
                Account
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-black transition hover:text-black sm:hidden"
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
                  className="hidden text-sm font-medium text-black transition hover:text-black sm:block"
                >
                  Account
                </Link>
                <form action={signOut} className="hidden sm:block">
                  <button
                    type="submit"
                    className="text-sm font-medium text-black transition hover:text-black"
                  >
                    Sign out
                  </button>
                </form>
                <form action={signOut} className="sm:hidden">
                  <button
                    type="submit"
                    className="text-xs font-medium text-black transition hover:text-black"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="hidden text-sm font-medium text-black transition hover:text-black sm:block"
              >
                Log in
              </Link>
            )}

            <Link
              href={listItemHref}
              className="rounded-lg bg-sage-300 px-4 py-2 text-sm font-medium text-black transition hover:bg-sage-400"
            >
              List an Item
            </Link>
          </div>
        </div>
        <div className="mt-3 md:hidden">
          <HeaderSearch />
        </div>
        <div className="mt-3 flex justify-end lg:hidden">
          <Link
            href="/how-it-works"
            className="text-sm font-medium text-black underline-offset-4 hover:underline"
          >
            How it Works
          </Link>
        </div>
      </div>
      <CategoryNav />
    </header>
  );
}
