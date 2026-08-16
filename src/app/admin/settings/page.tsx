import { getCurrentProfile } from '@/lib/auth-actions';
import { getAppSettings } from '@/lib/admin-actions';
import { redirect } from 'next/navigation';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { ChangePasswordForm } from '@/components/customer/ChangePasswordForm';

export default async function SettingsPage() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'admin') {
    redirect('/admin/login');
  }

  const settings = await getAppSettings();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your admin account and site configuration</p>
      </div>

      <div className="space-y-8 max-w-2xl">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <h2 className="text-xl font-bold text-white mb-2">Admin Account</h2>
          <p className="text-slate-400 text-sm mb-6">{profile.email}</p>
          <ChangePasswordForm />
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <h2 className="text-xl font-bold text-white mb-6">Site Settings</h2>
          <SettingsForm
            initialData={{
              site_name: settings.site_name,
              contact_phone: settings.contact_phone,
              default_customer_password: settings.default_customer_password,
            }}
          />
        </div>
      </div>
    </div>
  );
}
