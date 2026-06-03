import mongoose from 'mongoose'
const { Schema, model } = mongoose

// ── Users ─────────────────────────────────────────────────────────────────────
const userSchema = new Schema({
  email:              { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash:      { type: String, required: true },
  role:               { type: String, enum: ['patient', 'doctor', 'admin'], required: true },
  first_name:         { type: String, required: true, trim: true },
  last_name:          { type: String, required: true, trim: true },
  phone:              { type: String, trim: true },
  is_active:          { type: Boolean, default: true },
  last_login_at:      Date,
  refresh_token_hash: String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

userSchema.index({ role: 1 })

// ── Patients ──────────────────────────────────────────────────────────────────
const patientSchema = new Schema({
  user_id:            { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  birth_date:         Date,
  gender:             { type: String, enum: ['male', 'female', 'other'] },
  blood_type:         { type: String, enum: ['A+','A-','B+','B-','O+','O-','AB+','AB-'] },
  allergies:          [String],
  chronic_conditions: [String],
  emergency_contact:  {
    name:         String,
    phone:        String,
    relationship: String,
  },
  address:            String,
  assigned_doctor_id: { type: Schema.Types.ObjectId, ref: 'Doctor' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

patientSchema.index({ assigned_doctor_id: 1 })

// ── Doctors ───────────────────────────────────────────────────────────────────
const doctorSchema = new Schema({
  user_id:            { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialty:          { type: String, required: true },
  license_number:     { type: String, required: true, unique: true },
  available_schedule: [{ weekday: Number, from: String, to: String }],
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

doctorSchema.index({ specialty: 1 })

// ── Medical Records ───────────────────────────────────────────────────────────
const medicalRecordSchema = new Schema({
  patient_id:    { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor_id:     { type: Schema.Types.ObjectId, ref: 'Doctor',  required: true },
  visit_date:    { type: Date, default: Date.now },
  diagnosis:     { type: String, required: true },
  prescriptions: [{ drug: String, dose: String, duration: String }],
  notes:         String,
  attachments:   [String],
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

medicalRecordSchema.index({ patient_id: 1, visit_date: -1 })
medicalRecordSchema.index({ doctor_id: 1, created_at: -1 })

// ── Appointments ──────────────────────────────────────────────────────────────
const appointmentSchema = new Schema({
  patient_id:   { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor_id:    { type: Schema.Types.ObjectId, ref: 'Doctor',  required: true },
  scheduled_at: { type: Date, required: true },
  status:       { type: String, enum: ['pending','confirmed','done','cancelled'], default: 'pending' },
  reason:       String,
  notes:        String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

appointmentSchema.index({ patient_id: 1, scheduled_at: -1 })
appointmentSchema.index({ doctor_id:  1, scheduled_at:  1 })
appointmentSchema.index({ status: 1,   scheduled_at:  1 })

// ── Glucose Readings (historial de azúcar) ────────────────────────────────────
const glucoseSchema = new Schema({
  patient_id:   { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  value_mgdl:   { type: Number, required: true },          // mg/dL
  context:      { type: String, enum: ['fasting','post_meal','random','bedtime'], default: 'random' },
  notes:        String,
  recorded_at:  { type: Date, default: Date.now },
  source:       { type: String, enum: ['manual','device'], default: 'manual' },
})

glucoseSchema.index({ patient_id: 1, recorded_at: -1 })

// ── Vital Signs ───────────────────────────────────────────────────────────────
const vitalSignSchema = new Schema({
  patient_id:        { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  heart_rate:        Number,
  blood_pressure:    { systolic: Number, diastolic: Number },
  temperature:       Number,
  oxygen_saturation: Number,
  recorded_at:       { type: Date, default: Date.now },
  source:            { type: String, enum: ['manual','iot'], default: 'manual' },
})

vitalSignSchema.index({ patient_id: 1, recorded_at: -1 })

// ── Alerts ────────────────────────────────────────────────────────────────────
const alertSchema = new Schema({
  patient_id:   { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  type:         { type: String, enum: ['critical','warning','info'], required: true },
  message:      { type: String, required: true },
  is_read:      { type: Boolean, default: false },
  triggered_at: { type: Date, default: Date.now },
})

alertSchema.index({ patient_id: 1, is_read: 1 })
alertSchema.index({ triggered_at: 1 }, { expireAfterSeconds: 180 * 86400 }) // TTL 180d

// ── Audit Logs ────────────────────────────────────────────────────────────────
const auditLogSchema = new Schema({
  user_id:    { type: Schema.Types.ObjectId, ref: 'User' },
  action:     String,
  resource:   String,
  ip:         String,
  created_at: { type: Date, default: Date.now },
})

auditLogSchema.index({ user_id: 1, created_at: -1 })
auditLogSchema.index({ created_at: 1 }, { expireAfterSeconds: 90 * 86400 }) // TTL 90d

// ── Exports ───────────────────────────────────────────────────────────────────
export const User          = model('User',          userSchema)
export const Patient       = model('Patient',       patientSchema)
export const Doctor        = model('Doctor',        doctorSchema)
export const MedicalRecord = model('MedicalRecord', medicalRecordSchema)
export const Appointment   = model('Appointment',   appointmentSchema)
export const GlucoseReading= model('GlucoseReading',glucoseSchema)
export const VitalSign     = model('VitalSign',     vitalSignSchema)
export const Alert         = model('Alert',         alertSchema)
export const AuditLog      = model('AuditLog',      auditLogSchema)
