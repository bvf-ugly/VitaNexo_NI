/**
 * Middleware de sanitización contra NoSQL Injection.
 * Elimina claves que empiecen con $ o contengan puntos (operadores MongoDB).
 * Verifica tipo estricto en login/register.
 */

function stripOperators(obj) {
  if (typeof obj !== 'object' || obj === null) return obj
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key]
      continue
    }
    if (typeof obj[key] === 'object') stripOperators(obj[key])
  }
  return obj
}

export function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    stripOperators(req.body)
  }
  next()
}

// Para rutas de auth: forzar que email y password sean strings
export function strictAuthTypes(req, res, next) {
  const { email, password } = req.body || {}
  if (email    !== undefined && typeof email    !== 'string') {
    return res.status(400).json({ error: 'Formato de email inválido' })
  }
  if (password !== undefined && typeof password !== 'string') {
    return res.status(400).json({ error: 'Formato de password inválido' })
  }
  next()
}
