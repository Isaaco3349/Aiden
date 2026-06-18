// ─────────────────────────────────────────────
// AIDEN — BNB Adapter: Main Entry Point
// ─────────────────────────────────────────────

import { getSignals, getDominantRegime } from './signals/index'
import { execute, logResult, getWalletStatus } from './execution/index'
import { StrategyEngine } from '../../core/strategy/index'
import { RiskEngine, DEFAULT_RISK_CONFIG } from '../../core/risk/index'
import type { AuditEntry, PortfolioState } from '../../shared/types'

const strategy = new StrategyEngine('bnb')
const risk = new RiskEngine(DEFAULT_RISK_CONFIG)
const auditLog: AuditEntry[] = []

// ── Initial portfolio state ──
let portfolio: PortfolioState = {
  chain: 'bnb',
  startingValueUSD: 1000,
  currentValueUSD: 1000,
  peakValueUSD: 1000,
  drawdownPct: 0,
  totalTrades: 0,
  winningTrades: 0,
  pnlUSD: 0,
  pnlPct: 0,
  lastUpdated: Date.now(),
}

async function runCycle(): Promise<void> {
  console.log('[AIDEN] ── Starting trading cycle ──')

  const signals = await getSignals()
  if (signals.length === 0) {
    console.warn('[AIDEN] No valid signals — skipping cycle')
    return
  }

  const regime = getDominantRegime(signals)
  console.log(`[AIDEN] Dominant regime: ${regime}`)

  for (const signal of signals) {
    const instruction = strategy.decide(signal)

    if (instruction.side === 'hold') continue

    const riskCheck = risk.evaluate(instruction, portfolio)

    if (!riskCheck.approved) {
      console.warn(`[AIDEN] Risk rejected ${instruction.symbol}: ${riskCheck.rejectionReason}`)
      continue
    }

    const result = await execute(instruction)
    logResult(result)

    // ── Update portfolio state ──
    if (result.success) {
      portfolio.totalTrades++
      portfolio.lastUpdated = Date.now()
    }

    // ── Audit entry ──
    const entry: AuditEntry = {
      id: `${Date.now()}-${instruction.symbol}`,
      signal,
      instruction,
      riskCheck,
      execution: result,
      portfolioAfter: { ...portfolio },
      timestamp: Date.now(),
    }

    auditLog.push(entry)
    console.log(`[AIDEN] Audit recorded: ${entry.id}`)
  }
}

export async function startAgent(): Promise<void> {
  const status = await getWalletStatus()
  console.log(`[AIDEN] Agent starting...`)
  console.log(`[AIDEN] Wallet: ${status.address}`)
  console.log(`[AIDEN] Balance: ${status.balance} BNB`)

  await runCycle()
  setInterval(async () => {
    try {
      await runCycle()
    } catch (err) {
      console.error('[AIDEN] Cycle error:', err)
    }
  }, 5 * 60 * 1000)
}

export function getAuditLog(): AuditEntry[] {
  return auditLog
}