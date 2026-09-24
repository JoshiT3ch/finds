export default function Footer() {
    return (html `
<footer class="bg-sage-900 px-4 py-10 font-sans text-black sm:px-6 sm:py-12 lg:px-8">
<div class="mx-auto max-w-7xl rounded-2xl bg-sage-200 px-6 py-8 sm:p-10 lg:p-12">
<div class="mb-10 grid grid-cols-2 gap-x-6 gap-y-10 text-lg leading-8 md:grid-cols-4 md:gap-10">
<div>
<h3 class="mb-5 text-3xl font-bold tracking-tight sm:text-4xl">Finds</h3></div>
<div><h4 class="mb-5 text-xl font-semibold tracking-tight">Browse</h4>
<ul class="space-y-3">
<li><a href="/browse" class="text-black underline-offset-4 hover:underline">All Items</a></li>
<li><a href="/browse" class="text-black underline-offset-4 hover:underline">Categories</a></li></ul></div>
<div><h4 class="mb-5 text-xl font-semibold tracking-tight">Sell</h4>
<ul class="space-y-3">
<li><a href="/sell" class="text-black underline-offset-4 hover:underline">List an Item</a></li>
<li><a href="/how-it-works" class="text-black underline-offset-4 hover:underline">How it Works</a></li></ul></div>
<div><h4 class="mb-5 text-xl font-semibold tracking-tight">About</h4>
<ul class="space-y-3">
<li><a href="/about" class="text-black underline-offset-4 hover:underline">About Finds</a></li>
<li><span class="text-black" aria-label="Contact is coming soon">Contact</span></li></ul></div></div>
<div class="border-t border-sage-500/40"></div>
<div class="pt-6 text-base leading-7 text-black">
<p>&copy; 2026 Finds. All rights reserved.</p></div></div></footer>`);
}
