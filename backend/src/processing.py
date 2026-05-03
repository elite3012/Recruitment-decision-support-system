"""
Unified text processing and data field cleaning module.

Consolidates text normalization, cleaning, skill extraction,
and field standardization for the Recruitment DSS.
"""
import re
import pandas as pd
from typing import List, Set, Dict, Tuple
from config.settings import TEXT_LOWERCASE, REMOVE_SPECIAL_CHARS, MIN_SKILL_LENGTH
from src.utils.logging import setup_logging
from src.utils.vietnamese_utils import (
    is_vietnamese_text, 
    normalize_vietnamese,
    extract_vietnamese_skills,
    extract_vietnamese_phrases,
    VIETNAMESE_SKILLS,
    VIETNAMESE_STOP_WORDS,
    is_bilingual_text,
)

logger = setup_logging(__name__)

# ============================================================================
# CONSTANTS
# ============================================================================

DEGREE_MAPPING = {
    'đại học': 'Bachelor',
    'cao đẳng': 'Associate',
    'trung cấp': 'Diploma',
    'thạc sĩ': 'Master',
    'tiến sĩ': 'PhD',
    'university': 'Bachelor',
    'college': 'Associate',
    'diploma': 'Diploma',
    'master': 'Master',
    'phd': 'PhD',
}

LOCATION_MAPPING = {
    'hà nội': 'Hanoi',
    'hồ chí minh': 'HCMC',
    'đà nẵng': 'Da Nang',
    'cần thơ': 'Can Tho',
    'hải phòng': 'Hai Phong',
    'hcm': 'HCMC',
    'tp.hcm': 'HCMC',
    'hanoi': 'Hanoi',
}

# Skill aliases for variant forms (alias -> canonical_skill)
SKILL_ALIASES = {
    'node.js': 'nodejs',
    'node js': 'nodejs',
    'node': 'nodejs',
    'c++': 'cpp',
    'c#': 'csharp',
    'c sharp': 'csharp',
    '.net': 'dotnet',
    'asp.net': 'aspnet',
    'asp net': 'aspnet',
    '.net core': 'dotnet',
    'net core': 'dotnet',
    'asp.net core': 'aspnet',
    'swift ios': 'swift',
    'objective-c': 'objective-c',
    'objective c': 'objective-c',
    'cocoa touch': 'cocoa',
    'core data': 'core data',
    'core animation': 'core animation',
    'react js': 'react',
    'react.js': 'react',
    'vue.js': 'vue',
    'vue js': 'vue',
    'angular js': 'angular',
    'angular 2': 'angular',
    'angular2': 'angular',
    'typescript': 'typescript',
    'type script': 'typescript',
    'shell script': 'bash',
    'shell scripting': 'bash',
    'ci cd': 'ci/cd',
    'cicd': 'ci/cd',
    'machine learning': 'machine learning',
    'deep learning': 'deep learning',
    'natural language processing': 'nlp',
    'computer vision': 'computer vision',
    'scikit learn': 'scikit-learn',
}

