/**
 * VitaNexo — Seed de base de datos
 * Credenciales leídas desde backend/.env (nunca hardcodeadas)
 * Ejecutar: node backend/scripts/seed.js
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt   from 'bcrypt'
import {
  User, Patient, Doctor,
  MedicalRecord, Appointment,
  GlucoseReading, VitalSign, Alert,
} from '../src/models/index.js'

// ── Validar variables de entorno requeridas ───────────────────────────────────
const required = [
  'MONGO_URI',
  'SEED_ADMIN_EMAIL', 'SEED_ADMIN_PASSWORD',
  'SEED_DOCTOR_EMAIL', 'SEED_DOCTOR_PASSWORD',
  'SEED_PATIENT_EMAIL', 'SEED_PATIENT_PASSWORD',
  'SEED_CANCER_EMAIL', 'SEED_CANCER_PASSWORD',
]
const missing = required.filter(k => !process.env[k])
if (missing.length) {
  console.error(`\n❌ Variables de entorno faltantes en backend/.env:\n   ${missing.join('\n   ')}`)
  process.exit(1)
}

const ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10

async function upsertUser({ email, password, role, first_name, last_name, phone }) {
  const hash = await bcrypt.hash(password, ROUNDS)
  return User.findOneAndUpdate(
    { email },
    { email, password_hash: hash, role, first_name, last_name, phone, is_active: true },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
}

// ── Fecha helpers ─────────────────────────────────────────────────────────────
const daysAgo = (n) => new Date(Date.now() - n * 86_400_000)

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(process.env.MONGO_URI)

  // ═══════════════════════════════════════════════════════════════════════════
  //  Skip si ya hay datos (persistencia entre reinicios de Docker)
  // ═══════════════════════════════════════════════════════════════════════════
  const existingAdmin = await User.findOne({ email: process.env.SEED_ADMIN_EMAIL })
  if (existingAdmin) {
    console.log('🌱 DB ya tiene datos — se omite seed (usa docker-entrypoint si necesitas forzar)')
    return
  }

  console.log('\n🌱 VitaNexo — iniciando seed...\n')

  // ── Admin ─────────────────────────────────────────────────────────────────
  const admin = await upsertUser({
    email:      process.env.SEED_ADMIN_EMAIL,
    password:   process.env.SEED_ADMIN_PASSWORD,
    role:       'admin',
    first_name: 'Admin',
    last_name:  'VitaNexo',
    phone:      '+505-8888-0000',
  })
  console.log(`✅  Admin   → ${admin.email}`)

  // ── Doctor ────────────────────────────────────────────────────────────────
  const doctorUser = await upsertUser({
    email:      process.env.SEED_DOCTOR_EMAIL,
    password:   process.env.SEED_DOCTOR_PASSWORD,
    role:       'doctor',
    first_name: 'Carlos',
    last_name:  'Mendoza',
    phone:      '+505-7777-1234',
  })
  const doctor = await Doctor.findOneAndUpdate(
    { user_id: doctorUser._id },
    {
      user_id:        doctorUser._id,
      specialty:      'Endocrinología',
      license_number: 'MED-NI-001',
      available_schedule: [
        { weekday: 1, from: '08:00', to: '12:00' },
        { weekday: 3, from: '08:00', to: '12:00' },
        { weekday: 5, from: '08:00', to: '11:00' },
      ],
    },
    { upsert: true, new: true }
  )
  console.log(`✅  Doctor  → ${doctorUser.email} (${doctor.specialty})`)

  // ── Paciente demo — María García, diabética tipo 2 ───────────────────────
  const patientUser = await upsertUser({
    email:      process.env.SEED_PATIENT_EMAIL,
    password:   process.env.SEED_PATIENT_PASSWORD,
    role:       'patient',
    first_name: 'María',
    last_name:  'García',
    phone:      '+505-8123-4567',
  })
  const patient = await Patient.findOneAndUpdate(
    { user_id: patientUser._id },
    {
      user_id:            patientUser._id,
      birth_date:         new Date('1978-03-15'),
      gender:             'female',
      blood_type:         'O+',
      allergies:          ['Penicilina', 'Ibuprofeno'],
      chronic_conditions: ['Diabetes Mellitus Tipo 2', 'Hipertensión arterial leve'],
      emergency_contact:  { name: 'José García', phone: '+505-8999-1111', relationship: 'Esposo' },
      address:            'Managua, Nicaragua — Residencial Las Colinas',
      assigned_doctor_id: doctor._id,
    },
    { upsert: true, new: true }
  )
  console.log(`✅  Paciente → ${patientUser.email} (Diabetes T2 + HTA)`)

  // ── Expedientes clínicos — 6 visitas en el último año ────────────────────
  const recordsData = [
    {
      visit_date: daysAgo(180),
      diagnosis: 'Diabetes Mellitus Tipo 2 — diagnóstico inicial. HbA1c 8.2%. Glucosa en ayunas 195 mg/dL.',
      prescriptions: [
        { drug: 'Metformina', dose: '850 mg', duration: 'Indefinido — 2 veces al día con comidas' },
        { drug: 'Enalapril',  dose: '10 mg',  duration: 'Indefinido — una vez al día (HTA)' },
      ],
      notes: 'Paciente con sobrepeso (IMC 28.4). Se inicia metformina. Plan de dieta con nutricionista. Control en 3 meses. Derivada a endocrinología.',
    },
    {
      visit_date: daysAgo(90),
      diagnosis: 'Control DM2 — respuesta parcial a Metformina. HbA1c 7.6% (mejora). Glucosa ayunas 162 mg/dL.',
      prescriptions: [
        { drug: 'Metformina',  dose: '1000 mg', duration: 'Indefinido — 2 veces al día' },
        { drug: 'Enalapril',   dose: '10 mg',   duration: 'Indefinido' },
        { drug: 'Aspirina',    dose: '100 mg',  duration: 'Indefinido — prevención cardiovascular' },
      ],
      notes: 'Paciente adherente al tratamiento. Refiere mayor actividad física. Se sube dosis de Metformina. Próximo control en 3 meses con HbA1c.',
    },
    {
      visit_date: daysAgo(60),
      diagnosis: 'Hipoglucemia leve — glucosa 58 mg/dL registrada en domicilio. Episodio nocturno.',
      prescriptions: [
        { drug: 'Metformina', dose: '850 mg', duration: 'Se reduce dosis — 2 veces al día' },
        { drug: 'Enalapril',  dose: '10 mg',  duration: 'Indefinido' },
      ],
      notes: 'Se reduce Metformina por episodio hipoglucémico nocturno. Instrucciones: llevar caramelos siempre. Monitoreo diario de glucosa. Alerta configurada en app.',
    },
    {
      visit_date: daysAgo(30),
      diagnosis: 'Control rutinario DM2 + HTA. Glucosa ayunas 138 mg/dL. Tensión 128/82 mmHg.',
      prescriptions: [
        { drug: 'Metformina', dose: '850 mg', duration: 'Indefinido' },
        { drug: 'Enalapril',  dose: '10 mg',  duration: 'Indefinido' },
        { drug: 'Aspirina',   dose: '100 mg', duration: 'Indefinido' },
      ],
      notes: 'Evolución favorable. Glucosa en tendencia descendente. HTA bien controlada. Se solicita perfil lipídico y función renal. Próximo control en 6 semanas.',
    },
    {
      visit_date: daysAgo(7),
      diagnosis: 'Revisión exámenes — perfil lipídico: Col total 198 mg/dL, LDL 128 mg/dL, HDL 42 mg/dL. Función renal normal.',
      prescriptions: [
        { drug: 'Metformina',     dose: '850 mg', duration: 'Indefinido' },
        { drug: 'Atorvastatina',  dose: '20 mg',  duration: 'Indefinido — noche, reduce LDL' },
        { drug: 'Enalapril',      dose: '10 mg',  duration: 'Indefinido' },
      ],
      notes: 'LDL limítrofe en paciente diabética. Se agrega estatina. Refuerzo de dieta mediterránea. Control lipídico en 3 meses.',
    },
  ]

  await MedicalRecord.deleteMany({ patient_id: patient._id })
  for (const r of recordsData) {
    await MedicalRecord.create({ patient_id: patient._id, doctor_id: doctor._id, ...r })
  }
  console.log(`✅  Expedientes → ${recordsData.length} visitas clínicas`)

  // ── Lecturas de glucosa — 60 días de historial realista ──────────────────
  const glucoseData = []
  const contexts = ['fasting', 'post_meal', 'post_meal', 'random', 'bedtime']

  // Simular evolución: glucosas altas al inicio, mejorando gradualmente
  for (let day = 60; day >= 0; day--) {
    // Tendencia bajando: de ~190 hace 60 días a ~130 hoy
    const trend     = 190 - (60 - day) * 0.9
    const variation = (Math.random() - 0.5) * 40
    const ctx       = contexts[day % contexts.length]

    // Post-comida siempre más alta que ayunas
    const ctxMod = ctx === 'fasting' ? -20 : ctx === 'post_meal' ? 30 : ctx === 'bedtime' ? 10 : 0
    const value  = Math.round(Math.max(60, trend + variation + ctxMod))

    glucoseData.push({
      patient_id:  patient._id,
      value_mgdl:  value,
      context:     ctx,
      recorded_at: new Date(daysAgo(day).setHours(
        ctx === 'fasting'   ? 7  :
        ctx === 'post_meal' ? 13 :
        ctx === 'bedtime'   ? 22 : 10,
        0, 0, 0
      )),
      notes: day === 60 ? 'Registro inicial post-diagnóstico' :
             day === 30 ? 'Episodio de hipoglucemia nocturna' :
             null,
    })
  }

  await GlucoseReading.deleteMany({ patient_id: patient._id })
  await GlucoseReading.insertMany(glucoseData)
  console.log(`✅  Glucosa   → ${glucoseData.length} lecturas (60 días, tendencia de mejora)`)

  // ── Signos vitales — últimas 4 semanas ───────────────────────────────────
  const vitalsData = []
  for (let week = 4; week >= 0; week--) {
    vitalsData.push({
      patient_id:        patient._id,
      heart_rate:        72 + Math.round((Math.random() - 0.5) * 10),
      blood_pressure:    {
        systolic:  128 + Math.round((Math.random() - 0.5) * 14),
        diastolic:  82 + Math.round((Math.random() - 0.5) * 8),
      },
      temperature:       parseFloat((36.4 + Math.random() * 0.6).toFixed(1)),
      oxygen_saturation: 97 + Math.round(Math.random() * 2),
      recorded_at:       daysAgo(week * 7),
      source:            'manual',
    })
  }

  await VitalSign.deleteMany({ patient_id: patient._id })
  await VitalSign.insertMany(vitalsData)
  console.log(`✅  Vitales   → ${vitalsData.length} registros`)

  // ── Citas médicas ─────────────────────────────────────────────────────────
  await Appointment.deleteMany({ patient_id: patient._id })
  const appts = [
    {
      scheduled_at: daysAgo(90),
      status: 'done',
      reason: 'Control glucémico trimestral',
      notes:  'Se solicitó HbA1c y glucosa en ayunas.',
    },
    {
      scheduled_at: daysAgo(30),
      status: 'done',
      reason: 'Control rutinario DM2 + HTA',
      notes:  'Tensión bien controlada. Pedido perfil lipídico.',
    },
    {
      scheduled_at: daysAgo(-14), // en 14 días
      status: 'confirmed',
      reason: 'Control post-estatina y perfil lipídico',
      notes:  '',
    },
    {
      scheduled_at: daysAgo(-45), // en 45 días
      status: 'pending',
      reason: 'Control semestral DM2 — HbA1c',
      notes:  '',
    },
  ]
  for (const a of appts) {
    await Appointment.create({ patient_id: patient._id, doctor_id: doctor._id, ...a })
  }
  console.log(`✅  Citas     → ${appts.length} (2 pasadas, 2 futuras)`)

  // ── Alertas activas ───────────────────────────────────────────────────────
  await Alert.deleteMany({ patient_id: patient._id })
  await Alert.insertMany([
    {
      patient_id:   patient._id,
      type:         'critical',
      message:      'Glucosa 58 mg/dL (Hipoglucemia) registrada hace 60 días — episodio nocturno',
      is_read:      true,
      triggered_at: daysAgo(60),
    },
    {
      patient_id:   patient._id,
      type:         'warning',
      message:      'Glucosa postprandial 218 mg/dL — por encima del rango (hace 45 días)',
      is_read:      true,
      triggered_at: daysAgo(45),
    },
    {
      patient_id:   patient._id,
      type:         'info',
      message:      'Cita confirmada en 14 días — Dr. Carlos Mendoza (Endocrinología)',
      is_read:      false,
      triggered_at: daysAgo(-1),
    },
  ])
  console.log(`✅  Alertas   → 3 (1 crítica leída, 1 warning leída, 1 info nueva)`)

  // ═══════════════════════════════════════════════════════════════════════════
  //  Paciente oncológico — Roberto Vargas, cáncer de pulmón terminal (Est. IV)
  // ═══════════════════════════════════════════════════════════════════════════
  const cancerUser = await upsertUser({
    email:      process.env.SEED_CANCER_EMAIL,
    password:   process.env.SEED_CANCER_PASSWORD,
    role:       'patient',
    first_name: 'Roberto',
    last_name:  'Vargas',
    phone:      '+505-8555-3333',
  })
  const cancerPatient = await Patient.findOneAndUpdate(
    { user_id: cancerUser._id },
    {
      user_id:            cancerUser._id,
      birth_date:         new Date('1962-11-08'),
      gender:             'male',
      blood_type:         'A-',
      allergies:          ['Sulfonamidas'],
      chronic_conditions: ['Cáncer de pulmón — Adenocarcinoma Estadio IV (metástasis ósea y hepática)', 'Hipertensión arterial crónica', 'EPOC leve'],
      emergency_contact:  { name: 'Lucía Vargas de Pinell', phone: '+505-8999-4444', relationship: 'Hija' },
      address:            'León, Nicaragua — Barrio San Felipe',
      assigned_doctor_id: doctor._id,
    },
    { upsert: true, new: true }
  )
  console.log(`✅  Paciente → ${cancerUser.email} (Cáncer pulmón Est. IV)`)

  // ── Expedientes oncológicos ─────────────────────────────────────────────
  const cancerRecords = [
    {
      visit_date: daysAgo(365),
      diagnosis: 'Derrame pleural derecho. Estudio citológico positivo para adenocarcinoma pulmonar. TAC: masa de 4.3 cm en lóbulo inferior derecho con adenopatías mediastinales y múltiples lesiones óseas líticas (columna, costillas, pelvis). Estadificación: T3N2M1 — Estadio IV.',
      prescriptions: [
        { drug: 'Carboplatino', dose: 'AUC 5 IV', duration: 'Ciclo 1/6 — cada 21 días' },
        { drug: 'Paclitaxel',   dose: '175 mg/m² IV', duration: 'Ciclo 1/6 — infusión 3h' },
        { drug: 'Ácido Zoledrónico', dose: '4 mg IV', duration: 'Cada 28 días — metástasis ósea' },
      ],
      notes: 'Se confirma diagnóstico con biopsia guiada por TAC + inmunohistoquímica. Se inicia QT pallativa con esquema Carboplatino + Paclitaxel (CarboTaxol). Se solicita: biometría hemática semanal, perfil hepático y función renal. Paciente consciente del pronóstico. Se refiere a Cuidados Paliativos.',
    },
    {
      visit_date: daysAgo(300),
      diagnosis: 'Control post-Ciclo 3. TAC de re-estadificación: respuesta parcial — reducción del 30% de masa tumoral primaria. Metástasis óseas estables. Dolor óseo controlado con analgesia.',
      prescriptions: [
        { drug: 'Carboplatino', dose: 'AUC 5 IV', duration: 'Ciclo 4/6 — cada 21 días' },
        { drug: 'Paclitaxel',   dose: '175 mg/m² IV', duration: 'Ciclo 4/6 — infusión 3h' },
        { drug: 'Sulfato de Morfina', dose: '10 mg/5ml VO', duration: 'Cada 6h PRN dolor ≥ 6/10 EVA' },
        { drug: 'Ondansetrón',  dose: '8 mg IV',  duration: '30 min antes de QT — antiemético' },
      ],
      notes: 'Paciente tolerando QT con neutropenia leve (ANC 1,200). Se administra G-CSF 48h post-QT. Dolor lumbar manejado con Morfina oral (4-6 episodios/día). EVA promedio 4/10. Continúa con Ácido Zoledrónico.',
    },
    {
      visit_date: daysAgo(180),
      diagnosis: 'Progresión de enfermedad post-Ciclo 6. TAC de control: aumento del 15% de masa tumoral. Nuevas metástasis hepáticas (2 lesiones segmento VI y VIII). Biopsia líquida: mutación KRAS G12C detectada.',
      prescriptions: [
        { drug: 'Sulfato de Morfina', dose: '30 mg/5ml VO', duration: 'Cada 4h dolor irruptivo' },
        { drug: 'Dexametasona',       dose: '8 mg/día VO',  duration: 'Taper de 7 días — edema' },
        { drug: 'Omeprazol',          dose: '20 mg/día VO', duration: 'Protección gástrica' },
      ],
      notes: 'Progresión a pesar de QT de primera línea. Se discute caso en Junta Oncológica. Paciente rechaza segunda línea por toxicidad. Se refiere a Cuidados Paliativos exclusivos. Se inicia protocolo de dolor oncológico. Plan de atención domiciliaria.',
    },
    {
      visit_date: daysAgo(90),
      diagnosis: 'Cuidados Paliativos. Síndrome de dolor óseo generalizado. Caquexia oncológica. Disnea progresiva por derrame pleural recidivante.',
      prescriptions: [
        { drug: 'Sulfato de Morfina',      dose: '60 mg/5ml VO',  duration: 'Cada 4h + dosis rescate 15mg c/2h PRN' },
        { drug: 'Furosemida',              dose: '40 mg/día VO',  duration: 'Edema en MMII' },
        { drug: 'Espironolactona',         dose: '25 mg/día VO',  duration: 'Ascitis leve' },
        { drug: 'Midazolam',              dose: '5 mg SL',       duration: 'Cada 6h PRN ansiedad/disnea' },
      ],
      notes: 'Paciente con ECOG 3 (pasa >50% en cama). Pérdida de peso 12 kg en 6 meses. Disnea al mínimo esfuerzo. Se realizó toracocentesis evacuadora (1,200 ml). Se discute con familia: plan de confort en domicilio. Se prescribe oxígeno domiciliario (O₂ 2L/min por cánula nasal).',
    },
    {
      visit_date: daysAgo(14),
      diagnosis: 'Derrame pleural derecho masivo. Insuficiencia respiratoria. Dolor óseo severo (EVA 8/10) a pesar de Morfina. Estado funcional ECOG 4.',
      prescriptions: [
        { drug: 'Sulfato de Morfina',      dose: '90 mg/5ml VO',  duration: 'Cada 3h + rescate 20mg c/1h PRN' },
        { drug: 'Fentanilo',            dose: '25 mcg/h',     duration: 'Parche transdérmico c/72h — dolor basal' },
        { drug: 'Haloperidol',          dose: '2 mg/día SL',  duration: 'Náuseas por opioides' },
        { drug: 'Lactulosa',            dose: '15 ml/día VO', duration: 'Estreñimiento por opioides' },
      ],
      notes: 'Se aumenta opioide mayor con parche de Fentanilo + Morfina de rescate. Se programa toracocentesis para mañana. Familia informada de mal pronóstico. Se elabora Directriz Anticipada. Plan: confort y control de síntomas.',
    },
  ]

  for (const r of cancerRecords) {
    await MedicalRecord.create({ patient_id: cancerPatient._id, doctor_id: doctor._id, ...r })
  }
  console.log(`✅  Expedientes oncológicos → ${cancerRecords.length} visitas`)

  // ── Lecturas de glucosa — cortas (no es prioridad) ──────────────────────
  const cancerGlucose = []
  for (let day = 14; day >= 0; day--) {
    const val = 95 + Math.round((Math.random() - 0.5) * 30)
    cancerGlucose.push({
      patient_id:   cancerPatient._id,
      value_mgdl:   val,
      context:      day % 2 === 0 ? 'fasting' : 'random',
      recorded_at:  new Date(daysAgo(day).setHours(8, 0, 0, 0)),
    })
  }
  await GlucoseReading.deleteMany({ patient_id: cancerPatient._id })
  await GlucoseReading.insertMany(cancerGlucose)

  // ── Signos vitales ──────────────────────────────────────────────────────
  const pid = cancerPatient._id
  const cancerVitals = [
    { patient_id: pid, heart_rate: 88, blood_pressure: { systolic: 138, diastolic: 82 }, temperature: 36.6, oxygen_saturation: 93, recorded_at: daysAgo(14), source: 'manual' },
    { patient_id: pid, heart_rate: 92, blood_pressure: { systolic: 145, diastolic: 88 }, temperature: 36.9, oxygen_saturation: 91, recorded_at: daysAgo(7),  source: 'manual' },
    { patient_id: pid, heart_rate: 96, blood_pressure: { systolic: 134, diastolic: 80 }, temperature: 37.0, oxygen_saturation: 90, recorded_at: daysAgo(1),  source: 'manual' },
  ]
  await VitalSign.deleteMany({ patient_id: cancerPatient._id })
  await VitalSign.insertMany(cancerVitals)
  console.log(`✅  Vitales oncológicos  → ${cancerVitals.length} registros`)

  // ── Citas ───────────────────────────────────────────────────────────────
  const cancerAppts = [
    { scheduled_at: daysAgo(180), status: 'done',      reason: 'Oncología — valoración post-QT',       notes: 'Progresión detectada. Se discute segunda línea.' },
    { scheduled_at: daysAgo(90),  status: 'done',      reason: 'Cuidados Paliativos — primera valoración', notes: 'ECOG 3. Plan de confort.' },
    { scheduled_at: daysAgo(-7),  status: 'confirmed',  reason: 'Cuidados Paliativos — control síntomas',  notes: 'Evaluar respuesta a Fentanilo.' },
    { scheduled_at: daysAgo(-21), status: 'pending',    reason: 'Toracocentesis programada',            notes: 'Derrame pleural derecho. Sala de procedimientos.' },
  ]
  await Appointment.deleteMany({ patient_id: cancerPatient._id })
  for (const a of cancerAppts) {
    await Appointment.create({ patient_id: cancerPatient._id, doctor_id: doctor._id, ...a })
  }
  console.log(`✅  Citas oncológicas   → ${cancerAppts.length}`)

  // ── Alertas ─────────────────────────────────────────────────────────────
  await Alert.deleteMany({ patient_id: cancerPatient._id })
  await Alert.insertMany([
    {
      patient_id:   cancerPatient._id,
      type:         'critical',
      message:      'Saturación O₂ 90% — paciente oncológico en cuidados paliativos. Requiere evaluación urgente.',
      is_read:      false,
      triggered_at: daysAgo(1),
    },
    {
      patient_id:   cancerPatient._id,
      type:         'warning',
      message:      'Dolor irruptivo frecuente (≥4 episodios/día) a pesar de parche de Fentanilo. Reevaluar analgesia.',
      is_read:      false,
      triggered_at: daysAgo(2),
    },
    {
      patient_id:   cancerPatient._id,
      type:         'info',
      message:      'Cita de Cuidados Paliativos confirmada en 7 días.',
      is_read:      false,
      triggered_at: daysAgo(-2),
    },
  ])
  console.log(`✅  Alertas oncológicas → 3`)

  // ── Resumen final ─────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════')
  console.log('  ✅  Seed completado exitosamente')
  console.log('══════════════════════════════════════════════')
  console.log('\n  Accesos de prueba:')
  console.log(`  🔑 Admin    → ${process.env.SEED_ADMIN_EMAIL}`)
  console.log(`  🔑 Doctor   → ${process.env.SEED_DOCTOR_EMAIL}`)
  console.log(`  🔑 Paciente → ${process.env.SEED_PATIENT_EMAIL}`)
  console.log(`  🔑 Paciente oncológico → ${process.env.SEED_CANCER_EMAIL}`)
  console.log('\n  (Las contraseñas están en tu backend/.env)\n')
}

main()
  .catch(err => { console.error('\n❌', err.message); process.exit(1) })
  .finally(() => mongoose.disconnect())
