import { useEffect, useState } from 'react'
import { Plus, Loader2, Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../services/api'
import Badge from '../components/ui/Badge'

const CONTEXTS = [
  { k: 'fasting', label: 'Ayunas' },
  { k: 'post_meal', label: 'Postprandial' },
  { k: 'random', label: 'Aleatoria' },
  { k: 'bedtime', label: 'Antes de dormir' },
]

function classify(v: number, ctx: string) {
  const r: Record<string, [number, number, number]> = {
    fasting: [70, 100, 126], post_meal: [70, 140, 200], random: [70, 140, 200], bedtime: [80, 120, 180],
  }
  const [lo, no, hi] = r[ctx] || r.random
  if (v < lo) return { status: 'Bajo', variant: 'danger' as const }
  if (v <= no) return { status: 'Normal', variant: 'success' as const }
  if (v <= hi) return { status: 'Elevado', variant: 'warning' as const }
  return { status: 'Alto', variant: 'danger' as const }
}

export default function Glucose() {
  const [patientId, setPatientId] = useState<string | null>(null)
  const [readings, setReadings] = useState<any[]>([])
  const [value, setValue] = useState('')
  const [context, setContext] = useState('fasting')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/patients').then(({ data }) => {
      if (!data.length) { setLoading(false); return }
      const pid = data[0]._id
      setPatientId(pid)
      loadReadings(pid)
    })
  }, [])

  function loadReadings(pid: string) {
    api.get(`/glucose/patient/${pid}`).then(({ data }) => {
      setReadings(data)
      setLoading(false)
    })
  }

  async function submit() {
    if (!patientId || !value) return
    const num = Number(value)
    if (isNaN(num) || num < 20 || num > 600) return
    setSaving(true)
    try {
      await api.post('/glucose', { patient_id: patientId, value_mgdl: num, context })
      setValue('')
      loadReadings(patientId)
    } catch {} finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
    </div>
  )

  const sorted = [...readings].reverse()
  const chartData = sorted.map((r) => ({
    date: new Date(r.recorded_at).toLocaleDateString('es-NI', { month: 'short', day: 'numeric' }),
    value: r.value_mgdl,
  }))

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
          <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Control de Glucosa</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500">Registra y monitorea tus niveles de azúcar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Nueva lectura</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Valor (mg/dL)</label>
              <input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="ej. 95"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-lg font-bold focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Contexto</label>
              <div className="grid grid-cols-2 gap-2">
                {CONTEXTS.map((c) => (
                  <button key={c.k} onClick={() => setContext(c.k)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition ${
                      context === c.k
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-500'
                    }`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={submit} disabled={saving || !value}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              {saving ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Historial</h3>
            <span className="text-xs text-slate-400 dark:text-slate-500">{readings.length} lecturas</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} fill="url(#gGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-slate-400 dark:text-slate-500 text-sm">Sin lecturas registradas</div>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 lg:p-5 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">Todas las lecturas</h3>
        </div>
        {sorted.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700">
                  <th className="p-4 pb-3 font-medium">Valor</th>
                  <th className="p-4 pb-3 font-medium hidden sm:table-cell">Contexto</th>
                  <th className="p-4 pb-3 font-medium">Estado</th>
                  <th className="p-4 pb-3 font-medium hidden md:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r: any) => {
                  const { status, variant } = classify(r.value_mgdl, r.context)
                  return (
                    <tr key={r._id} className="border-b border-slate-50 dark:border-slate-800 last:border-0">
                      <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">{r.value_mgdl} <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">mg/dL</span></td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 hidden sm:table-cell">{CONTEXTS.find((c) => c.k === r.context)?.label || r.context}</td>
                      <td className="p-4"><Badge variant={variant}>{status}</Badge></td>
                      <td className="p-4 text-slate-400 dark:text-slate-500 hidden md:table-cell whitespace-nowrap">
                        {new Date(r.recorded_at).toLocaleDateString('es-NI', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-sm text-slate-400 dark:text-slate-500">No hay lecturas registradas aún.</div>
        )}
      </div>
    </div>
  )
}
