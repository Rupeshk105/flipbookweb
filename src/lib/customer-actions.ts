'use server';

import { createClient } from '@/lib/supabase-server';
import { getCurrentProfile } from './auth-actions';

/**
 * Get customer's profile and basic info
 * Used by customer dashboard to display personalized greeting
 */
export async function getCustomerProfile() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'customer') {
    throw new Error('Unauthorized: Not a customer');
  }

  const supabase = await createClient();

  // Get customer record linked to this profile
  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('profile_id', profile.id)
    .single();

  if (error || !customer) {
    throw new Error('Customer record not found');
  }

  return customer;
}

/**
 * Get customer's published albums
 * Only returns albums marked as published
 * RLS policies enforce customer can only see their own albums
 */
export async function getCustomerAlbums() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'customer') {
    throw new Error('Unauthorized: Not a customer');
  }

  const supabase = await createClient();

  // First get the customer record
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('profile_id', profile.id)
    .single();

  if (!customer) {
    throw new Error('Customer record not found');
  }

  // Get their published albums
  // RLS will filter to only albums belonging to this customer
  const { data: albums, error } = await supabase
    .from('albums')
    .select('*')
    .eq('customer_id', customer.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch albums: ${error.message}`);
  }

  const albumsWithCovers = await Promise.all(
    (albums || []).map(async (album) => {
      if (!album.cover_photo_path) return { ...album, cover_photo_url: null };

      const { data: cover } = await supabase.storage
        .from('wedding-photos')
        .createSignedUrl(album.cover_photo_path, 3600);

      return { ...album, cover_photo_url: cover?.signedUrl || null };
    })
  );

  return albumsWithCovers;
}

/**
 * Get a specific album with full details (photos and music)
 * Verifies customer ownership and album publication status
 */
export async function getAlbumWithDetails(albumId: string) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'customer') {
    throw new Error('Unauthorized: Not a customer');
  }

  const supabase = await createClient();

  // Get customer record
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('profile_id', profile.id)
    .single();

  if (!customer) {
    throw new Error('Customer record not found');
  }

  // Get album - must belong to customer and be published
  const { data: album, error: albumError } = await supabase
    .from('albums')
    .select('*')
    .eq('id', albumId)
    .eq('customer_id', customer.id)
    .eq('is_published', true)
    .single();

  if (albumError || !album) {
    throw new Error('Album not found or not accessible');
  }

  // Get photos for this album
  const { data: photos, error: photosError } = await supabase
    .from('photos')
    .select('*')
    .eq('album_id', albumId)
    .order('sort_order', { ascending: true });

  if (photosError) {
    console.error('Error fetching photos:', photosError);
  }

  // Get music for this album
  const { data: music, error: musicError } = await supabase
    .from('album_music')
    .select('*')
    .eq('album_id', albumId)
    .eq('is_active', true)
    .single();

  if (musicError) {
    console.error('Error fetching music:', musicError);
  }

  const photosWithUrls = await Promise.all(
    (photos || []).map(async (photo) => {
      const { data: signedPhoto } = await supabase.storage
        .from('wedding-photos')
        .createSignedUrl(photo.storage_path, 3600);

      return { ...photo, signed_url: signedPhoto?.signedUrl || null };
    })
  );

  let musicWithUrl = null;
  if (music) {
    const { data: signedMusic } = await supabase.storage
      .from('wedding-music')
      .createSignedUrl(music.storage_path, 3600);

    musicWithUrl = { ...music, signed_url: signedMusic?.signedUrl || null };
  }

  return {
    album,
    photos: photosWithUrls,
    music: musicWithUrl,
  };
}

/**
 * Get album cover photo URL for display
 */
export async function getAlbumCoverUrl(albumId: string) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'customer') {
    throw new Error('Unauthorized: Not a customer');
  }

  const supabase = await createClient();

  // Verify customer owns this album and it's published
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('profile_id', profile.id)
    .single();

  if (!customer) {
    throw new Error('Customer record not found');
  }

  const { data: album, error } = await supabase
    .from('albums')
    .select('cover_photo_path')
    .eq('id', albumId)
    .eq('customer_id', customer.id)
    .eq('is_published', true)
    .single();

  if (error || !album || !album.cover_photo_path) {
    return null;
  }

  return album.cover_photo_path;
}
