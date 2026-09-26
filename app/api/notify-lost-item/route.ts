import { NextResponse } from "next/server"

const DISCORD_WEBHOOK_URL =
  process.env.DISCORD_WEBHOOK_URL ||
  "https://discord.com/api/webhooks/1524263755964350466/LPJ1JS9X7ytpnTN9XmtDSdBxXrsm_D_bkEkHM1DvtQKyuSNekQT9VmzAR_pBbS2qZWwn"

type LostItemNotification = {
  kind?: "found-item" | "lost-report"
  title?: string
  place?: string
  detail?: string
}

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : ""
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin")
  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ ok: false, message: "不正なリクエストです。" }, { status: 403 })
  }

  let payload: LostItemNotification
  try {
    payload = (await request.json()) as LostItemNotification
  } catch {
    return NextResponse.json({ ok: false, message: "通知内容が不正です。" }, { status: 400 })
  }

  const title = clean(payload.title, 300)
  const place = clean(payload.place, 300)
  const detail = clean(payload.detail, 500)
  if (!title || (payload.kind !== "found-item" && payload.kind !== "lost-report")) {
    return NextResponse.json({ ok: false, message: "品名または通知種別がありません。" }, { status: 400 })
  }

  const kindLabel = payload.kind === "found-item" ? "落とし物の登録" : "紛失物の連絡"
  const content = [
    "📢【JAZZ HUB】新しい落とし物・紛失物の連絡",
    "",
    `種類: ${kindLabel}`,
    `品名・特徴: ${title}`,
    `場所: ${place || "未記入"}`,
    detail ? `詳細: ${detail}` : "",
  ]
    .filter(Boolean)
    .join("\n")

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
    })
    if (!response.ok) {
      return NextResponse.json({ ok: false, message: "Discordへの通知に失敗しました。" }, { status: 502 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Discord lost item notification failed", error)
    return NextResponse.json({ ok: false, message: "Discordへの通知に失敗しました。" }, { status: 502 })
  }
}