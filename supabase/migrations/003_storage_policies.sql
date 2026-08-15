-- Storage bucket policies for wedding-photos and wedding-music
-- These policies are created via SQL but are applied to Supabase Storage

-- WEDDING-PHOTOS BUCKET POLICIES

-- Admin can read all photos
CREATE POLICY "admin_read_all_photos_storage" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'wedding-photos'
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Customers can read photos from their own albums
-- Path structure: {customer_id}/{album_id}/*
CREATE POLICY "customer_read_own_photos_storage" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'wedding-photos'
    AND (
      -- Extract customer_id from path (first part before /)
      SPLIT_PART(name, '/', 1) IN (
        SELECT customers.id::text FROM customers
        WHERE profile_id IN (
          SELECT id FROM profiles
          WHERE auth_user_id = auth.uid()
        )
      )
    )
    AND EXISTS (
      -- Verify the album is published
      SELECT 1 FROM albums
      WHERE albums.customer_id::text = SPLIT_PART(name, '/', 1)
      AND albums.id::text = SPLIT_PART(name, '/', 2)
      AND albums.is_published = TRUE
    )
  );

-- Admin can create/upload photos
CREATE POLICY "admin_upload_photos_storage" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'wedding-photos'
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Admin can update photos
CREATE POLICY "admin_update_photos_storage" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'wedding-photos'
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Admin can delete photos
CREATE POLICY "admin_delete_photos_storage" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'wedding-photos'
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- ==================== WEDDING-MUSIC BUCKET POLICIES ====================

-- Admin can read all music
CREATE POLICY "admin_read_all_music_storage" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'wedding-music'
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Customers can read music from their own published albums
-- Path structure: {customer_id}/{album_id}/*
CREATE POLICY "customer_read_own_music_storage" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'wedding-music'
    AND (
      SPLIT_PART(name, '/', 1) IN (
        SELECT customers.id::text FROM customers
        WHERE profile_id IN (
          SELECT id FROM profiles
          WHERE auth_user_id = auth.uid()
        )
      )
    )
    AND EXISTS (
      SELECT 1 FROM albums
      WHERE albums.customer_id::text = SPLIT_PART(name, '/', 1)
      AND albums.id::text = SPLIT_PART(name, '/', 2)
      AND albums.is_published = TRUE
    )
  );

-- Admin can create/upload music
CREATE POLICY "admin_upload_music_storage" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'wedding-music'
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Admin can update music
CREATE POLICY "admin_update_music_storage" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'wedding-music'
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Admin can delete music
CREATE POLICY "admin_delete_music_storage" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'wedding-music'
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
    )
  );
