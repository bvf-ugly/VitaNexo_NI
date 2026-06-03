import { User, Patient, Doctor, Appointment, GlucoseReading, VitalSign, Alert, MedicalRecord } from '../models/index.js'

// GET /api/bi/patients — todos los pacientes con métricas agregadas (Power BI-ready)
export async function getPatients(req, res) {
  try {
    const patients = await Patient.find()
      .populate('user_id', 'first_name last_name email role is_active')
      .populate('assigned_doctor_id')
      .lean()

    const enriched = await Promise.all(patients.map(async (p) => {
      if (!p.user_id) return null
      const userId = p.user_id

      const lastGlucose = await GlucoseReading.findOne({ patient_id: p._id })
        .sort({ recorded_at: -1 }).lean()

      const glucose30d = await GlucoseReading.find({
        patient_id: p._id,
        recorded_at: { $gte: new Date(Date.now() - 30 * 86_400_000) },
      }).lean()
      const gAvg = glucose30d.length
        ? Math.round(glucose30d.reduce((a, r) => a + r.value_mgdl, 0) / glucose30d.length)
        : null

      const lastVitals = await VitalSign.findOne({ patient_id: p._id })
        .sort({ recorded_at: -1 }).lean()

      const appointmentCount = await Appointment.countDocuments({ patient_id: p._id })
      const upcomingAppts = await Appointment.countDocuments({
        patient_id: p._id,
        scheduled_at: { $gte: new Date() },
        status: { $in: ['pending', 'confirmed'] },
      })

      const alertCount = await Alert.countDocuments({ patient_id: p._id, is_read: false })
      const recordCount = await MedicalRecord.countDocuments({ patient_id: p._id })

      return {
        patient_id: p._id.toString(),
        email: userId.email,
        first_name: userId.first_name,
        last_name: userId.last_name,
        role: userId.role,
        is_active: userId.is_active,
        birth_date: p.birth_date || null,
        gender: p.gender || null,
        blood_type: p.blood_type || null,
        allergies: p.allergies || [],
        chronic_conditions: p.chronic_conditions || [],
        assigned_doctor: p.assigned_doctor_id
          ? `${p.assigned_doctor_id.specialty || ''}`.trim()
          : null,
        last_glucose: lastGlucose ? lastGlucose.value_mgdl : null,
        last_glucose_date: lastGlucose ? lastGlucose.recorded_at : null,
        glucose_30d_avg: gAvg,
        last_heart_rate: lastVitals?.heart_rate || null,
        last_blood_pressure_sys: lastVitals?.blood_pressure?.systolic || null,
        last_blood_pressure_dia: lastVitals?.blood_pressure?.diastolic || null,
        last_temperature: lastVitals?.temperature || null,
        last_oxygen_saturation: lastVitals?.oxygen_saturation || null,
        total_appointments: appointmentCount,
        upcoming_appointments: upcomingAppts,
        unread_alerts: alertCount,
        total_medical_records: recordCount,
      }
    }))

    res.json(enriched.filter(Boolean))
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// GET /api/bi/patient/:patientId/summary — análisis completo de un paciente
export async function getPatientSummary(req, res) {
  try {
    const { patientId } = req.params

    const patient = await Patient.findById(patientId)
      .populate('user_id', 'first_name last_name email role phone is_active')
      .populate('assigned_doctor_id')
      .lean()
    if (!patient) return res.status(404).json({ error: 'Paciente no encontrado' })

    const glucoseReadings = await GlucoseReading.find({ patient_id: patientId })
      .sort({ recorded_at: 1 }).limit(200).lean()
    const vitals = await VitalSign.find({ patient_id: patientId })
      .sort({ recorded_at: 1 }).limit(200).lean()
    const appointments = await Appointment.find({ patient_id: patientId })
      .sort({ scheduled_at: -1 }).lean()
    const alerts = await Alert.find({ patient_id: patientId })
      .sort({ triggered_at: -1 }).lean()
    const records = await MedicalRecord.find({ patient_id: patientId })
      .sort({ visit_date: -1 }).lean()

    const gValues = glucoseReadings.map(r => r.value_mgdl)
    const gAvg = gValues.length ? Math.round(gValues.reduce((a, b) => a + b, 0) / gValues.length) : 0
    const gMin = gValues.length ? Math.min(...gValues) : 0
    const gMax = gValues.length ? Math.max(...gValues) : 0

    const hrValues = vitals.filter(v => v.heart_rate).map(v => v.heart_rate)
    const hrAvg = hrValues.length ? Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length) : null
    const tempValues = vitals.filter(v => v.temperature).map(v => v.temperature)
    const tempAvg = tempValues.length
      ? Math.round(tempValues.reduce((a, b) => a + b, 0) / tempValues.length * 10) / 10
      : null

    const apptCounts = { total: appointments.length }
    for (const s of ['pending', 'confirmed', 'done', 'cancelled']) {
      apptCounts[s] = appointments.filter(a => a.status === s).length
    }

    const alertCounts = { total: alerts.length, unread: alerts.filter(a => !a.is_read).length }

    res.json({
      patient: {
        id: patient._id.toString(),
        name: `${patient.user_id.first_name} ${patient.user_id.last_name}`.trim(),
        email: patient.user_id.email,
        phone: patient.user_id.phone,
        role: patient.user_id.role,
        is_active: patient.user_id.is_active,
        birth_date: patient.birth_date,
        gender: patient.gender,
        blood_type: patient.blood_type,
        allergies: patient.allergies,
        chronic_conditions: patient.chronic_conditions,
        doctor: patient.assigned_doctor_id?.specialty || null,
      },
      glucose: {
        readings: glucoseReadings.map(r => ({
          date: r.recorded_at,
          value_mgdl: r.value_mgdl,
          context: r.context,
          source: r.source,
        })),
        stats: gValues.length ? { avg: gAvg, min: gMin, max: gMax, count: gValues.length } : null,
      },
      vitals: {
        readings: vitals.map(v => ({
          date: v.recorded_at,
          heart_rate: v.heart_rate,
          blood_pressure: v.blood_pressure,
          temperature: v.temperature,
          oxygen_saturation: v.oxygen_saturation,
          source: v.source,
        })),
        stats: {
          heart_rate_avg: hrAvg,
          temperature_avg: tempAvg,
        },
      },
      appointments: {
        total: apptCounts.total,
        by_status: { pending: apptCounts.pending, confirmed: apptCounts.confirmed, done: apptCounts.done, cancelled: apptCounts.cancelled },
        list: appointments.map(a => ({
          date: a.scheduled_at,
          status: a.status,
          reason: a.reason,
        })),
      },
      alerts: {
        total: alertCounts.total,
        unread: alertCounts.unread,
        list: alerts.map(a => ({
          date: a.triggered_at,
          type: a.type,
          message: a.message,
          is_read: a.is_read,
        })),
      },
      medical_records: {
        count: records.length,
        list: records.map(r => ({
          date: r.visit_date,
          diagnosis: r.diagnosis,
          notes: r.notes,
          prescriptions: r.prescriptions,
        })),
      },
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// GET /api/bi/overview — métricas globales para dashboard Power BI
export async function getOverview(req, res) {
  try {
    const [totalPatients, totalDoctors, totalUsers, totalAppointments, totalAlerts, totalGlucose, totalVitals] =
      await Promise.all([
        Patient.countDocuments(),
        Doctor.countDocuments(),
        User.countDocuments({ is_active: true }),
        Appointment.countDocuments(),
        Alert.countDocuments({ is_read: false }),
        GlucoseReading.countDocuments(),
        VitalSign.countDocuments(),
      ])

    const apptsByStatus = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])

    const glucoseAvg = await GlucoseReading.aggregate([
      { $group: { _id: null, avg: { $avg: '$value_mgdl' }, min: { $min: '$value_mgdl' }, max: { $max: '$value_mgdl' } } },
    ])

    const patientsByGender = await Patient.aggregate([
      { $match: { gender: { $ne: null } } },
      { $group: { _id: '$gender', count: { $sum: 1 } } },
    ])

    res.json({
      totals: {
        patients: totalPatients,
        doctors: totalDoctors,
        active_users: totalUsers,
        appointments: totalAppointments,
        unread_alerts: totalAlerts,
        glucose_readings: totalGlucose,
        vital_signs_readings: totalVitals,
      },
      appointments_by_status: apptsByStatus.reduce((acc, a) => ({ ...acc, [a._id]: a.count }), {}),
      glucose_global: glucoseAvg[0] || null,
      patients_by_gender: patientsByGender.reduce((acc, a) => ({ ...acc, [a._id]: a.count }), {}),
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
}
