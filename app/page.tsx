import { Suspense } from "react";
import Link from "next/link";
import { SearchSection } from "@/components/search/SearchSection";
import { SelectedMoviePanel } from "@/components/movie/SelectedMoviePanel";
import { RecommendationSection } from "@/components/recommendation/RecommendationSection";
import { ModelToggle } from "@/components/recommendation/ModelToggle";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  const query = typeof searchParams.query === "string" ? searchParams.query : "";
  const modelParam = typeof searchParams.model === "string" ? searchParams.model : "tfidf";
  const model = modelParam === "bert" || modelParam === "tfidf" ? modelParam : "tfidf";

  return (
    <main className="min-h-screen bg-[#FCFAF3] dark:bg-[#080808] text-gray-900 dark:text-white flex flex-col items-center font-sans relative transition-colors duration-300">
      
      {/* ── Top Bar ── */}
      <div className="absolute top-4 left-6 z-50">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl">🎬</span>
          <span className="text-sm font-black tracking-tight text-gray-900 dark:text-white group-hover:text-rose-500 transition-colors">
            CineMatch
          </span>
        </Link>
      </div>
      <div className="absolute top-4 right-4 z-50 flex items-center gap-6">
        <Link 
          href="/documentation" 
          className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-rose-500 transition-colors"
        >
          Documentation
        </Link>
        <ThemeToggle />
      </div>

      {/* ── Hero Header ── */}
      <header className="w-full max-w-4xl mx-auto px-4 pt-16 pb-8 flex flex-col items-center text-center">
        {/* Playful Floating Sparkle icon setup if needed, using text instead */}
        <div className="inline-flex items-center gap-1.5 mb-2" style={{ animation: "heroFadeUp 0.6s ease both" }}>
          <span className="text-xl">✨</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-3 text-gray-950 dark:text-white font-sans" style={{ animation: "heroFadeUp 0.7s ease both" }}>
          What are you in <br className="hidden sm:block" /> the mood for?
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl font-bold max-w-2xl mb-10 flex items-center justify-center gap-2" style={{ animation: "heroFadeUp 0.8s ease both" }}>
          CineMatch will find your next watch 🎬
        </p>

        {/* Search — Expanded light pill */}
        <Suspense fallback={<div className="h-14 w-full max-w-2xl bg-zinc-900/40 animate-pulse rounded-full shadow" />}>
          <div className="w-full max-w-2xl">
            <SearchSection initialQuery={query} />
          </div>
        </Suspense>

        {/* Model Toggle */}
        <div className="flex flex-col items-center gap-2 mt-10">
          <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-[0.2em]">
            Recommendation Model
          </span>
          <Suspense fallback={<div className="h-10 w-48 bg-zinc-900/50 animate-pulse rounded-xl" />}>
            <ModelToggle />
          </Suspense>
        </div>
      </header>

      {/* ── Main Content: 3-section layout ── */}
      <div className="w-full max-w-7xl mx-auto px-4 pb-24 space-y-10">

        {/* Selected Movie Panel */}
        <Suspense fallback={null}>
          <SelectedMoviePanel />
        </Suspense>

        {/* Recommendations Section */}
        <Suspense fallback={<div className="h-64 w-full bg-white/50 animate-pulse rounded-3xl border border-gray-100" />}>
          <RecommendationSection model={model} />
        </Suspense>
      </div>
    </main>
  );
}
