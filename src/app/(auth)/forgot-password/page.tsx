import { getSearchParam } from "../../../../utils/auth/redirects";
import { ForgotPasswordForm } from "./forgot-password-form";

export const dynamic = "force-dynamic";

function getNotice(status: string | undefined) {
  if (status === "recovery-error") {
    return "We could not confirm that reset link. Request a new password-reset email.";
  }

  return undefined;
}

export default async function ForgotPasswordPage(
  props: PageProps<"/forgot-password">,
) {
  const searchParams = await props.searchParams;
  const status = getSearchParam(searchParams.status);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 text-gray-950 sm:px-6 lg:px-8">
      <ForgotPasswordForm
        notice={getNotice(status)}
        noticeIsError={status === "recovery-error"}
      />
    </main>
  );
}
