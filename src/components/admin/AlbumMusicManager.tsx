'use client';

import { useState } from 'react';
import { MusicUploadForm } from '@/components/admin/MusicUploadForm';
import { DeleteMusicButton } from '@/components/admin/DeleteMusicButton';
import type { Database } from '@/types/supabase';

type Music = Database['public']['Tables']['album_music']['Row'];
type Album = Database['public']['Tables']['albums']['Row'];

interface AlbumMusicManagerProps {
  albums: { album: Album; music: Music | null }[];
}

export function AlbumMusicManager({ albums }: AlbumMusicManagerProps) {
  const [selectedAlbumId, setSelectedAlbumId] = useState(albums[0]?.album.id ?? '');

  const selected = albums.find(({ album }) => album.id === selectedAlbumId);

  return (
    <div className="space-y-6">
      <div className="max-w-md">
        <label className="block text-sm font-medium text-white mb-2">
          Select Album
        </label>
        <select
          value={selectedAlbumId}
          onChange={(event) => setSelectedAlbumId(event.target.value)}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {albums.map(({ album }) => (
            <option key={album.id} value={album.id}>
              {album.title} — {album.bride_name} &amp; {album.groom_name}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <h2 className="text-xl font-bold text-white mb-1">{selected.album.title}</h2>
          <p className="text-slate-400 text-sm mb-6">
            {selected.album.bride_name} &amp; {selected.album.groom_name}
          </p>

          <MusicUploadForm albumId={selected.album.id} />

          {selected.music && (
            <div className="mt-8 flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div>
                <p className="text-white font-medium mb-2">Current Music:</p>
                <p className="text-slate-300">{selected.music.title}</p>
              </div>
              <DeleteMusicButton albumId={selected.album.id} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
