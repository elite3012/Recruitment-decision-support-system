"""
Vietnamese language support utilities for text processing and skill extraction.

Provides Vietnamese-aware text normalization, phrase extraction, and skill recognition
while preserving diacritical marks essential for meaningful Vietnamese text processing.
"""
import re
from typing import List, Set, Dict, Tuple


# ============================================================================
# VIETNAMESE CHARACTER DETECTION
# ============================================================================

def is_vietnamese_text(text: str) -> bool:
    """
    Detect if text contains Vietnamese characters (with diacritics).
    
    Vietnamese uses Latin Extended-A (U+0100-U+017F) and Latin Extended Additional
    (U+1E00-U+1EFF) Unicode ranges for diacritical marks.
    
    Args:
        text: Text to check
    
    Returns:
        True if text contains Vietnamese characters
    """
    if not isinstance(text, str):
        return False
    
    # Vietnamese diacritical characters: à, á, ả, ã, ạ, ă, ằ, ắ, ẳ, ẵ, ặ, â, ầ, ấ, ẩ, ẫ, ậ, etc.
    vietnamese_pattern = r'[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]'
    return bool(re.search(vietnamese_pattern, text, re.IGNORECASE))


# ============================================================================
# VIETNAMESE TEXT NORMALIZATION
# ============================================================================

def normalize_vietnamese(text: str, lowercase: bool = True) -> str:
    """
    Normalize Vietnamese text while PRESERVING diacritical marks.
    
    This is critical because Vietnamese diacritics carry meaning:
    - "thương" ≠ "thuong"
    - "lôi" ≠ "loi"
    - "tư" ≠ "tu"
    
    The function performs safe normalization without destroying the text:
    - Lowercase (optional)
    - Remove unnecessary punctuation (!, @, #, etc.)
    - Normalize whitespace
    - Preserve all Vietnamese diacritics
    
    Args:
        text: Vietnamese text to normalize
        lowercase: Whether to lowercase (default: True)
    
    Returns:
        Normalized Vietnamese text with diacritics preserved
    """
    if not isinstance(text, str):
        return ""
    
    if lowercase:
        text = text.lower()
    
    # Remove only truly unnecessary characters, NOT diacritics
    # Keep: letters (including Vietnamese), numbers, hyphens, apostrophes, spaces, commas, periods
    text = re.sub(r'[^\w\s\-\'.,àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]', ' ', text)
    
    # Normalize multiple spaces to single space
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text


def normalize_text_smart(text: str, lowercase: bool = True, remove_special_chars: bool = True) -> str:
    """
    Smart text normalization that detects language and applies appropriate processing.
    
    - If Vietnamese detected: Use Vietnamese-aware normalization (preserves diacritics)
    - Otherwise: Use standard English normalization (can remove special chars)
    
    Args:
        text: Input text
        lowercase: Whether to lowercase
        remove_special_chars: Whether to remove special characters (skipped for Vietnamese)
    
    Returns:
        Normalized text
    """
    if not isinstance(text, str):
        return ""
    
    if is_vietnamese_text(text):
        return normalize_vietnamese(text, lowercase=lowercase)
    else:
        # Standard English normalization
        if lowercase:
            text = text.lower()
        
        if remove_special_chars:
            text = re.sub(r'[^a-z0-9\s]', ' ', text)
        
        text = re.sub(r'\s+', ' ', text).strip()
        return text


# ============================================================================
# VIETNAMESE SKILLS & REQUIREMENTS DICTIONARY
# ============================================================================

