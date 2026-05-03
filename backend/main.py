from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import base64
import hashlib
import hmac
import json
import os
import secrets
import sys
import time
import uvicorn

# Ensure the backend directory is in the path for relative imports if needed.
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

inference_service = None
VALID_DECISIONS = {"Shortlist", "Hold", "Reject"}
AUTH_SECRET = os.getenv("AUTH_SECRET", "local-dev-secret-change-me")
TOKEN_TTL_SECONDS = int(os.getenv("AUTH_TOKEN_TTL_SECONDS", "28800"))
DEFAULT_ADMIN_USERNAME = os.getenv("DEFAULT_ADMIN_USERNAME", "admin")
DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123")


class JobPayload(BaseModel):
    job_id: Optional[int] = None
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    company_overview: Optional[str] = None
    job_description: Optional[str] = None
    job_requirements: Optional[str] = None
    benefits: Optional[str] = None
    job_address: Optional[str] = None
    job_type: Optional[str] = None
    career_level: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    years_of_experience: Optional[str] = None
    salary: Optional[str] = None


class JobCreate(JobPayload):
    job_title: str


class CandidatePayload(BaseModel):
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    industry: Optional[str] = None
    desired_job: Optional[str] = None
    workplace_desired: Optional[str] = None
    desired_salary: Optional[str] = None
    age: Optional[int] = None
    target: Optional[str] = None
    skills: Optional[str] = None
    degree: Optional[str] = None
    work_experience: Optional[str] = None
    gender: Optional[str] = None
    location: Optional[str] = None
    marriage: Optional[str] = None


class CandidateCreate(CandidatePayload):
    user_name: str


class DecisionRequest(BaseModel):
    action: str
    notes: str = ""
    recruiter_name: str = ""


class BulkDecisionRequest(BaseModel):
    candidate_ids: list[int]
    action: str
    notes: str = ""
    recruiter_name: str = ""


class DecisionCreate(BaseModel):
    job_id: int
    user_id: int
    decision: str
    notes: str = ""
    recruiter_name: str = ""


class DecisionUpdate(BaseModel):
    decision: Optional[str] = None
    notes: Optional[str] = None
    recruiter_name: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


def get_service() -> MatchingInferenceService:
    global inference_service
    if inference_service is None:
        db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "app.db")
        inference_service = MatchingInferenceService(db_path=db_path)
    return inference_service


def payload_dict(model: BaseModel) -> dict:
    if hasattr(model, "model_dump"):
        return model.model_dump(exclude_unset=True)
    return model.dict(exclude_unset=True)


def serialize_user(user) -> dict:
    return {
        "user_id": user.user_id,
        "username": user.username,
        "full_name": user.full_name or user.username,
        "role": user.role or "admin",
    }


def hash_password(password: str, salt: Optional[str] = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120000)
    return f"pbkdf2_sha256${salt}${digest.hex()}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        algorithm, salt, stored_digest = password_hash.split("$", 2)
    except ValueError:
        return False

    if algorithm != "pbkdf2_sha256":
        return False

    expected = hash_password(password, salt).split("$", 2)[2]
    return hmac.compare_digest(expected, stored_digest)


def b64url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode("utf-8").rstrip("=")


def b64url_decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(value + padding)


def sign_token(payload: dict) -> str:
    encoded_payload = b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signature = hmac.new(AUTH_SECRET.encode("utf-8"), encoded_payload.encode("utf-8"), hashlib.sha256).digest()
    return f"{encoded_payload}.{b64url_encode(signature)}"


def create_token(user) -> str:
    now = int(time.time())
    return sign_token({
        "sub": user.user_id,
        "username": user.username,
        "role": user.role or "admin",
        "iat": now,
        "exp": now + TOKEN_TTL_SECONDS,
    })


