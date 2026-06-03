import { useEffect, useState } from 'react'
import {
  Activity, Droplets, AlertTriangle, TrendingUp, Calendar,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../services/api'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'

const contextLabels: Record<string, string> = {
  fasting: 'Ayunas', post_meal: 'Postprandial', random: 'Aleatoria', bedtime: 'Antes de dormir',
}

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [readings, setReadings] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data: patients } = await api.get('/patients')
        if (!patients.length) { setLoading(false); return }
        const pid = patients[0]._id
        const [statsRes, readingsRes, alertsRes, apptsRes] = await Promise.all([
          api.get(`/glucose/patient/${pid}/stats`),
          api.get(`/glucose/patient/${pid}`),
          api.get(`/alerts/patient/${pid}`),
          api.get('/appointments'),
        ])
        setStats(statsRes.data)
        setReadings(readingsRes.data.slice(0, 20).reverse())
        setAlerts(alertsRes.data.filter((a: any) => !a.is_read).slice(0, 5))
        setAppointments(apptsRes.data.filter((a: any) => a.status !== 'cancelled').slice(0, 3))
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
    </div>
  )

  const chartData = readings.map((r) => ({
    date: new Date(r.recorded_at).toLocaleDateString('es-NI', { month: 'short', day: 'numeric' }),
    value: r.value_mgdl,
  }))

  const nextAppt = appointments.length > 0 ? appointments[0] : null
  const alertCount = alerts.length

  function classifyReading(v: number): { status: string; variant: 'success' | 'warning' | 'danger' } {
    if (v < 70) return { status: 'Bajo', variant: 'danger' }
    if (v <= 140) return { status: 'Normal', variant: 'success' }
    if (v <= 180) return { status: 'Elevado', variant: 'warning' }
    return { status: 'Alto', variant: 'danger' }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Promedio glucosa" value={stats?.avg_mgdl ?? '—'} unit="mg/dL" icon={Droplets} color="text-primary-600 dark:text-primary-400" bgColor="bg-primary-50 dark:bg-primary-900/30" />
        <StatCard label="En rango" value={stats?.in_range_pct ?? '—'} unit="%" icon={Activity} color="text-success" bgColor="bg-success-light dark:bg-green-900/30" />
        <StatCard label="Alertas activas" value={alertCount} icon={AlertTriangle} color="text-warning" bgColor="bg-warning-light dark:bg-amber-900/30" />
        <StatCard label="Lecturas totales" value={stats?.count ?? 0} icon={TrendingUp} color="text-purple-600 dark:text-purple-400" bgColor="bg-purple-50 dark:bg-purple-900/30" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-4 lg:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Tendencia de glucosa</h3>
            <span className="text-xs text-slate-400 dark:text-slate-500">Últimos {readings.length} registros</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="glucoseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[60, 200]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', backgroundColor: 'rgba(255,255,255,0.95)' }} />
                <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} fill="url(#glucoseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-slate-400 dark:text-slate-600 text-sm">No hay datos de glucosa aún</div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-4 lg:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Alertas</h3>
              {alertCount > 0 && <span className="text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold px-2 py-0.5 rounded-full">{alertCount}</span>}
            </div>
            {alerts.length > 0 ? alerts.slice(0, 3).map((a: any) => (
              <div key={a._id} className="flex items-start gap-3 py-2.5 border-b border-slate-50 dark:border-slate-700 last:border-0">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${a.type === 'critical' ? 'bg-red-500' : a.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                <div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{a.message}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {new Date(a.triggered_at).toLocaleDateString('es-NI', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )) : <p className="text-sm text-slate-400 dark:text-slate-500 py-2">No hay alertas pendientes</p>}
          </div>

          <div className="card p-4 lg:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-primary-500" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Próxima cita</h3>
            </div>
            {nextAppt ? (
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{nextAppt.reason || 'Cita médica'}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {new Date(nextAppt.scheduled_at).toLocaleString('es-NI', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                <Badge variant={nextAppt.status === 'confirmed' ? 'info' : 'default'}>{nextAppt.status === 'pending' ? 'Pendiente' : nextAppt.status === 'confirmed' ? 'Confirmada' : nextAppt.status}</Badge>
              </div>
            ) : <p className="text-sm text-slate-400 dark:text-slate-500">No hay citas próximas</p>}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 lg:p-5 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">Lecturas recientes</h3>
        </div>
        {readings.length > 0 ? (
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
                {readings.slice(0, 5).map((r: any) => {
                  const { status, variant } = classifyReading(r.value_mgdl)
                  return (
                    <tr key={r._id} className="border-b border-slate-50 dark:border-slate-800 last:border-0">
                      <td className="p-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">{r.value_mgdl} <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">mg/dL</span></td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 hidden sm:table-cell">{contextLabels[r.context] || r.context}</td>
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
          <div className="p-6 text-center text-sm text-slate-400 dark:text-slate-500">No hay lecturas registradas. Ve a Glucosa para agregar.</div>
        )}
      </div>
    </div>
  )
}