COMMON_SKILLS = {
    # Programming Languages
    'python', 'java', 'javascript', 'sql', 'r', 'scala', 'kotlin', 'go', 'rust',
    'php', 'ruby', 'swift', 'objective-c', 'c#', 'csharp', 'cpp', 'c++', 'c', 'perl',
    'groovy', 'dart', 'elixir', 'haskell', 'clojure', 'lua', 'bash', 'powershell',
    'typescript', 'coffeescript',
    
    # Web Frameworks & Libraries
    'react', 'vue', 'angular', 'nodejs', 'express', 'django', 'flask', 'fastapi', 
    'spring', 'springboot', 'spring boot', 'rails', 'laravel', 'asp.net', 'aspnet',
    'ember', 'backbone', 'next.js', 'nuxt', 'gatsby', 'svelte', 'fastapi',
    
    # Mobile Development  
    'ios', 'android', 'swift', 'objective-c', 'kotlin', 'react native', 'flutter',
    'xamarin', 'cordova', 'ionic', 'cocoa', 'cocoa touch', 'uikit',
    
    # Cloud & DevOps
    'aws', 'azure', 'gcp', 'google cloud', 'heroku', 'digitalocean',
    'docker', 'kubernetes', 'terraform', 'jenkins', 'gitlab', 'github',
    'circleci', 'travis', 'ansible', 'chef', 'puppet', 'docker compose',
    
    # Version Control
    'git', 'github', 'gitlab', 'bitbucket', 'mercurial', 'svn',
    
    # Operating Systems
    'linux', 'windows', 'macos', 'unix', 'ubuntu', 'centos', 'debian',
    
    # AI/ML Frameworks
    'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'scikit', 'pandas', 'numpy',
    'matplotlib', 'seaborn', 'jupyter', 'anaconda', 'spark', 'hadoop',
    
    # Machine Learning & Data Science
    'machine learning', 'deep learning', 'nlp', 'computer vision', 'data mining',
    'big data', 'data science', 'statistics', 'predictive analytics',
    
    # Databases
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb',
    'cassandra', 'oracle', 'sql server', 'sqlite', 'mariadb', 'neo4j',
    'memcached', 'firebase', 'firestore', 'couchdb',
    
    # Agile & Project Management
    'agile', 'scrum', 'kanban', 'devops', 'ci/cd', 'waterfall', 'lean',
    'jira', 'confluence', 'asana', 'trello', 'monday.com',
    
    # Testing & Quality
    'unit testing', 'integration testing', 'pytest', 'junit', 'mocha', 'jest',
    'selenium', 'cypress', 'testng', 'qa testing', 'automation testing',
    
    # Soft Skills & Business
    'communication', 'teamwork', 'leadership', 'problem solving', 'critical thinking',
    'time management', 'adaptability', 'creativity', 'analytical thinking',
    
    # Data Analysis & Business Intelligence
    'data analysis', 'business analysis', 'project management', 'requirements analysis',
    'business intelligence', 'etl', 'data warehouse',
    
    # Office & Tools
    'excel', 'tableau', 'powerbi', 'power bi', 'analytics', 'salesforce',
    'sap', 'erp', 'crm', 'jira', 'confluence',
    
    # Web Technologies
    'html', 'html5', 'css', 'css3', 'xml', 'json', 'rest', 'graphql',
    'soap', 'api', 'websocket', 'http', 'https', 'jwt', 'oauth',
    
    # Security
    'security', 'encryption', 'authentication', 'authorization', 'ssl', 'tls',
    'firewalls', 'penetration testing', 'vulnerability assessment',
    
    # Other Technical
    'microservices', 'monolith', 'architecture', 'design patterns', 'oops',
    'functional programming', 'reactive programming', 'event driven',
    'rest api', 'graphql', 'oop', 'solid principles',
    
    # Soft Skills (general)
    'writing', 'presentation', 'sales', 'customer service', 'training',
}

# Add Vietnamese skills to the common skills set
# These are domain-specific requirements commonly found in Vietnamese job descriptions
VIETNAMESE_REQUIREMENTS_COMMON = {
    # HR/Administration
    'quản trị nhân sự', 'nhân sự', 'hành chánh', 'kế toán', 'tuyển dụng',
    'quản lý hành chính', 'quản lý tài chính', 'phúc lợi', 'đào tạo',
    'quan hệ lao động',
    
    # Management & Leadership  
    'lãnh đạo', 'quản lý dự án', 'quản lý đội nhóm', 'lập kế hoạch', 
    'quản lý', 'quản lý sản xuất', 'quản lý bán hàng', 'quản lý cửa hàng',
    'điều hành', 'kiểm soát chất lượng',
    
    # Communication & Soft Skills
    'giao tiếp', 'xây dựng đội nhóm', 'làm việc nhóm', 'thuyết phục',
    'đàm phán', 'thuyết trình', 'tư duy phân tích', 'tư duy sáng tạo',
    'giải quyết vấn đề', 'chịu áp lực',
    
    # Knowledge & Languages
    'luật lao động', 'tiếng anh', 'tiếng trung', 'tiếng nhật', 'tiếng hàn',
    'quản lý chất lượng', 'xuất nhập khẩu', 'quản lý kho', 'logistics',
    
    # Sales & Customer Service
    'bán hàng', 'kinh doanh', 'phát triển kinh doanh', 'chăm sóc khách hàng',
    'dịch vụ khách hàng', 'tiếp thị', 'marketing', 'quan hệ khách hàng',
}

_SKILL_ALIAS_PATTERNS = [
    (alias, canonical, re.compile(r'\b' + re.escape(alias) + r'\b'))
    for alias, canonical in sorted(SKILL_ALIASES.items(), key=lambda x: len(x[0]), reverse=True)
]

_COMMON_SKILL_PATTERNS = [
    (skill, re.compile(r'\b' + re.escape(skill) + r'\b'))
    for skill in sorted(COMMON_SKILLS, key=len, reverse=True)
]

