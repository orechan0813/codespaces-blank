"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { getSupabaseSetupMessage, isSupabaseConfigured, supabase } from "@/lib/supabase-client"

/* ---------------------------------- types --------------------------------- */

export type Grade = "1年" | "2年" | "3年"

export type Member = {
  id: string
  name: string
  grade: Grade
  part1: string
  part2: string
  isAdmin: boolean
}

export type EventType = "live" | "contest" | "practice"

export type ClubEvent = {
  id: string
  date: string // YYYY-MM-DD
  time?: string
  title: string
  detail: string
  type: EventType
}

export type PracticeItem = {
  id: string
  start: string
  end_time: string
  title: string
  note?: string
}

export type Announcement = {
  id: string
  date: string
  title: string
  body: string
  pinned?: boolean
}

export type LostItem = {
  id: string
  title: string
  image: string
  place: string
  date: string
}

export type Sheet = {
  id: string
  title: string
  composer: string
  driveLink: string
  youtubeUrl: string
  audioDirectUrl: string
  duration: string
  hasAudio: boolean
}

export type DiaryEntry = {
  id: string
  date: string
  author: string
  title: string
  body: string
}

export type AbsenceReport = {
  id: string
  memberName: string
  date: string
  reason: string
  note?: string
}

export type SupplyRequest = {
  id: string
  memberName: string
  kind: "purchase" | "repair"
  item: string
  reason: string
  date: string
}

export type LostReport = {
  id: string
  memberName: string
  description: string
  place: string
  date: string
}

export type Toast = { id: string; message: string; tone: "gold" | "danger" }

/* --------------------------------- helpers -------------------------------- */

const uid = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const iso = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d)

function dateFromNow(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return iso(d)
}

/* --------------------------------- seed ----------------------------------- */

const PARTS = [
  "Alto Sax",
  "Tenor Sax",
  "Bari Sax",
  "Trumpet",
  "Trombone",
  "Piano",
  "Guitar",
  "Bass",
  "Drums",
  "Vocal",
]

const seedMembers: Member[] = [
  { id: uid(), name: "佐藤 陽菜", grade: "2年", part1: "Alto Sax", part2: "Vocal", isAdmin: true },
  { id: uid(), name: "田中 蓮", grade: "3年", part1: "Trumpet", part2: "", isAdmin: true },
  { id: uid(), name: "鈴木 美咲", grade: "1年", part1: "Piano", part2: "", isAdmin: false },
  { id: uid(), name: "高橋 大輝", grade: "2年", part1: "Drums", part2: "", isAdmin: false },
  { id: uid(), name: "テスト アカウント", grade: "1年", part1: "Bass", part2: "", isAdmin: false },
]

const seedEvents: ClubEvent[] = [
  {
    id: uid(),
    date: dateFromNow(9),
    time: "18:00",
    title: "定期ライブ vol.12「Midnight Groove」",
    detail: "船橋市民文化ホール 大ホール。集合16:00、リハーサル16:30〜。",
    type: "live",
  },
  {
    id: uid(),
    date: dateFromNow(24),
    time: "10:00",
    title: "県高校ビッグバンドコンテスト 予選",
    detail: "千葉県文化会館。演奏曲は課題曲＋自由曲の2曲。",
    type: "contest",
  },
  {
    id: uid(),
    date: dateFromNow(2),
    time: "13:00",
    title: "合奏練習（全体）",
    detail: "音楽室。ライブ本番に向けた通し練習。",
    type: "practice",
  },
  {
    id: uid(),
    date: dateFromNow(5),
    time: "13:00",
    title: "セクション練習",
    detail: "サックス・金管・リズム隊で分かれて練習。",
    type: "practice",
  },
]

const seedPractice: PracticeItem[] = [
  { id: uid(), start: "13:00", end_time: "14:00", title: "基礎合奏 / ロングトーン", note: "全員" },
  { id: uid(), start: "14:00", end_time: "15:30", title: "A曲「Take the A Train」", note: "通し＋サビ重点" },
  { id: uid(), start: "15:30", end_time: "15:45", title: "休憩" },
  { id: uid(), start: "15:45", end_time: "17:00", title: "B曲「Sing, Sing, Sing」", note: "ソロ回し確認" },
  { id: uid(), start: "17:00", end_time: "17:30", title: "録音チェック / 片付け" },
]

