// ============================
// Zid Service: Validates activation codes via the secure server function.
// All validation logic is enforced server-side (SECURITY DEFINER RPC).
// No bypass codes are stored in client code.
// ============================
import { supabase } from "@/integrations/supabase/client";

interface CodeValidationResult {
  valid: boolean;
  message: string;
  code_type?: string;
  uses_remaining?: number;
}

const DEVELOPER_EMAIL = 'team.rahal3@gmail.com';

/**
 * Validate an activation code using the DB function (server-side enforced).
 * The RPC handles all code-type rules (DEBUG / HOST / PLAYER) and decrements
 * usage where applicable. The client never sees the code list.
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
 * Check if the current authenticated user is the developer (by email).
 * Developer status is also auto-set on the profiles row by a DB trigger.
 */
export async function isDeveloperEmail(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email?.toLowerCase() === DEVELOPER_EMAIL;
}

/**
 * Validate host access: developer email bypass OR a server-validated code.
 */
export async function validateHostAccess(code: string): Promise<CodeValidationResult> {
  if (await isDeveloperEmail()) {
    return { valid: true, message: 'وصول مطوّر', code_type: 'DEBUG' };
  }
  return validateActivationCode(code);
}
