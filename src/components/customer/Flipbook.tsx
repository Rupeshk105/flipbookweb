'use client';

import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import dynamic from 'next/dynamic';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

const HTMLFlipBook = dynamic(() => import('react-pageflip'), { ssr: false });

interface Photo {
  id: string;
  storage_path: string;
  signed_url?: string | null;
  caption: string | null;
  sort_order: number;
}

interface FlipbookProps {
  photos: Photo[];
  brideName: string;
  groomName: string;
  weddingDate: string;
  siteName?: string;
  contactPhone?: string;
}

interface FlipBookApi {
  pageFlip: () => {
    flipNext: (corner?: 'top' | 'bottom') => void;
    flipPrev: (corner?: 'top' | 'bottom') => void;
    flip: (page: number, corner?: 'top' | 'bottom') => void;
  };
}

const BookPage = forwardRef<HTMLDivElement, { photo?: Photo; url?: string }>(
  function BookPage({ photo, url }, ref) {
    return (
      <div ref={ref} className="h-full overflow-hidden bg-[#f6efe5] p-3 sm:p-5" data-density="soft">
        <div className="h-full min-h-0 overflow-hidden border border-stone-300/70 bg-stone-100 p-2 sm:p-3">
          {photo && url ? (
            <div className="relative h-full min-h-0 overflow-hidden bg-stone-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={photo.caption || 'Wedding album photo'}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-full min-h-0 items-center justify-center bg-stone-100">
              <p className="font-serif text-2xl italic text-stone-700">The end</p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

const BookCover = forwardRef<HTMLDivElement, { title: string; weddingDate: string; url: string }>(
  function BookCover({ title, weddingDate, url }, ref) {
    return (
      <div ref={ref} className="h-full overflow-hidden bg-stone-900 p-3" data-density="hard">
        <div className="relative flex h-full min-h-0 items-end overflow-hidden border border-amber-200/40 bg-stone-800 p-6 sm:p-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
          <div className="relative z-10 text-white">
            <p className="text-xs uppercase tracking-[0.28em] text-amber-200">
              {new Date(weddingDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <h2 className="mt-3 font-serif text-4xl italic sm:text-5xl">{title}</h2>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/70">Our story, beautifully kept</p>
          </div>
        </div>
      </div>
    );
  }
);

const BookEndPage = forwardRef<HTMLDivElement, { url: string; siteName: string; contactPhone: string }>(
  function BookEndPage({ url, siteName, contactPhone }, ref) {
    return (
      <div ref={ref} className="h-full overflow-hidden bg-stone-900 p-3" data-density="hard">
        <div className="relative flex h-full min-h-0 items-end overflow-hidden border border-amber-200/40 bg-stone-800 p-6 pb-16 sm:p-8 sm:pb-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Bride and groom exchanging garlands on a Jaymala stage" className="absolute inset-0 h-full w-full object-cover opacity-65" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
          <div className="relative z-10 text-white">
            <p className="font-serif text-3xl italic">With love, always.</p>
            <p className="mt-5 text-sm font-semibold tracking-[0.2em] text-amber-200">{siteName.toUpperCase()}</p>
            <p className="mt-2 text-xs tracking-[0.16em] text-white/80">{contactPhone}</p>
          </div>
        </div>
      </div>
    );
  }
);

export function Flipbook({ photos, brideName, groomName, weddingDate, siteName = 'Reyansh Studio', contactPhone = '8383899540' }: FlipbookProps) {
  const bookRef = useRef<FlipBookApi>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const photoUrl = (photo: Photo) =>
    photo.signed_url ||
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/wedding-photos/${photo.storage_path}`;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') bookRef.current?.pageFlip().flipNext('bottom');
      if (event.key === 'ArrowLeft') bookRef.current?.pageFlip().flipPrev('bottom');
      if (event.key === 'Escape') setIsFullscreen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!photos.length) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl bg-stone-100 text-stone-500">
        No photos available
      </div>
    );
  }

  const endPageUrl = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85';
  const pageElements = [
    <BookCover
      key="cover"
      title={`${brideName} & ${groomName}`}
      weddingDate={weddingDate}
      url={photoUrl(photos[0])}
    />,
    ...photos.map((photo) => (
      <BookPage key={photo.id} photo={photo} url={photoUrl(photo)} />
    )),
  ];

  pageElements.push(<BookEndPage key="end-page" url={endPageUrl} siteName={siteName} contactPhone={contactPhone} />);

  if (pageElements.length % 2 === 1) {
    pageElements.push(<BookPage key="back-cover" />);
  }

  const bookPages: ReactElement[] = Children.toArray(pageElements).filter(isValidElement);

  return (
    <section
      className={`relative overflow-hidden rounded-2xl bg-[#201b1a] p-4 shadow-2xl sm:p-8 ${
        isFullscreen ? 'fixed inset-0 z-50 flex flex-col rounded-none' : ''
      }`}
      aria-label={`${brideName} and ${groomName} flipbook`}
    >
      <div className="mb-4 flex items-center justify-between gap-3 text-stone-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
            Digital album
          </p>
          <p className="mt-1 text-sm text-stone-300">
            {pageIndex === 0
              ? 'Cover'
              : pageIndex > photos.length
                ? 'The end'
              : `Photo ${Math.min(pageIndex, photos.length)} of ${photos.length}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((value) => Math.max(1, value - 0.1))}
            className="rounded-full p-2 transition hover:bg-white/10 disabled:opacity-40"
            disabled={zoom <= 1}
            aria-label="Zoom out"
          >
            <ZoomOut size={18} />
          </button>
          <span className="min-w-12 text-center text-xs">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom((value) => Math.min(1.3, value + 0.1))}
            className="rounded-full p-2 transition hover:bg-white/10 disabled:opacity-40"
            disabled={zoom >= 1.3}
            aria-label="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen((value) => !value)}
            className="rounded-full p-2 transition hover:bg-white/10"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      <div className="relative mx-auto flex min-h-[min(68vh,720px)] w-full max-w-5xl items-center justify-center px-8 sm:px-14">
        <button
          type="button"
          onClick={() => bookRef.current?.pageFlip().flipPrev('bottom')}
          className="absolute left-0 z-20 rounded-full bg-white/90 p-3 text-stone-900 shadow-lg transition hover:bg-white"
          aria-label="Previous page"
        >
          <ChevronLeft size={22} />
        </button>

        <div
          className="relative w-full max-w-2xl transition-transform duration-300"
          style={{ transform: `scale(${zoom})` }}
        >
          <button
            type="button"
            onClick={() => bookRef.current?.pageFlip().flipPrev('bottom')}
            className="absolute bottom-2 left-2 z-30 h-16 w-16 cursor-pointer rounded-br-2xl bg-transparent"
            aria-label="Turn to previous page by clicking the left corner"
          />
          <HTMLFlipBook
            ref={bookRef}
            width={420}
            height={620}
            size="stretch"
            minWidth={280}
            maxWidth={560}
            minHeight={420}
            maxHeight={760}
            startPage={0}
            startZIndex={0}
            autoSize
            showCover
            drawShadow
            maxShadowOpacity={0.65}
            flippingTime={900}
            usePortrait
            mobileScrollSupport
            swipeDistance={30}
            clickEventForward
            useMouseEvents={false}
            showPageCorners
            disableFlipByClick={false}
            className="mx-auto"
            style={{}}
            onFlip={(event) => setPageIndex(Number(event.data))}
          >
            {bookPages}
          </HTMLFlipBook>
          <button
            type="button"
            onClick={() => bookRef.current?.pageFlip().flipNext('bottom')}
            className="absolute bottom-2 right-2 z-30 h-16 w-16 cursor-pointer rounded-bl-2xl bg-transparent"
            aria-label="Turn to next page by clicking the right corner"
          />
        </div>

        <button
          type="button"
          onClick={() => bookRef.current?.pageFlip().flipNext('bottom')}
          className="absolute right-0 z-20 rounded-full bg-white/90 p-3 text-stone-900 shadow-lg transition hover:bg-white"
          aria-label="Next page"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {photos.map((photo, index) => (
          <button
            type="button"
            key={photo.id}
            onClick={() => bookRef.current?.pageFlip().flip(index + 1, 'bottom')}
            className={`h-14 w-11 shrink-0 overflow-hidden rounded border-2 transition sm:h-16 sm:w-12 ${
              index + 1 === pageIndex
                ? 'border-amber-300'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            aria-label={`Open photo ${index + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl(photo)} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      <p className="mt-3 text-center text-xs text-stone-400">
        Use the arrows, thumbnails, or keyboard arrow keys to turn pages
      </p>
    </section>
  );
}
