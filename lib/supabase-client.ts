import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
const isPlaceholderUrl = supabaseUrl === "https://supabase.co" || !supabaseUrl?.includes(".supabase.co")

export const supabase =
  supabaseUrl && supabaseAnonKey && !isPlaceholderUrl
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey && !isPlaceholderUrl)
}

export function getSupabaseSetupMessage() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return "Supabase の URL と anon key を .env.local に設定してください。"
  }

  if (isPlaceholderUrl) {
    return "Supabase の Project URL には https://<project-ref>.supabase.co を入れてください。"
  }

  return null
}

const requiredTables = ["members", "club_events", "practice_items", "announcements", "lost_items", "diary_entries", "absence_reports", "lost_reports"]

export async function getSupabaseSchemaStatus() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      ready: false,
      message: "Supabase の接続設定が未完了です。Project URL と anon key を .env.local に入れてから再読み込みしてください。",
    }
  }

  if (isPlaceholderUrl) {
    return {
      ready: false,
      message: "Supabase の Project URL が未設定です。正しい URL を入れてください。",
    }
  }

  if (!supabase) {
    return {
      ready: false,
      message: "Supabase クライアントを初期化できませんでした。",
    }
  }

  const results = await Promise.allSettled(
    requiredTables.map(async (table) => {
      const { error } = await supabase.from(table).select("id").limit(1)
      if (error) throw error
    }),
  )

  const ready = results.every((result) => result.status === "fulfilled")

  return {
    ready,
    message: ready
      ? "Supabase に接続できています。必要なテーブルも作成済みです。"
      : "Supabase へ接続できています。テーブル作成がまだなら SQL を実行してください。",
  }
}

export function getSupabaseStatusMessage() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return "Supabase の接続設定が未完了です。Project URL と anon key を .env.local に入れてから再読み込みしてください。"
  }

  if (isPlaceholderUrl) {
    return "Supabase の Project URL が未設定です。正しい URL を入れてください。"
  }

  return "接続確認中です…"
}
