import { useEffect, useState } from 'react'
import api from '../services/api'
import { Users, Mail, Droplets } from 'lucide-react'

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/patients')
      .then(({ data }) => setPatients(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-3 text-slate-400">
        <span className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
        <span>Cargando pacientes...</span>
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-6xl animate-fade-in">
      {/* Header — Persistent */}
      <div className="page-header">
        <h1 className="page-title">
          <span className="inline-flex items-center gap-2">
            <Users size={24} className="text-primary-500" aria-hidden />
            Pacientes
          </span>
        </h1>
        <p className="page-subtitle">
          {patients.length} paciente{patients.length !== 1 ? 's' : ''} registrado{patients.length !== 1 ? 's' : ''}
        </p>
      </div>

      {patients.length === 0 ? (
        <div className="card text-center py-16">
          <Users size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" aria-hidden />
          <p className="text-slate-400 dark:text-slate-500">No hay pacientes registrados.</p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {patients.map((p, i) => (
            <div key={p._id} className="card hover-lift" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {(p.user_id?.first_name?.[0] || '?').toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm font-heading">
                      {p.user_id?.first_name} {p.user_id?.last_name}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                      <Mail size={12} aria-hidden /> {p.user_id?.email}
                    </p>
                  </div>
                </div>
                <span className="badge-primary flex items-center gap-1">
                  <Droplets size={12} aria-hidden />
                  {p.blood_type || 'Tipo sanguineo n/d'}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Condiciones cronicas</p>
                  {(p.chronic_conditions || []).length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {p.chronic_conditions.map((c: string) => (
                        <span key={c} className="badge badge-warning">{c}</span>
                      ))}
                    </div>
                  ) : <p className="text-slate-400 dark:text-slate-500 text-xs">Ninguna</p>}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Alergias</p>
                  {(p.allergies || []).length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {p.allergies.map((a: string) => (
                        <span key={a} className="badge badge-danger">{a}</span>
                      ))}
                    </div>
                  ) : <p className="text-slate-400 dark:text-slate-500 text-xs">Ninguna</p>}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Contacto de emergencia</p>
                  <p className="text-slate-700 dark:text-slate-300 text-xs">{p.emergency_contact?.name || '—'}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">{p.emergency_contact?.phone || ''}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
