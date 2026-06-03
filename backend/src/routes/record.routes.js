import { Router } from 'express'
import { requireAuth, requireRole, canAccessPatient } from '../middleware/auth.middleware.js'
import { MedicalRecord } from '../models/index.js'

const router = Router()
router.use(requireAuth)

router.get('/patient/:patientId', canAccessPatient, async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient_id: req.params.patientId })
      .populate('doctor_id').sort({ visit_date: -1 })
    res.json(records)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/', requireRole('doctor','admin'), async (req, res) => {
  try {
    const record = await MedicalRecord.create(req.body)
    res.status(201).json(record)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
