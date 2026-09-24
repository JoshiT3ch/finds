export default function HeroSection() {
    return (html `
<section class="border-b border-sage-300/60 bg-linear-to-br from-sage-200 via-sage-100 to-sage-300/60 py-16 md:py-24">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
<h2 class="mx-auto mb-4 max-w-3xl text-4xl font-bold tracking-tight text-black md:text-5xl">Good clothes deserve another find.</h2>
<p class="text-lg text-black mb-8 max-w-2xl mx-auto">Discover pre-loved, thrifted, vintage, and second-hand clothing. Give your favorites a new home.</p>
<div class="flex flex-col sm:flex-row gap-4 justify-center"><a href="/browse" class="inline-block rounded-full bg-sage-300 px-8 py-3 font-semibold text-black shadow-sm transition hover:bg-sage-400">Browse Finds</a><a href="/sell" class="inline-block rounded-full border-2 border-sage-900 bg-surface/50 px-8 py-3 font-semibold text-black transition hover:bg-surface">Sell Something</a></div></div></section>`);
}
