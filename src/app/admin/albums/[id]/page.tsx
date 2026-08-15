import { getCurrentProfile } from '@/lib/auth-actions';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { AlbumForm } from '@/components/admin/AlbumForm';
import { PhotoUploadForm } from '@/components/admin/PhotoUploadForm';
import { MusicUploadForm } from '@/components/admin/MusicUploadForm';
import type { Database } from '@/types/supabase';

interface Params {
  id: string;
}

type Photo = Database['public']['Tables']['photos']['Row'];
type Customer = Database['public']['Tables']['customers']['Row'];

export default async function EditAlbumPage({ params }: { params: Params }) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'admin') {
    redirect('/admin/login');
  }

  const supabase = await createClient();

  const { data: album } = await supabase
    .from('albums')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!album) {
    redirect('/admin/albums');
  }

  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('album_id', params.id)
    .order('sort_order', { ascending: true });

  const { data: music } = await supabase
    .from('album_music')
    .select('*')
    .eq('album_id', params.id)
    .single();

  const { data: customers } = await supabase
    .from('customers')
    .select('id, full_name');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Edit Album</h1>
        <p className="text-slate-400">
          {album.bride_name} &amp; {album.groom_name}
        </p>
      </div>

      <div className="space-y-8">
        {/* Album Details */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 max-w-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Album Details</h2>
          <AlbumForm
            customers={(customers as Customer[]) || []}
            initialData={album}
          />
        </div>

        {/* Photos Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <h2 className="text-xl font-bold text-white mb-6">Photos</h2>
          <PhotoUploadForm albumId={params.id} />

          {photos && (photos as Photo[]).length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                Uploaded Photos ({(photos as Photo[]).length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(photos as Photo[]).map((photo) => (
                  <div key={photo.id} className="bg-slate-700 rounded-lg overflow-hidden">
                    <div className="aspect-square bg-slate-600 flex items-center justify-center">
                      <span className="text-slate-400 text-sm">
                        Photo {photo.sort_order + 1}
                      </span>
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-slate-300 truncate">
                        {photo.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Music Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <h2 className="text-xl font-bold text-white mb-6">Background Music</h2>
          <MusicUploadForm albumId={params.id} />

          {music && (
            <div className="mt-8 p-4 bg-slate-700 rounded-lg">
              <p className="text-white font-medium mb-2">Current Music:</p>
              <p className="text-slate-300">{music.title}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
