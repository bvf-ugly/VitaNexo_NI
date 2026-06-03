import { useEffect, useState } from 'react'
import api, { getMyPatientId } from '../services/api.ts'

const DEMO_RECORDS = [
  {
    _id: '1',
    visit_date: '2026-05-08',
    diagnosis: 'Diabetes mellitus tipo 2 controlada. Hipertensión arterial con leve descontrol.',
    prescriptions: [
      { drug: 'Metformina 850mg', dose: '1 tab', duration: 'Continuo' },
      { drug: 'Losartán 100mg',   dose: '1 tab', duration: '30 días' },
    ],
    notes: 'Paciente refiere cefalea ocasional. HbA1c = 7.2%. Próximo control en 30 días con nuevos laboratorios.',
    doctor: 'Dr. Carlos Méndez',
  },
  {
    _id: '2',
    visit_date: '2026-04-03',
    diagnosis: 'Glucosa en ayuno 148 mg/dL. Se ajusta medicación. Dislipidemia detectada.',
    prescriptions: [
      { drug: 'Atorvastatina 20mg', dose: '1 cap', duration: '60 días' },
    ],
    notes: 'Solicitar perfil lipídico en próxima visita.',
    doctor: 'Dr. Carlos Méndez',
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

  const card = 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mb-4'

  return (
    <div className="p-5 md:p-8 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">📂 Mi Expediente</h2>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
          Historial clínico completo — solo lectura
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-400">
          <span className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full vn-spin" />
          Cargando expediente...
        </div>
      ) : records.length === 0 ? (
        <p className="text-slate-400 dark:text-slate-500 text-sm">Sin registros clínicos aún.</p>
      ) : (
        records.map(r => (
          <div key={r._id} className={card}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                  {new Date(r.visit_date).toLocaleDateString('es-NI', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{r.doctor || 'Médico'}</p>
              </div>
              <span className="text-[10px] bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300
                               rounded-full px-2 py-0.5 flex-shrink-0">
                Realizada
              </span>
            </div>

            <div className="space-y-2.5 text-sm">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">
                  Diagnóstico
                </p>
                <p className="text-slate-700 dark:text-slate-300">{r.diagnosis}</p>
              </div>

              {r.prescriptions?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                    Prescripciones
                  </p>
                  <ul className="space-y-1">
                    {r.prescriptions.map((p: any, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
                        <span>{p.drug} · {p.dose} · {p.duration}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {r.notes && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">
                    Notas del médico
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 italic text-xs">{r.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
