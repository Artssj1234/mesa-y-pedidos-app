// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mcmougomztjxegsisled.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbW91Z29tenRqeGVnc2lzbGVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzI2NjksImV4cCI6MjA2MjcwODY2OX0.K9VOoyVsnM1ypR9R7m2YnyuCnyoQhOSUZSLFbb9uFXI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);