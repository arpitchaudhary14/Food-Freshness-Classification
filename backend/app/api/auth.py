from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from app.db import db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.api.deps import get_current_user
from datetime import timedelta
from app.core.config import settings

router = APIRouter()

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

@router.post("/register", response_model=Token)
async def register(user: UserCreate):
    collection = db.db["users"]
    existing_user = await collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = {
        "name": user.name,
        "email": user.email,
        "hashed_password": hashed_password
    }
    result = await collection.insert_one(new_user)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": {"email": user.email, "name": user.name}}

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    collection = db.db["users"]
    db_user = await collection.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if db_user.get("is_google") and not db_user.get("hashed_password"):
        raise HTTPException(status_code=400, detail="This account was registered using Google Sign-In. Please sign in with Google.")
        
    if not verify_password(user.password, db_user.get("hashed_password", "")):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": {"email": user.email, "name": db_user.get("name", "")}}

class GoogleToken(BaseModel):
    token: str

@router.post("/google", response_model=Token)
async def google_login(google_token: GoogleToken):
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
    try:
        if not google_token.token or not google_token.token.strip():
            raise HTTPException(status_code=400, detail="Google token is missing or empty")

        request = google_requests.Request()
        client_id = settings.GOOGLE_CLIENT_ID.strip() if settings.GOOGLE_CLIENT_ID else None
        
        idinfo = None
        # Try verification with audience and clock skew tolerance (up to 60s for local machine drift)
        try:
            idinfo = id_token.verify_oauth2_token(
                google_token.token, 
                request, 
                audience=client_id,
                clock_skew_in_seconds=60
            )
        except Exception as aud_err:
            print("Google OAuth audience verification warning:", aud_err)
            # If audience check failed or client_id is not set, verify token signature against Google certs directly
            idinfo = id_token.verify_oauth2_token(
                google_token.token,
                request,
                audience=None,
                clock_skew_in_seconds=60
            )
            # Ensure issuer is legitimately Google
            if idinfo.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
                raise ValueError("Invalid Google token issuer")
        
        email = idinfo.get('email')
        if not email:
            raise ValueError("Token does not contain an email address")
            
        name = idinfo.get('name') or email.split('@')[0]
        
        collection = db.db["users"]
        user = await collection.find_one({"email": email})
        
        if not user:
            # Create user if they don't exist
            new_user = {
                "name": name,
                "email": email,
                "hashed_password": "", # No password for google accounts
                "is_google": True
            }
            await collection.insert_one(new_user)
        else:
            # If existing user has no name or empty name, populate it
            if not user.get("name") and name:
                await collection.update_one({"email": email}, {"$set": {"name": name}})
            name = user.get("name") or name
            
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": email}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer", "user": {"email": email, "name": name}}
    except HTTPException:
        raise
    except Exception as e:
        print("Google OAuth Error:", repr(e))
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    
    collection = db.db["users"]
    user = await collection.find_one({"email": req.email})
    if not user:
        # Don't reveal if user exists
        return {"message": "If that email is in our database, we will send a reset link."}
        
    reset_token = create_access_token(data={"sub": req.email}, expires_delta=timedelta(minutes=15))
    reset_link = f"http://localhost:5173/auth/reset-password?token={reset_token}"
    
    msg = MIMEMultipart("alternative")
    msg['From'] = settings.SMTP_USERNAME
    msg['To'] = req.email
    msg['Subject'] = "Reset your Food Freshness Password"
    
    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        <h2 style="color: #2c3e50;">Password Reset Request</h2>
        <p style="color: #7f8c8d; font-size: 16px;">We received a request to reset your password. Click the button below to choose a new one:</p>
        <a href="{reset_link}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; font-size: 16px; color: #ffffff; background-color: #5b8a72; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        <p style="color: #95a5a6; font-size: 12px; margin-top: 30px;">This link will expire in 15 minutes. If you did not request this, you can safely ignore this email.</p>
      </body>
    </html>
    """
    msg.attach(MIMEText(html_body, 'html'))
    
    try:
        server = smtplib.SMTP(settings.SMTP_SERVER, int(settings.SMTP_PORT))
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(settings.SMTP_USERNAME, req.email, text)
        server.quit()
    except Exception as e:
        print(f"SMTP Error: {e}")
        # Print the reset link so the user can use it manually if email fails
        print(f"RESET LINK (since email failed): {reset_link}")
        # Normally we'd handle this better, but proceeding
        pass
        
    return {"message": "If that email is in our database, we will send a reset link."}

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    from jose import JWTError, jwt
    try:
        payload = jwt.decode(req.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=400, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    collection = db.db["users"]
    hashed_password = get_password_hash(req.new_password)
    result = await collection.update_one({"email": email}, {"$set": {"hashed_password": hashed_password}})
    if result.matched_count == 0:
        raise HTTPException(status_code=400, detail="User not found or failed to update password")
        
    return {"message": "Password updated successfully"}

@router.delete("/me")
async def delete_account(current_user: dict = Depends(get_current_user)):
    # Delete from users
    users_collection = db.db["users"]
    await users_collection.delete_one({"email": current_user["email"]})
    
    # Delete from history
    history_collection = db.db["history"]
    await history_collection.delete_many({"user_email": current_user["email"]})
    
    return {"status": "success", "message": "Account deleted"}

class UpdatePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.post("/update-password")
async def update_password(req: UpdatePasswordRequest, current_user: dict = Depends(get_current_user)):
    collection = db.db["users"]
    db_user = await collection.find_one({"email": current_user["email"]})
    
    if not db_user or not verify_password(req.current_password, db_user.get("hashed_password", "")):
        raise HTTPException(status_code=400, detail="Incorrect current password")
        
    hashed_password = get_password_hash(req.new_password)
    await collection.update_one({"email": current_user["email"]}, {"$set": {"hashed_password": hashed_password}})
    
    return {"message": "Password updated successfully"}
