// ─────────────────────────────────────────────
// AIDEN — BNB Adapter: Wallet Signing
// Handles transaction signing via Trust Wallet Agent Kit
// ─────────────────────────────────────────────

import { ethers } from 'ethers'

// ── Provider + Signer setup ──
const RPC_URL = process.env.BNB_RPC_URL || 'https://bsc-dataseed.binance.org/'
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || ''

if (!PRIVATE_KEY) {
  console.warn('[AIDEN] WARNING: WALLET_PRIVATE_KEY not set in .env')
}

export const provider = new ethers.JsonRpcProvider(RPC_URL)
export const signer = new ethers.Wallet(PRIVATE_KEY, provider)

// ── Get wallet address ──
export function getWalletAddress(): string {
  return signer.address
}

// ── Get BNB balance ──
export async function getBalance(): Promise<string> {
  try {
    const balance = await provider.getBalance(signer.address)
    return ethers.formatEther(balance)
  } catch (err) {
    console.error('[AIDEN] Balance fetch failed:', err)
    return '0'
  }
}

// ── Sign and send a raw transaction ──
export async function sendTransaction(
  to: string,
  data: string,
  value: bigint = 0n
): Promise<string> {
  try {
    const tx = await signer.sendTransaction({
      to,
      data,
      value,
      gasLimit: 300000n,
    })
    console.log(`[AIDEN] TX sent: ${tx.hash}`)
    await tx.wait()
    console.log(`[AIDEN] TX confirmed: ${tx.hash}`)
    return tx.hash
  } catch (err) {
    console.error('[AIDEN] TX failed:', err)
    throw err
  }
}