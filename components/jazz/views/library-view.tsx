"use client"

import { useEffect, useRef, useState } from "react"
import { ExternalLink, FileMusic, Pause, Play } from "lucide-react"
import { useJazz, type Score } from "@/lib/jazz-store"
import { Panel, SectionHeading } from "@/components/jazz/primitives"
import { cn } from "@/lib/utils"

function fmt(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}

export function LibraryView() {
  const { sheets } = useJazz()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [active, setActive] = useState<Score | null>(null)
  const [playing, setPlaying] = useState(false)
  const [pos, setPos] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const audio = new Audio()
    audio.preload = "metadata"
    audioRef.current = audio
    const updatePosition = () => setPos(audio.currentTime)
    const updateDuration = () => setTotal(Number.isFinite(audio.duration) ? audio.duration : 0)
    const onEnded = () => setPlaying(false)
    audio.addEventListener("timeupdate", updatePosition)
    audio.addEventListener("durationchange", updateDuration)
    audio.addEventListener("ended", onEnded)

    return () => {
      audio.pause()
      audio.removeEventListener("timeupdate", updatePosition)
      audio.removeEventListener("durationchange", updateDuration)
      audio.removeEventListener("ended", onEnded)
      audioRef.current = null
    }
  }, [])

  async function selectTrack(score: Score) {
    const audio = audioRef.current
    if (!audio) return
    if (active?.id === score.id) {
      if (audio.paused) {
        try {
          await audio.play()
          setPlaying(true)
        } catch (error) {
          console.error("Audio playback failed", error)
        }
      } else {
        audio.pause()
        setPlaying(false)
      }
    } else {
      audio.pause()
      audio.src = score.audio_url
      audio.load()
      setActive(score)
      setPos(0)
      setTotal(0)
      try {
        await audio.play()
        setPlaying(true)
      } catch (error) {
        console.error("Audio playback failed", error)
        setPlaying(false)
      }
    }
  }

  async function togglePlayback() {
    const audio = audioRef.current
    if (!audio || !active) return
    if (audio.paused) {
      try {
        await audio.play()
        setPlaying(true)
      } catch (error) {
        console.error("Audio playback failed", error)
      }
    } else {
      audio.pause()
      setPlaying(false)
    }
  }

  return (
    <div className="space-y-6 pb-28">
      <SectionHeading
        eyebrow="Google Drive Library"
        title="楽譜・音源ライブラリ"
        action={<span className="text-xs text-muted-foreground">{sheets.length} 曲</span>}
      />

      <div className="space-y-3">
        {sheets.map((s) => {
          const isActive = active?.id === s.id
          return (
            <Panel
              key={s.id}
              className={cn("p-4 transition-colors", isActive && "border-primary/50 bg-primary/5")}
            >
              <div className="flex items-center gap-4">
                {s.audio_url ? (
                  <button
                    onClick={() => void selectTrack(s)}
                    aria-label={isActive && playing ? "一時停止" : "再生"}
                    className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/85"
                  >
                    {isActive && playing ? <Pause className="size-5" /> : <Play className="size-5 translate-x-0.5" />}
                  </button>
                ) : s.youtube_url ? (
                  <a
                    href={s.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTubeで開く"
                    className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <ExternalLink className="size-5" />
                  </a>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{s.title}</p>
                  <p className="truncate text-sm text-muted-foreground">{s.composer}</p>
                </div>
                {s.drive_url && (
                  <a
                    href={s.drive_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <FileMusic className="size-4" />
                    <span className="hidden sm:inline">楽譜</span>
                    <ExternalLink className="size-3" />
                  </a>
                )}
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
              onClick={() => void togglePlayback()}
              aria-label="再生 / 一時停止"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/85"
            >
              {playing ? <Pause className="size-5" /> : <Play className="size-5 translate-x-0.5" />}
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium text-foreground">{active.title}</p>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {fmt(pos)} / {fmt(total)}
                </span>
              </div>
              <div className="relative mt-1 h-6">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${total ? Math.min((pos / total) * 100, 100) : 0}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={total || 0}
                  step={0.1}
                  value={Math.min(pos, total)}
                  disabled={!total}
                  aria-label="再生位置"
                  aria-valuetext={`${fmt(pos)} / ${fmt(total)}`}
                  onChange={(event) => {
                    const nextPosition = Number(event.currentTarget.value)
                    setPos(nextPosition)
                    const audio = audioRef.current
                    if (audio && Number.isFinite(nextPosition)) {
                      audio.currentTime = nextPosition
                    }
                  }}
                  className="absolute inset-0 z-10 h-6 w-full cursor-pointer appearance-none bg-transparent text-primary disabled:cursor-not-allowed [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-current [&::-moz-range-track]:h-6 [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-6 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-[6px] [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-current"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
