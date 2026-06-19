import { useEffect, useMemo, useState } from 'react'

export const TABLE_PAGE_SIZE_OPTIONS = [10, 20, 30, 50]

export const useTablePagination = (rows = [], initialPageSize = 10) => {
  const safeRows = Array.isArray(rows) ? rows : []
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [currentPage, setCurrentPage] = useState(1)

  const totalItems = safeRows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  useEffect(() => {
    setCurrentPage(1)
  }, [pageSize, totalItems])

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return safeRows.slice(startIndex, startIndex + pageSize)
  }, [safeRows, currentPage, pageSize])

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = totalItems === 0 ? 0 : Math.min(currentPage * pageSize, totalItems)

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(1, page), totalPages)
    setCurrentPage(nextPage)
  }

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value) || initialPageSize)
  }

  return {
    pageSize,
    currentPage,
    totalItems,
    totalPages,
    startItem,
    endItem,
    paginatedRows,
    setCurrentPage: goToPage,
    setPageSize,
    handlePageSizeChange,
  }
}
