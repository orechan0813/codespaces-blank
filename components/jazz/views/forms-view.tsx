"use client"

import { useEffect, useRef, useState } from "react"
import { CalendarOff, ImagePlus, PackageSearch, ShoppingCart, Wrench, X } from "lucide-react"
import { ABSENCE_REASONS, uploadLostReportImage, useJazz } from "@/lib/jazz-store"
import { Panel, SectionHeading, fieldClass, labelClass } from "@/components/jazz/primitives"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Tab = "absence" | "supply" | "lost"

export function FormsView() {
  const [tab, setTab] = useState<Tab>("absence")

  const tabs: { key: Tab; label: string; icon: typeof CalendarOff }[] = [
    { key: "absence", label: "欠席連絡", icon: CalendarOff },
    { key: "supply", label: "購入・修理希望", icon: Wrench },
    { key: "lost", label: "紛失物連絡", icon: PackageSearch },
  ]

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Forms" title="各種フォーム" />

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
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

      {tab === "absence" && <AbsenceForm />}
      {tab === "supply" && <SupplyForm />}
      {tab === "lost" && <LostForm />}
    </div>
  )
}

function AbsenceForm() {
  const { currentUser, submitAbsence } = useJazz()
  const [date, setDate] = useState("")
  const [reason, setReason] = useState<string>(ABSENCE_REASONS[0])
  const [note, setNote] = useState("")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!date) return
    submitAbsence({ memberName: currentUser?.name ?? "", date, reason, note: note.trim() })
    setDate("")
    setNote("")
    setReason(ABSENCE_REASONS[0])
  }

  return (
    <Panel>
      <p className="mb-4 text-sm text-muted-foreground">
        <span className="text-foreground">{currentUser?.name}</span> さんとして送信します。
        アカウント情報を保持しているため、理由は選択式です。
      </p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="abs-date">
            欠席・遅刻する日
          </label>
          <input id="abs-date" type="date" className={fieldClass} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>理由</label>
          <div className="grid grid-cols-2 gap-2">
            {ABSENCE_REASONS.map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setReason(r)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                  reason === r
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        {reason === "その他（備考に記入）" && (
          <div>
            <label className={labelClass} htmlFor="abs-note">
              詳細（記述式）
            </label>
            <textarea
              id="abs-note"
              className={cn(fieldClass, "min-h-24 resize-none")}
              placeholder="理由を記入してください"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        )}
        {reason !== "その他（備考に記入）" && (
          <div>
            <label className={labelClass} htmlFor="abs-note2">
              補足（任意）
            </label>
            <input id="abs-note2" className={fieldClass} placeholder="遅刻時刻など" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={!date}>
          欠席連絡を送信
        </Button>
      </form>
    </Panel>
  )
}

function SupplyForm() {
  const { currentUser, submitSupply } = useJazz()
  const [kind, setKind] = useState<"purchase" | "repair">("purchase")
  const [item, setItem] = useState("")
  const [reason, setReason] = useState("")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!item.trim()) return
    submitSupply({ memberName: currentUser?.name ?? "", kind, item: item.trim(), reason: reason.trim() })
    setItem("")
    setReason("")
  }

  return (
    <Panel>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelClass}>種類</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { k: "purchase" as const, label: "購入希望", icon: ShoppingCart },
              { k: "repair" as const, label: "修理希望", icon: Wrench },
            ].map(({ k, label, icon: Icon }) => (
              <button
                type="button"
                key={k}
                onClick={() => setKind(k)}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                  kind === k
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="sup-item">
            品目・楽器名
          </label>
          <input id="sup-item" className={fieldClass} placeholder="例：トランペット用ミュート" value={item} onChange={(e) => setItem(e.target.value)} />
        </div>
        <div>
          <label className={labelClass} htmlFor="sup-reason">
            理由・状況
          </label>
          <textarea
            id="sup-reason"
            className={cn(fieldClass, "min-h-24 resize-none")}
            placeholder="必要な理由や破損状況を記入してください"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={!item.trim()}>
          希望を提出
        </Button>
      </form>
    </Panel>
  )
}

function LostForm() {
  const { currentUser, submitLostReport, toast } = useJazz()
  const [description, setDescription] = useState("")
  const [place, setPlace] = useState("")
  const [preview, setPreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview)
  }, [preview])

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!("image/jpeg image/png image/webp image/gif".split(" ").includes(f.type)) || f.size > 5 * 1024 * 1024) {
      toast("JPEG、PNG、WebP、GIF形式の5MB以下の画像を選択してください。", "danger")
      e.currentTarget.value = ""
      return
    }
    setImageFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim() || submitting) return

    setSubmitting(true)
    try {
      const image = imageFile ? await uploadLostReportImage(imageFile) : ""
      submitLostReport({
        memberName: currentUser?.name ?? "",
        description: description.trim(),
        image,
        place: place.trim(),
      })
      setDescription("")
      setPlace("")
      setImageFile(null)
      setPreview(null)
      if (fileRef.current) fileRef.current.value = ""
    } catch (error) {
      toast(error instanceof Error ? error.message : "画像をアップロードできませんでした。", "danger")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Panel>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelClass}>写真（任意）</label>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onFile} />
          {preview ? (
            <div className="relative overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview || "/placeholder.svg"} alt="アップロードした写真のプレビュー" className="max-h-56 w-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setPreview(null)
                  setImageFile(null)
                  if (fileRef.current) fileRef.current.value = ""
                }}
                aria-label="写真を削除"
                className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 text-foreground backdrop-blur hover:bg-background"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background/40 py-10 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <ImagePlus className="size-7" />
              <span className="text-sm">スマホの写真から画像をアップロード</span>
            </button>
          )}
        </div>
        <div>
          <label className={labelClass} htmlFor="lost-desc">
            探しているもの
          </label>
          <input id="lost-desc" className={fieldClass} placeholder="例：青いチューナー" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className={labelClass} htmlFor="lost-place">
            なくした / 見た場所（任意）
          </label>
          <input id="lost-place" className={fieldClass} placeholder="例：音楽室のロッカー付近" value={place} onChange={(e) => setPlace(e.target.value)} />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={!description.trim() || submitting}>
          {submitting ? "画像を送信中…" : "紛失物を連絡"}
        </Button>
      </form>
    </Panel>
  )
}
