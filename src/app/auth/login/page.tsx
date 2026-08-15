import { LoginForm } from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wedding Flipbook - Customer Login',
  description: 'Sign in to view your wedding album',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Wedding Flipbook
          </h1>
          <p className="text-gray-600">Sign in to your wedding album</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <LoginForm mode="customer" />

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Are you an admin?{' '}
              <a
                href="/admin/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Admin Sign In
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Secure login with end-to-end encryption</p>
        </div>
      </div>
    </div>
  );
}
