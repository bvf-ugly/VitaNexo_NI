import { useEffect, useState } from 'react'
import { Calendar, Clock } from 'lucide-react'
import api from '../services/api'
import Badge from '../components/ui/Badge'

const statusMap: Record<string, { label: string; variant: 'info' | 'success' | 'danger' | 'warning' }> = {
  pending:   { label: 'Pendiente',  variant: 'warning' },
  confirmed: { label: 'Confirmada', variant: 'info' },
  done:      { label: 'Realizada',  variant: 'success' },
  cancelled: { label: 'Cancelada',  variant: 'danger' },
}

export default function Appointments() {
  const [appts, setAppts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/appointments').then(({ data }) => {
      setAppts(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Mis Citas</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500">Gestiona tus citas médicas</p>
        </div>
      </div>

      {appts.length === 0 ? (
        <div className="card p-8 lg:p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-200 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 dark:text-slate-500 font-medium">No hay citas registradas</p>
          <p className="text-sm text-slate-300 dark:text-slate-600 mt-1">Las citas aparecerán aquí cuando sean asignadas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appts.map((a: any) => {
            const s = statusMap[a.status] || statusMap.pending
            return (
              <div key={a._id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{a.reason || 'Cita médica'}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span className="truncate">{new Date(a.scheduled_at).toLocaleDateString('es-NI', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>{new Date(a.scheduled_at).toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    {a.notes && <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">{a.notes}</p>}
                  </div>
                  <Badge variant={s.variant}>{s.label}</Badge>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