const seedAnnouncements: Announcement[] = [
  {
    id: uid(),
    date: dateFromNow(-1),
    title: "定期ライブのチケットについて",
    body: "定期ライブのチケットを配布しました。家族・友人ぶんが必要な人は木曜までに顧問へ申し出てください。",
    pinned: true,
  },
  {
    id: uid(),
    date: dateFromNow(-3),
    title: "楽器庫の鍵の管理",
    body: "最終下校時は必ず施錠し、鍵を職員室に返却してください。紛失が続いています。",
  },
  {
    id: uid(),
    date: dateFromNow(-6),
    title: "新歓ステージのお知らせ",
    body: "来月の新入生歓迎ステージに向けて、パートリーダーは編成を提出してください。",
  },
]

const seedLost: LostItem[] = [
  { id: uid(), title: "ネイビーの水筒", image: "/lost/water-bottle.png", place: "音楽室", date: dateFromNow(-2) },
  { id: uid(), title: "黒いメトロノーム", image: "/lost/metronome.png", place: "第2練習室", date: dateFromNow(-4) },
  { id: uid(), title: "紺のカーディガン", image: "/lost/cardigan.png", place: "楽器庫前", date: dateFromNow(-5) },
  { id: uid(), title: "リードケース", image: "/lost/reed-case.png", place: "音楽準備室", date: dateFromNow(-7) },
]

const seedSheets: Sheet[] = [
  { id: uid(), title: "Take the A Train", composer: "Billy Strayhorn", driveLink: "https://drive.google.com/", youtubeUrl: "", audioDirectUrl: "", duration: "3:42", hasAudio: true },
  { id: uid(), title: "Sing, Sing, Sing", composer: "Louis Prima", driveLink: "https://drive.google.com/", youtubeUrl: "", audioDirectUrl: "", duration: "5:18", hasAudio: true },
  { id: uid(), title: "In the Mood", composer: "Joe Garland", driveLink: "https://drive.google.com/", youtubeUrl: "", audioDirectUrl: "", duration: "3:34", hasAudio: true },
  { id: uid(), title: "Moanin'", composer: "Bobby Timmons", driveLink: "https://drive.google.com/", youtubeUrl: "", audioDirectUrl: "", duration: "4:05", hasAudio: false },
  { id: uid(), title: "Spain", composer: "Chick Corea", driveLink: "https://drive.google.com/", youtubeUrl: "", audioDirectUrl: "", duration: "6:12", hasAudio: true },
]

const seedDiary: DiaryEntry[] = [
  {
    id: uid(),
    date: dateFromNow(-1),
    author: "顧問 森田",
    title: "音がまとまってきた",
    body: "今日の合奏、A曲のサビでようやくセクションの縦が揃ってきました。ライブまでもう一息。金管はスタミナ配分を意識して。",
  },
  {
    id: uid(),
    date: dateFromNow(-4),
    author: "顧問 森田",
    title: "聴くことの練習",
    body: "上手い演奏は「聴く」ことから。隣の人の音、リズム隊のノリを感じながら吹けると一気に景色が変わります。",
  },
  {
    id: uid(),
    date: dateFromNow(-8),
    author: "顧問 森田",
    title: "新入部員へ",
    body: "楽器に触れる時間を毎日少しでも。焦らず、でも確実に。3ヶ月後の自分を楽しみに。",
  },
]

const seedAbsences: AbsenceReport[] = [
  { id: uid(), memberName: "鈴木 美咲", date: dateFromNow(2), reason: "習い事・塾", note: "数学の補習のため15分遅刻します" },
  { id: uid(), memberName: "高橋 大輝", date: dateFromNow(1), reason: "他部活に行く", note: "" },
]

const seedSupplies: SupplyRequest[] = [
  { id: uid(), memberName: "田中 蓮", kind: "purchase", item: "トランペット用ミュート", reason: "共用のものが破損したため", date: dateFromNow(-2) },
  { id: uid(), memberName: "高橋 大輝", kind: "repair", item: "スネアドラムの皮", reason: "ヘッドが破れて音が出ない", date: dateFromNow(-3) },
]

