'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [error, setError] = useState<string | null>(null);

  const musicUrl = url || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/wedding-music/${storagePath}`;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.play()
      .then(() => {
        setIsPlaying(true);
        setError(null);
      })
      .catch(() => {
        // Browsers block unmuted autoplay without user interaction; wait for a click on play.
        setIsPlaying(false);
      });
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      return;
    }

    audioRef.current.play()
      .then(() => {
        setIsPlaying(true);
        setError(null);
      })
      .catch(() => {
        setIsPlaying(false);
        setError('Playback was blocked by the browser. Click play again to start the music.');
      });
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-stone-700 bg-stone-900 px-4 py-2 text-stone-100 shadow-lg">
      <audio
        ref={audioRef}
        src={musicUrl}
        preload="auto"
        onPlay={() => {
          setIsPlaying(true);
          setError(null);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => setError('This music file could not be loaded. Please check the uploaded file or refresh the album.')}
      />

      <button
        type="button"
        onClick={togglePlay}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-200 transition hover:bg-amber-100"
        aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}
        title={title}
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

      {error && (
        <span className="text-xs text-amber-300">{error}</span>
      )}
    </div>
  );
}
