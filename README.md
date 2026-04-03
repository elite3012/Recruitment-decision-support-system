# Recruitment Decision Support System

Production-grade AI-powered recruitment platform using semantic matching for candidate-job evaluation.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Dashboard (React + Vite)                    │
│         Executive Dashboard • Job Selection • Ranking         │
│         Candidate Profile • Comparison • Actions • Admin       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              Inference Service Layer                          │
│         Semantic Matching • Ranking • Explanations           │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
┌──────────────┐ ┌─────────────────┐ ┌──────────────┐
│ Embedder     │ │ Matcher Model   │ │ NLP Pipeline │
│ (sentence-   │ │ (PyTorch)       │ │ (Text Clean, │
│  transformers)  │                 │ │  Skill Ext)  │
└──────────────┘ └─────────────────┘ └──────────────┘
        │               │                     │
        └───────────────┼─────────────────────┘
                        ▼
        ┌──────────────────────────────┐
        │   SQLite Database            │
        │  (Jobs, Candidates, Matches) │
        └──────────────────────────────┘
```

## Core Components

### 1. Semantic Embedding Service (`src/models/embedder.py`)
- Uses **sentence-transformers** (all-MiniLM-L6-v2 model)
- Converts job descriptions & candidate profiles to 384-dim embeddings
- Singleton pattern for memory efficiency
- Batch processing support for 1000+ records

**Key Methods:**
- `embed(texts)` - Convert texts to vector embeddings
- `similarity(emb1, emb2)` - Cosine similarity (0-1)
- `batch_similarity(emb1, emb2_list)` - Compute similarities efficiently

### 2. Matching Model (`src/models/matcher.py`)
- **CandidateJobMatcher**: PyTorch-based semantic matching
- Computes 4 component scores:
  - **text_similarity** (35%): Semantic match via embeddings
  - **skill_match** (35%): Skill overlap ratio
  - **experience_match** (20%): Years requirement satisfaction
  - **education_match** (10%): Degree level matching
- Returns weighted overall score (0-1)

**Key Methods:**
- `match(job, candidate, weights)` - Single pair evaluation
- `rank_candidates(job, candidates)` - Rank multiple candidates

### 3. NLP Preprocessing (`src/preprocessing/`)
- **TextCleaner**: Text normalization, special char removal, tokenization
- **SkillExtractor**: Recognizes 50+ technical + professional skills
- Preprocessing handles different text formats automatically

### 4. Inference Service (`inference/service.py`)
- **MatchingInferenceService**: Production inference wrapper
- `match_candidate_to_job(candidate_id, job_id)` - Score single pair
- `rank_candidates_for_job(job_id)` - Rank all candidates
- `batch_embed_jobs/candidates()` - Precompute embeddings

### 5. Training Pipeline (`training/train.py`)
- **MatchingDataset**: Load matches history from database
- **MatchingTrainer**: Evaluate model performance
- Metrics: accuracy, precision, recall, F1-score
- Checkpoint management for model versions

## Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Download embedding model (automatic on first run)
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"
```

## Quick Start

We have provided a unified startup script to run both the frontend and backend simultaneously.

### Option 1: Unified Windows Script (Recommended)
Double-click `start.bat` or run it from the command line:
```cmd
.\start.bat
```
Alternatively, you can run the PowerShell version:
```powershell
.\start.ps1
```

This will automatically:
1. Activate the Python virtual environment (`.venv`) and start the **FastAPI backend** on port `8000`.
2. Start the **React frontend** via Vite on port `5173`.

### Option 2: NPM Scripts (Cross-platform)
If you have Node.js installed, you can use the root `package.json` to start both services concurrently (requires `npm install` in the root directory first to install `concurrently`):
```bash
npm run dev
```

### Option 3: Manual Startup
**Backend:**
```bash
cd backend
.venv\Scripts\activate    # Windows
source .venv/bin/activate # Unix/Mac
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Visits http://localhost:5173 for interactive UI.

### Option 2: Python API
```python
from inference.service import MatchingInferenceService

service = MatchingInferenceService(db_path="data/app.db")

# Score single candidate-job pair
scores = service.match_candidate_to_job(candidate_id=1, job_id=1)
print(f"Fit Score: {scores['overall_score']:.2%}")

# Rank candidates for a job
ranked = service.rank_candidates_for_job(job_id=1, top_k=10)
for candidate_id, scores in ranked:
    print(f"Candidate {candidate_id}: {scores['overall_score']:.2%}")
