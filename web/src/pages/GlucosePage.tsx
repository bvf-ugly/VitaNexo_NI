import { useEffect, useState, useCallback } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import api, { getMyPatientId } from '../services/api'

const CONTEXT_LABELS: Record<string, string> = {
  fasting:   'Ayunas',
  post_meal: 'Postprandial',
  random:    'Aleatoria',
  bedtime:   'Antes de dormir',
}

const STATUS_BADGE: Record<string, string> = {
  low:      'bg-blue-100 text-blue-700',
  normal:   'bg-green-100 text-green-700',
  elevated: 'bg-yellow-100 text-yellow-700',
  high:     'bg-red-100 text-red-700',
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

  // Carga stats + lecturas para gráfica y tabla
  const loadData = useCallback(async (pid: string) => {
    try {
      const { data } = await api.get(`/glucose/patient/${pid}/stats`, {
        params: { chart_days: 60, stats_days: 30 },
      })
      setStats(data)

      // readings ya viene ASC del backend — directo a recharts
      const readings: any[] = data.readings || []
      setChartData(readings.map(r => ({
        fecha:   new Date(r.recorded_at).toLocaleDateString('es-NI', { month: 'short', day: 'numeric' }),
        glucosa: r.value_mgdl,
      })))

      // Tabla: orden DESC (más reciente primero), máx 15 filas
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
      setMsg({ text: `✅ Guardado — ${data.reading.value_mgdl} mg/dL · ${label}`, ok: true })
      setForm({ value_mgdl: '', context: 'fasting', notes: '' })
      // Recargar datos completos para reflejar en gráfica y tabla
      await loadData(patientId)
    } catch (err: any) {
      setMsg({ text: '❌ ' + (err.response?.data?.error || 'Error al guardar'), ok: false })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3 text-slate-400">
        <span className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full vn-spin" />
        Cargando historial...
      </div>
    )
  }

  return (
    <div className="p-5 md:p-8 max-w-5xl">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-1">🩸 Historial de Glucosa</h2>
      <p className="text-slate-400 dark:text-slate-500 text-sm mb-6">
        Monitoreo de glucemia — {stats?.count ? `${stats.count} lecturas en el período` : 'Sin lecturas aún'}
      </p>

      {/* Tarjetas de stats */}
      {stats && stats.count > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Promedio',  value: `${stats.avg_mgdl} mg/dL`, icon: '📊', color: 'border-sky-200   dark:border-sky-800   bg-sky-50   dark:bg-sky-950' },
            { label: 'Mínimo',   value: `${stats.min_mgdl} mg/dL`, icon: '⬇️', color: 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950' },
            { label: 'Máximo',   value: `${stats.max_mgdl} mg/dL`, icon: '⬆️', color: 'border-amber-200  dark:border-amber-800  bg-amber-50  dark:bg-amber-950' },
            { label: 'En rango', value: `${stats.in_range_pct}%`,  icon: '✅', color: 'border-green-200  dark:border-green-800  bg-green-50  dark:bg-green-950' },
          ].map(s => (
            <div key={s.label} className={`border rounded-xl p-4 ${s.color}`}>
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="font-bold text-slate-800 dark:text-slate-100 text-lg">{s.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label} — 30 días</div>
            </div>
          ))}
        </div>
      )}

      {/* Gráfica */}
      {chartData.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Tendencia ({chartData.length} lecturas)
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="fecha" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis domain={[40, 260]} tick={{ fontSize: 11 }} unit=" mg/dL" />
              <Tooltip formatter={(v: any) => [`${v} mg/dL`, 'Glucosa']} />
              <ReferenceLine y={70}  stroke="#3b82f6" strokeDasharray="4 4"
                label={{ value: 'Hipo', position: 'insideTopRight', fontSize: 10, fill: '#3b82f6' }} />
              <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="4 4"
                label={{ value: 'Normal', position: 'insideTopRight', fontSize: 10, fill: '#22c55e' }} />
              <ReferenceLine y={140} stroke="#f59e0b" strokeDasharray="4 4"
                label={{ value: 'Elevada', position: 'insideTopRight', fontSize: 10, fill: '#f59e0b' }} />
              <Line
                type="monotone" dataKey="glucosa"
                stroke="#0ea5e9" strokeWidth={2}
                dot={{ r: 3, fill: '#0ea5e9' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-8 mb-6 text-center text-slate-400">
          Sin lecturas registradas aún. Agrega la primera abajo.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabla */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Últimas lecturas</h3>
            <span className="text-xs text-slate-400">{tableRows.length} registros</span>
          </div>
          <div className="overflow-auto max-h-72">
            {tableRows.length === 0 ? (
              <p className="p-5 text-slate-400 text-sm">Sin lecturas registradas.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Fecha</th>
                    <th className="px-4 py-2 text-left">mg/dL</th>
                    <th className="px-4 py-2 text-left">Contexto</th>
                    <th className="px-4 py-2 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tableRows.map((r, i) => {
                    const status = classify(r.value_mgdl, r.context)
                    return (
                      <tr key={r._id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-2 text-slate-500 whitespace-nowrap">
                          {new Date(r.recorded_at).toLocaleDateString('es-NI', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 py-2 font-bold text-slate-800 dark:text-slate-100">{r.value_mgdl}</td>
                        <td className="px-4 py-2 text-slate-500">{CONTEXT_LABELS[r.context] || r.context}</td>
                        <td className="px-4 py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[status]}`}>
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

        {/* Formulario */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4">Registrar nueva lectura</h3>
          <form onSubmit={submitReading} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Glucosa (mg/dL)</label>
              <input
                type="number" min="20" max="600" required
                value={form.value_mgdl}
                onChange={e => setForm(f => ({ ...f, value_mgdl: e.target.value }))}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="ej. 95"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Contexto</label>
              <select
                value={form.context}
                onChange={e => setForm(f => ({ ...f, context: e.target.value }))}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="fasting">Ayunas</option>
                <option value="post_meal">Postprandial (2h después de comer)</option>
                <option value="random">Aleatoria</option>
                <option value="bedtime">Antes de dormir</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Notas (opcional)</label>
              <input
                type="text" value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="ej. Después del desayuno"
              />
            </div>

            {msg && (
              <div className={`text-sm px-3 py-2 rounded-lg border ${
                msg.ok
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {msg.text}
              </div>
            )}

            <button
              type="submit" disabled={saving}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg py-2.5 text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full vn-spin" />}
              {saving ? 'Guardando...' : 'Guardar lectura'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}