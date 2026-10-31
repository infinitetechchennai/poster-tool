# 🎨 InfiniteTech AI Poster Studio — Enterprise Marketing Suite

A unified, full-stack marketing poster generation and social automation studio for InfiniteTech AI.

- **Frontend**: React 19, Vite 8, TailwindCSS, HTML5 Canvas 2D engine with 50 bespoke vector templates, Groq AI, Ollama, and Pollinations AI.
- **Backend**: Python FastAPI, PostgreSQL 18, Chrome Headless rendering, and Excel search intent reconciliation.

---

## 📁 Project Architecture

```
automate posting/
├── frontend/                          # 🎨 React 19 + Vite Frontend Studio
│   ├── public/                        # Static icons, category photo library, brand logo
│   │   ├── images_ai/                 # 10 curated offline image categories
│   │   ├── logo.png
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/                # UI widgets (ContentEditor, ImagePreview, Toast)
│   │   ├── pages/                     # App modules (CreatePost, BulkGenerator, AutoPosting, etc.)
│   │   ├── services/                  # Business logic (backendApi, pollinations, groq, etc.)
│   │   ├── renderers/                 # 50 dedicated HTML5 Canvas 2D renderers
│   │   └── utils/                     # 50 design template specs, text layout, categories
│   ├── .env                           # Frontend environment configuration (VITE_GROQ_API_KEY, etc.)
│   ├── package.json
│   └── vite.config.js
│
├── backend/                           # ⚙️ Python FastAPI Backend Service
│   ├── app/                           # API controllers, schemas, settings, entry point
│   ├── engine/                        # Chrome Headless HTML/CSS rendering engine
│   ├── importer/                      # Ingestion engine for 3 master Excel workbooks
│   ├── database/                      # PostgreSQL schemas & views (v_commercial_keywords)
│   ├── templates/                     # Jinja2 responsive social templates (4:5, 1:1, 9:16, 16:9, 1.91:1)
│   ├── tests/                         # Pytest test suite (29/29 passing tests)
│   ├── requirements.txt
│   └── .env                           # Secret credentials (PGPASSWORD, POLLINATIONS_API_KEY)
│
├── shared/                            # 📐 Social platform presets & canonical template IDs
├── data/                              # 🔒 Master Excel source files (Read-Only)
├── output_posters/                    # Deterministic rendered PNG and PDF exports
├── docs/                              # Architecture blueprints & reconciliation docs
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Run the Frontend (React Studio)

```bash
cd frontend
npm install
npm run dev
```
The interactive React studio will launch at:
👉 **http://localhost:5173**

### 2. Run the Backend (FastAPI + PostgreSQL)

```bash
# Start PostgreSQL (if not already running as a system service)
# Start the FastAPI server on port 8000:
python3 -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```
The backend REST API and Swagger documentation will be live at:
👉 **http://localhost:8000/docs**

### 3. Run Backend Automated Tests

```bash
python3 -m pytest backend/tests -v
```
Runs the full 29-test verification suite covering database integrity, Chrome Headless rendering, social presets, Pollinations AI, and source Excel immutability.
