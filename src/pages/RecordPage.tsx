import { useEffect, useState } from 'react'
import api, { getMyPatientId } from '../services/api.ts'
import { FileText, Calendar, User, Pill } from 'lucide-react'

const DEMO_RECORDS = [
  {
    _id: '1',
    visit_date: '2026-05-08',
    diagnosis: 'Diabetes mellitus tipo 2 controlada. Hipertension arterial con leve descontrol.',
    prescriptions: [
      { drug: 'Metformina 850mg', dose: '1 tab', duration: 'Continuo' },
      { drug: 'Losartan 100mg',   dose: '1 tab', duration: '30 dias' },
    ],
    notes: 'Paciente refiere cefalea ocasional. HbA1c = 7.2%. Proximo control en 30 dias con nuevos laboratorios.',
    doctor: 'Dr. Carlos Mendez',
  },
  {
    _id: '2',
    visit_date: '2026-04-03',
    diagnosis: 'Glucosa en ayuno 148 mg/dL. Se ajusta medicacion. Dislipidemia detectada.',
    prescriptions: [
      { drug: 'Atorvastatina 20mg', dose: '1 cap', duration: '60 dias' },
    ],
    notes: 'Solicitar perfil lipidico en proxima visita.',
    doctor: 'Dr. Carlos Mendez',
  },
]

export default function RecordPage() {
  const [records, setRecords] = useState(DEMO_RECORDS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyPatientId()
      .then(pid => pid ? api.get(`/records/patient/${pid}`) : null)
      .then(r => { if (r?.data?.length) setRecords(r.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-3 text-slate-400">
        <span className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
        <span>Cargando expediente...</span>
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-4xl animate-fade-in">
      {/* Header — Persistent */}
      <div className="page-header">
        <h1 className="page-title">
          <span className="inline-flex items-center gap-2">
            <FileText size={24} className="text-primary-500" aria-hidden />
            Mi Expediente
          </span>
        </h1>
        <p className="page-subtitle">
          Historial clinico completo &mdash; solo lectura
        </p>
      </div>

      {records.length === 0 ? (
        <div className="card text-center py-16">
          <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" aria-hidden />
          <p className="text-slate-400 dark:text-slate-500">Sin registros clinicos aun.</p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {records.map((r, i) => (
            <div key={r._id} className="card hover-lift" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <Calendar size={20} className="text-primary-600 dark:text-primary-400" aria-hidden />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm font-heading">
                      {new Date(r.visit_date).toLocaleDateString('es-NI', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                      <User size={12} aria-hidden /> {r.doctor || 'Medico'}
                    </p>
                  </div>
                </div>
                <span className="badge-success">
                  Realizada
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                    Diagnostico
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">{r.diagnosis}</p>
                </div>

                {r.prescriptions?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                      <Pill size={12} aria-hidden /> Prescripciones
                    </p>
                    <ul className="space-y-1.5">
                      {r.prescriptions.map((p: any, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                          <span>{p.drug} &middot; {p.dose} &middot; {p.duration}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {r.notes && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">
                      Notas del medico
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 italic text-xs">{r.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
