import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../theme/ThemeContext'

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  icon: string
  color: string
}

export default function StatCard({ label, value, unit, icon, color }: StatCardProps) {
  const { colors } = useTheme()
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
      <Text style={[styles.icon]}>{icon}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {unit && <Text style={[styles.unit, { color: colors.textMuted }]}>{unit}</Text>}
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  icon: { fontSize: 22, marginBottom: 4 },
  value: { fontSize: 22, fontWeight: '800' },
  unit: { fontSize: 11, marginTop: 1 },
  label: { fontSize: 12, marginTop: 4 },
})
