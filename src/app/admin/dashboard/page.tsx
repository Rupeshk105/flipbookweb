import { getCurrentProfile } from '@/lib/auth-actions';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, Album, Images, TrendingUp } from 'lucide-react';

export default async function AdminDashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'admin') {
    redirect('/admin/login');
  }

  const supabase = await createClient();

  // Get statistics
  const { count: totalCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true });

  const { count: totalAlbums } = await supabase
    .from('albums')
    .select('*', { count: 'exact', head: true });

  const { count: publishedAlbums } = await supabase
    .from('albums')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  const { count: totalPhotos } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true });

  // Get recent customers
  const { data: recentCustomers } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Welcome back, {profile.full_name || profile.email}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total Customers</p>
              <p className="text-3xl font-bold text-white">{totalCustomers || 0}</p>
            </div>
            <Users className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total Albums</p>
              <p className="text-3xl font-bold text-white">{totalAlbums || 0}</p>
            </div>
            <Album className="text-purple-500" size={32} />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Published Albums</p>
              <p className="text-3xl font-bold text-white">{publishedAlbums || 0}</p>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total Photos</p>
              <p className="text-3xl font-bold text-white">{totalPhotos || 0}</p>
            </div>
            <Images className="text-pink-500" size={32} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/admin/customers/new"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6 font-medium transition"
        >
          + Add New Customer
        </Link>
        <Link
          href="/admin/albums/new"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-6 font-medium transition"
        >
          + Create Album
        </Link>
        <Link
          href="/admin/photos"
          className="bg-pink-600 hover:bg-pink-700 text-white rounded-lg p-6 font-medium transition"
        >
          Upload Photos
        </Link>
      </div>

      {/* Recent Customers */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Customers</h2>
        {recentCustomers && recentCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 py-3 px-4 font-medium">
                    Name
                  </th>
                  <th className="text-left text-slate-400 py-3 px-4 font-medium">
                    Wedding Date
                  </th>
                  <th className="text-left text-slate-400 py-3 px-4 font-medium">
                    Status
                  </th>
                  <th className="text-left text-slate-400 py-3 px-4 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-slate-700/50">
                    <td className="py-3 px-4 text-white">{customer.full_name}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-slate-700 text-slate-200">
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400">No customers yet. Create your first customer!</p>
        )}
      </div>
    </div>
  );
}
