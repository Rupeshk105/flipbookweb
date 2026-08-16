'use client';

import { useState } from 'react';
import { PhotoUploadForm } from '@/components/admin/PhotoUploadForm';
import { DeletePhotoButton } from '@/components/admin/DeletePhotoButton';
import type { Database } from '@/types/supabase';

type Photo = Database['public']['Tables']['photos']['Row'] & { signed_url: string | null };
type Album = Database['public']['Tables']['albums']['Row'];

interface AlbumPhotoManagerProps {
  albums: { album: Album; photos: Photo[] }[];
}

export function AlbumPhotoManager({ albums }: AlbumPhotoManagerProps) {
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

          <PhotoUploadForm albumId={selected.album.id} />

          {selected.photos.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                Uploaded Photos ({selected.photos.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selected.photos.map((photo) => (
                  <div key={photo.id} className="relative bg-slate-700 rounded-lg overflow-hidden">
                    <DeletePhotoButton photoId={photo.id} />
                    <div className="aspect-square bg-slate-600 flex items-center justify-center">
                      {photo.signed_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photo.signed_url}
                          alt={photo.caption || ''}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-slate-400 text-sm">
                          Photo {photo.sort_order + 1}
                        </span>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-slate-300 truncate">{photo.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
