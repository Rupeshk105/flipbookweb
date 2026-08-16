import { getCurrentProfile } from '@/lib/auth-actions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ChangePasswordForm } from '@/components/customer/ChangePasswordForm';

export default async function ChangePasswordPage() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'customer') {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            href="/customer/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Change Password</h1>
          <p className="text-gray-600">Update the password for your account</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
