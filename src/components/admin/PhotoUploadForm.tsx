'use client';

import { useState, useRef } from 'react';
import { createPhotoRecord, getAlbumUploadInfo } from '@/lib/admin-actions';
import { createClient } from '@/lib/supabase-client';
import { AlertCircle, Loader2, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PhotoUploadFormProps {
  albumId: string;
}

export function PhotoUploadForm({ albumId }: PhotoUploadFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files || []);
    
    // Validate file types
    const validFiles = newFiles.filter(file => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError(`${file.name} is not a valid image format`);
        return false;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB
        setError(`${file.name} is too large (max 50MB)`);
        return false;
      }
      return true;
    });

    setFiles([...files, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeFile(index: number) {
    setFiles(files.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (files.length === 0) {
      setError('Please select at least one photo');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { customerId } = await getAlbumUploadInfo(albumId);
      const supabase = createClient();

      for (const [index, file] of files.entries()) {
        const fileName = `${Date.now()}-${file.name}`;
        const storagePath = `${customerId}/${albumId}/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('wedding-photos')
          .upload(storagePath, file);

        if (uploadError) {
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        await createPhotoRecord(
          albumId,
          storagePath,
          file.name.replace(/\.[^/]*$/, ''),
          index
        );
      }

      setFiles([]);
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
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

      <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition cursor-pointer"
           onClick={() => fileInputRef.current?.click()}>
        <Upload className="mx-auto mb-2 text-slate-400" size={32} />
        <p className="text-white font-medium mb-1">Click to upload photos</p>
        <p className="text-slate-400 text-sm">or drag and drop</p>
        <p className="text-slate-500 text-xs mt-2">PNG, JPG, WebP up to 50MB</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-white font-medium">Selected files: {files.length}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 p-1 bg-red-600 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || files.length === 0}
        className="w-full py-2 px-4 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload size={18} />
            Upload {files.length} Photo{files.length !== 1 ? 's' : ''}
          </>
        )}
      </button>
    </form>
  );
}
