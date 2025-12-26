import { createClient } from '@supabase/supabase-js'

// Replace these with your Supabase project credentials
// You can find these in your Supabase dashboard under Settings > API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database schema for reference:
// Table: grocery_items
// Columns:
//   - id: uuid (primary key, default: gen_random_uuid())
//   - name: text (not null)
//   - quantity: text (not null, default: '1')
//   - checked: boolean (default: false)
//   - created_at: timestamptz (default: now())
//   - updated_at: timestamptz (default: now())
