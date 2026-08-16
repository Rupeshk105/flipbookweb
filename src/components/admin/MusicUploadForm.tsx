'use client';

import { useState, useRef } from 'react';
import { createMusicRecord, getAlbumUploadInfo } from '@/lib/admin-actions';
import { createClient } from '@/lib/supabase-client';
import { AlertCircle, Loader2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MusicUploadFormProps {
  albumId: string;
}

export function MusicUploadForm({ albumId }: MusicUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    // Validate file type
    if (![
      'audio/mpeg',
      'audio/wav',
      'audio/x-wav',
      'audio/ogg',
      'audio/mp4',
      'audio/x-m4a',
      'audio/aac',
    ].includes(selectedFile.type)) {
      setError('Invalid audio format. Please use MP3, WAV, OGG, or M4A');
      return;
    }

    // Validate file size (100MB)
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError('File is too large (max 100MB)');
      return;
    }

    setFile(selectedFile);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!file) {
      setError('Please select a music file');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title for the music');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { customerId } = await getAlbumUploadInfo(albumId);
      const supabase = createClient();

      const { data: existingMusic, error: existingMusicError } = await supabase
        .from('album_music')
        .select('storage_path')
        .eq('album_id', albumId)
        .maybeSingle();

      if (existingMusicError) {
        console.error('Failed to fetch existing music record:', existingMusicError);
      }

      if (existingMusic?.storage_path) {
        await supabase.storage.from('wedding-music').remove([existingMusic.storage_path]);
        await supabase.from('album_music').delete().eq('album_id', albumId);
      }

      const fileName = `${Date.now()}-${file.name}`;
      const storagePath = `${customerId}/${albumId}/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('wedding-music')
        .upload(storagePath, file);

      if (uploadError) {
        const message = uploadError.message || 'Storage upload failed';

        if (message.includes('bucket') || message.includes('policy') || message.includes('Unauthorized')) {
          throw new Error(
            'Supabase storage is not configured correctly for music uploads. Check that the wedding-music bucket exists and the admin upload policy is enabled.'
          );
        }

        throw new Error(`Failed to upload music: ${message}`);
      }

      await createMusicRecord(albumId, storagePath, title);
      setFile(null);
      setTitle('');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      console.error('Music upload failed:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-red-500/20 p-4 text-red-400 border border-red-500/30">
          <AlertCircle size={20} className="flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Music Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Our First Dance"
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition cursor-pointer"
           onClick={() => fileInputRef.current?.click()}>
        <Upload className="mx-auto mb-2 text-slate-400" size={32} />
        <p className="text-white font-medium mb-1">Click to upload music</p>
        <p className="text-slate-400 text-sm">or drag and drop</p>
        <p className="text-slate-500 text-xs mt-2">MP3, WAV, OGG, M4A up to 100MB</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4"
        onChange={handleFileChange}
        className="hidden"
      />

      {file && (
        <div className="p-4 bg-slate-700 rounded-lg">
          <p className="text-white font-medium mb-1">Selected:</p>
          <p className="text-slate-300 text-sm">{file.name}</p>
          <p className="text-slate-400 text-xs mt-1">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !file}
        className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload size={18} />
            Upload Music
          </>
        )}
      </button>
    </form>
  );
}
