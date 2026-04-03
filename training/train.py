"""Model training pipeline."""
import torch
from torch.utils.data import DataLoader, Dataset
from pathlib import Path
from typing import Dict

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend'))

from src.models.embedder import EmbedderService
from src.storage.database import Database
from src.utils.logging import setup_logging

logger = setup_logging(__name__)


class MatchingDataset(Dataset):
    """Dataset for training/evaluation of matching model."""
    
    def __init__(self, database_path: str):
        self.db = Database(database_path)
        self.matches = self.db.get_all_matches()
        self.jobs = {j.id: j for j in self.db.get_all_jobs()}
        self.candidates = {c.id: c for c in self.db.get_all_candidates()}
    
    def __len__(self):
        return len(self.matches)
    
    def __getitem__(self, idx):
        match = self.matches[idx]
        job = self.jobs[match.job_id]
        candidate = self.candidates[match.candidate_id]
        
        job_text = f"{job.job_title} {job.job_description}"
        cand_text = f"{candidate.desired_job} {candidate.skills}"
        label = 1 if match.is_match else 0
        
        return {
            'job_text': job_text,
            'candidate_text': cand_text,
            'label': label,
            'job_id': job.id,
            'candidate_id': candidate.id
        }


class MatchingTrainer:
    """Trainer for semantic matching model."""
    
    def __init__(
        self,
        model_name: str = "all-MiniLM-L6-v2",
        db_path: str = "data/app.db",
        checkpoint_dir: str = "models/checkpoints"
    ):
        self.embedder = EmbedderService(model_name)
        self.db_path = db_path
        self.checkpoint_dir = Path(checkpoint_dir)
        self.checkpoint_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Trainer initialized with {model_name}")
    
    def evaluate(self, dataset: MatchingDataset) -> Dict:
        """Evaluate model on dataset."""
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
        
        predictions = []
        targets = []
        
        for item in dataset:
            job_emb = self.embedder.embed(item['job_text'])
            cand_emb = self.embedder.embed(item['candidate_text'])
            similarity = self.embedder.similarity(job_emb[0], cand_emb[0])
            
            predictions.append(1 if similarity > 0.5 else 0)
            targets.append(item['label'])
        
        metrics = {
            'accuracy': accuracy_score(targets, predictions),
            'precision': precision_score(targets, predictions, zero_division=0),
            'recall': recall_score(targets, predictions, zero_division=0),
            'f1': f1_score(targets, predictions, zero_division=0)
        }
        
        logger.info(f"Evaluation metrics: {metrics}")
        return metrics
    
    def save_checkpoint(self, name: str = "latest"):
        """Save model checkpoint."""
        path = self.checkpoint_dir / f"{name}_config.json"
        self.embedder.save_config(path)
        logger.info(f"Saved checkpoint to {path}")


if __name__ == "__main__":
    from typing import Dict
    
    dataset = MatchingDataset("data/app.db")
    trainer = MatchingTrainer()
    metrics = trainer.evaluate(dataset)
    trainer.save_checkpoint("baseline")
