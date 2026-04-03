"""
Validate job dataset for data quality and completeness
"""
import pandas as pd
from typing import Tuple, List, Dict
from src.utils.logging import setup_logging

logger = setup_logging(__name__)

REQUIRED_JOB_FIELDS = [
    'job_id', 'job_title', 'company_name', 
    'job_description', 'job_requirements', 'career_level'
]

def validate_job_data(jobs_data) -> Tuple[bool, Dict]:
    """
    Validate job dataset for required fields and data quality
    
    Args:
        jobs_data: Job DataFrame or list of Job objects
    
    Returns:
        Tuple of (is_valid, report_dict)
    """
    # Convert list of Job objects to DataFrame if needed
    if isinstance(jobs_data, list):
        if len(jobs_data) == 0:
            return False, {'errors': ['No jobs'], 'completeness_percentage': 0}
        jobs_df = pd.DataFrame([j.__dict__ if hasattr(j, '__dict__') else j for j in jobs_data])
    else:
        jobs_df = jobs_data
    
    report = {
        'total_records': len(jobs_df),
        'valid_records': 0,
        'errors': [],
        'warnings': [],
        'missing_fields': {},
        'completeness_percentage': 0
    }
    
    if jobs_df is None or len(jobs_df) == 0:
        report['errors'].append("No job data provided")
        return False, report
    
    # Check for required fields
    missing_fields = [f for f in REQUIRED_JOB_FIELDS if f not in jobs_df.columns]
    if missing_fields:
        report['errors'].append(f"Missing required fields: {missing_fields}")
        return False, report
    
    # Check for missing values in required fields
    for field in REQUIRED_JOB_FIELDS:
        missing_count = jobs_df[field].isna().sum()
        if missing_count > 0:
            report['missing_fields'][field] = missing_count
            report['warnings'].append(
                f"Field '{field}' has {missing_count} missing values"
            )
    
    # Check for duplicates
    duplicate_count = jobs_df['job_id'].duplicated().sum()
    if duplicate_count > 0:
        report['warnings'].append(f"Found {duplicate_count} duplicate job IDs")
    
    # Validate data types
    if not pd.api.types.is_numeric_dtype(jobs_df['job_id']):
        report['warnings'].append("job_id should be numeric")
    
    report['valid_records'] = len(jobs_df) - jobs_df[REQUIRED_JOB_FIELDS].isna().any(axis=1).sum()
    
    # Calculate completeness percentage
    total_fields = len(REQUIRED_JOB_FIELDS) * len(jobs_df)
    missing_fields_count = sum(report['missing_fields'].values())
    report['completeness_percentage'] = 100 * (1 - missing_fields_count / total_fields) if total_fields > 0 else 100
    
    is_valid = len(report['errors']) == 0
    return is_valid, report

def get_data_quality_summary(jobs_df: pd.DataFrame) -> Dict:
    """
    Generate data quality summary for UI display
    
    Args:
        jobs_df: Job DataFrame
    
    Returns:
        Dictionary with quality metrics
    """
    summary = {
        'total_jobs': len(jobs_df),
        'unique_companies': jobs_df['company_name'].nunique(),
        'unique_industries': jobs_df['industry'].nunique(),
        'completeness_percentage': 0.0,
        'quality_rating': 'Unknown'
    }
    
    # Calculate completeness
    total_cells = len(jobs_df) * len(jobs_df.columns)
    missing_cells = jobs_df.isna().sum().sum()
    completeness = (total_cells - missing_cells) / total_cells * 100 if total_cells > 0 else 0
    
    summary['completeness_percentage'] = completeness
    
    # Rate quality
    if completeness >= 95:
        summary['quality_rating'] = 'Excellent'
    elif completeness >= 85:
        summary['quality_rating'] = 'Good'
    elif completeness >= 70:
        summary['quality_rating'] = 'Fair'
    else:
        summary['quality_rating'] = 'Poor'
    
    return summary
