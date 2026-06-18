// ─────────────────────────────────────────────
// AIDEN — BNB Adapter: CoinMarketCap Signal Ingestion
// Fetches live quotes for BSC pairs and detects market regime
// ─────────────────────────────────────────────

import type { MarketSignal, Regime } from '../../../shared/types'

const BNB_PAIRS = ['BNB', 'CAKE', 'ETH', 'USDT'] as const
const CMC_API_BASE = 'https://pro-api.coinmarketcap.com'

interface CmcStatus {
  error_code: number
  error_message: string | null
}

interface CmcQuoteUsd {
  price: number
  volume_24h: number
  percent_change_1h: number
  percent_change_24h: number
}

interface CmcAssetQuote {
  symbol: string
  quote: { USD: CmcQuoteUsd }
}

interface CmcQuotesResponse {
  status: CmcStatus
  data: Record<string, CmcAssetQuote[]>
}

interface CmcOhlcvResponse {
  status: CmcStatus
  data: {
    quotes: Array<{ quote: { USD: { volume: number } } }>
  }
}

function getApiKey(): string | null {
  const key = process.env.CMC_API_KEY
  if (!key) {
    console.error('[cmc] CMC_API_KEY is not set')
    return null
  }
  return key
}

async function cmcGet<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const apiKey = getApiKey()
  if (!apiKey) return null

  const url = new URL(`${CMC_API_BASE}${path}`)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'X-CMC_PRO_API_KEY': apiKey,
      },
    })

    if (!response.ok) {
      console.error(`[cmc] HTTP ${response.status} for ${path}`)
      return null
    }

    const body = (await response.json()) as { status: CmcStatus } & T
    if (body.status.error_code !== 0) {
      console.error(
        `[cmc] API error ${body.status.error_code}: ${body.status.error_message ?? 'unknown'}`,
      )
      return null
    }

    return body
  } catch (error) {
    console.error(`[cmc] Request failed for ${path}:`, error)
    return null
  }
}

async function fetchLatestQuotes(): Promise<Record<string, CmcAssetQuote[]> | null> {
  const result = await cmcGet<CmcQuotesResponse>('/v2/cryptocurrency/quotes/latest', {
    symbol: BNB_PAIRS.join(','),
    convert: 'USD',
  })

  return result?.data ?? null
}

async function fetch7DayAvgVolume(symbol: string): Promise<number> {
  const result = await cmcGet<CmcOhlcvResponse>('/v2/cryptocurrency/ohlcv/historical', {
    symbol,
    convert: 'USD',
    time_period: 'daily',
    count: '7',
  })

  const candles = result?.data?.quotes ?? []
  if (candles.length === 0) return 0

  const totalVolume = candles.reduce(
    (sum, candle) => sum + (candle.quote?.USD?.volume ?? 0),
    0,
  )

  return totalVolume / candles.length
}

function detectRegime(
  percentChange1h: number,
  percentChange24h: number,
  volume24h: number,
  avgVolume7d: number,
): Regime {
  if (Math.abs(percentChange1h) > 2) return 'volatile'
  if (Math.abs(percentChange24h) > 3 && volume24h > avgVolume7d) return 'trending'
  return 'ranging'
}

function toMarketSignal(
  symbol: string,
  quote: CmcQuoteUsd,
  avgVolume7d: number,
): MarketSignal {
  const regime = detectRegime(
    quote.percent_change_1h,
    quote.percent_change_24h,
    quote.volume_24h,
    avgVolume7d,
  )

  const liquidityScore =
    avgVolume7d > 0
      ? Math.min(1, quote.volume_24h / (avgVolume7d * 2))
      : 0.5

  return {
    symbol,
    price: quote.price,
    priceChange24h: quote.percent_change_24h,
    volume24h: quote.volume_24h,
    regime,
    riskFlag:
      Math.abs(quote.percent_change_1h) > 5 || Math.abs(quote.percent_change_24h) > 15,
    liquidityScore,
    timestamp: Date.now(),
  }
}

export function getRegime(signal: MarketSignal): string {
  return signal.regime
}

export async function fetchMarketSignals(): Promise<MarketSignal[]> {
  try {
    const quotes = await fetchLatestQuotes()
    if (!quotes) return []

    const volumeAvgs = await Promise.all(
      BNB_PAIRS.map(async (symbol) => ({
        symbol,
        avgVolume7d: await fetch7DayAvgVolume(symbol),
      })),
    )

    const avgBySymbol = Object.fromEntries(
      volumeAvgs.map(({ symbol, avgVolume7d }) => [symbol, avgVolume7d]),
    )

    const signals: MarketSignal[] = []

    for (const symbol of BNB_PAIRS) {
      try {
        const entries = quotes[symbol]
        const quote = entries?.[0]?.quote?.USD
        if (!quote) {
          console.error(`[cmc] No quote data for ${symbol}`)
          continue
        }

        signals.push(toMarketSignal(symbol, quote, avgBySymbol[symbol] ?? 0))
      } catch (error) {
        console.error(`[cmc] Failed to transform signal for ${symbol}:`, error)
      }
    }

    return signals
  } catch (error) {
    console.error('[cmc] fetchMarketSignals failed:', error)
    return []
  }
}
