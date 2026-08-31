'use client'

export default function PageHeaderCard({ title, description, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 mb-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)] ${className}`}>
      <h2 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">{title}</h2>
      {description ? <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">{description}</p> : null}
    </div>
  )
}