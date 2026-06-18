// ─────────────────────────────────────────────
// AIDEN — BNB Adapter: Execution Orchestrator
// ─────────────────────────────────────────────

import { executeTrade } from './swap'
import { getBalance, getWalletAddress } from './wallet'
import type { TradeInstruction, ExecutionResult, Chain } from '../../../shared/types'

const CHAIN: Chain = 'bnb'

export async function execute(
  instruction: TradeInstruction
): Promise<ExecutionResult> {
  const balance = await getBalance()
  const balanceNum = parseFloat(balance)

  if (balanceNum < 0.01) {
    return {
      chain: CHAIN,
      txHash: '',
      success: false,
      side: instruction.side,
      symbol: instruction.symbol,
      executedPrice: 0,
      executedSize: 0,
      error: 'Insufficient BNB balance — minimum 0.01 BNB required',
      timestamp: Date.now(),
    }
  }

  if (instruction.sizePct <= 0) {
    return {
      chain: CHAIN,
      txHash: '',
      success: false,
      side: instruction.side,
      symbol: instruction.symbol,
      executedPrice: 0,
      executedSize: 0,
      error: 'Invalid trade size',
      timestamp: Date.now(),
    }
  }

  try {
    const txHash = await executeTrade(instruction)

    return {
      chain: CHAIN,
      txHash,
      success: true,
      side: instruction.side,
      symbol: instruction.symbol,
      executedPrice: 0, // updated by portfolio tracker in next stage
      executedSize: instruction.sizePct,
      timestamp: Date.now(),
    }
  } catch (err) {
    return {
      chain: CHAIN,
      txHash: '',
      success: false,
      side: instruction.side,
      symbol: instruction.symbol,
      executedPrice: 0,
      executedSize: 0,
      error: err instanceof Error ? err.message : 'Unknown execution error',
      timestamp: Date.now(),
    }
  }
}

export function logResult(result: ExecutionResult): void {
  const status = result.success ? '✅' : '❌'
  console.log(
    `[AIDEN] ${status} ${result.side.toUpperCase()} ${result.symbol} | ` +
    `Size: ${result.executedSize}% | ` +
    `TX: ${result.txHash || 'none'} | ` +
    `Time: ${new Date(result.timestamp).toISOString()}`
  )
  if (result.error) console.error(`[AIDEN] Error: ${result.error}`)
}

export async function getWalletStatus(): Promise<{
  address: string
  balance: string
}> {
  return {
    address: getWalletAddress(),
    balance: await getBalance(),
  }
}