# ============================================================================
# TEXT NORMALIZATION FUNCTIONS
# ============================================================================

def normalize_text(text: str) -> str:
    """
    Normalize text for comparison with language-aware processing.
    
    - For Vietnamese text: Preserves diacritical marks (essential for meaning)
    - For English text: Standard ASCII normalization
    
    This is critical for Vietnamese because removing diacritics destroys text:
    - "thương" ≠ "thuong"
    - "lôi" ≠ "loi"
    
    Args:
        text: Input text
    
    Returns:
        Normalized text with language-appropriate handling
    """
    if not isinstance(text, str):
        return ""
    
    # Vietnamese-aware normalization
    if is_vietnamese_text(text):
        return normalize_vietnamese(text, lowercase=TEXT_LOWERCASE)
    
    # Standard English normalization
    if TEXT_LOWERCASE:
        text = text.lower()
    
    if REMOVE_SPECIAL_CHARS:
        text = re.sub(r'[^a-z0-9\s]', ' ', text)
    
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def normalize_job_description(description: str) -> str:
    """Normalize job description text."""
    return normalize_text(description)


def normalize_candidate_profile(profile_text: str) -> str:
    """Normalize candidate profile/target text."""
    return normalize_text(profile_text)


def tokenize(text: str) -> List[str]:
    """Simple whitespace tokenization."""
    return normalize_text(text).split() if text else []


# ============================================================================
# KEYWORD EXTRACTION
# ============================================================================

def extract_keywords(text: str, min_length: int = 3) -> List[str]:
    """
    Extract keywords from text, filtering common words and short tokens.
    
    Supports both English and Vietnamese texts with appropriate stop word filtering.
    
    Args:
        text: Input text
        min_length: Minimum keyword length
    
    Returns:
        List of keywords
    """
    normalized = normalize_text(text)
    words = normalized.split()
    
    # English stop words
    english_stop_words = {'the', 'and', 'or', 'in', 'of', 'to', 'a', 'is', 'it', 'for'}
    
    # Combine stop words for filtering
    all_stop_words = english_stop_words | VIETNAMESE_STOP_WORDS
    
    keywords = [w for w in words if len(w) >= min_length and w not in all_stop_words]
    
    return keywords


# ============================================================================
# SKILL EXTRACTION
# ============================================================================

def extract_skills(text: str, custom_skills: Set[str] = None) -> List[str]:
    """
    Extract skills from text using multilingual dictionary matching with alias normalization.
    
    Supports:
    - English skills: Direct skill matching with alias normalization
    - Vietnamese skills: Diacritic-aware matching with phrase extraction
    - Bilingual documents: Extracts from both languages
    
    Args:
        text: Input text to search
        custom_skills: Additional skills to recognize
    
    Returns:
        List of recognized skills (canonical form)
    """
    if not text:
        return []
    
    text_lower = str(text).lower()
    found_skills = set()
    
    # Extract English skills
    # First pass: Check skill aliases (longer aliases first to avoid partial matches)
    for alias, canonical, pattern in _SKILL_ALIAS_PATTERNS:
        if alias in text_lower and pattern.search(text_lower):
            found_skills.add(canonical)
    
    # Second pass: Check direct skills (longer skills first to catch compound skills)
    for skill, pattern in _COMMON_SKILL_PATTERNS:
        if skill in text_lower and pattern.search(text_lower):
            found_skills.add(skill)

    if custom_skills:
        for skill in sorted(set(custom_skills) - COMMON_SKILLS, key=len, reverse=True):
            skill = str(skill).lower()
            if skill and skill in text_lower and re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                found_skills.add(skill)
    
    # Extract Vietnamese skills if text contains Vietnamese
    if is_vietnamese_text(text):
        vietnamese_skills = extract_vietnamese_skills(text)
        found_skills.update(vietnamese_skills)
    
    return list(sorted(found_skills))


