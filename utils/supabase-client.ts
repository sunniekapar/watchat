import { createClient } from '@supabase/supabase-js';
import { loadEnvFile } from 'process';

loadEnvFile();

export const supabaseClient = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);
