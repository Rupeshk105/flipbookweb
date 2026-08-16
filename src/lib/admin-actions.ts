'use server';

import { randomBytes } from 'node:crypto';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getCurrentProfile } from './auth-actions';
import { createCustomerSchema, createAlbumSchema } from './schemas';
import type { Database } from '@/types/supabase';

/**
 * Admin-only action to create a new customer
 */
export async function createCustomer(formData: {
  fullName: string;
  email: string;
}) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();

  const validation = createCustomerSchema.safeParse({
    full_name: formData.fullName,
    email: formData.email,
  });

  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const { data: customerProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('email', formData.email)
    .eq('role', 'customer')
    .single();

  if (profileError || !customerProfile) {
    return {
      error:
        'Create a customer Auth user and customer profile with this email before adding the customer record.',
    };
  }

  const { data, error } = await supabase
    .from('customers')
    .insert({
      full_name: formData.fullName,
      email: formData.email,
      status: 'active',
      profile_id: customerProfile.id,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data, error: null };
}

/**
 * Admin-only action to update customer
 */
export async function updateCustomer(
  customerId: string,
  formData: {
    fullName?: string;
    email?: string;
    status?: 'active' | 'inactive';
  }
) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();

  const updateData: Database['public']['Tables']['customers']['Update'] = {};
  if (formData.fullName) updateData.full_name = formData.fullName;
  if (formData.email) updateData.email = formData.email;
  if (formData.status) updateData.status = formData.status;

  const { data, error } = await supabase
    .from('customers')
    .update(updateData)
    .eq('id', customerId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data, error: null };
}

/**
 * Admin-only action to delete customer
 */
export async function deleteCustomer(customerId: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', customerId);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Admin-only action to create album
 */
export async function createAlbum(formData: {
  customerId: string;
  title: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  description?: string;
}) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();

  const validation = createAlbumSchema.safeParse({
    customer_id: formData.customerId,
    title: formData.title,
    bride_name: formData.brideName,
    groom_name: formData.groomName,
    wedding_date: formData.weddingDate,
    description: formData.description,
  });

  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const { data, error } = await supabase
    .from('albums')
    .insert({
      customer_id: formData.customerId,
      title: formData.title,
      bride_name: formData.brideName,
      groom_name: formData.groomName,
      wedding_date: formData.weddingDate,
      description: formData.description,
      is_published: false,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data, error: null };
}

/**
 * Admin-only action to update album
 */
export async function updateAlbum(
  albumId: string,
  formData: {
    title?: string;
    brideName?: string;
    groomName?: string;
    weddingDate?: string;
    description?: string;
    isPublished?: boolean;
  }
) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();

  const updateData: Database['public']['Tables']['albums']['Update'] = {};
  if (formData.title) updateData.title = formData.title;
  if (formData.brideName) updateData.bride_name = formData.brideName;
  if (formData.groomName) updateData.groom_name = formData.groomName;
  if (formData.weddingDate) updateData.wedding_date = formData.weddingDate;
  if (formData.description) updateData.description = formData.description;
  if (formData.isPublished !== undefined) updateData.is_published = formData.isPublished;

  const { data, error } = await supabase
    .from('albums')
    .update(updateData)
    .eq('id', albumId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data, error: null };
}

/**
 * Admin-only action to delete album
 */
