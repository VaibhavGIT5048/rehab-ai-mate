// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://augcmhpnppnapkbmefiy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1Z2NtaHBucHBuYXBrYm1lZml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NzY3MDUsImV4cCI6MjA2OTU1MjcwNX0.8tCjWShY8Vpm9dKPe3m-PY6rRmMnqD5vkCCCHNkRGTQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});