# Vietnamese skill/requirement phrases commonly found in job descriptions
VIETNAMESE_SKILLS = {
    # HR/Administration
    'quản trị nhân sự', 'quản trị', 'nhân sự', 'hr', 'hành chánh', 'kế toán', 
    'quản lý hành chính', 'quản lý tài chính', 'lương thưởng', 'phúc lợi',
    'tuyển dụng', 'đào tạo', 'phát triển nhân sự', 'quan hệ lao động',
    
    # Management & Leadership  
    'lãnh đạo', 'quản lý dự án', 'quản lý đội nhóm', 'lập kế hoạch', 
    'quản lý', 'quản lý sản xuất', 'quản lý bán hàng', 'quản lý cửa hàng',
    'điều hành', 'kiểm soát chất lượng', 'giám sát',
    
    # Communication & Soft Skills
    'giao tiếp', 'giao tiếp tốt', 'xây dựng đội nhóm', 'làm việc nhóm',
    'thuyết phục', 'đàm phán', 'thuyết trình', 'trình bày',
    'tư duy phân tích', 'tư duy sáng tạo', 'giải quyết vấn đề',
    'tự quản lý', 'kỷ luật', 'trách nhiệm', 'tỉnh táo', 'chịu áp lực',
    
    # Technical/IT Skills
    'lập trình', 'phát triển phần mềm', 'bảo trì hệ thống', 'quản trị hệ thống',
    'quản trị mạng', 'cơ sở dữ liệu', 'bảo mật thông tin', 'an toàn thông tin',
    'phân tích yêu cầu', 'thiết kế hệ thống', 'kiểm thử phần mềm',
    
    # Knowledge & Languages
    'luật lao động', 'luật pháp', 'tiếng anh', 'tiếng trung', 'tiếng nhật',
    'tiếng hàn', 'tiếng pháp', 'tiếng đức', 'tiếng tây ban nha',
    'quản lý chất lượng', 'xuất nhập khẩu', 'quản lý kho', 'logistics',
    
    # Sales & Customer Service
    'bán hàng', 'kinh doanh', 'phát triển kinh doanh', 'chăm sóc khách hàng',
    'dịch vụ khách hàng', 'tư vấn bán hàng', 'tiếp thị', 'marketing',
    'quan hệ khách hàng', 'crm',
    
    # General Requirements
    'kinh nghiệm', 'có kinh nghiệm', 'không yêu cầu kinh nghiệm', 'mới tốt nghiệp',
    'tốt nghiệp', 'bằng cấp', 'chứng chỉ', 'sức khỏe tốt', 'hỗ trợ việc làm',
}

# Vietnamese requirement phrase patterns - phrases that precede lists of requirements
VIETNAMESE_REQUIREMENT_PATTERNS = {
    'kỹ năng': 'skills',           # "Kỹ năng:" section
    'kỹ năng cần có': 'skills',    # "Kỹ năng cần có:" section
    'yêu cầu': 'requirements',     # "Yêu cầu:" section
    'am hiểu': 'knowledge',        # "Am hiểu:" section
    'hiểu biết': 'knowledge',      # "Hiểu biết:" section
    'kinh nghiệm': 'experience',   # "Kinh nghiệm:" section
    'tốt nghiệp': 'education',     # "Tốt nghiệp:" section
    'bằng cấp': 'education',       # "Bằng cấp:" section
    'chứng chỉ': 'certification',  # "Chứng chỉ:" section
    'ngoại ngữ': 'languages',      # "Ngoại ngữ:" section
    'tiếng': 'languages',          # Languages section
}


# ============================================================================
# VIETNAMESE PHRASE EXTRACTION
# ============================================================================

def extract_vietnamese_phrases(text: str) -> List[str]:
    """
    Extract Vietnamese requirement phrases/sections from job description.
    
    Looks for common patterns like "Kỹ năng:", "Kinh nghiệm:", "Am hiểu:", etc.
    and extracts the content that follows.
    
    Args:
        text: Job description text
    
    Returns:
        List of extracted Vietnamese requirement phrases
    """
    if not isinstance(text, str) or not is_vietnamese_text(text):
        return []
    
    phrases = []
    text_lower = text.lower()
    
    # Split by requirement section markers
    # Look for patterns like "Kỹ năng: ..., ..., ..." or "Yêu cầu: ... ... ..."
    
    for pattern, section_type in VIETNAMESE_REQUIREMENT_PATTERNS.items():
        # Find sections that start with this pattern
        regex_pattern = pattern + r'[:\s]+([^:]*?)(?=(?:kỹ năng|yêu cầu|am hiểu|kinh nghiệm|tốt nghiệp|bằng cấp|chứng chỉ|ngoại ngữ|$))'
        
        matches = re.finditer(regex_pattern, text_lower, re.IGNORECASE | re.DOTALL)
        for match in matches:
            section_content = match.group(1).strip()
            
            # Extract individual items from the section
            # Items are usually separated by: commas, semicolons, dashes, bullet points, or newlines
            items = re.split(r'[,;•\-\n]', section_content)
            
            for item in items:
                item = item.strip()
                # Skip empty items and very short text
                if item and len(item) > 2:
                    phrases.append(item)
    
    return phrases


