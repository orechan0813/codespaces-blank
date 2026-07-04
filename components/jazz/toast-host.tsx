"use client"

import { Check, TriangleAlert } from "lucide-react"
import { useJazz } from "@/lib/jazz-store"
import { cn } from "@/lib/utils"

export function ToastHost() {
  const { toasts } = useJazz()

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          style={{ animation: "toast-in 180ms ease-out" }}
          className={cn(
            "pointer-events-auto flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur",
            t.tone === "danger"
              ? "border-destructive/40 bg-destructive/15 text-destructive"
              : "border-primary/40 bg-primary/15 text-primary",
          )}
        >
          {t.tone === "danger" ? (
            <TriangleAlert className="size-4" />
          ) : (
            <Check className="size-4" />
          )}
          {t.message}
        </div>
      ))}
    </div>
  )
}
