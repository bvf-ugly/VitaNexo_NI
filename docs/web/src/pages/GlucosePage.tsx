import { useEffect, useState, useCallback } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import api, { getMyPatientId } from '../services/api'
import { Droplets, TrendingDown, TrendingUp, BarChart3, Plus } from 'lucide-react'

const CONTEXT_LABELS: Record<string, string> = {
  fasting:   'Ayunas',
  post_meal: 'Postprandial',
  random:    'Aleatoria',
  bedtime:   'Antes de dormir',
}

const STATUS_BADGE: Record<string, string> = {
  low:      'badge-info',
  normal:   'badge-success',
  elevated: 'badge-warning',
  high:     'badge-danger',
}
const STATUS_LABEL: Record<string, string> = {
  low: 'Hipoglucemia', normal: 'Normal', elevated: 'Elevada', high: 'Alta',
}

function classify(v: number, ctx: string) {
  const ranges: Record<string, [number, number, number]> = {
    fasting:   [70, 100, 126],
    post_meal: [70, 140, 200],
    random:    [70, 140, 200],
    bedtime:   [80, 120, 180],
  }
  const [low, norm, high] = ranges[ctx] || ranges.random
  if (v < low)   return 'low'
  if (v <= norm) return 'normal'
  if (v <= high) return 'elevated'
  return 'high'
}

