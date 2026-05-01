import os
import jwt
import psycopg2
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# FastAPI app
app = FastAPI(title="Hybrid Voting DApp API")

# CORS setup for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # restrict to frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------
# Database connection helper
# --------------------------
def get_db_connection():
    try:
        conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        return conn
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB connection failed: {str(e)}")


# --------------------------
# Pydantic models
# --------------------------
class LoginRequest(BaseModel):
    voter_id: str
    password: str


# --------------------------
# Login endpoint
# --------------------------
@app.post("/login")
def login(data: LoginRequest):
    """
    Authenticate user (voter/admin) and return JWT token
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT role FROM voters WHERE voter_id = %s AND password = %s",
            (data.voter_id, data.password)
        )

        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid voter ID or password"
            )

        role = user[0]

        token = jwt.encode(
            {
                "voter_id": data.voter_id,
                "role": role
            },
            os.getenv("SECRET_KEY"),
            algorithm="HS256"
        )

        return {
            "status": "success",
            "token": token,
            "role": role
        }

    except psycopg2.Error as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )


# --------------------------
# Health check endpoint
# --------------------------
@app.get("/health")
def health_check():
    
    try:
        conn = get_db_connection()
        conn.close()
        return {"status": "Online", "database": "PostgreSQL Cloud Connected"}
    except Exception as e:
        return {"status": "Offline", "error": str(e)}
