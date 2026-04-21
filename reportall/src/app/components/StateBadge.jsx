'use client'

import React from 'react'

function getStateLabel(value) {
  const text = String(value || '').trim()
  return text || 'Sin estado'
}

function getStateClasses(value) {
  const normalized = getStateLabel(value).toLowerCase()
  if (normalized.includes('recibido')) return 'bg-sky-100 text-sky-700'
  if (normalized.includes('proceso')) return 'bg-yellow-100 text-yellow-800'
  if (normalized.includes('problema')) return 'bg-red-100 text-red-700'
  if (normalized.includes('terminado')) return 'bg-green-100 text-green-700'
  return 'bg-gray-100 text-gray-700'
}

export default function StateBadge({ value }) {
  const label = getStateLabel(value)
  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStateClasses(label)}`}>
      {label}
    </span>
  )
}