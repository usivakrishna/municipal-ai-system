# AI-Based Automated Municipal Complaint Monitoring & Analysis System

Production-style full stack project with three services:

- `frontend`: React + TailwindCSS + Axios + Recharts
- `backend`: Node.js + Express + MongoDB + Mongoose + JWT + Multer
- `ai-service`: FastAPI + scikit-learn + NLTK

## Folder Structure

```text
municipal-ai-system/
  frontend/
  backend/
  ai-service/
```

## Features

- Citizen registration and login
- Admin registration and login
- Complaint submission with image upload
- Complaint tracking and history
- Admin complaint filtering and status management
- Delayed complaint monitoring and SLA flagging
- AI-based category prediction
- Keyword extraction
- K-Means clustering for similar issues
- Dashboard analytics with interactive charts

## Environment Variables

### Backend

Copy `backend/.env.example` to `backend/.env`.

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/municipal_ai_system
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN=7d
AI_SERVICE_URL=http://127.0.0.1:8001
SLA_HOURS=48
ESCALATION_HOURS=72
ADMIN_REGISTRATION_KEY=admin_2026_secure
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE_MB=5
TIMEZONE=Asia/Kolkata
```

### Frontend

Copy `frontend/.env.example` to `frontend/.env`.

```env
VITE_API_URL=http://localhost:5000/api
VITE_UPLOAD_URL=http://localhost:5000
```

### AI Service

`ai-service/.env.example` is provided for local Python runtime defaults.

## Installation

### 1. Backend

```bash
cd backend
npm install
```

### 2. Frontend

```bash
cd frontend
npm install
```

### 3. AI Service

```bash
cd ai-service
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
```

## Running the Project

Open three terminals.

### Terminal 1: AI Service

```bash
cd ai-service
uvicorn main:app --reload --port 8001
```

### Terminal 2: Backend API

```bash
cd backend
npm run dev
```

### Terminal 3: Frontend

```bash
cd frontend
npm run dev
```

Frontend URL: `http://localhost:5173`

Backend URL: `http://localhost:5000`

AI Service URL: `http://localhost:8001`

## Database Seeding

```bash
cd backend
npm run seed
```

Sample accounts after seeding:

- Admin: `admin@municipal.gov` / `Admin@123`
- Citizen: `citizen@example.com` / `Citizen@123`

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Complaints

- `POST /api/complaints`
- `GET /api/complaints`
- `GET /api/complaints/:id`
- `PUT /api/complaints/:id`
- `DELETE /api/complaints/:id`

### Admin

- `GET /api/admin/delayed`
- `GET /api/admin/dashboard`

### AI Service

- `POST /analyze`
- `POST /cluster`

## Automation Engine

The backend includes an hourly SLA worker in [backend/jobs/slaWorker.js](C:/Users/sivak/OneDrive/Desktop/PROJECTS/Batch-15(codex)/municipal-ai-system/backend/jobs/slaWorker.js). It:

- runs every hour
- flags unresolved complaints after `SLA_HOURS`
- records reminder timestamps
- escalates unresolved complaints after `ESCALATION_HOURS`

## Testing Instructions

### Backend

```bash
cd backend
node --check server.js
```

### Frontend

```bash
cd frontend
npm run build
```

### AI Service

```bash
cd ai-service
python -m py_compile main.py model.py preprocessing.py
```

## Notes

- Uploaded complaint images are stored in `backend/uploads/`
- AI classification uses seeded municipal training samples in `ai-service/model.py`
- If the AI service is offline, complaint creation still succeeds and clustering falls back safely
