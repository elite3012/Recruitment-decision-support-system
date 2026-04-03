"""
Unified candidate-job matching, ranking, and scoring module.

This module implements heuristic-based candidate-job matching using:
- Pre-trained semantic embeddings for text similarity (not a trained model)
- Skill set intersection for technical requirement matching
- Linear scoring for experience requirements
- Keyword overlap for job description alignment

The system uses weighted aggregation of these scores to rank candidates.
This is a heuristic-based approach, NOT a machine learning classification model.
"""
from typing import Dict, List, Tuple, Optional
import numpy as np
from config.settings import (
    FEATURE_WEIGHTS, MIN_SIMILARITY_SCORE, STRONG_SIMILARITY_THRESHOLD,
    MEDIUM_SIMILARITY_THRESHOLD, TOP_K_CANDIDATES, MIN_CANDIDATES_TO_SHOW
)
from src.utils.logging import setup_logging
from src.models.embedder import EmbedderService
from src.processing import normalize_text, extract_skills

logger = setup_logging(__name__)

# Singleton embedder instance for efficiency
_embedder_instance: Optional[EmbedderService] = None


def get_embedder() -> EmbedderService:
    """Get or create embedder singleton."""
    global _embedder_instance
    if _embedder_instance is None:
        _embedder_instance = EmbedderService("all-MiniLM-L6-v2")
    return _embedder_instance


# ============================================================================
# SIMILARITY COMPUTATION
# ============================================================================

def compute_text_similarity(text1: str, text2: str) -> float:
    """
    Compute semantic similarity between texts using transformer embeddings.
    
    Args:
        text1: First text
        text2: Second text
    
    Returns:
        Similarity score (0-1)
    """
    if not text1 or not text2:
        return 0.0
    
    try:
        embedder = get_embedder()
        emb1 = embedder.embed(str(text1))
        emb2 = embedder.embed(str(text2))
        return embedder.similarity(emb1[0], emb2[0])
    except Exception as e:
        logger.warning(f"Text similarity computation failed: {e}")
        return 0.0


def compute_skill_similarity(job_skills: set, candidate_skills: set) -> float:
    """
    Compute skill overlap similarity.
    
    When job_skills cannot be extracted (empty set), returns 0.0 instead of 1.0
    to avoid false perfect matches. This prevents candidates from appearing as
    100% skill match when the job description has no extractable skills.
    
    Args:
        job_skills: Set of required skills
        candidate_skills: Set of candidate skills
    
    Returns:
        Similarity score (0-1)
    """
    # When no job skills extracted, don't return 1.0 (perfect match)
    # Instead return 0.0 to signal incomplete skill data
    if not job_skills:
        logger.debug("No job skills extracted for comparison")
        return 0.0
    
    if not candidate_skills:
        return 0.0
    
    overlap = len(job_skills & candidate_skills)
    return min(overlap / len(job_skills), 1.0)


def compute_experience_similarity(required_years: int, candidate_years: int) -> float:
    """
    Compute experience match score.
    
    Args:
        required_years: Required years of experience
        candidate_years: Candidate's years
    
    Returns:
        Similarity score (0-1)
    """
    if required_years == 0:
        return 1.0
    
    candidate_years = max(int(candidate_years), 0)
    ratio = candidate_years / required_years
    return min(ratio, 1.0) if ratio > 0 else 0.0


def compute_keyword_similarity(job_keywords: list, candidate_keywords: list) -> float:
    """
    Compute keyword overlap similarity using Jaccard index.
    
    Args:
        job_keywords: List of job keywords
        candidate_keywords: List of candidate keywords
    
    Returns:
        Similarity score (0-1)
    """
    job_set = set(job_keywords) if job_keywords else set()
    candidate_set = set(candidate_keywords) if candidate_keywords else set()
    
    if not job_set or not candidate_set:
        return 0.0
    
    intersection = len(job_set & candidate_set)
    union = len(job_set | candidate_set)
    
    return intersection / union if union > 0 else 0.0


# ============================================================================
# MATCH SCORE COMPUTATION
# ============================================================================

def compute_match_scores(job_features: Dict, candidate_features: Dict) -> Dict[str, float]:
    """
    Compute all component match scores using semantic matching.
    
    Returns:
        Dictionary with component scores:
        - skills_match: skill overlap (0-1)
        - experience_match: experience requirement satisfaction (0-1)
        - title_similarity: semantic similarity of job title to desired role (0-1)
        - keyword_match: keyword overlap (0-1)
    """
    scores = {
        'skills_match': compute_skill_similarity(
            job_features.get('required_skills', set()),
            candidate_features.get('skills', set())
        ),
        'experience_match': compute_experience_similarity(
            job_features.get('required_years', 0),
            candidate_features.get('experience_years', 0)
        ),
        'title_similarity': compute_text_similarity(
            job_features.get('title', ''),
            candidate_features.get('desired_job', '')
        ),
        'keyword_match': compute_keyword_similarity(
            job_features.get('keywords', []),
            candidate_features.get('target_keywords', [])
        )
    }
    
    return scores


