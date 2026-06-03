import 'dotenv/config'
import express      from 'express'
import helmet       from 'helmet'
import cors         from 'cors'
import rateLimit    from 'express-rate-limit'
import { connectDB }       from './utils/db.js'
import { sanitizeBody }    from './middleware/sanitize.middleware.js'

// Routes
import authRoutes       from './routes/auth.routes.js'
import patientRoutes    from './routes/patient.routes.js'
import appointmentRoutes from './routes/appointment.routes.js'
import recordRoutes     from './routes/record.routes.js'
import alertRoutes      from './routes/alert.routes.js'
import vitalSignRoutes  from './routes/vitalSign.routes.js'
import glucoseRoutes    from './routes/glucose.routes.js'
import assetsRoutes     from './routes/assets.routes.js'
import biRoutes         from './routes/bi.routes.js'

const app  = express()
const PORT = process.env.PORT || 5000

// ── Seguridad HTTP ────────────────────────────────────────────────────────────
app.set('trust proxy', 1)  // nginx reverse proxy (1 hop)
app.use(helmet())

// CORS — acepta múltiples orígenes desde .env
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',').map(o => o.trim())

app.use(cors({
  origin: (origin, cb) => {
    if (process.env.NODE_ENV === 'development') {
      // en desarrollo acepta cualquier origen
      return cb(null, true)
    }
    // en producción solo los permitidos
    if (!origin || allowedOrigins.includes(origin)) {
      return cb(null, true)
    }
    cb(new Error('CORS no permitido'))
  },
  credentials: true
}))
  //app.use(cors({
//  origin: (origin, cb) => {
//    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
//    cb(new Error('CORS no permitido'))
//  },
//  credentials: true,
//}))

// Limitar tamaño del body — evitar body stuffing
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// Sanitización global contra NoSQL injection
app.use(sanitizeBody)

// Rate limit global
app.use(rateLimit({
  windowMs: 60_000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}))

// Rate limit estricto para auth (10 intentos/min)
const authLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max:      Number(process.env.RATE_LIMIT_MAX)        || 10,
  message:  { error: 'Demasiados intentos. Espera un minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', env: process.env.NODE_ENV, ts: new Date() })
)

// ── Rutas API ─────────────────────────────────────────────────────────────────
app.use('/api/auth',        authLimiter, authRoutes)
app.use('/api/patients',    patientRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/records',     recordRoutes)
app.use('/api/alerts',      alertRoutes)
app.use('/api/vital-signs', vitalSignRoutes)
app.use('/api/glucose',     glucoseRoutes)
app.use('/api/assets',      assetsRoutes)
app.use('/api/bi',          biRoutes)

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }))

// ── Error handler global ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message)
  // No exponer detalles internos en producción
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message,
  })
})

// ── Arrancar ──────────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀  VitaNexo API → http://localhost:${PORT}`)
    console.log(`📋  Health     → http://localhost:${PORT}/health`)
  })
})
