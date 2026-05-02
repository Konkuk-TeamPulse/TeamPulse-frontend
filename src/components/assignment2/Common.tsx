import type { ReactNode } from 'react'

export function Section({ eyebrow, title, children, hero = false }: { eyebrow: string; title: string; children: ReactNode; hero?: boolean }) {
  return (
    <section className={['rounded-lg border border-slate-200 p-6 shadow-sm transition-all duration-300', hero ? 'bg-forest text-white' : 'bg-white'].join(' ')}>
      <p className={['text-[0.68rem] font-bold uppercase tracking-[0.12em]', hero ? 'text-white/70' : 'text-slate-500'].join(' ')}>{eyebrow}</p>
      <h2 className="mt-2 text-xl font-bold tracking-tight">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-2 text-sm font-medium text-slate-600"><span>{label}</span>{children}</label>
}

export function Pill({ children, tone }: { children: ReactNode; tone: 'good' | 'muted' | 'accent' }) {
  const className = tone === 'good' ? 'bg-emerald-50 text-emerald-700' : tone === 'accent' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
  return <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${className}`}>{children}</span>
}

export function Mini({ title, children }: { title: string; children: ReactNode }) {
  return <article className="border-t border-slate-200 pt-4"><strong className="block text-sm font-bold">{title}</strong><p className="mt-2 text-sm leading-6 text-slate-500">{children}</p></article>
}

export function Stat({ label, value }: { label: string; value: string }) {
  return <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><span className="block text-xs font-semibold text-slate-500">{label}</span><strong className="mt-2 block text-3xl font-extrabold tracking-tight text-slate-950">{value}</strong></article>
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-500">{children}</div>
}

export function ListBlock({ title, items }: { title: string; items: string[] }) {
  return <div className="mt-4 border-t border-slate-200 pt-4"><strong className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{title}</strong><ul className="mt-2 grid gap-2 text-sm leading-6 text-slate-600">{items.map((item, idx) => <li key={`${title}-${idx}`}>- {item}</li>)}</ul></div>
}

export const inputClassName =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-forest/40 focus:ring-4 focus:ring-forest/10'

export const areaClassName = `${inputClassName} min-h-24 resize-y`

export const buttonPrimaryClassName = "rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#08283e] active:scale-[0.98]"
export const buttonSecondaryClassName = "rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
export const buttonGhostClassName = "rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]"
