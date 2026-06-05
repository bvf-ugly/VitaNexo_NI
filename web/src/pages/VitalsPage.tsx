import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import api, { getMyPatientId } from '../services/api.ts'
import { Activity, Heart, Thermometer, Wind, Droplets } from 'lucide-react'

const TABS = ['Presion', 'Pulso', 'O2', 'Temperatura'] as const
type Tab = typeof TABS[number]

function classify(sys: number, dia: number) {
  if (sys > 140 || dia > 90) return { label: 'Elevada', cls: 'badge-danger' }
  if (sys > 130 || dia > 85) return { label: 'Elevada-normal', cls: 'badge-warning' }
  return { label: 'Normal', cls: 'badge-success' }
}

const DEMO_BP = Array.from({ length: 10 }, (_, i) => ({
  fecha: `May ${22 + i}`,
  sys: 130 + Math.round(Math.random() * 16 - 4),
  dia: 82  + Math.round(Math.random() * 10 - 3),
}))
const DEMO_HR = Array.from({ length: 10 }, (_, i) => ({
  fecha: `May ${22 + i}`,
  val: 72 + Math.round(Math.random() * 14 - 4),
}))
const DEMO_O2 = Array.from({ length: 10 }, (_, i) => ({
  fecha: `May ${22 + i}`,
  val: 96 + Math.round(Math.random() * 3),
}))
const DEMO_TEMP = Array.from({ length: 10 }, (_, i) => ({
  fecha: `May ${22 + i}`,
  val: parseFloat((36.4 + Math.random() * 0.8).toFixed(1)),
}))

export default function VitalsPage() {
  const [tab, setTab] = useState<Tab>('Presion')
  const [form, setForm] = useState({ sys: '', dia: '', hr: '', temp: '', o2: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [patientId, setPatientId] = useState<string | null>(null)

  const latest = DEMO_BP[DEMO_BP.length - 1]
  const latestHR = DEMO_HR[DEMO_HR.length - 1].val
  const latestO2 = DEMO_O2[DEMO_O2.length - 1].val
  const latestTemp = DEMO_TEMP[DEMO_TEMP.length - 1].val
  const bpStatus = classify(latest.sys, latest.dia)

  useEffect(() => {
    getMyPatientId().then(pid => {
      if (pid) setPatientId(pid)
    })
  }, [])

  async function submitVitals(e: React.FormEvent) {
    e.preventDefault()
    if (!patientId) return
    setSaving(true); setMsg(null)
    try {
      await api.post('/vital-signs', {
        patient_id: patientId,
        blood_pressure: form.sys && form.dia
          ? { systolic: Number(form.sys), diastolic: Number(form.dia) }
          : undefined,
        heart_rate: form.hr ? Number(form.hr) : undefined,
        temperature: form.temp ? Number(form.temp) : undefined,
        oxygen_saturation: form.o2 ? Number(form.o2) : undefined,
      })
      setMsg({ text: 'Signos vitales guardados', ok: true })
      setForm({ sys: '', dia: '', hr: '', temp: '', o2: '' })
    } catch (err: any) {
      setMsg({ text: err.response?.data?.error || 'Error al guardar', ok: false })
    } finally { setSaving(false) }
  }

  return (
      <div className="w-full max-w-7xl animate-fade-in">
      {/* Header — Persistent */}
      <div className="page-header">
        <h1 className="page-title">
          <span className="inline-flex items-center gap-2">
            <Activity size={24} className="text-primary-500" aria-hidden />
            Signos Vitales
          </span>
        </h1>
        <p className="page-subtitle">
          Monitoreo continuo de presion, pulso, temperatura y saturacion
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-in">
        {[
          { label: 'Presion arterial', value: `${latest.sys}/${latest.dia}`, unit: 'mmHg', icon: Droplets, status: bpStatus },
          { label: 'Pulso', value: String(latestHR), unit: 'bpm', icon: Heart, status: { label: 'Normal', cls: 'badge-success' } },
          { label: 'Saturacion O2', value: String(latestO2), unit: '%', icon: Wind, status: { label: 'Normal', cls: 'badge-success' } },
          { label: 'Temperatura', value: String(latestTemp), unit: 'C', icon: Thermometer, status: { label: 'Normal', cls: 'badge-success' } },
        ].map((c, i) => (
          <div key={c.label} className="stat-card" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-primary-100 dark:bg-primary-900/30">
              <c.icon size={20} className="text-primary-600 dark:text-primary-400" aria-hidden />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{c.label}</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100 font-heading">
              {c.value} <span className="text-xs font-normal text-slate-500">{c.unit}</span>
            </p>
            <span className={`badge ${c.status.cls} mt-2`}>
              {c.status.label}
            </span>
          </div>
        ))}
      </div>

      {/* Chart tabs */}
      <div className="card mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex gap-1 border-b border-slate-100/80 dark:border-slate-800/80 mb-4 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm border-b-2 whitespace-nowrap transition-colors duration-200 font-medium
                ${tab === t
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >{t}</button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={220}>
          {tab === 'Presion' ? (
            <LineChart data={DEMO_BP} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3f1ff" />
              <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
              <YAxis domain={[60, 170]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any, n: string) => [`${v} mmHg`, n === 'sys' ? 'Sistolica' : 'Diastolica']} />
              <ReferenceLine y={140} stroke="#D32F2F66" strokeDasharray="4 4" label={{ value: '140', fontSize: 9, fill: '#D32F2F', position: 'right' }} />
              <Line type="monotone" dataKey="sys" stroke="#D32F2F" strokeWidth={2} dot={{ r: 3 }} name="sys" />
              <Line type="monotone" dataKey="dia" stroke="#FF9800" strokeWidth={2} dot={{ r: 3 }} name="dia" />
            </LineChart>
          ) : (
            <LineChart data={tab === 'Pulso' ? DEMO_HR : tab === 'O2' ? DEMO_O2 : DEMO_TEMP} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3f1ff" />
              <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
              <YAxis domain={tab === 'Temperatura' ? [35.5, 38.5] : tab === 'O2' ? [93, 100] : [50, 110]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => [`${v}`, tab]} />
              <Line type="monotone" dataKey="val" stroke="#5a82a6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Register form */}
      <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4 font-heading">Registrar signos vitales</h3>
        <form onSubmit={submitVitals}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {[
              { key: 'sys',  label: 'Sistolica (mmHg)', placeholder: '120' },
              { key: 'dia',  label: 'Diastolica (mmHg)', placeholder: '80'  },
              { key: 'hr',   label: 'Pulso (bpm)',       placeholder: '72'  },
              { key: 'temp', label: 'Temperatura (C)',   placeholder: '36.6', step: '0.1' },
              { key: 'o2',   label: 'Saturacion O2 (%)', placeholder: '98' },
            ].map(f => (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                <input
                  type="number" step={f.step || '1'}
                  value={(form as any)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="input"
                />
              </div>
            ))}
          </div>

          {msg && (
            <div className={`text-sm px-4 py-3 rounded-xl border mb-4 ${
              msg.ok
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/40'
            }`} role="alert">
              {msg.text}
            </div>
          )}

          <button
            type="submit" disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <span>Registrar</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
