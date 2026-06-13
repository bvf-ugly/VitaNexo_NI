import { useEffect, useState } from 'react'
import { Bell, AlertTriangle, Info, AlertCircle } from 'lucide-react'
import api, { getMyPatientId } from '../services/api'

const icons = { critical: AlertTriangle, warning: AlertCircle, info: Info }
const colors = {
  critical: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', border: 'border-l-red-500', dot: 'bg-red-500', icon: 'text-red-500 dark:text-red-400' },
  warning:  { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-l-amber-500', dot: 'bg-amber-500', icon: 'text-amber-500 dark:text-amber-400' },
  info:     { bg: 'bg-primary-50 dark:bg-primary-950/30', text: 'text-primary-700 dark:text-primary-400', border: 'border-l-primary-500', dot: 'bg-primary-500', icon: 'text-primary-500 dark:text-primary-400' },
}

function AlertItem({ a, c, Icon }: { a: any; c: typeof colors.critical; Icon: any }) {
  return (
    <div className={`card border-l-4 ${c.border} ${c.bg} !p-4 flex items-start gap-4 hover-lift`}>
      <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center ${c.icon} flex-shrink-0`}>
        <Icon size={18} aria-hidden />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${c.text}`}>{a.message}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {new Date(a.triggered_at).toLocaleString('es-NI', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <span className={`w-2.5 h-2.5 rounded-full ${c.dot} mt-1 flex-shrink-0 ${a.is_read ? 'opacity-30' : ''}`} />
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
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-3 text-slate-400">
        <span className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
        <span>Cargando alertas...</span>
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-5xl animate-fade-in">
      {/* Header — Persistent */}
      <div className="page-header">
        <h1 className="page-title">
          <span className="inline-flex items-center gap-2">
            <Bell size={24} className="text-primary-500" aria-hidden />
            Alertas
          </span>
        </h1>
        <p className="page-subtitle">Notificaciones y alertas medicas</p>
      </div>

      {alerts.length === 0 ? (
        <div className="card text-center py-16">
          <Bell size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" aria-hidden />
          <p className="text-slate-400 dark:text-slate-500 font-medium">No hay alertas</p>
          <p className="text-sm text-slate-300 dark:text-slate-600 mt-1">Tus notificaciones apareceran aqui.</p>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in">
          {alerts.map((a: any, i: number) => {
            const c = colors[a.type as keyof typeof colors] || colors.info
            const Icon = icons[a.type as keyof typeof icons] || icons.info
            return (
              <div key={a._id} style={{ animationDelay: `${i * 0.05}s` }}>
                <AlertItem a={a} c={c} Icon={Icon} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
