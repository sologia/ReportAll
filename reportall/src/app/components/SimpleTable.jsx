// components/SimpleTable.jsx
"use client";

import React from "react";
import { getSession } from "@/lib/auth";
import { canViewIds } from "@/lib/rbac";
import { useTablePagination } from "@/hooks/useTablePagination";
import TablePaginationControls from "@/app/components/TablePaginationControls";

function isIdColumn(column) {
  const field = String(column?.field || '').toLowerCase();
  const header = String(column?.header || '').toLowerCase();
  return field.includes('id') || header.includes('id');
}

function getUrgencyClasses(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized.includes('alta')) return 'bg-red-100 text-red-700';
  if (normalized.includes('media')) return 'bg-yellow-100 text-yellow-800';
  if (normalized.includes('baja')) return 'bg-green-100 text-green-700';
  return 'bg-gray-100 text-gray-700';
}

function isUrgencyColumn(column) {
  const field = String(column?.field || '').toLowerCase();
  const header = String(column?.header || '').toLowerCase();
  return field === 'urgency' || header.includes('urgencia');
}

function isStateColumn(column) {
  const field = String(column?.field || '').toLowerCase();
  const header = String(column?.header || '').toLowerCase();
  return field.includes('state') || field.includes('availability') || header.includes('estado');
}

function getStateLabel(value) {
  const text = String(value || '').trim();
  return text || 'Sin estado';
}

function getStateClasses(value) {
  const normalized = getStateLabel(value).toLowerCase();
  if (normalized.includes('recibido')) return 'bg-sky-100 text-sky-700';
  if (normalized.includes('proceso')) return 'bg-yellow-100 text-yellow-800';
  if (normalized.includes('problema')) return 'bg-red-100 text-red-700';
  if (normalized.includes('terminado')) return 'bg-green-100 text-green-700';
  return 'bg-gray-100 text-gray-700';
}

export default function SimpleTable({ columns, data }) {
  const role = getSession()?.role;
  const showIds = canViewIds(role);
  const visibleColumns = (showIds ? columns : columns.filter((column) => !isIdColumn(column)))
    .filter((column) => !(String(role || '').toLowerCase() === 'cliente' && isUrgencyColumn(column)));
  const {
    paginatedRows,
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    startItem,
    endItem,
    handlePageSizeChange,
    setCurrentPage,
  } = useTablePagination(data);

  return (
    <div className="overflow-x-auto rounded-lg shadow-md mt-6 bg-white">
      <table className="min-w-full border-collapse">
        <thead className="bg-blue-600 text-white">
          <tr>
            {visibleColumns.map((col, index) => (
              <th
                key={index}
                className="py-3 px-4 text-left text-sm font-medium"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={visibleColumns.length}
                className="text-center py-4 text-gray-500"
              >
                No hay datos
              </td>
            </tr>
          ) : (
            paginatedRows.map((row, index) => (
              <tr
                key={index}
                className="border-b hover:bg-blue-50 transition"
              >
                {visibleColumns.map((col, cIndex) => (
                  <td
                    key={cIndex}
                    className="py-3 px-4 text-sm text-gray-700"
                  >
                    {isUrgencyColumn(col) ? (
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getUrgencyClasses(row[col.field])}`}>
                        {row[col.field] || 'Sin urgencia'}
                      </span>
                    ) : isStateColumn(col) ? (
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStateClasses(row[col.field])}`}>
                        {getStateLabel(row[col.field])}
                      </span>
                    ) : (
                      row[col.field]
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <TablePaginationControls
        totalItems={totalItems}
        startItem={startItem}
        endItem={endItem}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
