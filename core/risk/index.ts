// ─────────────────────────────────────────────
// AIDEN — Risk Engine (core/risk)
// Chain-agnostic. Approves or rejects every
// TradeInstruction before it touches a chain.
// ─────────────────────────────────────────────

import type { TradeInstruction, RiskCheck, PortfolioState } from '../../shared/types'

export interface RiskConfig {
  maxDrawdownPct: number        // Hard stop. Agent pauses if breached. Default: 15
  maxPositionSizePct: number    // Max single trade size. Default: 20
  maxDailyTrades: number        // Circuit breaker. Default: 10
  minConfidence: number         // Min signal confidence to act. Default: 0.65
  highVolatilityThreshold: number // Reduce size when vol is high. Default: 0.8
}

export const DEFAULT_RISK_CONFIG: RiskConfig = {
  maxDrawdownPct: 15,
  maxPositionSizePct: 20,
  maxDailyTrades: 10,
  minConfidence: 0.65,
  highVolatilityThreshold: 0.8,
}

export class RiskEngine {
  private config: RiskConfig
  private dailyTradeCount: number = 0
  private lastResetDate: string = ''

  constructor(config: RiskConfig = DEFAULT_RISK_CONFIG) {
    this.config = config
  }

  evaluate(
    instruction: TradeInstruction,
    portfolio: PortfolioState
  ): RiskCheck {
    this.resetDailyCountIfNeeded()

    // Rule 1: Hard drawdown cap — agent goes dormant
    if (portfolio.drawdownPct >= this.config.maxDrawdownPct) {
      return this.reject(instruction, portfolio,
        `Drawdown cap hit: ${portfolio.drawdownPct.toFixed(2)}% >= ${this.config.maxDrawdownPct}%`)
    }

    // Rule 2: Hold instructions always pass
    if (instruction.side === 'hold') {
      return this.approve(instruction, portfolio, instruction.sizePct)
    }

    // Rule 3: Confidence below threshold
    if (instruction.confidence < this.config.minConfidence) {
      return this.reject(instruction, portfolio,
        `Confidence too low: ${instruction.confidence.toFixed(2)} < ${this.config.minConfidence}`)
    }

    // Rule 4: Daily trade limit
    if (this.dailyTradeCount >= this.config.maxDailyTrades) {
      return this.reject(instruction, portfolio,
        `Daily trade limit reached: ${this.dailyTradeCount}`)
    }

    // Rule 5: Position size enforcement (reduce, don't reject)
    let adjustedSize = Math.min(
      instruction.sizePct,
      this.config.maxPositionSizePct
    )

    // Rule 6: Scale down further when drawdown is elevated (>5%)
    if (portfolio.drawdownPct > 5) {
      const scaleFactor = 1 - (portfolio.drawdownPct / this.config.maxDrawdownPct)
      adjustedSize = adjustedSize * scaleFactor
    }

    this.dailyTradeCount++
    return this.approve(instruction, portfolio, adjustedSize)
  }

  private approve(
    instruction: TradeInstruction,
    portfolio: PortfolioState,
    adjustedSizePct: number
  ): RiskCheck {
    return {
      approved: true,
      instruction,
      adjustedSizePct: Math.max(1, adjustedSizePct), // minimum 1%
      drawdownPct: portfolio.drawdownPct,
    }
  }

  private reject(
    instruction: TradeInstruction,
    portfolio: PortfolioState,
    reason: string
  ): RiskCheck {
    return {
      approved: false,
      instruction,
      adjustedSizePct: 0,
      rejectionReason: reason,
      drawdownPct: portfolio.drawdownPct,
    }
  }

  private resetDailyCountIfNeeded() {
    const today = new Date().toISOString().split('T')[0]
    if (today !== this.lastResetDate) {
      this.dailyTradeCount = 0
      this.lastResetDate = today
    }
  }

  getStats() {
    return {
      dailyTradeCount: this.dailyTradeCount,
      config: this.config,
    }
  }
}
