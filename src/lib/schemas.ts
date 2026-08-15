import { z } from 'zod';

// ==================== PROFILE SCHEMAS ====================

export const profileSchema = z.object({
  id: z.string().uuid(),
  auth_user_id: z.string().uuid(),
  role: z.enum(['admin', 'customer']),
  full_name: z.string().nullable(),
  email: z.string().email(),
  phone: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const updateProfileSchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  phone: z.string().max(20).nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ==================== CUSTOMER SCHEMAS ====================

export const customerSchema = z.object({
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  full_name: z.string().min(1).max(255),
  email: z.string().email(),
  phone: z.string().max(20).nullable(),
  status: z.enum(['active', 'inactive']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const createCustomerSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(255),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional().nullable(),
  bride_name: z.string().min(1, 'Bride name is required').max(255),
  groom_name: z.string().min(1, 'Groom name is required').max(255),
  wedding_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export const updateCustomerSchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).nullable().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

// ==================== ALBUM SCHEMAS ====================

export const albumSchema = z.object({
  id: z.string().uuid(),
  customer_id: z.string().uuid(),
  title: z.string().max(255),
  bride_name: z.string().max(255),
  groom_name: z.string().max(255),
  wedding_date: z.string(),
  description: z.string().nullable(),
  cover_photo_path: z.string().nullable(),
  is_published: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const createAlbumSchema = z.object({
  customer_id: z.string().uuid('Invalid customer ID'),
  title: z.string().min(1, 'Album title is required').max(255),
  bride_name: z.string().min(1, 'Bride name is required').max(255),
  groom_name: z.string().min(1, 'Groom name is required').max(255),
  wedding_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  description: z.string().max(1000).optional().nullable(),
});

export type CreateAlbumInput = z.infer<typeof createAlbumSchema>;

export const updateAlbumSchema = z.object({
  title: z.string().max(255).optional(),
  bride_name: z.string().max(255).optional(),
  groom_name: z.string().max(255).optional(),
  wedding_date: z.string().optional(),
  description: z.string().max(1000).nullable().optional(),
  cover_photo_path: z.string().nullable().optional(),
  is_published: z.boolean().optional(),
});

export type UpdateAlbumInput = z.infer<typeof updateAlbumSchema>;

// ==================== PHOTO SCHEMAS ====================

export const photoSchema = z.object({
  id: z.string().uuid(),
  album_id: z.string().uuid(),
  storage_path: z.string(),
  caption: z.string().nullable(),
  sort_order: z.number().int(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const createPhotoSchema = z.object({
  album_id: z.string().uuid('Invalid album ID'),
  storage_path: z.string().min(1, 'Storage path is required'),
  caption: z.string().max(500).optional().nullable(),
  sort_order: z.number().int().default(0),
});

export type CreatePhotoInput = z.infer<typeof createPhotoSchema>;

export const updatePhotoSchema = z.object({
  caption: z.string().max(500).nullable().optional(),
  sort_order: z.number().int().optional(),
});

export type UpdatePhotoInput = z.infer<typeof updatePhotoSchema>;

// ==================== ALBUM MUSIC SCHEMAS ====================

export const albumMusicSchema = z.object({
  id: z.string().uuid(),
  album_id: z.string().uuid(),
  storage_path: z.string(),
  title: z.string().max(255),
  is_active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const createAlbumMusicSchema = z.object({
  album_id: z.string().uuid('Invalid album ID'),
  storage_path: z.string().min(1, 'Storage path is required'),
  title: z.string().min(1, 'Music title is required').max(255),
});

export type CreateAlbumMusicInput = z.infer<typeof createAlbumMusicSchema>;

export const updateAlbumMusicSchema = z.object({
  title: z.string().max(255).optional(),
  is_active: z.boolean().optional(),
});

export type UpdateAlbumMusicInput = z.infer<typeof updateAlbumMusicSchema>;

// ==================== FILE UPLOAD SCHEMAS ====================

export const photoUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 50 * 1024 * 1024, 'File size must be less than 50MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Only JPEG, PNG, and WebP images are supported'
    ),
  caption: z.string().max(500).optional(),
});

export type PhotoUploadInput = z.infer<typeof photoUploadSchema>;

export const musicUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 100 * 1024 * 1024, 'File size must be less than 100MB')
    .refine(
      (file) => ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg'].includes(file.type),
      'Only MP3, WAV, OGG, and M4A audio formats are supported'
    ),
  title: z.string().min(1).max(255),
});

export type MusicUploadInput = z.infer<typeof musicUploadSchema>;
