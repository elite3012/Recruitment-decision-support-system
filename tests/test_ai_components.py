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
    
    db_path = "data/app.db"
    db = Database(db_path)
    jobs = db.get_all_jobs()
    candidates = db.get_all_candidates()
    assert jobs and candidates, "Seed data is required for this integration smoke test"

    job_id = jobs[0].job_id
    candidate_id = candidates[0].user_id

    # Initialize service
    print("\n1. Initializing inference service...")
    start = time.time()
    service = MatchingInferenceService(db_path=db_path)
    print(f"   ✓ Service initialized ({time.time()-start:.2f}s)")
    
    # Test single match
    print("\n2. Testing single candidate-job match...")
    start = time.time()
    scores = service.match_candidate_to_job(candidate_id=candidate_id, job_id=job_id)
    elapsed = time.time() - start
    assert scores is not None
    print(f"   ✓ Match scored ({elapsed*1000:.0f}ms)")
    print(f"     Overall Score: {scores['overall_score']:.2%}")
    print(f"     Text Similarity: {scores['text_similarity']:.2%}")
    print(f"     Skill Match: {scores['skill_match']:.2%}")
    print(f"     Experience Match: {scores['experience_match']:.2%}")
    
    # Test ranking
    print("\n3. Testing candidate ranking for a job...")
    start = time.time()
    ranked = service.rank_candidates_for_job(job_id=job_id, top_k=5)
    elapsed = time.time() - start
    assert ranked
    print(f"   ✓ Ranked 5 candidates ({elapsed*1000:.0f}ms)")
    print("\n   Top 5 Candidates:")
    for idx, (cand_id, scores) in enumerate(ranked, 1):
        print(f"     {idx}. Candidate {cand_id}: {scores['overall_score']:.2%}")
    
    print("\n" + "="*60)
    print("All tests passed!")
    print("="*60 + "\n")

if __name__ == "__main__":
    test_inference_service()
