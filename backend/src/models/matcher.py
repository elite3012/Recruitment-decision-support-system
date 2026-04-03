import numpy as np
from typing import Dict, Tuple, List
from src.models.embedder import EmbedderService
from src.processing import normalize_text, extract_skills
from src.utils.logging import setup_logging

logger = setup_logging(__name__)


class CandidateJobMatcher:
    """Semantic and structured matching for candidate-job pairs."""
    
    def __init__(
        self,
        embedder: EmbedderService = None
    ):
        """
        Initialize matcher with embedder.
        
        Args:
            embedder: EmbedderService instance
        """
        self.embedder = embedder or EmbedderService()
        self._cand_embeddings_cache = {}
        self._cand_skills_cache = {}
    
    def match(
        self,
        job: Dict,
        candidate: Dict,
        weights: Dict[str, float] = None,
        job_emb: np.ndarray = None,
        cand_emb: np.ndarray = None,
        job_skills: set = None,
        cand_skills: set = None
    ) -> Dict[str, float]:
        """
        Compute match scores between candidate and job.
        
        Returns dict with component scores.
        """
        if weights is None:
            weights = {
                'text_similarity': 0.35,
                'skill_match': 0.35,
                'experience_match': 0.20,
                'location_match': 0.10
            }
        
        scores = {}
        scores['text_similarity'] = self._text_similarity(job, candidate, job_emb, cand_emb)
        scores['skill_match'] = self._skill_match(job, candidate, job_skills, cand_skills)
        scores['experience_match'] = self._experience_match(job, candidate)
        
        # New location match logic with explicit penalty capability
        loc_score, is_mismatch = self._location_match(job, candidate)
        scores['location_match'] = loc_score
        
        overall = sum(
            scores.get(k, 0) * v for k, v in weights.items() if k in scores
        )
        
        if is_mismatch:
            scores['location_penalty'] = True
            overall -= 0.15 # Strong explicit penalty subtraction for mismatch
        else:
            scores['location_penalty'] = False
            
        scores['overall_score'] = np.clip(overall, 0, 1)
        
        return scores
    
    def _text_similarity(self, job: Dict, candidate: Dict, job_emb: np.ndarray = None, cand_emb: np.ndarray = None) -> float:
        """Semantic similarity based on text embeddings."""
        if job_emb is None:
            job_text = normalize_text(f"{str(job.get('job_title') or '')} {str(job.get('job_description') or '')}")
            if not job_text.strip(): return 0.0
            try: job_emb = self.embedder.embed(job_text)[0]
            except Exception as e: logger.error(f"Job embedding failed: {e}"); return 0.0
            
        if cand_emb is None:
            cand_text = normalize_text(f"{str(candidate.get('desired_job') or '')} {str(candidate.get('skills') or '')}")
            if not cand_text.strip(): return 0.0
            try: cand_emb = self.embedder.embed(cand_text)[0]
            except Exception as e: logger.error(f"Candidate embedding failed: {e}"); return 0.0

        if getattr(job_emb, 'size', 0) == 0 or getattr(cand_emb, 'size', 0) == 0:
            return 0.0
            
        try:
            return self.embedder.similarity(job_emb, cand_emb)
        except Exception:
            return 0.0
    
    def _skill_match(self, job: Dict, candidate: Dict, job_skills: set = None, cand_skills: set = None) -> float:
        """Skill overlap ratio."""
        if job_skills is None:
            job_skills = set(extract_skills(
                f"{str(job.get('job_title') or '')} {str(job.get('job_requirements') or '')}"
            ))
            
        if cand_skills is None:
            cand_skills = set(extract_skills(
                str(candidate.get('skills') or '')
            ))
        
        if not job_skills:
            return 1.0
        
        overlap = len(job_skills & cand_skills)
        return min(overlap / len(job_skills), 1.0)
    
    def _experience_match(self, job: Dict, candidate: Dict) -> float:
        """Experience requirement satisfaction."""
        try:
            from src.utils.helpers import parse_experience_years
            required = parse_experience_years(str(job.get('years_of_experience') or '0'))
            actual = parse_experience_years(str(candidate.get('experience_years') or '0'))
        except (ValueError, TypeError):
            required = 0
            actual = 0
        
        if required <= 0:
            return 1.0
        
        ratio = actual / required
        return min(ratio, 1.0) if ratio > 0 else 0.0
    
    def _education_match(self, job: Dict, candidate: Dict) -> float:
        """Education level match (simplified)."""
        req_degree = str(job.get('degree_required') or '').lower()
        cand_degree = str(candidate.get('degree') or '').lower()
        
        degree_ranking = {'phd': 3, 'master': 2, 'bachelor': 1, 'associate': 0}
        req_level = degree_ranking.get(req_degree, 0)
        cand_level = degree_ranking.get(cand_degree, 0)
        
        if req_level == 0:
            return 1.0
        return min(cand_level / req_level, 1.0) if cand_level > 0 else 0.0
    
    def _location_match(self, job: Dict, candidate: Dict) -> Tuple[float, bool]:
        """
        Location match mapping based on exact/substring inclusion.
        Returns: (score, is_mismatch)
        - score: 1.0 (match), 0.5 (missing/neutral), 0.0 (mismatch)
        - is_mismatch: True if locations explicitly clash.
        """
        job_loc = str(job.get('location') or getattr(job, 'job_address', '') or '').lower().strip()
        cand_loc = str(candidate.get('location') or getattr(candidate, 'workplace_desired', '') or '').lower().strip()
        
        # Missing data handling
        if not job_loc or not cand_loc or job_loc == 'unknown' or cand_loc == 'unknown':
            return 0.5, False  # Neutral, no strong penalty
            
        import re
        def clean_loc(l):
            l = re.sub(r'(tp\.|tỉnh|thành phố|thành phố|t\.|tp )', '', l).strip()
            # Normalize common variants
            if l in ['hcm', 'hồ chí minh', 'ho chi minh', 'tp hcm']:
                return 'hcm'
            if l in ['hn', 'hà nội', 'ha noi', 'tp hà nội']:
                return 'hà nội'
            return l
            
        c_job = clean_loc(job_loc)
        c_cand = clean_loc(cand_loc)
        
        # If exact match or clear substring
        if c_job in c_cand or c_cand in c_job:
            return 1.0, False
            
        # Hard mismatch
        return 0.0, True

    def rank_candidates(
        self,
        job: Dict,
        candidates: List[Dict],
        weights: Dict[str, float] = None,
        top_k: int = None
    ) -> List[Tuple[Dict, float]]:
        """
        Rank candidates for a job.
        
        Returns: [(candidate, overall_score), ...]
        """
        import time
        start_time = time.time()
        
        # Precompute job features so we don't recalculate per candidate
        job_text = normalize_text(f"{str(job.get('job_title') or '')} {str(job.get('job_description') or '')}")
        job_emb = None
        if job_text.strip():
            try: job_emb = self.embedder.embed(job_text)[0]
            except: pass
            
        job_skills = set(extract_skills(f"{str(job.get('job_title') or '')} {str(job.get('job_requirements') or '')}"))

        logger.info(f"[TIMING] Job features precomputed in {time.time() - start_time:.2f}s")
        
        # Batch embed candidates for massive speedup + Caching
        cand_start = time.time()
        uncached_cands = []
        cand_texts = []
        for c in candidates:
            cid = c.get('id')
            if cid not in self._cand_embeddings_cache or cid not in self._cand_skills_cache:
                uncached_cands.append(c)
                skills_str = str(c.get('skills') or '')
                self._cand_skills_cache[cid] = set(extract_skills(skills_str))
                cand_texts.append(normalize_text(f"{str(c.get('desired_job') or '')} {skills_str}"))

        if uncached_cands and cand_texts:
            logger.info(f"Computing embeddings and features for {len(uncached_cands)} uncached candidates...")
            try:
                new_embs = self.embedder.embed(cand_texts, batch_size=128)
                for c, emb in zip(uncached_cands, new_embs):
                    self._cand_embeddings_cache[c.get('id')] = emb
            except Exception as e:
                logger.error(f"Batch candidate embedding failed: {e}")
                for c in uncached_cands:
                    self._cand_embeddings_cache[c.get('id')] = None

        logger.info(f"[TIMING] Candidates features prepared (cached={len(candidates)-len(uncached_cands)}, uncached={len(uncached_cands)}) in {time.time() - cand_start:.2f}s")

        rank_start = time.time()
        results = []
        for c in candidates:
            cid = c.get('id')
            c_emb = self._cand_embeddings_cache.get(cid)
            c_skills = self._cand_skills_cache.get(cid)
            
            scores = self.match(
                job, 
                c, 
                weights, 
                job_emb=job_emb, 
                cand_emb=c_emb, 
                job_skills=job_skills,
                cand_skills=c_skills
            )
            results.append((c, scores['overall_score'], scores))
        
        results.sort(key=lambda x: x[1], reverse=True)
        if top_k:
            results = results[:top_k]
            
        logger.info(f"[TIMING] Final ranking loop and aggregation finished in {time.time() - rank_start:.2f}s")
        logger.info(f"[TIMING] Total ranking pipeline time: {time.time() - start_time:.2f}s")
        
        # Return format expected by service: (cand_dict, scores_dict)
        return [(r[0], r[2]) for r in results]
