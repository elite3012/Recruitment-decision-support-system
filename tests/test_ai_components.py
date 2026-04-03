#!/usr/bin/env python
"""
Quick test of the new AI components with existing data.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend'))

from src.storage.database import Database
from inference.service import MatchingInferenceService
import time

def test_inference_service():
    """Test the inference service with real data."""
    print("\n" + "="*60)
    print("Testing MatchingInferenceService")
    print("="*60)
    
    # Initialize service
    print("\n1. Initializing inference service...")
    start = time.time()
    service = MatchingInferenceService(db_path="data/app.db")
    print(f"   ✓ Service initialized ({time.time()-start:.2f}s)")
    
    # Test single match
    print("\n2. Testing single candidate-job match...")
    start = time.time()
    scores = service.match_candidate_to_job(candidate_id=1, job_id=1)
    elapsed = time.time() - start
    print(f"   ✓ Match scored ({elapsed*1000:.0f}ms)")
    print(f"     Overall Score: {scores['overall_score']:.2%}")
    print(f"     Text Similarity: {scores['text_similarity']:.2%}")
    print(f"     Skill Match: {scores['skill_match']:.2%}")
    print(f"     Experience Match: {scores['experience_match']:.2%}")
    
    # Test ranking
    print("\n3. Testing candidate ranking for a job...")
    start = time.time()
    ranked = service.rank_candidates_for_job(job_id=1, top_k=5)
    elapsed = time.time() - start
    print(f"   ✓ Ranked 5 candidates ({elapsed*1000:.0f}ms)")
    print("\n   Top 5 Candidates:")
    for idx, (cand_id, scores) in enumerate(ranked, 1):
        print(f"     {idx}. Candidate {cand_id}: {scores['overall_score']:.2%}")
    
    print("\n" + "="*60)
    print("All tests passed!")
    print("="*60 + "\n")

if __name__ == "__main__":
    test_inference_service()
