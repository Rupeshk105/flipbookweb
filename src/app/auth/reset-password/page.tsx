'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resetPassword } from '@/lib/auth-actions';
import { createClient } from '@/lib/supabase-client';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    supabase.auth.getSession().then(({ data: sessionData }) => {
      if (sessionData.session) setIsRecovery(true);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(data: ResetPasswordFormData) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await resetPassword(data.email);

      if (result.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function onUpdatePassword(event: React.FormEvent) {
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
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else {
      setPasswordUpdated(true);
      await supabase.auth.signOut();
      setTimeout(() => router.push('/auth/login'), 1200);
    }

    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600">Enter your email to receive a password reset link</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {isRecovery ? (
            <form onSubmit={onUpdatePassword} className="space-y-4">
              {error && (
                <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
                  <AlertCircle size={20} className="flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              {passwordUpdated ? (
                <div className="space-y-4 text-center">
                  <CheckCircle className="mx-auto text-green-600" size={40} />
                  <h2 className="text-lg font-semibold text-gray-900">Password updated</h2>
                  <p className="text-sm text-gray-600">Redirecting you to login...</p>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-gray-900">Create a new password</h2>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="New password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    disabled={isLoading}
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </>
              )}
            </form>
          ) : submitted ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <h2 className="text-center text-lg font-semibold text-gray-900">
                Check your email
              </h2>
              <p className="text-center text-gray-600 text-sm">
                We&apos;ve sent a password reset link to your email address. 
                Click the link in the email to create a new password.
              </p>
              <a
                href="/auth/login"
                className="block text-center text-blue-600 hover:text-blue-700 font-medium text-sm mt-6"
              >
                Back to login
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
                  <AlertCircle size={20} className="flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition ${
                    errors.email
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <p className="text-center text-sm text-gray-600">
                <a
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Back to login
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
