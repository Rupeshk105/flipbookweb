-- The upsert used by updateAppSettings performs an INSERT when no row exists yet,
-- but 004_app_settings.sql only defined an UPDATE policy for admins.
CREATE POLICY "admin_insert_app_settings" ON app_settings
  FOR INSERT
  WITH CHECK (public.is_admin());
