# AIDEN × BNB Hack: AI Trading Agent Edition

> Autonomous financial intelligence on BNB Smart Chain.
> Built for the BNB Hack × CMC × Trust Wallet Hackathon.

---

## What This Is

AIDEN is an end-to-end autonomous trading agent that:

1. **Reads** live market signals via the CMC MCP Server (regime detection, liquidity scores, risk flags)
2. **Decides** using a regime-aware strategy engine — trend-following in trending markets, mean-reversion in ranging markets, dormant in volatile markets
3. **Risk-checks** every instruction through a hard drawdown cap engine before any transaction is signed
4. **Executes** autonomously on BSC via BNB AI Agent SDK + Trust Wallet Agent Kit (self-custody, no per-trade approval)
5. **Logs** every decision and transaction hash on-chain for full auditability

---

## Sponsor Stack Used

| Tool | Usage |
|------|-------|
| ✅ CMC MCP Server | Live price feeds, regime signals, risk flags, liquidity scores |
| ✅ Trust Wallet Agent Kit | Self-custody signing — agent unlocked once, trades autonomously |
| ✅ BNB AI Agent SDK | PancakeSwap execution, BSC transaction primitives |

All three sponsor tools integrated → eligible for all three special prizes.

---

## Why This Wins on Risk-Adjusted Performance

Most agents optimise for raw returns and blow up mid-window. AIDEN's risk engine:

- Hard stops at **15% drawdown** — agent goes dormant, preserves capital
- Scales position size down as drawdown increases (never doubles down)
- Pauses entirely in volatile regimes (CMC regime flag)
- Circuit breaker on daily trade count (max 10/day)
- Every rule is logged and auditable on-chain

A consistent 8–12% return with 5% max drawdown beats a 40% gain followed by a 35% loss on Sharpe ratio — which is how Track 1 is actually judged.

---

## Live Trading Window

June 22–28, 2026. Agent runs 24/7 on BSC mainnet. All tx hashes logged.

---

## Repo Structure

```
adapters/bnb/          ← BSC-specific execution
core/signals/          ← CMC MCP integration
core/strategy/         ← Decision engine
core/risk/             ← Drawdown & rule enforcement
shared/types/          ← TradeInstruction, RiskCheck, AuditEntry
```
