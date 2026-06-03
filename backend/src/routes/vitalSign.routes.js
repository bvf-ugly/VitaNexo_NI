import { Router } from 'express'
import { requireAuth, canAccessPatient } from '../middleware/auth.middleware.js'
import { VitalSign }   from '../models/index.js'

const router = Router()
router.use(requireAuth)

router.get('/patient/:patientId', canAccessPatient, async (req, res) => {
  try {
    const signs = await VitalSign.find({ patient_id: req.params.patientId })
      .sort({ recorded_at: -1 }).limit(50)
    res.json(signs)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/', canAccessPatient, async (req, res) => {
  try {
    const sign = await VitalSign.create(req.body)
    res.status(201).json(sign)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
