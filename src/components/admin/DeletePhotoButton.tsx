'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deletePhoto } from '@/lib/admin-actions';
import { useRouter } from 'next/navigation';

interface DeletePhotoButtonProps {
  photoId: string;
}

export function DeletePhotoButton({ photoId }: DeletePhotoButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Delete this photo? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deletePhoto(photoId);
      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      alert('Failed to delete photo');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="absolute top-1 right-1 rounded-full bg-black/60 p-1.5 text-red-300 transition hover:bg-black/80 hover:text-red-200 disabled:opacity-50"
      aria-label="Delete photo"
    >
      {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
    </button>
  );
}
