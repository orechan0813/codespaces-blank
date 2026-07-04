import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export const fieldClass =
  "w-full rounded-lg border border-border bg-background/60 px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/70 focus:ring-2 focus:ring-primary/20"

export const labelClass = "mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground"

export function Panel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card/70 p-5 shadow-[0_1px_0_0_oklch(0.769_0.153_70_/_0.08)_inset] backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string
  title: string
  action?: ReactNode
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-[0.7rem] font-medium uppercase tracking-[0.25em] text-primary/80">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-serif text-2xl font-semibold text-foreground text-balance">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[0.7rem] font-medium text-primary",
        className,
      )}
    >
      {children}
    </span>
  )
}
