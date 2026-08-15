import { getCurrentProfile, logout } from '@/lib/auth-actions';
import { getCustomerProfile, getCustomerAlbums } from '@/lib/customer-actions';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function CustomerDashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'customer') {
    redirect('/login');
  }

  let customer, albums;
  try {
    customer = await getCustomerProfile();
    albums = await getCustomerAlbums();
  } catch {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Your Wedding Album
            </h1>
            {customer && (
              <p className="text-gray-600">
                Welcome, {customer.full_name}
              </p>
            )}
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
            >
              Logout
            </button>
          </form>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {albums && albums.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Your Albums
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {albums.map((album) => (
                  <Link
                    key={album.id}
                    href={`/customer/album/${album.id}`}
                    className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-blue-300 transition"
                  >
                    <div className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center overflow-hidden">
                      {album.cover_photo_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/wedding-photos/${album.cover_photo_path}`}
                          alt={album.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      ) : (
                        <p className="text-gray-500">No cover photo</p>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {album.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {album.bride_name} &amp; {album.groom_name}
                      </p>
                      <p className="text-gray-500 text-sm mb-4">
                        {new Date(album.wedding_date).toLocaleDateString()}
                      </p>
                      <div className="inline-block px-4 py-2 bg-blue-600 group-hover:bg-blue-700 text-white rounded-lg font-medium transition">
                        Open Album →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No albums yet
              </h2>
              <p className="text-gray-600">
                Your wedding album will appear here once it&apos;s ready.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
