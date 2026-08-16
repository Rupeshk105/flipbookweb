'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { updatePassword } from '@/lib/auth-actions';

export function ChangePasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const result = await updatePassword(password);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    setPassword('');
    setConfirmPassword('');
    router.refresh();
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle className="mx-auto text-green-600" size={40} />
        <h2 className="text-lg font-semibold text-gray-900">Password updated</h2>
        <p className="text-sm text-gray-600">Your password has been changed successfully.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
          <AlertCircle size={20} className="flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <input
          id="new-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm New Password
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Updating...
          </>
        ) : (
          'Update Password'
        )}
      </button>
    </form>
  );
}
