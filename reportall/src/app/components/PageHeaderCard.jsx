'use client'

export default function PageHeaderCard({ title, description, className = '' }) {
  return (
    <div className={`rounded-lg shadow-md bg-white p-4 sm:p-6 mb-6 ${className}`}>
      <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">{title}</h2>
      {description ? <p className="text-sm text-slate-600 mt-1">{description}</p> : null}
    </div>
  )
}