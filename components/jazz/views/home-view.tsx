"use client"

import { useEffect, useState } from "react"
import { Clock, MapPin, Megaphone, PackageSearch, Pin } from "lucide-react"
import { formatJPDate, useJazz } from "@/lib/jazz-store"
import { Panel, SectionHeading, Tag } from "@/components/jazz/primitives"

export function HomeView({ onNavigate }: { onNavigate: (k: "calendar" | "library" | "forms") => void }) {
  const { currentUser, events, announcements, lostItems } = useJazz()
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

      {/* Today's schedule */}
      <Panel className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative space-y-3">
          <div>
            <Tag className="mb-2">TODAY</Tag>
            <h2 className="font-serif text-2xl font-semibold text-foreground">今日の予定</h2>
          </div>

          {todayEvents.length > 0 ? (
            <ol className="divide-y divide-border/70">
              {todayEvents.map((event) => {
                const start = event.startTime ? new Date(`${event.date}T${event.startTime}:00+09:00`) : null
                const end = event.endTime ? new Date(`${event.date}T${event.endTime}:00+09:00`) : null
                const isNow = Boolean(start && end && now >= start && now <= end)

                return (
                  <li key={event.id} className="flex flex-col gap-1.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-foreground">{event.title}</h3>
                        {isNow && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[0.65rem] font-bold text-primary-foreground">
                            NOW
                          </span>
                        )}
                      </div>
                      {event.detail && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{event.detail}</p>}
                    </div>
                    {event.startTime && (
                      <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-sm text-primary">
                        <Clock className="size-4" />
                        {event.startTime}〜{event.endTime ?? ""}
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">本日の予定はありません。</p>
          )}
        </div>
      </Panel>

      {/* Announcements */}
      <div>
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
        {lostItems.length > 0 ? (
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
        ) : (
          <p className="text-sm text-muted-foreground">現在、掲載中の落とし物はありません。</p>
        )}
      </section>
    </div>
  )
}
