# Column mapping for job and candidate datasets
# This provides flexibility to adapt to different data sources

JOB_COLUMN_MAPPING = {
    # Expected column names -> actual column names in dataset
    "job_id": "JobID",
    "job_title": "Job Title",
    "company_name": "Name Company",
    "company_overview": "Company Overview",
    "job_description": "Job Description",
    "job_requirements": "Job Requirements",
    "benefits": "Benefits",
    "job_address": "Job Address",
    "job_type": "Job Type",
    "career_level": "Career Level",
    "years_of_experience": "Years of Experience",
    "salary": "Salary",
    "industry": "Industry",
}

CANDIDATE_COLUMN_MAPPING = {
    # Expected column names -> actual column names in dataset
    "user_id": "UserID",
    "user_name": "User Name",
    "industry": "Industry",
    "desired_job": "Desired Job",
    "workplace_desired": "Workplace Desired",
    "desired_salary": "Desired Salary",
    "age": "Age",
    "target": "Target",
    "skills": "Skills",
    "degree": "Degree",
    "work_experience": "Work Experience",
}

# Data types for validation
JOB_DATA_TYPES = {
    "job_id": "int",
    "job_title": "str",
    "company_name": "str",
    "job_description": "str",
    "job_requirements": "str",
}

CANDIDATE_DATA_TYPES = {
    "user_id": "int",
    "user_name": "str",
    "skills": "str",
    "work_experience": "str",
}
