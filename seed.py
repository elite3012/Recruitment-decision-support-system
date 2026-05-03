import sys
import os

# Add backend to path so we can import from src
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from src.storage.database import Database

def seed():
    # Use absolute path to data/app.db
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    os.makedirs(data_dir, exist_ok=True)
    db_path = os.path.join(data_dir, 'app.db')
    db = Database(db_path=db_path)
    
    # 1. Clear existing data
    db.reset_database()
    
    # 2. Add some mock jobs
    job1 = db.add_job({
        "job_title": "Software Engineer (Backend)",
        "company_name": "Tech Corp",
        "job_description": "We are looking for a backend software engineer with Python and FastAPI experience.",
        "job_requirements": "Python, FastAPI, SQL, Docker",
        "location": "Ho Chi Minh City",
        "years_of_experience": "2",
        "salary": "Negotiable"
    })
    
    job2 = db.add_job({
        "job_title": "Frontend Developer",
        "company_name": "Web Solutions",
        "job_description": "Looking for a React developer to build modern web applications.",
        "job_requirements": "React, TypeScript, CSS, Vite",
        "location": "Remote",
        "years_of_experience": "1",
        "salary": "1000 - 1500 USD"
    })
    
    # 3. Add some mock candidates
    cand1 = db.add_candidate({
        "user_name": "Nguyen Van A",
        "desired_job": "Backend Developer",
        "skills": "Python, Django, FastAPI, PostgreSQL",
        "work_experience": "3",
        "location": "Ho Chi Minh City",
        "degree": "Bachelor of Computer Science"
    })
    
    cand2 = db.add_candidate({
        "user_name": "Tran Thi B",
        "desired_job": "Frontend Engineer",
        "skills": "JavaScript, React, Vue, HTML, CSS",
        "work_experience": "2",
        "location": "Hanoi",
        "degree": "Bachelor of IT"
    })
    
    print("Database seeded with mock data successfully!")

if __name__ == "__main__":
    seed()
