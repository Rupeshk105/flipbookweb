import { getCurrentProfile } from '@/lib/auth-actions';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit2 } from 'lucide-react';
import { DeleteCustomerButton } from '@/components/admin/DeleteCustomerButton';

export default async function CustomersPage() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'admin') {
    redirect('/admin/login');
  }

  const supabase = await createClient();

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Customers</h1>
          <p className="text-slate-400">Manage wedding couples</p>
        </div>
        <Link
          href="/admin/customers/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
        >
          <Plus size={20} />
          Add Customer
        </Link>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        {customers && customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  <th className="text-left text-slate-400 py-4 px-6 font-medium">
                    Name
                  </th>
                  <th className="text-left text-slate-400 py-4 px-6 font-medium">
                    Email
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
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition">
                    <td className="py-4 px-6 text-white">
                      <div>
                        <p className="font-medium">{customer.full_name}</p>
                        <p className="text-sm text-slate-400">
                          {customer.bride_name} &amp; {customer.groom_name}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-300">{customer.email}</td>
                    <td className="py-4 px-6 text-slate-300">
                      {new Date(customer.wedding_date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        customer.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : customer.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/customers/${customer.id}/edit`}
                          className="p-2 hover:bg-slate-700 rounded-lg transition text-blue-400 hover:text-blue-300"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <DeleteCustomerButton
                          customerId={customer.id}
                          customerName={customer.full_name}
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
            <p className="text-slate-400 mb-4">No customers yet</p>
            <Link
              href="/admin/customers/new"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Create your first customer
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
