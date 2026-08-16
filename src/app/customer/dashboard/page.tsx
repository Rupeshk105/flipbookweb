import { getCurrentProfile, logout } from '@/lib/auth-actions';
import { getCustomerProfile, getCustomerAlbums } from '@/lib/customer-actions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Heart, KeyRound, LogOut, Sparkles } from 'lucide-react';

export default async function CustomerDashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'customer') {
    redirect('/auth/login');
  }

  let customer, albums;
  try {
    customer = await getCustomerProfile();
    albums = await getCustomerAlbums();
  } catch {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/40 to-stone-100">
      {/* Hero */}
      <div className="relative overflow-hidden bg-stone-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
                <Sparkles size={14} />
                Your digital keepsake
              </p>
              <h1 className="mt-3 font-serif text-4xl italic text-white sm:text-5xl">
                Your Wedding Album
              </h1>
              {customer && (
                <p className="mt-3 text-stone-300">
                  Welcome back, {customer.full_name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/customer/change-password"
                className="flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/10"
              >
                <KeyRound size={16} />
                Change Password
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-red-600/90 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-600"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {albums && albums.length > 0 ? (
          <div>
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Heart size={22} className="text-amber-500" />
              Your Albums
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album) => (
                <Link
                  key={album.id}
                  href={`/customer/album/${album.id}`}
                  className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:border-amber-300"
                >
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-stone-200 to-stone-300">
                    {album.cover_photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={album.cover_photo_url}
                        alt={album.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Heart className="text-stone-400" size={32} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
                    <p className="absolute bottom-3 left-4 font-serif text-lg italic text-white">
                      {album.bride_name} &amp; {album.groom_name}
                    </p>
                  </div>
                  <div className="p-5">
                    <h3 className="mb-1 text-lg font-semibold text-gray-900">
                      {album.title}
                    </h3>
                    <p className="mb-4 text-sm text-gray-500">
                      {new Date(album.wedding_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <div className="inline-flex items-center gap-1 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition group-hover:bg-amber-600">
                      Open Album
                      <span className="transition group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-stone-200 bg-white p-16 text-center shadow-sm">
            <Heart className="mx-auto mb-4 text-amber-400" size={40} />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              No albums yet
            </h2>
            <p className="text-gray-600">
              Your wedding album will appear here once it&apos;s ready.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

