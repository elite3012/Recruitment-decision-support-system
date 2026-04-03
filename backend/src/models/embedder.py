import torch
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Union
from pathlib import Path
import json
from src.utils.logging import setup_logging

logger = setup_logging(__name__)


class EmbedderService:
    """
    Semantic embedding service using pre-trained transformer models.
    
    This service loads pre-trained sentence embedding models (from HuggingFace)
    for computing semantic similarity between job descriptions and candidate profiles.
    It does NOT represent a recruitment-specific trained model - it uses general-purpose
    pre-trained embeddings for text similarity matching.
    """
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", device: str = None):
        """
        Initialize embedder with a pre-trained sentence-transformers model.
        
        Args:
            model_name: Pre-trained HuggingFace model name (default: all-MiniLM-L6-v2)
            device: 'cuda', 'cpu', or None (auto)
        """
        self.model_name = model_name
        self.device = device or ('cuda' if torch.cuda.is_available() else 'cpu')
        
        logger.info(f"Initializing {model_name} on {self.device}...")
        self.model = SentenceTransformer(model_name)
        # Ensure deep device target mapping
        self.model.to(self.device)
        
        self.embedding_dim = self.model.get_sentence_embedding_dimension()
        logger.info(f"Loaded {model_name} securely on {self.device} (dim={self.embedding_dim})")
    
    def embed(self, texts: Union[str, List[str]], batch_size: int = 32) -> np.ndarray:
        """
        Embed texts to vectors.
        
        Args:
            texts: Single text or list of texts
            batch_size: Batch size for processing
            
        Returns:
            Embeddings as numpy array (N, embedding_dim)
        """
        if isinstance(texts, str):
            texts = [texts]
        
        with torch.no_grad():
            embeddings = self.model.encode(
                texts,
                batch_size=batch_size,
                convert_to_tensor=True,
                device=self.device,
                show_progress_bar=False
            )
            
            if isinstance(embeddings, torch.Tensor):
                embeddings = embeddings.cpu().numpy()
        
        return embeddings
    
    def similarity(self, emb1: np.ndarray, emb2: np.ndarray) -> float:
        """Cosine similarity between two embeddings."""
        similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
        return float(np.clip(similarity, 0, 1))
    
    def batch_similarity(self, emb1: np.ndarray, emb2_list: List[np.ndarray]) -> np.ndarray:
        """Compute similarity between one embedding and a list of embeddings."""
        norm1 = np.linalg.norm(emb1)
        similarities = []
        for emb2 in emb2_list:
            sim = np.dot(emb1, emb2) / (norm1 * np.linalg.norm(emb2) + 1e-8)
            similarities.append(np.clip(sim, 0, 1))
        return np.array(similarities)
    
    def save_config(self, path: Union[str, Path]):
        """Save embedder configuration."""
        config = {
            'model_name': self.model_name,
            'embedding_dim': self.embedding_dim,
            'device': self.device
        }
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        with open(path, 'w') as f:
            json.dump(config, f, indent=2)
        logger.info(f"Saved config to {path}")
    
    @classmethod
    def load_config(cls, path: Union[str, Path]):
        """Load embedder from configuration."""
        with open(path, 'r') as f:
            config = json.load(f)
        return cls(**config)
