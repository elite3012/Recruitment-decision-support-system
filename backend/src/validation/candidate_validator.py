"""
Validate candidate dataset for data quality and completeness
"""
import pandas as pd
from typing import Tuple, List, Dict
from src.utils.logging import setup_logging

logger = setup_logging(__name__)

REQUIRED_CANDIDATE_FIELDS = [
    'user_id', 'user_name', 'skills', 
    'work_experience', 'degree'
]

def validate_candidate_data(candidates_data) -> Tuple[bool, Dict]:
    """
    Validate candidate dataset for required fields and data quality
    
    Args:
        candidates_data: Candidate DataFrame or list of Candidate objects
    
    Returns:
        Tuple of (is_valid, report_dict)
    """
    # Convert list of Candidate objects to DataFrame if needed
    if isinstance(candidates_data, list):
        if len(candidates_data) == 0:
            return False, {'errors': ['No candidates'], 'completeness_percentage': 0}
        candidates_df = pd.DataFrame([c.__dict__ if hasattr(c, '__dict__') else c for c in candidates_data])
    else:
        candidates_df = candidates_data
    
    report = {
        'total_records': len(candidates_df),
        'valid_records': 0,
        'errors': [],
        'warnings': [],
        'missing_fields': {},
        'completeness_percentage': 0
    }
    
    if candidates_df is None or len(candidates_df) == 0:
        report['errors'].append("No candidate data provided")
        return False, report
    
    # Check for required fields
    missing_fields = [f for f in REQUIRED_CANDIDATE_FIELDS if f not in candidates_df.columns]
    if missing_fields:
        report['errors'].append(f"Missing required fields: {missing_fields}")
        return False, report
    
    # Check for missing values in required fields
    for field in REQUIRED_CANDIDATE_FIELDS:
        missing_count = candidates_df[field].isna().sum()
        if missing_count > 0:
            report['missing_fields'][field] = missing_count
            report['warnings'].append(
                f"Field '{field}' has {missing_count} missing values"
            )
    
    # Check for duplicates
    duplicate_count = candidates_df['user_id'].duplicated().sum()
    if duplicate_count > 0:
        report['warnings'].append(f"Found {duplicate_count} duplicate user IDs")
    
    # Validate data types
    if not pd.api.types.is_numeric_dtype(candidates_df['user_id']):
        report['warnings'].append("user_id should be numeric")
    
    report['valid_records'] = len(candidates_df) - candidates_df[REQUIRED_CANDIDATE_FIELDS].isna().any(axis=1).sum()
    
    # Calculate completeness percentage
    total_fields = len(REQUIRED_CANDIDATE_FIELDS) * len(candidates_df)
    missing_fields_count = sum(report['missing_fields'].values())
    report['completeness_percentage'] = 100 * (1 - missing_fields_count / total_fields) if total_fields > 0 else 100
    
    is_valid = len(report['errors']) == 0
    return is_valid, report

def get_data_quality_summary(candidates_df: pd.DataFrame) -> Dict:
    """
    Generate data quality summary for UI display
    
    Args:
        candidates_df: Candidate DataFrame
    
    Returns:
        Dictionary with quality metrics
    """
    summary = {
        'total_candidates': len(candidates_df),
        'unique_industries': candidates_df['industry'].nunique(),
        'unique_degrees': candidates_df['degree'].nunique(),
        'completeness_percentage': 0.0,
        'quality_rating': 'Unknown'
    }
    
    # Calculate completeness
    total_cells = len(candidates_df) * len(candidates_df.columns)
    missing_cells = candidates_df.isna().sum().sum()
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
