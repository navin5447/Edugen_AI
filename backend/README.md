EduGenie AI backend

Run:

```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend reads configuration from `backend/.env`.

Firebase Admin setup
--------------------

1. Create a Firebase service account JSON from the Firebase Console (Project Settings -> Service Accounts).
2. Set `FIREBASE_SERVICE_ACCOUNT` in `backend/.env` to the absolute path of the JSON file, e.g. on Windows:

```powershell
setx FIREBASE_SERVICE_ACCOUNT "C:\path\to\serviceAccount.json"
```

3. Set `GEMINI_API_KEY` in `backend/.env` so uploads can be embedded, assistant responses can be generated from retrieved context, and quizzes can be generated.
4. Install requirements and run the app. The backend exposes protected endpoints at `/secure/profile`, `/uploads/pdf`, `/uploads/files`, `/assistant/chat`, `/assistant/history`, `/quiz/generate`, `/quiz/history`, `/quiz/{quiz_id}`, `/quiz/{quiz_id}/attempt`, and `/quiz/stats` which all require `Authorization: Bearer <ID_TOKEN>`.

Notes: If `FIREBASE_SERVICE_ACCOUNT` is not set, the app will attempt to initialize using application default credentials.
