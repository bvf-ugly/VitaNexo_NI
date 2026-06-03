import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Droplets, Calendar, TrendingUp, AlertCircle } from 'lucide-react'
import { useAuth } from '../context.tsx'
import api, { getMyPatientId } from '../services/api.ts'

function StatCard({ label, value, sub, color, icon: Icon }: {
  label: string; value: string; sub?: string; color: string; icon: React.FC<any>
}) {
  return (
    <div className={`rounded-xl border p-5 ${color}`}>
      <Icon size={20} className="mb-2 opacity-70" aria-hidden />
      <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'patient') {
      getMyPatientId()
        .then(pid => pid ? api.get(`/glucose/patient/${pid}/stats`) : null)
        .then(r => r && setStats(r.data))
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user])

  const firstName = user?.first_name || user?.email?.split('@')[0] || 'Usuario'

  return (
    <div className="p-5 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          Bienvenido, {firstName} 👋
        </h2>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
          Panel principal · {new Date().toLocaleDateString('es-NI', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-3 w-1/2" />
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Rol actual"     value={user?.role || '—'}                  color="border-sky-200   dark:border-sky-800   bg-sky-50   dark:bg-sky-950"   icon={Activity} />
          <StatCard label="Glucosa prom."  value={stats ? `${stats.avg_mgdl} mg/dL` : '—'} sub="30 días" color="border-amber-200  dark:border-amber-800  bg-amber-50  dark:bg-amber-950"  icon={Droplets} />
          <StatCard label="En rango"       value={stats ? `${stats.in_range_pct}%`   : '—'} sub="70-180 mg/dL" color="border-green-200  dark:border-green-800  bg-green-50  dark:bg-green-950"  icon={TrendingUp} />
          <StatCard label="Lecturas"       value={stats ? String(stats.count)         : '—'} sub="registradas" color="border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950" icon={Calendar} />
        </div>
      )}

      {/* Quick access */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-sm">⚡ Acceso rápido</h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>🩸 <Link to="/glucose"      className="text-sky-600 dark:text-sky-400 hover:underline">Registrar glucosa</Link></li>
            <li>💓 <Link to="/vitals"       className="text-sky-600 dark:text-sky-400 hover:underline">Signos vitales</Link></li>
            <li>📅 <Link to="/appointments" className="text-sky-600 dark:text-sky-400 hover:underline">Mis citas</Link></li>
            <li>💊 <Link to="/medications"  className="text-sky-600 dark:text-sky-400 hover:underline">Medicamentos</Link></li>
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-amber-500" aria-hidden />
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Recordatorios</h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
              Medir glucosa en ayunas mañana
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
              Tomar Losartán — pendiente hoy
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />
              Cita el 10 de junio con Dr. Méndez
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
