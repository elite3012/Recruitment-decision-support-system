"""
Configuration settings for the Recruitment Decision Support System
"""
import os
from dotenv import load_dotenv

load_dotenv()

# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================
DATABASE_PATH = os.getenv("DATABASE_PATH", "data/app.db")
RAW_DATA_PATH = os.getenv("RAW_DATA_PATH", "data/raw")
PROCESSED_DATA_PATH = os.getenv("PROCESSED_DATA_PATH", "data/processed")

# ============================================================================
# FEATURE WEIGHTS FOR RANKING (0-1, should sum to 1.0)
# ============================================================================
FEATURE_WEIGHTS = {
    "skills_match": 0.35,
    "experience_match": 0.25,
    "title_similarity": 0.20,
    "education_fit": 0.15,
    "location_match": 0.05,
}

# ============================================================================
# SIMILARITY THRESHOLDS
# ============================================================================
MIN_SIMILARITY_SCORE = 0.3  # Minimum score to consider candidate
STRONG_SIMILARITY_THRESHOLD = 0.7  # Score threshold for strong match
MEDIUM_SIMILARITY_THRESHOLD = 0.5  # Score threshold for medium match

# ============================================================================
# TEXT PROCESSING
# ============================================================================
TEXT_LOWERCASE = True
REMOVE_SPECIAL_CHARS = True
MIN_SKILL_LENGTH = 2  # Minimum length for skill keywords

# ============================================================================
# RANKING CONFIGURATION
# ============================================================================
TOP_K_CANDIDATES = 20  # Number of top candidates to display
MIN_CANDIDATES_TO_SHOW = 5  # Minimum candidates even if low score

# ============================================================================
# RECRUITER DECISION OPTIONS
# ============================================================================
RECRUITER_DECISIONS = [
    "Shortlist",
    "Hold",
    "Reject",
]

# ============================================================================
# UI CONFIGURATION
# ============================================================================
MAX_COMPARISON_CANDIDATES = 3
PAGE_WIDTH = "wide"
