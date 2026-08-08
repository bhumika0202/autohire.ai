# CareerPilot — AI Career Search & Application Agent

A premium AI-powered career platform that helps you find jobs, match your skills, generate cover letters, and track applications.

## Tech Stack

### Frontend
- **React** (Vite)
- **React Router** v6
- **Lucide React** (icons)
- **Vanilla CSS** (custom design system)

### Backend
- **Node.js** + **Express**
- **PostgreSQL** (database)
- **JWT** (authentication)
- **Multer** (file uploads)
- **bcryptjs** (password hashing)

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Setup Database

Create a PostgreSQL database named `careerpilot`:

```sql
CREATE DATABASE careerpilot;
```

### 2. Backend Setup

```bash
cd backend
npm install

# Configure environment
# Edit .env and update DATABASE_URL with your PostgreSQL credentials

# Run database migrations
npm run db:migrate

# Seed sample jobs
npm run db:seed

# Start development server
npm run dev
```

Backend runs at: **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Register / Login with JWT |
| 📄 **Resume Upload** | Drag & drop PDF/DOC resume + AI analysis |
| 🤖 **AI Career Profile** | Skills, experience, education extraction |
| 🔍 **Job Search** | Search, filter, and sort with AI match scores |
| 💼 **Job Details** | Two-column layout with AI Match Analysis panel |
| 📊 **Application Tracker** | Kanban board (Saved → Applied → Interview → Offer → Rejected) |
| ✉️ **Cover Letter AI** | Personalized AI-generated cover letters |
| 👤 **Career Profile** | Editable profile with skills, experience, projects |
| ⚙️ **Settings** | Account, notifications, privacy, data management |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/jobs` | Get all jobs with match scores |
| GET | `/api/jobs/:id` | Get job details with AI analysis |
| POST | `/api/resume/upload` | Upload and analyze resume |
| GET | `/api/profile` | Get career profile |
| PUT | `/api/profile` | Update career profile |
| GET | `/api/profile/stats` | Get dashboard statistics |
| GET | `/api/applications` | Get user applications |
| POST | `/api/applications` | Create application |
| PATCH | `/api/applications/:id` | Update application status |
| DELETE | `/api/applications/:id` | Delete application |
| POST | `/api/cover-letter/generate` | Generate AI cover letter |

---

## Project Structure

```
autohire.ai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/ (Sidebar, TopHeader)
│   │   │   └── ui/ (MatchScore)
│   │   ├── context/ (AuthContext, ToastContext)
│   │   ├── layouts/ (AppLayout)
│   │   ├── lib/ (api.js)
│   │   └── pages/
│   │       ├── LoginPage
│   │       ├── DashboardPage
│   │       ├── ResumePage
│   │       ├── JobsPage
│   │       ├── JobDetailPage
│   │       ├── ApplicationsPage
│   │       ├── CoverLetterPage
│   │       ├── ProfilePage
│   │       └── SettingsPage
│   └── index.css (Design System)
│
└── backend/
    └── src/
        ├── db/ (pool, migrate, seed)
        ├── middleware/ (auth)
        └── routes/ (auth, jobs, applications, resume, profile, coverLetter)
```
