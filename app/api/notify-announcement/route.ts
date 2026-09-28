import { NextResponse } from "next/server"

type AnnouncementNotification = {
  title?: string
  body?: string
}

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : ""
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin")
  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ ok: false, message: "不正なリクエストです。" }, { status: 403 })
  }

  let payload: AnnouncementNotification
  try {
    payload = (await request.json()) as AnnouncementNotification
  } catch {
    return NextResponse.json({ ok: false, message: "通知内容が不正です。" }, { status: 400 })
  }

  const title = clean(payload.title, 300) || "（タイトルなし）"
  const body = clean(payload.body, 1500) || "（本文なし）"
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    return NextResponse.json({ ok: false, message: "通知設定がありません。" }, { status: 503 })
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `【全体連絡】\nタイトル: ${title}\n\n${body}`,
        allowed_mentions: { parse: [] },
      }),
    })
    if (!response.ok) {
      return NextResponse.json({ ok: false, message: "Discordへの通知に失敗しました。" }, { status: 502 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Discord announcement webhook failed", error)
    return NextResponse.json({ ok: false, message: "Discordへの通知に失敗しました。" }, { status: 502 })
  }
}