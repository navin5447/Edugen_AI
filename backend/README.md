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
3. Set `LLM_PROVIDER` in `backend/.env` (either `gemini` or `ollama`). If using `gemini`, set `GEMINI_API_KEY`. If using `ollama`, download Ollama, run `ollama run qwen2.5:latest` (or `phi3:mini`), and configure `OLLAMA_MODEL` and `OLLAMA_BASE_URL` in `backend/.env`.
4. Run the test script `python test_ollama.py` in the backend directory to verify your local LLM setup.
5. Install requirements and run the app. The backend exposes protected endpoints at `/secure/profile`, `/uploads/pdf`, `/uploads/files`, `/assistant/chat`, `/assistant/history`, `/quiz/generate`, `/quiz/history`, `/quiz/{quiz_id}`, `/quiz/{quiz_id}/attempt`, `/quiz/stats`, and `/graph` which all require `Authorization: Bearer <ID_TOKEN>`.

Notes: If `FIREBASE_SERVICE_ACCOUNT` is not set, the app will attempt to initialize using application default credentials.
