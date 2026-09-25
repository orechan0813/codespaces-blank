"use client"

import { useEffect, useState } from "react"
import { CalendarDays, Clock, MapPin, Megaphone, PackageSearch, Pin } from "lucide-react"
import { formatJPDate, nextEvent, useJazz } from "@/lib/jazz-store"
import { Panel, SectionHeading, Tag } from "@/components/jazz/primitives"
import { Countdown } from "@/components/jazz/countdown"
import { cn } from "@/lib/utils"

const EVENT_LABEL: Record<string, string> = {
  live: "ライブ",
  contest: "大会",
  practice: "練習",
}

export function HomeView({ onNavigate }: { onNavigate: (k: "calendar" | "library" | "forms") => void }) {
  const { currentUser, events, announcements, lostItems } = useJazz()
  const upcoming = nextEvent(events)
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())
  const todayEvents = events.filter((event) => event.date === today).sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""))
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">おかえりなさい、</p>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          {currentUser?.name} <span className="text-primary">さん</span>
        </h1>
      </div>

      {/* Countdown hero */}
      <Panel className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <Tag>{upcoming ? EVENT_LABEL[upcoming.type] : "予定"}</Tag>
              <span className="text-xs text-muted-foreground">次のイベントまで</span>
            </div>
            {upcoming ? (
              <>
                <h2 className="text-balance font-serif text-2xl font-semibold text-foreground">
                  {upcoming.title}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-4 text-primary" />
                    {formatJPDate(upcoming.date)}
                  </span>
                  {upcoming.startTime && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-4 text-primary" />
                      {upcoming.startTime}〜{upcoming.endTime ?? ""}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <h2 className="font-serif text-xl text-muted-foreground">予定はまだありません</h2>
            )}
          </div>
          {upcoming && (
            <div className="shrink-0">
              <Countdown date={upcoming.date} startTime={upcoming.startTime} />
            </div>
          )}
        </div>
      </Panel>

      {/* Announcements + practice */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <SectionHeading eyebrow="From Admin" title="全体連絡" />
          <div className="space-y-3">
            {announcements.map((a) => (
              <Panel key={a.id} className="p-4">
                <div className="mb-1 flex items-center gap-2">
                  {a.pinned ? <Pin className="size-3.5 text-primary" /> : <Megaphone className="size-3.5 text-primary/70" />}
                  <h3 className="font-medium text-foreground">{a.title}</h3>
                  {a.pinned && <Tag className="ml-auto">固定</Tag>}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{a.body}</p>
                <p className="mt-2 text-xs text-muted-foreground/70">{formatJPDate(a.date)}</p>
              </Panel>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow="Today"
            title="本日の練習"
            action={
              <button
                onClick={() => onNavigate("calendar")}
                className="text-xs font-medium text-primary hover:underline"
              >
                予定表を見る
              </button>
            }
          />
          <Panel className="p-4">
            {todayEvents.length > 0 ? <ol className="relative space-y-4 pl-5">
              <span className="absolute left-[3px] top-1 h-[calc(100%-0.5rem)] w-px bg-border" />
              {todayEvents.map((event) => {
                const start = event.startTime ? new Date(`${event.date}T${event.startTime}:00+09:00`) : null
                const end = event.endTime ? new Date(`${event.date}T${event.endTime}:00+09:00`) : null
                const isNow = Boolean(start && end && now >= start && now <= end)
                return <li key={event.id} className="relative">
                  <span
                    className={cn(
                      "absolute -left-5 top-1.5 size-2 rounded-full ring-4 ring-card",
                      "bg-primary",
                    )}
                  />
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-medium text-foreground">
                      {event.title}
                      {isNow && <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[0.65rem] font-bold tracking-wider text-primary-foreground">NOW</span>}
                    </p>
                    <span className="shrink-0 font-mono text-xs text-primary">
                      {event.startTime ?? ""}{event.endTime ? `–${event.endTime}` : ""}
                    </span>
                  </div>
                  {event.detail && <p className="text-xs text-muted-foreground">{event.detail}</p>}
                </li>
              })}
            </ol> : <p className="text-sm text-muted-foreground">本日の予定はありません。</p>}
          </Panel>
        </section>
      </div>

      {/* Lost items */}
      <section>
        <SectionHeading
          eyebrow="Lost & Found"
          title="落とし物・紛失物"
          action={
            <button
              onClick={() => onNavigate("forms")}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <PackageSearch className="size-3.5" /> 紛失を連絡
            </button>
          }
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {lostItems.map((item) => (
            <figure
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card/70"
            >
              <div className="aspect-square overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <figcaption className="p-3">
                <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  {item.place}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  )
}
