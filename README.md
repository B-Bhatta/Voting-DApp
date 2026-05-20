# 🗳️ Voting DApp

A decentralized voting application built using **Solidity, React.js, and Web3.js**, enabling transparent and tamper-proof elections on the blockchain.

---

## 📌 Overview

This project allows:

- Admin to register candidates
- Admin to set voting time window
- Voters to connect MetaMask wallet
- Each wallet can vote only once
- Real-time vote counting stored on blockchain

---

## ⚙️ Tech Stack

- **Smart Contract:** Solidity (^0.8.0)
- **Frontend:** React.js
- **Blockchain Interaction:** Web3.js
- **Wallet:** MetaMask
- **Local Blockchain:** Ganache 

---

## 📁 Project Structure

```
Voting-DApp/
├── contracts/
│   └── Voting.sol
│
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
|   └── App.jsx
│   └── index.css
|   └── index.jsx
├── public/
|   └── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```


---

##  Features

### 👨‍💼 Admin Panel
- Add candidates
- Set voting start and end time
- View live results

### 🧑‍💻 Voter Panel
- Connect wallet
- View all candidates
- Cast vote
- Prevent double voting

### 🔗 Blockchain Features
- Immutable vote storage
- Transparent vote counting
- Time-based voting control

---

##  Smart Contract Functions

- `addCandidate(string name, string party)`
- `setDates(uint start, uint end)`
- `vote(uint candidateId)`
- `countCandidates`
- `candidates(id)`

---

##  Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/B-Bhatta/Voting-DApp.git
cd Voting-DApp


