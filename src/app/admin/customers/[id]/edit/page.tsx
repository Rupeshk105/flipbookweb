import { getCurrentProfile } from '@/lib/auth-actions';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { CustomerForm } from '@/components/admin/CustomerForm';

interface Params {
  id: string;
}

export default async function EditCustomerPage({ params }: { params: Promise<Params> }) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'admin') {
    redirect('/admin/login');
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !customer) {
    redirect('/admin/customers');
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Edit Customer</h1>
        <p className="text-slate-400">Update customer information</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 max-w-2xl">
        <CustomerForm
          initialData={{
            id: customer.id,
            full_name: customer.full_name,
            email: customer.email,
          }}
        />
      </div>
    </div>
  );
}
