import { useEffect, useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native'
import api, { getMyPatientId } from '../../src/services/api'
import { useTheme } from '../../src/theme/ThemeContext'

export default function VitalsScreen() {
  const [vitals, setVitals] = useState<any[]>([])
  const [patientId, setPatientId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sys, setSys] = useState('')
  const [dia, setDia] = useState('')
  const [hr, setHr] = useState('')
  const [o2, setO2] = useState('')
  const [temp, setTemp] = useState('')
  const { colors } = useTheme()

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const pid = await getMyPatientId()
      if (!pid) { setLoading(false); return }
      setPatientId(pid)
      const { data } = await api.get(`/vital-signs/patient/${pid}`)
      setVitals(data)
    } catch {} finally { setLoading(false); setRefreshing(false) }
  }

  async function submit() {
    if (!patientId) return
    setSaving(true)
    try {
      await api.post('/vital-signs', {
        patient_id: patientId,
        blood_pressure: sys && dia ? { systolic: Number(sys), diastolic: Number(dia) } : undefined,
        heart_rate: hr ? Number(hr) : undefined,
        oxygen_saturation: o2 ? Number(o2) : undefined,
        temperature: temp ? Number(temp) : undefined,
      })
      Alert.alert('✅ Registrado', 'Signos vitales guardados correctamente')
      setSys(''); setDia(''); setHr(''); setO2(''); setTemp('')
      load()
    } catch (err: any) {
      Alert.alert('❌ Error', err.response?.data?.error || 'No se pudo guardar')
    } finally { setSaving(false) }
  }

  const latest = vitals[0]

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>❤️ Signos Vitales</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>Monitoreo continuo</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* Summary */}
          {latest && (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Última medición</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{latest.blood_pressure?.systolic || '—'}/{latest.blood_pressure?.diastolic || '—'}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Presión</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{latest.heart_rate || '—'}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Pulso</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{latest.oxygen_saturation || '—'}%</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>O₂</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{latest.temperature || '—'}°</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Temp</Text>
                </View>
              </View>
            </View>
          )}

          {/* Register form */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Registrar</Text>
            <View style={styles.formRow}>
              <View style={styles.halfInput}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Sistólica</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  keyboardType="numeric" value={sys} onChangeText={setSys} placeholder="120" placeholderTextColor={colors.textMuted} />
              </View>
              <View style={styles.halfInput}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Diastólica</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  keyboardType="numeric" value={dia} onChangeText={setDia} placeholder="80" placeholderTextColor={colors.textMuted} />
              </View>
            </View>
            <View style={styles.formRow}>
              <View style={styles.halfInput}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Pulso (bpm)</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  keyboardType="numeric" value={hr} onChangeText={setHr} placeholder="72" placeholderTextColor={colors.textMuted} />
              </View>
              <View style={styles.halfInput}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Saturación O₂ (%)</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  keyboardType="numeric" value={o2} onChangeText={setO2} placeholder="98" placeholderTextColor={colors.textMuted} />
              </View>
            </View>
            <View style={{ marginBottom: 12 }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Temperatura (°C)</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                keyboardType="decimal-pad" value={temp} onChangeText={setTemp} placeholder="36.6" placeholderTextColor={colors.textMuted} />
            </View>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={submit} disabled={saving}>
              <Text style={styles.btnText}>{saving ? 'Guardando...' : 'Registrar'}</Text>
            </TouchableOpacity>
          </View>

          {/* History */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Historial</Text>
            {vitals.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin registros.</Text>
            ) : vitals.map(v => (
              <View key={v._id} style={[styles.row, { borderBottomColor: colors.surfaceBorder }]}>
                <Text style={[styles.rowDate, { color: colors.textMuted }]}>
                  {new Date(v.recorded_at).toLocaleDateString('es-NI', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={[styles.rowValue, { color: colors.text }]}>
                  {(v.blood_pressure ? `${v.blood_pressure.systolic}/${v.blood_pressure.diastolic}` : '') + (v.heart_rate ? ` · ${v.heart_rate} bpm` : '') + (v.oxygen_saturation ? ` · SpO₂ ${v.oxygen_saturation}%` : '')}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
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
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  statItem: { width: '50%', marginBottom: 12 },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 2 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, marginBottom: 10 },
  formRow: { flexDirection: 'row', gap: 10 },
  halfInput: { flex: 1 },
  btn: { borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  row: { paddingVertical: 10, borderBottomWidth: 1 },
  rowDate: { fontSize: 12 },
  rowValue: { fontSize: 14, fontWeight: '500', marginTop: 2 },
  emptyText: { fontSize: 14 },
})