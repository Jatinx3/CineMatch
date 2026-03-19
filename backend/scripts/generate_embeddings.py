import os
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import time

def main():
    base_dir = os.path.dirname(__file__)
    data_dir = os.path.join(base_dir, "data")
    pickle_path = os.path.join(data_dir, "movies_enriched.pkl")
    output_path = os.path.join(data_dir, "bert_embeddings_full.npy")

    print(f"Loading dataset from {pickle_path}...")
    df = pd.read_pickle(pickle_path)
    df.reset_index(drop=True, inplace=True)
    print(f"Loaded {len(df)} movies.")

    print("Loading final_features from dataset directly...")
    features = df['final_features'].fillna("").tolist()

    print("Initialising SentenceTransformer('all-MiniLM-L6-v2')...")
    model = SentenceTransformer('all-MiniLM-L6-v2')

    print(f"Encoding {len(features)} movies... This may take a few minutes.")
    start_time = time.time()
    
    # Encode all at once (MiniLM is batched by default)
    # show_progress_bar is helpful for logs
    embeddings = model.encode(
        features, 
        batch_size=64, 
        show_progress_bar=True, 
        convert_to_numpy=True
    )
    
    elapsed = time.time() - start_time
    print(f"Encoding completed in {elapsed:.2f} seconds.")
    print(f"Embedding Matrix Shape: {embeddings.shape}")

    print(f"Saving embeddings to {output_path}...")
    np.save(output_path, embeddings)
    print("✅ All Done!")

if __name__ == "__main__":
    main()
