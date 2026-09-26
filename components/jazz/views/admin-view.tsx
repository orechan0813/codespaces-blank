"use client"

import { useState } from "react"
import {
  CalendarPlus,
  Inbox,
  Lock,
  Megaphone,
  Music2,
  NotebookPen,
  Plus,
  Trash2,
  Users,
} from "lucide-react"
import {
  useJazz,
  formatJPDate,
  type EventType,
} from "@/lib/jazz-store"
import { Panel, SectionHeading, Tag, fieldClass, labelClass } from "@/components/jazz/primitives"
import { Button } from "@/components/ui/button"
import { TimePicker } from "@/components/jazz/time-picker"
import { cn } from "@/lib/utils"

const ADMIN_PASSWORD = "jazz2025"

type AdminTab = "schedule" | "announce" | "library" | "diary" | "inbox" | "members"

export function AdminView() {
  const [unlocked, setUnlocked] = useState(false)
  const [pw, setPw] = useState("")
  const [error, setError] = useState(false)
  const [tab, setTab] = useState<AdminTab>("schedule")

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-md pt-8">
        <Panel className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Lock className="size-6" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-foreground">管理者ログイン</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            この画面はパスワードで保護されています。
          </p>
          <form
            className="mt-6 space-y-3 text-left"
            onSubmit={(e) => {
              e.preventDefault()
              if (pw === ADMIN_PASSWORD) {
                setUnlocked(true)
                setError(false)
              } else {
                setError(true)
              }
            }}
          >
            <input
              type="password"
              className={cn(fieldClass, error && "border-destructive focus:border-destructive focus:ring-destructive/20")}
              placeholder="パスワード"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value)
                setError(false)
              }}
            />
            {error && <p className="text-xs text-destructive">パスワードが違います。</p>}
            <Button type="submit" size="lg" className="w-full">
              解除する
            </Button>
            <p className="text-center text-xs text-muted-foreground/70">デモ用パスワード：jazz2025</p>
          </form>
        </Panel>
      </div>
    )
  }

  const tabs: { key: AdminTab; label: string; icon: typeof CalendarPlus }[] = [
    { key: "schedule", label: "予定・練習", icon: CalendarPlus },
    { key: "announce", label: "全体連絡", icon: Megaphone },
    { key: "library", label: "楽譜・音源", icon: Music2 },
    { key: "diary", label: "日記", icon: NotebookPen },
    { key: "inbox", label: "提出物", icon: Inbox },
    { key: "members", label: "部員管理", icon: Users },
  ]

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Admin" title="管理者ダッシュボード" action={<Tag>権限あり</Tag>} />

      <div className="app-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {tabs.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors",
                tab === t.key
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === "schedule" && <ScheduleAdmin />}
      {tab === "announce" && <AnnounceAdmin />}
      {tab === "library" && <LibraryAdmin />}
      {tab === "diary" && <DiaryAdmin />}
      {tab === "inbox" && <InboxAdmin />}
      {tab === "members" && <MembersAdmin />}
    </div>
  )
}

