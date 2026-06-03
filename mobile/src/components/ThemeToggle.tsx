import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native'
import { useTheme } from '../theme/ThemeContext'

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme()

  return (
    <TouchableOpacity
      onPress={toggle}
      style={[styles.toggle, { backgroundColor: isDark ? '#334155' : '#e2e8f0' }]}
    >
      <Text style={styles.icon}>{isDark ? '🌙' : '☀️'}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  toggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 16 },
})
