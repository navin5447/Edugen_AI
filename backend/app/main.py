import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .routes import auth, assistant, quiz, secure, uploads, graph

# Load backend/.env from the parent directory (backend/ folder)
_env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path=_env_path)



cors_origins = [origin.strip() for origin in os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:5173").split(",") if origin.strip()]

app = FastAPI(title="EduGenie AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")
app.include_router(secure.router, prefix="/secure")
app.include_router(uploads.router, prefix="/uploads")
app.include_router(assistant.router, prefix="/assistant")
app.include_router(quiz.router, prefix="/quiz")
app.include_router(graph.router, prefix="/graph")


@app.get("/")
async def root():
    return {"status": "ok"}
