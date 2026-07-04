"use client"

import { PenLine } from "lucide-react"
import { useJazz, formatJPDate } from "@/lib/jazz-store"
import { Panel, SectionHeading } from "@/components/jazz/primitives"

export function DiaryView() {
  const { diary } = useJazz()

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Advisor's Diary" title="顧問の先生の日記" />
      <p className="-mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        顧問の先生から届く、日々のメッセージとフィードバック。演奏へのヒントや部員へのひとことを、タイムラインで振り返れます。
      </p>

      <div className="relative space-y-6 pl-6">
        <span className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-border" />
        {diary.map((d) => (
          <div key={d.id} className="relative">
            <span className="absolute -left-6 top-2 flex size-3.5 items-center justify-center rounded-full bg-primary ring-4 ring-background">
              <span className="size-1.5 rounded-full bg-primary-foreground" />
            </span>
            <Panel>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 text-sm text-primary">
                  <PenLine className="size-4" />
                  {d.author}
                </div>
                <span className="text-xs text-muted-foreground">{formatJPDate(d.date)}</span>
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground">{d.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{d.body}</p>
            </Panel>
          </div>
        ))}
      </div>
    </div>
  )
}
