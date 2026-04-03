"""
Load and parse job descriptions from CSV/Excel files
"""
import pandas as pd
from pathlib import Path
from typing import Optional, Tuple
from config.column_mapping import JOB_COLUMN_MAPPING
from src.utils.logging import setup_logging

logger = setup_logging(__name__)

def load_jobs(filepath: str) -> Tuple[pd.DataFrame, Optional[str]]:
    """
    Load job dataset from CSV file
    
    Args:
        filepath: Path to job CSV file
    
    Returns:
        Tuple of (DataFrame, error_message)
        - DataFrame with job data if successful
        - None for DataFrame and error message if failed
    """
    try:
        if not Path(filepath).exists():
            return None, f"File not found: {filepath}"
        
        # Load CSV
        df = pd.read_csv(filepath)
        logger.info(f"Loaded {len(df)} jobs from {filepath}")
        
        # Rename columns based on mapping
        rename_dict = {v: k for k, v in JOB_COLUMN_MAPPING.items() if v in df.columns}
        df = df.rename(columns=rename_dict)
        
        return df, None
        
    except Exception as e:
        error_msg = f"Error loading job data: {str(e)}"
        logger.error(error_msg)
        return None, error_msg

def get_job_by_id(jobs_df: pd.DataFrame, job_id: int) -> Optional[dict]:
    """
    Get job record by ID
    
    Args:
        jobs_df: Jobs DataFrame
        job_id: Job ID to retrieve
    
    Returns:
        Job record as dict, or None if not found
    """
    matching = jobs_df[jobs_df['job_id'] == job_id]
    
    if matching.empty:
        return None
    
    return matching.iloc[0].to_dict()

def get_all_jobs(jobs_df: pd.DataFrame) -> list:
    """
    Get all jobs as list of dicts
    
    Args:
        jobs_df: Jobs DataFrame
    
    Returns:
        List of job records
    """
    return jobs_df.to_dict('records')

def filter_jobs_by_title(jobs_df: pd.DataFrame, title_keyword: str) -> pd.DataFrame:
    """
    Filter jobs by title keyword
    
    Args:
        jobs_df: Jobs DataFrame
        title_keyword: Keyword to match in job title
    
    Returns:
        Filtered DataFrame
    """
    return jobs_df[
        jobs_df['job_title'].str.contains(title_keyword, case=False, na=False)
    ]

def filter_jobs_by_level(jobs_df: pd.DataFrame, level: str) -> pd.DataFrame:
    """
    Filter jobs by career level
    
    Args:
        jobs_df: Jobs DataFrame
        level: Career level (e.g., "Nhân viên", "Trưởng phòng")
    
    Returns:
        Filtered DataFrame
    """
    return jobs_df[
        jobs_df['career_level'].str.contains(level, case=False, na=False)
    ]