def compute_fit_score(component_scores: Dict[str, float]) -> float:
    """
    Compute weighted fit score from component scores.
    
    Args:
        component_scores: Dict of component scores from matching
    
    Returns:
        Weighted fit score (0-1)
    """
    fit_score = 0.0
    total_weight = 0.0
    
    score_mapping = {
        'skills_match': 'skills_match',
        'experience_match': 'experience_match',
        'title_similarity': 'title_similarity',
        'keyword_match': 'education_fit',  # Use keyword as proxy for education
    }
    
    for component, score in component_scores.items():
        weight_key = score_mapping.get(component, component)
        weight = FEATURE_WEIGHTS.get(weight_key, 0.0)
        
        fit_score += score * weight
        total_weight += weight
    
    if total_weight > 0:
        return fit_score / total_weight
    else:
        return 0.0


def scale_score_to_percentage(fit_score: float) -> int:
    """
    Convert fit score (0-1) to percentage (0-100).
    
    Args:
        fit_score: Score between 0 and 1
    
    Returns:
        Percentage (0-100)
    """
    return int(max(0, min(100, fit_score * 100)))


# ============================================================================
# FILTERING
# ============================================================================

def apply_hard_filters(
    job_features: Dict,
    candidate_features: Dict,
    require_skills_match: bool = True,
    require_experience_match: bool = True
) -> Tuple[bool, List[str]]:
    """
    Apply hard filters to determine basic eligibility.
    
    Args:
        job_features: Job features dict
        candidate_features: Candidate features dict
        require_skills_match: If True, candidate must have some required skills
        require_experience_match: If True, candidate must meet minimum experience
    
    Returns:
        Tuple of (passes_filters, list_of_reasons)
    """
    reasons = []
    passes = True
    
    # Filter 1: Skill match (if enabled)
    if require_skills_match:
        job_skills = job_features.get('required_skills', set())
        candidate_skills = candidate_features.get('skills', set())
        
        if job_skills and len(job_skills) > 0:
            skill_match = len(job_skills.intersection(candidate_skills)) > 0
            if not skill_match:
                passes = False
                reasons.append("No matching required skills")
    
    # Filter 2: Experience match (if enabled)
    if require_experience_match:
        required_years = job_features.get('required_years', 0)
        candidate_years = candidate_features.get('experience_years', 0)
        
        if required_years > 0 and candidate_years < required_years:
            passes = False
            reasons.append(f"Insufficient experience: {candidate_years} vs {required_years} required")
    
    return passes, reasons


def filter_candidates_by_job(
    job_features: Dict,
    all_candidate_features: List[Dict],
    filter_level: str = 'medium'
) -> List[Tuple[int, List[str]]]:
    """
    Filter candidate pool for a given job.
    
    Args:
        job_features: Job features dict
        all_candidate_features: List of all candidate feature dicts
        filter_level: 'strict', 'medium', or 'relaxed'
    
    Returns:
        List of (candidate_id, filter_reasons) tuples for passing candidates
    """
    eligible_candidates = []
    
    require_skills = filter_level in ['strict', 'medium']
    require_experience = filter_level == 'strict'
    
    for candidate_features in all_candidate_features:
        passes, reasons = apply_hard_filters(
            job_features,
            candidate_features,
            require_skills_match=require_skills,
            require_experience_match=require_experience
        )
        
        if passes:
            candidate_id = candidate_features.get('user_id')
            eligible_candidates.append((candidate_id, reasons))
    
    logger.info(
        f"Filter identified {len(eligible_candidates)} eligible candidates "
        f"for job {job_features.get('job_id')} (level={filter_level})"
    )
    
    return eligible_candidates


# ============================================================================
# RANKING
# ============================================================================

def rank_candidates(
    job_features: Dict,
    candidate_features_list: List[Dict],
    min_score: float = 0.0,
    top_k: int = None
) -> List[Tuple[int, float, int, Dict]]:
    """
    Rank candidates for a job by fit score.
    
    Args:
        job_features: Job feature dict
        candidate_features_list: List of candidate feature dicts
        min_score: Minimum score filter (0-1)
        top_k: Number of top candidates to return
    
    Returns:
        List of (candidate_id, fit_score, percentage, component_scores)
    """
    if top_k is None:
        top_k = TOP_K_CANDIDATES
    
    ranked_candidates = []
    
    for candidate_features in candidate_features_list:
        # Compute component scores
        component_scores = compute_match_scores(job_features, candidate_features)
        
        # Compute overall fit score
        fit_score = compute_fit_score(component_scores)
        
        # Filter by minimum score
        if fit_score < min_score:
            continue
        
        percentage = scale_score_to_percentage(fit_score)
        candidate_id = candidate_features.get('user_id')
        
        ranked_candidates.append((
            candidate_id,
            fit_score,
            percentage,
            component_scores
        ))
    
    # Sort by fit score descending
    ranked_candidates.sort(key=lambda x: x[1], reverse=True)
    
    # Ensure minimum number of candidates shown
    if len(ranked_candidates) < MIN_CANDIDATES_TO_SHOW:
        logger.warning(
            f"Only {len(ranked_candidates)} candidates meet minimum score; "
            f"showing all {len(ranked_candidates)}"
        )
    else:
        ranked_candidates = ranked_candidates[:top_k]
    
    logger.info(
        f"Ranked {len(ranked_candidates)} candidates for job {job_features.get('job_id')}"
    )
    
    return ranked_candidates


