'use client'

import { useMemo, useState } from 'react'
import { buildSessionHeaders, getSession, refreshAccessToken } from '@/lib/auth'
import { normalizeRole } from '@/lib/rbac'

const base = process.env.NEXT_PUBLIC_API_URL || ''

export default function SecurityTestsPage() {
  const session = getSession()
  const role = normalizeRole(session?.role)
  const canRun = role === 'administrador' || role === 'director_it'

  const [refreshResult, setRefreshResult] = useState(null)
  const [errorResult, setErrorResult] = useState(null)
  const [loadingRefresh, setLoadingRefresh] = useState(false)
  const [loadingError, setLoadingError] = useState(false)

  const roleLabel = useMemo(() => role || 'sin rol', [role])

  const runRefreshTest = async () => {
    setLoadingRefresh(true)
    const result = await refreshAccessToken()
    setRefreshResult(result)
    setLoadingRefresh(false)
  }

  const runControlledError = async () => {
    setLoadingError(true)

    try {
      const response = await fetch(`${base}/api/system/controlled-error`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...buildSessionHeaders(getSession()),
        },
        body: JSON.stringify({ source: 'ui-security-tests' }),
      })

      const body = await response.json().catch(() => ({}))
      setErrorResult({ ok: response.ok, status: response.status, body })
    } catch (error) {
      setErrorResult({ ok: false, status: 0, body: { message: error?.message || 'network error' } })
    } finally {
      setLoadingError(false)
    }
  }

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      <h1 className='text-2xl font-bold'>Validacion RNF-01 / TP-07</h1>

      <div className='rounded-lg border p-4 bg-white shadow-sm'>
        <p className='text-sm text-gray-600'>
          Usuario actual: <span className='font-semibold'>{roleLabel}</span>
        </p>
        <p className='text-sm text-gray-600'>
          Esta pantalla sirve para tomar capturas del refresh token y del error controlado con requestId.
        </p>
      </div>

      <div className='rounded-lg border p-4 bg-white shadow-sm space-y-3'>
        <h2 className='text-lg font-semibold'>RNF-01: JWT + refresh token</h2>
        <button
          type='button'
          onClick={runRefreshTest}
          disabled={loadingRefresh}
          className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60'
        >
          {loadingRefresh ? 'Probando refresh...' : 'Probar refresh token'}
        </button>

        {refreshResult ? (
          <pre className='text-xs bg-gray-900 text-green-200 p-3 rounded overflow-auto'>
            {JSON.stringify(refreshResult, null, 2)}
          </pre>
        ) : null}
      </div>

      <div className='rounded-lg border p-4 bg-white shadow-sm space-y-3'>
        <h2 className='text-lg font-semibold'>TP-07: Error controlado + log estructurado</h2>

        {!canRun ? (
          <p className='text-sm text-red-700'>
            Tu rol no tiene permiso para disparar el error controlado (requiere administrador o director_it).
          </p>
        ) : null}

        <button
          type='button'
          onClick={runControlledError}
          disabled={loadingError || !canRun}
          className='bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-60'
        >
          {loadingError ? 'Provocando error...' : 'Provocar error controlado TP-07'}
        </button>

        {errorResult ? (
          <pre className='text-xs bg-gray-900 text-orange-200 p-3 rounded overflow-auto'>
            {JSON.stringify(errorResult, null, 2)}
          </pre>
        ) : null}
      </div>
    </div>
  )
}
