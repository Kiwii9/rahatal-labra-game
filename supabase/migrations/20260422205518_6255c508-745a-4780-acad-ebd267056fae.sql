
-- Add expires_at for player code expiry
ALTER TABLE public.activation_codes
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Track which identities (provider + user) have claimed a HOST code (max 3)
CREATE TABLE IF NOT EXISTS public.code_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id uuid NOT NULL REFERENCES public.activation_codes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  provider text NOT NULL, -- 'email' | 'google' | 'apple'
  email text,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code_id, provider, user_id)
);

ALTER TABLE public.code_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own redemptions"
  ON public.code_redemptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert redemptions"
  ON public.code_redemptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Replace consume function with identity-aware logic
CREATE OR REPLACE FUNCTION public.consume_activation_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record activation_codes%ROWTYPE;
  v_user_id uuid := auth.uid();
  v_provider text;
  v_email text;
  v_existing uuid;
  v_count int;
BEGIN
  SELECT * INTO v_record FROM activation_codes WHERE code = UPPER(TRIM(p_code));
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'message', 'رمز غير صالح');
  END IF;

  -- DEBUG: unlimited, no tracking
  IF v_record.code_type = 'DEBUG' THEN
    RETURN jsonb_build_object('valid', true, 'code_type', 'DEBUG', 'message', 'وصول مطوّر');
  END IF;

  -- PLAYER: unlimited but expires 24h after creation
  IF v_record.code_type = 'PLAYER' THEN
    IF v_record.expires_at IS NOT NULL AND v_record.expires_at < now() THEN
      RETURN jsonb_build_object('valid', false, 'message', 'انتهت صلاحية رمز الغرفة');
    END IF;
    RETURN jsonb_build_object('valid', true, 'code_type', 'PLAYER', 'room_id', v_record.room_id, 'message', 'رمز صالح');
  END IF;

  -- HOST: identity-based linking, max 3 distinct identities
  IF v_record.code_type = 'HOST' THEN
    IF v_user_id IS NULL THEN
      RETURN jsonb_build_object('valid', false, 'message', 'يجب تسجيل الدخول أولاً');
    END IF;

    -- Detect provider from auth.users
    SELECT
      COALESCE(raw_app_meta_data->>'provider', 'email'),
      email
    INTO v_provider, v_email
    FROM auth.users WHERE id = v_user_id;

    -- Already linked? allow reuse
    SELECT id INTO v_existing
    FROM code_redemptions
    WHERE code_id = v_record.id AND user_id = v_user_id AND provider = v_provider;

    IF FOUND THEN
      RETURN jsonb_build_object('valid', true, 'code_type', 'HOST', 'message', 'مرحباً بعودتك');
    END IF;

    -- Otherwise, check 3-identity cap
    SELECT COUNT(*) INTO v_count FROM code_redemptions WHERE code_id = v_record.id;
    IF v_count >= 3 THEN
      RETURN jsonb_build_object('valid', false, 'message', 'هذا الرمز مرتبط بـ 3 حسابات بالفعل');
    END IF;

    INSERT INTO code_redemptions (code_id, user_id, provider, email)
    VALUES (v_record.id, v_user_id, v_provider, v_email);

    RETURN jsonb_build_object('valid', true, 'code_type', 'HOST', 'linked_count', v_count + 1, 'message', 'تم ربط الحساب بنجاح');
  END IF;

  RETURN jsonb_build_object('valid', false, 'message', 'نوع رمز غير مدعوم');
END;
$$;

-- Default expiry for new PLAYER codes: 24h
CREATE OR REPLACE FUNCTION public.set_player_code_expiry()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.code_type = 'PLAYER' AND NEW.expires_at IS NULL THEN
    NEW.expires_at := now() + interval '24 hours';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_player_code_expiry ON public.activation_codes;
CREATE TRIGGER trg_player_code_expiry
  BEFORE INSERT ON public.activation_codes
  FOR EACH ROW EXECUTE FUNCTION public.set_player_code_expiry();
