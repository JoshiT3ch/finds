import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "../../../utils/supabase/server";
import { SellForm } from "./sell-form";

export const dynamic = "force-dynamic";

export default async function SellPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login?next=/sell");
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Sell your find
          </h1>
          <p className="text-gray-600">
            Give a pre-loved piece a new home. Add the details below to prepare
            your Finds listing.
          </p>
        </div>

        <SellForm />
      </main>
      <Footer />
    </div>
  );
}
