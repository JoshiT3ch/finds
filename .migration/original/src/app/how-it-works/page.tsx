import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "How it Works - Finds",
  description:
    "Learn how to find pre-loved clothing, contact sellers, and list your own items on Finds.",
};

const guides = [
  {
    id: "buying",
    title: "Find your next favorite",
    label: "For buyers",
    steps: [
      {
        title: "Explore the finds",
        description:
          "Browse pre-loved clothing, filter by category, size, or condition, and sort by price. Open a listing to see its photos, details, and any flaws.",
      },
      {
        title: "Start a conversation",
        description:
          "Log in or create an account, then choose Message Seller on a listing. Ask about availability, measurements, or anything else you want to know.",
      },
      {
        title: "Agree on the details",
        description:
          "Arrange payment and pickup or delivery directly with the seller. Continue the conversation from Messages whenever you need to follow up.",
      },
    ],
    href: "/browse",
    action: "Browse Finds",
  },
  {
    id: "selling",
    title: "Give your clothes a new home",
    label: "For sellers",
    steps: [
      {
        title: "Create your listing",
        description:
          "Log in and choose List an Item. Add clear photos, a title, size, condition, price, and location. Describe the piece and mention any flaws.",
      },
      {
        title: "Publish and connect",
        description:
          "Choose List Item to publish your listing. Buyers can discover it in Browse and message you with questions. Find your conversations in Messages.",
      },
      {
        title: "Complete the sale",
        description:
          "Agree on payment and handover with your buyer. Once the item has sold, go to Account and choose Mark as Sold on your listing.",
      },
    ],
    href: "/sell",
    action: "List an Item",
  },
];

const questions = [
  {
    question: "Do I need an account?",
    answer:
      "You can browse listings without an account. Create an account or log in to message sellers, publish listings, and manage your items.",
  },
  {
    question: "How do payment and delivery work?",
    answer:
      "Buyers and sellers arrange payment, pickup, and delivery directly with each other. Finds does not currently offer an in-app checkout or delivery booking.",
  },
  {
    question: "Where can I manage my listings?",
    answer:
      "Open Account to see your listings. You can mark an item as sold, make it available again, or delete a listing you no longer need.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      <main className="font-sans">
        <section className="border-b border-sage-300 bg-sage-100 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em]">
              A new chapter for pre-loved clothes
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              How it Works
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8">
              Find something you love or pass a favorite along. Here is how to
              get started on Finds.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="#buying" className="rounded-full border border-sage-400 bg-white px-6 py-3 font-semibold transition hover:bg-sage-200">
                I want to buy
              </Link>
              <Link href="#selling" className="rounded-full bg-sage-300 px-6 py-3 font-semibold transition hover:bg-sage-400">
                I want to sell
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            {guides.map((guide) => (
              <section key={guide.id} id={guide.id} aria-labelledby={`${guide.id}-heading`} className="flex scroll-mt-6 flex-col rounded-2xl border border-sage-300 bg-sage-50 p-6 sm:p-8">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em]">{guide.label}</p>
                <h2 id={`${guide.id}-heading`} className="text-2xl font-bold tracking-tight sm:text-3xl">{guide.title}</h2>
                <ol className="my-8 space-y-8">
                  {guide.steps.map((step, index) => (
                    <li key={step.title} className="flex gap-4">
                      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-300 font-semibold">{index + 1}</span>
                      <div>
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                        <p className="mt-2 leading-7">{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <Link href={guide.href} className="mt-auto rounded-full bg-sage-300 px-6 py-3 text-center font-semibold transition hover:bg-sage-400">{guide.action}</Link>
              </section>
            ))}
          </div>

          <section aria-labelledby="questions-heading" className="mx-auto mt-16 max-w-3xl">
            <h2 id="questions-heading" className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">A few things to know</h2>
            <div className="divide-y divide-sage-300 border-y border-sage-300">
              {questions.map(({ question, answer }) => (
                <details key={question} className="group py-5">
                  <summary className="cursor-pointer text-lg font-semibold underline-offset-4 hover:underline">{question}</summary>
                  <p className="mt-3 leading-7">{answer}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
