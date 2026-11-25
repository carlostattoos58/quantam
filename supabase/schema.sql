-- ============================================================
-- QUANTAM EA v5 – Supabase Database Schema + RLS
-- Run this in your Supabase project SQL editor
-- ============================================================

-- ─── EXTENSIONS ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member','admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ACTIVATION KEYS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activation_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_value TEXT UNIQUE NOT NULL CHECK (key_value ~ '^\d+$'),
  status TEXT NOT NULL DEFAULT 'unused' CHECK (status IN ('unused','active','revoked','expired')),
  membership_plan TEXT NOT NULL DEFAULT 'Standard',
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activation_keys_key_value ON activation_keys(key_value);
CREATE INDEX IF NOT EXISTS idx_activation_keys_user_id ON activation_keys(user_id);

-- ─── SIGNALS ────────────────────────────────────────────────
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

-- ─── MARKET ANALYSIS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL DEFAULT 'forex' CHECK (category IN ('forex','gold','crypto','technical')),
  type TEXT NOT NULL DEFAULT 'daily_update',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── EA RELEASES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ea_releases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  version TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LEARNING RESOURCES ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS learning_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'guide' CHECK (type IN ('guide','pdf','video')),
  level TEXT NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner','intermediate','advanced')),
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ANNOUNCEMENTS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── COMMUNITY POSTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SUPPORT TICKETS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AUTO-CREATE PROFILE ON SIGNUP ──────────────────────────
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

-- ─── VALIDATE ACTIVATION KEY (RPC – called by frontend) ─────
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

  IF v_key.status = 'expired' THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'This key has expired.');
  END IF;

  IF v_key.expires_at IS NOT NULL AND v_key.expires_at < NOW() THEN
    UPDATE activation_keys SET status = 'expired' WHERE id = v_key.id;
    RETURN jsonb_build_object('valid', false, 'reason', 'This key has expired.');
  END IF;

  IF v_key.status = 'active' AND v_key.user_id IS NOT NULL THEN
    -- Allow re-login for same user (key already bound)
    RETURN jsonb_build_object('valid', true, 'plan', v_key.membership_plan, 'already_bound', true);
  END IF;

  IF v_key.status NOT IN ('unused', 'active') THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Invalid key status.');
  END IF;

  RETURN jsonb_build_object('valid', true, 'plan', v_key.membership_plan);
END;
$$;

-- ─── BIND ACTIVATION KEY TO USER ────────────────────────────
CREATE OR REPLACE FUNCTION bind_activation_key(p_key TEXT, p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE activation_keys
  SET
    user_id = p_user_id,
    status = 'active',
    activated_at = NOW()
  WHERE key_value = p_key AND (user_id IS NULL OR status = 'unused');
END;
$$;

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activation_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE ea_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Helper: is current user admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Helper: is current user active member?
CREATE OR REPLACE FUNCTION is_active_member()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND status = 'active'
  );
$$;

-- PROFILES
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;

CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (
  auth.uid() = id AND
  -- Prevent role self-escalation
  (SELECT role FROM profiles WHERE id = auth.uid()) = role
);
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL USING (is_admin());

-- ACTIVATION KEYS: only admins can manage; RPC functions bypass RLS via SECURITY DEFINER
DROP POLICY IF EXISTS "keys_admin_all" ON activation_keys;
DROP POLICY IF EXISTS "keys_member_own" ON activation_keys;
CREATE POLICY "keys_admin_all" ON activation_keys FOR ALL USING (is_admin());
CREATE POLICY "keys_member_own" ON activation_keys FOR SELECT USING (user_id = auth.uid());

-- SIGNALS: active members can read; admins can write
DROP POLICY IF EXISTS "signals_read" ON signals;
DROP POLICY IF EXISTS "signals_admin_write" ON signals;
CREATE POLICY "signals_read" ON signals FOR SELECT USING (is_active_member() OR is_admin());
CREATE POLICY "signals_admin_write" ON signals FOR ALL USING (is_admin());

