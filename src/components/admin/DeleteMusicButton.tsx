'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteMusic } from '@/lib/admin-actions';
import { useRouter } from 'next/navigation';

interface DeleteMusicButtonProps {
  albumId: string;
}

export function DeleteMusicButton({ albumId }: DeleteMusicButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Delete the current background music? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteMusic(albumId);
      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      alert('Failed to delete music');
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
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-slate-600 rounded-lg transition disabled:opacity-50"
    >
      {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
      Delete
    </button>
  );
}
