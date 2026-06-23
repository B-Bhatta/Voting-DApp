# Hybrid Blockchain E-Voting DApp

A local reproducible hybrid e-voting prototype using React, FastAPI, PostgreSQL, MetaMask, Ganache, Web3.js, and Solidity smart contracts. Off-chain credentials authenticate users through the API, while wallet-signed transactions record votes on a local Ethereum development network.

> This is a prototype.

## Phase 1 security fixes

- `onlyOwner` authorization on `addCandidate()` and `setDates()`
- Voting-date ordering validation
- Candidate-list freeze after voting starts
- `CandidateAdded`, `DatesSet`, and `VoteCast` contract events
- bcrypt password hashing and verification through passlib
- JWT expiration, signature verification, protected endpoints, and admin-role checks
- Configurable chain ID validation before contract interaction
- Visible transaction pending, confirmation, rejection, revert, and error states
- `sessionStorage` instead of `localStorage` for the frontend token and role
- Docker PostgreSQL local setup with a reproducible schema and seed script
- Fourteen Hardhat tests and receipt-based gas measurements

Detailed evidence is available in [TESTING_RESULTS.md](TESTING_RESULTS.md), [GAS_RESULTS.md](GAS_RESULTS.md), and [SECURITY_NOTES.md](SECURITY_NOTES.md).

## Tech stack

- React 18 and Create React App
- FastAPI
- PostgreSQL 15 via Docker
- Solidity 0.8.19
- Hardhat
- Ganache
- MetaMask
- Web3.js

## Prerequisites

- Git
- Node.js 20 LTS and npm
- Python 3.11 or newer
- Docker Desktop
- Ganache
- MetaMask browser extension

MetaMask is not required to run contract tests, build React, or check the API health endpoint. It is required for interactive admin and voting transactions in the browser.

## Local setup - PowerShell

### 1. Clone and select the Phase 1 branch

```powershell
git clone https://github.com/B-Bhatta/Voting-DApp.git
cd Voting-DApp
git checkout phase-1-security-revision
```

### 2. Configure local environment variables

```powershell
Copy-Item .env.example .env
python -c "import secrets; print(secrets.token_hex(32))"
notepad .env
```

Replace the placeholder `JWT_SECRET_KEY` with the generated value. Never commit `.env`.

The committed Docker configuration publishes PostgreSQL on host port `5433` to avoid conflicts with an existing PostgreSQL service on `5432`. Keep this URL in `.env`:

```env
DATABASE_URL=postgresql://voting_user:voting_password@localhost:5433/voting_db
```

If you change the Compose mapping back to `5432:5432`, also change `DATABASE_URL` to port `5432`.

### 3. Start PostgreSQL

```powershell
docker compose up -d db
docker compose ps
```

### 4. Install the backend and seed development users

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r FastAPI\requirements.txt
python db\seed_users.py
```

Default local-only accounts:

| Role | voter_id | Password |
|---|---|---|
| Admin | `admin001` | `AdminPass123!` |
| Voter | `voter001` | `VoterPass123!` |
| Voter 2 | `voter002` | `VoterPass456!` |

These are dummy development credentials. Do not reuse them in a shared or production environment.

### 5. Start Ganache and configure MetaMask

Start Ganache with:

- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `1337` (`0x539`)

In MetaMask, add a custom network with the same RPC URL and chain ID. Import:

1. The first Ganache account private key as the admin/owner wallet.
2. The second Ganache account private key as a voter wallet.

Never commit or share those private keys. The account that deploys the contract becomes its owner and is the only wallet allowed to add candidates or set dates.

### 6. Test and deploy the contract

```powershell
cd Blockchain
npm install
npm test
npm run deploy
cd ..
```

Copy the printed deployment address into both variables in `.env`:

```env
VOTING_CONTRACT_ADDRESS=0xYourDeployedAddress
REACT_APP_CONTRACT_ADDRESS=0xYourDeployedAddress
```

Contract compilation synchronizes the current ABI to:

- `src/services/voting_abi.json`
- `FastAPI/voting_abi.json`

### 7. Start FastAPI

```powershell
cd FastAPI
..\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

The API runs at `http://127.0.0.1:8000`. Check `http://127.0.0.1:8000/health`.

### 8. Start React

Open another PowerShell terminal:

```powershell
cd Voting-DApp
npm install
npm start
```

Open `http://localhost:3000`, select the Ganache network in MetaMask, and connect the appropriate wallet.

## Verification results

The Phase 1 Hardhat suite passes **14 tests with 0 failures**. See [TESTING_RESULTS.md](TESTING_RESULTS.md) for the full test list and terminal evidence. The React production build also completes successfully.

## Gas measurements

| Operation | gasUsed |
|---|---:|
| Deploy | 648,731 |
| `addCandidate` | 122,509 |
| `setDates` | 69,467 |
| `vote` | 74,011 |

These are transaction-receipt measurements from a local Hardhat/Ganache development environment. They are not mainnet fee or cost estimates. Reproduction details are in [GAS_RESULTS.md](GAS_RESULTS.md).

## Repository evidence

- Branch: `phase-1-security-revision`
- Phase 1 implementation commit: `b7fa6500d66f63d0d4bfa3b7d40cc7df5f2aac04`
- Solidity compiler: `0.8.19`
- Optimizer: enabled, 200 runs

## Known limitations

- One vote is enforced per wallet, not per human.
- There is no voter-to-wallet identity binding.
- Votes and candidate IDs are public on-chain; ballot secrecy is not provided.
- Aadhaar integration is not implemented.
- Multi-election or `electionId` scoping is not implemented.
- Login rate limiting is not implemented.
- Administration depends on a single owner key.
- Validation is limited to local development networks.
- The system is not production election-ready.

Frontend route guards are navigation helpers only. Contract `onlyOwner` checks and backend JWT role checks are the actual authorization boundaries.
