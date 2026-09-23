export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white py-16 text-[#173F30] font-['Century_Gothic']">
      {/* Hero Section */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#173F30]/70">
            ABOUT FINDS
          </p>

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Fashion worth finding.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#173F30]/70 sm:text-lg">
            Finds is a simple web-based marketplace for second-hand and
            thrifted clothes, making it easier to buy, sell, and discover
            affordable fashion online.
          </p>
        </div>
      </section>

      {/* What is Finds */}
      <section className="bg-[#173F30] py-20 text-white">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/60">
              WHAT IS FINDS?
            </p>

            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              A marketplace for better finds.
            </h2>
          </div>

          <div className="space-y-5 text-sm leading-7 text-white/80 sm:text-base">
            <p>
              Finds brings second-hand and thrifted clothing into one simple
              and organized online marketplace.
            </p>

            <p>
              Whether you&apos;re looking for an affordable outfit, selling clothes
              you no longer use, or discovering your next thrift find, Finds
              helps connect buyers and sellers in one place.
            </p>
          </div>
        </div>
      </section>

      {/* What You Can Do */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#173F30]/60">
              EXPLORE FINDS
            </p>

            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              What can you do?
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* Discover */}
            <div className="rounded-2xl border border-[#173F30]/10 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#173F30] text-xl text-white">
                01
              </div>

              <h3 className="mt-6 text-xl font-extrabold">
                Discover
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#173F30]/65">
                Browse second-hand and thrifted clothing to find affordable
                pieces that fit your style.
              </p>
            </div>

            {/* Sell */}
            <div className="rounded-2xl border border-[#173F30]/10 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#173F30] text-xl text-white">
                02
              </div>

              <h3 className="mt-6 text-xl font-extrabold">
                Sell
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#173F30]/65">
                Post your pre-loved clothing and give your items a chance to
                find a new owner.
              </p>
            </div>

            {/* Connect */}
            <div className="rounded-2xl border border-[#173F30]/10 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#173F30] text-xl text-white">
                03
              </div>

              <h3 className="mt-6 text-xl font-extrabold">
                Connect
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#173F30]/65">
                Connect with potential buyers and sellers and make second-hand
                shopping more accessible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Thrift */}
      <section className="border-t border-[#173F30]/10 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#173F30]/60">
                WHY FINDS?
              </p>

              <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
                Making thrifting easier and more accessible.
              </h2>
            </div>

            <div className="space-y-4 text-sm leading-7 text-[#173F30]/70 sm:text-base">
              <p>
                Thrifting gives clothing another life while giving shoppers
                access to more affordable fashion.
              </p>

              <p>
                Finds is designed for students, young professionals,
                budget-conscious shoppers, thrift sellers, small clothing
                resellers, and anyone interested in practicing more
                sustainable fashion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="pb-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl bg-[#173F30] px-8 py-16 text-center text-white sm:px-16">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/60">
              OUR GOAL
            </p>

            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Keep good clothes in circulation.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
              We want to make buying and selling pre-loved clothing simple,
              organized, and accessible—helping people discover affordable
              fashion while giving clothes another chance to be worn and
              enjoyed.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
