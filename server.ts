// ─────────────────────────────────────────────
// AIDEN — Keep-alive HTTP server
// Lets UptimeRobot ping this to prevent Render sleep
// ─────────────────────────────────────────────

import 'dotenv/config'
import http from 'http'
import { startAgent, getAuditLog } from './adapters/bnb/index'

const PORT = process.env.PORT || 3000

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'alive', timestamp: Date.now() }))
    return
  }

  if (req.url === '/audit') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(getAuditLog()))
    return
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('AIDEN is running. Visit /health or /audit')
})

server.listen(PORT, () => {
  console.log(`[AIDEN] HTTP server listening on port ${PORT}`)
})

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