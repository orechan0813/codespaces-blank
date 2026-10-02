import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

function getJstDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  }
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ ok: false, message: "Cron の認証設定がありません。" }, { status: 503 })
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, message: "認証に失敗しました。" }, { status: 401 })
  }

  const { year, month, day } = getJstDateParts(new Date())
  if (month !== 4 || day !== 2) {
    return NextResponse.json({ ok: false, message: "年度切替日ではありません。" }, { status: 409 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ ok: false, message: "Supabase のサーバー設定が不足しています。" }, { status: 503 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await supabase.rpc("promote_members_for_school_year", {
    p_school_year: year,
  })

  if (error) {
    console.error("Annual member promotion failed", error)
    return NextResponse.json({ ok: false, message: "進級処理に失敗しました。" }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    schoolYear: year,
    promotedCount: Number(data ?? 0),
  })
}
