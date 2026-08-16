'use client';

import { useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import { resetCustomerPassword } from '@/lib/admin-actions';

interface ResetPasswordButtonProps {
  customerId: string;
  customerName: string;
}

export function ResetPasswordButton({ customerId, customerName }: ResetPasswordButtonProps) {
  const [isResetting, setIsResetting] = useState(false);

  async function handleReset() {
    if (!confirm(`Reset ${customerName}'s password to the default password?`)) {
      return;
    }

    setIsResetting(true);
    try {
      const result = await resetCustomerPassword(customerId);
      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        alert(`Password reset. Default password: ${result.password}`);
      }
    } catch (error) {
      alert('Failed to reset password');
      console.error(error);
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleReset}
      disabled={isResetting}
      className="p-2 hover:bg-slate-700 rounded-lg transition text-amber-400 hover:text-amber-300 disabled:opacity-50"
      aria-label="Reset password"
      title="Reset password to default"
    >
      {isResetting ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
    </button>
  );
}
