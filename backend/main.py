from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os
import uvicorn

# Ensure the backend directory is in the path for relative imports if needed
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from inference.service import MatchingInferenceService

app = FastAPI(title="Recruitment Decision Support System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global service instance
inference_service = None

@app.on_event("startup")
async def startup_event():
    global inference_service
    # Pointing to the database situated at the root level relative to `backend`
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "app.db")
    inference_service = MatchingInferenceService(db_path=db_path)
    
    # Preload the embedder (the matching service initializes it, usually lazily, 
    # but we can invoke a lightweight operation to trigger loading)
    print("Loading inference service and embedding models...")

@app.get("/api/dashboard/summary")
def get_dashboard_summary():
    """High-level metrics for the executive dashboard"""
    try:
        jobs = inference_service.db.get_all_jobs()
        candidates = inference_service.db.get_all_candidates()
        return {
            "total_jobs": len(jobs),
            "total_candidates": len(candidates),
            "system_status": "Online",
        }
    except Exception as e:
        print(f"Error fetching dashboard summary: {e}")
        return {
            "total_jobs": 0,
            "total_candidates": 0,
            "system_status": "Database Unreachable",
        }

@app.get("/api/dashboard/distributions")
def get_dashboard_distributions():
    """Distributions for jobs and candidates"""
    try:
        jobs = inference_service.db.get_all_jobs()
        candidates = inference_service.db.get_all_candidates()

        job_counts = {}
        for j in jobs:
            ind = getattr(j, 'industry', '') or 'Unknown'
            job_counts[ind] = job_counts.get(ind, 0) + 1

        candidate_counts = {}
        for c in candidates:
            role = getattr(c, 'desired_job', '') or 'Unknown'
            candidate_counts[role] = candidate_counts.get(role, 0) + 1
        
        job_data = [{"name": (k[:20] + '...') if len(k) > 20 else k, "value": v} for k, v in sorted(job_counts.items(), key=lambda x: x[1], reverse=True)[:6]]
        candidate_data = [{"name": (k[:20] + '...') if len(k) > 20 else k, "value": v} for k, v in sorted(candidate_counts.items(), key=lambda x: x[1], reverse=True)[:6]]

        return {
            "jobs_by_industry": job_data,
            "candidates_by_role": candidate_data
        }
    except Exception as e:
        print(f"Error fetching dashboard distributions: {e}")
        return {"jobs_by_industry": [], "candidates_by_role": []}