export default function GlucosePage() {
  const [patientId, setPatientId] = useState<string | null>(null)
  const [stats,     setStats]     = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [tableRows, setTableRows] = useState<any[]>([])
  const [form,      setForm]      = useState({ value_mgdl: '', context: 'fasting', notes: '' })
  const [saving,    setSaving]    = useState(false)
  const [msg,       setMsg]       = useState<{ text: string; ok: boolean } | null>(null)
  const [loading,   setLoading]   = useState(true)

  const loadData = useCallback(async (pid: string) => {
    try {
      const { data } = await api.get(`/glucose/patient/${pid}/stats`, {
        params: { chart_days: 60, stats_days: 30 },
      })
      setStats(data)
      const readings: any[] = data.readings || []
      setChartData(readings.map(r => ({
        fecha:   new Date(r.recorded_at).toLocaleDateString('es-NI', { month: 'short', day: 'numeric' }),
        glucosa: r.value_mgdl,
      })))
      setTableRows([...readings].reverse().slice(0, 15))
    } catch (err) {
      console.error('loadData error', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getMyPatientId().then(pid => {
      if (!pid) { setLoading(false); return }
      setPatientId(pid)
      loadData(pid)
    }).catch(() => setLoading(false))
  }, [loadData])

  async function submitReading(e: React.FormEvent) {
    e.preventDefault()
    if (!patientId || !form.value_mgdl) return
    setSaving(true); setMsg(null)
    try {
      const { data } = await api.post('/glucose', {
        patient_id: patientId,
        value_mgdl: Number(form.value_mgdl),
        context:    form.context,
        notes:      form.notes || undefined,
      })
      const { label } = data.classification
      setMsg({ text: `Guardado - ${data.reading.value_mgdl} mg/dL - ${label}`, ok: true })
      setForm({ value_mgdl: '', context: 'fasting', notes: '' })
      await loadData(patientId)
    } catch (err: any) {
      setMsg({ text: err.response?.data?.error || 'Error al guardar', ok: false })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
          <span>Cargando historial...</span>
        </div>
      </div>
    )
  }

  return (
      <div className="w-full max-w-7xl animate-fade-in">
      {/* Header — Persistent */}
      <div className="page-header">
        <h1 className="page-title">
          <span className="inline-flex items-center gap-2">
            <Droplets size={24} className="text-primary-500" aria-hidden />
            Historial de Glucosa
          </span>
        </h1>
        <p className="page-subtitle">
          Monitoreo de glucemia &mdash; {stats?.count ? `${stats.count} lecturas en el periodo` : 'Sin lecturas aun'}
        </p>
      </div>

      {/* Stats cards */}
      {stats && stats.count > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 animate-fade-in">
          {[
            { label: 'Promedio',  value: `${stats.avg_mgdl} mg/dL`, icon: BarChart3, color: 'primary' },
            { label: 'Minimo',   value: `${stats.min_mgdl} mg/dL`, icon: TrendingDown, color: 'blue' },
            { label: 'Maximo',   value: `${stats.max_mgdl} mg/dL`, icon: TrendingUp, color: 'amber' },
            { label: 'En rango', value: `${stats.in_range_pct}%`,  icon: TrendingUp, color: 'emerald' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-${s.color}-100 dark:bg-${s.color}-900/30`}>
                <s.icon size={20} className={`text-${s.color}-600 dark:text-${s.color}-400`} aria-hidden />
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-100 text-lg font-heading">{s.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label} &mdash; 30 dias</div>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="card mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4 font-heading">
            Tendencia ({chartData.length} lecturas)
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3f1ff" />
              <XAxis dataKey="fecha" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis domain={[40, 260]} tick={{ fontSize: 11 }} unit=" mg/dL" />
              <Tooltip formatter={(v: any) => [`${v} mg/dL`, 'Glucosa']} />
              <ReferenceLine y={70}  stroke="#5a82a6" strokeDasharray="4 4"
                label={{ value: 'Hipo', position: 'insideTopRight', fontSize: 10, fill: '#5a82a6' }} />
              <ReferenceLine y={100} stroke="#4CAF50" strokeDasharray="4 4"
                label={{ value: 'Normal', position: 'insideTopRight', fontSize: 10, fill: '#4CAF50' }} />
              <ReferenceLine y={140} stroke="#FF9800" strokeDasharray="4 4"
                label={{ value: 'Elevada', position: 'insideTopRight', fontSize: 10, fill: '#FF9800' }} />
              <Line
                type="monotone" dataKey="glucosa"
                stroke="#5a82a6" strokeWidth={2}
                dot={{ r: 3, fill: '#5a82a6' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="card mb-6 text-center py-12">
          <Droplets size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" aria-hidden />
          <p className="text-slate-400 dark:text-slate-500">Sin lecturas registradas aun. Agrega la primera abajo.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table */}
        <div className="card overflow-hidden animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 font-heading">Ultimas lecturas</h3>
            <span className="badge-primary">{tableRows.length} registros</span>
          </div>
          <div className="overflow-auto max-h-72">
            {tableRows.length === 0 ? (
              <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-8">Sin lecturas registradas.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Fecha</th>
                    <th className="px-4 py-2 text-left font-medium">mg/dL</th>
                    <th className="px-4 py-2 text-left font-medium">Contexto</th>
                    <th className="px-4 py-2 text-left font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 dark:divide-slate-700/50">
                  {tableRows.map((r, i) => {
                    const status = classify(r.value_mgdl, r.context)
                    return (
                      <tr key={r._id || i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-150">
                        <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(r.recorded_at).toLocaleDateString('es-NI', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-100">{r.value_mgdl}</td>
                        <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{CONTEXT_LABELS[r.context] || r.context}</td>
                        <td className="px-4 py-2.5">
                          <span className={`badge ${STATUS_BADGE[status]}`}>
                            {STATUS_LABEL[status]}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4 font-heading">Registrar nueva lectura</h3>
          <form onSubmit={submitReading} className="space-y-4">
            <div>
              <label className="label">Glucosa (mg/dL)</label>
              <input
                type="number" min="20" max="600" required
                value={form.value_mgdl}
                onChange={e => setForm(f => ({ ...f, value_mgdl: e.target.value }))}
                className="input"
                placeholder="ej. 95"
              />
            </div>
            <div>
              <label className="label">Contexto</label>
              <select
                value={form.context}
                onChange={e => setForm(f => ({ ...f, context: e.target.value }))}
                className="input"
              >
                <option value="fasting">Ayunas</option>
                <option value="post_meal">Postprandial (2h despues de comer)</option>
                <option value="random">Aleatoria</option>
                <option value="bedtime">Antes de dormir</option>
              </select>
            </div>
            <div>
              <label className="label">Notas (opcional)</label>
              <input
                type="text" value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="input"
                placeholder="ej. Despues del desayuno"
              />
            </div>

            {msg && (
              <div className={`text-sm px-4 py-3 rounded-xl border ${
                msg.ok
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/40'
              }`} role="alert">
                {msg.text}
              </div>
            )}

            <button
              type="submit" disabled={saving}
              className="btn-primary w-full"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Plus size={18} aria-hidden />
                  <span>Guardar lectura</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
