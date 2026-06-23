# Gas Results

Compiler: Solidity 0.8.19  
Optimizer: enabled, 200 runs  
Network: Hardhat in-process local network  
Measurement: transaction receipt `gasUsed`  
Date: 2026-06-23

| Operation | gasUsed | Notes |
|---|---:|---|
| Deploy | 648,731 | `deploymentTransaction().wait()` receipt |
| addCandidate | 122,509 | First 1-indexed candidate, two non-empty strings |
| setDates | 69,467 | Two previously zero storage slots set |
| vote | 74,011 | First valid vote by a wallet for candidate ID 1 |

Gas varies with input strings and storage state. These are measured local receipt values, not estimates.

## How to reproduce

```bash
cd Blockchain
npm install
npm test
```

The final test prints all four values from receipts.
