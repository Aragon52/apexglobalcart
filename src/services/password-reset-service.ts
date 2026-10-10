import { supabase } from "@/lib/supabase";

/** Sends the branded "Reset your password" email. `resetPath` is the address-bar path of the portal's reset page. */
export async function requestPasswordReset(email: string, resetPath: string): Promise<void> {
  const redirectTo = `${window.location.origin}${resetPath}`;
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
  if (error) throw new Error(error.message);
}

export async function setNewPassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (/weak|pwned|easy to guess/i.test(error.message)) {
      throw new Error("This password is too easy to guess. Please choose a stronger one with letters, numbers and symbols.");
    }
    throw new Error(error.message);
  }
}

/** Resolves true once the recovery link's session is ready (or false after a timeout). */
export function waitForRecoverySession(timeoutMs = 6000): Promise<boolean> {
  return new Promise((resolve) => {
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      sub.data.subscription.unsubscribe();
      clearTimeout(timer);
      resolve(ok);
    };
    const sub = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session) finish(true);
    });
    const timer = setTimeout(() => finish(false), timeoutMs);
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) finish(true);
    });
  });
}
