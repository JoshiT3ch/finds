import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { getSafeRedirectPath } from "../../../../utils/auth/redirects";
import { createClient } from "../../../../utils/supabase/server";

type AuthEmailOtpType = Extract<EmailOtpType, "email" | "signup" | "recovery">;

function getAuthEmailOtpType(
  type: string | null,
): AuthEmailOtpType | null {
  if (type === "email" || type === "signup" || type === "recovery") {
    return type;
  }

  return null;
}

function getDefaultRedirectPath(emailType: AuthEmailOtpType | null) {
  return emailType === "recovery" ? "/update-password" : "/account";
}

function redirectToAuthError(request: NextRequest, isRecoveryFlow: boolean) {
  const redirectUrl = new URL(
    isRecoveryFlow ? "/forgot-password" : "/login",
    request.nextUrl.origin,
  );
  redirectUrl.searchParams.set(
    "status",
    isRecoveryFlow ? "recovery-error" : "confirmation-error",
  );
  return NextResponse.redirect(redirectUrl);
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const emailType = getAuthEmailOtpType(
    request.nextUrl.searchParams.get("type"),
  );
  const code = request.nextUrl.searchParams.get("code");
  const flowId = request.nextUrl.searchParams.get("sb_flow_id");
  const next = getSafeRedirectPath(
    request.nextUrl.searchParams.get("next"),
    getDefaultRedirectPath(emailType),
  );
  const isRecoveryFlow = emailType === "recovery" || next === "/update-password";
  const redirectUrl = new URL(next, request.nextUrl.origin);

  try {
    const supabase = await createClient();

    if (tokenHash && emailType) {
      const { error } = await supabase.auth.verifyOtp({
        type: emailType,
        token_hash: tokenHash,
      });

      if (!error) {
        return NextResponse.redirect(redirectUrl);
      }
    }

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(
        code,
        flowId ? { flowId } : undefined,
      );

      if (!error) {
        return NextResponse.redirect(redirectUrl);
      }
    }
  } catch {
    return redirectToAuthError(request, isRecoveryFlow);
  }

  return redirectToAuthError(request, isRecoveryFlow);
}
