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
  if (normalized.includes('alta')) return 'bg-rose-100 text-rose-700 border border-rose-200';
  if (normalized.includes('media')) return 'bg-amber-100 text-amber-800 border border-amber-200';
  if (normalized.includes('baja')) return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
  return 'bg-slate-100 text-slate-700 border border-slate-200';
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
  if (normalized.includes('recibido')) return 'bg-sky-100 text-sky-700 border border-sky-200';
  if (normalized.includes('proceso')) return 'bg-amber-100 text-amber-800 border border-amber-200';
  if (normalized.includes('problema')) return 'bg-rose-100 text-rose-700 border border-rose-200';
  if (normalized.includes('terminado')) return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
  return 'bg-slate-100 text-slate-700 border border-slate-200';
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
    <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-[0_8px_20px_rgba(15,23,42,0.06)] mt-6 bg-white">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-slate-800 text-white">
          <tr>
            {visibleColumns.map((col, index) => (
              <th
                key={index}
                className="py-3 px-4 text-left text-xs sm:text-sm font-semibold whitespace-nowrap"
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
                className="text-center py-8 text-slate-500"
              >
                No hay datos
              </td>
            </tr>
          ) : (
            paginatedRows.map((row, index) => (
              <tr
                key={index}
                className="border-b border-slate-100 hover:bg-sky-50/70 transition"
              >
                {visibleColumns.map((col, cIndex) => (
                  <td
                    key={cIndex}
                    className="py-3 px-4 text-slate-700 align-top"
                  >
                    {isUrgencyColumn(col) ? (
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${getUrgencyClasses(row[col.field])}`}>
                        {row[col.field] || 'Sin urgencia'}
                      </span>
                    ) : isStateColumn(col) ? (
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${getStateClasses(row[col.field])}`}>
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
