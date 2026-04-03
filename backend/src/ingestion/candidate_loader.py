"""
Load and parse candidate profiles from CSV/Excel files
"""
import pandas as pd
from pathlib import Path
from typing import Optional, Tuple
from config.column_mapping import CANDIDATE_COLUMN_MAPPING
from src.utils.logging import setup_logging

logger = setup_logging(__name__)

def load_candidates(filepath: str) -> Tuple[pd.DataFrame, Optional[str]]:
    """
    Load candidate dataset from CSV file
    
    Args:
        filepath: Path to candidate CSV file
    
    Returns:
        Tuple of (DataFrame, error_message)
        - DataFrame with candidate data if successful
        - None for DataFrame and error message if failed
    """
    try:
        if not Path(filepath).exists():
            return None, f"File not found: {filepath}"
        
        # Load CSV
        df = pd.read_csv(filepath)
        logger.info(f"Loaded {len(df)} candidates from {filepath}")
        
        # Rename columns based on mapping
        rename_dict = {v: k for k, v in CANDIDATE_COLUMN_MAPPING.items() if v in df.columns}
        df = df.rename(columns=rename_dict)
        
        return df, None
        
    except Exception as e:
        error_msg = f"Error loading candidate data: {str(e)}"
        logger.error(error_msg)
        return None, error_msg

def get_candidate_by_id(candidates_df: pd.DataFrame, user_id: int) -> Optional[dict]:
    """
    Get candidate record by ID
    
    Args:
        candidates_df: Candidates DataFrame
        user_id: User ID to retrieve
    
    Returns:
        Candidate record as dict, or None if not found
    """
    matching = candidates_df[candidates_df['user_id'] == user_id]
    
    if matching.empty:
        return None
    
    return matching.iloc[0].to_dict()

def get_all_candidates(candidates_df: pd.DataFrame) -> list:
    """
    Get all candidates as list of dicts
    
    Args:
        candidates_df: Candidates DataFrame
    
    Returns:
        List of candidate records
    """
    return candidates_df.to_dict('records')

def filter_candidates_by_skills(candidates_df: pd.DataFrame, required_skills: set) -> pd.DataFrame:
    """
    Filter candidates by required skills
    
    Args:
        candidates_df: Candidates DataFrame
        required_skills: Set of required skills
    
    Returns:
        Filtered DataFrame (candidates with at least some required skills)
    """
    def has_skills(skills_text):
        if not isinstance(skills_text, str):
            return False
        candidate_skills = set(s.strip().lower() for s in skills_text.split(','))
        return len(candidate_skills.intersection(required_skills)) > 0
    
    return candidates_df[
        candidates_df['skills'].apply(has_skills)
    ]

def filter_candidates_by_experience(
    candidates_df: pd.DataFrame, 
    min_years: int, 
    max_years: Optional[int] = None
) -> pd.DataFrame:
    """
    Filter candidates by years of experience
    
    Args:
        candidates_df: Candidates DataFrame
        min_years: Minimum years required
        max_years: Maximum years (optional)
    
    Returns:
        Filtered DataFrame
    """
    from src.utils.helpers import parse_experience_years
    
    def get_years(exp_text):
        return parse_experience_years(str(exp_text))
    
    filtered = candidates_df[
        candidates_df['work_experience'].apply(get_years) >= min_years
    ]
    
    if max_years:
        filtered = filtered[
            filtered['work_experience'].apply(get_years) <= max_years
        ]
    
    return filtered
