import { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native'
import api, { getMyPatientId } from '../../src/services/api'
import { useTheme } from '../../src/theme/ThemeContext'

export default function RecordScreen() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const { colors } = useTheme()

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const pid = await getMyPatientId()
      if (!pid) { setLoading(false); return }
      const { data } = await api.get(`/records/patient/${pid}`)
      setRecords(data)
    } catch {} finally { setLoading(false); setRefreshing(false) }
  }

  if (loading) return (
    <View style={[styles.center, { backgroundColor: colors.bg }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  )

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>📋 Expediente</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>Historial de visitas clínicas</Text>
      </View>

      {records.length === 0 ? (
        <View style={[styles.card, styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin registros clínicos.</Text>
        </View>
      ) : records.map(r => {
        const isOpen = expanded === r._id
        return (
          <TouchableOpacity
            key={r._id}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
            onPress={() => setExpanded(isOpen ? null : r._id)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.visitDate, { color: colors.textSecondary }]}>
                {new Date(r.visit_date).toLocaleDateString('es-NI', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
              <Text style={[styles.expandIcon, { color: colors.textMuted }]}>{isOpen ? '▼' : '▶'}</Text>
            </View>
            <Text style={[styles.diagnosis, { color: colors.text }]} numberOfLines={isOpen ? undefined : 2}>
              {r.diagnosis}
            </Text>
            {isOpen && (
              <>
                {r.notes && <Text style={[styles.notes, { color: colors.textSecondary }]}>{r.notes}</Text>}
                {r.prescriptions?.length > 0 && (
                  <View style={styles.prescriptions}>
                    <Text style={[styles.medTitle, { color: colors.text }]}>Medicamentos recetados:</Text>
                    {r.prescriptions.map((p: any, i: number) => (
                      <View key={i} style={[styles.medRow, { borderBottomColor: colors.surfaceBorder }]}>
                        <Text style={[styles.medDrug, { color: colors.text }]}>{p.drug}</Text>
                        <Text style={[styles.medDose, { color: colors.textSecondary }]}>{p.dose} — {p.duration}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  sub: { fontSize: 13, marginTop: 2 },
  card: { borderRadius: 14, marginHorizontal: 16, marginBottom: 12, padding: 16, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  emptyCard: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  visitDate: { fontSize: 12, fontWeight: '600' },
  expandIcon: { fontSize: 12 },
  diagnosis: { fontSize: 14, lineHeight: 20 },
  notes: { fontSize: 13, marginTop: 10, lineHeight: 18 },
  prescriptions: { marginTop: 12 },
  medTitle: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  medRow: { paddingVertical: 6, borderBottomWidth: 1 },
  medDrug: { fontSize: 14, fontWeight: '600' },
  medDose: { fontSize: 12, marginTop: 2 },
})