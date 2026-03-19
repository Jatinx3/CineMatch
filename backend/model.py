import os
import pandas as pd
import numpy as np
import pickle
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize
from sklearn.feature_extraction.text import TfidfVectorizer


class RecommenderSystem:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RecommenderSystem, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        base_dir = os.path.dirname(__file__)
        data_dir = os.path.join(base_dir, "data")

        try:
            self.movies_df = pd.read_pickle(os.path.join(data_dir, "movies.pkl"))
            self.movies_df.reset_index(drop=True, inplace=True)

            print(f"✅ Movies loaded: {len(self.movies_df)}")

            # Normalise column names for downstream uniformity
            if 'id' not in self.movies_df.columns:
                self.movies_df['id'] = self.movies_df['movieId']
            self.id_col = 'id'

            if 'overview' not in self.movies_df.columns:
                self.movies_df['overview'] = ""
            if 'poster_path' not in self.movies_df.columns:
                self.movies_df['poster_path'] = "/placeholder.jpg"
            if 'genres' not in self.movies_df.columns:
                self.movies_df['genres'] = ""

            # Popularity normalisation (log-scaled, 0–1)
            popularity = self.movies_df['rating_count'].values
            pop_norm = np.log1p(popularity)
            self.pop_norm = pop_norm / pop_norm.max() if pop_norm.max() > 0 else np.zeros_like(pop_norm)

            # BERT embeddings — L2-normalised upfront for fast dot-product similarity
            raw_bert = np.load(os.path.join(data_dir, "bert_embeddings_full.npy"))
            self.bert_embeddings = normalize(raw_bert, norm='l2', axis=1)
            self.n_embedded = len(self.bert_embeddings)
            self.embedded_df = self.movies_df.copy()

            self.bert_id_to_idx = pd.Series(
                self.embedded_df.index,
                index=self.embedded_df['id']
            ).drop_duplicates().to_dict()

            print(f"✅ BERT embeddings loaded: {self.n_embedded} × {self.bert_embeddings.shape[1]}d")

            # TF-IDF on full dataset with rich features
            features = self.movies_df['final_features'].fillna("").astype(str)
            vectorizer = TfidfVectorizer(
                max_features=15000,
                ngram_range=(1, 2),
                min_df=2,
                stop_words='english',
            )
            self.tfidf_matrix = normalize(vectorizer.fit_transform(features), norm='l2', axis=1)
            self.tfidf_id_to_idx = pd.Series(
                self.movies_df.index,
                index=self.movies_df[self.id_col]
            ).drop_duplicates().to_dict()

            print(f"✅ TF-IDF matrix: {self.tfidf_matrix.shape}")

            # User ratings (real or mock fallback)
            ratings_path = os.path.join(data_dir, "train_ratings.pkl")
            if os.path.exists(ratings_path):
                self.train_ratings = pd.read_pickle(ratings_path)
            else:
                mock_ids = self.embedded_df.sample(5, random_state=42)['id'].values
                self.train_ratings = pd.DataFrame({
                    'userId': [1] * 5,
                    'movieId': mock_ids,
                    'rating': [4.5, 5.0, 4.0, 4.5, 4.0],
                })

            self.is_loaded = True
            print("✅ CineMatch backend ready.")

        except Exception as e:
            print(f"❌ Failed to initialise recommender: {e}")
            import traceback
            traceback.print_exc()
            self.load_error = str(e)
            self.movies_df = pd.DataFrame()
            self.is_loaded = False


    # ------------------------------------------------------------------
    # Search — searches the FULL 87k dataset, top 5 ranked by match quality
    # Prioritises movies that have BERT embeddings (can use both models)
    # ------------------------------------------------------------------
    def search_movies(self, query: str):
        if not self.is_loaded or not query:
            return pd.DataFrame()
        q = query.lower()
        df = self.movies_df
        titles_lower = df['title'].astype(str).str.lower()

        # Rank by specificity of match
        exact    = df[titles_lower == q]
        starts   = df[titles_lower.str.startswith(q) & ~(titles_lower == q)]
        word     = df[titles_lower.str.contains(r'\b' + q, regex=True, na=False)
                      & ~titles_lower.str.startswith(q)]
        contains = df[titles_lower.str.contains(q, na=False)
                      & ~titles_lower.str.contains(r'\b' + q, regex=True, na=False)]

        ranked = pd.concat([exact, starts, word, contains]).drop_duplicates(subset='id')
        return ranked.head(5)

    # ------------------------------------------------------------------
    # Similar movies
    # TF-IDF works for ALL movies; BERT falls back to TF-IDF for newer ones
    # ------------------------------------------------------------------
    def get_similar_movies(self, movie_id: int, model_type: str = 'tfidf', top_n: int = 10):
        if not self.is_loaded:
            raise ValueError("Model is not loaded completely.")

        # TF-IDF path — works for all 87k movies
        if movie_id not in self.tfidf_id_to_idx:
            return pd.DataFrame()
        tfidf_idx = self.tfidf_id_to_idx[movie_id]

        # Popularity multiplier variables (Notebook Section 19)
        alpha = 0.7

        if model_type == 'bert':
            # BERT path (works for ALL movies now)
            if movie_id not in self.bert_id_to_idx:
                return pd.DataFrame()
                
            bert_idx = self.bert_id_to_idx[movie_id]
            target_embedding = self.bert_embeddings[bert_idx]
            
            # Use dot product against normalized matrix instead of full cosine_similarity
            sim_scores = self.bert_embeddings.dot(target_embedding).flatten()
            
            # Popularity Weighting: score = alpha * sim + (1 - alpha) * (sim * pop_norm)
            sim_scores = alpha * sim_scores + (1 - alpha) * (sim_scores * self.pop_norm)

            top_bert = sim_scores.argsort()[-(top_n * 3 + 1):][::-1][1:]
            result_ids = self.embedded_df.iloc[top_bert][self.id_col].values
            result = self.movies_df[self.movies_df[self.id_col].isin(result_ids)]
            id_order = {rid: i for i, rid in enumerate(result_ids)}
            result = result.copy()
            result['_order'] = result[self.id_col].map(id_order)
            result = result.sort_values('_order').drop(columns=['_order'])
            return result.head(top_n)
        else:
            # TF-IDF path (works for all 87k movies)
            target_embedding = self.tfidf_matrix[tfidf_idx]
            sim_scores = self.tfidf_matrix.dot(target_embedding.T).toarray().flatten()
            
            # Popularity Weighting
            sim_scores = alpha * sim_scores + (1 - alpha) * (sim_scores * self.pop_norm)

            sim_indices = sim_scores.argsort()[-(top_n + 1):][::-1][1:]
            return self.movies_df.iloc[sim_indices]

    # ------------------------------------------------------------------
    # User recommendations
    # ------------------------------------------------------------------
    def get_user_recommendations(self, user_id: int, model_type: str = 'tfidf', top_n: int = 10):
        if not self.is_loaded:
            raise ValueError("Model is not loaded completely.")

        user_data = self.train_ratings[self.train_ratings['userId'] == user_id]
        user_data = user_data[user_data['rating'] >= 4.0]

        if len(user_data) == 0:
            return pd.DataFrame()

        if model_type == 'bert':
            # BERT path (works for ALL movies now)
            mapped_idxs = [self.bert_id_to_idx[mid] for mid in user_data['movieId'].values if mid in self.bert_id_to_idx]
            valid_ratings = [row['rating'] for _, row in user_data.iterrows() if row['movieId'] in self.bert_id_to_idx]

            if not mapped_idxs:
                return pd.DataFrame()

            idxs = np.array(mapped_idxs)
            weights = np.array(valid_ratings).reshape(-1, 1) - np.array(valid_ratings).mean()
            user_embeddings = self.bert_embeddings[idxs]
            user_profile = (user_embeddings * weights).mean(axis=0).reshape(1, -1)
            # Normalise profile before dotting
            user_profile = normalize(user_profile, norm='l2', axis=1)
            sim_scores = self.bert_embeddings.dot(user_profile.T).flatten()

            # Popularity weights
            alpha = 0.7
            sim_scores = alpha * sim_scores + (1 - alpha) * (sim_scores * self.pop_norm)

            seen_ids = set(user_data['movieId'].values)
            ranked = np.argsort(sim_scores)[::-1]
            recs = []
            for i in ranked:
                m_id = self.embedded_df.iloc[i][self.id_col]
                if m_id not in seen_ids:
                    recs.append(i)
                if len(recs) >= top_n:
                    break
            result_ids = self.embedded_df.iloc[recs][self.id_col].values
            return self.movies_df[self.movies_df[self.id_col].isin(result_ids)].head(top_n)

        # TF-IDF path — works with all 87k movies
        mapped_idxs = []
        valid_ratings = []
        for _, row in user_data.iterrows():
            mid = row['movieId']
            if mid in self.tfidf_id_to_idx:
                mapped_idxs.append(self.tfidf_id_to_idx[mid])
                valid_ratings.append(row['rating'])

        if not mapped_idxs:
            return pd.DataFrame()

        idxs = np.array(mapped_idxs)
        weights = np.array(valid_ratings).reshape(-1, 1)
        weights = weights - weights.mean()

        user_embeddings = self.tfidf_matrix[idxs]
        user_profile = np.asarray(user_embeddings.multiply(weights).mean(axis=0))
        user_profile = normalize(user_profile, norm='l2', axis=1)
        sim_scores = self.tfidf_matrix.dot(user_profile.T).flatten()

        # Popularity weights
        alpha = 0.7
        sim_scores = alpha * sim_scores + (1 - alpha) * (sim_scores * self.pop_norm)

        seen_ids = set(user_data['movieId'].values)
        ranked = np.argsort(sim_scores)[::-1]
        recs = []
        for i in ranked:
            m_id = self.movies_df.iloc[i][self.id_col]
            if m_id not in seen_ids:
                recs.append(i)
            if len(recs) >= top_n:
                break
        return self.movies_df.iloc[recs]

    def get_system_stats(self) -> dict:
        if not getattr(self, 'is_loaded', False):
            return {
                "total_movies": 0,
                "bert": {"embeddings_count": 0, "dimensions": 0},
                "tfidf": {"vocab_size": 0},
                "genres_distribution": {}
            }

        genre_counts = {}
        for genres in self.movies_df['genres'].dropna():
            if isinstance(genres, str):
                if "(no genres listed)" in genres.lower() or "no genres" in genres.lower():
                    continue
                # Notebook stripped '|' into spaces, so we split by space
                parsed_genres = [g.strip() for g in genres.split() if g.strip()]
            elif isinstance(genres, list):
                parsed_genres = genres
            else:
                continue
                
            for g in parsed_genres:
                # also avoid random fragments like '(no' or 'genres' just in case
                if g and len(g) > 2 and not g.startswith('('):
                    genre_counts[g] = genre_counts.get(g, 0) + 1
                    
        sorted_genres = dict(sorted(genre_counts.items(), key=lambda item: item[1], reverse=True)[:15])

        bert_shape = self.bert_embeddings.shape
        tfidf_shape = self.tfidf_matrix.shape

        return {
            "total_movies": len(self.movies_df),
            "bert": {
                "embeddings_count": bert_shape[0],
                "dimensions": bert_shape[1] if len(bert_shape) > 1 else 0
            },
            "tfidf": {
                "vocab_size": tfidf_shape[1] if len(tfidf_shape) > 1 else 0
            },
            "genres_distribution": sorted_genres
        }


recommender = RecommenderSystem()
