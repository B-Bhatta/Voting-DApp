# Testing Results

Date: 2026-06-23  
Branch: `main`

Evaluated commit: `b7fa6500d66f63d0d4bfa3b7d40cc7df5f2aac04` 

Framework: Hardhat 2.19.5, Mocha, Chai, ethers 6  
Solidity: 0.8.19  
Optimizer: enabled, 200 runs

## Contract tests

| Test | Result |
|---|---|
| Owner can add a 1-indexed candidate | PASS |
| Non-owner cannot add a candidate | PASS |
| Owner can set dates | PASS |
| Non-owner cannot set dates | PASS |
| Invalid date range is rejected | PASS |
| Candidate cannot be added after voting starts | PASS |
| Valid vote is accepted | PASS |
| Duplicate wallet vote is rejected | PASS |
| Invalid candidate is rejected | PASS |
| Vote before start is rejected | PASS |
| Vote after end is rejected | PASS |
| Vote count updates | PASS |
| `VoteCast` event is emitted | PASS |
| Receipt gas collection completes | PASS |

Summary: **14 passing, 0 failing**.

### Full terminal output

```text
> voting-dapp-blockchain@1.0.0 test
> hardhat test && node scripts/export-abi.js

  Voting
    √ allows the owner to add a 1-indexed candidate (103ms)
    √ rejects candidate creation by a non-owner (79ms)
    √ allows the owner to set dates (47ms)
    √ rejects date changes by a non-owner
    √ rejects an invalid date range
    √ freezes candidate creation once voting starts (43ms)
    √ accepts a valid vote (63ms)
    √ rejects a duplicate wallet vote (62ms)
    √ rejects an invalid candidate ID (52ms)
    √ rejects a vote before the start (40ms)
    √ rejects a vote after the end (45ms)
    √ updates the selected candidate vote count (50ms)
    √ emits VoteCast with the voter and candidate ID (48ms)
Deploy gasUsed: 648731
addCandidate gasUsed: 122509
setDates gasUsed: 69467
vote gasUsed: 74011
    √ records gas used by the four primary operations (47ms)

  14 passing (4s)

Exported current Voting ABI to frontend and backend.
WARNING: You are currently using Node.js v22.14.0, which is not supported by Hardhat. This can lead to unexpected behavior.
```

Hardhat warned about Node 22, but compilation and all tests completed successfully. Node 18 or 20 LTS is recommended for reproduction with this pinned Hardhat version.

## Backend checks

Status: **PASS for install, authentication helpers, authorization logic, and live `/health` response**.

Verified with a fresh ignored virtual environment:

- Requirements installed successfully.
- bcrypt accepts the correct password and rejects an incorrect password.
- Login fetches by `voter_id` only and reads the default psycopg2 tuple correctly.
- Issued JWT contains `exp`; valid decode succeeds.
- Expired JWT returns 401.
- Voter role is rejected by the admin dependency with 403.
- Uvicorn served `/health` as `{"api_status":"Online","database":"Offline","blockchain":"Disconnected"}`.
- Python syntax compilation and `docker compose config` passed.

The Docker PostgreSQL setup was subsequently verified manually on host port 5433. Ganache contract connectivity still requires the local deployment steps in the README.

## Frontend build

Status: **PASS**.

```text
> jec-voting-frontend@1.0.0 build
> react-scripts build

Creating an optimized production build...
Compiled successfully.

File sizes after gzip:
  210.28 kB (+5 B)  build/static/js/main.34c94ba6.js
  4.4 kB            build/static/css/main.87db6770.css
```

The build also reported stale Browserslist data as a maintenance notice; it did not affect success.
