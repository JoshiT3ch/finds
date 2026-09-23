import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function BrowseLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main
        aria-busy="true"
        aria-label="Loading listings"
        className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="mb-8 animate-pulse">
          <div className="h-9 w-48 rounded bg-sage-200" />
          <div className="mt-3 h-5 w-full max-w-xl rounded bg-sage-100" />
        </div>

        <div className="mb-8 h-36 animate-pulse rounded-lg border border-sage-200 bg-sage-50" />

        <div className="mb-6 h-5 w-28 animate-pulse rounded bg-sage-100" />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="h-[430px] animate-pulse rounded-lg border border-sage-200 bg-sage-50"
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
