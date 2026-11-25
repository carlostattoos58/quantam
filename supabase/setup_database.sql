-- ============================================================
-- QUANTAM EA v5 – CLEAN COMPLETE DATABASE SETUP
-- Paste this entire block into a NEW query in Supabase SQL Editor
-- ============================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member','admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','inactive')),
  balance NUMERIC NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ACTIVATION KEYS TABLE
CREATE TABLE IF NOT EXISTS public.activation_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_value TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'unused' CHECK (status IN ('unused','active','revoked','expired')),
  membership_plan TEXT NOT NULL DEFAULT 'Standard',
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SIGNALS TABLE
CREATE TABLE IF NOT EXISTS public.signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('BUY','SELL')),
  entry_price TEXT,
  stop_loss TEXT,
  tp1 TEXT,
  tp2 TEXT,
  tp3 TEXT,
  rr_ratio TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','tp_hit','sl_hit','closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MARKET ANALYSIS TABLE
CREATE TABLE IF NOT EXISTS public.market_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL DEFAULT 'forex' CHECK (category IN ('forex','gold','crypto','technical')),
  type TEXT NOT NULL DEFAULT 'daily_update',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EA RELEASES TABLE
CREATE TABLE IF NOT EXISTS public.ea_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  version TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LEARNING RESOURCES TABLE
CREATE TABLE IF NOT EXISTS public.learning_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'guide' CHECK (type IN ('guide','pdf','video')),
  level TEXT NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner','intermediate','advanced')),
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. COMMUNITY POSTS TABLE
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SUPPORT TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TRIGGER TO AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'member',
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. RPC FUNCTION TO SECURELY VALIDATE ACTIVATION KEY
CREATE OR REPLACE FUNCTION public.validate_activation_key(p_key TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_key public.activation_keys%ROWTYPE;
BEGIN
  SELECT * INTO v_key FROM public.activation_keys WHERE key_value = p_key;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Activation key not found.');
  END IF;
  IF v_key.status = 'revoked' THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'This key has been revoked.');
  END IF;
  IF v_key.expires_at IS NOT NULL AND v_key.expires_at < NOW() THEN
    UPDATE public.activation_keys SET status = 'expired' WHERE id = v_key.id;
    RETURN jsonb_build_object('valid', false, 'reason', 'This key has expired.');
  END IF;
  IF v_key.status = 'active' AND v_key.user_id IS NOT NULL THEN
    RETURN jsonb_build_object('valid', true, 'plan', v_key.membership_plan, 'already_bound', true);
  END IF;
  RETURN jsonb_build_object('valid', true, 'plan', v_key.membership_plan);
END;
$$;

-- 12. RPC FUNCTION TO BIND KEY TO USER
CREATE OR REPLACE FUNCTION public.bind_activation_key(p_key TEXT, p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.activation_keys
  SET user_id = p_user_id, status = 'active', activated_at = NOW()
  WHERE key_value = p_key AND (user_id IS NULL OR status = 'unused');
END;
$$;

-- 13. SEED INITIAL ACTIVATION KEYS & GRANT PERMISSIONS
GRANT ALL ON public.activation_keys TO anon, authenticated, service_role;
GRANT ALL ON public.profiles TO anon, authenticated, service_role;

INSERT INTO public.activation_keys (key_value, membership_plan, status, expires_at)
VALUES 
  ('657284107', 'VIP', 'unused', NOW() + INTERVAL '365 days'),
  ('123456789', 'Standard', 'unused', NOW() + INTERVAL '365 days')
ON CONFLICT (key_value) DO NOTHING;
