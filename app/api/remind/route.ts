import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const DISCORD_WEBHOOK_URL =
  process.env.DISCORD_WEBHOOK_URL ||
  "https://discord.com/api/webhooks/1524263755964350466/LPJ1JS9X7ytpnTN9XmtDSdBxXrsm_D_bkEkHM1DvtQKyuSNekQT9VmzAR_pBbS2qZWwn"

const MOBILE_APP_URL =
  process.env.JAZZ_HUB_MOBILE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://jazz-hub.vercel.app"

function getJstDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)

  const year = parts.find((part) => part.type === "year")?.value ?? ""
  const month = parts.find((part) => part.type === "month")?.value ?? ""
  const day = parts.find((part) => part.type === "day")?.value ?? ""

  return `${year}-${month}-${day}`
}

async function sendDiscordReminder(content: string) {
  const response = await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Discord webhook failed (${response.status}): ${text}`)
  }
}

export async function GET() {
  return POST()
}

export async function POST() {
  const today = getJstDateString()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      {
        ok: false,
        message: "Supabase の設定が不足しています。",
      },
      { status: 500 },
    )
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { data, error } = await supabase.from("club_events").select("*").eq("date", today)

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message,
      },
      { status: 500 },
    )
  }

  if (!data || data.length === 0) {
    return NextResponse.json({
      ok: true,
      date: today,
      eventCount: 0,
      message: "本日の予定はありません。",
    })
  }

  const formattedEvents = data
    .map((event) => {
      const title = event.title || "予定"
      const time = event.time ? ` (${event.time})` : ""
      const detail = event.detail ? `\n${event.detail}` : ""
      return `• ${title}${time}${detail}`
    })
    .join("\n")

  const content = `☀️【JAZZ HUB】今日の部活のお知らせ\n\n${formattedEvents}\n\n[JAZZ HUBを開く](${MOBILE_APP_URL})`

  try {
    await sendDiscordReminder(content)

    return NextResponse.json({
      ok: true,
      date: today,
      eventCount: data.length,
      message: "Discord に通知しました。",
    })
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json(
      {
        ok: false,
        message: errorMessage,
      },
      { status: 500 },
    )
  }
}
