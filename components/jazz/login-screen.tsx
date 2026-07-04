"use client"

import { useEffect, useState } from "react"
import { Disc3, LogIn, Music4, UserPlus } from "lucide-react"
import { useJazz, type Grade } from "@/lib/jazz-store"
import { Button } from "@/components/ui/button"
import { fieldClass, labelClass } from "@/components/jazz/primitives"
import { cn } from "@/lib/utils"
import { getSupabaseSchemaState, getSupabaseStatusMessage } from "@/lib/supabase-safe"

const GRADES: Grade[] = ["1年", "2年", "3年"]

export function LoginScreen() {
  const { members, parts, register, login } = useJazz()
  const [mode, setMode] = useState<"register" | "existing">("register")
  const [statusMessage, setStatusMessage] = useState(getSupabaseStatusMessage())

  const [name, setName] = useState("")
  const [grade, setGrade] = useState<Grade>("1年")
  const [part1, setPart1] = useState(parts[0])
  const [part2, setPart2] = useState("")

  const [selected, setSelected] = useState(members[0]?.id ?? "")

  useEffect(() => {
    let active = true

    const refreshStatus = async () => {
      const state = await getSupabaseSchemaState()
      if (active) setStatusMessage(state.message)
    }

    void refreshStatus()

    return () => {
      active = false
    }
  }, [])

  function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    register({ name: name.trim(), grade, part1, part2 })
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      {/* ambient gold glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 size-[24rem] rounded-full bg-primary/5 blur-[100px]" />

      <div className="relative grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        {/* brand side */}
        <div className="text-center lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
            <Disc3 className="size-3.5" />
            千葉県立船橋高校 ジャズバンド部
          </div>
          <h1 className="font-serif text-6xl font-bold leading-none tracking-tight text-primary gold-glow sm:text-7xl">
            JAZZ HUB
          </h1>
          <p className="mx-auto mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground lg:mx-0">
            予定・楽譜・音源・連絡・記録。部活のすべてを、ひとつの洗練された場所へ。
            まずはあなたのアカウントを登録して、はじめましょう。
          </p>
          <div className="mt-8 hidden items-center gap-6 text-sm text-muted-foreground lg:flex">
            <span className="inline-flex items-center gap-2">
              <Music4 className="size-4 text-primary" /> 楽譜ライブラリ
            </span>
            <span className="inline-flex items-center gap-2">
              <Disc3 className="size-4 text-primary" /> 音源プレイヤー
            </span>
          </div>
        </div>

        {/* auth card */}
        <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
            {statusMessage}
          </div>

          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-border bg-background/60 p-1">
            <button
              onClick={() => setMode("register")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                mode === "register"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <UserPlus className="size-4" /> 新規登録
            </button>
            <button
              onClick={() => setMode("existing")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                mode === "existing"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LogIn className="size-4" /> 部員でログイン
            </button>
          </div>

          {mode === "register" ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="name">
                  名前
                </label>
                <input
                  id="name"
                  className={fieldClass}
                  placeholder="例：山田 太郎"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div>
                <label className={labelClass}>学年</label>
                <div className="grid grid-cols-3 gap-2">
                  {GRADES.map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() => setGrade(g)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                        grade === g
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border bg-background/60 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} htmlFor="part1">
                    パート1
                  </label>
                  <select
                    id="part1"
                    className={fieldClass}
                    value={part1}
                    onChange={(e) => setPart1(e.target.value)}
                  >
                    {parts.map((p) => (
                      <option key={p} value={p} className="bg-card">
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass} htmlFor="part2">
                    パート2（任意）
                  </label>
                  <select
                    id="part2"
                    className={fieldClass}
                    value={part2}
                    onChange={(e) => setPart2(e.target.value)}
                  >
                    <option value="" className="bg-card">
                      なし
                    </option>
                    {parts.map((p) => (
                      <option key={p} value={p} className="bg-card">
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button type="submit" size="lg" className="mt-2 w-full">
                <UserPlus className="size-4" /> 登録してはじめる
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="member">
                  アカウントを選択
                </label>
                <select
                  id="member"
                  className={fieldClass}
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id} className="bg-card">
                      {m.name}（{m.grade} / {m.part1}）{m.isAdmin ? " ★管理者" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                アカウント情報を保持しているため、ログイン後は欠席連絡やマイページの操作がスムーズに行えます。
              </p>
              <Button
                size="lg"
                className="w-full"
                onClick={() => selected && login(selected)}
                disabled={!selected}
              >
                <LogIn className="size-4" /> ログイン
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
