'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAlbumSchema } from '@/lib/schemas';
import { createAlbum, updateAlbum } from '@/lib/admin-actions';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { z } from 'zod';
import type { Database } from '@/types/supabase';

type AlbumFormData = z.infer<typeof createAlbumSchema>;

interface AlbumFormProps {
  customerId?: string;
  customers: Array<{ id: string; full_name: string }>;
  initialData?: Database['public']['Tables']['albums']['Row'] & {
    customers?: { full_name: string };
  };
  onSuccess?: () => void;
}

export function AlbumForm({ customerId, customers, initialData, onSuccess }: AlbumFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublished, setIsPublished] = useState(initialData?.is_published ?? false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AlbumFormData>({
    resolver: zodResolver(createAlbumSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      bride_name: initialData.bride_name,
      groom_name: initialData.groom_name,
      wedding_date: initialData.wedding_date,
      description: initialData.description ?? undefined,
    } : undefined,
  });

  async function onSubmit(data: AlbumFormData) {
    setIsLoading(true);
    setError(null);

    try {
      let result;
      if (initialData) {
        result = await updateAlbum(initialData.id, {
          title: data.title,
          description: data.description,
          isPublished,
        });
      } else {
        result = await createAlbum({
          customerId: customerId || '',
          title: data.title,
          brideName: data.bride_name,
          groomName: data.groom_name,
          weddingDate: data.wedding_date,
          description: data.description,
        });
      }

      if (result.error) {
        setError(result.error);
      } else {
        onSuccess?.();
        router.push('/admin/albums');
        router.refresh();
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error(error);
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

      {!initialData && (
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Customer *
          </label>
          <select
            value={customerId}
            onChange={() => {
              // This is a parent component state, not ideal but works for now
            }}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Album Title *
        </label>
        <input
          {...register('title')}
          type="text"
          placeholder="Our Wedding Day"
          className={`w-full px-4 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-0 transition ${
            errors.title ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-blue-500'
          }`}
          disabled={isLoading}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
        )}
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

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Description
        </label>
        <textarea
          {...register('description')}
          placeholder="Add details about the wedding..."
          rows={4}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      {initialData && (
        <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg">
          <input
            type="checkbox"
            id="isPublished"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <label htmlFor="isPublished" className="text-white font-medium">
            Publish album (make visible to customers)
          </label>
        </div>
      )}

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
            initialData ? 'Update Album' : 'Create Album'
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/albums')}
          className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
