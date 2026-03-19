"use client";

import { Movie } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";

interface MovieCardProps {
  movie: Movie;
  onClick?: () => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCardClick = () => {
    if (onClick) onClick();
    try {
      sessionStorage.setItem("selectedMovie", JSON.stringify(movie));
    } catch {}
    const params = new URLSearchParams(searchParams.toString());
    params.set("movieId", movie.id.toString());
    params.set("selectedTitle", movie.title);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative rounded-xl bg-white dark:bg-zinc-900 overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-lg dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.08)] hover:border-gray-200 dark:hover:border-zinc-700 transition-all duration-500 ease-out transform hover:scale-105 flex flex-col h-full cursor-pointer"
    >
      <div className="relative justify-center items-center aspect-[2/3] w-full overflow-hidden bg-gray-50 dark:bg-zinc-950 shrink-0">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />
        {/* Cinematic dark bottom overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/40 to-transparent opacity-100 transition-opacity duration-300" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col justify-end z-10">
        <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 group-hover:text-rose-500 transition-colors drop-shadow-md tracking-tight leading-tight">
          {movie.title}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {movie.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="px-2 py-0.5 text-[9px] font-black tracking-wider uppercase bg-white/10 backdrop-blur-md text-gray-300 rounded-md border border-white/5"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
