import { createClient as createSupabaseClient } from "@/lib/supabase/client";

export const createClient = () => createSupabaseClient();
export const supabase = createSupabaseClient();
