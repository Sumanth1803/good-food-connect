// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://utlxqfsnystxyywnckbd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0bHhxZnNueXN0eHl5d25ja2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NTA5MjIsImV4cCI6MjA2OTUyNjkyMn0.jqMHXaIO3Mmcbh2hDONwMBXaC0liQE6SNkasizNuqPI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});