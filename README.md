# Hybrid Voting DApp

A local-development voting prototype that combines off-chain FastAPI/PostgreSQL authentication with wallet-signed votes recorded by a Solidity contract. The contract enforces one vote per wallet; it does not prove one vote per human or provide ballot secrecy.

## Tech stack

- Solidity 0.8.19, Hardhat, ethers
- React 18, Create React App, Web3.js, MetaMask
- FastAPI, PostgreSQL 15, bcrypt, expiring JWTs
- Docker Compose for local database setup

## Phase 1 security changes

- Owner-only candidate and date administration
- Date ordering checks, candidate freeze after voting starts, and domain events
- Automated 1-indexed contract tests and receipt-based gas measurements
- bcrypt password verification and expiring, verified JWTs
- JWT admin-role enforcement on voter statistics
- Configurable chain checks, visible transaction states, and session-scoped frontend auth
- Reproducible local PostgreSQL schema and seed script

See [SECURITY_NOTES.md](SECURITY_NOTES.md), [TESTING_RESULTS.md](TESTING_RESULTS.md), and [GAS_RESULTS.md](GAS_RESULTS.md).

## Local setup

### 1. Configure the environment

Copy `.env.example` to `.env`. Generate a random JWT key instead of using the placeholder:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Set `JWT_SECRET_KEY` to that value. Never commit `.env`.

### 2. Start PostgreSQL and seed users

```bash
docker compose up -d db
python -m venv .venv
```

Activate the virtual environment, then run:

```bash
python -m pip install -r FastAPI/requirements.txt
python db/seed_users.py
```

The development seed credentials are printed in `db/seed_users.py`. Change them for any shared environment.

### 3. Compile, test, and deploy the contract

Start Ganache on `http://127.0.0.1:8545` with chain ID `1337` (`0x539`), then:

```bash
cd Blockchain
npm install
npm test
npm run deploy
cd ..
```

`npm test` recompiles the contract and synchronizes its ABI to:

- `src/services/voting_abi.json`
- `FastAPI/voting_abi.json`

Put the printed deployment address in both `REACT_APP_CONTRACT_ADDRESS` and `VOTING_CONTRACT_ADDRESS` in `.env`. Restart the frontend after changing a `REACT_APP_*` variable. The deployer wallet is the contract owner and must perform admin contract actions.

### 4. Start the backend

From the repository root with the virtual environment active:

```bash
cd FastAPI
uvicorn main:app --reload
```

Useful endpoints:

- `GET /health` - public service status
- `POST /login` - credential login
- `GET /me` - authenticated JWT identity
- `GET /admin/voter-stats` - admin JWT required

### 5. Start the frontend

In a second terminal from the repository root:

```bash
npm install
npm start
```

Open `http://localhost:3000`. Import a Ganache account into MetaMask and select chain ID `1337`. Admin actions must use the contract deployer account.

## Run checks

```bash
cd Blockchain
npm test
cd ..
npm run build
python -m compileall FastAPI db
```

The measured results for this revision are recorded in [TESTING_RESULTS.md](TESTING_RESULTS.md) and [GAS_RESULTS.md](GAS_RESULTS.md).

## Known limitations

- One vote is enforced per wallet, not per verified human.
- A login identity is not cryptographically bound to a wallet.
- Votes are public on-chain, so ballot secrecy is not provided.
- There is one election state; multi-election scoping is not implemented.
- This revision is validated on local development networks only.
- Frontend route checks aid navigation and are not a security boundary.
- This prototype is not ready for production elections.
