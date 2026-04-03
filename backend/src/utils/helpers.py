"""
Helper functions for the Recruitment Decision Support System
"""
import re
from typing import List, Set
import numpy as np

def clean_text(text: str) -> str:
    """
    Clean text: lowercase, remove special characters
    
    Args:
        text: Input text string
    
    Returns:
        Cleaned text string
    """
    if not isinstance(text, str):
        return ""
    
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)  # Remove special chars
    text = re.sub(r'\s+', ' ', text).strip()  # Remove extra spaces
    return text

def extract_skills(skills_text: str, min_length: int = 2) -> Set[str]:
    """
    Extract skills from comma-separated or dash-separated text
    
    Args:
        skills_text: Text containing skills
        min_length: Minimum skill word length
    
    Returns:
        Set of extracted skills
    """
    if not isinstance(skills_text, str):
        return set()
    
    # Split by comma, dash, or newline
    skills = re.split(r'[,\n-]', skills_text)
    skills = [s.strip().lower() for s in skills if s.strip()]
    skills = [s for s in skills if len(s) >= min_length]
    return set(skills)

def calculate_skill_overlap(skills1: Set[str], skills2: Set[str]) -> float:
    """
    Calculate similarity between two skill sets
    
    Args:
        skills1: First set of skills
        skills2: Second set of skills
    
    Returns:
        Jaccard similarity score (0-1)
    """
    if not skills1 or not skills2:
        return 0.0
    
    intersection = len(skills1.intersection(skills2))
    union = len(skills1.union(skills2))
    
    if union == 0:
        return 0.0
    
    return intersection / union

def parse_experience_years(exp_text: str) -> int:
    """
    Parse years of experience from text
    
    Args:
        exp_text: Text describing experience (e.g., "5-10 năm")
    
    Returns:
        Parsed years as integer (uses minimum if range)
    """
    if not isinstance(exp_text, str):
        return 0
    
    # Extract all numbers
    numbers = re.findall(r'\d+', exp_text)
    
    if not numbers:
        return 0
    
    # Return minimum value if range, or first value
    return int(numbers[0])

def calculate_experience_match(required: int, candidate: int, tolerance: int = 2) -> float:
    """
    Calculate experience match score
    
    Args:
        required: Required years of experience
        candidate: Candidate's years of experience
        tolerance: Years tolerance for overqualification
    
    Returns:
        Experience match score (0-1)
    """
    if required <= 0:
        return 1.0
    
    if candidate < required:
        # Penalize underqualification
        return max(0.0, candidate / required)
    elif candidate <= required + tolerance:
        # Perfect match
        return 1.0
    else:
        # Slight penalty for overqualification
        return 0.95

def normalize_score(score: float, min_val: float = 0.0, max_val: float = 1.0) -> float:
    """
    Normalize score to 0-1 range
    
    Args:
        score: Input score
        min_val: Minimum value in range
        max_val: Maximum value in range
    
    Returns:
        Normalized score (0-1)
    """
    if max_val <= min_val:
        return 0.5
    
    normalized = (score - min_val) / (max_val - min_val)
    return max(0.0, min(1.0, normalized))

def sigmoid_score(value: float, midpoint: float = 0.5, steepness: float = 5) -> float:
    """
    Apply sigmoid function to create smooth score curve
    
    Args:
        value: Input value (0-1)
        midpoint: Point where sigmoid = 0.5
        steepness: Steepness of curve
    
    Returns:
        Sigmoid-transformed score
    """
    try:
        return 1 / (1 + np.exp(-steepness * (value - midpoint)))
    except:
        return 0.5

def format_score_as_percentage(score: float) -> str:
    """
    Format score as percentage string
    
    Args:
        score: Score value (0-1)
    
    Returns:
        Formatted percentage string
    """
    return f"{max(0, min(100, score * 100)):.1f}%"
