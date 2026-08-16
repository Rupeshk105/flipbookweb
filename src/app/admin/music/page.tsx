import { getCurrentProfile } from '@/lib/auth-actions';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { AlbumMusicManager } from '@/components/admin/AlbumMusicManager';
import type { Database } from '@/types/supabase';

type Album = Database['public']['Tables']['albums']['Row'];

export default async function MusicPage() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'admin') {
    redirect('/admin/login');
  }

  const supabase = await createClient();

  const { data: albums } = await supabase
    .from('albums')
    .select('*')
    .order('created_at', { ascending: false });

  const albumsWithMusic = await Promise.all(
    ((albums as Album[]) || []).map(async (album) => {
      const { data: music } = await supabase
        .from('album_music')
        .select('*')
        .eq('album_id', album.id)
        .single();

      return { album, music };
    })
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Music</h1>
        <p className="text-slate-400">Manage album background music</p>
      </div>

      {albumsWithMusic.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <p className="text-slate-400">No albums yet. Create an album first.</p>
        </div>
      ) : (
        <AlbumMusicManager albums={albumsWithMusic} />
      )}
    </div>
  );
}