function ScheduleAdmin() {
  const { events, addEvent, removeEvent, practice, addPractice, removePractice } = useJazz()
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [type, setType] = useState<EventType>("practice")
  const [detail, setDetail] = useState("")

  const [pStart, setPStart] = useState("")
  const [pEnd, setPEnd] = useState("")
  const [pTitle, setPTitle] = useState("")
  const todayJst = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
  const upcomingEvents = events
    .filter((event) => event.date >= todayJst)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime ?? "").localeCompare(b.startTime ?? ""))

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel>
        <h3 className="mb-4 font-medium text-foreground">イベント・予定を追加</h3>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (!title.trim() || !date) return
            addEvent({ title: title.trim(), date, startTime, endTime, type, detail: detail.trim() })
            setTitle("")
            setDate("")
            setStartTime("")
            setEndTime("")
            setDetail("")
          }}
        >
          <input className={fieldClass} placeholder="イベント名" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div>
            <label className={labelClass}>日付</label>
            <input type="date" className={fieldClass} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>開始時間</label>
              <TimePicker value={startTime} onChange={setStartTime} />
            </div>
            <div>
              <label className={labelClass}>終了時間</label>
              <TimePicker value={endTime} onChange={setEndTime} />
            </div>
          </div>
          <select className={fieldClass} value={type} onChange={(e) => setType(e.target.value as EventType)}>
            <option value="practice" className="bg-card">練習</option>
            <option value="live" className="bg-card">ライブ</option>
            <option value="contest" className="bg-card">大会</option>
          </select>
          <textarea className={cn(fieldClass, "min-h-20 resize-none")} placeholder="詳細" value={detail} onChange={(e) => setDetail(e.target.value)} />
          <Button type="submit" className="w-full" disabled={!title.trim() || !date}>
            <Plus className="size-4" /> 予定を追加
          </Button>
        </form>

        <div className="mt-5 space-y-2 border-t border-border pt-4">
          {upcomingEvents.map((e) => (
            <Row key={e.id} onDelete={() => removeEvent(e.id)}>
              <p className="truncate text-sm font-medium text-foreground">{e.title}</p>
              <p className="text-xs text-muted-foreground">{formatJPDate(e.date)}{e.startTime ? ` ${e.startTime}〜${e.endTime ?? ""}` : ""}</p>
            </Row>
          ))}
        </div>
      </Panel>

      <Panel>
        <h3 className="mb-4 font-medium text-foreground">本日の練習内容</h3>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (!pTitle.trim() || !pStart || !pEnd) return
            addPractice({ start: pStart, end_time: pEnd, title: pTitle.trim() })
            setPStart("")
            setPEnd("")
            setPTitle("")
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>開始</label>
              <TimePicker value={pStart} onChange={setPStart} />
            </div>
            <div>
              <label className={labelClass}>終了</label>
              <TimePicker value={pEnd} onChange={setPEnd} />
            </div>
          </div>
          <input className={fieldClass} placeholder="内容（例：A の曲）" value={pTitle} onChange={(e) => setPTitle(e.target.value)} />
          <Button type="submit" className="w-full" disabled={!pTitle.trim() || !pStart || !pEnd}>
            <Plus className="size-4" /> 練習内容を追加
          </Button>
        </form>

        <div className="mt-5 space-y-2 border-t border-border pt-4">
          {practice.map((p) => (
            <Row key={p.id} onDelete={() => removePractice(p.id)}>
              <p className="truncate text-sm font-medium text-foreground">{p.title}</p>
              <p className="font-mono text-xs text-primary">{p.start}–{p.end_time}</p>
            </Row>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function AnnounceAdmin() {
  const { announcements, addAnnouncement, removeAnnouncement } = useJazz()
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [pinned, setPinned] = useState(false)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel>
        <h3 className="mb-4 font-medium text-foreground">部員全体へ連絡を送信</h3>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (!title.trim()) return
            addAnnouncement({ title: title.trim(), body: body.trim(), pinned })
            setTitle("")
            setBody("")
            setPinned(false)
          }}
        >
          <input className={fieldClass} placeholder="件名" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className={cn(fieldClass, "min-h-28 resize-none")} placeholder="連絡内容" value={body} onChange={(e) => setBody(e.target.value)} />
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <Toggle checked={pinned} onChange={() => setPinned((p) => !p)} />
            トップに固定表示する
          </label>
          <Button type="submit" className="w-full" disabled={!title.trim()}>
            <Megaphone className="size-4" /> 送信する
          </Button>
        </form>
      </Panel>
      <div className="space-y-2">
        {announcements.map((a) => (
          <Panel key={a.id} className="p-4">
            <Row onDelete={() => removeAnnouncement(a.id)}>
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-foreground">{a.title}</p>
                {a.pinned && <Tag>固定</Tag>}
              </div>
              <p className="line-clamp-1 text-xs text-muted-foreground">{a.body}</p>
            </Row>
          </Panel>
        ))}
      </div>
    </div>
  )
}

