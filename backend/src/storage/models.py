"""
SQLAlchemy ORM models for the database
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Job(Base):
    """Job posting model"""
    __tablename__ = 'jobs'
    
    job_id = Column(Integer, primary_key=True)
    job_title = Column(String(255), nullable=False)
    company_name = Column(String(255))
    company_overview = Column(Text)
    job_description = Column(Text)
    job_requirements = Column(Text)
    benefits = Column(Text)
    job_address = Column(String(255))
    job_type = Column(String(100))
    career_level = Column(String(100))
    industry = Column(String(100))
    location = Column(String(100))
    years_of_experience = Column(String(50))
    salary = Column(String(100))
    
    # Relationships
    matches = relationship('Match', back_populates='job', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f"<Job(id={self.job_id}, title='{self.job_title}')>"

class Candidate(Base):
    """Candidate profile model"""
    __tablename__ = 'candidates'
    
    user_id = Column(Integer, primary_key=True)
    user_name = Column(String(255), nullable=False)
    industry = Column(String(100))
    desired_job = Column(String(255))
    workplace_desired = Column(String(100))
    desired_salary = Column(String(100))
    age = Column(Integer)
    target = Column(String(100))
    skills = Column(Text)
    degree = Column(String(100))
    work_experience = Column(String(50))
    gender = Column(String(50))
    location = Column(String(100))
    marriage = Column(String(50))
    
    # Relationships
    matches = relationship('Match', back_populates='candidate', cascade='all, delete-orphan')
    recruiter_actions = relationship('RecruiterAction', back_populates='candidate', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f"<Candidate(id={self.user_id}, name='{self.user_name}')>"

class Match(Base):
    """Job-candidate match with scores"""
    __tablename__ = 'matches'
    
    match_id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(Integer, ForeignKey('jobs.job_id'), nullable=False)
    user_id = Column(Integer, ForeignKey('candidates.user_id'), nullable=False)
    
    # Match scores
    fit_score = Column(Float)  # 0-1
    fit_percentage = Column(Integer)  # 0-100
    skills_match_score = Column(Float)
    experience_match_score = Column(Float)
    title_similarity_score = Column(Float)
    keyword_match_score = Column(Float)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    job = relationship('Job', back_populates='matches')
    candidate = relationship('Candidate', back_populates='matches')
    recruiter_actions = relationship('RecruiterAction', back_populates='match', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f"<Match(job={self.job_id}, candidate={self.user_id}, score={self.fit_score})>"

class RecruiterAction(Base):
    """Recruiter decision (shortlist, reject, hold, notes)"""
    __tablename__ = 'recruiter_actions'
    
    action_id = Column(Integer, primary_key=True, autoincrement=True)
    match_id = Column(Integer, ForeignKey('matches.match_id'), nullable=False)
    job_id = Column(Integer, ForeignKey('jobs.job_id'), nullable=False)
    user_id = Column(Integer, ForeignKey('candidates.user_id'), nullable=False)
    
    decision = Column(String(50), nullable=False)  # 'Shortlist', 'Hold', 'Reject'
    notes = Column(Text)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    recruiter_name = Column(String(255))
    
    # Relationships
    match = relationship('Match', back_populates='recruiter_actions')
    job = relationship('Job')
    candidate = relationship('Candidate', back_populates='recruiter_actions')
    
    def __repr__(self):
        return f"<RecruiterAction(decision='{self.decision}', user={self.user_id})>"

class User(Base):
    """System user for authenticated HR/admin workflows"""
    __tablename__ = 'users'

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(String(50), default='admin')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<User(id={self.user_id}, username='{self.username}')>"
