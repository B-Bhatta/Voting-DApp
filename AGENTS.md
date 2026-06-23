# AGENTS.md

## Project layout
- Contract: `Blockchain/contracts/Voting.sol`
- Blockchain config: `Blockchain/hardhat.config.js`
- Contract tests: `Blockchain/test/Voting.test.js`
- Frontend ABI/artifact: `src/services/voting_abi.json`
- Backend: `FastAPI/main.py`
- Backend requirements: `FastAPI/requirements.txt`
- Frontend: repository root (`src/`, `package.json`)
- Frontend Web3 service: `src/services/blockchain.js`
- Database setup: `docker-compose.yml`, `db/init.sql`, `db/seed_users.py`

## Commands
- Contract install: `cd Blockchain && npm install`
- Contract tests: `cd Blockchain && npm test`
- Backend install: `python -m pip install -r FastAPI/requirements.txt`
- Backend run: `cd FastAPI && uvicorn main:app --reload`
- Frontend install: `npm install`
- Frontend build: `npm run build`

## Notes
- External hosted database configuration removed; local Docker PostgreSQL is the supported setup.
- Docker PostgreSQL introduced for local reproducible setup.
- If full runtime setup fails in this environment, manual steps are documented.
