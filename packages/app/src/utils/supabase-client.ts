import { createClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseAnonKey } from "@/env-config";
import { supabaseSecretKey } from "@/server/env-config";

export const supabase = createClient(
	supabaseUrl as string,
	typeof window !== "undefined"
		? (supabaseAnonKey as string)
		: (supabaseSecretKey as string)
);
