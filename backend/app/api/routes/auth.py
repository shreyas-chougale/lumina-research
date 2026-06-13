from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import UserCreate, UserResponse
from app.core.security import get_password_hash, verify_password, create_access_token
from app.db.mongodb import db
from app.api.dependencies import get_current_user
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

@router.post("/signup", response_model=Token)
async def signup(user_in: UserCreate):
    # Check if user exists
    existing_user = await db.db["users"].find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Create new user
    user_doc = {
        "email": user_in.email,
        "full_name": user_in.full_name,
        "hashed_password": get_password_hash(user_in.password),
        "created_at": datetime.utcnow()
    }
    
    result = await db.db["users"].insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    user_doc["id"] = user_id
    user_response = UserResponse(**user_doc)
    
    # Create token
    access_token = create_access_token(subject=user_id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response
    }

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Find user by email
    user_doc = await db.db["users"].find_one({"email": form_data.username})
    if not user_doc:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # Verify password
    if not verify_password(form_data.password, user_doc["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    user_id = str(user_doc["_id"])
    user_doc["id"] = user_id
    user_response = UserResponse(**user_doc)
    
    # Create token
    access_token = create_access_token(subject=user_id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user