const seedLostReports: LostReport[] = [
  { id: uid(), memberName: "鈴木 美咲", description: "青いチューナーを探しています", place: "音楽室のロッカー付近", date: dateFromNow(-1) },
]

async function loadFromSupabase<T>(table: string, mapper: (row: Record<string, unknown>) => T): Promise<T[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from(table).select("*")
  if (error) {
    console.error(`Supabase load failed for ${table}`, error)
    return []
  }
  return (data ?? []).map((row) => mapper(row as Record<string, unknown>))
}

async function persistToSupabase<T extends { id: string }>(table: string, row: T) {
  if (!supabase) return
  const { error } = await supabase.from(table).upsert(row, { onConflict: "id" })
  if (error) {
    console.error(`Supabase save failed for ${table}`, error)
  }
}

async function deleteFromSupabase(table: string, id: string) {
  if (!supabase) return
  const { error } = await supabase.from(table).delete().eq("id", id)
  if (error) {
    console.error(`Supabase delete failed for ${table}`, error)
  }
}

function normalizeMember(row: Record<string, unknown>): Member {
  const name = String(row.name ?? "")
  const grade = (row.grade as Grade) ?? "1年"
  const part1 = String(row.part1 ?? "")
  const part2 = String(row.part2 ?? "")
  const isAdmin = Boolean(row.isAdmin ?? row.is_admin ?? false)
  return {
    id: String(row.id ?? uid()),
    name,
    grade,
    part1,
    part2,
    isAdmin,
  }
}

function normalizeEvent(row: Record<string, unknown>): ClubEvent {
  return {
    id: String(row.id ?? uid()),
    date: String(row.date ?? ""),
    time: row.time ? String(row.time) : undefined,
    title: String(row.title ?? ""),
    detail: String(row.detail ?? ""),
    type: (row.type as EventType) ?? "practice",
  }
}

function normalizePractice(row: Record<string, unknown>): PracticeItem {
  return {
    id: String(row.id ?? uid()),
    start: String(row.start ?? ""),
    end_time: String(row.end_time ?? row.end ?? ""),
    title: String(row.title ?? ""),
    note: row.note ? String(row.note) : undefined,
  }
}

function normalizeAnnouncement(row: Record<string, unknown>): Announcement {
  return {
    id: String(row.id ?? uid()),
    date: String(row.date ?? ""),
    title: String(row.title ?? ""),
    body: String(row.body ?? ""),
    pinned: Boolean(row.pinned ?? false),
  }
}

function normalizeLostItem(row: Record<string, unknown>): LostItem {
  return {
    id: String(row.id ?? uid()),
    title: String(row.title ?? ""),
    image: String(row.image ?? ""),
    place: String(row.place ?? ""),
    date: String(row.date ?? ""),
  }
}

function normalizeSheet(row: Record<string, unknown>): Sheet {
  return {
    id: String(row.id ?? uid()),
    title: String(row.title ?? ""),
    composer: String(row.composer ?? ""),
    driveLink: String(row.driveLink ?? row.drive_link ?? ""),
    youtubeUrl: String(row.youtubeUrl ?? row.youtube_url ?? ""),
    audioDirectUrl: String(row.audioDirectUrl ?? row.audio_direct_url ?? ""),
    duration: String(row.duration ?? ""),
    hasAudio: Boolean(row.hasAudio ?? row.has_audio ?? false),
  }
}

function normalizeDiary(row: Record<string, unknown>): DiaryEntry {
  return {
    id: String(row.id ?? uid()),
    date: String(row.date ?? ""),
    author: String(row.author ?? ""),
    title: String(row.title ?? ""),
    body: String(row.body ?? ""),
  }
}

function normalizeAbsence(row: Record<string, unknown>): AbsenceReport {
  return {
    id: String(row.id ?? uid()),
    memberName: String(row.memberName ?? row.member_name ?? ""),
    date: String(row.date ?? ""),
    reason: String(row.reason ?? ""),
    note: row.note ? String(row.note) : undefined,
  }
}

