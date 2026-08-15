import { getCurrentProfile } from '@/lib/auth-actions';
import { redirect } from 'next/navigation';
import { CustomerForm } from '@/components/admin/CustomerForm';

export default async function NewCustomerPage() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'admin') {
    redirect('/admin/login');
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Customer</h1>
        <p className="text-slate-400">Add a new wedding couple</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 max-w-2xl">
        <CustomerForm />
      </div>
    </div>
  );
}
