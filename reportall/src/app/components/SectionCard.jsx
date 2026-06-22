'use client'

export default function SectionCard({ children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)] ${className}`}>
      {children}
    </section>
  )
}