-- MARKET ANALYSIS
DROP POLICY IF EXISTS "analysis_read" ON market_analysis;
DROP POLICY IF EXISTS "analysis_admin_write" ON market_analysis;
CREATE POLICY "analysis_read" ON market_analysis FOR SELECT USING (is_active_member() OR is_admin());
CREATE POLICY "analysis_admin_write" ON market_analysis FOR ALL USING (is_admin());

-- EA RELEASES
DROP POLICY IF EXISTS "ea_read" ON ea_releases;
DROP POLICY IF EXISTS "ea_admin_write" ON ea_releases;
CREATE POLICY "ea_read" ON ea_releases FOR SELECT USING (is_active_member() OR is_admin());
CREATE POLICY "ea_admin_write" ON ea_releases FOR ALL USING (is_admin());

-- LEARNING RESOURCES
DROP POLICY IF EXISTS "learn_read" ON learning_resources;
DROP POLICY IF EXISTS "learn_admin_write" ON learning_resources;
CREATE POLICY "learn_read" ON learning_resources FOR SELECT USING (is_active_member() OR is_admin());
CREATE POLICY "learn_admin_write" ON learning_resources FOR ALL USING (is_admin());

-- ANNOUNCEMENTS
DROP POLICY IF EXISTS "announcements_read" ON announcements;
DROP POLICY IF EXISTS "announcements_admin_write" ON announcements;
CREATE POLICY "announcements_read" ON announcements FOR SELECT USING (is_active_member() OR is_admin());
CREATE POLICY "announcements_admin_write" ON announcements FOR ALL USING (is_admin());

-- COMMUNITY POSTS
DROP POLICY IF EXISTS "posts_read" ON community_posts;
DROP POLICY IF EXISTS "posts_insert" ON community_posts;
DROP POLICY IF EXISTS "posts_delete_own" ON community_posts;
DROP POLICY IF EXISTS "posts_admin_all" ON community_posts;
CREATE POLICY "posts_read" ON community_posts FOR SELECT USING (is_active_member() OR is_admin());
CREATE POLICY "posts_insert" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id AND is_active_member());
CREATE POLICY "posts_delete_own" ON community_posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "posts_admin_all" ON community_posts FOR ALL USING (is_admin());

-- SUPPORT TICKETS
DROP POLICY IF EXISTS "tickets_own" ON support_tickets;
DROP POLICY IF EXISTS "tickets_admin_all" ON support_tickets;
CREATE POLICY "tickets_own" ON support_tickets FOR ALL USING (user_id = auth.uid());
CREATE POLICY "tickets_admin_all" ON support_tickets FOR ALL USING (is_admin());

-- ─── STORAGE BUCKETS ────────────────────────────────────────
-- Run this via Supabase dashboard or use the API:
-- Storage > New Bucket > "media" > Public: false
-- Then add policies:
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', false)
  ON CONFLICT (id) DO NOTHING;

-- Allow active members to read
CREATE POLICY "media_read_members" ON storage.objects FOR SELECT
  USING (bucket_id = 'media' AND (is_active_member() OR is_admin()));

-- Allow admins to upload
CREATE POLICY "media_upload_admin" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND is_admin());

CREATE POLICY "media_delete_admin" ON storage.objects FOR DELETE
  USING (bucket_id = 'media' AND is_admin());

-- ─── SAMPLE ADMIN USER ──────────────────────────────────────
-- After creating your Supabase account and signing up with YOUR email,
-- run this to make yourself admin (replace with your actual UUID):
-- UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';

-- ─── SAMPLE ACTIVATION KEY ──────────────────────────────────
-- Generate a test key (you can generate more from the Admin Panel):
INSERT INTO activation_keys (key_value, membership_plan, status, expires_at)
VALUES ('123456789', 'Standard', 'unused', NOW() + INTERVAL '365 days')
ON CONFLICT (key_value) DO NOTHING;
