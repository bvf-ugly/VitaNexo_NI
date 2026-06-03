import jwt from 'jsonwebtoken'

// Middleware para endpoints de Power BI
// Power BI Desktop "Web API" auth envía la API key como Authorization: Bearer <key>
// También acepta X-API-Key header, query param ?api_key=..., o JWT normal
export function biAuth(req, res, next) {
  const POWER_BI_API_KEY = process.env.POWER_BI_API_KEY

  // 1. Header X-API-Key o query param api_key
  const apiKey = req.headers['x-api-key'] || req.query.api_key
  if (apiKey) {
    if (POWER_BI_API_KEY && apiKey === POWER_BI_API_KEY) {
      req.user = { role: 'admin', id: null }
      return next()
    }
    return res.status(401).json({ error: 'API key inválida' })
  }

  // 2. Authorization: Bearer <token>
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Se requiere token JWT o API key de Power BI' })
  }

  const token = header.slice(7)

  // 2a. Intentar como JWT
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    return next()
  } catch {}

  // 2b. Si no es JWT válido, probar como API key (Power BI Desktop envía así)
  if (POWER_BI_API_KEY && token === POWER_BI_API_KEY) {
    req.user = { role: 'admin', id: null }
    return next()
  }

  return res.status(401).json({ error: 'Token inválido o API key incorrecta' })
}

export function biRequireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: `Acceso denegado. Roles permitidos: ${roles.join(', ')}` })
    }
    next()
  }
}
