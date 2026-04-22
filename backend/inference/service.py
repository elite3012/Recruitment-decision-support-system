"""Inference service for production predictions."""
import numpy as np
from typing import List, Dict, Tuple
from pathlib import Path
from src.models.embedder import EmbedderService
from src.models.matcher import CandidateJobMatcher
from src.storage.database import Database
from src.utils.logging import setup_logging

logger = setup_logging(__name__)


class MatchingInferenceService:
    """Production inference service for candidate-job matching."""
    
    def __init__(self, db_path: str = "data/app.db", embedder_checkpoint: str = None):
        """
        Initialize inference service.
        
        Args:
            db_path: Path to SQLite database
            embedder_checkpoint: Path to saved embedder config
        """
        self.db = Database(db_path)
        
        if embedder_checkpoint and Path(embedder_checkpoint).exists():
            self.embedder = EmbedderService.load_config(embedder_checkpoint)
        else:
            self.embedder = EmbedderService()
        
        self.matcher = CandidateJobMatcher(self.embedder)
        logger.info(f"Initialized inference service (model: {self.embedder.model_name})")
    
    def match_candidate_to_job(
        self,
        candidate_id: int,
        job_id: int,
        weights: Dict[str, float] = None
    ) -> Dict:
        """Compute match score for candidate-job pair."""
        candidate = self.db.get_candidate_by_id(candidate_id)
        job = self.db.get_job_by_id(job_id)
        
        if not candidate or not job:
            return None
        
        try:
            cand_dict = {
                'desired_job': getattr(candidate, 'desired_job', '') or '',
                'skills': getattr(candidate, 'skills', '') or '',
                'experience_years': getattr(candidate, 'work_experience', getattr(candidate, 'experience_years', 0)) or 0,
                'degree': getattr(candidate, 'degree', '') or '',
                'location': getattr(candidate, 'location', '') or getattr(candidate, 'workplace_desired', '') or 'Unknown'
            }
            
            job_dict = {
                'job_title': getattr(job, 'job_title', '') or '',
                'job_description': getattr(job, 'job_description', '') or '',
                'job_requirements': getattr(job, 'job_requirements', '') or '',
                'years_of_experience': getattr(job, 'years_of_experience', 0) or 0,
                'degree_required': getattr(job, 'degree_required', '') or '',
                'location': getattr(job, 'location', '') or getattr(job, 'job_address', '') or 'Unknown'
            }
            
            scores = self.matcher.match(job_dict, cand_dict, weights)
            return scores
        except Exception as e:
            logger.error(f"Error computing candidate {candidate_id} to job {job_id}: {e}")
            return {'overall_score': 0.0, 'text_similarity': 0.0, 'skill_match': 0.0, 'experience_match': 0.0, 'education_match': 0.0}
    
    def rank_candidates_for_job(
        self,
        job_id: int,
        candidate_ids: List[int] = None,
        weights: Dict[str, float] = None,
        top_k: int = 10
    ) -> List[Tuple[int, Dict]]:
        """
        Rank candidates for a specific job.
        
        Returns: [(candidate_id, scores), ...]
        """
        job = self.db.get_job_by_id(job_id)
        if not job:
            return []
        
        if candidate_ids is None:
            candidates = self.db.get_all_candidates()
            # Handle DB returning None records safely
            candidate_ids = [getattr(c, 'user_id', getattr(c, 'id', -1)) for c in candidates if c is not None]
        else:
            candidates = [self.db.get_candidate_by_id(cid) for cid in candidate_ids]
            candidates = [c for c in candidates if c]
        
        if not candidates:
            return []
            
        try:
            job_dict = {
                'job_title': getattr(job, 'job_title', '') or '',
                'job_description': getattr(job, 'job_description', '') or '',
                'job_requirements': getattr(job, 'job_requirements', '') or '',
                'location': getattr(job, 'location', '') or getattr(job, 'job_address', '') or 'Unknown',
                'years_of_experience': getattr(job, 'years_of_experience', '') or '',
                'degree_required': getattr(job, 'degree_required', '') or ''
            }
            
            candidate_dicts = []
            for c in candidates:
                try:
                    candidate_dicts.append({
                        'id': getattr(c, 'user_id', getattr(c, 'id', -1)),
                        'name': getattr(c, 'user_name', '') or getattr(c, 'name', '') or 'Unknown',
                        'location': getattr(c, 'location', '') or getattr(c, 'workplace_desired', '') or 'Unknown',
                        'desired_job': getattr(c, 'desired_job', '') or '',
                        'skills': getattr(c, 'skills', '') or '',
                        'experience_years': getattr(c, 'work_experience', '') or getattr(c, 'experience_years', '') or '0',
                          'degree': getattr(c, 'degree', '') or '',
                          'expected_salary': getattr(c, 'desired_salary', '') or getattr(c, 'salary', '') or 'Negotiable',
                          'gender': getattr(c, 'gender', '') or 'Unknown'
                    })
                except Exception as ce:
                    logger.warning(f"Skipping candidate {c} due to mapping error: {ce}")
                    continue
            
            ranked = self.matcher.rank_candidates(
                job_dict,
                candidate_dicts,
                weights,
                top_k
            )
            
            return [(cand, scores) for cand, scores in ranked]
            
        except Exception as e:
            logger.error(f"Fatal error ranking candidates for job {job_id}: {e}")
            return []
    
    def batch_embed_jobs(self, batch_size: int = 100) -> Dict[int, np.ndarray]:
        """Precompute embeddings for all jobs (for efficiency)."""
        jobs = self.db.get_all_jobs()
        embeddings = {}
        
        texts = [
            f"{job.job_title} {job.job_description}"
            for job in jobs
        ]
        
        embs = self.embedder.embed(texts, batch_size=batch_size)
        for job, emb in zip(jobs, embs):
            embeddings[job.id] = emb
        
        logger.info(f"Precomputed embeddings for {len(embeddings)} jobs")
        return embeddings
    
    def batch_embed_candidates(self, batch_size: int = 100) -> Dict[int, np.ndarray]:
        """Precompute embeddings for all candidates."""
        candidates = self.db.get_all_candidates()
        embeddings = {}
        
        texts = [
            f"{cand.desired_job} {cand.skills}"
            for cand in candidates
        ]
        
        embs = self.embedder.embed(texts, batch_size=batch_size)
        for cand, emb in zip(candidates, embs):
            embeddings[cand.id] = emb
        
        logger.info(f"Precomputed embeddings for {len(embeddings)} candidates")
        return embeddings
