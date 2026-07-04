"use client"

import { useEffect, useState } from "react"

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now())
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return { days, hours, minutes, seconds }
}

export function Countdown({ date, time }: { date: string; time?: string }) {
  const target = new Date(`${date}T${time ?? "00:00"}:00`)
  const [t, setT] = useState(() => diff(target))

  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, time])

  const cells = [
    { label: "日", value: t.days },
    { label: "時間", value: t.hours },
    { label: "分", value: t.minutes },
    { label: "秒", value: t.seconds },
  ]

  return (
    <div className="flex gap-2 sm:gap-3">
      {cells.map((c) => (
        <div
          key={c.label}
          className="flex min-w-14 flex-1 flex-col items-center rounded-xl border border-primary/20 bg-background/40 px-2 py-3 backdrop-blur sm:min-w-16"
        >
          <span className="font-serif text-3xl font-bold tabular-nums text-primary gold-glow sm:text-4xl">
            {String(c.value).padStart(2, "0")}
          </span>
          <span className="mt-1 text-[0.65rem] tracking-wide text-muted-foreground">{c.label}</span>
        </div>
      ))}
    </div>
  )
}
