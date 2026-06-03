import { View, Text, StyleSheet } from 'react-native'

const variants = {
  success: { bg: '#dcfce7', text: '#15803d' },
  warning: { bg: '#fef9c3', text: '#92400e' },
  danger:  { bg: '#fee2e2', text: '#b91c1c' },
  info:    { bg: '#dbeafe', text: '#1d4ed8' },
  default: { bg: '#f1f5f9', text: '#475569' },
}

export default function Badge({ variant = 'default', children }: { variant?: keyof typeof variants; children: React.ReactNode }) {
  const s = variants[variant]
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.text }]}>{children}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '600' },
})
