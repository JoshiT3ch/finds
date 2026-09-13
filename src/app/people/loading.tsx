export default function PeopleLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      <div className="mt-3 h-9 w-64 animate-pulse rounded bg-gray-200" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-lg border border-gray-200 bg-white"
          />
        ))}
      </div>
    </main>
  );
}
