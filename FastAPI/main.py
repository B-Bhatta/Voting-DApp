import os
import jwt
import json
import psycopg2

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from web3 import Web3

# =====================================
# LOAD ENV
# =====================================
load_dotenv()

# =====================================
# FASTAPI APP
# =====================================
app = FastAPI(
    title="Hybrid Voting DApp API"
)

# =====================================
# BLOCKCHAIN INIT
# =====================================
w3 = Web3(
    Web3.HTTPProvider(
        os.getenv(
            "GANACHE_URL",
            "http://127.0.0.1:8545"
        )
    )
)

try:

    with open("voting_abi.json", "r") as abi_file:
        contract_abi = json.load(abi_file)

    contract_address = Web3.to_checksum_address(
        os.getenv("VOTING_CONTRACT_ADDRESS")
    )

    voting_contract = w3.eth.contract(
        address=contract_address,
        abi=contract_abi
    )

    print(
        "Blockchain Connected:",
        w3.is_connected()
    )

    print(
        "Contract Address:",
        contract_address
    )

except Exception as e:

    print(
        f"Warning: Blockchain contract load failed: {e}"
    )

# =====================================
# CORS
# =====================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================
# DATABASE CONNECTION
# =====================================
def get_db_connection():

    try:

        return psycopg2.connect(
            os.getenv("DATABASE_URL")
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"DB connection failed: {str(e)}"
        )

# =====================================
# LOGIN MODEL
# =====================================
class LoginRequest(BaseModel):
    voter_id: str
    password: str

# =====================================
# LOGIN API
# =====================================
@app.post("/login")
def login(data: LoginRequest):

    try:

        conn = get_db_connection()

        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT role
            FROM voters
            WHERE voter_id = %s
            AND password = %s
            """,
            (
                data.voter_id,
                data.password
            )
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

# =====================================
# HEALTH CHECK
# =====================================
@app.get("/health")
def health_check():

    db_status = "Offline"

    blockchain_status = "Disconnected"

    # DB CHECK
    try:

        conn = get_db_connection()

        conn.close()

        db_status = "Connected"

    except:
        pass

    # BLOCKCHAIN CHECK
    try:

        if w3.is_connected():

            blockchain_status = (
                f"Connected ({contract_address})"
            )

    except:
        pass

    return {
        "api_status": "Online",
        "database": db_status,
        "blockchain": blockchain_status
    }

# =====================================
# ADMIN STATS
# =====================================
@app.get("/admin/voter-stats")
def get_voter_stats():

    try:

        conn = get_db_connection()

        cursor = conn.cursor()

        cursor.execute(
            "SELECT COUNT(*) FROM voters"
        )

        total = cursor.fetchone()[0]

        # TEMPORARY
        participated = 0

        cursor.close()

        conn.close()

        return {
            "total": total,
            "participated": participated
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )