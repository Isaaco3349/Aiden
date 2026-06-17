// ─────────────────────────────────────────────
// AIDEN — Shared Types
// Used by core brain AND all chain adapters
// ─────────────────────────────────────────────

export type Chain = 'bnb' | 'solana' | 'stellar'
export type Side = 'buy' | 'sell' | 'hold'
export type Regime = 'trending' | 'ranging' | 'volatile' | 'unknown'

// What CMC signals produce
export interface MarketSignal {
  symbol: string
  price: number
  priceChange24h: number
  volume24h: number
  regime: Regime
  riskFlag: boolean
  liquidityScore: number
  timestamp: number
}

// What the strategy engine outputs
export interface TradeInstruction {
  side: Side
  symbol: string
  chain: Chain
  sizePct: number          // % of portfolio to allocate (0–100)
  maxSlippagePct: number
  reason: string           // human-readable, for audit trail
  confidence: number       // 0–1
  timestamp: number
}

// What the risk engine validates
export interface RiskCheck {
  approved: boolean
  instruction: TradeInstruction
  adjustedSizePct: number  // may be reduced by risk engine
  rejectionReason?: string
  drawdownPct: number      // current portfolio drawdown
}

// What adapters return after execution
export interface ExecutionResult {
  chain: Chain
  txHash: string
  success: boolean
  side: Side
  symbol: string
  executedPrice: number
  executedSize: number
  gasUsed?: number
  error?: string
  timestamp: number
}

// Portfolio state tracked across all trades
export interface PortfolioState {
  chain: Chain
  startingValueUSD: number
  currentValueUSD: number
  peakValueUSD: number
  drawdownPct: number
  totalTrades: number
  winningTrades: number
  pnlUSD: number
  pnlPct: number
  lastUpdated: number
}

// Full audit log entry — written on every decision
export interface AuditEntry {
  id: string
  signal: MarketSignal
  instruction: TradeInstruction
  riskCheck: RiskCheck
  execution?: ExecutionResult
  portfolioAfter: PortfolioState
  timestamp: number
}
