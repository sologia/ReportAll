'use client'

export default function SectionCard({ children, className = '' }) {
  return (
    <section className={`rounded-lg shadow-md bg-white p-4 sm:p-6 ${className}`}>
      {children}
    </section>
  )
}