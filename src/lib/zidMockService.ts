// ============================
// Zid Service: Validates activation codes via Supabase DB function
// Debug codes and developer email bypass usage limits
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
 * Validate an activation code using the DB function (decrements uses)
 */
export async function validateActivationCode(code: string): Promise<CodeValidationResult> {
  const { data, error } = await supabase.rpc('consume_activation_code', {
    p_code: code.trim()
  });
  if (error) {
    return { valid: false, message: error.message };
  }
  return data as unknown as CodeValidationResult;
}

/**
 * Check if the current user's email is the developer email
 */
export async function isDeveloperEmail(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email?.toLowerCase() === DEVELOPER_EMAIL;
}

/**
 * Validate host access: checks activation code OR developer email
 */
export async function validateHostAccess(code: string): Promise<CodeValidationResult> {
  // First check if user is developer by email
  const isDev = await isDeveloperEmail();
  if (isDev) {
    return { valid: true, message: 'وصول مطوّر', code_type: 'DEBUG' };
  }

  // Then validate the code
  return validateActivationCode(code);
}

// Legacy exports for backward compatibility
export async function validateZidPurchase(email: string): Promise<{ valid: boolean; message: string; purchaseId?: string }> {
  if (email.toLowerCase().trim() === DEVELOPER_EMAIL) {
    return { valid: true, message: 'وصول مطوّر', purchaseId: 'DEV-ACCESS' };
  }
  return { valid: false, message: 'يرجى إدخال رمز التفعيل' };
}

export function validateDebugCode(code: string): boolean {
  // Kept for sync checks; real validation is via DB
  const UNLIMITED_CODES = ['RAHAAL2024', 'DEBUG-OWNER', 'KHALIYA-UNLIMITED'];
  return UNLIMITED_CODES.includes(code.toUpperCase().trim());
}
