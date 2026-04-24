
-- 1. Drop overly-permissive policies on activation_codes
DROP POLICY IF EXISTS "Anyone can read codes" ON public.activation_codes;
DROP POLICY IF EXISTS "Auth can insert codes" ON public.activation_codes;
DROP POLICY IF EXISTS "Auth can update codes" ON public.activation_codes;

-- No SELECT/INSERT/UPDATE/DELETE policies remain — table is only accessible via:
--   * SECURITY DEFINER function consume_activation_code (validation)
--   * service_role key in zid-webhook edge function (creation)

-- 2. Remove legacy hardcoded debug bypass codes
DELETE FROM public.activation_codes
WHERE code IN ('RAHAAL2024', 'DEBUG-OWNER', 'KHALIYA-UNLIMITED');
