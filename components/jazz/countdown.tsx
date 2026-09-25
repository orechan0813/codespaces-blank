"use client"

import { useEffect, useState } from "react"
import { getEventCountdownLabel } from "@/lib/jazz-store"

export function Countdown({ date, startTime }: { date: string; startTime?: string }) {
  const [label, setLabel] = useState(() => getEventCountdownLabel(date, startTime))

  useEffect(() => {
    setLabel(getEventCountdownLabel(date, startTime))
    const id = setInterval(() => setLabel(getEventCountdownLabel(date, startTime)), 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, startTime])

  return (
    <div className="rounded-xl border border-primary/20 bg-background/40 px-4 py-3 backdrop-blur">
      <div className="text-[0.65rem] tracking-[0.12em] text-muted-foreground">次の予定</div>
      <div className="mt-1 font-serif text-2xl font-bold text-primary gold-glow">{label}</div>
    </div>
  )
}
