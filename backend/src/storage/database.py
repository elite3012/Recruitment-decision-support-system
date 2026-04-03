"""
Database access layer
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from config.settings import DATABASE_PATH
from src.storage.models import Base, Job, Candidate, Match, RecruiterAction
from src.utils.logging import setup_logging
from typing import List, Optional

logger = setup_logging(__name__)

class Database:
    """Database manager for recruitment system"""
    
    def __init__(self, db_path: str = DATABASE_PATH):
        """
        Initialize database connection
        
        Args:
            db_path: Path to SQLite database
        """
        self.engine = create_engine(f'sqlite:///{db_path}')
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine, expire_on_commit=False)
        logger.info(f"Database initialized at {db_path}")
    
    def get_session(self) -> Session:
        """Get database session"""
        return self.SessionLocal()
    
    # ======================================================================
    # JOB OPERATIONS
    # ======================================================================
    
    def add_job(self, job_data: dict) -> Job:
        """Add job to database"""
        session = self.get_session()
        try:
            job = Job(**job_data)
            session.add(job)
            session.commit()
            return job
        except Exception as e:
            session.rollback()
            logger.error(f"Error adding job: {e}")
            raise
        finally:
            session.close()
    
    def get_job(self, job_id: int) -> Optional[Job]:
        """Get a job by ID"""
        session = self.get_session()
        try:
            return session.query(Job).filter(Job.job_id == job_id).first()
        finally:
            session.close()
    
    def get_job_by_id(self, job_id: int) -> Optional[Job]:
        """Alias for get_job for consistency"""
        return self.get_job(job_id)
    
    def get_all_jobs(self) -> List[Job]:
        """Get all jobs"""
        session = self.get_session()
        try:
            return session.query(Job).all()
        finally:
            session.close()
    
    def delete_all_jobs(self):
        """Delete all jobs"""
        session = self.get_session()
        try:
            session.query(Job).delete()
            session.commit()
        finally:
            session.close()
    
    # ======================================================================
    # CANDIDATE OPERATIONS
    # ======================================================================
    
    def add_candidate(self, candidate_data: dict) -> Candidate:
        """Add candidate to database"""
        session = self.get_session()
        try:
            candidate = Candidate(**candidate_data)
            session.add(candidate)
            session.commit()
            return candidate
        except Exception as e:
            session.rollback()
            logger.error(f"Error adding candidate: {e}")
            raise
        finally:
            session.close()
    
    def get_candidate(self, user_id: int) -> Optional[Candidate]:
        """Get a candidate by ID"""
        session = self.get_session()
        try:
            return session.query(Candidate).filter(Candidate.user_id == user_id).first()
        finally:
            session.close()
    
    def get_candidate_by_id(self, user_id: int) -> Optional[Candidate]:
        """Alias for get_candidate for consistency"""
        return self.get_candidate(user_id)
    
    def get_all_candidates(self) -> List[Candidate]:
        """Get all candidates"""
        session = self.get_session()
        try:
            return session.query(Candidate).all()
        finally:
            session.close()
    
    def delete_all_candidates(self):
        """Delete all candidates"""
        session = self.get_session()
        try:
            session.query(Candidate).delete()
            session.commit()
        finally:
            session.close()
    
    # ======================================================================
    # MATCH OPERATIONS
    # ======================================================================
    
    def add_match(self, match_data: dict) -> Match:
        """Add match record"""
        session = self.get_session()
        try:
            match = Match(**match_data)
            session.add(match)
            session.commit()
            return match
        except Exception as e:
            session.rollback()
            logger.error(f"Error adding match: {e}")
            raise
        finally:
            session.close()
    
    def get_match(self, job_id: int, user_id: int) -> Optional[Match]:
        """Get match between job and candidate"""
        session = self.get_session()
        try:
            return session.query(Match).filter(
                Match.job_id == job_id,
                Match.user_id == user_id
            ).first()
        finally:
            session.close()
    
    def get_job_matches(self, job_id: int) -> List[Match]:
        """Get all matches for a job"""
        session = self.get_session()
        try:
            return session.query(Match).filter(Match.job_id == job_id).all()
        finally:
            session.close()
    
    def get_all_matches(self) -> List[Match]:
        """Get all matches from database"""
        session = self.get_session()
        try:
            return session.query(Match).all()
        finally:
            session.close()
    
    def delete_all_matches(self):
        """Delete all matches"""
        session = self.get_session()
        try:
            session.query(Match).delete()
            session.commit()
        finally:
            session.close()
    
    # ======================================================================
    # RECRUITER ACTION OPERATIONS
    # ======================================================================
    
    def add_recruiter_action(self, action_data: dict) -> RecruiterAction:
        """Add or update recruiter action (shortlist, reject, hold, note)"""
        session = self.get_session()
        try:
            # Check if action already exists for this match
            existing = session.query(RecruiterAction).filter(
                RecruiterAction.match_id == action_data.get('match_id')
            ).first()
            
            if existing:
                existing.decision = action_data.get('decision', existing.decision)
                existing.notes = action_data.get('notes', existing.notes)
                if 'recruiter_name' in action_data:
                    existing.recruiter_name = action_data['recruiter_name']
                session.commit()
                return existing
                
            action = RecruiterAction(**action_data)
            session.add(action)
            session.commit()
            return action
        except Exception as e:
            session.rollback()
            logger.error(f"Error adding recruiter action: {e}")
            raise
        finally:
            session.close()
    
    def get_recruiter_actions(self, job_id: int) -> List[RecruiterAction]:
        """Get all actions for a job"""
        session = self.get_session()
        try:
            return session.query(RecruiterAction).filter(
                RecruiterAction.job_id == job_id
            ).all()
        finally:
            session.close()
    
    def get_recruiter_action_for_match(self, match_id: int) -> Optional[RecruiterAction]:
        """Get recruiter action for a specific match"""
        session = self.get_session()
        try:
            return session.query(RecruiterAction).filter(
                RecruiterAction.match_id == match_id
            ).first()
        finally:
            session.close()
    
    def get_all_recruiter_actions(self) -> List[RecruiterAction]:
        """Get all recruiter actions from database"""
        session = self.get_session()
        try:
            return session.query(RecruiterAction).all()
        finally:
            session.close()
    
    def delete_all_recruiter_actions(self):
        """Delete all recruiter actions"""
        session = self.get_session()
        try:
            session.query(RecruiterAction).delete()
            session.commit()
        finally:
            session.close()
    
    # ======================================================================
    # UTILITY
    # ======================================================================
    
    def reset_database(self):
        """Delete all data from database"""
        session = self.get_session()
        try:
            session.query(RecruiterAction).delete()
            session.query(Match).delete()
            session.query(Job).delete()
            session.query(Candidate).delete()
            session.commit()
            logger.info("Database reset successfully")
        finally:
            session.close()
