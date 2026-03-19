import { useQuery } from "@tanstack/react-query";
import { searchMovies, getSimilarMovies, getUserRecommendations, getSystemStats } from "./api";

export function useSystemStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: ({ signal }) => getSystemStats(signal),
  });
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: ({ signal }) => searchMovies(query, signal),
    enabled: query.length > 0,
  });
}

export function useRecommendations(movieId: number | null, model: "tfidf" | "bert") {
  return useQuery({
    queryKey: ["recommendations", movieId, model],
    queryFn: ({ signal }) => getSimilarMovies(movieId!, model, signal),
    enabled: !!movieId,
  });
}

export function useUserRecommendations(userId: number, model: "tfidf" | "bert") {
  return useQuery({
    queryKey: ["userRecommendations", userId, model],
    queryFn: ({ signal }) => getUserRecommendations(userId, model, signal),
    enabled: !!userId,
  });
}