export async function deleteAlbum(albumId: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('albums')
    .delete()
    .eq('id', albumId);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Admin-only action to get (or create) a persistent QR/link token that repeatedly signs
 * the album's customer straight in and opens the album, every time it's scanned.
 */
export async function generateAlbumAccessLink(albumId: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();

  const { data: album, error: albumError } = await supabase
    .from('albums')
    .select('is_published')
    .eq('id', albumId)
    .single();

  if (albumError || !album) {
    return { error: 'Album not found' };
  }

  if (!album.is_published) {
    return { error: 'Publish the album before generating a QR code for it' };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return { error: 'QR generation is not configured. Set SUPABASE_SERVICE_ROLE_KEY on the server.' };
  }

  // Uses the service-role client since album_access_tokens has no client-facing RLS policies.
  const { data: existingToken } = await adminClient
    .from('album_access_tokens')
    .select('token')
    .eq('album_id', albumId)
    .is('revoked_at', null)
    .single();

  const token = existingToken?.token || randomBytes(24).toString('hex');

  if (!existingToken) {
    const { error: insertError } = await adminClient
      .from('album_access_tokens')
      .upsert({ album_id: albumId, token, revoked_at: null });

    if (insertError) {
      return { error: insertError.message };
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
  return { error: null, url: `${siteUrl}/album-access/${token}` };
}

/**
 * Admin-only action to revoke the current QR/link token for an album and issue a new one,
 * invalidating any previously printed/shared QR codes.
 */
export async function regenerateAlbumAccessLink(albumId: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return { error: 'QR generation is not configured. Set SUPABASE_SERVICE_ROLE_KEY on the server.' };
  }

  const { error: deleteError } = await adminClient
    .from('album_access_tokens')
    .delete()
    .eq('album_id', albumId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  return generateAlbumAccessLink(albumId);
}

/**
 * Admin-only action to upload photos to storage and create photo records
 */
export async function uploadPhotos(
  albumId: string,
  files: File[]
) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();

  // Get album to verify it exists and get customer_id
  const { data: album, error: albumError } = await supabase
    .from('albums')
    .select('customer_id')
    .eq('id', albumId)
    .single();

  if (albumError || !album) {
    return { error: 'Album not found' };
  }

  const uploadedPhotos = [];
  let sortOrder = 0;

  for (const file of files) {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${album.customer_id}/${albumId}/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('wedding-photos')
      .upload(filePath, file);

    if (uploadError) {
      return { error: `Failed to upload ${file.name}: ${uploadError.message}` };
    }

    // Create photo record
    const { data: photo, error: photoError } = await supabase
      .from('photos')
      .insert({
        album_id: albumId,
        storage_path: filePath,
        caption: file.name.replace(/\.[^/]*$/, ''),
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (photoError) {
      return { error: `Failed to create photo record: ${photoError.message}` };
    }

    uploadedPhotos.push(photo);
    sortOrder++;
  }

  return { data: uploadedPhotos, error: null };
}

/**
 * Admin-only action to upload music to storage and create album_music record
 */
export async function uploadMusic(
  albumId: string,
  file: File,
  title: string
) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();

  // Get album to verify it exists and get customer_id
  const { data: album, error: albumError } = await supabase
    .from('albums')
    .select('customer_id')
    .eq('id', albumId)
    .single();

  if (albumError || !album) {
    return { error: 'Album not found' };
  }

  const fileName = `${Date.now()}-${file.name}`;
  const filePath = `${album.customer_id}/${albumId}/${fileName}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('wedding-music')
    .upload(filePath, file);

  if (uploadError) {
    return { error: `Failed to upload music: ${uploadError.message}` };
  }

  // Create music record
  const { data: music, error: musicError } = await supabase
    .from('album_music')
    .upsert({
      album_id: albumId,
      storage_path: filePath,
      title: title,
    })
    .select()
    .single();

  if (musicError) {
    return { error: `Failed to create music record: ${musicError.message}` };
  }

  return { data: music, error: null };
}

export async function getAlbumUploadInfo(albumId: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();
  const { data: album, error } = await supabase
    .from('albums')
    .select('customer_id')
    .eq('id', albumId)
    .single();

  if (error || !album) {
    throw new Error('Album not found');
  }

  return { customerId: album.customer_id };
}

export async function createPhotoRecord(
  albumId: string,
  storagePath: string,
  caption: string,
  sortOrder: number
) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('photos')
    .insert({
      album_id: albumId,
      storage_path: storagePath,
      caption,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create photo record: ${error.message}`);
  }

  return data;
}

export async function createMusicRecord(
  albumId: string,
  storagePath: string,
  title: string
) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('album_music')
    .upsert({
      album_id: albumId,
      storage_path: storagePath,
      title,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create music record: ${error.message}`);
  }

  return data;
}

/**
 * Admin-only action to delete a single photo from storage and the database
 */
export async function deletePhoto(photoId: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();

  const { data: photo, error: photoError } = await supabase
    .from('photos')
    .select('storage_path')
    .eq('id', photoId)
    .single();

  if (photoError || !photo) {
    return { error: 'Photo not found' };
  }

  const { error: storageError } = await supabase.storage
    .from('wedding-photos')
    .remove([photo.storage_path]);

  if (storageError) {
    console.error('Failed to remove photo from storage:', storageError);
  }

  const { error: deleteError } = await supabase
    .from('photos')
    .delete()
    .eq('id', photoId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  return { error: null };
}

/**
 * Admin-only action to delete an album's background music from storage and the database
 */
export async function deleteMusic(albumId: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();

  const { data: music, error: musicError } = await supabase
    .from('album_music')
    .select('storage_path')
    .eq('album_id', albumId)
    .single();

  if (musicError || !music) {
    return { error: 'Music not found' };
  }

  const { error: storageError } = await supabase.storage
    .from('wedding-music')
    .remove([music.storage_path]);

  if (storageError) {
    console.error('Failed to remove music from storage:', storageError);
  }

  const { error: deleteError } = await supabase
    .from('album_music')
    .delete()
    .eq('album_id', albumId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  return { error: null };
}

const DEFAULT_CUSTOMER_PASSWORD = 'Wedding@123';

/**
 * Get the single app_settings row, creating fallback defaults if the table is empty
 */
export async function getAppSettings() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .eq('id', 'default')
    .single();

  if (error || !data) {
    return {
      id: 'default',
      site_name: 'Reyansh Studio',
      contact_phone: '8383899540',
      default_customer_password: DEFAULT_CUSTOMER_PASSWORD,
      updated_at: new Date().toISOString(),
    };
  }

  return data;
}

/**
 * Admin-only action to update site settings
 */
export async function updateAppSettings(formData: {
  siteName: string;
  contactPhone: string;
  defaultCustomerPassword: string;
}) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('app_settings')
    .upsert({
      id: 'default',
      site_name: formData.siteName,
      contact_phone: formData.contactPhone,
      default_customer_password: formData.defaultCustomerPassword,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Admin-only action to reset a customer's password to the default (or a supplied) value
 */
export async function resetCustomerPassword(customerId: string, newPassword?: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('profile_id')
    .eq('id', customerId)
    .single();

  if (customerError || !customer) {
    return { error: 'Customer not found' };
  }

  const { data: customerProfile, error: profileError } = await supabase
    .from('profiles')
    .select('auth_user_id')
    .eq('id', customer.profile_id)
    .single();

  if (profileError || !customerProfile) {
    return { error: 'Linked auth account not found for this customer' };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return { error: 'Password reset is not configured. Set SUPABASE_SERVICE_ROLE_KEY on the server.' };
  }

  const { data: settings } = await supabase
    .from('app_settings')
    .select('default_customer_password')
    .eq('id', 'default')
    .single();

  const passwordToSet = newPassword || settings?.default_customer_password || DEFAULT_CUSTOMER_PASSWORD;

  const { error: updateError } = await adminClient.auth.admin.updateUserById(
    customerProfile.auth_user_id,
    { password: passwordToSet }
  );

  if (updateError) {
    return { error: updateError.message };
  }

  return { error: null, password: passwordToSet };
}
