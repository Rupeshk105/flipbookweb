'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface Photo {
  id: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
}

interface PhotoGalleryProps {
  photos: Photo[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentPhoto = photos[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
      }
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photos.length]);

  if (!photos.length) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No photos available</p>
      </div>
    );
  }

  const photoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/wedding-photos/${currentPhoto.storage_path}`;

  return (
    <div className="space-y-6">
      {/* Main Photo Display */}
      <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden">
        <div className="aspect-video relative bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt={`Photo ${currentIndex + 1}`}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full text-gray-900 transition shadow-lg"
          aria-label="Previous photo"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full text-gray-900 transition shadow-lg"
          aria-label="Next photo"
        >
          <ChevronRight size={24} />
        </button>

        {/* Photo Counter */}
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
          {currentIndex + 1} / {photos.length}
        </div>

        {/* Fullscreen Button */}
        <a
          href={photoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full text-gray-900 transition shadow-lg"
          aria-label="Open in fullscreen"
        >
          <Maximize2 size={24} />
        </a>
      </div>

      {/* Photo Info */}
      {currentPhoto.caption && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-700 italic">{currentPhoto.caption}</p>
        </div>
      )}

      {/* Thumbnail Strip */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {photos.map((photo, idx) => (
          <button
            key={photo.id}
            onClick={() => setCurrentIndex(idx)}
            className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition ${
              idx === currentIndex
                ? 'border-blue-600 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            aria-label={`View photo ${idx + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/wedding-photos/${photo.storage_path}`}
              alt={`Thumbnail ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Keyboard Help */}
      <p className="text-sm text-gray-500 text-center">
        ← → Arrow keys to navigate | Click thumbnails to jump
      </p>
    </div>
  );
}
