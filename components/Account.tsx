import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { supabase } from '../lib/supabase'

export default function Account({ session }: { session: Session }) {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme ?? 'light']
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    if (session) getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: string
    website: string
    avatar_url: string
  }) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session?.user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        throw error
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TextInput
          placeholder="Email"
          value={session?.user?.email}
          editable={false}
          placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
          style={[styles.input, styles.disabledInput, { color: theme.text, backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#f0f0f0', borderColor: colorScheme === 'dark' ? '#444' : '#ccc' }]}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          placeholder="Username"
          value={username || ''}
          onChangeText={(text: string) => setUsername(text)}
          placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
          style={[styles.input, { color: theme.text, backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#fff', borderColor: colorScheme === 'dark' ? '#444' : '#ccc' }]}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          placeholder="Website"
          value={website || ''}
          onChangeText={(text: string) => setWebsite(text)}
          placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
          style={[styles.input, { color: theme.text, backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#fff', borderColor: colorScheme === 'dark' ? '#444' : '#ccc' }]}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TouchableOpacity
          onPress={() => updateProfile({ username, website, avatar_url: avatarUrl })}
          disabled={loading}
          style={[styles.button, loading && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>{loading ? 'Loading ...' : 'Update'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.verticallySpaced}>
        <TouchableOpacity onPress={() => supabase.auth.signOut()} style={styles.button}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
    flex: 1,
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
  disabledInput: {
    opacity: 0.6,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})