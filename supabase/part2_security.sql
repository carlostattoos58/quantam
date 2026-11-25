-- ============================================================
-- QUANTAM EA v5  |  PART 2 of 2  –  Security (RLS Policies)
-- Only run this AFTER Part 1 succeeds
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activation_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE ea_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION is_active_member()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status = 'active');
$$;

-- PROFILES policies
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL USING (is_admin());

-- ACTIVATION KEYS policies
DROP POLICY IF EXISTS "keys_admin_all" ON activation_keys;
DROP POLICY IF EXISTS "keys_member_own" ON activation_keys;
CREATE POLICY "keys_admin_all" ON activation_keys FOR ALL USING (is_admin());
CREATE POLICY "keys_member_own" ON activation_keys FOR SELECT USING (user_id = auth.uid());

-- SIGNALS policies
DROP POLICY IF EXISTS "signals_read" ON signals;
DROP POLICY IF EXISTS "signals_admin_write" ON signals;
CREATE POLICY "signals_read" ON signals FOR SELECT USING (is_active_member() OR is_admin());
CREATE POLICY "signals_admin_write" ON signals FOR ALL USING (is_admin());

-- MARKET ANALYSIS policies
DROP POLICY IF EXISTS "analysis_read" ON market_analysis;
DROP POLICY IF EXISTS "analysis_admin_write" ON market_analysis;
CREATE POLICY "analysis_read" ON market_analysis FOR SELECT USING (is_active_member() OR is_admin());
CREATE POLICY "analysis_admin_write" ON market_analysis FOR ALL USING (is_admin());

-- EA RELEASES policies
DROP POLICY IF EXISTS "ea_read" ON ea_releases;
DROP POLICY IF EXISTS "ea_admin_write" ON ea_releases;
CREATE POLICY "ea_read" ON ea_releases FOR SELECT USING (is_active_member() OR is_admin());
CREATE POLICY "ea_admin_write" ON ea_releases FOR ALL USING (is_admin());

-- LEARNING RESOURCES policies
DROP POLICY IF EXISTS "learn_read" ON learning_resources;
DROP POLICY IF EXISTS "learn_admin_write" ON learning_resources;
CREATE POLICY "learn_read" ON learning_resources FOR SELECT USING (is_active_member() OR is_admin());
CREATE POLICY "learn_admin_write" ON learning_resources FOR ALL USING (is_admin());

-- ANNOUNCEMENTS policies
DROP POLICY IF EXISTS "announcements_read" ON announcements;
DROP POLICY IF EXISTS "announcements_admin_write" ON announcements;
CREATE POLICY "announcements_read" ON announcements FOR SELECT USING (is_active_member() OR is_admin());
CREATE POLICY "announcements_admin_write" ON announcements FOR ALL USING (is_admin());

-- COMMUNITY POSTS policies
DROP POLICY IF EXISTS "posts_read" ON community_posts;
DROP POLICY IF EXISTS "posts_insert" ON community_posts;
DROP POLICY IF EXISTS "posts_delete_own" ON community_posts;
DROP POLICY IF EXISTS "posts_admin_all" ON community_posts;
CREATE POLICY "posts_read" ON community_posts FOR SELECT USING (is_active_member() OR is_admin());
CREATE POLICY "posts_insert" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id AND is_active_member());
CREATE POLICY "posts_delete_own" ON community_posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "posts_admin_all" ON community_posts FOR ALL USING (is_admin());

-- SUPPORT TICKETS policies
DROP POLICY IF EXISTS "tickets_own" ON support_tickets;
DROP POLICY IF EXISTS "tickets_admin_all" ON support_tickets;
CREATE POLICY "tickets_own" ON support_tickets FOR ALL USING (user_id = auth.uid());
CREATE POLICY "tickets_admin_all" ON support_tickets FOR ALL USING (is_admin());
