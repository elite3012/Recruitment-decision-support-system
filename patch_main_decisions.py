import sys
with open('backend/main.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()
new_routes = \"\"\"
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
\"\"\"
insert_idx = -1
for i, l in enumerate(lines):
    if 'uvicorn.run("main:app"' in l:
        insert_idx = i - 1
        break
if insert_idx != -1:
    lines.insert(insert_idx, new_routes)
    with open('backend/main.py', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Patched successfully.")
