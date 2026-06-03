import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'
import { Appointment, Patient, Doctor } from '../models/index.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    let filter = {}
    if (req.user.role === 'patient') {
      const pat = await Patient.findOne({ user_id: req.user.id })
      if (pat) filter = { patient_id: pat._id }
    } else if (req.user.role === 'doctor') {
      const doc = await Doctor.findOne({ user_id: req.user.id })
      if (doc) filter = { doctor_id: doc._id }
    }
    const appointments = await Appointment.find(filter)
      .populate('patient_id').populate('doctor_id')
      .sort({ scheduled_at: 1 })
    res.json(appointments)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/', async (req, res) => {
  try {
    const appt = await Appointment.create(req.body)
    res.status(201).json(appt)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.patch('/:id/status', requireRole('doctor','admin'), async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true }
    )
    if (!appt) return res.status(404).json({ error: 'Cita no encontrada' })
    res.json(appt)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
