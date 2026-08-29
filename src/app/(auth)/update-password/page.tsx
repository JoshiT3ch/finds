import { redirect } from "next/navigation";
import { createClient } from "../../../../utils/supabase/server";
import { UpdatePasswordForm } from "./update-password-form";

export const dynamic = "force-dynamic";

export default async function UpdatePasswordPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/forgot-password");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 text-gray-950 sm:px-6 lg:px-8">
      <UpdatePasswordForm />
    </main>
  );
}
