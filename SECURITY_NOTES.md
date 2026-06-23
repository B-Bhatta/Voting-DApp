# Security Notes

## Fixed in Phase 1

- `onlyOwner` protects `addCandidate()` and `setDates()`.
- Date ordering validation rejects an end at or before the start.
- The candidate list freezes when voting starts.
- `CandidateAdded`, `DatesSet`, and `VoteCast` events are emitted.
- Credentials are verified against bcrypt hashes through passlib.
- JWTs expire and protected endpoints decode and verify their signatures and claims.
- The statistics endpoint requires an authenticated admin role.
- The fake participation count was removed because the current schema cannot derive it honestly.
- The frontend validates the configured chain ID before reads and transactions.
- Visible transaction states distinguish pending, confirmed, rejected, reverted, and other errors.
- `sessionStorage` replaces `localStorage` for JWT and role data as a partial improvement.
- Docker PostgreSQL replaces external hosted database configuration for local development.

`setDates()` intentionally does not require the start to be in the future. This keeps local time-manipulation tests and administrative recovery possible; the owner remains responsible for choosing a sensible window.

## Remaining limitations

- No Aadhaar integration
- No voter-to-wallet identity binding
- One vote is enforced per wallet, not per verified human
- No ballot secrecy because `vote(candidateId)` is public on-chain
- Frontend route guards are navigation helpers, not a security boundary
- No `electionId` or multi-election support in Phase 1
- Local blockchain testing only
- Not production election-ready
- `sessionStorage` remains weaker than an `httpOnly` cookie
- Login rate limiting is not implemented
- TLS and deployment hardening are not included
- Participation cannot be calculated from authenticated users because user identities are not bound to voting wallets
- Contract administration depends on a single owner private key
