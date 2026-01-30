import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import { Alert, AppState, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { supabase } from '../lib/supabase'

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme ?? 'light']
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password')
      return
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long')
      return
    }
    
    setPasswordError('')
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (error) {
        console.error('Sign in error:', error)
        Alert.alert('Sign In Error', error.message)
      } else {
        console.log('Sign in successful!', data)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      Alert.alert('Error', 'An unexpected error occurred')
    }
    setLoading(false)
  }

  async function signUpWithEmail() {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password')
      return
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long')
      return
    }
    
    setPasswordError('')
    setLoading(true)
    console.log('Attempting sign up...')
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
    })

    if (error) {
      console.error('Sign up error:', error)
      Alert.alert('Sign Up Error', error.message)
    } else {
      console.log('Sign up successful!', session)
      setInfoMessage('We sent you a verification email. Please open it and verify your account before signing in.')
      // Optionally clear password for safety
      setPassword('')
    }
    setLoading(false)
  }

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>Welcome to Workout Planner</Text>
      {infoMessage ? (
        <View style={[styles.verticallySpaced, styles.infoBanner, { backgroundColor: colorScheme === 'dark' ? '#1E3A5F' : '#E8F2FF', borderColor: colorScheme === 'dark' ? '#2D5A8C' : '#B6D3FF' }]}>
          <Text style={[styles.infoText, { color: colorScheme === 'dark' ? '#90CAF9' : '#0A58CA' }]}>{infoMessage}</Text>
        </View>
      ) : null}
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TextInput
          onChangeText={(text: string) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
          autoCapitalize={'none'}
          keyboardType="email-address"
          style={[styles.input, { color: theme.text, backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#fff', borderColor: colorScheme === 'dark' ? '#444' : '#ccc' }]}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          onChangeText={(text: string) => {
            setPassword(text)
            if (text.length > 0 && text.length < 6) {
              setPasswordError('Password must be at least 6 characters long')
            } else {
              setPasswordError('')
            }
          }}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
          autoCapitalize={'none'}
          style={[styles.input, { color: theme.text, backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#fff', borderColor: passwordError ? '#ff3b30' : (colorScheme === 'dark' ? '#444' : '#ccc') }]}
        />
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TouchableOpacity disabled={loading} onPress={() => signInWithEmail()} style={styles.button}>
          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.verticallySpaced}>
        <TouchableOpacity disabled={loading} onPress={() => signUpWithEmail()} style={styles.button}>
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  container: {
    padding: 12,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBanner: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
  },
})