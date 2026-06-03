import { useEffect, useState } from 'react'
import { Bell, AlertTriangle, Info, AlertCircle } from 'lucide-react'
import api, { getMyPatientId } from '../services/api'

const icons = { critical: AlertTriangle, warning: AlertCircle, info: Info }
const colors = {
  critical: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800', dot: 'bg-red-500', icon: 'text-red-500 dark:text-red-400' },
  warning:  { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500', icon: 'text-amber-500 dark:text-amber-400' },
  info:     { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', dot: 'bg-blue-500', icon: 'text-blue-500 dark:text-blue-400' },
}

function AlertItem({ a, c, Icon }: { a: any; c: typeof colors.critical; Icon: any }) {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 border-l-4 ${c.border} flex items-start gap-4`}>
      <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center ${c.icon}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${c.text}`}>{a.message}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {new Date(a.triggered_at).toLocaleString('es-NI', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <span className={`w-2 h-2 rounded-full ${c.dot} mt-1.5 ${a.is_read ? 'opacity-30' : ''}`} />
    </div>
  )
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyPatientId().then(pid => {
      if (!pid) { setLoading(false); return }
      api.get(`/alerts/patient/${pid}`).then(({ data }) => setAlerts(data)).catch(() => {})
        .finally(() => setLoading(false))
    })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
    </div>
  )

  return (
    <div className="p-5 md:p-8 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">🔔 Alertas</h2>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Notificaciones y alertas médicas</p>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-10 text-center">
          <Bell className="w-12 h-12 text-slate-200 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 dark:text-slate-500 font-medium">No hay alertas</p>
          <p className="text-sm text-slate-300 dark:text-slate-600 mt-1">Tus notificaciones aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((a: any) => {
            const c = colors[a.type as keyof typeof colors] || colors.info
            const Icon = icons[a.type as keyof typeof icons] || icons.info
            return <AlertItem key={a._id} a={a} c={c} Icon={Icon} />
          })}
        </div>
      )}
    </div>
  )
}
