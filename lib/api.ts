import { Movie, SystemStats } from "./types";

const _raw_url = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_BASE_URL = _raw_url.replace(/\/$/, "");

function mapMovieResponse(data: any): Movie {
  const posterPath = data.poster_path;
  // If it's already a full URL or missing
  const poster = posterPath 
    ? (posterPath.startsWith('http') ? posterPath : `https://image.tmdb.org/t/p/w500${posterPath}`)
    : "https://via.placeholder.com/500x750?text=No+Poster";
    
  return {
    id: data.id,
    title: data.title,
    overview: data.overview,
    genres: data.genres || [],
    poster: poster,
  };
}

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    let errorMessage = "Failed to fetch";
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || res.statusText || errorMessage;
    } catch {
      errorMessage = res.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

async function fetchWithHandling(url: string, options?: RequestInit): Promise<Movie[]> {
  const data = await fetchJson<any>(url, options);
  if (Array.isArray(data)) {
    return data.map(mapMovieResponse);
  }
  return [];
}

export async function searchMovies(query: string, signal?: AbortSignal): Promise<Movie[]> {
  if (!query) return [];
  return fetchWithHandling(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`, { signal });
}

export async function getSimilarMovies(movieId: number, model: "tfidf" | "bert", signal?: AbortSignal): Promise<Movie[]> {
  return fetchWithHandling(`${API_BASE_URL}/recommend/similar?movie_id=${movieId}&model=${model}`, { signal });
}

export async function getUserRecommendations(userId: number, model: "tfidf" | "bert", signal?: AbortSignal): Promise<Movie[]> {
  return fetchWithHandling(`${API_BASE_URL}/recommend/user?user_id=${userId}&model=${model}`, { signal });
}

export async function getSystemStats(signal?: AbortSignal): Promise<SystemStats> {
  return fetchJson<SystemStats>(`${API_BASE_URL}/stats`, { signal });
}