function normalizeLostReport(row: Record<string, unknown>): LostReport {
  return {
    id: String(row.id ?? uid()),
    memberName: String(row.memberName ?? row.member_name ?? ""),
    description: String(row.description ?? ""),
    place: String(row.place ?? ""),
    date: String(row.date ?? ""),
  }
}

/* ------------------------------- context ---------------------------------- */

export const ABSENCE_REASONS = [
  "公欠（大会・行事など）",
  "体調不良・風邪",
  "習い事・塾",
  "家庭の都合",
  "他部活に行く",
  "その他（備考に記入）",
] as const

type Store = {
  currentUser: Member | null
  members: Member[]
  events: ClubEvent[]
  practice: PracticeItem[]
  announcements: Announcement[]
  lostItems: LostItem[]
  sheets: Sheet[]
  diary: DiaryEntry[]
  absences: AbsenceReport[]
  supplies: SupplyRequest[]
  lostReports: LostReport[]
  toasts: Toast[]
  parts: string[]
  // auth
  register: (m: Omit<Member, "id" | "isAdmin">) => void
  login: (id: string) => void
  logout: () => void
  enterAdminMode: (password: string) => boolean
  exitAdminMode: () => void
  // toast
  toast: (message: string, tone?: Toast["tone"]) => void
  // member forms
  submitAbsence: (r: Omit<AbsenceReport, "id">) => void
  submitSupply: (r: Omit<SupplyRequest, "id" | "date">) => void
  submitLostReport: (r: Omit<LostReport, "id" | "date">) => void
  // admin
  addEvent: (e: Omit<ClubEvent, "id">) => void
  removeEvent: (id: string) => void
  addPractice: (p: Omit<PracticeItem, "id">) => void
  removePractice: (id: string) => void
  addAnnouncement: (a: Omit<Announcement, "id" | "date">) => void
  removeAnnouncement: (id: string) => void
  addSheet: (s: Omit<Sheet, "id">) => void
  removeSheet: (id: string) => void
  addDiary: (d: Omit<DiaryEntry, "id" | "date">) => void
  removeDiary: (id: string) => void
  toggleAdmin: (id: string) => void
  removeMember: (id: string) => void
  resolveAbsence: (id: string) => void
  resolveSupply: (id: string) => void
  resolveLostReport: (id: string) => void
}

export const ADMIN_PASSWORD = "jazz2025"

const JazzContext = createContext<Store | null>(null)

