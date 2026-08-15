import { LoginForm } from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wedding Flipbook - Admin Login',
  description: 'Admin sign in',
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-white mb-2">
            Wedding Flipbook
          </h1>
          <p className="text-slate-300">Admin Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-8">
          <LoginForm mode="admin" />

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-center text-sm text-slate-400">
              Customer account?{' '}
              <a
                href="/auth/login"
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Customer Sign In
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>Secure admin access</p>
        </div>
      </div>
    </div>
  );
}
