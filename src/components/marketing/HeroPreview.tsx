'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const previewImages = [
  {
    src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85',
    alt: 'Couple celebrating their wedding day',
    title: 'The beginning',
  },
  {
    src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=85',
    alt: 'Bride and groom walking together',
    title: 'The walk to forever',
  },
  {
    src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=85',
    alt: 'Wedding ceremony with flowers',
    title: 'A room full of promises',
  },
  {
    src: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1400&q=85',
    alt: 'Wedding table prepared for guests',
    title: 'Every detail remembered',
  },
  {
    src: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1400&q=85',
    alt: 'Indian bride and groom during their wedding celebration',
    title: 'A celebration of two families',
  },
  {
    src: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1400&q=85',
    alt: 'Indian bride in traditional wedding attire',
    title: 'The bride, radiant',
  },
  {
    src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=85',
    alt: 'Colorful wedding ceremony details',
    title: 'Color, ritual, joy',
  },
  {
    src: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=1400&q=85',
    alt: 'Bride and groom sharing a joyful wedding moment',
    title: 'The two of you',
  },
  {
    src: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1400&q=85',
    alt: 'Indian bridal mehndi and wedding details',
    title: 'Mehndi before the vows',
  },
  {
    src: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1400&q=85',
    alt: 'Indian wedding couple sharing a portrait',
    title: 'A portrait of forever',
  },
  {
    src: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=85',
    alt: 'Colorful Indian wedding celebration',
    title: 'Under the mandap',
  },
];

export function HeroPreview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = previewImages[activeIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % previewImages.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const showPrevious = () => {
    setActiveIndex((index) => (index - 1 + previewImages.length) % previewImages.length);
  };

  const showNext = () => {
    setActiveIndex((index) => (index + 1) % previewImages.length);
  };

  return (
    <div className="relative min-h-[32rem] overflow-hidden rounded-[2rem] bg-stone-300 shadow-2xl shadow-stone-400/40">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={activeImage.src}
        src={activeImage.src}
        alt={activeImage.alt}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-transparent to-transparent" />

      <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between gap-4 text-white">
        <div>
          <p className="font-serif text-3xl italic">{activeImage.title}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/75">
            {activeIndex + 1} of {previewImages.length} previews
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={showPrevious}
            className="rounded-full border border-white/60 bg-black/20 p-2 transition hover:bg-white hover:text-stone-900"
            aria-label="Previous preview image"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={showNext}
            className="rounded-full border border-white/60 bg-black/20 p-2 transition hover:bg-white hover:text-stone-900"
            aria-label="Next preview image"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="absolute left-7 top-7 flex gap-2" aria-label="Preview image selector">
        {previewImages.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === activeIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/60 hover:bg-white'
            }`}
            aria-label={`Show preview image ${index + 1}`}
            aria-current={index === activeIndex}
          />
        ))}
      </div>
    </div>
  );
}
