import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://eqbrpivdwuyuqpjiclwg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYnJwaXZkd3V5dXFwamljbHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NjUzMjcsImV4cCI6MjA3NTQ0MTMyN30.a00hWLpVhDzCkLtBHnfLY1IdmkU85NBC5R_GShEY4Kw'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
