'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { updateAppSettings } from '@/lib/admin-actions';

interface SettingsFormProps {
  initialData: {
    site_name: string;
    contact_phone: string;
    default_customer_password: string;
  };
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const [siteName, setSiteName] = useState(initialData.site_name);
  const [contactPhone, setContactPhone] = useState(initialData.contact_phone);
  const [defaultCustomerPassword, setDefaultCustomerPassword] = useState(
    initialData.default_customer_password
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    const result = await updateAppSettings({
      siteName,
      contactPhone,
      defaultCustomerPassword,
    });

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-red-500/20 p-4 text-red-400 border border-red-500/30">
          <AlertCircle size={20} className="flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-lg bg-green-500/20 p-4 text-green-400 border border-green-500/30">
          <CheckCircle size={20} className="flex-shrink-0" />
          <p className="text-sm">Settings saved</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-white mb-2">Site Name</label>
        <input
          value={siteName}
          onChange={(event) => setSiteName(event.target.value)}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-slate-400">Shown on the album&apos;s closing page.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Contact Phone</label>
        <input
          value={contactPhone}
          onChange={(event) => setContactPhone(event.target.value)}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Default Customer Password
        </label>
        <input
          value={defaultCustomerPassword}
          onChange={(event) => setDefaultCustomerPassword(event.target.value)}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-slate-400">
          Used when resetting a customer&apos;s password from the Customers page.
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="py-2 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Saving...
          </>
        ) : (
          'Save Settings'
        )}
      </button>
    </form>
  );
}
