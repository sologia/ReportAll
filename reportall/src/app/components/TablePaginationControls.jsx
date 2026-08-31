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
    <div className='flex flex-col gap-3 border-t border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-700 md:flex-row md:items-center md:justify-between'>
      <div className='flex flex-wrap items-center gap-2'>
        <label htmlFor='page-size' className='text-slate-600 font-medium'>Registros por pagina:</label>
        <select
          id='page-size'
          value={pageSize}
          onChange={onPageSizeChange}
          className='rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700'
        >
          {TABLE_PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <span className='text-slate-500'>Mostrando {startItem}-{endItem} de {totalItems}</span>
      </div>

      <div className='flex items-center gap-2 justify-start md:justify-end'>
        <button
          type='button'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className='rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-45'
        >
          Anterior
        </button>
        <span className='text-slate-600 min-w-28 text-center'>Pagina {currentPage} de {totalPages}</span>
        <button
          type='button'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className='rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-45'
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
