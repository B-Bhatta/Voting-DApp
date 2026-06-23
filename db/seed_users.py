import os

import psycopg2
from dotenv import load_dotenv
from passlib.context import CryptContext

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
database_url = os.getenv(
    "DATABASE_URL",
    "postgresql://voting_user:voting_password@localhost:5432/voting_db",
)

users = [
    ("admin001", "admin", "AdminPass123!"),
    ("voter001", "voter", "VoterPass123!"),
    ("voter002", "voter", "VoterPass456!"),
]

with psycopg2.connect(database_url) as conn:
    with conn.cursor() as cursor:
        for voter_id, role, plain_password in users:
            cursor.execute(
                """
                INSERT INTO voters (voter_id, role, password_hash)
                VALUES (%s, %s, %s)
                ON CONFLICT (voter_id) DO UPDATE
                SET role = EXCLUDED.role, password_hash = EXCLUDED.password_hash
                """,
                (voter_id, role, pwd_context.hash(plain_password)),
            )
            print(f"Seeded {voter_id} ({role})")

print("Seed complete.")
