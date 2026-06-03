import { GlucoseReading, Alert } from '../models/index.js'

// Rangos de glucosa en mg/dL
const RANGES = {
  fasting:   { low: 70, normal: 100, high: 126 },
  post_meal: { low: 70, normal: 140, high: 200 },
  random:    { low: 70, normal: 140, high: 200 },
  bedtime:   { low: 80, normal: 120, high: 180 },
}

function classifyGlucose(value, context) {
  const r = RANGES[context] || RANGES.random
  if (value < r.low)     return { status: 'low',      label: 'Hipoglucemia',    alertType: 'critical' }
  if (value <= r.normal) return { status: 'normal',   label: 'Normal',          alertType: null }
  if (value <= r.high)   return { status: 'elevated', label: 'Elevada',         alertType: 'warning' }
  return                        { status: 'high',     label: 'Alta (diabetes)', alertType: 'critical' }
}

const CTX_LABEL = {
  fasting: 'ayunas', post_meal: 'postprandial', random: 'aleatoria', bedtime: 'antes de dormir',
}

// GET /api/glucose/patient/:patientId
// Devuelve las últimas 90 lecturas ordenadas DESC (más reciente primero)
export async function getByPatient(req, res) {
  try {
    const readings = await GlucoseReading.find({ patient_id: req.params.patientId })
      .sort({ recorded_at: -1 }).limit(90)
    res.json(readings)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// POST /api/glucose
export async function create(req, res) {
  try {
    const { patient_id, value_mgdl, context = 'random', notes, recorded_at } = req.body

    if (!patient_id || value_mgdl === undefined || value_mgdl === null) {
      return res.status(400).json({ error: 'patient_id y value_mgdl son requeridos' })
    }
    const num = Number(value_mgdl)
    if (isNaN(num) || num < 20 || num > 600) {
      return res.status(400).json({ error: 'Valor de glucosa debe estar entre 20 y 600 mg/dL' })
    }

    const reading = await GlucoseReading.create({
      patient_id, value_mgdl: num, context,
      notes: notes || undefined,
      recorded_at: recorded_at ? new Date(recorded_at) : new Date(),
    })

    const { alertType, label } = classifyGlucose(num, context)
    if (alertType) {
      await Alert.create({
        patient_id,
        type: alertType,
        message: `Glucosa ${label}: ${num} mg/dL (${CTX_LABEL[context] || context})`,
      })
    }

    res.status(201).json({ reading, classification: classifyGlucose(num, context) })
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// GET /api/glucose/patient/:patientId/stats
// - stats_days: ventana para métricas (default 30 días)
// - chart_days: ventana para la gráfica (default 60 días, cubre el seed)
// Devuelve lecturas ordenadas ASC para la gráfica
export async function stats(req, res) {
  try {
    const statsDays = Number(req.query.stats_days) || 30
    const chartDays = Number(req.query.chart_days) || 60

    const sinceStats = new Date(Date.now() - statsDays * 86_400_000)
    const sinceChart = new Date(Date.now() - chartDays * 86_400_000)

    // Lecturas para la gráfica (ventana amplia, ASC para recharts)
    const chartReadings = await GlucoseReading.find({
      patient_id: req.params.patientId,
      recorded_at: { $gte: sinceChart },
    }).sort({ recorded_at: 1 })

    // Si no hay ninguna, intentar con TODAS las lecturas del paciente
    const allForChart = chartReadings.length > 0
      ? chartReadings
      : await GlucoseReading.find({ patient_id: req.params.patientId })
          .sort({ recorded_at: 1 }).limit(90)

    if (!allForChart.length) return res.json({ count: 0, readings: [] })

    // Lecturas para métricas (ventana de 30 días o últimas 30 si no hay suficientes)
    const statsReadings = allForChart.filter(r => new Date(r.recorded_at) >= sinceStats)
    const metricsSource = statsReadings.length >= 5 ? statsReadings : allForChart.slice(-30)

    const values    = metricsSource.map(r => r.value_mgdl)
    const avg       = values.reduce((a, b) => a + b, 0) / values.length
    const inRange   = metricsSource.filter(r => classifyGlucose(r.value_mgdl, r.context).status === 'normal').length

    res.json({
      count:        metricsSource.length,
      avg_mgdl:     Math.round(avg),
      min_mgdl:     Math.min(...values),
      max_mgdl:     Math.max(...values),
      in_range_pct: Math.round((inRange / metricsSource.length) * 100),
      readings:     allForChart,   // ASC — listo para recharts sin manipulación
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
}