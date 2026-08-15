-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_music ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Read the current user's role without recursively evaluating profiles RLS.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE auth_user_id = auth.uid()
      AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ==================== PROFILES TABLE POLICIES ====================

-- Admin can read all profiles
CREATE POLICY "admin_read_all_profiles" ON profiles
  FOR SELECT
  USING (public.is_admin());

-- Users can read their own profile
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT
  USING (auth_user_id = auth.uid());

-- Users can update their own profile (except role)
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (
    auth_user_id = auth.uid()
    AND role = (SELECT role FROM profiles WHERE auth_user_id = auth.uid())
  );

-- Only service role can insert profiles (during signup via trigger)
CREATE POLICY "service_role_insert_profiles" ON profiles
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ==================== CUSTOMERS TABLE POLICIES ====================

-- Admin can read all customers
CREATE POLICY "admin_read_all_customers" ON customers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Customers can read their own customer record
CREATE POLICY "customer_read_own_record" ON customers
  FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM profiles
      WHERE auth_user_id = auth.uid()
    )
  );

-- Admin can insert customers
CREATE POLICY "admin_insert_customers" ON customers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Admin can update customers
CREATE POLICY "admin_update_customers" ON customers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Admin can delete customers
CREATE POLICY "admin_delete_customers" ON customers
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- ==================== ALBUMS TABLE POLICIES ====================

-- Admin can read all albums
CREATE POLICY "admin_read_all_albums" ON albums
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Customers can read their published albums
CREATE POLICY "customer_read_own_published_albums" ON albums
  FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers
      WHERE profile_id IN (
        SELECT id FROM profiles
        WHERE auth_user_id = auth.uid()
      )
    )
    AND is_published = TRUE
  );

-- Admin can insert albums
CREATE POLICY "admin_insert_albums" ON albums
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Admin can update albums
CREATE POLICY "admin_update_albums" ON albums
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Admin can delete albums
CREATE POLICY "admin_delete_albums" ON albums
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- ==================== PHOTOS TABLE POLICIES ====================

-- Admin can read all photos
CREATE POLICY "admin_read_all_photos" ON photos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Customers can read photos from their published albums only
CREATE POLICY "customer_read_own_album_photos" ON photos
  FOR SELECT
  USING (
    album_id IN (
      SELECT id FROM albums
      WHERE customer_id IN (
        SELECT id FROM customers
        WHERE profile_id IN (
          SELECT id FROM profiles
          WHERE auth_user_id = auth.uid()
        )
      )
      AND is_published = TRUE
    )
  );

-- Admin can insert photos
CREATE POLICY "admin_insert_photos" ON photos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Admin can update photos
CREATE POLICY "admin_update_photos" ON photos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Admin can delete photos
CREATE POLICY "admin_delete_photos" ON photos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- ==================== ALBUM_MUSIC TABLE POLICIES ====================

-- Admin can read all music
CREATE POLICY "admin_read_all_music" ON album_music
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Customers can read music from their published albums
CREATE POLICY "customer_read_own_album_music" ON album_music
  FOR SELECT
  USING (
    album_id IN (
      SELECT id FROM albums
      WHERE customer_id IN (
        SELECT id FROM customers
        WHERE profile_id IN (
          SELECT id FROM profiles
          WHERE auth_user_id = auth.uid()
        )
      )
      AND is_published = TRUE
    )
  );

-- Admin can insert music
CREATE POLICY "admin_insert_music" ON album_music
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Admin can update music
CREATE POLICY "admin_update_music" ON album_music
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Admin can delete music
CREATE POLICY "admin_delete_music" ON album_music
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- ==================== AUDIT_LOGS TABLE POLICIES ====================

-- Admin can read all audit logs
CREATE POLICY "admin_read_audit_logs" ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Service role can insert audit logs
CREATE POLICY "service_role_insert_audit_logs" ON audit_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Only admins can delete old audit logs
CREATE POLICY "admin_delete_audit_logs" ON audit_logs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );
