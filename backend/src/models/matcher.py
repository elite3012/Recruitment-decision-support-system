import numpy as np
import re
import base64
import hashlib
import json
import os
from typing import Dict, Tuple, List
from src.models.embedder import EmbedderService
from src.processing import normalize_text, extract_skills
from src.utils.logging import setup_logging
from src.utils.helpers import parse_experience_years

logger = setup_logging(__name__)

# Compile regex globally for performance optimizations 
_LOC_CLEAN_REGEX = re.compile(r'(tp\.|tỉnh|thành phố|thành phố|t\.|tp )')

def _clean_loc(l: str) -> str:
    l = _LOC_CLEAN_REGEX.sub('', l).strip()
    # Normalize common variants
    if l in ['hcm', 'hồ chí minh', 'ho chi minh', 'tp hcm', 'tp.hcm']:
        return 'hồ chí minh'
    if l in ['hn', 'hà nội', 'ha noi', 'tp hà nội', 'tp.hà nội']:
        return 'hà nội'
    return l


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
        self._cand_feature_hash_cache = {}
        self._feature_cache_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "processed", "candidate_feature_cache.json")
        )
        self._persistent_feature_cache = self._load_feature_cache()

    def _candidate_feature_hash(self, candidate: Dict) -> str:
        raw_text = f"{str(candidate.get('desired_job') or '')}\0{str(candidate.get('skills') or '')}"
        return hashlib.sha1(raw_text.encode("utf-8", errors="ignore")).hexdigest()

    def _load_feature_cache(self) -> Dict:
        if not os.path.exists(self._feature_cache_path):
            return {}

        try:
            with open(self._feature_cache_path, "r", encoding="utf-8") as handle:
                payload = json.load(handle)
        except Exception as exc:
            logger.warning(f"Could not load candidate feature cache: {exc}")
            return {}

        if payload.get("model_name") != self.embedder.model_name:
            return {}
        if payload.get("embedding_dim") != self.embedder.embedding_dim:
            return {}
        return payload.get("candidates", {})

    def _restore_candidate_feature(self, candidate_id: int, feature_hash: str) -> bool:
        cached = self._persistent_feature_cache.get(str(candidate_id))
        if not cached or cached.get("hash") != feature_hash:
            return False

        try:
            embedding_bytes = base64.b64decode(cached["embedding"])
            embedding = np.frombuffer(embedding_bytes, dtype=np.float32)
            if embedding.size != self.embedder.embedding_dim:
                return False
            self._cand_embeddings_cache[candidate_id] = embedding
            self._cand_skills_cache[candidate_id] = set(cached.get("skills", []))
            self._cand_feature_hash_cache[candidate_id] = feature_hash
            return True
        except Exception as exc:
            logger.warning(f"Could not restore cached candidate feature {candidate_id}: {exc}")
            return False

    def _persist_candidate_features(self, features: Dict[int, Dict]) -> None:
        if not features:
            return

        self._persistent_feature_cache.update({str(candidate_id): data for candidate_id, data in features.items()})
        payload = {
            "version": 1,
            "model_name": self.embedder.model_name,
            "embedding_dim": self.embedder.embedding_dim,
            "candidates": self._persistent_feature_cache,
        }

        try:
            os.makedirs(os.path.dirname(self._feature_cache_path), exist_ok=True)
            tmp_path = f"{self._feature_cache_path}.tmp"
            with open(tmp_path, "w", encoding="utf-8") as handle:
                json.dump(payload, handle, separators=(",", ":"))
            os.replace(tmp_path, self._feature_cache_path)
        except Exception as exc:
            logger.warning(f"Could not write candidate feature cache: {exc}")

    def clear_candidate_cache(self, candidate_id: int = None) -> None:
        if candidate_id is None:
            self._cand_embeddings_cache.clear()
            self._cand_skills_cache.clear()
            self._cand_feature_hash_cache.clear()
            return

        self._cand_embeddings_cache.pop(candidate_id, None)
        self._cand_skills_cache.pop(candidate_id, None)
        self._cand_feature_hash_cache.pop(candidate_id, None)
    
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
        
        skill_score, matched_skills, missing_skills = self._skill_match(job, candidate, job_skills, cand_skills)
        scores['skill_match'] = skill_score
        scores['matched_skills'] = list(matched_skills)
        scores['missing_skills'] = list(missing_skills)
        
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
    
    def _skill_match(self, job: Dict, candidate: Dict, job_skills: set = None, cand_skills: set = None) -> Tuple[float, set, set]:
        """Skill overlap logic returning (score, matched_skills, missing_skills)."""
        if job_skills is None:
            job_skills = set(extract_skills(
                f"{str(job.get('job_title') or '')} {str(job.get('job_requirements') or '')}"
            ))
            # Clean raw strings (prevent mismatch due to noise)
            job_skills = {s.strip().lower() for s in job_skills if s.strip()}
            
        if cand_skills is None:
            cand_skills = set(extract_skills(
                str(candidate.get('skills') or '')
            ))
            # Clean raw strings (prevent mismatch due to noise)
            cand_skills = {s.strip().lower() for s in cand_skills if s.strip()}
            
        # Exact match required for 'không yêu cầu kinh nghiệm' to not penalize
        ignore_skills = {"không yêu cầu kinh nghiệm", "không yêu cầu", "chưa có kinh nghiệm"}
        
        # We assume job_skills and cand_skills are already pre-cleaned if they were passed in
        final_job_skills = job_skills - ignore_skills
        final_cand_skills = cand_skills - ignore_skills
        
        if not final_job_skills:
            return 1.0, set(), set()
        
        overlap_skills = final_job_skills & final_cand_skills
        missing_skills = final_job_skills - final_cand_skills
        score = min(len(overlap_skills) / len(final_job_skills), 1.0)
        return score, overlap_skills, missing_skills
    
    def _experience_match(self, job: Dict, candidate: Dict) -> float:
        """Experience requirement satisfaction."""
        job_exp_text = str(job.get('years_of_experience') or '0').lower().strip()
        
        # Explicit bypass for "không yêu cầu kinh nghiệm" mapping from job descriptions
        if 'không yêu cầu' in job_exp_text or 'không c' in job_exp_text:
            return 1.0
            
        try:
            required = parse_experience_years(job_exp_text)
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
        
        # Fix logic for identical locations so it correctly rewards 100% instead of treating 'unknown' as 50%
        if job_loc and cand_loc and (job_loc == cand_loc or job_loc in cand_loc or cand_loc in job_loc):
            return 1.0, False

        # Missing data handling
        if not job_loc or not cand_loc or job_loc == 'unknown' or cand_loc == 'unknown':
            return 0.5, False  # Neutral, no strong penalty
            
        c_job = _clean_loc(job_loc)
        c_cand = _clean_loc(cand_loc)
        
        # If exact match or clear substring
        if c_job == c_cand or c_job in c_cand or c_cand in c_job:
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
            
        raw_job_skills = set(extract_skills(f"{str(job.get('job_title') or '')} {str(job.get('job_requirements') or '')}"))
        job_skills = {s.strip().lower() for s in raw_job_skills if s.strip()}

        logger.info(f"[TIMING] Job features precomputed in {time.time() - start_time:.2f}s")
        
        # Batch embed candidates for massive speedup + Caching
        cand_start = time.time()
        uncached_cands = []
        cand_texts = []
        uncached_hashes = {}
        for c in candidates:
            cid = c.get('id')
            feature_hash = self._candidate_feature_hash(c)
            has_memory_cache = (
                cid in self._cand_embeddings_cache
                and cid in self._cand_skills_cache
                and self._cand_feature_hash_cache.get(cid) == feature_hash
            )
            if has_memory_cache or self._restore_candidate_feature(cid, feature_hash):
                continue

            uncached_cands.append(c)
            uncached_hashes[cid] = feature_hash
            skills_str = str(c.get('skills') or '')
            raw_cand_skills = set(extract_skills(skills_str))
            self._cand_skills_cache[cid] = {s.strip().lower() for s in raw_cand_skills if s.strip()}
            self._cand_feature_hash_cache[cid] = feature_hash
            cand_texts.append(normalize_text(f"{str(c.get('desired_job') or '')} {skills_str}"))

        if uncached_cands and cand_texts:
            logger.info(f"Computing embeddings and features for {len(uncached_cands)} uncached candidates...")
            try:
                new_embs = self.embedder.embed(cand_texts, batch_size=128)
                persistent_updates = {}
                for c, emb in zip(uncached_cands, new_embs):
                    cid = c.get('id')
                    emb32 = np.asarray(emb, dtype=np.float32)
                    self._cand_embeddings_cache[cid] = emb32
                    persistent_updates[cid] = {
                        "hash": uncached_hashes.get(cid),
                        "embedding": base64.b64encode(emb32.tobytes()).decode("ascii"),
                        "skills": sorted(self._cand_skills_cache.get(cid, set())),
                    }
                self._persist_candidate_features(persistent_updates)
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
