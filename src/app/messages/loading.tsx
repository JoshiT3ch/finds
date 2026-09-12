import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function MessagesLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main
        aria-busy="true"
        aria-label="Loading messages"
        className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8"
      >
        <div className="mb-8 animate-pulse">
          <div className="h-4 w-48 rounded bg-gray-200" />
          <div className="mt-3 h-9 w-40 rounded bg-gray-200" />
          <div className="mt-3 h-5 w-80 max-w-full rounded bg-gray-100" />
        </div>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="animate-pulse border-b border-gray-200 p-6 last:border-b-0"
            >
              <div className="h-5 w-2/3 rounded bg-gray-200" />
              <div className="mt-3 h-4 w-32 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
