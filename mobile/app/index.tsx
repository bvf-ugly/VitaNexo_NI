import { useEffect, useState } from 'react'
import { Redirect } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { useTheme } from '../src/theme/ThemeContext'

export default function Index() {
  const [ready, setReady] = useState(false)
  const [hasToken, setHasToken] = useState(false)
  const { colors } = useTheme()

  useEffect(() => {
    SecureStore.getItemAsync('accessToken').then(token => {
      setHasToken(!!token)
      setReady(true)
    })
  }, [])

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return hasToken ? <Redirect href="/(tabs)" /> : <Redirect href="/login" />
}
