"""
Extract features from job and candidate data for matching
"""
import pandas as pd
from typing import Dict, List, Tuple
from src.utils.helpers import parse_experience_years
from src.processing import extract_keywords, extract_skills as extract_skills_from_text
from src.utils.logging import setup_logging

logger = setup_logging(__name__)

def extract_job_features(job_record: Dict) -> Dict:
    """
    Extract matchable features from a job record.
    
    Skills are extracted from both job_requirements and job_description fields
    to ensure we capture all mentioned technical skills, since different data
    sources may store skills in different columns.
    
    Args:
        job_record: Single job record (dict)
    
    Returns:
        Dictionary of extracted features
    """
    # Extract skills from both requirements and description fields
    requirements_text = str(job_record.get('job_requirements', '')) or ""
    description_text = str(job_record.get('job_description', '')) or ""
    combined_text = f"{requirements_text} {description_text}"
    
    extracted_skills = set(extract_skills_from_text(combined_text)) or set()
    
    # Log when no skills are extracted (warning: skill extraction failed)
    if not extracted_skills:
        job_id = job_record.get('job_id', 'unknown')
        job_title = job_record.get('job_title', 'unknown')
        logger.debug(f"[SKILL_EXTRACTION] No skills extracted for job {job_id} ({job_title})")
    
    features = {
        'job_id': job_record.get('job_id'),
        'title': job_record.get('job_title', ''),
        'required_skills': extracted_skills,
        'required_years': parse_experience_years(
            str(job_record.get('years_of_experience', '0'))
        ),
        'career_level': job_record.get('career_level', 'Unknown'),
        'industry': job_record.get('industry', 'Unknown'),
        'location': job_record.get('job_address', 'Unknown'),
        'keywords': extract_keywords(
            description_text
        ),
        'job_description': description_text.strip(),
        'job_requirements': requirements_text.strip(),
        # Store metadata about skill extraction for debugging
        '_skill_extraction_source': 'requirements+description',
        '_skills_count': len(extracted_skills),
    }
    
    return features

def extract_candidate_features(candidate_record: Dict) -> Dict:
    """
    Extract matchable features from a candidate record.
    
    Args:
        candidate_record: Single candidate record (dict)
    
    Returns:
        Dictionary of extracted features
    """
    skills_text = str(candidate_record.get('skills', '')) or ""
    target_text = str(candidate_record.get('target', '')) or ""
    
    extracted_skills = set(extract_skills_from_text(skills_text)) or set()
    
    features = {
        'user_id': candidate_record.get('user_id'),
        'name': candidate_record.get('user_name', ''),
        'skills': extracted_skills,
        'experience_years': parse_experience_years(
            str(candidate_record.get('work_experience', '0'))
        ),
        'degree': candidate_record.get('degree', 'Unknown'),
        'desired_job': candidate_record.get('desired_job', ''),
        'target_keywords': extract_keywords(target_text),
        'location': candidate_record.get('workplace_desired', 'Unknown'),
        'industry': candidate_record.get('industry', 'Unknown'),
    }
    
    return features

def extract_all_job_features(jobs_df: pd.DataFrame) -> List[Dict]:
    """
    Extract features for all jobs
    
    Args:
        jobs_df: Jobs DataFrame
    
    Returns:
        List of feature dictionaries
    """
    features_list = []
    for _, row in jobs_df.iterrows():
        features = extract_job_features(row.to_dict())
        features_list.append(features)
    
    logger.info(f"Extracted features for {len(features_list)} jobs")
    return features_list

def extract_all_candidate_features(candidates_df: pd.DataFrame) -> List[Dict]:
    """
    Extract features for all candidates
    
    Args:
        candidates_df: Candidates DataFrame
    
    Returns:
        List of feature dictionaries
    """
    features_list = []
    for _, row in candidates_df.iterrows():
        features = extract_candidate_features(row.to_dict())
        features_list.append(features)
    
    logger.info(f"Extracted features for {len(features_list)} candidates")
    return features_list
