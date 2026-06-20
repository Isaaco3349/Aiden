// ─────────────────────────────────────────────
// AIDEN — One-time test swap (testnet only)
// Run with: npx ts-node test-swap.ts
// ─────────────────────────────────────────────

import 'dotenv/config'
import { executeTrade } from './adapters/bnb/execution/swap'
import { getBalance, getWalletAddress } from './adapters/bnb/execution/wallet'
import type { TradeInstruction } from './shared/types'

async function runTest() {
  console.log('[TEST] Wallet:', getWalletAddress())
  console.log('[TEST] Balance:', await getBalance(), 'tBNB')

  const testInstruction: TradeInstruction = {
    side: 'buy',
    symbol: 'USDT',
    chain: 'bnb',
    sizePct: 0.001, // tiny test amount — 0.001 BNB worth
    maxSlippagePct: 1,
    reason: 'Manual test trade — verifying swap execution on testnet',
    confidence: 1,
    timestamp: Date.now(),
  }

  console.log('[TEST] Executing test swap: BNB -> USDT')

  try {
    const txHash = await executeTrade(testInstruction)
    console.log('[TEST] ✅ SUCCESS — TX Hash:', txHash)
    console.log('[TEST] View on explorer: https://testnet.bscscan.com/tx/' + txHash)
  } catch (err) {
    console.error('[TEST] ❌ FAILED:', err)
  }
}

runTest()