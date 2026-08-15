'use client';

import { useEffect, useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface MusicPlayerProps {
  storagePath: string;
  url?: string | null;
  title: string;
}

export function MusicPlayer({ storagePath, url, title }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const musicUrl = url || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/wedding-music/${storagePath}`;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [musicUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="w-full rounded-xl border border-stone-700 bg-stone-900 p-5 text-stone-100 shadow-lg">
      <audio
        ref={audioRef}
        src={musicUrl}
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-200 text-xl text-stone-900">
            ♪
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate font-semibold text-white">{title}</p>
            <p className="text-sm text-stone-400">Background music</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 border-t border-stone-700 pt-4">
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-200 transition hover:bg-amber-100"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={20} className="text-stone-900" />
            ) : (
              <Play size={20} className="text-stone-900" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-600 transition hover:bg-stone-800"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX size={20} className="text-stone-300" />
            ) : (
              <Volume2 size={20} className="text-stone-300" />
            )}
          </button>
          <span className="text-sm text-stone-400">
            {isPlaying ? 'Playing' : 'Ready to play'}
          </span>
        </div>

        {/* Playing indicator */}
        {isPlaying && (
          <div className="flex gap-1 items-center justify-center">
            <div className="h-2 w-1 rounded-full bg-amber-300 animate-pulse" />
            <div className="h-3 w-1 rounded-full bg-amber-300 animate-pulse delay-75" />
            <div className="h-2 w-1 rounded-full bg-amber-300 animate-pulse delay-150" />
            <p className="ml-2 text-xs font-medium text-amber-200">Now Playing</p>
          </div>
        )}
      </div>
    </div>
  );
}
