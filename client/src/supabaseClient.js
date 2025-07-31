// client/src/supabaseClient.js

import { createClient } from '@supabase/supabase-js'

// IMPORTANT: Replace with your actual Project URL and Anon Key
const supabaseUrl = 'https://gdxldkzkcyrztgehcued.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkeGxka3prY3lyenRnZWhjdWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODAwOTYsImV4cCI6MjA2OTM1NjA5Nn0.Vs0Pua4rk1GKYfcyVy6hbYw6YnXZqnDus1NSjuhhOdo';

// This creates the Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);