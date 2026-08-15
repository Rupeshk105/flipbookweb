export type UserRole = 'admin' | 'customer';
export type CustomerStatus = 'active' | 'inactive';

export interface Profile {
  id: string;
  auth_user_id: string;
  role: UserRole;
  full_name: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  profile_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: CustomerStatus;
  created_at: string;
  updated_at: string;
}

export interface Album {
  id: string;
  customer_id: string;
  title: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  description: string | null;
  cover_photo_path: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  album_id: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AlbumMusic {
  id: string;
  album_id: string;
  storage_path: string;
  title: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface CustomerWithProfile extends Customer {
  profile: Profile;
}

export interface AlbumWithPhotos extends Album {
  photos: Photo[];
  music: AlbumMusic | null;
}
