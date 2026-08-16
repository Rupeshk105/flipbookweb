import { getCurrentProfile } from '@/lib/auth-actions';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { AlbumPhotoManager } from '@/components/admin/AlbumPhotoManager';
import type { Database } from '@/types/supabase';

type Photo = Database['public']['Tables']['photos']['Row'];
type Album = Database['public']['Tables']['albums']['Row'];

export default async function PhotosPage() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'admin') {
    redirect('/admin/login');
  }

  const supabase = await createClient();

  const { data: albums } = await supabase
    .from('albums')
    .select('*')
    .order('created_at', { ascending: false });

  const albumsWithPhotos = await Promise.all(
    ((albums as Album[]) || []).map(async (album) => {
      const { data: photos } = await supabase
        .from('photos')
        .select('*')
        .eq('album_id', album.id)
        .order('sort_order', { ascending: true });

      const photosWithUrls = await Promise.all(
        ((photos as Photo[]) || []).map(async (photo) => {
          const { data: signed } = await supabase.storage
            .from('wedding-photos')
            .createSignedUrl(photo.storage_path, 3600);

          return { ...photo, signed_url: signed?.signedUrl || null };
        })
      );

      return { album, photos: photosWithUrls };
    })
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Photos</h1>
        <p className="text-slate-400">Manage all album photos</p>
      </div>

      {albumsWithPhotos.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <p className="text-slate-400">No albums yet. Create an album first.</p>
        </div>
      ) : (
        <AlbumPhotoManager albums={albumsWithPhotos} />
      )}
    </div>
  );
}
