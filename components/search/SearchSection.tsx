"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";
import { useSearch } from "@/lib/hooks";
import { SearchBar } from "./SearchBar";
import { Movie } from "@/lib/types";

export function SearchSection({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [inputValue, setInputValue] = useState(initialQuery);
  const [debouncedValue] = useDebounce(inputValue, 300);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasSelectedMovie = searchParams.has("movieId");
  const selectedTitle = searchParams.get("selectedTitle") || "";

  const { data: searchResults, isLoading } = useSearch(debouncedValue);

  // Open dropdown when typing and no movie selected yet
  useEffect(() => {
    if (debouncedValue && !hasSelectedMovie && (searchResults?.length ?? 0) > 0) {
      setDropdownOpen(true);
    } else {
      setDropdownOpen(false);
    }
  }, [debouncedValue, searchResults, hasSelectedMovie]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pickMovie = (movie: Movie) => {
    setInputValue(movie.title);
    setDropdownOpen(false);
    try {
      sessionStorage.setItem("selectedMovie", JSON.stringify(movie));
    } catch {}
    const params = new URLSearchParams();
    params.set("movieId", movie.id.toString());
    params.set("selectedTitle", movie.title);
    if (searchParams.get("model")) params.set("model", searchParams.get("model")!);
    router.push(`?${params.toString()}`, { scroll: false });
    
    // Smooth scroll down to details
    setTimeout(() => {
      document.getElementById("recommendations-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 250);
  };

  const handleInputChange = (val: string) => {
    setInputValue(val);
    if (hasSelectedMovie) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("movieId");
      params.delete("selectedTitle");
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  };

  const clearSelection = () => {
    setInputValue("");
    try {
      sessionStorage.removeItem("selectedMovie");
    } catch {}
    const params = new URLSearchParams(searchParams.toString());
    params.delete("movieId");
    params.delete("selectedTitle");
    params.delete("query");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full">
      {/* ── Search Input + Dropdown ── */}
      <div ref={containerRef} className="w-full max-w-xl mx-auto relative z-20">
        <SearchBar value={inputValue} onChange={handleInputChange} />

        {/* Dropdown Results */}
        {dropdownOpen && searchResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-zinc-900/95 backdrop-blur-md rounded-xl border border-zinc-800 shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden">
            {isLoading && (
              <div className="flex items-center gap-3 px-5 py-4 text-gray-400 text-sm font-medium">
                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                Searching…
              </div>
            )}
            {searchResults.map((movie, idx) => (
              <button
                key={movie.id}
                onClick={() => pickMovie(movie)}
                className={`w-full text-left flex items-center gap-4 px-5 py-4 hover:bg-zinc-800/80 transition-colors group ${
                  idx < searchResults.length - 1 ? "border-b border-zinc-800/50" : ""
                }`}
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-10 h-14 object-cover rounded-md shrink-0 bg-zinc-800 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate group-hover:text-rose-500 transition-colors tracking-tight">
                    {movie.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5 font-medium">
                    {movie.genres.slice(0, 3).join(" · ")}
                  </p>
                </div>
                <span className="text-xs font-bold text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  Select →
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Selected Movie Quick Badge ── */}
      {/* Intentionally hidden since Hero component loads full display */}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
