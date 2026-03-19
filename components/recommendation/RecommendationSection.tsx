"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRecommendations, useUserRecommendations } from "@/lib/hooks";
import { RecommendationList } from "./RecommendationList";
import { MovieGrid } from "../movie/MovieGrid";

export function RecommendationSection({ model }: { model: "tfidf" | "bert" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionRef = useRef<HTMLDivElement>(null);

  const movieIdStr = searchParams.get("movieId");
  const selectedMovieId = movieIdStr ? parseInt(movieIdStr, 10) : null;
  const selectedTitle = searchParams.get("selectedTitle") || "";


  const handleMovieSelect = (id: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("movieId", id.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const {
    data: userRecs,
    isLoading: isUserLoading,
    error: userError,
  } = useUserRecommendations(1, model);

  const {
    data: similarRecs,
    isLoading: isSimilarLoading,
    error: similarError,
  } = useRecommendations(selectedMovieId, model);

  // ── Empty state — no movie selected ──
  if (!selectedMovieId) {
    return (
      <>
        {/* Default user recs */}
        <div id="recommendations-section" ref={sectionRef}>
          <RecommendationList
            title="Recommended for You"
            description="Based on your watch history. Search above and click a movie to get personalised similar recommendations."
          >
            <MovieGrid
              movies={userRecs || []}
              isLoading={isUserLoading}
              error={userError instanceof Error ? userError : null}
              onSelectMovie={handleMovieSelect}
            />
          </RecommendationList>
        </div>
      </>
    );
  }

  // ── Selected movie state — show similar movies with contextual header ──
  return (
    <div
      id="recommendations-section"
      ref={sectionRef}
      style={{ animation: "fadeSlideIn 0.5s ease both" }}
    >
      <RecommendationList
        title={selectedTitle ? `Because you watched "${selectedTitle}"` : "Similar Movies"}
        description="Powered by AI content analysis. Click any movie below to explore further."
      >
        <MovieGrid
          movies={similarRecs || []}
          isLoading={isSimilarLoading}
          error={similarError instanceof Error ? similarError : null}
          onSelectMovie={handleMovieSelect}
        />
      </RecommendationList>

      <style jsx>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
