'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCustomerSchema } from '@/lib/schemas';
import { createCustomer, updateCustomer } from '@/lib/admin-actions';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { z } from 'zod';

type CustomerFormData = z.infer<typeof createCustomerSchema>;

interface CustomerFormProps {
  initialData?: {
    id: string;
    full_name: string;
    email: string;
    bride_name: string;
    groom_name: string;
    wedding_date: string;
  };
  onSuccess?: () => void;
}

export function CustomerForm({ initialData, onSuccess }: CustomerFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: initialData ? {
      full_name: initialData.full_name,
      email: initialData.email,
      bride_name: initialData.bride_name,
      groom_name: initialData.groom_name,
      wedding_date: initialData.wedding_date,
    } : undefined,
  });

  async function onSubmit(data: CustomerFormData) {
    setIsLoading(true);
    setError(null);

    try {
      let result;
      if (initialData) {
        result = await updateCustomer(initialData.id, {
          fullName: data.full_name,
          email: data.email,
          brideName: data.bride_name,
          groomName: data.groom_name,
          weddingDate: data.wedding_date,
        });
      } else {
        result = await createCustomer({
          fullName: data.full_name,
          email: data.email,
          brideName: data.bride_name,
          groomName: data.groom_name,
          weddingDate: data.wedding_date,
        });
      }

      if (result.error) {
        setError(result.error);
      } else {
        onSuccess?.();
        router.push('/admin/customers');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-red-500/20 p-4 text-red-400 border border-red-500/30">
          <AlertCircle size={20} className="flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Full Name *
          </label>
          <input
            {...register('full_name')}
            type="text"
            placeholder="John Doe"
            className={`w-full px-4 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-0 transition ${
              errors.full_name ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-blue-500'
            }`}
            disabled={isLoading}
          />
          {errors.full_name && (
            <p className="mt-1 text-sm text-red-400">{errors.full_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Email *
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="john@example.com"
            className={`w-full px-4 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-0 transition ${
              errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-blue-500'
            }`}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Bride Name *
          </label>
          <input
            {...register('bride_name')}
            type="text"
            placeholder="Jane Doe"
            className={`w-full px-4 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-0 transition ${
              errors.bride_name ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-blue-500'
            }`}
            disabled={isLoading}
          />
          {errors.bride_name && (
            <p className="mt-1 text-sm text-red-400">{errors.bride_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Groom Name *
          </label>
          <input
            {...register('groom_name')}
            type="text"
            placeholder="John Smith"
            className={`w-full px-4 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-0 transition ${
              errors.groom_name ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-blue-500'
            }`}
            disabled={isLoading}
          />
          {errors.groom_name && (
            <p className="mt-1 text-sm text-red-400">{errors.groom_name.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Wedding Date *
        </label>
        <input
          {...register('wedding_date')}
          type="date"
          className={`w-full px-4 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-0 transition ${
            errors.wedding_date ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-blue-500'
          }`}
          disabled={isLoading}
        />
        {errors.wedding_date && (
          <p className="mt-1 text-sm text-red-400">{errors.wedding_date.message}</p>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Saving...
            </>
          ) : (
            initialData ? 'Update Customer' : 'Create Customer'
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/customers')}
          className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