function LibraryAdmin() {
  const { sheets, addSheet, removeSheet } = useJazz()
  const [title, setTitle] = useState("")
  const [composer, setComposer] = useState("")
  const [duration, setDuration] = useState("")
  const [driveLink, setDriveLink] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [audioDirectUrl, setAudioDirectUrl] = useState("")
  const [hasAudio, setHasAudio] = useState(true)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel>
        <h3 className="mb-1 font-medium text-foreground">楽譜・音源を追加</h3>
        <p className="mb-4 text-xs text-muted-foreground">この編集は管理者のみが行えます。</p>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (!title.trim()) return
            addSheet({
              title: title.trim(),
              composer: composer.trim() || "Unknown",
              duration: duration.trim() || "0:00",
              driveLink: driveLink.trim() || "https://drive.google.com/",
              youtubeUrl: youtubeUrl.trim(),
              audioDirectUrl: audioDirectUrl.trim(),
              hasAudio,
            })
            setTitle("")
            setComposer("")
            setDuration("")
            setDriveLink("")
            setYoutubeUrl("")
            setAudioDirectUrl("")
            setHasAudio(true)
          }}
        >
          <input className={fieldClass} placeholder="曲名" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className={fieldClass} placeholder="作曲者" value={composer} onChange={(e) => setComposer(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input className={fieldClass} placeholder="長さ（例：3:42）" value={duration} onChange={(e) => setDuration(e.target.value)} />
            <input className={fieldClass} placeholder="Drive リンク" value={driveLink} onChange={(e) => setDriveLink(e.target.value)} />
          </div>
          <input
            className={fieldClass}
            placeholder="YouTube リンク"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
          />
          <input
            className={fieldClass}
            placeholder="音源の直リンク URL (Google Driveなど)"
            value={audioDirectUrl}
            onChange={(e) => setAudioDirectUrl(e.target.value)}
          />
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <Toggle checked={hasAudio} onChange={() => setHasAudio((p) => !p)} />
            音源データあり
          </label>
          <Button type="submit" className="w-full" disabled={!title.trim()}>
            <Plus className="size-4" /> ライブラリに追加
          </Button>
        </form>
      </Panel>
      <div className="space-y-2">
        {sheets.map((s) => (
          <Panel key={s.id} className="p-4">
            <Row onDelete={() => removeSheet(s.id)}>
              <p className="truncate text-sm font-medium text-foreground">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.composer} · {s.duration}{s.hasAudio ? "" : " · 音源なし"}</p>
            </Row>
          </Panel>
        ))}
      </div>
    </div>
  )
}

function DiaryAdmin() {
  const { diary, addDiary, removeDiary } = useJazz()
  const [author, setAuthor] = useState("顧問 森田")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel>
        <h3 className="mb-4 font-medium text-foreground">日記を投稿</h3>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (!title.trim()) return
            addDiary({ author: author.trim() || "顧問", title: title.trim(), body: body.trim() })
            setTitle("")
            setBody("")
          }}
        >
          <input className={fieldClass} placeholder="投稿者名" value={author} onChange={(e) => setAuthor(e.target.value)} />
          <input className={fieldClass} placeholder="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className={cn(fieldClass, "min-h-28 resize-none")} placeholder="本文" value={body} onChange={(e) => setBody(e.target.value)} />
          <Button type="submit" className="w-full" disabled={!title.trim()}>
            <NotebookPen className="size-4" /> 投稿する
          </Button>
        </form>
      </Panel>
      <div className="space-y-2">
        {diary.map((d) => (
          <Panel key={d.id} className="p-4">
            <Row onDelete={() => removeDiary(d.id)}>
              <p className="truncate text-sm font-medium text-foreground">{d.title}</p>
              <p className="text-xs text-muted-foreground">{d.author} · {formatJPDate(d.date)}</p>
            </Row>
          </Panel>
        ))}
      </div>
    </div>
  )
}

