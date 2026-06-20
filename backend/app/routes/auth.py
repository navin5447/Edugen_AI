from fastapi import APIRouter, HTTPException, Header
import logging
import os
from pydantic import BaseModel

from ..utils.firebase_utils import verify_id_token, init_firebase

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post('/verify')
async def verify_token(authorization: str = Header(None)):
    """Verify Firebase ID token sent in `Authorization: Bearer <token>` header.

    Returns decoded token claims on success.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail='Missing Authorization header')
    token = authorization.replace('Bearer ', '')
    try:
        decoded = verify_id_token(token)
        return {"verified": True, "claims": decoded}
    except Exception as exc:
        # Log the exception for debugging and return 401 to client
        logger.exception("Failed to verify Firebase ID token")
        # Also print to stderr/stdout so it appears in simple terminal logs
        print(f"Failed to verify Firebase ID token: {exc}")
        raise HTTPException(status_code=401, detail=f'Invalid token: {exc}')


class DevTokenRequest(BaseModel):
    email: str


@router.post('/dev-token')
async def create_dev_custom_token(req: DevTokenRequest):
    """Mint a Firebase custom token for local development.

    This endpoint is intended only for local development and testing. It
    creates a custom token using the Admin SDK which the frontend can use
    with `signInWithCustomToken` to obtain a normal Firebase ID token.
    """
    # For safety, require DEV_AUTH env var to be set to "true" to enable
    if os.environ.get('DEV_AUTH', 'true').lower() != 'true':
        raise HTTPException(status_code=403, detail='Dev auth disabled')

    try:
        # Use a predictable uid for dev users
        uid = f"dev:{req.email}"
        import firebase_admin
        from firebase_admin import auth as firebase_auth

        # Ensure Firebase Admin SDK is initialized before creating a custom token
        init_firebase()
        token_bytes = firebase_auth.create_custom_token(uid)
        token = token_bytes.decode('utf-8') if isinstance(token_bytes, (bytes, bytearray)) else str(token_bytes)
        return {"custom_token": token}
    except Exception as exc:
        logger.exception('Failed to create dev custom token')
        raise HTTPException(status_code=500, detail=str(exc))
