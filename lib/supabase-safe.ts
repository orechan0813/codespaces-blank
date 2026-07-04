import { getSupabaseSchemaStatus, getSupabaseStatusMessage as getClientStatusMessage } from "@/lib/supabase-client"

export function getSupabaseStatusMessage() {
  return getClientStatusMessage()
}

export async function getSupabaseSchemaState() {
  return getSupabaseSchemaStatus()
}
