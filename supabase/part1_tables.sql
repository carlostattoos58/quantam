-- ============================================================
-- QUANTAM EA v5  |  PART 1 of 2  –  Tables + Functions
-- Paste this in Supabase SQL Editor → Run
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member','admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activation_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_value TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'unused' CHECK (status IN ('unused','active','revoked','expired')),
  membership_plan TEXT NOT NULL DEFAULT 'Standard',
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE TABLE IF NOT EXISTS market_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL DEFAULT 'forex' CHECK (category IN ('forex','gold','crypto','technical')),
  type TEXT NOT NULL DEFAULT 'daily_update',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ea_releases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  version TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'guide' CHECK (type IN ('guide','pdf','video')),
  level TEXT NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner','intermediate','advanced')),
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role, status)
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
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Validate activation key (called from frontend, never exposes keys)
CREATE OR REPLACE FUNCTION validate_activation_key(p_key TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_key activation_keys%ROWTYPE;
BEGIN
  SELECT * INTO v_key FROM activation_keys WHERE key_value = p_key;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Activation key not found.');
  END IF;
  IF v_key.status = 'revoked' THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'This key has been revoked.');
  END IF;
  IF v_key.expires_at IS NOT NULL AND v_key.expires_at < NOW() THEN
    UPDATE activation_keys SET status = 'expired' WHERE id = v_key.id;
    RETURN jsonb_build_object('valid', false, 'reason', 'This key has expired.');
  END IF;
  IF v_key.status = 'active' AND v_key.user_id IS NOT NULL THEN
    RETURN jsonb_build_object('valid', true, 'plan', v_key.membership_plan, 'already_bound', true);
  END IF;
  RETURN jsonb_build_object('valid', true, 'plan', v_key.membership_plan);
END;
$$;

-- Bind key to user after registration
CREATE OR REPLACE FUNCTION bind_activation_key(p_key TEXT, p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE activation_keys
  SET user_id = p_user_id, status = 'active', activated_at = NOW()
  WHERE key_value = p_key AND (user_id IS NULL OR status = 'unused');
END;
$$;

-- Sample activation key for first login
INSERT INTO activation_keys (key_value, membership_plan, status, expires_at)
VALUES ('123456789', 'Standard', 'unused', NOW() + INTERVAL '365 days')
ON CONFLICT (key_value) DO NOTHING;
