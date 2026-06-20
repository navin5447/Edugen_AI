import os
import json
from typing import Any, Dict

import firebase_admin
from firebase_admin import auth as firebase_auth, credentials

_initialized = False


def init_firebase() -> None:
    """Initialize Firebase Admin SDK.

    Expects `FIREBASE_SERVICE_ACCOUNT_JSON` (raw JSON string) or
    `FIREBASE_SERVICE_ACCOUNT` (filepath to JSON) environment variable.
    If neither is set, attempts to initialize with application default credentials.
    """
    global _initialized
    if _initialized:
        return

    cred_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
    cred_path = os.environ.get("FIREBASE_SERVICE_ACCOUNT")
    try:
        if cred_json:
            # Parse service account credential directly from JSON string
            sa = json.loads(cred_json)
            project_id = sa.get("project_id")
            if project_id:
                os.environ["GOOGLE_CLOUD_PROJECT"] = project_id
            cred = credentials.Certificate(sa)
            firebase_admin.initialize_app(cred)
        elif cred_path and os.path.exists(cred_path):
            # If project ID not set in env, attempt to read it from the
            # service account JSON and export it for Firebase libraries
            if not os.environ.get("GOOGLE_CLOUD_PROJECT"):
                try:
                    with open(cred_path, "r", encoding="utf-8") as f:
                        sa = json.load(f)
                        project_id = sa.get("project_id")
                        if project_id:
                            os.environ["GOOGLE_CLOUD_PROJECT"] = project_id
                except Exception:
                    # ignore parsing errors and proceed; initialize_app may still work
                    pass
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            # Fallback to default credentials
            firebase_admin.initialize_app()
        _initialized = True
    except Exception:
        # If initialization fails, ensure we raise to caller for visibility
        raise


def verify_id_token(id_token: str) -> Dict[str, Any]:
    """Verify an ID token and return decoded token claims.

    Raises firebase_admin.auth.InvalidIdTokenError or other exceptions on failure.
    """
    init_firebase()
    decoded = firebase_auth.verify_id_token(id_token)
    return decoded
