import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../../src/theme/ThemeContext'
import ThemeToggle from '../../src/components/ThemeToggle'

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{icon}</Text>
    </View>
  )
}

export default function TabLayout() {
  const { colors, isDark } = useTheme()

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: {
        borderTopColor: colors.tabBorder,
        backgroundColor: colors.tabBar,
        paddingBottom: 4,
        height: 60,
      },
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
      headerTitleStyle: { fontWeight: '700' },
      headerRight: () => <View style={{ marginRight: 12 }}><ThemeToggle /></View>,
    }}>
      <Tabs.Screen name="index" options={{
        title: 'Inicio',
        tabBarLabel: 'Inicio',
        tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
      }} />
      <Tabs.Screen name="glucose" options={{
        title: 'Glucosa',
        tabBarLabel: 'Glucosa',
        tabBarIcon: ({ focused }) => <TabIcon icon="🩸" focused={focused} />,
      }} />
      <Tabs.Screen name="appointments" options={{
        title: 'Citas',
        tabBarLabel: 'Citas',
        tabBarIcon: ({ focused }) => <TabIcon icon="📅" focused={focused} />,
      }} />
      <Tabs.Screen name="alerts" options={{
        title: 'Alertas',
        tabBarLabel: 'Alertas',
        tabBarIcon: ({ focused }) => <TabIcon icon="🔔" focused={focused} />,
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Perfil',
        tabBarLabel: 'Perfil',
        tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
      }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: {},
  tabEmoji: { fontSize: 18, opacity: 0.6 },
  tabEmojiActive: { opacity: 1 },
})
