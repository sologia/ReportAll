import React from 'react'
import { TABLE_PAGE_SIZE_OPTIONS } from '@/hooks/useTablePagination'

export default function TablePaginationControls({
  totalItems,
  startItem,
  endItem,
  currentPage,
  totalPages,
  pageSize,
  onPageSizeChange,
  onPageChange,
}) {
  return (
    <div className='flex flex-col gap-3 border-t bg-white px-4 py-3 text-sm text-gray-700 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex flex-wrap items-center gap-2'>
        <label htmlFor='page-size' className='text-gray-600'>Registros por página:</label>
        <select
          id='page-size'
          value={pageSize}
          onChange={onPageSizeChange}
          className='rounded-md border px-2 py-1'
        >
          {TABLE_PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <span className='text-gray-500'>Mostrando {startItem}-{endItem} de {totalItems}</span>
      </div>

      <div className='flex items-center gap-2'>
        <button
          type='button'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className='rounded-md border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50'
        >
          Anterior
        </button>
        <span className='text-gray-600'>Hoja {currentPage} de {totalPages}</span>
        <button
          type='button'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className='rounded-md border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50'
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
