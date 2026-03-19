"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Movie } from "@/lib/types";

export function SelectedMoviePanel() {
  const searchParams = useSearchParams();
  const movieId = searchParams.get("movieId");
  const [movie, setMovie] = useState<Movie | null>(null);

  useEffect(() => {
    if (!movieId) {
      setMovie(null);
      return;
    }
    try {
      const stored = sessionStorage.getItem("selectedMovie");
      if (stored) {
        const parsed: Movie = JSON.parse(stored);
        if (parsed.id.toString() === movieId) {
          setMovie(parsed);
        }
      }
    } catch {
      setMovie(null);
    }
  }, [movieId]);

  if (!movieId || !movie) return null;

  return (
    <div
      className="relative w-full h-[60vh] sm:h-[70vh] flex items-end overflow-hidden mb-12 animate-fade-in"
      style={{ animation: "fadeSlideIn 0.6s ease both" }}
    >
      {/* Background Poster Cover */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url(${movie.poster})` }}
      />

      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 w-full px-6 md:px-12 pb-12 flex flex-col sm:flex-row items-end gap-8 max-w-7xl mx-auto">
        {/* Floating Poster frame on left (Netflix style title card) */}
        <div className="hidden sm:block shrink-0 w-44 aspect-[2/3] rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-white/10">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text locks */}
        <div className="flex flex-col gap-3 min-w-0 flex-1">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 self-start bg-rose-600 px-3 py-1 rounded-md shadow-lg">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white">
              Currently Selected
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl font-black text-white leading-none tracking-tighter drop-shadow-lg">
            {movie.title}
          </h1>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mt-1">
            {movie.genres.map((g) => (
              <span
                key={g}
                className="px-3 py-1 text-[11px] font-bold tracking-wide rounded-md bg-white/15 backdrop-blur-md text-gray-200 border border-white/10"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Overview */}
          {movie.overview && (
            <p className="text-sm sm:text-base text-gray-300 font-medium leading-relaxed line-clamp-3 max-w-2xl mt-2 drop-shadow">
              {movie.overview}
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
