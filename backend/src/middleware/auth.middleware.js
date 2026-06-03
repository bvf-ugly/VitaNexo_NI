import jwt from 'jsonwebtoken'
import { Patient, Doctor } from '../models/index.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' })
  }
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: `Acceso denegado. Roles permitidos: ${roles.join(', ')}` })
    }
    next()
  }
}

// Verifica que el usuario autenticado tenga acceso al patientId de la ruta
export async function canAccessPatient(req, res, next) {
  try {
    const patientId = req.params.patientId || req.body?.patient_id
    if (!patientId) return res.status(400).json({ error: 'patientId requerido' })

    if (req.user.role === 'admin') return next()

    if (req.user.role === 'patient') {
      const pat = await Patient.findOne({ user_id: req.user.id }).select('_id')
      if (!pat || pat._id.toString() !== patientId) {
        return res.status(403).json({ error: 'No tienes acceso a este paciente' })
      }
      return next()
    }

    if (req.user.role === 'doctor') {
      const pat = await Patient.findById(patientId).select('assigned_doctor_id')
      if (!pat) return res.status(404).json({ error: 'Paciente no encontrado' })
      const doc = await Doctor.findOne({ user_id: req.user.id }).select('_id')
      if (!doc || pat.assigned_doctor_id?.toString() !== doc._id.toString()) {
        return res.status(403).json({ error: 'Este paciente no está asignado a ti' })
      }
      return next()
    }

    return res.status(403).json({ error: 'Acceso denegado' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
