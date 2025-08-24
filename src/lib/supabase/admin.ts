import { createClient } from "@supabase/supabase-js";

// Server-side admin client with service role key
// This should only be used in server-side code (API routes, server components)
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
