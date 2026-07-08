import { createClient } from '@supabase/supabase-js';

// Uses the service role key — bypasses RLS. Only call this server-side.
export const createServiceClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