export function JazzProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Member | null>(null)
  const currentUserIdRef = useRef<string | null>(null)
  currentUserIdRef.current = currentUser?.id ?? null
  const [members, setMembers] = useState<Member[]>([])
  const [events, setEvents] = useState<ClubEvent[]>([])
  const [practice, setPractice] = useState<PracticeItem[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [lostItems, setLostItems] = useState<LostItem[]>([])
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [diary, setDiary] = useState<DiaryEntry[]>([])
  const [absences, setAbsences] = useState<AbsenceReport[]>(seedAbsences)
  const [supplies, setSupplies] = useState<SupplyRequest[]>(seedSupplies)
  const [lostReports, setLostReports] = useState<LostReport[]>(seedLostReports)
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const toast = useCallback((message: string, tone: Toast["tone"] = "gold") => {
    const id = uid()
    setToasts((t) => [...t, { id, message, tone }])
    timers.current[id] = setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
      delete timers.current[id]
    }, 1000)
  }, [])

  useEffect(() => {
    const setupMessage = getSupabaseSetupMessage()
    if (setupMessage) {
      toast(setupMessage, "danger")
      return
    }

    if (!isSupabaseConfigured() || !supabase) return

    let active = true

    const load = async () => {
      const [memberRows, eventRows, practiceRows, announcementRows, lostItemRows, sheetRows, diaryRows, absenceRows, lostReportRows] = await Promise.all([
        loadFromSupabase("members", normalizeMember),
        loadFromSupabase("club_events", normalizeEvent),
        loadFromSupabase("practice_items", normalizePractice),
        loadFromSupabase("announcements", normalizeAnnouncement),
        loadFromSupabase("lost_items", normalizeLostItem),
        loadFromSupabase("music_scores", normalizeSheet),
        loadFromSupabase("diary_entries", normalizeDiary),
        loadFromSupabase("absence_reports", normalizeAbsence),
        loadFromSupabase("lost_reports", normalizeLostReport),
      ])

      if (!active) return

      if (memberRows.length > 0) setMembers(memberRows)
      setEvents(eventRows)
      setPractice(practiceRows)
      setAnnouncements(announcementRows)
      if (lostItemRows.length > 0) setLostItems(lostItemRows)
      if (sheetRows.length > 0) setSheets(sheetRows)
      if (diaryRows.length > 0) setDiary(diaryRows)
      if (absenceRows.length > 0) setAbsences(absenceRows)
      if (lostReportRows.length > 0) setLostReports(lostReportRows)
    }

    void load()

    return () => {
      active = false
    }
  }, [toast])

  const register = useCallback((m: Omit<Member, "id" | "isAdmin">) => {
    const member: Member = { ...m, id: uid(), isAdmin: false }
    setMembers((prev) => [...prev, member])
    setCurrentUser(member)
    void persistToSupabase("members", {
      id: member.id,
      name: member.name,
      grade: member.grade,
      part1: member.part1,
      part2: member.part2,
      is_admin: member.isAdmin,
    })
  }, [])

  const login = useCallback(
    (id: string) => {
      const m = members.find((x) => x.id === id)
      if (m) setCurrentUser(m)
    },
    [members],
  )

  const logout = useCallback(() => setCurrentUser(null), [])

  const enterAdminMode = useCallback((password: string) => {
    if (password !== ADMIN_PASSWORD) return false
    setCurrentUser((cu) => (cu ? { ...cu, isAdmin: true } : cu))
    setMembers((prev) =>
      prev.map((m) => (currentUserIdRef.current && m.id === currentUserIdRef.current ? { ...m, isAdmin: true } : m)),
    )
    return true
  }, [])

  const exitAdminMode = useCallback(() => {
    setCurrentUser((cu) => (cu ? { ...cu, isAdmin: false } : cu))
    setMembers((prev) =>
      prev.map((m) => (currentUserIdRef.current && m.id === currentUserIdRef.current ? { ...m, isAdmin: false } : m)),
    )
  }, [])

  const submitAbsence = useCallback(
    (r: Omit<AbsenceReport, "id">) => {
      const report = { ...r, id: uid() }
      setAbsences((prev) => [report, ...prev])
      void persistToSupabase("absence_reports", {
        id: report.id,
        member_name: report.memberName,
        date: report.date,
        reason: report.reason,
        note: report.note ?? "",
      })
      toast("欠席連絡を送信しました")
    },
    [toast],
  )

  const submitSupply = useCallback(
    (r: Omit<SupplyRequest, "id" | "date">) => {
      setSupplies((prev) => [{ ...r, id: uid(), date: iso(new Date()) }, ...prev])
      toast("希望を提出しました")
    },
    [toast],
  )

  const submitLostReport = useCallback(
    (r: Omit<LostReport, "id" | "date">) => {
      const report = { ...r, id: uid(), date: iso(new Date()) }
      setLostReports((prev) => [report, ...prev])
      void persistToSupabase("lost_reports", {
        id: report.id,
        member_name: report.memberName,
        description: report.description,
        place: report.place,
        date: report.date,
      })
      toast("紛失物を連絡しました")
    },
    [toast],
  )

  const addEvent = useCallback(
    (e: Omit<ClubEvent, "id">) => {
      const event = { ...e, id: uid() }
      setEvents((prev) => [...prev, event])
      void persistToSupabase("club_events", {
        id: event.id,
        date: event.date,
        time: event.time ?? "",
        title: event.title,
        detail: event.detail,
        type: event.type,
      })
      toast("予定を追加しました")
    },
    [toast],
  )
  const removeEvent = useCallback(
    (id: string) => {
      setEvents((prev) => prev.filter((x) => x.id !== id))
      void deleteFromSupabase("club_events", id)
      toast("予定を削除しました", "danger")
    },
    [toast],
  )
  const addPractice = useCallback(
    (p: Omit<PracticeItem, "id">) => {
      const practiceItem = { ...p, id: uid() }
      setPractice((prev) => [...prev, practiceItem].sort((a, b) => a.start.localeCompare(b.start)))
      void persistToSupabase("practice_items", {
        id: practiceItem.id,
        start: practiceItem.start,
        end_time: practiceItem.end_time,
        title: practiceItem.title,
        note: practiceItem.note ?? "",
      })
      toast("練習内容を追加しました")
    },
    [toast],
  )
  const removePractice = useCallback(
    (id: string) => {
      setPractice((prev) => prev.filter((x) => x.id !== id))
      void deleteFromSupabase("practice_items", id)
      toast("練習内容を削除しました", "danger")
    },
    [toast],
  )
  const addAnnouncement = useCallback(
    (a: Omit<Announcement, "id" | "date">) => {
      const announcement = { ...a, id: uid(), date: iso(new Date()) }
      setAnnouncements((prev) => [announcement, ...prev])
      void persistToSupabase("announcements", {
        id: announcement.id,
        date: announcement.date,
        title: announcement.title,
        body: announcement.body,
        pinned: announcement.pinned ?? false,
      })

      const discordMessage = `【全体連絡】\nタイトル: ${announcement.title.trim() || "（タイトルなし）"}\n\n${announcement.body.trim() || "（本文なし）"}`
      void fetch("https://discord.com/api/webhooks/1524263755964350466/LPJ1JS9X7ytpnTN9XmtDSdBxXrsm_D_bkEkHM1DvtQKyuSNekQT9VmzAR_pBbS2qZWwn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: discordMessage,
        }),
      }).catch((error) => {
        console.error("Discord announcement webhook failed", error)
      })

      toast("全体連絡を送信しました")
    },
    [toast],
  )
  const removeAnnouncement = useCallback(
    (id: string) => {
      setAnnouncements((prev) => prev.filter((x) => x.id !== id))
      void deleteFromSupabase("announcements", id)
      toast("連絡を削除しました", "danger")
    },
    [toast],
  )
  const addSheet = useCallback(
    (s: Omit<Sheet, "id">) => {
      const sheet = { ...s, id: uid() }
      setSheets((prev) => [...prev, sheet])
      void persistToSupabase("music_scores", {
        id: sheet.id,
        title: sheet.title,
        composer: sheet.composer,
        drive_link: sheet.driveLink,
        youtube_url: sheet.youtubeUrl,
        audio_direct_url: sheet.audioDirectUrl,
        duration: sheet.duration,
        has_audio: sheet.hasAudio,
      })
      toast("楽譜・音源を追加しました")
    },
    [toast],
  )
  const removeSheet = useCallback(
    (id: string) => {
      setSheets((prev) => prev.filter((x) => x.id !== id))
      void deleteFromSupabase("music_scores", id)
      toast("楽譜・音源を削除しました", "danger")
    },
    [toast],
  )
  const addDiary = useCallback(
    (d: Omit<DiaryEntry, "id" | "date">) => {
      const entry = { ...d, id: uid(), date: iso(new Date()) }
      setDiary((prev) => [entry, ...prev])
      void persistToSupabase("diary_entries", {
        id: entry.id,
        date: entry.date,
        author: entry.author,
        title: entry.title,
        body: entry.body,
      })
      toast("日記を投稿しました")
    },
    [toast],
  )
  const removeDiary = useCallback(
    (id: string) => {
      setDiary((prev) => prev.filter((x) => x.id !== id))
      void deleteFromSupabase("diary_entries", id)
      toast("日記を削除しました", "danger")
    },
    [toast],
  )
  const toggleAdmin = useCallback(
    (id: string) => {
      setMembers((prev) => {
        const next = prev.map((m) => (m.id === id ? { ...m, isAdmin: !m.isAdmin } : m))
        const target = next.find((m) => m.id === id)
        if (target) {
          void persistToSupabase("members", {
            id: target.id,
            name: target.name,
            grade: target.grade,
            part1: target.part1,
            part2: target.part2,
            is_admin: target.isAdmin,
          })
        }
        return next
      })
      setCurrentUser((cu) => (cu && cu.id === id ? { ...cu, isAdmin: !cu.isAdmin } : cu))
      toast("権限を更新しました")
    },
    [toast],
  )
  const removeMember = useCallback(
    (id: string) => {
      setMembers((prev) => prev.filter((m) => m.id !== id))
      setCurrentUser((cu) => (cu && cu.id === id ? null : cu))
      void deleteFromSupabase("members", id)
      toast("アカウントを削除しました", "danger")
    },
    [toast],
  )
  const resolveAbsence = useCallback(
    (id: string) => {
      setAbsences((prev) => prev.filter((x) => x.id !== id))
      void deleteFromSupabase("absence_reports", id)
      toast("確認済みにしました")
    },
    [toast],
  )
  const resolveSupply = useCallback(
    (id: string) => {
      setSupplies((prev) => prev.filter((x) => x.id !== id))
      toast("対応済みにしました")
    },
    [toast],
  )
  const resolveLostReport = useCallback(
    (id: string) => {
      setLostReports((prev) => prev.filter((x) => x.id !== id))
      void deleteFromSupabase("lost_reports", id)
      toast("解決済みにしました")
    },
    [toast],
  )

  const value = useMemo<Store>(
    () => ({
      currentUser,
      members,
      events,
      practice,
      announcements,
      lostItems,
      sheets,
      diary,
      absences,
      supplies,
      lostReports,
      toasts,
      parts: PARTS,
      register,
      login,
      logout,
      enterAdminMode,
      exitAdminMode,
      toast,
      submitAbsence,
      submitSupply,
      submitLostReport,
      addEvent,
      removeEvent,
      addPractice,
      removePractice,
      addAnnouncement,
      removeAnnouncement,
      addSheet,
      removeSheet,
      addDiary,
      removeDiary,
      toggleAdmin,
      removeMember,
      resolveAbsence,
      resolveSupply,
      resolveLostReport,
    }),
    [
      currentUser,
      members,
      events,
      practice,
      announcements,
      lostItems,
      sheets,
      diary,
      absences,
      supplies,
      lostReports,
      toasts,
      register,
      login,
      logout,
      toast,
      submitAbsence,
      submitSupply,
      submitLostReport,
      addEvent,
      removeEvent,
      addPractice,
      removePractice,
      addAnnouncement,
      removeAnnouncement,
      addSheet,
      removeSheet,
      addDiary,
      removeDiary,
      toggleAdmin,
      removeMember,
      resolveAbsence,
      resolveSupply,
      resolveLostReport,
    ],
  )

  return <JazzContext.Provider value={value}>{children}</JazzContext.Provider>
}