def get_top_candidate(ranked_candidates: List[Tuple]) -> Optional[Tuple]:
    """
    Get top candidate from ranked list.
    
    Args:
        ranked_candidates: Ranked candidates list
    
    Returns:
        Top candidate tuple or None
    """
    if ranked_candidates:
        return ranked_candidates[0]
    return None


def get_candidate_rank_position(ranked_candidates: List[Tuple], candidate_id: int) -> int:
    """
    Get rank position of a candidate.
    
    Args:
        ranked_candidates: Ranked candidates list
        candidate_id: Candidate ID to find
    
    Returns:
        Rank position (1-indexed) or -1 if not found
    """
    for i, (cand_id, *_) in enumerate(ranked_candidates):
        if cand_id == candidate_id:
            return i + 1
    return -1


# ============================================================================
# EXPLANATIONS
# ============================================================================

def generate_match_explanation(
    job_features: Dict,
    candidate_features: Dict,
    fit_score: float,
    component_scores: Dict[str, float]
) -> Dict[str, any]:
    """
    Generate detailed explanation for why candidate was ranked.
    
    Args:
        job_features: Job features
        candidate_features: Candidate features
        fit_score: Overall fit score (0-1)
        component_scores: Component scores
    
    Returns:
        Dict with explanation text, strengths, and concerns
    """
    explanation = {
        'overall_assessment': '',
        'key_strengths': [],
        'concerns': [],
        'matched_skills': [],
        'missing_skills': [],
        'recommendation': ''
    }
    
    # Overall assessment
    percentage = int(fit_score * 100)
    if fit_score >= 0.8:
        explanation['overall_assessment'] = (
            f"This candidate is a strong match ({percentage}%) for the position."
        )
    elif fit_score >= 0.6:
        explanation['overall_assessment'] = (
            f"This candidate is a good match ({percentage}%) with relevant qualifications."
        )
    elif fit_score >= 0.4:
        explanation['overall_assessment'] = (
            f"This candidate shows moderate match ({percentage}%) and may be worth reviewing."
        )
    else:
        explanation['overall_assessment'] = (
            f"This candidate has limited match ({percentage}%) with the position."
        )
    
    # Skill matching
    job_skills = job_features.get('required_skills', set())
    candidate_skills = candidate_features.get('skills', set())
    
    matched_skills = job_skills.intersection(candidate_skills) if job_skills and candidate_skills else set()
    missing_skills = job_skills - candidate_skills if job_skills else set()
    
    explanation['matched_skills'] = list(matched_skills)
    explanation['missing_skills'] = list(missing_skills)
    
    # Strengths
    if len(matched_skills) > 0:
        explanation['key_strengths'].append(
            f"Possesses {len(matched_skills)} required skills: {', '.join(matched_skills)}"
        )
    
    experience_score = component_scores.get('experience_match', 0.0)
    if experience_score >= 0.8:
        candidate_years = candidate_features.get('experience_years', 0)
        required_years = job_features.get('required_years', 0)
        explanation['key_strengths'].append(
            f"Meets experience requirement with {candidate_years} years ({required_years} required)"
        )
    
    title_score = component_scores.get('title_similarity', 0.0)
    if title_score >= 0.6:
        explanation['key_strengths'].append(
            "Background aligns well with desired job title"
        )
    
    # Concerns
    if len(missing_skills) > 0:
        explanation['concerns'].append(
            f"Missing {len(missing_skills)} required skills: {', '.join(missing_skills)}"
        )
    
    experience_score = component_scores.get('experience_match', 0.0)
    if experience_score < 0.5:
        candidate_years = candidate_features.get('experience_years', 0)
        required_years = job_features.get('required_years', 0)
        explanation['concerns'].append(
            f"Experience gap: {candidate_years} years vs {required_years} required"
        )
    
    title_score = component_scores.get('title_similarity', 0.0)
    if title_score < 0.4:
        explanation['concerns'].append(
            "Background differs from desired job title"
        )
    
    # Recommendation
    if fit_score >= 0.8:
        explanation['recommendation'] = "Strongly recommend for interview"
    elif fit_score >= 0.6:
        explanation['recommendation'] = "Recommend for review and potential interview"
    elif fit_score >= 0.4:
        explanation['recommendation'] = "Consider reviewing full profile"
    else:
        explanation['recommendation'] = "May not be suitable; review additional factors"
    
    return explanation
