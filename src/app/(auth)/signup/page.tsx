import {
  getSafeRedirectPath,
  getSearchParam,
} from "../../../../utils/auth/redirects";
import { SignupForm } from "./signup-form";

export const dynamic = "force-dynamic";

export default async function SignupPage(props: PageProps<"/signup">) {
  const searchParams = await props.searchParams;
  const next = getSafeRedirectPath(getSearchParam(searchParams.next));

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 text-gray-950 sm:px-6 lg:px-8">
      <SignupForm next={next} />
    </main>
  );
}