function InboxAdmin() {
  const { absences, supplies, lostReports, resolveAbsence, resolveSupply, resolveLostReport } = useJazz()
  const todayJst = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
  const todaysAbsences = absences.filter((absence) => absence.date === todayJst)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-medium text-foreground">
          欠席連絡 <Tag>{todaysAbsences.length}</Tag>
        </h3>
        <div className="space-y-2">
          {todaysAbsences.length === 0 && <Empty label="本日の欠席連絡はありません" />}
          {todaysAbsences.map((a) => (
            <Panel key={a.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {a.memberName} <span className="text-muted-foreground">· {formatJPDate(a.date)}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-primary">{a.reason}</p>
                  {a.note && <p className="mt-1 text-xs text-muted-foreground">{a.note}</p>}
                </div>
                <Button size="sm" variant="outline" onClick={() => resolveAbsence(a.id)}>
                  確認済み
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 font-medium text-foreground">
          購入・修理希望 <Tag>{supplies.length}</Tag>
        </h3>
        <div className="space-y-2">
          {supplies.length === 0 && <Empty label="未対応の希望はありません" />}
          {supplies.map((s) => (
            <Panel key={s.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {s.item}{" "}
                    <Tag className={cn(s.kind === "repair" && "border-destructive/30 bg-destructive/10 text-destructive")}>
                      {s.kind === "purchase" ? "購入" : "修理"}
                    </Tag>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.reason}</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">{s.memberName} · {formatJPDate(s.date)}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => resolveSupply(s.id)}>
                  対応済み
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 font-medium text-foreground">
          紛失物連絡 <Tag>{lostReports.length}</Tag>
        </h3>
        <div className="space-y-2">
          {lostReports.length === 0 && <Empty label="未解決の紛失物連絡はありません" />}
          {lostReports.map((l) => (
            <Panel key={l.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{l.description}</p>
                  {l.place && <p className="mt-0.5 text-xs text-muted-foreground">{l.place}</p>}
                  <p className="mt-1 text-xs text-muted-foreground/70">{l.memberName} · {formatJPDate(l.date)}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => resolveLostReport(l.id)}>
                  解決済み
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  )
}

function MembersAdmin() {
  const { members, currentUser, toggleAdmin, removeMember } = useJazz()

  return (
    <Panel>
      <h3 className="mb-1 font-medium text-foreground">部員一覧</h3>
      <p className="mb-4 text-xs text-muted-foreground">
        管理権限の付与・剥奪、不要なアカウント（テストアカウント含む）の削除が行えます。
      </p>
      <div className="space-y-2">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-background/40 px-3 py-2.5"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
              {m.name.replace(/\s/g, "").slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {m.name}
                {currentUser?.id === m.id && <span className="ml-1 text-[0.65rem] text-muted-foreground">(自分)</span>}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {m.grade} / {m.part1}{m.part2 ? ` · ${m.part2}` : ""}
              </p>
            </div>
            <label className="flex cursor-pointer items-center gap-1.5 text-[0.7rem] text-muted-foreground">
              <span className="hidden sm:inline">管理者</span>
              <Toggle checked={m.isAdmin} onChange={() => toggleAdmin(m.id)} />
            </label>
            <button
              onClick={() => removeMember(m.id)}
              disabled={currentUser?.id === m.id}
              aria-label="アカウントを削除"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive disabled:pointer-events-none disabled:opacity-30"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </Panel>
  )
}

/* ------------------------------ small helpers ----------------------------- */

function Row({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">{children}</div>
      <button
        onClick={onDelete}
        aria-label="削除"
        className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "inline-block size-4 rounded-full bg-background transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </button>
  )
}

function Empty({ label }: { label: string }) {
  return (
    <Panel className="flex items-center gap-2 text-sm text-muted-foreground">
      <Inbox className="size-4" /> {label}
    </Panel>
  )
}
