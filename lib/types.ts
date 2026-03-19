export interface Movie {
  id: number;
  title: string;
  poster: string;
  genres: string[];
  overview?: string;
}

export interface SystemStats {
  total_movies: number;
  bert: {
    embeddings_count: number;
    dimensions: number;
  };
  tfidf: {
    vocab_size: number;
  };
  genres_distribution: Record<string, number>;
}
