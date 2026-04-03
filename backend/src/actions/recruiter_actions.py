"""
Track recruiter decisions and actions
"""
from typing import Optional, List, Dict
from datetime import datetime
from config.settings import RECRUITER_DECISIONS
from src.storage.database import Database
from src.utils.logging import setup_logging

logger = setup_logging(__name__)

def save_recruiter_decision(
    db: Database,
    job_id: int,
    user_id: int,
    decision: str,
    notes: str = "",
    recruiter_name: str = "System"
) -> bool:
    """
    Save recruiter decision for a candidate
    
    Args:
        db: Database instance
        job_id: Job ID
        user_id: Candidate ID
        decision: One of 'Shortlist', 'Hold', 'Reject'
        notes: Optional recruiter notes
        recruiter_name: Name of recruiter making decision
    
    Returns:
        Success boolean
    """
    try:
        # Validate decision
        if decision not in RECRUITER_DECISIONS:
            logger.error(f"Invalid decision: {decision}")
            return False
        
        # Get match to find match_id
        match = db.get_match(job_id, user_id)
        if not match:
            logger.error(f"No match found for job {job_id}, user {user_id}")
            return False
        
        action_data = {
            'match_id': match.match_id,
            'job_id': job_id,
            'user_id': user_id,
            'decision': decision,
            'notes': notes,
            'recruiter_name': recruiter_name,
            'created_at': datetime.utcnow()
        }
        
        db.add_recruiter_action(action_data)
        logger.info(f"Recorded {decision} for candidate {user_id} on job {job_id}")
        return True
        
    except Exception as e:
        logger.error(f"Error saving recruiter decision: {e}")
        return False

def get_candidate_decision(
    db: Database,
    job_id: int,
    user_id: int
) -> Optional[Dict]:
    """
    Get recruiter decision for a candidate-job pair
    
    Args:
        db: Database instance
        job_id: Job ID
        user_id: Candidate ID
    
    Returns:
        Decision dict or None if no decision made
    """
    match = db.get_match(job_id, user_id)
    if not match:
        return None
    
    action = db.get_recruiter_action_for_match(match.match_id)
    if not action:
        return None
    
    return {
        'decision': action.decision,
        'notes': action.notes,
        'recruiter_name': action.recruiter_name,
        'created_at': action.created_at,
        'updated_at': action.updated_at
    }

def get_job_decisions(db: Database, job_id: int) -> List[Dict]:
    """
    Get all recruiter decisions for a job
    
    Args:
        db: Database instance
        job_id: Job ID
    
    Returns:
        List of decision records
    """
    actions = db.get_recruiter_actions(job_id)
    
    decisions = []
    for action in actions:
        decisions.append({
            'candidate_id': action.user_id,
            'decision': action.decision,
            'notes': action.notes,
            'recruiter_name': action.recruiter_name,
            'created_at': action.created_at,
            'updated_at': action.updated_at
        })
    
    return decisions

def get_decision_summary(db: Database, job_id: int) -> Dict:
    """
    Get summary of all decisions for a job
    
    Args:
        db: Database instance
        job_id: Job ID
    
    Returns:
        Summary dict with counts
    """
    actions = db.get_recruiter_actions(job_id)
    
    summary = {
        'total_reviewed': len(actions),
        'shortlisted': 0,
        'on_hold': 0,
        'rejected': 0
    }
    
    for action in actions:
        if action.decision == 'Shortlist':
            summary['shortlisted'] += 1
        elif action.decision == 'Hold':
            summary['on_hold'] += 1
        elif action.decision == 'Reject':
            summary['rejected'] += 1
    
    return summary
