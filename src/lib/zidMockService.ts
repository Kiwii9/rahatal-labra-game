// ============================
// Zid Mock Service: Validates game purchase & debug bypass
// ============================

interface ZidValidationResult {
  valid: boolean;
  message: string;
  purchaseId?: string;
}

// Mock database of valid purchases linked to emails
const MOCK_PURCHASES: Record<string, { purchaseId: string; product: string }> = {
  'team.rahal3@gmail.com': { purchaseId: 'ZID-UNLIMITED-001', product: 'خلية الحروف - نسخة غير محدودة' },
  'host@rahaal.com': { purchaseId: 'ZID-2024-0042', product: 'خلية الحروف - رخصة سنوية' },
};

// Debug bypass codes for owner testing
const UNLIMITED_CODES = ['RAHAAL2024', 'DEBUG-OWNER', 'KHALIYA-UNLIMITED'];

/**
 * Validate a Zid store purchase by email
 */
export async function validateZidPurchase(email: string): Promise<ZidValidationResult> {
  // Simulate API latency
  await new Promise(r => setTimeout(r, 800));

  const purchase = MOCK_PURCHASES[email.toLowerCase().trim()];
  if (purchase) {
    return { valid: true, message: `رخصة فعّالة: ${purchase.product}`, purchaseId: purchase.purchaseId };
  }
  return { valid: false, message: 'لا توجد رخصة مرتبطة بهذا الحساب. يرجى شراء اللعبة من متجر Zid.' };
}

/**
 * Validate a debug/unlimited use code
 */
export function validateDebugCode(code: string): boolean {
  return UNLIMITED_CODES.includes(code.toUpperCase().trim());
}
