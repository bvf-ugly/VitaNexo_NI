import { Router } from 'express'
import { biAuth, biRequireRole } from '../middleware/biAuth.middleware.js'
import { getPatients, getPatientSummary, getOverview } from '../controllers/bi.controller.js'

const router = Router()

router.get('/patients',                biAuth, biRequireRole('admin', 'doctor'), getPatients)
router.get('/patient/:patientId/summary', biAuth, biRequireRole('admin', 'doctor'), getPatientSummary)
router.get('/overview',                biAuth, biRequireRole('admin', 'doctor'), getOverview)

export default router
