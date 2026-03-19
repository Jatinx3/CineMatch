import os
import pandas as pd
import re
import ast

def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_names(text):
    try:
        items = ast.literal_eval(text)
        return " ".join([i['name'] for i in items])
    except:
        return ""

def main():
    base_dir = os.path.dirname(__file__)
    data_dir = os.path.join(base_dir, "data")
    ml_dir = os.path.join(data_dir, "ml-latest")

    print("Loading core datasets...")
    movies = pd.read_csv(os.path.join(ml_dir, "movies.csv"))
    tags = pd.read_csv(os.path.join(ml_dir, "tags.csv"))
    links = pd.read_csv(os.path.join(ml_dir, "links.csv"))
    tmdb = pd.read_csv(os.path.join(data_dir, "tmdb_5000_movies.csv"))
    popularity = pd.read_pickle(os.path.join(data_dir, "ratings_popularity.pkl"))

    print(f"Loaded {len(movies)} rows from movies.csv.")

    # 1. Aggregate Tags
    print("Aggregating tags...")
    tags['tag'] = tags['tag'].astype(str).str.lower().str.strip()
    tags_grouped = tags.groupby('movieId')['tag'].apply(lambda x: " ".join(x)).reset_index()

    # 2. Merge with Tags
    df = movies.merge(tags_grouped, on='movieId', how='left')
    df['tag'] = df['tag'].fillna("")
    
    # 3. Clean Genres
    df['clean_genres'] = df['genres'].astype(str).str.replace("|", " ", regex=False)
    
    # 4. First Tier Features (Notebook Section 6)
    df['features'] = df['clean_genres'] + " " + df['tag']
    df['features_clean'] = df['features'].apply(clean_text)

    # 5. Connect Links to TMDB
    links = links.dropna(subset=['tmdbId'])
    links['tmdbId'] = links['tmdbId'].astype(int)

    df = df.merge(links[['movieId', 'tmdbId']], on='movieId', how='left')

    # 6. Merge with TMDB (Using LEFT JOIN instead of INNER to keep 87k size!)
    print("Merging with TMDB...")
    df = df.merge(
        tmdb[['id', 'overview', 'keywords', 'genres']], 
        left_on='tmdbId', 
        right_on='id', 
        how='left',
        suffixes=('', '_tmdb')
    )

    # 7. Parse TMDB JSON strings
    print("Parsing TMDB JSON structures...")
    df['tmdb_keywords'] = df['keywords'].fillna("[]").apply(extract_names)
    df['tmdb_genres'] = df['genres_tmdb'].fillna("[]").apply(extract_names)
    df['overview_clean'] = df['overview'].fillna("").apply(clean_text)

    # 8. Rebuild Final Features
    print("Building final_features...")
    df['final_features'] = (
        df['features_clean'] + " " +
        df['overview_clean'] + " " +
        df['tmdb_keywords'] + " " +
        df['tmdb_genres']
    ).str.strip()

    # 9. Merge Popularity
    print("Injecting rating popularity counts...")
    df = df.merge(popularity, on='movieId', how='left')
    df['rating_count'] = df['rating_count'].fillna(1).astype(int)

    # 10. Clean-up columns to minimize disk size before serialising
    # Keep absolute basics used by interface: 'movieId', 'title', 'genres', 'final_features', 'overview', 'rating_count'
    df['overview'] = df['overview'].fillna("")
    df['id'] = df['movieId'] # aligned accessor
    
    # Reorder to keep index reset aligned
    df = df.reset_index(drop=True)

    pickle_out = os.path.join(data_dir, "movies_enriched.pkl")
    print(f"Saving enriched dataset ({len(df)} rows) to {pickle_out}...")
    df.to_pickle(pickle_out)
    print("✅ Enrichment Dataset ready.")

if __name__ == "__main__":
    main()
