import type { ReactNode } from 'react'

export function Section({ eyebrow, title, children, hero = false }: { eyebrow: string; title: string; children: ReactNode; hero?: boolean }) {
  return (
    <section className={['rounded-[1.8rem] border border-black/8 p-6 shadow-[0_18px_40px_rgba(49,45,39,0.06)] transition-all duration-300', hero ? 'bg-[linear-gradient(135deg,rgba(255,247,232,0.94),rgba(246,235,216,0.9))]' : 'bg-white/76'].join(' ')}>
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-rust">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-2 text-sm font-medium text-black/72"><span>{label}</span>{children}</label>
}

export function Pill({ children, tone }: { children: ReactNode; tone: 'good' | 'muted' | 'accent' }) {
  const className = tone === 'good' ? 'bg-forest/10 text-forest' : tone === 'accent' ? 'bg-rust/10 text-rust' : 'bg-black/6 text-black/65'
  return <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${className}`}>{children}</span>
}

export function Mini({ title, children }: { title: string; children: ReactNode }) {
  return <article className="border-t border-black/8 pt-4"><strong className="block font-display text-lg">{title}</strong><p className="mt-2 text-sm leading-6 text-black/58">{children}</p></article>
}

export function Stat({ label, value }: { label: string; value: string }) {
  return <article className="rounded-[1.2rem] border border-black/8 bg-white/82 p-4"><span className="block text-xs uppercase tracking-[0.18em] text-black/45">{label}</span><strong className="mt-2 block font-display text-3xl tracking-[-0.03em]">{value}</strong></article>
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-[1.2rem] border border-dashed border-black/10 bg-paper/62 p-5 text-sm leading-6 text-black/58">{children}</div>
}

export function ListBlock({ title, items }: { title: string; items: string[] }) {
  return <div className="mt-4 border-t border-black/8 pt-4"><strong className="block text-xs uppercase tracking-[0.18em] text-black/45">{title}</strong><ul className="mt-2 grid gap-2 text-sm leading-6 text-black/64">{items.map((item, idx) => <li key={`${title}-${idx}`}>- {item}</li>)}</ul></div>
}

export const inputClassName =
  'w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-rust/40 focus:ring-4 focus:ring-rust/8 shadow-sm'

export const areaClassName = `${inputClassName} min-h-24 resize-y`

export const buttonPrimaryClassName = "rounded-2xl bg-forest px-4 py-3 text-sm font-semibold text-paper active:scale-95 transition-transform"
export const buttonSecondaryClassName = "rounded-2xl border border-black/10 bg-paper px-4 py-3 text-sm font-semibold active:scale-95 transition-transform"
export const buttonGhostClassName = "rounded-full border border-black/10 px-4 py-2 text-sm font-semibold active:scale-95 transition-transform"
