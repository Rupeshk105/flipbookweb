'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteCustomer } from '@/lib/admin-actions';
import { useRouter } from 'next/navigation';

interface DeleteCustomerButtonProps {
  customerId: string;
  customerName: string;
}

export function DeleteCustomerButton({ customerId, customerName }: DeleteCustomerButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${customerName}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteCustomer(customerId);
      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      alert('Failed to delete customer');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 hover:bg-slate-700 rounded-lg transition text-red-400 hover:text-red-300 disabled:opacity-50"
    >
      {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
    </button>
  );
}