```

## Database Schema

**Jobs Table** (14,634 records)
- job_id, job_title, company_name, job_description
- job_requirements, years_of_experience, salary, location
- industry, career_level, degree_required

**Candidates Table** (3,191 records)
- id, name, email, phone, desired_job, skills
- experience_years, degree, location, about

**Matches Table** (Historical matches)
- job_id, candidate_id, is_match, score
- created_at, recruiter_id, decision_notes

**RecruiterAction Table** (Action history)
- candidate_id, job_id, action_type
- timestamp, recruiter_name, notes

## Configuration

**Feature Weights** (`config/settings.py`):
```python
FEATURE_WEIGHTS = {
    'text_similarity': 0.35,      # Semantic description match
    'skill_match': 0.35,           # Skill overlap
    'experience_match': 0.20,      # Years requirement
    'education_match': 0.10        # Degree level
}
```

Customize by editing weights or calling `match()` with custom weights dict.

## Streamlit Dashboard

**8 Pages:**
1. **Executive Dashboard** - KPI metrics, industry breakdown, system status
2. **Job Selection** - Browse jobs, view details, rank candidates
3. **Candidate Ranking** - AI-ranked candidates for selected job
4. **Candidate Detail** - Full profile, match breakdown, decision form
5. **Compare Candidates** - Side-by-side evaluation
6. **Recruiter Actions** - Track decisions, view action history
7. **Analytics** - Match statistics, decision trends
8. **Admin Panel** - Data management, validation, system utilities

## Performance

- **Inference latency**: ~100-200ms per match (GPU), ~400-600ms (CPU)
- **Batch ranking**: ~2-5s for 100 candidates (GPU)
- **Memory**: ~1.5GB with model loaded
- **Scalability**: Tested on 15K jobs × 3K+ candidates

## Deployment

### Docker
```dockerfile
FROM python:3.11
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["streamlit", "run", "ui/app.py"]
```

### Production (Gunicorn + FastAPI)
See `inference/service.py` for API wrapper integration.

## Development

### Run Tests
```bash
pytest tests/ -v
```

### Evaluate Model
```bash
python training/train.py --evaluate --db data/app.db
```

### Precompute Embeddings
```python
from inference.service import MatchingInferenceService
service = MatchingInferenceService()
job_embeddings = service.batch_embed_jobs()
candidate_embeddings = service.batch_embed_candidates()
```

## Technical Stack

| Layer | Technology |
|-------|-----------|
| UI | Streamlit 1.28 |
| ML/AI | PyTorch 2.0, sentence-transformers 2.2 |
| Database | SQLAlchemy 2.0, SQLite |
| NLP | spaCy 3.6 (optional), custom tokenizers |
| Data | pandas 2.0, numpy 1.24 |
| Metrics | scikit-learn 1.3 (F1, precision, recall) |

## API Reference

### MatchingInferenceService

```python
# Initialize
service = MatchingInferenceService(db_path="data/app.db")

# Match single pair
scores = service.match_candidate_to_job(1, 1)
# Returns: {'text_similarity': 0.85, 'skill_match': 0.92, ...}

# Rank candidates
ranked = service.rank_candidates_for_job(job_id=5, top_k=10)
# Returns: [(candidate_id, scores_dict), ...]

# Precompute embeddings
embeddings = service.batch_embed_jobs(batch_size=100)
```

### CandidateJobMatcher

```python
from src.models.matcher import CandidateJobMatcher
matcher = CandidateJobMatcher()

job = {'job_title': 'ML Engineer', 'job_description': '...', ...}
candidate = {'desired_job': 'ML Engineer', 'skills': '...', ...}

scores = matcher.match(job, candidate)
ranked = matcher.rank_candidates(job, [candidates_list])
```

## Data Files

Place data in `data/` directory:
- `input_data/jobs.csv` - Job postings (15K+ rows)
- `input_data/candidates.csv` - Candidate profiles (3K+ rows)
- `app.db` - SQLite database (auto-created)

## License

See LICENSE file for details.

## Contact

For questions or issues, refer to project documentation or create an issue in the repository.

4. **Set up the database**
   ```bash
   python scripts/setup_db.py
   ```

5. **Load sample data (optional)**
   ```bash
   python scripts/load_sample_data.py
   ```

6. **Run the app**
   ```bash
   npm run dev (frontend)
