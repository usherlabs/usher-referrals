export const isProd = process.env.NODE_ENV === "production";
export const logLevel = process.env.LOG_LEVEL || "info";
export const publicUrl = process.env.PUBLIC_URL || "";

export const sentry = {
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
	release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || ""
};

export const gaTrackingId = process.env.NEXT_PUBLIC_GA_TRACKING_ID || "";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