def decode_token(token: str) -> dict:
    try:
        encoded_payload, encoded_signature = token.split(".", 1)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    expected_signature = hmac.new(
        AUTH_SECRET.encode("utf-8"),
        encoded_payload.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    actual_signature = b64url_decode(encoded_signature)
    if not hmac.compare_digest(expected_signature, actual_signature):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    payload = json.loads(b64url_decode(encoded_payload).decode("utf-8"))
    if int(payload.get("exp", 0)) < int(time.time()):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    return payload


def get_current_user(authorization: Optional[str] = Header(default=None)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authentication token")

    payload = decode_token(authorization.split(" ", 1)[1])
    user = get_service().db.get_user_by_id(int(payload["sub"]))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer exists")
    return user


def ensure_default_admin() -> None:
    service = get_service()
    if service.db.get_user_by_username(DEFAULT_ADMIN_USERNAME):
        return

    service.db.add_user({
        "username": DEFAULT_ADMIN_USERNAME,
        "password_hash": hash_password(DEFAULT_ADMIN_PASSWORD),
        "full_name": "Root Admin",
        "role": "admin",
    })


def serialize_job(job) -> dict:
    return {
        "id": job.job_id,
        "job_id": job.job_id,
        "title": job.job_title,
        "job_title": job.job_title,
        "company_name": getattr(job, "company_name", "") or "",
        "company_overview": getattr(job, "company_overview", "") or "",
        "description": getattr(job, "job_description", "") or "",
        "job_description": getattr(job, "job_description", "") or "",
        "skills": getattr(job, "job_requirements", "") or "",
        "job_requirements": getattr(job, "job_requirements", "") or "",
        "benefits": getattr(job, "benefits", "") or "",
        "job_address": getattr(job, "job_address", "") or "",
        "job_type": getattr(job, "job_type", "") or "",
        "career_level": getattr(job, "career_level", "") or "",
        "industry": getattr(job, "industry", "") or "",
        "location": getattr(job, "location", "") or getattr(job, "job_address", "") or "",
        "years_of_experience": getattr(job, "years_of_experience", "") or "",
        "salary": getattr(job, "salary", "") or "",
    }


def serialize_candidate(candidate) -> dict:
    return {
        "id": candidate.user_id,
        "candidate_id": candidate.user_id,
        "user_id": candidate.user_id,
        "name": getattr(candidate, "user_name", "") or "",
        "user_name": getattr(candidate, "user_name", "") or "",
        "industry": getattr(candidate, "industry", "") or "",
        "title": getattr(candidate, "desired_job", "") or "",
        "desired_job": getattr(candidate, "desired_job", "") or "",
        "workplace_desired": getattr(candidate, "workplace_desired", "") or "",
        "desired_salary": getattr(candidate, "desired_salary", "") or "",
        "age": getattr(candidate, "age", None),
        "target": getattr(candidate, "target", "") or "",
        "skills": getattr(candidate, "skills", "") or "",
        "degree": getattr(candidate, "degree", "") or "",
        "experience": getattr(candidate, "work_experience", "") or "",
        "work_experience": getattr(candidate, "work_experience", "") or "",
        "gender": getattr(candidate, "gender", "") or "",
        "location": getattr(candidate, "location", "") or getattr(candidate, "workplace_desired", "") or "",
        "marriage": getattr(candidate, "marriage", "") or "",
    }


def serialize_decision(action) -> dict:
    candidate = get_service().db.get_candidate_by_id(action.user_id)
    return {
        "action_id": action.action_id,
        "match_id": action.match_id,
        "job_id": action.job_id,
        "candidate_id": action.user_id,
        "user_id": action.user_id,
        "name": getattr(candidate, "user_name", "") if candidate else "Unknown",
        "title": getattr(candidate, "desired_job", "") if candidate else "",
        "decision": getattr(action, "decision", "") or "",
        "notes": getattr(action, "notes", "") or "",
        "recruiter_name": getattr(action, "recruiter_name", "") or "Admin",
        "timestamp": str(getattr(action, "updated_at", "") or getattr(action, "created_at", "") or ""),
        "created_at": str(getattr(action, "created_at", "") or ""),
        "updated_at": str(getattr(action, "updated_at", "") or ""),
    }


def clear_candidate_cache(candidate_id: Optional[int] = None) -> None:
    service = get_service()
    matcher = getattr(service, "matcher", None)
    if not matcher:
        return

    if hasattr(matcher, "clear_candidate_cache"):
        matcher.clear_candidate_cache(candidate_id)
        return

    if candidate_id is None:
        matcher._cand_embeddings_cache.clear()
        matcher._cand_skills_cache.clear()
        if hasattr(matcher, "_cand_feature_hash_cache"):
            matcher._cand_feature_hash_cache.clear()
        return

    matcher._cand_embeddings_cache.pop(candidate_id, None)
    matcher._cand_skills_cache.pop(candidate_id, None)
    if hasattr(matcher, "_cand_feature_hash_cache"):
        matcher._cand_feature_hash_cache.pop(candidate_id, None)


def validate_decision(decision: str) -> None:
    if decision not in VALID_DECISIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Decision must be one of: {', '.join(sorted(VALID_DECISIONS))}",
        )


def ensure_match(job_id: int, candidate_id: int):
    service = get_service()
    job = service.db.get_job_by_id(job_id)
    candidate = service.db.get_candidate_by_id(candidate_id)
    if not job or not candidate:
        raise HTTPException(status_code=404, detail="Job or Candidate not found")

    match = service.db.get_match(job_id, candidate_id)
    if match:
        return match

    scores = service.match_candidate_to_job(candidate_id=candidate_id, job_id=job_id) or {}
    return service.db.add_match({
        "job_id": job_id,
        "user_id": candidate_id,
        "fit_score": scores.get("overall_score", 0.0),
        "fit_percentage": int(scores.get("overall_score", 0.0) * 100),
        "skills_match_score": scores.get("skill_match", 0.0),
        "experience_match_score": scores.get("experience_match", 0.0),
        "title_similarity_score": scores.get("text_similarity", 0.0),
    })


@app.on_event("startup")
async def startup_event():
    get_service()
    ensure_default_admin()
    print("Loading inference service and embedding models...")


@app.post("/api/auth/login")
def login(request: LoginRequest):
    ensure_default_admin()
    user = get_service().db.get_user_by_username(request.username.strip())
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    return {
        "access_token": create_token(user),
        "token_type": "bearer",
        "user": serialize_user(user),
    }


@app.get("/api/auth/me")
def get_me(current_user=Depends(get_current_user)):
    return serialize_user(current_user)


@app.post("/api/auth/change-password")
def change_password(request: ChangePasswordRequest, current_user=Depends(get_current_user)):
    if len(request.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    get_service().db.update_user_password(current_user.user_id, hash_password(request.new_password))
    return {"status": "success", "message": "Password changed successfully"}


@app.get("/api/dashboard/summary")
def get_dashboard_summary():
    """High-level metrics for the executive dashboard."""
    try:
        service = get_service()
        jobs = service.db.get_all_jobs()
        candidates = service.db.get_all_candidates()
        decisions = service.db.get_all_recruiter_actions()
        matches = service.db.get_all_matches()

        decision_counts = {decision: 0 for decision in VALID_DECISIONS}
        for action in decisions:
            if action.decision in decision_counts:
                decision_counts[action.decision] += 1

        reviewed_candidate_ids = {action.user_id for action in decisions}
        jobs_with_decisions = {action.job_id for action in decisions}
        pending_candidates = max(len(candidates) - len(reviewed_candidate_ids), 0)
        decision_rate = round((len(reviewed_candidate_ids) / len(candidates)) * 100, 1) if candidates else 0
        shortlist_rate = round((decision_counts["Shortlist"] / len(decisions)) * 100, 1) if decisions else 0

        jobs_missing_requirements = len([job for job in jobs if not (getattr(job, "job_requirements", "") or "").strip()])
        candidates_missing_skills = len([candidate for candidate in candidates if not (getattr(candidate, "skills", "") or "").strip()])

        recent_decisions = sorted(
            decisions,
            key=lambda action: action.updated_at or action.created_at,
            reverse=True,
        )[:5]

        return {
            "total_jobs": len(jobs),
            "total_candidates": len(candidates),
            "total_decisions": len(decisions),
            "total_matches": len(matches),
            "reviewed_candidates": len(reviewed_candidate_ids),
            "pending_candidates": pending_candidates,
            "jobs_with_decisions": len(jobs_with_decisions),
            "decision_rate": decision_rate,
            "shortlist_rate": shortlist_rate,
            "decision_counts": decision_counts,
            "data_quality": {
                "jobs_missing_requirements": jobs_missing_requirements,
                "candidates_missing_skills": candidates_missing_skills,
            },
            "recent_decisions": [serialize_decision(action) for action in recent_decisions],
            "system_status": "Online",
        }
    except Exception as e:
        print(f"Error fetching dashboard summary: {e}")
        return {
            "total_jobs": 0,
            "total_candidates": 0,
            "total_decisions": 0,
            "system_status": "Database Unreachable",
        }


@app.get("/api/dashboard/distributions")
def get_dashboard_distributions():
    """Distributions for jobs and candidates."""
    try:
        service = get_service()
        jobs = service.db.get_all_jobs()
        candidates = service.db.get_all_candidates()

        job_counts = {}
        for job in jobs:
            industry = getattr(job, "industry", "") or "Unknown"
            job_counts[industry] = job_counts.get(industry, 0) + 1

        candidate_counts = {}
        for candidate in candidates:
            role = getattr(candidate, "desired_job", "") or "Unknown"
            candidate_counts[role] = candidate_counts.get(role, 0) + 1

        return {
            "jobs_by_industry": [
                {"name": (k[:20] + "...") if len(k) > 20 else k, "value": v}
                for k, v in sorted(job_counts.items(), key=lambda item: item[1], reverse=True)[:6]
            ],
            "candidates_by_role": [
                {"name": (k[:20] + "...") if len(k) > 20 else k, "value": v}
                for k, v in sorted(candidate_counts.items(), key=lambda item: item[1], reverse=True)[:6]
            ],
        }
    except Exception as e:
        print(f"Error fetching dashboard distributions: {e}")
        return {"jobs_by_industry": [], "candidates_by_role": []}


@app.get("/api/jobs")
def get_jobs():
    """List jobs for selection and CRUD management."""
    try:
        jobs = get_service().db.get_all_jobs()
        return [serialize_job(job) for job in jobs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/jobs", status_code=status.HTTP_201_CREATED)
def create_job(job: JobCreate, current_user=Depends(get_current_user)):
    try:
        service = get_service()
        data = payload_dict(job)
        job_id = data.get("job_id")
        if job_id is not None and service.db.get_job_by_id(job_id):
            raise HTTPException(status_code=409, detail="Job ID already exists")

        created = service.db.add_job(data)
        return serialize_job(created)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/jobs/{job_id}")
def get_job(job_id: int):
    job = get_service().db.get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return serialize_job(job)


@app.put("/api/jobs/{job_id}")
def update_job(job_id: int, job: JobPayload, current_user=Depends(get_current_user)):
    try:
        data = payload_dict(job)
        data.pop("job_id", None)
        updated = get_service().db.update_job(job_id, data)
        if not updated:
            raise HTTPException(status_code=404, detail="Job not found")
        return serialize_job(updated)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/jobs/{job_id}")
def delete_job(job_id: int, current_user=Depends(get_current_user)):
    try:
        deleted = get_service().db.delete_job(job_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Job not found")
        return {"status": "success", "message": "Job deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/candidates")
def get_candidates():
    try:
        candidates = get_service().db.get_all_candidates()
        return [serialize_candidate(candidate) for candidate in candidates]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/candidates", status_code=status.HTTP_201_CREATED)
def create_candidate(candidate: CandidateCreate, current_user=Depends(get_current_user)):
    try:
        service = get_service()
        data = payload_dict(candidate)
        user_id = data.get("user_id")
        if user_id is not None and service.db.get_candidate_by_id(user_id):
            raise HTTPException(status_code=409, detail="Candidate ID already exists")

        created = service.db.add_candidate(data)
        clear_candidate_cache(created.user_id)
        return serialize_candidate(created)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/candidates/{candidate_id}")
def get_candidate(candidate_id: int):
    candidate = get_service().db.get_candidate_by_id(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return serialize_candidate(candidate)


@app.put("/api/candidates/{candidate_id}")
def update_candidate(candidate_id: int, candidate: CandidatePayload, current_user=Depends(get_current_user)):
    try:
        data = payload_dict(candidate)
        data.pop("user_id", None)
        updated = get_service().db.update_candidate(candidate_id, data)
        if not updated:
            raise HTTPException(status_code=404, detail="Candidate not found")
        clear_candidate_cache(candidate_id)
        return serialize_candidate(updated)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/candidates/{candidate_id}")
def delete_candidate(candidate_id: int, current_user=Depends(get_current_user)):
    try:
        deleted = get_service().db.delete_candidate(candidate_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Candidate not found")
        clear_candidate_cache(candidate_id)
        return {"status": "success", "message": "Candidate deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/jobs/{job_id}/ranking")
def rank_candidates(job_id: int, top_k: int = 50):
    """Semantic ranking of all candidates against a specific job."""
    try:
        service = get_service()
        if not service.db.get_job_by_id(job_id):
            raise HTTPException(status_code=404, detail="Job not found")

        ranked = service.rank_candidates_for_job(job_id=job_id, top_k=top_k)
        actions = service.db.get_recruiter_actions(job_id)
        decision_map = {action.user_id: action.decision for action in actions}

        response = []
        for candidate, scores in ranked:
            if candidate.get("id") == -1:
                continue

            candidate_id = candidate.get("id")
            response.append({
                "candidate_id": candidate_id,
                "name": candidate.get("name"),
                "title": candidate.get("desired_job"),
                "location": candidate.get("location"),
                "experience": candidate.get("experience_years"),
                "expected_salary": candidate.get("expected_salary"),
                "gender": candidate.get("gender"),
                "scores": scores,
                "decision": decision_map.get(candidate_id),
            })
        return {"job_id": job_id, "ranking": response}
    except HTTPException:
        raise
    except Exception:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal processing error computing candidate ranking")


@app.get("/api/jobs/{job_id}/candidates/{candidate_id}")
def match_detail(job_id: int, candidate_id: int):
    """Detailed feature comparison of a specific candidate and job."""
    try:
        service = get_service()
        scores = service.match_candidate_to_job(candidate_id=candidate_id, job_id=job_id)
        if scores is None:
            raise HTTPException(status_code=404, detail="Job or Candidate not found")

        job = service.db.get_job_by_id(job_id)
        candidate = service.db.get_candidate_by_id(candidate_id)

        decision_info = None
        match = service.db.get_match(job_id, candidate_id)
        if match:
            action = service.db.get_recruiter_action_for_match(match.match_id)
            if action:
                decision_info = {
                    "action": action.decision,
                    "notes": action.notes,
                    "recruiter_name": action.recruiter_name or "Admin",
                }

        return {
            "job_id": job_id,
            "candidate_id": candidate_id,
            "scores": scores,
            "decision": decision_info,
            "decision_info": decision_info,
            "job": {
                "title": getattr(job, "job_title", "") or "",
                "location": getattr(job, "location", "") or getattr(job, "job_address", "") or "",
                "experience": getattr(job, "years_of_experience", "") or "",
                "degree": "",
                "skills": getattr(job, "job_requirements", "") or "",
                "description": getattr(job, "job_description", "") or "",
            },
            "candidate": {
                "name": getattr(candidate, "user_name", "") or "",
                "title": getattr(candidate, "desired_job", "") or "",
                "location": getattr(candidate, "location", "") or getattr(candidate, "workplace_desired", "") or "",
                "experience": getattr(candidate, "work_experience", "") or "",
                "degree": getattr(candidate, "degree", "") or "",
                "skills": getattr(candidate, "skills", "") or "",
                "industry": getattr(candidate, "industry", "") or "",
                "desired_salary": getattr(candidate, "desired_salary", "") or "",
                "age": getattr(candidate, "age", "") or "",
                "target": getattr(candidate, "target", "") or "",
                "gender": getattr(candidate, "gender", "") or "",
                "marriage": getattr(candidate, "marriage", "") or "",
            },
        }
    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal processing error generating candidate detail")


@app.post("/api/jobs/{job_id}/bulk-decisions")
def save_bulk_decision(job_id: int, request: BulkDecisionRequest, current_user=Depends(get_current_user)):
    """Persist recruiter action to the database for multiple candidates."""
    validate_decision(request.action)
    try:
        updated = 0
        for candidate_id in request.candidate_ids:
            match = ensure_match(job_id, candidate_id)
            get_service().db.add_recruiter_action({
                "job_id": job_id,
                "user_id": candidate_id,
                "match_id": match.match_id,
                "decision": request.action,
                "notes": request.notes,
                "recruiter_name": request.recruiter_name or current_user.username,
            })
            updated += 1
        return {"status": "success", "message": f"{request.action} recorded for {updated} candidates"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/jobs/{job_id}/candidates/{candidate_id}/decisions")
def save_decision(job_id: int, candidate_id: int, decision: DecisionRequest, current_user=Depends(get_current_user)):
    """Persist recruiter action to the database."""
    validate_decision(decision.action)
    try:
        match = ensure_match(job_id, candidate_id)
        action = get_service().db.add_recruiter_action({
            "job_id": job_id,
            "user_id": candidate_id,
            "match_id": match.match_id,
            "decision": decision.action,
            "notes": decision.notes,
            "recruiter_name": decision.recruiter_name or current_user.username,
        })
        return {"status": "success", "message": f"{decision.action} recorded", "decision": serialize_decision(action)}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/jobs/{job_id}/candidates/{candidate_id}/decisions")
def delete_candidate_decision(job_id: int, candidate_id: int, current_user=Depends(get_current_user)):
    match = get_service().db.get_match(job_id, candidate_id)
    if not match:
        raise HTTPException(status_code=404, detail="Decision not found")

    action = get_service().db.get_recruiter_action_for_match(match.match_id)
    if not action:
        raise HTTPException(status_code=404, detail="Decision not found")

    get_service().db.delete_recruiter_action(action.action_id)
    return {"status": "success", "message": "Decision deleted"}


@app.get("/api/jobs/{job_id}/decisions")
def get_job_decisions(job_id: int):
    """Retrieve historical recruiter actions for a job."""
    try:
        if not get_service().db.get_job_by_id(job_id):
            raise HTTPException(status_code=404, detail="Job not found")

        actions = get_service().db.get_recruiter_actions(job_id)
        actions = sorted(actions, key=lambda item: item.updated_at or item.created_at, reverse=True)
        return {"job_id": job_id, "decisions": [serialize_decision(action) for action in actions]}
    except HTTPException:
        raise
    except Exception:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str("Internal processing error retrieving decisions"))


@app.get("/api/decisions")
def get_decisions():
    try:
        actions = get_service().db.get_all_recruiter_actions()
        actions = sorted(actions, key=lambda item: item.updated_at or item.created_at, reverse=True)
        return [serialize_decision(action) for action in actions]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/decisions", status_code=status.HTTP_201_CREATED)
def create_decision(decision: DecisionCreate, current_user=Depends(get_current_user)):
    validate_decision(decision.decision)
    try:
        match = ensure_match(decision.job_id, decision.user_id)
        action = get_service().db.add_recruiter_action({
            "job_id": decision.job_id,
            "user_id": decision.user_id,
            "match_id": match.match_id,
            "decision": decision.decision,
            "notes": decision.notes,
            "recruiter_name": decision.recruiter_name or current_user.username,
        })
        return serialize_decision(action)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/decisions/{action_id}")
def get_decision(action_id: int):
    action = get_service().db.get_recruiter_action(action_id)
    if not action:
        raise HTTPException(status_code=404, detail="Decision not found")
    return serialize_decision(action)


@app.put("/api/decisions/{action_id}")
def update_decision(action_id: int, decision: DecisionUpdate, current_user=Depends(get_current_user)):
    data = payload_dict(decision)
    if "decision" in data:
        validate_decision(data["decision"])

    updated = get_service().db.update_recruiter_action(action_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Decision not found")
    return serialize_decision(updated)


@app.delete("/api/decisions/{action_id}")
def delete_decision(action_id: int, current_user=Depends(get_current_user)):
    deleted = get_service().db.delete_recruiter_action(action_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Decision not found")
    return {"status": "success", "message": "Decision deleted"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