uvicorn main:app --reload (backend)
   ```

   Open your browser to `http://localhost:8501`

## Project Structure

```
recruitment-decision-support-system/
├── src/                          # Core application logic
│   ├── ingestion/               # Load job and candidate data
│   ├── validation/              # Validate data quality
│   ├── preprocessing/           # Normalize and clean data
│   ├── features/                # Extract features
│   ├── matching/                # Rule-based and similarity matching
│   ├── ranking/                 # Fit scoring and ranking
│   ├── explanation/             # Generate match explanations
│   ├── storage/                 # Database models and access
│   ├── actions/                 # Track recruiter decisions
│   └── utils/                   # Logging and helpers
├── ui/                          # Streamlit dashboard
│   ├── app.py                   # Main entry point
│   ├── pages/                   # Dashboard pages
│   ├── components/              # Reusable UI components
│   └── assets/                  # CSS and styling
├── data/                        # Data storage
│   ├── raw/                     # Original datasets
│   ├── processed/               # Preprocessed data
│   └── sample/                  # Sample data for testing
├── config/                      # Configuration
├── tests/                       # Unit and integration tests
├── scripts/                     # Setup and utility scripts
├── docs/                        # Documentation
├── requirements.txt             # Python dependencies
└── README.md                    # This file
```

## Architecture

The system follows a modular architecture with clear separation of concerns:

1. **Data Ingestion**: Load structured datasets
2. **Validation**: Check data quality
3. **Preprocessing**: Normalize text and fields
4. **Feature Engineering**: Extract matchable attributes
5. **Matching Engine**: Rule-based filters + similarity scoring
6. **Ranking Engine**: Aggregate scores and rank candidates
7. **Explanation**: Generate reasonings for rankings
8. **Database**: Persist jobs, candidates, matches, and recruiter actions
9. **UI**: Streamlit dashboard for recruiter workflow

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed design.

## Usage

### Load Data
1. Go to **Admin** page
2. Upload job CSV and candidate CSV
3. Review validation report

### Screen Candidates
1. Go to **Job Selection**
2. Select a job to screen for
3. View ranked candidates on **Candidate Ranking** page
4. Review match explanation for each candidate

### Make Decisions
1. Click on a candidate to see full **Candidate Detail**
2. Click **Shortlist**, **Hold**, or **Reject**
3. Add optional recruiter notes
4. View decision history on **Actions** page

### Compare Candidates
1. Go to **Compare Candidates**
2. Select 2-3 candidates for the same job
3. View side-by-side comparison

## Development

For development setup and guidance, see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

### Run Tests
```bash
pytest tests/ -v
```

### Development Order
1. Data ingestion & validation
2. Database layer
3. Preprocessing & features
4. Matching & ranking
5. Explanation & actions
6. UI & dashboard
7. Testing & polish

## Dataset Requirements

### Job Dataset CSV Columns
- `job_id` (primary key)
- `job_title`
- `job_description`
- `required_skills` (comma-separated or JSON)
- `preferred_skills` (optional)
- `experience_years_min`
- `experience_years_max`
- `education_required`
- `location`

### Candidate Dataset CSV Columns
- `candidate_id` (primary key)
- `candidate_name`
- `current_skills` (comma-separated or JSON)
- `years_of_experience`
- `education_level`
- `certification`
- `current_title`
- `location`

Example datasets are available on Kaggle. See sample data structure in `data/sample/`.

## Configuration

Edit `config/settings.py` to adjust:
- Database path
- Text processing parameters
- Feature weights for ranking
- Similarity thresholds

## Future Extensions

- **Resume Upload**: Parse and extract data from PDF resumes
- **Fairness Monitoring**: Track for diversity and discrimination patterns
- **Model Training**: Train ML models on recruiter decisions
- **Interview Scheduling**: Integrated calendar booking
- **Performance Analytics**: Track hiring outcomes
- **API Layer**: RESTful API for integration with HRIS

## Technologies Used

- **Python 3.9+**
- **Streamlit**: Interactive dashboard
- **pandas**: Data processing
- **scikit-learn**: ML algorithms
- **spaCy**: NLP (optional)
- **sentence-transformers**: Semantic matching (optional)
- **SQLite**: Local database (PostgreSQL later)

## License

See [LICENSE](LICENSE)

## Contact

For questions or contributions, contact the development team.

---

**Note**: This is a decision support system designed to augment recruiter judgment. All final hiring decisions remain with human recruiters.
