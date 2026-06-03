import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'
import { Patient, User, Doctor } from '../models/index.js'

const router = Router()
router.use(requireAuth)

// Devuelve el paciente asociado al usuario logueado (solo rol patient)
router.get('/me', async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(404).json({ error: 'El usuario actual no es un paciente' })
    }
    const patient = await Patient.findOne({ user_id: req.user.id })
      .populate('user_id', 'first_name last_name email phone')
      .populate('assigned_doctor_id', 'specialty license_number')
    if (!patient) return res.status(404).json({ error: 'Paciente no encontrado' })
    res.json(patient)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Listar — admin ve todos, doctor ve solo asignados, patient ve solo suyo
router.get('/', async (req, res) => {
  try {
    let filter = {}
    if (req.user.role === 'patient') {
      const pat = await Patient.findOne({ user_id: req.user.id })
      if (!pat) return res.json([])
      filter = { _id: pat._id }
    } else if (req.user.role === 'doctor') {
      const doc = await Doctor.findOne({ user_id: req.user.id })
      if (doc) filter = { assigned_doctor_id: doc._id }
    }
    const patients = await Patient.find(filter)
      .populate('user_id', 'first_name last_name email phone')
      .populate('assigned_doctor_id', 'specialty license_number')
    res.json(patients)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Detalle — con verificación de ownership
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('user_id', '-password_hash -refresh_token_hash')
      .populate('assigned_doctor_id')
    if (!patient) return res.status(404).json({ error: 'Paciente no encontrado' })

    // Verificar ownership
    if (req.user.role === 'patient' && patient.user_id._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No tienes acceso a este paciente' })
    }
    if (req.user.role === 'doctor') {
      const doc = await Doctor.findOne({ user_id: req.user.id })
      if (doc && patient.assigned_doctor_id?.toString() !== doc._id.toString()) {
        return res.status(403).json({ error: 'Este paciente no está asignado a ti' })
      }
    }

    res.json(patient)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Paciente edita su propio perfil (contacto, dirección, teléfono)
router.put('/:id/profile', requireAuth, async (req, res) => {
  try {
    const { phone, address, emergency_contact } = req.body
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { address, emergency_contact },
      { new: true, runValidators: true }
    )
    if (!patient) return res.status(404).json({ error: 'Paciente no encontrado' })
    if (phone) {
      await User.findByIdAndUpdate(patient.user_id, { phone })
    }
    res.json(patient)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Doctor/admin edita ficha clínica
router.put('/:id/clinical', requireRole('doctor', 'admin'), async (req, res) => {
  try {
    const { chronic_conditions, allergies, blood_type, assigned_doctor_id } = req.body
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { chronic_conditions, allergies, blood_type, assigned_doctor_id },
      { new: true, runValidators: true }
    )
    if (!patient) return res.status(404).json({ error: 'Paciente no encontrado' })
    res.json(patient)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Actualización general (admin/doctor)
router.put('/:id', requireRole('doctor', 'admin'), async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    )
    if (!patient) return res.status(404).json({ error: 'Paciente no encontrado' })
    res.json(patient)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
