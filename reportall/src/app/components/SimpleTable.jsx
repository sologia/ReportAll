// components/SimpleTable.jsx
"use client";

import React from "react";
import { getSession } from "@/lib/auth";
import { canViewIds } from "@/lib/rbac";

function isIdColumn(column) {
  const field = String(column?.field || '').toLowerCase();
  const header = String(column?.header || '').toLowerCase();
  return field.includes('id') || header.includes('id');
}

export default function SimpleTable({ columns, data }) {
  const role = getSession()?.role;
  const showIds = canViewIds(role);
  const visibleColumns = showIds ? columns : columns.filter((column) => !isIdColumn(column));

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
            data.map((row, index) => (
              <tr
                key={index}
                className="border-b hover:bg-blue-50 transition"
              >
                {visibleColumns.map((col, cIndex) => (
                  <td
                    key={cIndex}
                    className="py-3 px-4 text-sm text-gray-700"
                  >
                    {row[col.field]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
