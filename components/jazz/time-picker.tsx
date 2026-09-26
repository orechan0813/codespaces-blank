"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { Check, Clock3, Minus, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

type TimePickerProps = {
  value: string
  onChange: (value: string) => void
}

type PickerStep = "hour" | "minute"

const hours = Array.from({ length: 12 }, (_, index) => index + 1)
const minuteMarks = Array.from({ length: 12 }, (_, index) => index * 5)

function formatHour(hour: number) {
  return String(hour).padStart(2, "0")
}

function formatTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<PickerStep>("hour")
  const [hour, setHour] = useState(9)
  const [minute, setMinute] = useState(0)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  const openPicker = () => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value)
    const parsedHour = match ? Number(match[1]) : 9
    setHour(parsedHour >= 0 && parsedHour <= 23 ? parsedHour : 9)
    setMinute(match ? Math.min(Number(match[2]), 59) : 0)
    setStep("hour")
    setOpen(true)
  }

  const commit = () => {
    onChange(formatTime(hour, minute))
    setOpen(false)
  }

  const hourButton = (clockHour: number, dialHour: number, isInner: boolean) => {
    const angle = (clockHour * 30 - 90) * (Math.PI / 180)
    const radius = isInner ? 58 : 96
    const style: CSSProperties = {
      left: `calc(50% + ${Math.cos(angle) * radius}px)`,
      top: `calc(50% + ${Math.sin(angle) * radius}px)`,
    }

    return (
      <button
        key={`${clockHour}-${dialHour}`}
        type="button"
        aria-label={`${dialHour === 0 ? "00" : dialHour}時`}
        aria-pressed={hour === dialHour}
        onClick={() => {
          setHour(dialHour)
          setStep("minute")
        }}
        className={`absolute z-10 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs transition-colors ${
          hour === dialHour ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-primary/15"
        }`}
        style={style}
      >
        {dialHour === 0 ? "00" : dialHour}
      </button>
    )
  }

  return (
    <>
      <div className="flex w-full items-center gap-1">
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={openPicker}
          className="inline-flex min-h-10 flex-1 items-center gap-2 rounded-lg border border-border bg-background/60 px-3.5 py-2.5 text-left text-sm text-foreground outline-none transition-colors hover:border-primary/70 focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <Clock3 className="size-4 text-muted-foreground" />
          <span className={value ? "font-mono" : "text-muted-foreground"}>{value || "時間を選択"}</span>
        </button>
        {value && (
          <button
            type="button"
            aria-label="時間をクリア"
            onClick={() => onChange("")}
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="時間を選択"
            className="w-full max-w-xs rounded-2xl border border-border bg-card p-5 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-pressed={step === "hour"}
                  onClick={() => setStep("hour")}
                  className={`rounded-lg px-2 py-1 font-mono text-3xl ${step === "hour" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
                >
                  {formatHour(hour)}
                </button>
                <span className="text-2xl text-muted-foreground">:</span>
                <button
                  type="button"
                  aria-pressed={step === "minute"}
                  onClick={() => setStep("minute")}
                  className={`rounded-lg px-2 py-1 font-mono text-3xl ${step === "minute" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
                >
                  {String(minute).padStart(2, "0")}
                </button>
              </div>
              <button
                type="button"
                aria-label="時間選択を閉じる"
                onClick={() => setOpen(false)}
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            {step === "minute" && <p className="mb-3 text-center text-xs text-muted-foreground">分を選択</p>}
            <div className="relative mx-auto size-64 rounded-full bg-muted/60">
              <div className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
              {step === "hour"
                ? hours.map((clockHour) => {
                    const clockPosition = clockHour % 12
                    const innerHour = clockHour === 12 ? 0 : clockHour + 12
                    return (
                      <span key={clockHour}>
                        {hourButton(clockPosition, clockHour, false)}
                        {hourButton(clockPosition, innerHour, true)}
                      </span>
                    )
                  })
                : minuteMarks.map((mark) => {
                    const angle = (mark * 6 - 90) * (Math.PI / 180)
                    const style: CSSProperties = {
                      left: `calc(50% + ${Math.cos(angle) * 96}px)`,
                      top: `calc(50% + ${Math.sin(angle) * 96}px)`,
                    }
                    return (
                      <button
                        key={mark}
                        type="button"
                        aria-label={`${String(mark).padStart(2, "0")}分`}
                        aria-pressed={minute === mark}
                        onClick={() => setMinute(mark)}
                        className={`absolute z-10 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs transition-colors ${
                          minute === mark ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-primary/15"
                        }`}
                        style={style}
                      >
                        {String(mark).padStart(2, "0")}
                      </button>
                    )
                  })}
            </div>

            {step === "minute" && (
              <div className="mt-4 flex items-center justify-center gap-4">
                <button
                  type="button"
                  aria-label="1分戻す"
                  onClick={() => setMinute((current) => (current + 59) % 60)}
                  className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="min-w-14 text-center font-mono text-sm">{String(minute).padStart(2, "0")}分</span>
                <button
                  type="button"
                  aria-label="1分進める"
                  onClick={() => setMinute((current) => (current + 1) % 60)}
                  className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={commit}
              className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <Check className="size-4" /> 時間を設定
            </button>
          </section>
        </div>
      )}
    </>
  )
}