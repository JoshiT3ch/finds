import { html, attrs, partial } from "../../server/html.js";
import { signOut } from "../app/auth/actions.js";
import { createClient } from "../../utils/supabase/server.js";
import CategoryNav from "./CategoryNav.js";
import HeaderSearch from "./HeaderSearch.js";
async function getHeaderAuthState() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.getClaims();
        return !error && Boolean(data?.claims);
    }
    catch {
        return false;
    }
}
export default async function Header() {
    const isSignedIn = await getHeaderAuthState();
    const listItemHref = isSignedIn ? "/sell" : "/login?next=/sell";
    return (html `
<header class="relative z-40 border-b border-sage-300 bg-surface">
<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
<div class="flex items-center justify-between gap-4">
<div class="flex-shrink-0"><a href="/" class="text-2xl font-bold text-black hover:text-black">Finds</a></div>
<div class="hidden min-w-[280px] max-w-2xl flex-1 md:block">${partial(() => HeaderSearch({}))}</div>
<nav class="hidden shrink-0 items-center gap-5 lg:flex" aria-label="Main navigation"><a href="/browse" class="text-sm font-medium text-black transition hover:text-black">Browse</a><a href="/sell" class="text-sm font-medium text-black transition hover:text-black">Sell</a><a href="/how-it-works" class="whitespace-nowrap text-sm font-medium text-black underline-offset-4 hover:underline">How it Works</a>${isSignedIn ? (html `<a href="/messages" class="text-sm font-medium text-black transition hover:text-black">Messages</a>`) : null}${isSignedIn ? (html `<a href="/account" class="text-sm font-medium text-black transition hover:text-black sm:hidden">Account</a>`) : (html `<a href="/login" class="text-sm font-medium text-black transition hover:text-black sm:hidden">Log in</a>`)}</nav>
<div class="flex items-center gap-2 sm:gap-4">${isSignedIn ? (html `<a href="/account" class="hidden text-sm font-medium text-black transition hover:text-black sm:block">Account</a>
<form class="hidden sm:block" method="post"${attrs({ "action": signOut })}>
<button type="submit" class="text-sm font-medium text-black transition hover:text-black">Sign out</button></form>
<form class="sm:hidden" method="post"${attrs({ "action": signOut })}>
<button type="submit" class="text-xs font-medium text-black transition hover:text-black">Sign out</button></form>`) : (html `<a href="/login" class="hidden text-sm font-medium text-black transition hover:text-black sm:block">Log in</a>`)}<a class="rounded-lg bg-sage-300 px-4 py-2 text-sm font-medium text-black transition hover:bg-sage-400"${attrs({ "href": listItemHref })}>List an Item</a></div></div>
<div class="mt-3 md:hidden">${partial(() => HeaderSearch({}))}</div>
<div class="mt-3 flex justify-end lg:hidden"><a href="/how-it-works" class="text-sm font-medium text-black underline-offset-4 hover:underline">How it Works</a></div></div>${partial(() => CategoryNav({}))}</header>`);
}
