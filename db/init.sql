CREATE TABLE IF NOT EXISTS voters (
    voter_id VARCHAR(64) PRIMARY KEY,
    role VARCHAR(16) NOT NULL DEFAULT 'voter' CHECK (role IN ('voter', 'admin')),
    password_hash VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
