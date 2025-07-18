from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
import uuid
import bcrypt
from datetime import datetime, timedelta
import jwt
import os
from services.supabase_service import SupabaseService

router = APIRouter()

# Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: str
    email: str
    display_name: Optional[str]
    subscription_tier: str
    created_at: datetime
    usage_quota: int
    usage_count: int

# Security
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1 week

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Helper functions
def hash_password(password: str) -> str:
    """Hash a password for storing."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a stored password against one provided by user."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """Get the current user from the token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get the user from Supabase
    supabase = SupabaseService.get_client()
    if not supabase:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection failed",
        )
    
    user_result = supabase.table("users").select("*").eq("id", user_id).execute()
    user = user_result.data[0] if user_result.data else None
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

# Endpoints
@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    """Register a new user."""
    supabase = SupabaseService.get_client()
    if not supabase:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection failed",
        )
    
    # Check if the user already exists
    existing_user = supabase.table("users").select("*").eq("email", user.email).execute()
    if existing_user.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Hash the password
    hashed_password = hash_password(user.password)
    
    # Create the user
    new_user = {
        "email": user.email,
        "password_hash": hashed_password,
        "display_name": user.display_name or user.email.split('@')[0],
        "subscription_tier": "free",
        "usage_quota": 5,  # Default for free tier
        "usage_count": 0
    }
    
    result = supabase.table("users").insert(new_user).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user",
        )
    
    created_user = result.data[0]
    
    return {
        "id": created_user["id"],
        "email": created_user["email"],
        "display_name": created_user["display_name"],
        "subscription_tier": created_user["subscription_tier"],
        "created_at": created_user["created_at"],
        "usage_quota": created_user["usage_quota"],
        "usage_count": created_user["usage_count"]
    }

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login and get access token."""
    supabase = SupabaseService.get_client()
    if not supabase:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection failed",
        )
    
    # Get the user
    user_result = supabase.table("users").select("*").eq("email", form_data.username).execute()
    user = user_result.data[0] if user_result.data else None
    
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login
    supabase.table("users").update({"last_login": datetime.now().isoformat()}).eq("id", user["id"]).execute()
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"]},
        expires_delta=access_token_expires
    )
    
    # Create session record
    session_data = {
        "user_id": user["id"],
        "token_hash": hash_password(access_token),
        "expires_at": (datetime.now() + access_token_expires).isoformat()
    }
    supabase.table("user_sessions").insert(session_data).execute()
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current user info."""
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "display_name": current_user["display_name"],
        "subscription_tier": current_user["subscription_tier"],
        "created_at": current_user["created_at"],
        "usage_quota": current_user["usage_quota"],
        "usage_count": current_user["usage_count"]
    } 