# EduGenie AI

Full-stack AI-powered academic assistant for college students.

Folders:
- `frontend/` — React + TypeScript + Vite
- `backend/` — FastAPI + LangChain + ChromaDB

Configuration:
- Frontend settings live in `frontend/.env` and `frontend/.env.example`.
- Backend settings live in `backend/.env` and `backend/.env.example`.
- The Firebase Admin service account JSON is stored at `backend/credentials/serviceAccount.json` and is ignored by git.

Setup (frontend):

```bash
cd frontend
npm install
npm run dev
```

Setup (backend):

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Current implemented modules:
- Authentication with Firebase Google Sign-In and phone OTP
- Protected dashboard with token sync to the backend
- PDF upload scaffold with protected metadata storage
- AI assistant scaffold with protected chat history
- AI quiz generator with quiz history and score saving

RAG setup:
- Set `GEMINI_API_KEY` in `backend/.env`.
- The backend stores embedded PDF chunks in Chroma under `CHROMA_PERSIST_DIR`.
- Uploads are indexed per user, and assistant responses use the top 5 retrieved chunks as context.

Next steps: connect the upload/chat scaffold to ChromaDB, Gemini, PostgreSQL, and add quiz/planner modules.

Testing steps:
1. Start the backend from `backend/`.
2. Start the frontend from `frontend/`.
3. Sign in with Firebase in the browser.
4. Upload a PDF in the Uploads page and confirm the success notification.
5. Ask a question in the Assistant page and verify the source chunks render.
6. Open the Quiz page, generate a quiz, complete it, and verify the score screen and saved attempt.

API examples:

Upload and index a PDF:

```bash
curl -X POST http://127.0.0.1:8000/uploads/pdf \
	-H "Authorization: Bearer <ID_TOKEN>" \
	-F "title=Midterm Notes" \
	-F "category=notes" \
	-F "file=@sample.pdf"
```

Ask a question against uploaded PDFs:

```bash
curl -X POST http://127.0.0.1:8000/assistant/chat \
	-H "Authorization: Bearer <ID_TOKEN>" \
	-H "Content-Type: application/json" \
	-d '{"message":"What are the key topics in unit 2?"}'
```

Get chat history:

```bash
curl -H "Authorization: Bearer <ID_TOKEN>" http://127.0.0.1:8000/assistant/history
```

Generate a quiz:

```bash
curl -X POST http://127.0.0.1:8000/quiz/generate \
	-H "Authorization: Bearer <ID_TOKEN>" \
	-H "Content-Type: application/json" \
	-d '{"difficulty":"medium","question_count":10}'
```

View quiz history:

```bash
curl -H "Authorization: Bearer <ID_TOKEN>" http://127.0.0.1:8000/quiz/history
```

Save a quiz attempt:

```bash
curl -X POST http://127.0.0.1:8000/quiz/<quiz_id>/attempt \
	-H "Authorization: Bearer <ID_TOKEN>" \
	-H "Content-Type: application/json" \
	-d '{"score":8,"total_questions":10,"answers":["A","B","C","D"],"completed_in_seconds":120}'
```
