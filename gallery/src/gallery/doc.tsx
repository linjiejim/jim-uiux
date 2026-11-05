import * as React from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Page, PageHeader } from "@/registry/jim/ui/page"

export function DocPage({ title, lead, source, children }: { title: string; lead?: string; source?: string; children: React.ReactNode }) {
  return (
    <Page width="wide">
      <PageHeader title={title} />
      {(lead || source) && (
        <div className="-mt-3 mb-8 flex flex-col gap-1">
          {lead && <p className="max-w-2xl text-body text-muted-foreground">{lead}</p>}
          {source && <code className="font-mono text-caption text-faint-foreground">{source}</code>}
        </div>
      )}
      <div className="flex flex-col gap-10">{children}</div>
    </Page>
  )
}

export function Example({
  title,
  note,
  children,
  canvas = "default",
  className,
}: {
  title: string
  note?: React.ReactNode
  children: React.ReactNode
  canvas?: "default" | "sunken" | "none"
  className?: string
}) {
  return (
    <section>
      <h2 className="text-heading font-semibold">{title}</h2>
      {note && <p className="mt-1 max-w-2xl text-body text-muted-foreground">{note}</p>}
      <div
        className={cn(
          "mt-3",
          canvas !== "none" && "rounded-lg border p-6 max-sm:p-4",
          canvas === "sunken" && "bg-sunken",
          className,
        )}
      >
        {children}
      </div>
    </section>
  )
}

export function Row({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-wrap items-center gap-3", className)} {...props} />
}

export function Rules({ dos = [], donts = [] }: { dos?: React.ReactNode[]; donts?: React.ReactNode[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {dos.length > 0 && (
        <ul className="flex flex-col gap-2">
          {dos.map((d, i) => (
            <li key={i} className="flex gap-2 text-body">
              <Check className="mt-0.5 size-4 text-success" />
              <span>{d}</span>
            </li>
          ))}
        </ul>
      )}
      {donts.length > 0 && (
        <ul className="flex flex-col gap-2">
          {donts.map((d, i) => (
            <li key={i} className="flex gap-2 text-body">
              <X className="mt-0.5 size-4 text-destructive" />
              <span>{d}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function Spec({ rows }: { rows: [React.ReactNode, React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[minmax(8rem,auto)_1fr] text-body">
      {rows.map(([k, v], i) => (
        <React.Fragment key={i}>
          <dt className="border-b py-2 pr-6 text-muted-foreground">{k}</dt>
          <dd className="border-b py-2 tabular">{v}</dd>
        </React.Fragment>
      ))}
    </dl>
  )
}
