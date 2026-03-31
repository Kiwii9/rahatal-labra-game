
CREATE TYPE public.code_type AS ENUM ('HOST', 'PLAYER', 'DEBUG');

CREATE TABLE public.activation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  uses_remaining integer NOT NULL DEFAULT 3,
  code_type public.code_type NOT NULL DEFAULT 'HOST',
  linked_email text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  display_name text DEFAULT 'رحّال',
  avatar_url text,
  purchase_verified boolean DEFAULT false,
  purchase_code text,
  is_developer boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read codes" ON public.activation_codes FOR SELECT TO public USING (true);
CREATE POLICY "Auth can insert codes" ON public.activation_codes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update codes" ON public.activation_codes FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

INSERT INTO public.activation_codes (code, uses_remaining, code_type, linked_email) VALUES
  ('RAHAAL2024', 999999, 'DEBUG', 'team.rahal3@gmail.com'),
  ('DEBUG-OWNER', 999999, 'DEBUG', 'team.rahal3@gmail.com'),
  ('KHALIYA-UNLIMITED', 999999, 'DEBUG', 'team.rahal3@gmail.com');

CREATE OR REPLACE FUNCTION public.consume_activation_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record activation_codes%ROWTYPE;
BEGIN
  SELECT * INTO v_record FROM activation_codes WHERE code = UPPER(TRIM(p_code));
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'message', 'رمز غير صالح');
  END IF;
  IF v_record.code_type = 'DEBUG' THEN
    RETURN jsonb_build_object('valid', true, 'code_type', v_record.code_type::text, 'message', 'وصول مطوّر');
  END IF;
  IF v_record.uses_remaining <= 0 THEN
    RETURN jsonb_build_object('valid', false, 'message', 'انتهت صلاحية هذا الرمز');
  END IF;
  UPDATE activation_codes SET uses_remaining = uses_remaining - 1 WHERE id = v_record.id;
  RETURN jsonb_build_object('valid', true, 'code_type', v_record.code_type::text, 'uses_remaining', v_record.uses_remaining - 1, 'message', 'رمز صالح');
END;
$$;

-- Allow anonymous users to insert players (guests join without auth)
CREATE POLICY "Anon can insert players" ON public.players FOR INSERT TO anon WITH CHECK (true);
