// ─────────────────────────────────────────────
// AIDEN — BNB Adapter: Signal Aggregator
// Single entry point the strategy engine calls for market data
// ─────────────────────────────────────────────

import { fetchMarketSignals, getRegime } from './cmc'
import type { MarketSignal, Regime } from '../../../shared/types'

// ── Main function strategy engine calls ──
export async function getSignals(): Promise<MarketSignal[]> {
  const signals = await fetchMarketSignals()

  return signals
    .filter(s => s.price > 0)
    .sort((a, b) => b.liquidityScore - a.liquidityScore)
}

// ── Returns dominant regime across all signals ──
export function getDominantRegime(signals: MarketSignal[]): Regime {
  const counts: Record<Regime, number> = {
    volatile: 0,
    trending: 0,
    ranging: 0,
    unknown: 0,
  }

  for (const signal of signals) {
    counts[signal.regime]++
  }

  // Priority order on tie: volatile > trending > ranging > unknown
  const priority: Regime[] = ['volatile', 'trending', 'ranging', 'unknown']
  
  return priority.reduce((best, current) =>
    counts[current] > counts[best] ? current : best
  )
}