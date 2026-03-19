"use client";

import { Movie } from "@/lib/types";
import { MovieCard } from "./MovieCard";

interface MovieGridProps {
  movies: Movie[];
  isLoading?: boolean;
  error?: Error | null;
  onSelectMovie?: (movieId: number) => void;
}

export function MovieGrid({ movies, isLoading, error, onSelectMovie }: MovieGridProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/40 border-dashed">
        <div className="text-3xl mb-3">⚠️</div>
        <p className="text-red-600 dark:text-red-400 font-bold text-lg">Failed to load movies.</p>
        <p className="text-red-500/70 dark:text-red-400/70 text-sm mt-1 font-medium">{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex gap-5 overflow-x-hidden pb-6 px-1 -mx-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="w-40 sm:w-44 shrink-0 rounded-xl overflow-hidden"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div
              className="aspect-[2/3] w-full rounded-xl bg-gray-200 dark:bg-zinc-800 relative overflow-hidden"
            >
              <div
                className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            </div>
            <div className="mt-2 space-y-1.5 px-1">
              <div className="h-2.5 w-3/4 rounded bg-gray-200 dark:bg-zinc-800 overflow-hidden relative">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent" style={{ animationDelay: `${i * 100 + 50}ms` }} />
              </div>
              <div className="h-2 w-1/2 rounded bg-gray-200 dark:bg-zinc-800 overflow-hidden relative">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent" style={{ animationDelay: `${i * 100 + 100}ms` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-zinc-800 border-dashed">
        <div className="text-3xl mb-3">🎬</div>
        <p className="text-gray-800 dark:text-gray-200 font-bold text-lg tracking-tight">No movies found.</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">Try adjusting your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide px-1 -mx-1">
      {movies.map((movie, i) => (
        <div
          key={movie.id}
          className="w-40 sm:w-44 shrink-0 snap-start"
          style={{
            animation: "fadeSlideUp 0.4s ease both",
            animationDelay: `${Math.min(i * 50, 400)}ms`,
          }}
        >
          <MovieCard
            movie={movie}
            onClick={onSelectMovie ? () => onSelectMovie(movie.id) : undefined}
          />
        </div>
      ))}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

