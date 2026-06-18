// ─────────────────────────────────────────────
// AIDEN — BNB Adapter: Swap Execution
// Executes trades on PancakeSwap v2 via BNB Chain
// ─────────────────────────────────────────────

import { ethers } from 'ethers'
import { signer, provider } from './wallet'
import type { TradeInstruction } from '../../../shared/types'

// ── PancakeSwap v2 Router ──
const PANCAKE_ROUTER = '0x10ED43C718714eb63d5aA57B78B54704E256024E'

const ROUTER_ABI = [
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)',
]

const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
const USDT = '0x55d398326f99059fF775485246999027B3197955'

const TOKEN_MAP: Record<string, string> = {
  BNB: WBNB,
  USDT: USDT,
  ETH: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
  CAKE: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
}

// ── Get expected output amount ──
async function getAmountOut(
  amountIn: bigint,
  path: string[]
): Promise<bigint> {
  const router = new ethers.Contract(PANCAKE_ROUTER, ROUTER_ABI, provider)
  const amounts = await router.getAmountsOut(amountIn, path)
  return amounts[amounts.length - 1]
}

// ── Execute a trade instruction ──
export async function executeTrade(
  instruction: TradeInstruction
): Promise<string> {
  const router = new ethers.Contract(PANCAKE_ROUTER, ROUTER_ABI, signer)
  const deadline = Math.floor(Date.now() / 1000) + 60 * 3 // 3 min

  const tokenAddress = TOKEN_MAP[instruction.symbol]
  if (!tokenAddress) throw new Error(`Unknown symbol: ${instruction.symbol}`)

  const amountIn = ethers.parseEther(instruction.sizePct.toString())
  const path = instruction.side === 'buy'
    ? [WBNB, tokenAddress]
    : [tokenAddress, WBNB]

  // ── Get min output with 1% slippage tolerance ──
  const expectedOut = await getAmountOut(amountIn, path)
  const amountOutMin = (expectedOut * 99n) / 100n

  console.log(`[AIDEN] Executing ${instruction.side} ${instruction.symbol} | Size: ${instruction.sizePct}%`)

  try {
    let tx

    if (instruction.side === 'buy') {
      tx = await router.swapExactETHForTokens(
        amountOutMin,
        path,
        signer.address,
        deadline,
        { value: amountIn }
      )
    } else {
      tx = await router.swapExactTokensForETH(
        amountIn,
        amountOutMin,
        path,
        signer.address,
        deadline
      )
    }

    console.log(`[AIDEN] TX hash: ${tx.hash}`)
    await tx.wait()
    console.log(`[AIDEN] Trade confirmed: ${tx.hash}`)
    return tx.hash

  } catch (err) {
    console.error('[AIDEN] Trade execution failed:', err)
    throw err
  }
}