// ============================
// Zid Service: Validates activation codes via the secure server function.
// All validation logic is enforced server-side (SECURITY DEFINER RPC).
// No bypass codes or privileged emails are stored in client code.
// ============================
import { supabase } from "@/integrations/supabase/client";

interface CodeValidationResult {
  valid: boolean;
  message: string;
  code_type?: string;
  uses_remaining?: number;
}

/**
 * Validate an activation code using the DB function (server-side enforced).
 */
export async function validateActivationCode(code: string): Promise<CodeValidationResult> {
  const { data, error } = await supabase.rpc('consume_activation_code', {
    p_code: code.trim(),
  });
  if (error) {
    return { valid: false, message: error.message };
  }
  return data as unknown as CodeValidationResult;
}

/**
 * Check if the current user is a developer based on their server-side
 * profile flag. The flag is set by the handle_new_user trigger; the client
 * never knows the privileged email address.
 */
export async function isDeveloperUser(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await (supabase as any)
    .from('profiles')
    .select('is_developer')
    .eq('user_id', user.id)
    .maybeSingle();
  return Boolean(data?.is_developer);
}

/**
 * Validate host access: developer flag bypass OR a server-validated code.
 */
export async function validateHostAccess(code: string): Promise<CodeValidationResult> {
  if (await isDeveloperUser()) {
    return { valid: true, message: 'وصول مطوّر', code_type: 'DEBUG' };
  }
  return validateActivationCode(code);
}
