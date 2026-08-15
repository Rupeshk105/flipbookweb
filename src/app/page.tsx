import Link from 'next/link';
import { HeroPreview } from '@/components/marketing/HeroPreview';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f3ee] text-stone-900">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="font-serif text-2xl italic tracking-tight">
          Wedding Flipbook
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-stone-600">
          <Link href="/#experience" className="hidden transition hover:text-stone-900 sm:block">
            The experience
          </Link>
          <Link href="/auth/login" className="transition hover:text-rose-700">
            Client login
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10 lg:pb-28 lg:pt-16">
        <div className="max-w-xl">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-rose-700">
            A private place for your forever
          </p>
          <h1 className="font-serif text-5xl leading-[0.98] tracking-tight text-stone-950 sm:text-7xl">
            Turn the moments into a story you can hold.
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-stone-600">
            A beautiful digital wedding album for the people who made your day unforgettable. Open it anywhere, revisit it often.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/login"
              className="rounded-full bg-stone-950 px-7 py-3 text-center text-sm font-semibold text-white transition hover:bg-rose-800"
            >
              Open your album
            </Link>
            <Link
              href="/admin/login"
              className="rounded-full border border-stone-300 px-7 py-3 text-center text-sm font-semibold text-stone-700 transition hover:border-stone-500"
            >
              Admin sign in
            </Link>
          </div>
          <p className="mt-5 text-xs uppercase tracking-[0.18em] text-stone-500">
            Private by design · Yours forever
          </p>
        </div>

        <HeroPreview />
      </section>

      <section id="experience" className="scroll-mt-8 border-y border-stone-200 bg-[#efe8df]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:grid-cols-3 lg:px-10 lg:py-20">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-rose-700">01 · Open</p>
            <h2 className="font-serif text-2xl italic">A page-turning ritual</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">Move through your memories like a real album, with room for every little detail.</p>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-rose-700">02 · Listen</p>
            <h2 className="font-serif text-2xl italic">Your song in the room</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">Pair the photographs with the music that takes you straight back to the dance floor.</p>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-rose-700">03 · Keep</p>
            <h2 className="font-serif text-2xl italic">Made private for you</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">Your album is protected behind your account, ready whenever you want to return.</p>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <p>Wedding Flipbook · Made for the moments after “I do.”</p>
        <Link href="/auth/reset-password" className="transition hover:text-stone-900">Account help</Link>
      </footer>
    </main>
  );
}
