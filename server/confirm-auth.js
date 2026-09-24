import { createClient } from '../utils/supabase/server.js';
import { getSafeRedirectPath } from '../utils/auth/redirects.js';
import { redirect } from './request.js';

export async function confirmAuth(url) {
  const type = url.searchParams.get('type');
  const next = getSafeRedirectPath(url.searchParams.get('next'), type === 'recovery' ? '/update-password' : '/account');
  const recovery = type === 'recovery' || next === '/update-password';
  let confirmed = false;
  try {
    const supabase = await createClient();
    const token = url.searchParams.get('token_hash');
    const code = url.searchParams.get('code');
    if (token && ['email', 'signup', 'recovery'].includes(type)) {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: token });
      confirmed = !error;
    }
    if (!confirmed && code) {
      const flowId = url.searchParams.get('sb_flow_id');
      const { error } = await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
      confirmed = !error;
    }
  } catch { /* Render the existing neutral confirmation error. */ }
  redirect(confirmed ? next : recovery ? '/forgot-password?status=recovery-error' : '/login?status=confirmation-error');
}