def extract_skills_with_source(text: str, source_field: str = 'unknown') -> dict:
    """
    Extract skills from text and return with metadata about the extraction.
    
    Supports multilingual skill extraction with detailed source information.
    
    Args:
        text: Input text to search
        source_field: Field name where text came from (e.g., 'job_requirements')
    
    Returns:
        Dict with keys:
        - skills: List of extracted skills
        - source: Which field(s) the skills came from
        - coverage: How much of the text contained recognizable skills
        - is_bilingual: Whether text is bilingual
        - languages_detected: Languages found in text
    """
    skills = extract_skills(text)
    
    # Calculate coverage
    skill_text_length = sum(len(skillname) for skillname in skills if skillname in text.lower())
    total_text_length = len(text) if text else 1
    coverage = min(100, int((skill_text_length / total_text_length) * 100))
    
    # Detect languages
    has_vietnamese = is_vietnamese_text(text)
    is_bilingual = is_bilingual_text(text) if has_vietnamese else False
    
    languages_detected = []
    if has_vietnamese:
        languages_detected.append('Vietnamese')
    if len([c for c in text if ord(c) < 128]) > len(text) * 0.1:  # Rough English detection
        languages_detected.append('English')
    
    return {
        'skills': skills,
        'source': source_field,
        'coverage': coverage,
        'text_length': total_text_length,
        'is_bilingual': is_bilingual,
        'languages_detected': languages_detected,
    }

# ============================================================================
# FIELD-SPECIFIC CLEANING FUNCTIONS
# ============================================================================

def normalize_degree(degree_text: str) -> str:
    """
    Normalize education degree text.
    
    Args:
        degree_text: Raw degree text
    
    Returns:
        Standardized degree (e.g., 'Bachelor', 'Master', 'PhD')
    """
    if not isinstance(degree_text, str):
        return 'Unknown'
    
    text = degree_text.lower()
    
    for key, value in DEGREE_MAPPING.items():
        if key in text:
            return value
    
    return 'Unknown'


def normalize_location(location_text: str) -> str:
    """
    Normalize location text.
    
    Args:
        location_text: Raw location text
    
    Returns:
        Standardized location or title-cased original
    """
    if not isinstance(location_text, str):
        return 'Unknown'
    
    text = location_text.lower()
    
    for key, value in LOCATION_MAPPING.items():
        if key in text:
            return value
    
    return text.title()


def normalize_salary(salary_str: str) -> float:
    """
    Extract numeric value from salary string.
    
    Args:
        salary_str: Raw salary string (e.g., "5,000,000" or "5000000")
    
    Returns:
        Numeric salary value or 0.0
    """
    if not salary_str:
        return 0.0
    
    numbers = re.findall(r'\d+', str(salary_str).replace(',', ''))
    return float(numbers[0]) if numbers else 0.0


def clean_salary_range(salary_text: str) -> Tuple[float, float]:
    """
    Extract salary range from text.
    
    Args:
        salary_text: Raw salary text (e.g., "5,000,000 - 10,000,000")
    
    Returns:
        Tuple of (min_salary, max_salary) or (0, 0)
    """
    if not isinstance(salary_text, str):
        return (0, 0)
    
    numbers = re.findall(r'\d+', salary_text.replace(',', ''))
    
    if len(numbers) >= 2:
        return (float(numbers[0]), float(numbers[1]))
    elif len(numbers) == 1:
        return (float(numbers[0]), float(numbers[0]))
    else:
        return (0.0, 0.0)


# ============================================================================
# DATAFRAME PREPROCESSING
# ============================================================================

def preprocess_job_data(jobs_df: pd.DataFrame) -> pd.DataFrame:
    """
    Preprocess job data: normalize text fields and extract features.
    
    Args:
        jobs_df: Job DataFrame
    
    Returns:
        Preprocessed DataFrame with normalized columns
    """
    df = jobs_df.copy()
    
    if 'job_title' in df.columns:
        df['job_title_normalized'] = df['job_title'].apply(normalize_text)
    
    if 'job_description' in df.columns:
        df['job_description_normalized'] = df['job_description'].apply(normalize_text)
    
    if 'years_of_experience' in df.columns:
        df['years_of_experience'] = df['years_of_experience'].fillna(0)
    
    return df


def preprocess_candidate_data(candidates_df: pd.DataFrame) -> pd.DataFrame:
    """
    Preprocess candidate data: normalize text fields and extract features.
    
    Args:
        candidates_df: Candidate DataFrame
    
    Returns:
        Preprocessed DataFrame with normalized columns
    """
    df = candidates_df.copy()
    
    if 'user_name' in df.columns:
        df['user_name_normalized'] = df['user_name'].apply(normalize_text)
    
    if 'skills' in df.columns:
        df['skills_normalized'] = df['skills'].apply(normalize_text)
    
    if 'degree' in df.columns:
        df['degree_normalized'] = df['degree'].apply(normalize_degree)
    
    if 'location' in df.columns or 'job_address' in df.columns:
        location_col = 'location' if 'location' in df.columns else 'job_address'
        df['location_normalized'] = df[location_col].apply(normalize_location)
    
    return df
