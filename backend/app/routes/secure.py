from fastapi import APIRouter, Depends, Header, HTTPException
from typing import Any, Dict

from ..utils.firebase_utils import verify_id_token

router = APIRouter()


async def get_current_user(authorization: str = Header(None)) -> Dict[str, Any]:
    if not authorization:
        raise HTTPException(status_code=401, detail='Missing Authorization header')
    token = authorization.replace('Bearer ', '')
    try:
        decoded = verify_id_token(token)
        return decoded
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f'Invalid token: {exc}')


@router.get('/profile')
async def profile(user: Dict[str, Any] = Depends(get_current_user)):
    # Return a minimal profile derived from token claims
    return {
        'uid': user.get('uid'),
        'email': user.get('email'),
        'name': user.get('name') or user.get('email')
    }
