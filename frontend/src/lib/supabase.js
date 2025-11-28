import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://blrlfmskgyfzjsvkgciu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJscmxmbXNrZ3lmempzdmtnY2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjM5NjMsImV4cCI6MjA3OTg5OTk2M30.ivyTwgh-c9dvW91atyGyW6rQbShCzOBXb3m40Svj8Yw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);