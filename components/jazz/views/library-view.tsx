"use client"

import { useEffect, useRef, useState } from "react"
import { ExternalLink, FileMusic, Pause, Play, VolumeX } from "lucide-react"
import { useJazz, type Sheet } from "@/lib/jazz-store"
import { Panel, SectionHeading } from "@/components/jazz/primitives"
import { cn } from "@/lib/utils"

function toSeconds(d: string) {
  const [m, s] = d.split(":").map(Number)
  return m * 60 + s
}
function fmt(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}

export function LibraryView() {
  const { sheets } = useJazz()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [pos, setPos] = useState(0)
  const raf = useRef<ReturnType<typeof setInterval> | null>(null)

  const active = sheets.find((s) => s.id === activeId) ?? null
  const total = active ? toSeconds(active.duration) : 0

  useEffect(() => {
    if (playing) {
      raf.current = setInterval(() => {
        setPos((p) => {
          if (p + 1 >= total) {
            setPlaying(false)
            return total
          }
          return p + 1
        })
      }, 1000)
    }
    return () => {
      if (raf.current) clearInterval(raf.current)
    }
  }, [playing, total])

  function selectTrack(s: Sheet) {
    if (activeId === s.id) {
      setPlaying((p) => !p)
    } else {
      setActiveId(s.id)
      setPos(0)
      setPlaying(true)
    }
  }

  return (
    <div className="space-y-6 pb-28">
      <SectionHeading
        eyebrow="Google Drive Library"
        title="楽譜・音源ライブラリ"
        action={<span className="text-xs text-muted-foreground">{sheets.length} 曲</span>}
      />
      <p className="-mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Google Drive の情報の海から探す手間を省くため、所持している楽譜と音源をここに集約しています。
        再生ボタンで音源プレビュー、リンクから楽譜データを開けます。
      </p>

      <div className="space-y-3">
        {sheets.map((s) => {
          const isActive = activeId === s.id
          return (
            <Panel
              key={s.id}
              className={cn("p-4 transition-colors", isActive && "border-primary/50 bg-primary/5")}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => s.hasAudio && selectTrack(s)}
                  disabled={!s.hasAudio}
                  aria-label={s.hasAudio ? "再生 / 一時停止" : "音源なし"}
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-full transition-colors",
                    s.hasAudio
                      ? "bg-primary text-primary-foreground hover:bg-primary/85"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {!s.hasAudio ? (
                    <VolumeX className="size-5" />
                  ) : isActive && playing ? (
                    <Pause className="size-5" />
                  ) : (
                    <Play className="size-5 translate-x-0.5" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{s.title}</p>
                  <p className="truncate text-sm text-muted-foreground">{s.composer}</p>
                </div>
                <span className="hidden font-mono text-xs text-muted-foreground sm:block">
                  {s.duration}
                </span>
                <a
                  href={s.driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  <FileMusic className="size-4" />
                  <span className="hidden sm:inline">楽譜</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </Panel>
          )
        })}
      </div>

      {/* Now playing bar */}
      {active && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 backdrop-blur-md lg:pl-64">
          <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">
            <button
              onClick={() => setPlaying((p) => !p)}
              aria-label="再生 / 一時停止"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/85"
            >
              {playing ? <Pause className="size-5" /> : <Play className="size-5 translate-x-0.5" />}
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium text-foreground">{active.title}</p>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {fmt(pos)} / {active.duration}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-linear"
                  style={{ width: `${total ? (pos / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
