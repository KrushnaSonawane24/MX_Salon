const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next){
  const hdr = (req.headers['authorization'] || '').toString().trim()
  let token = null
  if(hdr){
    const m = hdr.match(/^Bearer\s+(.+)$/i)
    token = m ? m[1].trim() : null
  }
  if(!token){
    console.warn('AuthMiddleware: missing Bearer token')
    return res.status(401).json({ error: 'Missing token' })
  }
  try{
    const secret = process.env.JWT_SECRET
    if(!secret || !secret.trim()){
      console.error('AuthMiddleware error: JWT_SECRET is missing')
      return res.status(500).json({ error: 'Auth server misconfigured. Contact support.' })
    }
    const payload = jwt.verify(token, secret)
    req.user = { id: payload.sub, role: payload.role }
    return next()
  }catch(err){
    console.warn('AuthMiddleware: invalid token', err?.message)
    return res.status(401).json({ error: 'Invalid token' })
  }
}

function requireRoles(...roles){
  return (req, res, next) => {
    if(!req.user) return res.status(401).json({ error: 'Unauthorized' })
    if(!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' })
    return next()
  }
}

module.exports = { authMiddleware, requireRoles }
