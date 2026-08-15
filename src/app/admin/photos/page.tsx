import { getCurrentProfile } from '@/lib/auth-actions';
import { redirect } from 'next/navigation';

export default async function PhotosPage() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'admin') {
    redirect('/admin/login');
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Photos</h1>
        <p className="text-slate-400">Manage all album photos</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
        <p className="text-slate-400">
          To upload photos, go to an album and use the photo upload form.
        </p>
      </div>
    </div>
  );
}
