import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const getEnv = (keys: string[]) => {
  for (const key of keys) {
    const val = process.env[key];
    if (val) return val;
  }
  return undefined;
};

const supabaseUrl = getEnv([
  'EXPO_PUBLIC_SUPABASE_URL',
  'REACT_NATIVE_SUPABASE_URL',
]);

const supabaseAnonKey = getEnv([
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'REACT_NATIVE_SUPABASE_PUBLISHABLE_KEY',
]);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase env vars missing: set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

const createNoopStorage = () => ({
  getItem: async (_key: string) => null,
  setItem: async (_key: string, _value: string) => {},
  removeItem: async (_key: string) => {},
});

const isWeb = Platform.OS === 'web';
const storage = isWeb
  ? typeof window !== 'undefined'
    ? window.localStorage
    : createNoopStorage()
  : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
