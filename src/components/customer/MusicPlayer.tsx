'use client';

import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface MusicPlayerProps {
  storagePath: string;
  title: string;
}

export function MusicPlayer({ storagePath, title }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const musicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/wedding-music/${storagePath}`;

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          // Autoplay might be blocked by browser
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setProgress(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 shadow-sm">
      <audio
        ref={audioRef}
        src={musicUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white">
            ♪
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{title}</p>
            <p className="text-sm text-gray-600">Wedding Music</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="flex-shrink-0 p-2 bg-white border border-purple-200 rounded-full hover:bg-purple-50 transition"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={20} className="text-purple-600" />
            ) : (
              <Play size={20} className="text-purple-600" />
            )}
          </button>

          <button
            onClick={toggleMute}
            className="flex-shrink-0 p-2 hover:bg-white/50 rounded-full transition"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX size={20} className="text-gray-500" />
            ) : (
              <Volume2 size={20} className="text-gray-600" />
            )}
          </button>

          {/* Progress Bar */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs text-gray-500 w-8 text-right">
              {formatTime(progress)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={progress}
              onChange={handleProgressChange}
              className="flex-1 h-2 bg-purple-200 rounded-full appearance-none cursor-pointer accent-purple-600"
              aria-label="Progress"
            />
            <span className="text-xs text-gray-500 w-8">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Playing indicator */}
        {isPlaying && (
          <div className="flex gap-1 items-center justify-center">
            <div className="w-1 h-2 bg-purple-500 rounded-full animate-pulse" />
            <div className="w-1 h-3 bg-purple-500 rounded-full animate-pulse delay-75" />
            <div className="w-1 h-2 bg-purple-500 rounded-full animate-pulse delay-150" />
            <p className="text-xs text-purple-600 font-medium ml-2">Now Playing</p>
          </div>
        )}
      </div>
    </div>
  );
}
