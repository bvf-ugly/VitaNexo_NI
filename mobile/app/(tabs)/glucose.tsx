import { useEffect, useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, Dimensions,
} from 'react-native'
import api, { getMyPatientId } from '../../src/services/api'
import { useTheme } from '../../src/theme/ThemeContext'
import Badge from '../../src/components/Badge'

const SCREEN = Dimensions.get('window')

const CONTEXTS = [
  { k: 'fasting', label: 'Ayunas' },
  { k: 'post_meal', label: 'Postprandial' },
  { k: 'random', label: 'Aleatoria' },
  { k: 'bedtime', label: 'Antes de dormir' },
]

function classify(v: number, ctx: string) {
  const r: Record<string, [number, number, number]> = {
    fasting: [70, 100, 126], post_meal: [70, 140, 200], random: [70, 140, 200], bedtime: [80, 120, 180],
  }
  const [lo, no, hi] = r[ctx] || r.random
  if (v < lo) return { status: 'Bajo', variant: 'danger' as const }
  if (v <= no) return { status: 'Normal', variant: 'success' as const }
  if (v <= hi) return { status: 'Elevado', variant: 'warning' as const }
  return { status: 'Alto', variant: 'danger' as const }
}

export default function GlucoseScreen() {
  const [patientId, setPatientId] = useState<string | null>(null)
  const [readings, setReadings] = useState<any[]>([])
  const [value, setValue] = useState('')
  const [context, setContext] = useState('fasting')
  const [saving, setSaving] = useState(false)
  const { colors } = useTheme()

  useEffect(() => {
    getMyPatientId().then(pid => {
      if (!pid) return
      setPatientId(pid)
      loadReadings(pid)
    })
  }, [])

  function loadReadings(pid: string) {
    api.get(`/glucose/patient/${pid}`).then(({ data }) => setReadings(data))
  }

  async function submit() {
    if (!patientId || !value) { Alert.alert('Ingresa un valor de glucosa'); return }
    const num = Number(value)
    if (isNaN(num) || num < 20 || num > 600) { Alert.alert('Valor fuera de rango (20–600 mg/dL)'); return }
    setSaving(true)
    try {
      await api.post('/glucose', { patient_id: patientId, value_mgdl: num, context })
      Alert.alert('Registrado', `${num} mg/dL guardado correctamente.`)
      setValue('')
      loadReadings(patientId)
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo guardar')
    } finally { setSaving(false) }
  }

  const sorted = [...readings].reverse()
  const chartMax = Math.max(...readings.map((r: any) => r.value_mgdl), 180) + 20

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>🩸 Control de Glucosa</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>Registra y monitorea tus niveles</Text>
      </View>

      {/* Mini chart */}
      {readings.length > 1 && (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>📈 Tendencia</Text>
          <View style={styles.chartContainer}>
            {sorted.slice(0, 7).reverse().map((r: any, i: number) => {
              const h = (r.value_mgdl / chartMax) * 120
              const w = Math.max(24, (SCREEN.width - 80) / Math.min(sorted.length, 7) - 4)
              return (
                <View key={r._id} style={styles.chartCol}>
                  <View style={[styles.chartBar, { height: Math.max(h, 4), width: w, backgroundColor: r.value_mgdl > 140 || r.value_mgdl < 70 ? '#ef4444' : colors.primary }]} />
                  <Text style={[styles.chartLabel, { color: colors.textMuted }]}>{r.value_mgdl}</Text>
                  <Text style={[styles.chartDate, { color: colors.textMuted }]}>
                    {new Date(r.recorded_at).toLocaleDateString('es-NI', { month: 'numeric', day: 'numeric' })}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>
      )}

      {/* Form */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Nueva lectura</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Valor (mg/dL)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
          keyboardType="numeric" placeholder="ej. 95" placeholderTextColor={colors.textMuted}
          value={value} onChangeText={setValue}
        />
        <Text style={[styles.label, { color: colors.textSecondary }]}>Contexto</Text>
        <View style={styles.contextRow}>
          {CONTEXTS.map(c => (
            <TouchableOpacity
              key={c.k}
              style={[styles.ctxBtn, { borderColor: colors.inputBorder }, context === c.k && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => setContext(c.k)}
            >
              <Text style={[styles.ctxBtnText, { color: colors.textSecondary }, context === c.k && { color: '#fff', fontWeight: '600' }]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={submit} disabled={saving}>
          <Text style={styles.btnText}>{saving ? 'Guardando...' : 'Registrar'}</Text>
        </TouchableOpacity>
      </View>

      {/* History */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Historial</Text>
        {sorted.length === 0 ? (
          <Text style={[styles.empty, { color: colors.textMuted }]}>Sin lecturas registradas.</Text>
        ) : sorted.map(r => {
          const { status, variant } = classify(r.value_mgdl, r.context)
          return (
            <View key={r._id} style={[styles.row, { borderBottomColor: colors.surfaceBorder }]}>
              <View>
                <Text style={[styles.rowValue, { color: colors.text }]}>{r.value_mgdl} <Text style={[styles.rowUnit, { color: colors.textMuted }]}>mg/dL</Text></Text>
                <Text style={[styles.rowDate, { color: colors.textMuted }]}>
                  {new Date(r.recorded_at).toLocaleDateString('es-NI', { month: 'short', day: 'numeric' })} · {CONTEXTS.find(c => c.k === r.context)?.label}
                </Text>
              </View>
              <Badge variant={variant}>{status}</Badge>
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  sub: { fontSize: 13, marginTop: 2 },
  card: { borderRadius: 14, marginHorizontal: 16, marginBottom: 16, padding: 16, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 18, marginBottom: 14 },
  contextRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  ctxBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  ctxBtnText: { fontSize: 12 },
  btn: { borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  empty: { fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  rowValue: { fontSize: 17, fontWeight: '700' },
  rowUnit: { fontSize: 12, fontWeight: '400' },
  rowDate: { fontSize: 12, marginTop: 2 },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 160, paddingTop: 8 },
  chartCol: { alignItems: 'center' },
  chartBar: { borderRadius: 4, minHeight: 4 },
  chartLabel: { fontSize: 10, marginTop: 2 },
  chartDate: { fontSize: 8, marginTop: 1 },
})
