-- app_settings table - single-row store for admin-configurable site settings
CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  site_name TEXT NOT NULL DEFAULT 'Reyansh Studio',
  contact_phone TEXT NOT NULL DEFAULT '8383899540',
  default_customer_password TEXT NOT NULL DEFAULT 'Wedding@123',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

INSERT INTO app_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Any authenticated user (admin or customer) can read settings for display purposes
CREATE POLICY "authenticated_read_app_settings" ON app_settings
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can update settings
CREATE POLICY "admin_update_app_settings" ON app_settings
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Needed because the settings upsert performs an INSERT when no row exists yet
CREATE POLICY "admin_insert_app_settings" ON app_settings
  FOR INSERT
  WITH CHECK (public.is_admin());
