"use server";

import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export type RequestMagicLinkResult =
  | { success: true }
  | { success: false; error: { code: "invite_only" } }
  | { success: false; error: { code: "auth_error"; message: string } };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * When signups are disabled: checks if the email belongs to an existing user
 * via the admin API. If not, returns invite_only without sending any email.
 * When signups are enabled: sends magic link as usual.
 */
export async function requestMagicLink(
  email: string,
  origin: string
): Promise<RequestMagicLinkResult> {
  const emailNormalized = normalizeEmail(email);
  if (!emailNormalized) {
    return { success: false, error: { code: "auth_error", message: "Email is required." } };
  }

  const signupsDisabled = process.env.ENABLE_SIGNUPS !== "true";

  if (signupsDisabled) {
    const admin = createAdminClient();
    const { data: listData, error: listError } = await admin.auth.admin.listUsers({
      perPage: 1000,
      page: 1,
    });

    if (listError) {
      return {
        success: false,
        error: { code: "auth_error", message: listError.message },
      };
    }

    const existingUser = listData.users.find(
      (u) => u.email?.toLowerCase() === emailNormalized
    );
    if (!existingUser) {
      return { success: false, error: { code: "invite_only" } };
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return {
      success: false,
      error: { code: "auth_error", message: "Server configuration error." },
    };
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.auth.signInWithOtp({
    email: emailNormalized,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      shouldCreateUser: signupsDisabled ? false : undefined,
    },
  });

  if (error) {
    return {
      success: false,
      error: { code: "auth_error", message: error.message },
    };
  }

  return { success: true };
}