# ============================================================================
# VIETNAMESE STOP WORDS
# ============================================================================

VIETNAMESE_STOP_WORDS = {
    'là', 'và', 'có', 'của', 'từ', 'đến', 'để', 'được', 'cũng',
    'như', 'nhưng', 'cái', 'chiếc', 'những', 'người', 'đoàn',
    'nhóm', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín', 'mười',
    'với', 'va', 'về', 'ngoài', 'trừ', 'hơn', 'kém', 'tới', 'theo', 'trong', 'trên',
    'dưới', 'bên', 'cạnh', 'giữa', 'giữa', 'sau', 'trước', 'trương',
    'vẫn', 'vừa', 'đã', 'sẽ', 'đang', 'lại', 'nên', 'phải', 'có thể', 'có',
    'tại', 'ở', 'tự', 'chính', 'riêng', 'khác', 'giống', 'sắp', 'không',
    'chưa', 'hoàn toàn', 'hẳn', 'hay', 'hoặc', 'thôi', 'thôi',
}


def filter_vietnamese_stop_words(words: List[str]) -> List[str]:
    """
    Filter out Vietnamese stop words from a word list.
    
    Args:
        words: List of words
    
    Returns:
        Filtered word list without stop words
    """
    return [w for w in words if w.lower() not in VIETNAMESE_STOP_WORDS and len(w) >= 3]


# ============================================================================
# VIETNAMESE SKILL MATCHING
# ============================================================================

def extract_vietnamese_skills(text: str) -> Set[str]:
    """
    Extract Vietnamese skills and requirements from text.
    
    Uses both dictionary matching and phrase extraction.
    
    Args:
        text: Job description text
    
    Returns:
        Set of recognized Vietnamese skills
    """
    if not isinstance(text, str) or not is_vietnamese_text(text):
        return set()
    
    # Normalize text but preserve Vietnamese diacritics
    text_normalized = normalize_vietnamese(text, lowercase=True)
    found_skills = set()
    
    # Direct skill dictionary matching (longer skills first to avoid partial matches)
    for skill in sorted(VIETNAMESE_SKILLS, key=len, reverse=True):
        # Use word boundary matching
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_normalized):
            found_skills.add(skill)
    
    # Extract phrases from requirement sections
    phrases = extract_vietnamese_phrases(text_normalized)
    for phrase in phrases:
        phrase_lower = phrase.lower().strip()
        
        # Check if phrase matches or contains a skill
        for skill in sorted(VIETNAMESE_SKILLS, key=len, reverse=True):
            if skill in phrase_lower or phrase_lower in skill:
                found_skills.add(skill)
                break
        
        # Add multi-word phrases that look like skills
        if len(phrase_lower.split()) >= 2 and len(phrase_lower) >= 5:
            # Check if it's a meaningful phrase (not just stop words)
            words = phrase_lower.split()
            meaningful_words = filter_vietnamese_stop_words(words)
            if len(meaningful_words) >= 1:
                found_skills.add(phrase_lower.strip('.,:;'))
    
    return found_skills


# ============================================================================
# BILINGUAL UTILITY FUNCTIONS
# ============================================================================

def detect_language_ratio(text: str) -> Tuple[float, float]:
    """
    Detect ratio of Vietnamese vs English characters in text.
    
    Args:
        text: Text to analyze
    
    Returns:
        Tuple of (vietnamese_ratio, english_ratio)
    """
    if not text:
        return (0.0, 0.0)
    
    vietnamese_chars = len(re.findall(r'[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]', text, re.IGNORECASE))
    english_chars = len(re.findall(r'[a-z]', text, re.IGNORECASE))
    
    total = vietnamese_chars + english_chars
    if total == 0:
        return (0.0, 0.0)
    
    return (vietnamese_chars / total, english_chars / total)


def is_bilingual_text(text: str, threshold: float = 0.1) -> bool:
    """
    Detect if text is bilingual (both Vietnamese and English).
    
    Args:
        text: Text to check
        threshold: Minimum ratio of non-dominant language to be considered bilingual
    
    Returns:
        True if text is bilingual
    """
    viet_ratio, eng_ratio = detect_language_ratio(text)
    min_ratio = min(viet_ratio, eng_ratio)
    return min_ratio >= threshold
