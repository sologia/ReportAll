'use client'

import React from 'react'

function getStateLabel(value) {
  const text = String(value || '').trim()
  return text || 'Sin estado'
}

function getStateClasses(value) {
  const normalized = getStateLabel(value).toLowerCase()
  if (normalized.includes('recibido')) return 'bg-sky-100 text-sky-700 border border-sky-200'
  if (normalized.includes('proceso')) return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
  if (normalized.includes('problema')) return 'bg-rose-100 text-rose-700 border border-rose-200'
  if (normalized.includes('terminado')) return 'bg-green-100 text-green-700 border border-green-200'
  return 'bg-gray-100 text-gray-700 border border-gray-200'
}

export default function StateBadge({ value }) {
  const label = getStateLabel(value)
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${getStateClasses(label)}`}>
      {label}
    </span>
  )
}