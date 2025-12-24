import { createClient } from '@supabase/supabase-js';
import 'expo-sqlite/localStorage/install';

const supabaseUrl = process.env.REACT_NATIVE_SUPABASE_URL;
const supabasePublishableKey = process.env.REACT_NATIVE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
