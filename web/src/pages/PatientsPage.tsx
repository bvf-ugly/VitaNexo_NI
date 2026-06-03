import { useEffect, useState } from 'react'
import api from '../services/api'

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    api.get('/patients')
      .then(({ data }) => setPatients(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-8 flex items-center gap-3 text-slate-400">
      <span className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full vn-spin" />
      Cargando pacientes...
    </div>
  )

  return (
    <div className="p-5 md:p-8 max-w-5xl">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6">🩺 Pacientes</h2>

      {patients.length === 0 ? (
        <p className="text-slate-400 dark:text-slate-500">No hay pacientes registrados.</p>
      ) : (
        <div className="space-y-4">
          {patients.map((p) => (
            <div key={p._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base">
                    {p.user_id?.first_name} {p.user_id?.last_name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{p.user_id?.email}</p>
                </div>
                <span className="text-xs bg-sky-100 text-sky-700 px-3 py-1 rounded-full">
                  {p.blood_type || 'Tipo sanguíneo n/d'}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Condiciones crónicas</p>
                  {(p.chronic_conditions || []).length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {p.chronic_conditions.map((c: string) => (
                        <span key={c} className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                  ) : <p className="text-slate-400 dark:text-slate-500">Ninguna</p>}
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Alergias</p>
                  {(p.allergies || []).length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {p.allergies.map((a: string) => (
                        <span key={a} className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">{a}</span>
                      ))}
                    </div>
                  ) : <p className="text-slate-400 dark:text-slate-500">Ninguna</p>}
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Contacto de emergencia</p>
                  <p className="text-slate-700 dark:text-slate-300">{p.emergency_contact?.name || '—'}</p>
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
