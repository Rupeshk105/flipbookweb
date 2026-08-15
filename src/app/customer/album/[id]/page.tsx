import { getCurrentProfile } from '@/lib/auth-actions';
import { getAlbumWithDetails } from '@/lib/customer-actions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PhotoGallery } from '@/components/customer/PhotoGallery';
import { MusicPlayer } from '@/components/customer/MusicPlayer';

interface Params {
  id: string;
}

export default async function AlbumViewerPage({ params }: { params: Params }) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'customer') {
    redirect('/login');
  }

  let album, photos, music;
  try {
    const result = await getAlbumWithDetails(params.id);
    album = result.album;
    photos = result.photos;
    music = result.music;
  } catch {
    redirect('/customer/dashboard');
  }

  if (!album) {
    redirect('/customer/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/customer/dashboard"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Back to albums"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              {album.title}
            </h1>
            <p className="text-sm text-gray-600">
              {album.bride_name} &amp; {album.groom_name}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Album Info Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Wedding Date</p>
                <p className="text-lg text-gray-900">
                  {new Date(album.wedding_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Photos</p>
                <p className="text-lg text-gray-900">{photos.length} images</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Description</p>
                <p className="text-gray-700">
                  {album.description || 'No description'}
                </p>
              </div>
            </div>
          </div>

          {/* Music Player */}
          {music && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Background Music
              </h2>
              <MusicPlayer
                storagePath={music.storage_path}
                title={music.title}
              />
            </div>
          )}

          {/* Photo Gallery */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Photos
            </h2>
            {photos.length > 0 ? (
              <PhotoGallery photos={photos} albumTitle={album.title} />
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-500">No photos in this album yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
