import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

import psycopg2
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from web3 import Web3

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

app = FastAPI(title="Hybrid Voting DApp API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

w3 = Web3(
    Web3.HTTPProvider(
        os.getenv("GANACHE_URL", "http://127.0.0.1:8545"),
        request_kwargs={"timeout": 2},
    )
)
contract_address = None
voting_contract = None

try:
    configured_address = os.getenv("VOTING_CONTRACT_ADDRESS")
    if configured_address:
        with (BASE_DIR / "voting_abi.json").open(encoding="utf-8") as abi_file:
            contract_abi = json.load(abi_file)
        contract_address = Web3.to_checksum_address(configured_address)
        voting_contract = w3.eth.contract(address=contract_address, abi=contract_abi)
except (OSError, ValueError, json.JSONDecodeError) as exc:
    print(f"Warning: blockchain contract load failed: {exc}")


class LoginRequest(BaseModel):
    voter_id: str
    password: str


class CurrentUser(BaseModel):
    voter_id: str
    role: str


def get_db_connection():
    if not DATABASE_URL:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="DATABASE_URL is not configured",
        )
    try:
        return psycopg2.connect(DATABASE_URL)
    except psycopg2.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable",
        ) from exc


def verify_password(plain_password: str, password_hash: str) -> bool:
    try:
        return pwd_context.verify(plain_password, password_hash)
    except (TypeError, ValueError):
        return False


def create_access_token(voter_id: str, role: str) -> str:
    if not JWT_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JWT_SECRET_KEY is not configured",
        )
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": voter_id, "voter_id": voter_id, "role": role, "exp": expires_at}
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)) -> CurrentUser:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not JWT_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JWT_SECRET_KEY is not configured",
        )
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        voter_id = payload.get("sub")
        role = payload.get("role")
        if not voter_id or not role:
            raise credentials_error
        return CurrentUser(voter_id=voter_id, role=role)
    except JWTError as exc:
        raise credentials_error from exc


def require_admin(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required",
        )
    return current_user


@app.post("/login")
def login(data: LoginRequest):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT voter_id, role, password_hash
                FROM voters
                WHERE voter_id = %s
                """,
                (data.voter_id,),
            )
            user = cursor.fetchone()
    finally:
        conn.close()

    if not user or not verify_password(data.password, user[2]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid voter ID or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    voter_id, role, _password_hash = user
    return {
        "status": "success",
        "token": create_access_token(voter_id, role),
        "role": role,
    }


@app.get("/health")
def health_check():
    database_status = "Offline"
    blockchain_status = "Disconnected"

    try:
        conn = get_db_connection()
        conn.close()
        database_status = "Connected"
    except HTTPException:
        pass

    try:
        if w3.is_connected():
            blockchain_status = (
                f"Connected ({contract_address})" if contract_address else "Connected (contract not configured)"
            )
    except Exception:
        pass

    return {
        "api_status": "Online",
        "database": database_status,
        "blockchain": blockchain_status,
    }


@app.get("/me", response_model=CurrentUser)
def read_current_user(current_user: CurrentUser = Depends(get_current_user)):
    return current_user


@app.get("/admin/voter-stats")
def get_voter_stats(_admin: CurrentUser = Depends(require_admin)):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM voters")
            total = cursor.fetchone()[0]
    finally:
        conn.close()

    # Participation cannot be derived because verified users are not bound to wallets.
    return {"total": total}
