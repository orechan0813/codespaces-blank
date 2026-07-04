"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Clock, Info } from "lucide-react"
import { useJazz, formatJPDate, type ClubEvent } from "@/lib/jazz-store"
import { Panel, SectionHeading, Tag } from "@/components/jazz/primitives"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"]
const TYPE_DOT: Record<ClubEvent["type"], string> = {
  live: "bg-primary",
  contest: "bg-destructive",
  practice: "bg-muted-foreground",
}
const TYPE_LABEL: Record<ClubEvent["type"], string> = {
  live: "ライブ",
  contest: "大会",
  practice: "練習",
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function CalendarView() {
  const { events } = useJazz()
  const today = new Date()
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selected, setSelected] = useState<string | null>(ymd(today))

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const eventsByDate = events.reduce<Record<string, ClubEvent[]>>((acc, e) => {
    ;(acc[e.date] ??= []).push(e)
    return acc
  }, {})

  const selectedEvents = selected ? (eventsByDate[selected] ?? []) : []

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Schedule" title="練習・イベント予定表" />

      <Panel>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold text-foreground">
            {year}年 {month + 1}月
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              aria-label="前の月"
              className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
              className="rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              今月
            </button>
            <button
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              aria-label="次の月"
              className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((w, i) => (
            <div
              key={w}
              className={cn(
                "pb-2 text-xs font-medium",
                i === 0 ? "text-destructive/80" : i === 6 ? "text-primary/80" : "text-muted-foreground",
              )}
            >
              {w}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />
            const dateStr = ymd(new Date(year, month, day))
            const dayEvents = eventsByDate[dateStr] ?? []
            const isToday = dateStr === ymd(today)
            const isSelected = dateStr === selected
            return (
              <button
                key={dateStr}
                onClick={() => setSelected(dateStr)}
                className={cn(
                  "flex aspect-square flex-col items-center rounded-xl border p-1 text-sm transition-colors",
                  isSelected
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-transparent hover:bg-muted",
                  isToday && !isSelected && "border-primary/40",
                )}
              >
                <span className={cn("mt-0.5 font-medium", isToday && "text-primary")}>{day}</span>
                <span className="mt-auto flex items-center gap-0.5 pb-0.5">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span key={e.id} className={cn("size-1.5 rounded-full", TYPE_DOT[e.type])} />
                  ))}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
          {(Object.keys(TYPE_LABEL) as ClubEvent["type"][]).map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full", TYPE_DOT[t])} />
              {TYPE_LABEL[t]}
            </span>
          ))}
        </div>
      </Panel>

      <section>
        <h3 className="mb-3 font-serif text-lg font-semibold text-foreground">
          {selected ? formatJPDate(selected) : "日付を選択"}
        </h3>
        {selectedEvents.length === 0 ? (
          <Panel className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="size-4" /> この日に登録された予定はありません。
          </Panel>
        ) : (
          <div className="space-y-3">
            {selectedEvents.map((e) => (
              <Panel key={e.id} className="p-4">
                <div className="mb-1.5 flex items-center gap-2">
                  <Tag className={cn(e.type === "contest" && "border-destructive/30 bg-destructive/10 text-destructive")}>
                    {TYPE_LABEL[e.type]}
                  </Tag>
                  {e.time && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3.5 text-primary" />
                      {e.time}〜
                    </span>
                  )}
                </div>
                <h4 className="font-medium text-foreground">{e.title}</h4>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{e.detail}</p>
              </Panel>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
