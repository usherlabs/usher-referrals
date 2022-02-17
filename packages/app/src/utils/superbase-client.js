import { createClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseAnonKey } from "@/env-config";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
