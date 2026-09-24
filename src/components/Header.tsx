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
    <header className="relative z-40 border-b border-[#E5E5E5] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">

          {/* Logo */}
          <div className="flex shrink-0">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-[#111111] transition-colors hover:text-[#555555]"
            >
              Finds
            </Link>
          </div>

          {/* Search */}
          <div className="hidden min-w-[280px] max-w-2xl flex-1 md:block">
            <HeaderSearch />
          </div>

          {/* Navigation */}
          <nav
            className="hidden shrink-0 items-center gap-5 lg:flex"
            aria-label="Main navigation"
          >
            <Link
              href="/browse"
              className="text-sm font-medium text-[#222222] transition-colors hover:text-[#666666]"
            >
              Browse
            </Link>

            <Link
              href="/sell"
              className="text-sm font-medium text-[#222222] transition-colors hover:text-[#666666]"
            >
              Sell
            </Link>

            <Link
              href="/how-it-works"
              className="whitespace-nowrap text-sm font-medium text-[#222222] transition-colors hover:text-[#666666]"
            >
              How It Works
            </Link>

            {isSignedIn ? (
              <Link
                href="/messages"
                className="text-sm font-medium text-[#222222] transition-colors hover:text-[#666666]"
              >
                Messages
              </Link>
            ) : null}

            {isSignedIn ? (
              <Link
                href="/account"
                className="text-sm font-medium text-[#222222] transition-colors hover:text-[#666666]"
              >
                Account
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-[#222222] transition-colors hover:text-[#666666]"
              >
                Log in
              </Link>
            )}
          </nav>

          {/* Account Actions */}
          <div className="ml-auto flex shrink-0 items-center gap-3">
            {isSignedIn ? (
              <>
                <Link
                  href="/account"
                  className="hidden text-sm font-medium text-[#222222] transition-colors hover:text-[#666666] sm:block lg:hidden"
                >
                  Account
                </Link>

                <form action={signOut} className="hidden sm:block">
                  <button
                    type="submit"
                    className="text-sm font-medium text-[#222222] transition-colors hover:text-[#666666]"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="hidden text-sm font-medium text-[#222222] transition-colors hover:text-[#666666] sm:block lg:hidden"
              >
                Log in
              </Link>
            )}

            {/* List an Item */}
            <Link
              href={listItemHref}
              className="rounded-lg bg-[#111111] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#333333]"
            >
              List an Item
            </Link>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mt-3 md:hidden">
          <HeaderSearch />
        </div>

        {/* Mobile How It Works */}
        <div className="mt-3 flex justify-end lg:hidden">
          <Link
            href="/how-it-works"
            className="text-sm font-medium text-[#222222] underline decoration-[#999999] underline-offset-4 transition-colors hover:text-[#666666]"
          >
            How It Works
          </Link>
        </div>
      </div>

      <CategoryNav />
    </header>
  );
}