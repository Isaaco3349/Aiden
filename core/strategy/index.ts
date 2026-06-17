// ─────────────────────────────────────────────
// AIDEN — Strategy Engine (core/strategy)
// Chain-agnostic. Takes a MarketSignal,
// returns a TradeInstruction.
// Knows nothing about blockchain.
// ─────────────────────────────────────────────

import type { MarketSignal, TradeInstruction, Chain, Regime } from '../../shared/types'

export class StrategyEngine {
  private chain: Chain

  constructor(chain: Chain) {
    this.chain = chain
  }

  decide(signal: MarketSignal): TradeInstruction {
    // Risk flag overrides everything — go to cash
    if (signal.riskFlag) {
      return this.hold(signal, 'CMC risk flag active — staying flat')
    }

    // Low liquidity — don't trade
    if (signal.liquidityScore < 0.3) {
      return this.hold(signal, `Liquidity too low: ${signal.liquidityScore.toFixed(2)}`)
    }

    switch (signal.regime) {
      case 'trending':
        return this.trendFollow(signal)
      case 'ranging':
        return this.meanRevert(signal)
      case 'volatile':
        return this.volatilityReduction(signal)
      default:
        return this.hold(signal, 'Unknown regime — no action')
    }
  }

  // Strategy 1: Trend following — ride the momentum
  private trendFollow(signal: MarketSignal): TradeInstruction {
    const isBullish = signal.priceChange24h > 2
    const isBearish = signal.priceChange24h < -2

    if (isBullish) {
      return {
        side: 'buy',
        symbol: signal.symbol,
        chain: this.chain,
        sizePct: this.scaleSizeByLiquidity(15, signal.liquidityScore),
        maxSlippagePct: 0.5,
        reason: `Trend-follow BUY: +${signal.priceChange24h.toFixed(2)}% 24h in trending regime`,
        confidence: this.trendConfidence(signal),
        timestamp: Date.now(),
      }
    }

    if (isBearish) {
      return {
        side: 'sell',
        symbol: signal.symbol,
        chain: this.chain,
        sizePct: this.scaleSizeByLiquidity(15, signal.liquidityScore),
        maxSlippagePct: 0.5,
        reason: `Trend-follow SELL: ${signal.priceChange24h.toFixed(2)}% 24h in trending regime`,
        confidence: this.trendConfidence(signal),
        timestamp: Date.now(),
      }
    }

    return this.hold(signal, 'Trending regime but momentum insufficient')
  }

  // Strategy 2: Mean reversion — fade extremes in ranging market
  private meanRevert(signal: MarketSignal): TradeInstruction {
    const isOversold = signal.priceChange24h < -4
    const isOverbought = signal.priceChange24h > 4

    if (isOversold) {
      return {
        side: 'buy',
        symbol: signal.symbol,
        chain: this.chain,
        sizePct: this.scaleSizeByLiquidity(10, signal.liquidityScore),
        maxSlippagePct: 0.3,
        reason: `Mean-revert BUY: oversold ${signal.priceChange24h.toFixed(2)}% in ranging market`,
        confidence: 0.7,
        timestamp: Date.now(),
      }
    }

    if (isOverbought) {
      return {
        side: 'sell',
        symbol: signal.symbol,
        chain: this.chain,
        sizePct: this.scaleSizeByLiquidity(10, signal.liquidityScore),
        maxSlippagePct: 0.3,
        reason: `Mean-revert SELL: overbought ${signal.priceChange24h.toFixed(2)}% in ranging market`,
        confidence: 0.7,
        timestamp: Date.now(),
      }
    }

    return this.hold(signal, 'Ranging regime but no extreme to fade')
  }

  // Strategy 3: High volatility — reduce exposure, wait for calm
  private volatilityReduction(signal: MarketSignal): TradeInstruction {
    return this.hold(signal, 'Volatile regime — preserving capital, waiting for regime change')
  }

  private hold(signal: MarketSignal, reason: string): TradeInstruction {
    return {
      side: 'hold',
      symbol: signal.symbol,
      chain: this.chain,
      sizePct: 0,
      maxSlippagePct: 0,
      reason,
      confidence: 1,
      timestamp: Date.now(),
    }
  }

  private scaleSizeByLiquidity(basePct: number, liquidityScore: number): number {
    return basePct * liquidityScore
  }

  private trendConfidence(signal: MarketSignal): number {
    const momentumScore = Math.min(Math.abs(signal.priceChange24h) / 10, 1)
    const liquidityWeight = signal.liquidityScore
    return (momentumScore * 0.6) + (liquidityWeight * 0.4)
  }
}