@app.get("/api/jobs")
def get_jobs():
    """List available jobs for the selection view."""
    try:
        jobs = inference_service.db.get_all_jobs()
        return [
            {
                "id": j.job_id,
                "title": j.job_title,
                "skills": j.job_requirements,
                "location": getattr(j, 'location', '') or getattr(j, 'job_address', '') or '',
            }
            for j in jobs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/jobs/{job_id}/ranking")
def rank_candidates(job_id: int, top_k: int = 50):
    """Semantic ranking of all candidates against a specific job"""
    try:
        ranked = inference_service.rank_candidates_for_job(job_id=job_id, top_k=top_k)
        if ranked is None:
            raise HTTPException(status_code=404, detail="Job not found")
            
        # Retrieve historical decisions for this job just once
        actions = inference_service.db.get_recruiter_actions(job_id)
        decision_map = {act.user_id: act.decision for act in actions}
        
        # ranked is essentially [(candidate_dict, scores_dict), ...]
        response = []
        for cand, scores in ranked:
            if cand.get('id') == -1: # safe fallback in case of malformed candidate ID
                continue
                
            c_id = cand.get('id')
            response.append({
                "candidate_id": c_id,
                "name": cand.get('name'),
                "title": cand.get('desired_job'),
                "location": cand.get('location'),
                "experience": cand.get('experience_years'),
                "expected_salary": cand.get('expected_salary'),
                "gender": cand.get('gender'),
                "scores": scores,
                "decision": decision_map.get(c_id)
            })
        return {"job_id": job_id, "ranking": response}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal processing error computing candidate ranking")

@app.get("/api/jobs/{job_id}/candidates/{candidate_id}")
def match_detail(job_id: int, candidate_id: int):
    """Detailed feature comparison of a specific candidate and job"""
    try:
        scores = inference_service.match_candidate_to_job(candidate_id=candidate_id, job_id=job_id)
        if scores is None:
            raise HTTPException(status_code=404, detail="Job or Candidate not found")
            
        job = inference_service.db.get_job_by_id(job_id)
        cand = inference_service.db.get_candidate_by_id(candidate_id)
        
        # Grab decision if it exists
        match = inference_service.db.get_match(job_id, candidate_id)
        decision_info = None
        if match:
            action = inference_service.db.get_recruiter_action_for_match(match.match_id)
            if action:
                decision_info = {
                    "action": action.decision,
                    "notes": action.notes
                }
        
        return {
            "job_id": job_id,
            "candidate_id": candidate_id,
            "scores": scores,
            "decision": decision_info,
            "job": {
                "title": getattr(job, 'job_title', '') or '',
                "location": getattr(job, 'location', '') or getattr(job, 'job_address', '') or '',
                "experience": getattr(job, 'years_of_experience', '') or '',
                "degree": getattr(job, 'degree_required', '') or '',
                "skills": getattr(job, 'job_requirements', '') or '',
                "description": getattr(job, 'job_description', '') or ''
            },
            "candidate": {
                "name": getattr(cand, 'user_name', '') or getattr(cand, 'name', '') or '',
                "title": getattr(cand, 'desired_job', '') or '',
                "location": getattr(cand, 'location', '') or getattr(cand, 'workplace_desired', '') or '',
                "experience": getattr(cand, 'work_experience', '') or getattr(cand, 'experience_years', '') or '',
                "degree": getattr(cand, 'degree', '') or '',
                "skills": getattr(cand, 'skills', '') or '',
                "industry": getattr(cand, 'industry', '') or '',
                "desired_salary": getattr(cand, 'desired_salary', '') or '',
                "age": getattr(cand, 'age', '') or '',
                "target": getattr(cand, 'target', '') or '',
                "gender": getattr(cand, 'gender', '') or '',
                "marriage": getattr(cand, 'marriage', '') or ''
            }
        }
    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal processing error generating candidate detail")

class DecisionRequest(BaseModel):
    action: str
    notes: str = ""
    recruiter_name: str = "Admin"

class BulkDecisionRequest(BaseModel):
    candidate_ids: list[int]
    action: str
    notes: str = ""

@app.post("/api/jobs/{job_id}/bulk-decisions")
def save_bulk_decision(job_id: int, request: BulkDecisionRequest):
    """Persist recruiter action to the database for multiple candidates"""
    try:
        updated = 0
        for candidate_id in request.candidate_ids:
            match = inference_service.db.get_match(job_id, candidate_id)
            if not match:
                scores = inference_service.match_candidate_to_job(candidate_id=candidate_id, job_id=job_id)
                match_data = {
                    "job_id": job_id, "user_id": candidate_id,
                    "fit_score": scores.get("overall_score", 0.0),
                    "fit_percentage": int(scores.get("overall_score", 0.0) * 100)
                }
                match = inference_service.db.add_match(match_data)
            action_data = {
                "job_id": job_id, "user_id": candidate_id,
                "match_id": match.match_id, "decision": request.action, "notes": request.notes
            }
            inference_service.db.add_recruiter_action(action_data)
            updated += 1
        return {"status": "success", "message": f"{request.action} recorded for {updated} candidates"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/jobs/{job_id}/candidates/{candidate_id}/decisions")
def save_decision(job_id: int, candidate_id: int, decision: DecisionRequest):
    """Persist recruiter action to the database via storage layer logic"""
    try:
        # 1. Fetch match to get match_id or compute one if not present
        match = inference_service.db.get_match(job_id, candidate_id)
        if not match:
            scores = inference_service.match_candidate_to_job(candidate_id=candidate_id, job_id=job_id)
            match_data = {
                "job_id": job_id,
                "user_id": candidate_id,
                "fit_score": scores.get("overall_score", 0.0),
                "fit_percentage": int(scores.get("overall_score", 0.0) * 100)
            }
            match = inference_service.db.add_match(match_data)
        
        # 2. Save recruiter action
        action_data = {
            "job_id": job_id,
            "user_id": candidate_id,
            "match_id": match.match_id,
            "decision": decision.action,
            "notes": decision.notes
        }
        
        inference_service.db.add_recruiter_action(action_data)
        return {"status": "success", "message": f"{decision.action} recorded"}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/jobs/{job_id}/decisions")
def get_job_decisions(job_id: int):
    """Retrieve historical recruiter actions for a job snippet"""
    try:
        actions = inference_service.db.get_recruiter_actions(job_id)
        results = []
        for action in actions:
            cand = inference_service.db.get_candidate_by_id(action.user_id)
            if cand:
                results.append({
                    "action_id": action.action_id,
                    "candidate_id": action.user_id,
                    "name": getattr(cand, 'user_name', '') or getattr(cand, 'name', '') or 'Unknown',
                    "title": getattr(cand, 'desired_job', '') or '',
                    "decision": getattr(action, 'decision', ''),
                    "notes": getattr(action, 'notes', '') or '',
                    "timestamp": str(getattr(action, 'updated_at', '')) or str(getattr(action, 'created_at', '')) or ''
                })
        return {"job_id": job_id, "decisions": results}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/jobs/{job_id}/decisions")
def get_job_decisions(job_id: int):
    try:
        actions = inference_service.db.get_recruiter_actions(job_id)
        results = []
        for action in actions:
            cand = inference_service.db.get_candidate_by_id(action.user_id)
            if cand:
                results.append({
                    "action_id": action.action_id,
                    "candidate_id": action.user_id,
                    "name": getattr(cand, 'user_name', '') or getattr(cand, 'name', '') or 'Unknown',
                    "title": getattr(cand, 'desired_job', '') or '',
                    "decision": getattr(action, 'decision', ''),
                    "notes": getattr(action, 'notes', '') or '',
                    "timestamp": str(getattr(action, 'updated_at', '')) or str(getattr(action, 'created_at', '')) or ''
                })
        return {"job_id": job_id, "decisions": results}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
