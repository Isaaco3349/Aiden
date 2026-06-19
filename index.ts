import 'dotenv/config'
import { startAgent } from './adapters/bnb/index'

console.log(`
  ╔═══════════════════════════════════════╗
  ║   AIDEN — Autonomous Financial AI     ║
  ║   BNB Chain · Solana · Stellar        ║
  ╚═══════════════════════════════════════╝
`)

startAgent().catch(err => {
  console.error('[AIDEN] Fatal error:', err)
  process.exit(1)
})