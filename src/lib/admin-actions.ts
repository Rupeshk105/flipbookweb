'use server';

import { createClient } from '@/lib/supabase-server';
import { getCurrentProfile } from './auth-actions';
import { createCustomerSchema, createAlbumSchema } from './schemas';

/**
 * Admin-only action to create a new customer
 */
export async function createCustomer(formData: {
  fullName: string;
  email: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
}) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();

  const validation = createCustomerSchema.safeParse({
    full_name: formData.fullName,
    email: formData.email,
    bride_name: formData.brideName,
    groom_name: formData.groomName,
    wedding_date: formData.weddingDate,
  });

  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from('customers')
    .insert({
      full_name: formData.fullName,
      email: formData.email,
      bride_name: formData.brideName,
      groom_name: formData.groomName,
      wedding_date: formData.weddingDate,
      status: 'pending',
      profile_id: profile.id,
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
    brideName?: string;
    groomName?: string;
    weddingDate?: string;
    status?: string;
  }
) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (formData.fullName) updateData.full_name = formData.fullName;
  if (formData.email) updateData.email = formData.email;
  if (formData.brideName) updateData.bride_name = formData.brideName;
  if (formData.groomName) updateData.groom_name = formData.groomName;
  if (formData.weddingDate) updateData.wedding_date = formData.weddingDate;
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
    title: formData.title,
    bride_name: formData.brideName,
    groom_name: formData.groomName,
    wedding_date: formData.weddingDate,
    description: formData.description,
  });

  if (!validation.success) {
    return { error: validation.error.errors[0].message };
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
    description?: string;
    isPublished?: boolean;
  }
) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (formData.title) updateData.title = formData.title;
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
        file_path: filePath,
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
      file_path: filePath,
      title: title,
    })
    .select()
    .single();

  if (musicError) {
    return { error: `Failed to create music record: ${musicError.message}` };
  }

  return { data: music, error: null };
}
