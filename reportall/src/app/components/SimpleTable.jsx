// components/SimpleTable.jsx
import React from "react";

export default function SimpleTable({ columns, data }) {
  return (
    <div className="overflow-x-auto rounded-lg shadow-md mt-6 bg-white">
      <table className="min-w-full border-collapse">
        <thead className="bg-blue-600 text-white">
          <tr>
            {columns.map((col, index) => (
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
                colSpan={columns.length}
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
                {columns.map((col, cIndex) => (
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
