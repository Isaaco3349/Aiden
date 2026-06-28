# AIDEN — Autonomous Intelligent Decentralized Economic Network

> One intelligent agent brain. Any chain. Real financial outcomes for real people.

AIDEN is a production-grade autonomous financial intelligence system that reads live market signals, makes risk-adjusted decisions, and executes on-chain transactions — across Solana and Stellar — with zero human intervention required.

Built for the real world. Deployed across multiple chains. One brain.

---

## What AIDEN Does

Most crypto users can't act at machine speed. Signals move in milliseconds. Opportunities open and close before a human can react. Underserved markets — Southeast Asia, emerging economies — have even less access to the infrastructure that sophisticated traders take for granted.

AIDEN changes that. It is a chain-agnostic agent brain that:

- **Reads** live market signals from CoinMarketCap's API (regime, liquidity, risk flags)
- **Decides** using a strategy engine with built-in risk rules and drawdown protection
- **Executes** autonomously via chain-specific adapters with full on-chain audit trails
- **Coordinates** multi-agent workflows for complex capital operations
- **Serves** real users in real markets — including Filipino OFW remittances

---

## Architecture
```
aiden/

├── core/                # The brain — chain-agnostic, always running

│   ├── signals/         # Market signal ingestion & regime detection

│   ├── strategy/        # Decision engine (trend, mean-reversion, regime-switch)

│   └── risk/            # Drawdown cap, position sizing, rule enforcement

│

├── adapters/            # Chain-specific execution layers

│   ├── solana/          # Swarms framework + Solana Web3.js

│   └── stellar/         # Stellar SDK + Soroban smart contracts

│

├── agents/              # Orchestration layer — spawns & coordinates sub-agents

│

└── shared/

├── types/           # Shared TypeScript interfaces across all adapters

└── utils/           # Logging, on-chain proof trail, formatting
```
---

## Build Stages

### ✅ Stage 1 — Core Brain
Chain-agnostic. No blockchain. Pure signal → decision → risk logic.
Fully testable before a single on-chain transaction.

### 🔨 Stage 2 — Initial Chain Adapter
Plug the core brain into a live execution layer. Signal ingestion, wallet handling, and decentralized exchange execution.

### 🔜 Stage 3 — Solana Adapter
Same core brain. Swarms multi-agent framework. Tokenized agent deployment on Solana.

### 🔜 Stage 4 — Stellar Adapter
Same core narrative. Soroban smart contracts. Mobile-first UI for Southeast Asian users.

### 🔜 Stage 5 — AgentOn Integration
Existing autonomous agent discovers and completes bounty tasks on the AgentOn network for passive yield.

---

## Tech Stack

- **Language:** TypeScript (Node.js 20+)
- **Signal Layer:** CoinMarketCap API
- **Solana Execution:** Swarms Framework + @solana/web3.js
- **Stellar Execution:** @stellar/stellar-sdk + Soroban contracts
- **Deployment:** Render (background worker) + Vercel (dashboard UI)

---

## Core Principles

**1. Risk first, returns second.**
AIDEN never bets the house. Every trade passes through the risk engine before execution. Drawdown caps are hard limits, not guidelines.

**2. Full auditability.**
Every decision, every transaction, every rule check is logged. On-chain proof trail is non-negotiable.

**3. One brain, many chains.**
The strategy engine knows nothing about blockchain. It outputs a `TradeInstruction`. The adapters know nothing about strategy. They execute a `TradeInstruction`. Clean separation. No spaghetti.

**4. Real users, real problems.**
AIDEN is not a demo. It targets real financial gaps — retail traders without institutional tools, SEA users without accessible cross-border payments, emerging market SMEs without trade finance.

---

## Getting Started

```bash
git clone https://github.com/Isaaco3349/Aiden
cd aiden
npm install
cp .env.example .env
# Add your CMC API key, wallet keys, RPC endpoints
npx ts-node index.ts
```

---

## Environment Variables

```env
# CoinMarketCap
CMC_API_KEY=

# Solana
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_WALLET_PRIVATE_KEY=
SWARMS_API_KEY=

# Stellar
STELLAR_NETWORK=mainnet
STELLAR_SECRET_KEY=
SOROBAN_RPC_URL=https://soroban-rpc.mainnet.stellar.gateway.fm
```

---

## License

MIT — built to ship, not to sit.

---

*AIDEN is a solo-built, production-grade autonomous agent system. Not financial advice. Trade responsibly.*