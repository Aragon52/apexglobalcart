import { lovable } from "@/integrations/lovable";
import { supabase as cloudClient } from "@/integrations/supabase/client";
import { supabase } from "@/lib/supabase";

export interface GoogleSignInResult {
  error?: string;
  redirected?: boolean;
}

/**
 * Starts Google sign-in and returns to `returnPath` (must be a public page).
 * The app uses its own backend client, so the session obtained through the
 * sign-in helper is copied over to it when the flow completes in place.
 */
export async function signInWithGoogle(returnPath: string): Promise<GoogleSignInResult> {
  const result = await lovable.auth.signInWithOAuth("google", {
    redirect_uri: `${window.location.origin}${returnPath}`,
    extraParams: { prompt: "select_account" },
  });
  if (result.error) {
    const message = result.error instanceof Error ? result.error.message : String(result.error);
    return { error: message || "Google sign-in failed. Please try again." };
  }
  if (result.redirected) return { redirected: true };

  const { data } = await cloudClient.auth.getSession();
  if (data.session) {
    const { error } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
    if (error) return { error: error.message };
  }
  return {};
}
