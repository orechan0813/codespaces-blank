"use client"

import { useState } from "react"
import {
  CalendarDays,
  Disc3,
  Home,
  LibraryBig,
  LogOut,
  Menu,
  NotebookPen,
  Send,
  ShieldCheck,
  X,
} from "lucide-react"
import { useJazz } from "@/lib/jazz-store"
import { cn } from "@/lib/utils"
import { HomeView } from "@/components/jazz/views/home-view"
import { CalendarView } from "@/components/jazz/views/calendar-view"
import { LibraryView } from "@/components/jazz/views/library-view"
import { FormsView } from "@/components/jazz/views/forms-view"
import { DiaryView } from "@/components/jazz/views/diary-view"
import { AdminView } from "@/components/jazz/views/admin-view"

type NavKey = "home" | "calendar" | "library" | "forms" | "diary" | "admin"

const NAV: { key: NavKey; label: string; icon: typeof Home; adminOnly?: boolean }[] = [
  { key: "home", label: "ホーム", icon: Home },
  { key: "calendar", label: "カレンダー", icon: CalendarDays },
  { key: "library", label: "楽譜・音源", icon: LibraryBig },
  { key: "forms", label: "各種フォーム", icon: Send },
  { key: "diary", label: "顧問の日記", icon: NotebookPen },
  { key: "admin", label: "管理者", icon: ShieldCheck, adminOnly: true },
]

export function AppShell() {
  const { currentUser, logout } = useJazz()
  const [view, setView] = useState<NavKey>("home")
  const [drawer, setDrawer] = useState(false)

  if (!currentUser) return null

  const visibleNav = NAV.filter((n) => !n.adminOnly || currentUser.isAdmin)

  function go(key: NavKey) {
    setView(key)
    setDrawer(false)
  }

  const initials = currentUser.name.replace(/\s/g, "").slice(0, 2)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar/80 backdrop-blur lg:flex">
        <SidebarContent nav={visibleNav} view={view} go={go} />
        <UserFooter name={currentUser.name} sub={`${currentUser.grade} / ${currentUser.part1}`} initials={initials} isAdmin={currentUser.isAdmin} onLogout={logout} />
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[80%] flex-col border-r border-border bg-sidebar">
            <div className="flex items-center justify-between px-5 pt-5">
              <Brand />
              <button
                onClick={() => setDrawer(false)}
                aria-label="メニューを閉じる"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <SidebarContent nav={visibleNav} view={view} go={go} hideBrand />
            <UserFooter name={currentUser.name} sub={`${currentUser.grade} / ${currentUser.part1}`} initials={initials} isAdmin={currentUser.isAdmin} onLogout={logout} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
          <button
            onClick={() => setDrawer(true)}
            aria-label="メニューを開く"
            className="rounded-lg p-1.5 text-foreground hover:bg-muted"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-serif text-lg font-semibold text-primary">JAZZ HUB</span>
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
            {initials}
          </div>
        </header>

        <main className="app-scroll mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {view === "home" && <HomeView onNavigate={go} />}
          {view === "calendar" && <CalendarView />}
          {view === "library" && <LibraryView />}
          {view === "forms" && <FormsView />}
          {view === "diary" && <DiaryView />}
          {view === "admin" && currentUser.isAdmin && <AdminView />}
        </main>
      </div>
    </div>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Disc3 className="size-5" />
      </div>
      <div className="leading-tight">
        <p className="font-serif text-lg font-bold text-primary">JAZZ HUB</p>
        <p className="text-[0.65rem] tracking-wide text-muted-foreground">県立船橋 ジャズバンド部</p>
      </div>
    </div>
  )
}

function SidebarContent({
  nav,
  view,
  go,
  hideBrand,
}: {
  nav: { key: NavKey; label: string; icon: typeof Home }[]
  view: NavKey
  go: (k: NavKey) => void
  hideBrand?: boolean
}) {
  return (
    <>
      {!hideBrand && (
        <div className="px-5 pb-2 pt-6">
          <Brand />
        </div>
      )}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => {
          const active = view === item.key
          const Icon = item.icon
          return (
            <button
              key={item.key}
              onClick={() => go(item.key)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                item.key === "admin" && !active && "text-primary/70",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
              {active && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
            </button>
          )
        })}
      </nav>
    </>
  )
}

function UserFooter({
  name,
  sub,
  initials,
  isAdmin,
  onLogout,
}: {
  name: string
  sub: string
  initials: string
  isAdmin: boolean
  onLogout: () => void
}) {
  return (
    <div className="border-t border-border p-3">
      <div className="flex items-center gap-3 rounded-xl px-2 py-2">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
          {initials}
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium text-foreground">
            {name}
            {isAdmin ? <span className="ml-1 text-[0.65rem] text-primary">★管理者</span> : null}
          </p>
          <p className="truncate text-xs text-muted-foreground">{sub}</p>
        </div>
        <button
          onClick={onLogout}
          aria-label="ログアウト"
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  )
}
