// Simple in-memory rate limiter (per IP + route)
// Not suitable for multi-instance production without external store.
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_HITS = 50 // per window per route per IP

const buckets = new Map()

function rateLimit(req, res, next){
  const now = Date.now()
  const key = `${req.ip}:${req.baseUrl}${req.path}`
  let entry = buckets.get(key)
  if(!entry){
    entry = { count: 0, resetAt: now + WINDOW_MS }
    buckets.set(key, entry)
  }
  if(now > entry.resetAt){
    entry.count = 0
    entry.resetAt = now + WINDOW_MS
  }
  entry.count += 1
  if(entry.count > MAX_HITS){
    const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now)/1000))
    res.setHeader('Retry-After', retryAfter)
    return res.status(429).json({ error: 'Too many requests, please try again later.' })
  }
  next()
}

module.exports = { rateLimit }
