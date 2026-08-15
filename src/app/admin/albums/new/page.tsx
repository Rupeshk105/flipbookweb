import { getCurrentProfile } from '@/lib/auth-actions';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { AlbumForm } from '@/components/admin/AlbumForm';

export default async function NewAlbumPage() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'admin') {
    redirect('/admin/login');
  }

  const supabase = await createClient();

  const { data: customers } = await supabase
    .from('customers')
    .select('id, full_name')
    .order('full_name');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Album</h1>
        <p className="text-slate-400">Create a new wedding album for a customer</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 max-w-2xl">
        <AlbumForm customers={customers || []} />
      </div>
    </div>
  );
}
