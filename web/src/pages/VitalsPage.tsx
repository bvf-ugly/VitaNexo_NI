import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import api, { getMyPatientId } from '../services/api.ts'

const TABS = ['Presión', 'Pulso', 'O₂', 'Temperatura'] as const
type Tab = typeof TABS[number]

function classify(sys: number, dia: number) {
  if (sys > 140 || dia > 90) return { label: 'Elevada', cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' }
  if (sys > 130 || dia > 85) return { label: 'Elevada-normal', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' }
  return { label: 'Normal', cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' }
}

// Simulated data since VitalSign endpoint may be empty
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
  const [tab, setTab]     = useState<Tab>('Presión')
  const [form, setForm]   = useState({ sys: '', dia: '', hr: '', temp: '', o2: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]     = useState<{ text: string; ok: boolean } | null>(null)
  const [patientId, setPatientId] = useState<string | null>(null)

  // Latest vitals (demo)
  const latest = DEMO_BP[DEMO_BP.length - 1]
  const latestHR   = DEMO_HR[DEMO_HR.length - 1].val
  const latestO2   = DEMO_O2[DEMO_O2.length - 1].val
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
        heart_rate:        form.hr   ? Number(form.hr)   : undefined,
        temperature:       form.temp ? Number(form.temp) : undefined,
        oxygen_saturation: form.o2   ? Number(form.o2)   : undefined,
      })
      setMsg({ text: '✅ Signos vitales guardados', ok: true })
      setForm({ sys: '', dia: '', hr: '', temp: '', o2: '' })
    } catch (err: any) {
      setMsg({ text: '❌ ' + (err.response?.data?.error || 'Error al guardar'), ok: false })
    } finally { setSaving(false) }
  }

  const card = 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5'

  return (
    <div className="p-5 md:p-8 max-w-5xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">💓 Signos Vitales</h2>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Monitoreo continuo de presión, pulso, temperatura y saturación</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Presión arterial', value: `${latest.sys}/${latest.dia}`, unit: 'mmHg', color: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950', status: bpStatus },
          { label: 'Pulso',            value: String(latestHR),    unit: 'bpm',  color: 'border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950',  status: { label: 'Normal', cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' } },
          { label: 'Saturación O₂',   value: String(latestO2),     unit: '%',    color: 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950', status: { label: 'Normal', cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' } },
          { label: 'Temperatura',      value: String(latestTemp),   unit: '°C',   color: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950',   status: { label: 'Normal', cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' } },
        ].map(c => (
          <div key={c.label} className={`rounded-xl border p-4 ${c.color}`}>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{c.label}</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {c.value} <span className="text-xs font-normal text-slate-500">{c.unit}</span>
            </p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${c.status.cls}`}>
              {c.status.label}
            </span>
          </div>
        ))}
      </div>

      {/* Chart tabs */}
      <div className={`${card} mb-6`}>
        <div className="flex gap-1 border-b border-slate-100 dark:border-slate-800 mb-4 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm border-b-2 whitespace-nowrap transition-colors
                ${tab === t
                  ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-medium'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >{t}</button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={220}>
          {tab === 'Presión' ? (
            <LineChart data={DEMO_BP} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
              <YAxis domain={[60, 170]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any, n: string) => [`${v} mmHg`, n === 'sys' ? 'Sistólica' : 'Diastólica']} />
              <ReferenceLine y={140} stroke="#ef444466" strokeDasharray="4 4" label={{ value: '140', fontSize: 9, fill: '#ef4444', position: 'right' }} />
              <Line type="monotone" dataKey="sys" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="sys" />
              <Line type="monotone" dataKey="dia" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="dia" />
            </LineChart>
          ) : (
            <LineChart data={tab === 'Pulso' ? DEMO_HR : tab === 'O₂' ? DEMO_O2 : DEMO_TEMP} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
              <YAxis domain={tab === 'Temperatura' ? [35.5, 38.5] : tab === 'O₂' ? [93, 100] : [50, 110]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => [`${v}`, tab]} />
              <Line type="monotone" dataKey="val" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Register form */}
      <div className={card}>
        <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4 text-sm">Registrar signos vitales</h3>
        <form onSubmit={submitVitals}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {[
              { key: 'sys',  label: 'Sistólica (mmHg)', placeholder: '120' },
              { key: 'dia',  label: 'Diastólica (mmHg)', placeholder: '80'  },
              { key: 'hr',   label: 'Pulso (bpm)',       placeholder: '72'  },
              { key: 'temp', label: 'Temperatura (°C)',  placeholder: '36.6', step: '0.1' },
              { key: 'o2',   label: 'Saturación O₂ (%)', placeholder: '98' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{f.label}</label>
                <input
                  type="number" step={f.step || '1'}
                  value={(form as any)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2
                             text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
                             focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            ))}
          </div>

          {msg && (
            <p className={`text-sm px-3 py-2 rounded-lg border mb-3
              ${msg.ok
                ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
              }`}>
              {msg.text}
            </p>
          )}

          <button
            type="submit" disabled={saving}
            className="bg-sky-500 hover:bg-sky-600 text-white rounded-lg px-5 py-2
                       text-sm font-medium transition disabled:opacity-50
                       flex items-center gap-2"
          >
            {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full vn-spin" />}
            {saving ? 'Guardando...' : 'Registrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
