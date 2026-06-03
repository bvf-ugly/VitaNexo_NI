import { Router } from 'express'
import { requireAuth, canAccessPatient } from '../middleware/auth.middleware.js'
import { getByPatient, create, stats } from '../controllers/glucose.controller.js'

const router = Router()
router.use(requireAuth)
router.get('/patient/:patientId',       canAccessPatient, getByPatient)
router.get('/patient/:patientId/stats', canAccessPatient, stats)
router.post('/',                        canAccessPatient, create)
export default router
