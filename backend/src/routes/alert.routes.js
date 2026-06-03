import { Router } from 'express'
import { requireAuth, canAccessPatient } from '../middleware/auth.middleware.js'
import { Alert } from '../models/index.js'

const router = Router()
router.use(requireAuth)

router.get('/patient/:patientId', canAccessPatient, async (req, res) => {
  try {
    const alerts = await Alert.find({ patient_id: req.params.patientId }).sort({ triggered_at: -1 })
    res.json(alerts)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.patch('/:id/read', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { is_read: true }, { new: true })
    if (!alert) return res.status(404).json({ error: 'Alerta no encontrada' })
    res.json(alert)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
