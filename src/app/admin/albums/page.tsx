import { getCurrentProfile } from '@/lib/auth-actions';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit2 } from 'lucide-react';
import { DeleteAlbumButton } from '@/components/admin/DeleteAlbumButton';

export default async function AlbumsPage() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'admin') {
    redirect('/admin/login');
  }

  const supabase = await createClient();

  const { data: albums } = await supabase
    .from('albums')
    .select('*, customers(full_name)')
    .order('created_at', { ascending: false });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Albums</h1>
          <p className="text-slate-400">Manage wedding albums</p>
        </div>
        <Link
          href="/admin/albums/new"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
        >
          <Plus size={20} />
          Create Album
        </Link>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        {albums && albums.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  <th className="text-left text-slate-400 py-4 px-6 font-medium">
                    Title
                  </th>
                  <th className="text-left text-slate-400 py-4 px-6 font-medium">
                    Customer
                  </th>
                  <th className="text-left text-slate-400 py-4 px-6 font-medium">
                    Wedding Date
                  </th>
                  <th className="text-left text-slate-400 py-4 px-6 font-medium">
                    Status
                  </th>
                  <th className="text-left text-slate-400 py-4 px-6 font-medium">
                    Created
                  </th>
                  <th className="text-left text-slate-400 py-4 px-6 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {albums.map((album) => (
                  <tr key={album.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition">
                    <td className="py-4 px-6 text-white">
                      <div>
                        <p className="font-medium">{album.title}</p>
                        <p className="text-sm text-slate-400">
                          {album.bride_name} &amp; {album.groom_name}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      {album.customers?.full_name || 'Unknown'}
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      {new Date(album.wedding_date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        album.is_published
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {album.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(album.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/albums/${album.id}`}
                          className="p-2 hover:bg-slate-700 rounded-lg transition text-blue-400 hover:text-blue-300"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <DeleteAlbumButton
                          albumId={album.id}
                          albumTitle={album.title}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">No albums yet</p>
            <Link
              href="/admin/albums/new"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Create your first album
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
