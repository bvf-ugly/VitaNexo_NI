import bcrypt from 'bcrypt'
import jwt    from 'jsonwebtoken'
import { User, Patient } from '../models/index.js'

const signAccess = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  })

const signRefresh = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  })

// ─── POST /api/auth/register ──────────────────────────────────────────────────
// El registro público SIEMPRE crea role=patient, nunca admin ni doctor.
export async function register(req, res) {
  try {
    const { email, password, first_name, last_name, phone } = req.body

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'email, password, first_name y last_name son requeridos' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
    }

    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ error: 'Email ya registrado' })

    const rounds = Number(process.env.BCRYPT_ROUNDS) || 10
    const password_hash = await bcrypt.hash(password, rounds)

    // ⚠️ role forzado a 'patient' — el registro público no puede elegir rol
    const user = await User.create({
      email, password_hash,
      role: 'patient',
      first_name, last_name, phone,
    })

    // Crear ficha de paciente automáticamente
    await Patient.create({ user_id: user._id })

    const payload = { id: user._id, email: user.email, role: user.role }
    const accessToken  = signAccess(payload)
    const refreshToken = signRefresh(payload)

    user.refresh_token_hash = await bcrypt.hash(refreshToken, 10)
    await user.save()

    res.status(201).json({
      accessToken, refreshToken,
      user: { id: user._id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
export async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email y password requeridos' })

    const user = await User.findOne({ email })
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' })

    const payload = { id: user._id, email: user.email, role: user.role }
    const accessToken  = signAccess(payload)
    const refreshToken = signRefresh(payload)

    user.refresh_token_hash = await bcrypt.hash(refreshToken, 10)
    user.last_login_at = new Date()
    await user.save()

    res.json({
      accessToken, refreshToken,
      user: { id: user._id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
export async function refresh(req, res) {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return res.status(400).json({ error: 'refreshToken requerido' })

    let payload
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    } catch {
      return res.status(401).json({ error: 'Token inválido o expirado' })
    }

    const user = await User.findById(payload.id)
    if (!user?.refresh_token_hash) return res.status(401).json({ error: 'Sesión no encontrada' })

    const valid = await bcrypt.compare(refreshToken, user.refresh_token_hash)
    if (!valid) return res.status(401).json({ error: 'Token inválido' })

    const newPayload   = { id: user._id, email: user.email, role: user.role }
    const newAccess    = signAccess(newPayload)
    const newRefresh   = signRefresh(newPayload)

    user.refresh_token_hash = await bcrypt.hash(newRefresh, 10)
    await user.save()

    res.json({ accessToken: newAccess, refreshToken: newRefresh })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
export async function logout(req, res) {
  try {
    const user = await User.findById(req.user.id)
    if (user) { user.refresh_token_hash = undefined; await user.save() }
    res.json({ message: 'Sesión cerrada correctamente' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
export async function me(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select('-password_hash -refresh_token_hash')
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