export function useJazz() {
  const ctx = useContext(JazzContext)
  if (!ctx) {
    return {
      currentUser: null,
      members: [],
      events: [],
      practice: [],
      announcements: [],
      lostItems: [],
      sheets: [],
      diary: [],
      absences: [],
      supplies: [],
      lostReports: [],
      toasts: [],
      parts: PARTS,
      register: () => {},
      login: () => {},
      logout: () => {},
      enterAdminMode: () => false,
      exitAdminMode: () => {},
      toast: () => {},
      submitAbsence: () => {},
      submitSupply: () => {},
      submitLostReport: () => {},
      addEvent: () => {},
      removeEvent: () => {},
      addPractice: () => {},
      removePractice: () => {},
      addAnnouncement: () => {},
      removeAnnouncement: () => {},
      addSheet: () => {},
      removeSheet: () => {},
      addDiary: () => {},
      removeDiary: () => {},
      toggleAdmin: () => {},
      removeMember: () => {},
      resolveAbsence: () => {},
      resolveSupply: () => {},
      resolveLostReport: () => {},
    } as Store
  }
  return ctx
}

/* ------------------------------- utilities -------------------------------- */

export function formatJPDate(isoDate: string) {
  if (!isoDate) return ""

  const d = new Date(`${isoDate}T00:00:00+09:00`)
  if (Number.isNaN(d.getTime())) return isoDate

  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).formatToParts(d)

  const month = parts.find((part) => part.type === "month")?.value ?? ""
  const day = parts.find((part) => part.type === "day")?.value ?? ""
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? ""

  return `${month}月${day}日 (${weekday})`
}

export function nextEvent(events: ClubEvent[]) {
  const today = iso(new Date())
  return [...events]
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0]
}
